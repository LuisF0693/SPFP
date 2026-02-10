// Pixel Art Virtual Office v2 - AIOS Integration Hook
// Connects the v2 office to the AIOS bridge for real agent updates
import { useEffect, useCallback } from 'react';
import { useAIOSBridge } from '../../virtual-office/bridge/useAIOSBridge';
import type { AIOSInboundEvent } from '../../virtual-office/bridge/EventTypes';
import { useVirtualOfficeStore } from '../../virtual-office/store/virtualOfficeStore';
import { getSoundService } from '../services/soundService';
import type { AgentId, AgentStatus } from '../types';

interface UseAIOSIntegrationOptions {
  onAgentStatusChange?: (agentId: AgentId, status: AgentStatus, activity?: string) => void;
  onTaskComplete?: (agentId: AgentId, success: boolean) => void;
}

export function useAIOSIntegration(options: UseAIOSIntegrationOptions = {}) {
  const setAgentStatus = useVirtualOfficeStore((state) => state.setAgentStatus);
  const addActivity = useVirtualOfficeStore((state) => state.addActivity);
  const setConnected = useVirtualOfficeStore((state) => state.setConnected);
  const mockMode = useVirtualOfficeStore((state) => state.mockMode);
  const soundSettings = useVirtualOfficeStore((state) => state.soundSettings);

  const soundService = getSoundService();

  // Handle incoming AIOS events
  const handleEvent = useCallback((event: AIOSInboundEvent) => {
    const agentId = event.agentId as AgentId;

    switch (event.type) {
      case 'tool_start':
        // Agent started working on something
        setAgentStatus(agentId, 'working', event.tool || 'Processing...');
        addActivity({
          timestamp: event.timestamp,
          agentId,
          type: 'tool_start',
          description: `Started: ${event.tool || 'task'}`,
          tool: event.tool,
        });
        options.onAgentStatusChange?.(agentId, 'working', event.tool);
        break;

      case 'tool_complete':
        // Agent finished a task
        const newStatus: AgentStatus = event.success ? 'idle' : 'error';
        setAgentStatus(agentId, newStatus, event.summary);
        addActivity({
          timestamp: event.timestamp,
          agentId,
          type: 'tool_complete',
          description: event.summary || `Completed: ${event.tool || 'task'}`,
          tool: event.tool,
          success: event.success,
        });

        // Play sound on completion
        if (soundSettings.enabled) {
          soundService.play(event.success ? 'success' : 'error');
        }

        options.onAgentStatusChange?.(agentId, newStatus, event.summary);
        options.onTaskComplete?.(agentId, event.success ?? false);
        break;

      case 'status_change':
        // Direct status update
        const status = (event.status as AgentStatus) || 'idle';
        setAgentStatus(agentId, status, event.summary);
        addActivity({
          timestamp: event.timestamp,
          agentId,
          type: 'status_change',
          description: `Status changed to: ${status}`,
        });

        if (soundSettings.enabled) {
          soundService.play('notification');
        }

        options.onAgentStatusChange?.(agentId, status, event.summary);
        break;

      case 'agent_stop':
        // Agent stopped
        setAgentStatus(agentId, 'idle');
        addActivity({
          timestamp: event.timestamp,
          agentId,
          type: 'status_change',
          description: 'Agent stopped',
        });
        options.onAgentStatusChange?.(agentId, 'idle');
        break;
    }
  }, [setAgentStatus, addActivity, soundSettings.enabled, soundService, options]);

  // Handle connection changes
  const handleConnectionChange = useCallback((connected: boolean) => {
    setConnected(connected);
    if (soundSettings.enabled) {
      soundService.play(connected ? 'success' : 'error');
    }
  }, [setConnected, soundSettings.enabled, soundService]);

  // Use the AIOS bridge
  const bridge = useAIOSBridge({
    onEvent: handleEvent,
    onConnectionChange: handleConnectionChange,
    pollInterval: mockMode ? 5000 : 500, // Slower polling in mock mode
  });

  // Sync connection status to store
  useEffect(() => {
    setConnected(bridge.isConnected);
  }, [bridge.isConnected, setConnected]);

  return {
    isConnected: bridge.isConnected,
    error: bridge.error,
    assignTask: bridge.assignTask,
    sendChatMessage: bridge.sendChatMessage,
    sendCommand: bridge.sendCommand,
  };
}

export default useAIOSIntegration;
