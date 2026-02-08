// AIOS Virtual Office - Main Component
import { useCallback, useEffect } from 'react';
import { useVirtualOfficeStore } from '../store/virtualOfficeStore';
import { DepartmentArea } from './DepartmentArea';
import { ActivityFeed } from './ActivityFeed';
import { AgentPanel } from './AgentPanel';
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
    selectAgent,
    setAgentStatus,
    addActivity,
    setMockMode,
    setConnected
  } = useVirtualOfficeStore();

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
  const { isConnected: bridgeConnected } = useAIOSBridge({
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

  const handleAgentClick = useCallback((agentId: string) => {
    selectAgent(agentId as AgentId);
  }, [selectAgent]);

  const handleActivityClick = useCallback((agentId: AgentId) => {
    selectAgent(agentId);
  }, [selectAgent]);

  const handleClosePanel = useCallback(() => {
    selectAgent(null);
  }, [selectAgent]);

  const handleAssignTask = useCallback((agentId: string, task: string) => {
    addActivity({
      timestamp: Date.now(),
      agentId: agentId as AgentId,
      type: 'task_assigned',
      description: task
    });
    setAgentStatus(agentId as AgentId, 'working', task);
  }, [addActivity, setAgentStatus]);

  // Get agents by department
  const getAgentsForDepartment = (dept: Department) => {
    const deptAgentConfigs = getAgentsByDepartment(dept);
    return deptAgentConfigs.map((config) => agents[config.id]);
  };

  const selectedAgent = selectedAgentId ? agents[selectedAgentId] : null;

  return (
    <div className="h-screen bg-gray-950 flex overflow-hidden">
      {/* Main Office Area */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🏢</span>
              AIOS Virtual Office
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Monitor your AI agents in real-time
            </p>
          </div>

          {/* Status & Controls */}
          <div className="flex items-center gap-4">
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

        {/* Office Grid */}
        <div className="space-y-4">
          {/* Top Row - Product, Engineering, Quality, Design */}
          <div className="grid grid-cols-4 gap-4">
            <DepartmentArea
              department="product"
              agents={getAgentsForDepartment('product')}
              selectedAgentId={selectedAgentId}
              onAgentClick={handleAgentClick}
            />
            <DepartmentArea
              department="engineering"
              agents={getAgentsForDepartment('engineering')}
              selectedAgentId={selectedAgentId}
              onAgentClick={handleAgentClick}
            />
            <DepartmentArea
              department="quality"
              agents={getAgentsForDepartment('quality')}
              selectedAgentId={selectedAgentId}
              onAgentClick={handleAgentClick}
            />
            <DepartmentArea
              department="design"
              agents={getAgentsForDepartment('design')}
              selectedAgentId={selectedAgentId}
              onAgentClick={handleAgentClick}
            />
          </div>

          {/* Bottom Row - Operations */}
          <DepartmentArea
            department="operations"
            agents={getAgentsForDepartment('operations')}
            selectedAgentId={selectedAgentId}
            onAgentClick={handleAgentClick}
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
