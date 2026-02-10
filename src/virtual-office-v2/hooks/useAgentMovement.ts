// Pixel Art Virtual Office - Agent Movement Hook
import { useCallback, useRef, useEffect } from 'react';
import { Container } from 'pixi.js';
import {
  createPathState,
  startPath,
  updatePath,
  stopPath,
  type AgentPathState,
  type Point,
} from '../utils/pathfinding';
import { useVirtualOfficeStore } from '../../virtual-office/store/virtualOfficeStore';
import type { AgentId } from '../types';

interface UseAgentMovementProps {
  agentContainers: Map<AgentId, Container>;
  onMoveStart?: (agentId: AgentId) => void;
  onMoveEnd?: (agentId: AgentId) => void;
}

interface UseAgentMovementReturn {
  moveAgentTo: (agentId: AgentId, destination: Point) => boolean;
  stopAgent: (agentId: AgentId) => void;
  isAgentMoving: (agentId: AgentId) => boolean;
}

export function useAgentMovement({
  agentContainers,
  onMoveStart,
  onMoveEnd,
}: UseAgentMovementProps): UseAgentMovementReturn {
  const pathStatesRef = useRef<Map<AgentId, AgentPathState>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const setAgentStatus = useVirtualOfficeStore((state) => state.setAgentStatus);

  // Initialize path states for all agents
  useEffect(() => {
    agentContainers.forEach((_, agentId) => {
      if (!pathStatesRef.current.has(agentId)) {
        pathStatesRef.current.set(agentId, createPathState(agentId, 80)); // 80 pixels per second
      }
    });
  }, [agentContainers]);

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      const deltaTime = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;

      pathStatesRef.current.forEach((state, agentId) => {
        if (state.isMoving) {
          const container = agentContainers.get(agentId);
          if (container) {
            const newPos = updatePath(state, deltaTime);
            if (newPos) {
              container.x = newPos.x;
              container.y = newPos.y;

              if (!state.isMoving) {
                // Movement finished
                setAgentStatus(agentId, 'idle');
                onMoveEnd?.(agentId);
              }
            }
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [agentContainers, setAgentStatus, onMoveEnd]);

  // Move agent to destination
  const moveAgentTo = useCallback((agentId: AgentId, destination: Point): boolean => {
    const container = agentContainers.get(agentId);
    if (!container) return false;

    let state = pathStatesRef.current.get(agentId);
    if (!state) {
      state = createPathState(agentId, 80);
      pathStatesRef.current.set(agentId, state);
    }

    const from = { x: container.x, y: container.y };
    const success = startPath(state, from, destination);

    if (success) {
      setAgentStatus(agentId, 'walking', 'Moving to destination...');
      onMoveStart?.(agentId);
    }

    return success;
  }, [agentContainers, setAgentStatus, onMoveStart]);

  // Stop agent movement
  const stopAgent = useCallback((agentId: AgentId) => {
    const state = pathStatesRef.current.get(agentId);
    if (state) {
      stopPath(state);
      setAgentStatus(agentId, 'idle');
    }
  }, [setAgentStatus]);

  // Check if agent is moving
  const isAgentMoving = useCallback((agentId: AgentId): boolean => {
    const state = pathStatesRef.current.get(agentId);
    return state?.isMoving ?? false;
  }, []);

  return {
    moveAgentTo,
    stopAgent,
    isAgentMoving,
  };
}

export default useAgentMovement;
