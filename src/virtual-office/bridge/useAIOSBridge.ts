// AIOS Bridge - React Hook for Claude Code integration
import { useEffect, useRef, useCallback, useState } from 'react';
import type { AIOSInboundEvent, AIOSBridgeConfig } from './EventTypes';

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

  return {
    isConnected,
    error,
    sendCommand,
    lastEventTime
  };
}

export default useAIOSBridge;
