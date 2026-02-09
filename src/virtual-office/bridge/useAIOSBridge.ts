// AIOS Bridge - React Hook for Claude Code integration
import { useEffect, useRef, useCallback, useState } from 'react';
import type { AIOSInboundEvent, AIOSBridgeConfig } from './EventTypes';
import type { AgentId } from '../types';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface AssignTaskResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

const DEFAULT_CONFIG: Partial<AIOSBridgeConfig> = {
  pollInterval: 500,
  eventsEndpoint: '/api/aios-events',
  commandsEndpoint: '/api/aios-commands'
};

export function useAIOSBridge(config: Partial<AIOSBridgeConfig>) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEventTime, setLastEventTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const configRef = useRef({ ...DEFAULT_CONFIG, ...config });

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = { ...DEFAULT_CONFIG, ...config };
  }, [config]);

  // Poll for events
  const pollEvents = useCallback(async () => {
    const { eventsEndpoint, onEvent, onConnectionChange } = configRef.current;

    try {
      const response = await fetch(
        `${eventsEndpoint}?since=${lastEventTime}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const events: AIOSInboundEvent[] = await response.json();

      // Process events
      if (events.length > 0) {
        events.forEach((event) => {
          onEvent?.(event);
        });
        setLastEventTime(events[events.length - 1].timestamp);
      }

      // Update connection status
      if (!isConnected) {
        setIsConnected(true);
        onConnectionChange?.(true);
      }
      setError(null);

    } catch (err) {
      // Only log error if we were previously connected
      if (isConnected) {
        setIsConnected(false);
        configRef.current.onConnectionChange?.(false);
      }
      // Don't spam console with connection errors in dev
      if (error !== (err as Error).message) {
        setError((err as Error).message);
      }
    }
  }, [lastEventTime, isConnected, error]);

  // Start polling
  useEffect(() => {
    const { pollInterval } = configRef.current;

    // Initial poll
    pollEvents();

    // Set up interval
    const interval = setInterval(pollEvents, pollInterval);

    return () => clearInterval(interval);
  }, [pollEvents]);

  // Send command to Claude Code
  const sendCommand = useCallback(async (
    targetAgent: string,
    command: string,
    args?: Record<string, unknown>
  ) => {
    const { commandsEndpoint } = configRef.current;

    try {
      const response = await fetch(commandsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'command',
          timestamp: Date.now(),
          targetAgent,
          command,
          args
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send command: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to send command:', err);
      throw err;
    }
  }, []);

  // Assign task to an agent
  const assignTask = useCallback(async (
    agentId: AgentId,
    description: string,
    priority: TaskPriority
  ): Promise<AssignTaskResult> => {
    const { commandsEndpoint } = configRef.current;

    try {
      const response = await fetch(commandsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task_assignment',
          timestamp: Date.now(),
          targetAgent: agentId,
          command: 'assign_task',
          args: {
            description,
            priority
          }
        })
      });

      if (!response.ok) {
        // In mock mode or when server unavailable, still return success
        // The store will handle the local state update
        if (!isConnected) {
          return {
            success: true,
            taskId: `local-${Date.now()}`
          };
        }
        throw new Error(`Failed to assign task: HTTP ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        taskId: result.taskId
      };
    } catch (err) {
      // In mock mode, simulate success
      if (!isConnected) {
        return {
          success: true,
          taskId: `mock-${Date.now()}`
        };
      }
      console.error('Failed to assign task:', err);
      return {
        success: false,
        error: (err as Error).message
      };
    }
  }, [isConnected]);

  return {
    isConnected,
    error,
    sendCommand,
    assignTask,
    lastEventTime
  };
}

export default useAIOSBridge;
