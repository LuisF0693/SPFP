// AIOS Virtual Office - Main Component
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVirtualOfficeStore, CAMERA_CONFIG, type TaskPriority } from '../store/virtualOfficeStore';
import { DepartmentArea } from './DepartmentArea';
import { ActivityFeed } from './ActivityFeed';
import { AgentPanel } from './AgentPanel';
import { MiniMap } from './MiniMap';
import { getAgentsByDepartment } from '../data/agents';
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
    selectAgent,
    setAgentStatus,
    addActivity,
    setMockMode,
    setConnected,
    panCamera,
    zoomCamera,
    centerOnAgent,
    resetCamera,
    assignTask
  } = useVirtualOfficeStore();

  // Refs for pan/zoom
  const officeContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Container dimensions for minimap viewport calculation
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

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
    if (target.closest('button') || target.closest('[data-agent]')) return;

    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
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
    isDragging.current = false;
    e.currentTarget.style.cursor = 'grab';
  }, []);

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
      handleDoubleClick(agentId as AgentId);
    } else {
      selectAgent(agentId as AgentId);
    }
  }, [selectAgent, handleDoubleClick]);

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

  return (
    <div className="h-screen bg-gray-950 flex overflow-hidden">
      {/* Main Office Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🏢</span>
                AIOS Virtual Office
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Monitor your AI agents in real-time • Drag to pan, scroll to zoom
              </p>
            </div>

            {/* Status & Controls */}
            <div className="flex items-center gap-4">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <button
                  onClick={() => zoomCamera(-1)}
                  disabled={camera.zoom <= CAMERA_CONFIG.MIN_ZOOM}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="text-xs text-gray-400 w-12 text-center">
                  {Math.round(camera.zoom * 100)}%
                </span>
                <button
                  onClick={() => zoomCamera(1)}
                  disabled={camera.zoom >= CAMERA_CONFIG.MAX_ZOOM}
                  className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Zoom In"
                >
                  +
                </button>
                <div className="w-px h-4 bg-gray-700 mx-1" />
                <button
                  onClick={resetCamera}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                  title="Reset View"
                >
                  Reset
                </button>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50">
                <div
                  className={`w-2 h-2 rounded-full ${
                    mockMode
                      ? 'bg-yellow-500 animate-pulse'
                      : isConnected
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-xs text-gray-400">
                  {mockMode ? 'Mock Mode' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Mock Toggle */}
              <button
                onClick={() => setMockMode(!mockMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  mockMode
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-gray-800/50 text-gray-400 border border-gray-700'
                }`}
              >
                {mockMode ? 'Disable Mock' : 'Enable Mock'}
              </button>
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
            <div className="p-6 space-y-4">
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
            </div>
          </div>

          {/* Mini Map */}
          <MiniMap
            agents={agents}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
        </div>
      </div>

      {/* Activity Feed Sidebar */}
      <div className="w-80 p-4 border-l border-gray-800">
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
    </div>
  );
}

export default VirtualOffice;
