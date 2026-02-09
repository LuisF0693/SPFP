// AIOS Virtual Office - Main Component
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualOfficeStore, CAMERA_CONFIG, type TaskPriority, type ResolvedTheme, getThemeByTime } from '../store/virtualOfficeStore';
import { useUserAvatarStore } from '../store/userAvatarStore';
import { DepartmentArea } from './DepartmentArea';
import { ActivityFeed } from './ActivityFeed';
import { AgentPanel } from './AgentPanel';
import { MiniMap } from './MiniMap';
import { ThemeToggle } from './ThemeToggle';
import { DepartmentMetrics } from './DepartmentMetrics';
import { UserAvatarOffice } from './UserAvatarOffice';
import { SoundControls } from './SoundControls';
import { AvatarCustomizer } from './AvatarCustomizer';
import { UserAvatar } from './UserAvatar';
import { useSound } from '../hooks/useSound';
import { getAgentsByDepartment, AGENTS } from '../data/agents';
import { useAIOSBridge } from '../bridge';
import type { AIOSInboundEvent } from '../bridge/EventTypes';
import type { Department, AgentId, AgentStatus } from '../types';

export function VirtualOffice() {
  const {
    agents,
    selectedAgentId,
    isPanelOpen,
    activities,
    mockMode,
    isConnected,
    camera,
    themeMode,
    getResolvedTheme,
    selectAgent,
    setAgentStatus,
    addActivity,
    setMockMode,
    setConnected,
    panCamera,
    zoomCamera,
    centerOnAgent,
    resetCamera,
    assignTask,
    soundSettings,
    toggleSound,
    setSoundVolume,
    toggleAmbient,
    openCustomizer
  } = useVirtualOfficeStore();

  // User avatar store
  const { moveToPosition, moveToAgent, isMoving: isUserMoving } = useUserAvatarStore();

  // Sound hook
  const { playSuccess, playNotification } = useSound({
    volume: soundSettings.volume,
    enabled: soundSettings.enabled
  });

  // Refs for pan/zoom
  const officeContainerRef = useRef<HTMLDivElement>(null);
  const officeGridRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const clickStartPos = useRef({ x: 0, y: 0 });

  // Container dimensions for minimap viewport calculation
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Theme state - resolved theme for rendering
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getResolvedTheme());

  // Update resolved theme when mode changes or on interval (for auto mode)
  useEffect(() => {
    setResolvedTheme(getResolvedTheme());

    // If in auto mode, check every minute for time changes
    if (themeMode === 'auto') {
      const interval = setInterval(() => {
        setResolvedTheme(getThemeByTime());
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [themeMode, getResolvedTheme]);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (officeContainerRef.current) {
        const rect = officeContainerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag on left mouse button and not on interactive elements
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-agent]') || target.closest('[data-user-avatar]')) return;

    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    clickStartPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    panCamera(deltaX, deltaY);

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [panCamera]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const wasDragging = isDragging.current;
    isDragging.current = false;
    e.currentTarget.style.cursor = 'grab';

    // Check if this was a click (not a drag) - move user avatar to clicked position
    const target = e.target as HTMLElement;
    const deltaX = Math.abs(e.clientX - clickStartPos.current.x);
    const deltaY = Math.abs(e.clientY - clickStartPos.current.y);
    const isClick = deltaX < 5 && deltaY < 5;

    // Only move if it was a click on empty area (not on agent or button)
    if (isClick && !target.closest('[data-agent]') && !target.closest('button') && !target.closest('[data-user-avatar]')) {
      // Calculate click position relative to the office grid
      if (officeGridRef.current) {
        const gridRect = officeGridRef.current.getBoundingClientRect();
        const clickX = (e.clientX - gridRect.left) / camera.zoom;
        const clickY = (e.clientY - gridRect.top) / camera.zoom;

        // Move user avatar to the clicked position
        moveToPosition({ x: clickX, y: clickY });
      }
    }
  }, [camera.zoom, moveToPosition]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    isDragging.current = false;
    e.currentTarget.style.cursor = 'grab';
  }, []);

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    // Normalize wheel delta across browsers
    const delta = -Math.sign(e.deltaY);

    // Get mouse position relative to the office container for zoom center
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = e.clientX - rect.left - rect.width / 2;
    const centerY = e.clientY - rect.top - rect.height / 2;

    zoomCamera(delta, centerX, centerY);
  }, [zoomCamera]);

  // Double-click to center on agent
  const handleDoubleClick = useCallback((agentId: AgentId) => {
    centerOnAgent(agentId);
  }, [centerOnAgent]);

  // Handle AIOS Bridge events
  const handleBridgeEvent = useCallback((event: AIOSInboundEvent) => {
    switch (event.type) {
      case 'agent_state':
        setAgentStatus(event.agentId, event.status!, event.activity);
        break;

      case 'tool_start':
        setAgentStatus(event.agentId, 'working', event.description);
        addActivity({
          timestamp: event.timestamp,
          agentId: event.agentId,
          type: 'tool_start',
          description: event.description || `Started ${event.toolName}`,
          tool: event.toolName
        });
        break;

      case 'tool_complete':
        addActivity({
          timestamp: event.timestamp,
          agentId: event.agentId,
          type: 'tool_complete',
          description: event.summary || `Completed ${event.toolName}`,
          tool: event.toolName,
          success: event.success
        });
        // Don't change status to idle here - wait for agent_stop
        break;

      case 'agent_stop':
        setAgentStatus(event.agentId, 'idle');
        addActivity({
          timestamp: event.timestamp,
          agentId: event.agentId,
          type: 'status_change',
          description: event.summary || 'Task completed'
        });
        break;
    }
  }, [setAgentStatus, addActivity]);

  // AIOS Bridge connection (only when not in mock mode)
  const { isConnected: bridgeConnected, assignTask: bridgeAssignTask } = useAIOSBridge({
    pollInterval: 500,
    onEvent: mockMode ? () => {} : handleBridgeEvent,
    onConnectionChange: (connected) => {
      if (!mockMode) {
        setConnected(connected);
      }
    }
  });

  // Update connection status from bridge
  useEffect(() => {
    if (!mockMode) {
      setConnected(bridgeConnected);
    }
  }, [bridgeConnected, mockMode, setConnected]);

  // Mock mode simulation
  useEffect(() => {
    if (!mockMode) return;

    const agentIds = Object.keys(agents) as AgentId[];
    const statuses: AgentStatus[] = ['idle', 'working', 'thinking', 'waiting'];
    const tools = ['Read', 'Write', 'Bash', 'Grep', 'Edit', 'Task'];
    const descriptions = [
      'Reading file contents...',
      'Writing code changes...',
      'Running tests...',
      'Searching codebase...',
      'Analyzing requirements...',
      'Creating documentation...',
      'Reviewing code...',
      'Fixing bug...',
      'Implementing feature...',
      'Refactoring module...'
    ];

    // Random status updates
    const statusInterval = setInterval(() => {
      const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

      setAgentStatus(randomAgent, randomStatus, randomStatus !== 'idle' ? randomDescription : undefined);
    }, 3000);

    // Random activities
    const activityInterval = setInterval(() => {
      const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
      const randomTool = tools[Math.floor(Math.random() * tools.length)];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];

      addActivity({
        timestamp: Date.now(),
        agentId: randomAgent,
        type: Math.random() > 0.3 ? 'tool_complete' : 'tool_start',
        description: randomDescription,
        tool: randomTool,
        success: Math.random() > 0.1
      });
    }, 5000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(activityInterval);
    };
  }, [mockMode, agents, setAgentStatus, addActivity]);

  const handleAgentClick = useCallback((agentId: string, isDoubleClick = false) => {
    if (isDoubleClick) {
      // Double-click: move user avatar to agent and open panel
      const agent = agents[agentId as AgentId];
      if (agent) {
        moveToAgent(agent.position);
      }
      handleDoubleClick(agentId as AgentId);
    } else {
      selectAgent(agentId as AgentId);
    }
  }, [selectAgent, handleDoubleClick, agents, moveToAgent]);

  const handleActivityClick = useCallback((agentId: AgentId) => {
    selectAgent(agentId);
  }, [selectAgent]);

  const handleClosePanel = useCallback(() => {
    selectAgent(null);
  }, [selectAgent]);

  const handleAssignTask = useCallback(async (
    agentId: string,
    taskDescription: string,
    priority: TaskPriority
  ): Promise<boolean> => {
    try {
      // Try to send via bridge first (for real Claude Code connection)
      const bridgeResult = await bridgeAssignTask(agentId as AgentId, taskDescription, priority);

      if (bridgeResult.success) {
        // Update local store to reflect the task assignment
        assignTask(agentId as AgentId, taskDescription, priority);
        return true;
      } else {
        console.error('Bridge assignment failed:', bridgeResult.error);
        return false;
      }
    } catch (error) {
      console.error('Failed to assign task:', error);
      return false;
    }
  }, [bridgeAssignTask, assignTask]);

  // Get agents by department
  const getAgentsForDepartment = (dept: Department) => {
    const deptAgentConfigs = getAgentsByDepartment(dept);
    return deptAgentConfigs.map((config) => agents[config.id]);
  };

  const selectedAgent = selectedAgentId ? agents[selectedAgentId] : null;

  // Theme-specific classes
  const themeClasses = resolvedTheme === 'day'
    ? 'theme-day bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100'
    : 'theme-night bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950';

  const headerClasses = resolvedTheme === 'day'
    ? 'border-sky-200/50 bg-white/40 backdrop-blur-sm'
    : 'border-gray-800/50 bg-gray-900/40 backdrop-blur-sm';

  const sidebarClasses = resolvedTheme === 'day'
    ? 'border-sky-200/50 bg-white/30 backdrop-blur-sm'
    : 'border-gray-800 bg-gray-900/30 backdrop-blur-sm';

  const titleClasses = resolvedTheme === 'day'
    ? 'text-gray-800'
    : 'text-white';

  const subtitleClasses = resolvedTheme === 'day'
    ? 'text-gray-600'
    : 'text-gray-400';

  const controlBgClasses = resolvedTheme === 'day'
    ? 'bg-white/60 border-sky-200/50'
    : 'bg-gray-800/50 border-gray-700/50';

  const controlTextClasses = resolvedTheme === 'day'
    ? 'text-gray-600 hover:text-gray-900'
    : 'text-gray-400 hover:text-white';

  return (
    <div className={`h-screen flex overflow-hidden transition-all duration-500 ease-in-out ${themeClasses}`}>
      {/* Main Office Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className={`flex-shrink-0 p-4 border-b transition-all duration-500 ${headerClasses}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold flex items-center gap-3 transition-colors duration-500 ${titleClasses}`}>
                <span className="text-3xl">🏢</span>
                AIOS Virtual Office
              </h1>
              <p className={`text-sm mt-1 transition-colors duration-500 ${subtitleClasses}`}>
                Monitor your AI agents in real-time • Drag to pan, scroll to zoom
              </p>
            </div>

            {/* Status & Controls */}
            <div className="flex items-center gap-4">
              {/* Zoom Controls */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${controlBgClasses}`}>
                <button
                  onClick={() => zoomCamera(-1)}
                  disabled={camera.zoom <= CAMERA_CONFIG.MIN_ZOOM}
                  className={`w-6 h-6 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-500 ${controlTextClasses}`}
                  title="Zoom Out"
                >
                  -
                </button>
                <span className={`text-xs w-12 text-center transition-colors duration-500 ${subtitleClasses}`}>
                  {Math.round(camera.zoom * 100)}%
                </span>
                <button
                  onClick={() => zoomCamera(1)}
                  disabled={camera.zoom >= CAMERA_CONFIG.MAX_ZOOM}
                  className={`w-6 h-6 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-500 ${controlTextClasses}`}
                  title="Zoom In"
                >
                  +
                </button>
                <div className={`w-px h-4 mx-1 transition-colors duration-500 ${resolvedTheme === 'day' ? 'bg-sky-200' : 'bg-gray-700'}`} />
                <button
                  onClick={resetCamera}
                  className={`text-xs transition-colors duration-500 ${controlTextClasses}`}
                  title="Reset View"
                >
                  Reset
                </button>
              </div>

              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-500 ${controlBgClasses}`}>
                <div
                  className={`w-2 h-2 rounded-full ${
                    mockMode
                      ? 'bg-yellow-500 animate-pulse'
                      : isConnected
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className={`text-xs transition-colors duration-500 ${subtitleClasses}`}>
                  {mockMode ? 'Mock Mode' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Mock Toggle */}
              <button
                onClick={() => setMockMode(!mockMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-500 ${
                  mockMode
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : resolvedTheme === 'day'
                    ? 'bg-white/60 text-gray-600 border border-sky-200/50'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700'
                }`}
              >
                {mockMode ? 'Disable Mock' : 'Enable Mock'}
              </button>

              {/* Sound Controls */}
              <SoundControls
                enabled={soundSettings.enabled}
                volume={soundSettings.volume}
                ambientPlaying={soundSettings.ambientPlaying}
                onToggleEnabled={toggleSound}
                onVolumeChange={setSoundVolume}
                onToggleAmbient={toggleAmbient}
              />

              {/* User Avatar */}
              <UserAvatar size="sm" onClick={openCustomizer} />

              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Office Canvas - Pannable/Zoomable Area */}
        <div
          ref={officeContainerRef}
          className="flex-1 relative overflow-hidden select-none"
          style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          {/* Transformed Office Content */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${camera.position.x}px, ${camera.position.y}px) scale(${camera.zoom})`,
              transformOrigin: 'center center',
              transition: isDragging.current ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* Office Grid */}
            <div ref={officeGridRef} className="p-6 space-y-4 relative">
              {/* Top Row - Product, Engineering, Quality, Design */}
              <div className="grid grid-cols-4 gap-4">
                <DepartmentArea
                  department="product"
                  agents={getAgentsForDepartment('product')}
                  selectedAgentId={selectedAgentId}
                  onAgentClick={handleAgentClick}
                  onAgentDoubleClick={handleDoubleClick}
                />
                <DepartmentArea
                  department="engineering"
                  agents={getAgentsForDepartment('engineering')}
                  selectedAgentId={selectedAgentId}
                  onAgentClick={handleAgentClick}
                  onAgentDoubleClick={handleDoubleClick}
                />
                <DepartmentArea
                  department="quality"
                  agents={getAgentsForDepartment('quality')}
                  selectedAgentId={selectedAgentId}
                  onAgentClick={handleAgentClick}
                  onAgentDoubleClick={handleDoubleClick}
                />
                <DepartmentArea
                  department="design"
                  agents={getAgentsForDepartment('design')}
                  selectedAgentId={selectedAgentId}
                  onAgentClick={handleAgentClick}
                  onAgentDoubleClick={handleDoubleClick}
                />
              </div>

              {/* Bottom Row - Operations */}
              <DepartmentArea
                department="operations"
                agents={getAgentsForDepartment('operations')}
                selectedAgentId={selectedAgentId}
                onAgentClick={handleAgentClick}
                onAgentDoubleClick={handleDoubleClick}
              />

              {/* User Avatar - positioned above all departments */}
              <UserAvatarOffice showDestination={true} />
            </div>
          </div>

          {/* Mini Map */}
          <MiniMap
            agents={agents}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />

          {/* Department Metrics Widget */}
          <DepartmentMetrics />
        </div>
      </div>

      {/* Activity Feed Sidebar */}
      <div className={`w-80 p-4 border-l transition-all duration-500 ${sidebarClasses}`}>
        <ActivityFeed
          activities={activities}
          onActivityClick={handleActivityClick}
        />
      </div>

      {/* Agent Panel */}
      <AgentPanel
        agent={selectedAgent}
        activities={activities}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onAssignTask={handleAssignTask}
      />

      {/* Avatar Customizer Modal */}
      <AvatarCustomizer />
    </div>
  );
}

export default VirtualOffice;
