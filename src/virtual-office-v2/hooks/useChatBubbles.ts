// Pixel Art Virtual Office - Chat Bubbles Hook
import { useEffect, useRef, useCallback } from 'react';
import { Container } from 'pixi.js';
import { getChatBubbleManager, type ChatBubbleConfig } from '../pixi/ChatBubble';
import type { AgentId } from '../types';

interface UseChatBubblesProps {
  parentContainer: Container | null;
}

interface UseChatBubblesReturn {
  showBubble: (config: ChatBubbleConfig) => void;
  removeBubble: (agentId: AgentId) => void;
  updateAgentPosition: (agentId: AgentId, x: number, y: number) => void;
}

export function useChatBubbles({ parentContainer }: UseChatBubblesProps): UseChatBubblesReturn {
  const updateIntervalRef = useRef<number | null>(null);
  const manager = getChatBubbleManager();

  // Set parent container
  useEffect(() => {
    if (parentContainer) {
      manager.setParentContainer(parentContainer);
    }
  }, [parentContainer, manager]);

  // Start update loop for auto-dismiss
  useEffect(() => {
    const update = () => {
      manager.update();
    };

    updateIntervalRef.current = window.setInterval(update, 100);

    return () => {
      if (updateIntervalRef.current) {
        window.clearInterval(updateIntervalRef.current);
      }
    };
  }, [manager]);

  const showBubble = useCallback((config: ChatBubbleConfig) => {
    manager.showBubble(config);
  }, [manager]);

  const removeBubble = useCallback((agentId: AgentId) => {
    manager.removeBubble(agentId);
  }, [manager]);

  const updateAgentPosition = useCallback((agentId: AgentId, x: number, y: number) => {
    manager.setAgentPosition(agentId, x, y);
  }, [manager]);

  return {
    showBubble,
    removeBubble,
    updateAgentPosition,
  };
}

export default useChatBubbles;
