// Pixel Art Virtual Office - Agent Sprite Manager
// Manages all agent sprites and syncs with Zustand store
import { useEffect, useRef, useCallback } from 'react';
import { Application, Container } from 'pixi.js';
import { createAgentSprite } from './AgentSprite';
import { getAnimationController } from './AnimationController';
import { useTileMap } from '../hooks/useTileMap';
import { useVirtualOfficeStore } from '../../virtual-office/store/virtualOfficeStore';
import type { AgentId, AgentStatus } from '../types';

interface AgentSpriteManagerProps {
  app: Application | null;
  parentContainer: Container | null;
  onAgentClick?: (agentId: AgentId) => void;
}

// Map store status to our status type
const mapStatus = (status: string): AgentStatus => {
  switch (status) {
    case 'working':
      return 'working';
    case 'thinking':
      return 'thinking';
    case 'waiting':
      return 'waiting';
    default:
      return 'idle';
  }
};

// Display names for agents
const AGENT_DISPLAY_NAMES: Record<AgentId, string> = {
  dex: 'Dex',
  quinn: 'Quinn',
  aria: 'Aria',
  morgan: 'Morgan',
  sophie: 'Sophie',
  max: 'Max',
  luna: 'Luna',
  atlas: 'Atlas',
  nova: 'Nova',
  gage: 'Gage',
};

export function AgentSpriteManager({ app, parentContainer, onAgentClick }: AgentSpriteManagerProps) {
  const spritesRef = useRef<Map<AgentId, Container>>(new Map());
  const animationStartedRef = useRef(false);
  const { getSpawnPoint, isLoaded: mapLoaded } = useTileMap();

  // Get agents state from store
  const agents = useVirtualOfficeStore((state) => state.agents);
  const selectedAgentId = useVirtualOfficeStore((state) => state.selectedAgentId);
  const selectAgent = useVirtualOfficeStore((state) => state.selectAgent);

  // Get animation controller
  const animController = getAnimationController();

  // Start animation controller when app is ready
  useEffect(() => {
    if (app && !animationStartedRef.current) {
      animController.start(app);
      animationStartedRef.current = true;
    }

    return () => {
      if (animationStartedRef.current) {
        animController.stop();
        animationStartedRef.current = false;
      }
    };
  }, [app, animController]);

  // Handle agent click
  const handleAgentClick = useCallback((agentId: AgentId) => {
    selectAgent(agentId);
    onAgentClick?.(agentId);
  }, [selectAgent, onAgentClick]);

  // Update or create sprites when agents change
  useEffect(() => {
    if (!parentContainer || !mapLoaded) return;

    const agentIds = Object.keys(agents) as AgentId[];

    agentIds.forEach((agentId) => {
      const agent = agents[agentId];
      if (!agent) return;

      const status = mapStatus(agent.status);

      // Get spawn point from tile map
      const spawnPoint = getSpawnPoint(agentId);
      const x = spawnPoint?.x ?? agent.position.x;
      const y = spawnPoint?.y ?? agent.position.y;

      // Check if sprite exists and just needs status update
      const existingSprite = spritesRef.current.get(agentId);
      if (existingSprite) {
        // Update animation status
        animController.updateAgentStatus(agentId, status);

        // Check if selection changed - need to recreate for visual update
        const wasSelected = (existingSprite as any)._isSelected;
        const isSelected = selectedAgentId === agentId;

        if (wasSelected === isSelected) {
          // No need to recreate, just update animation
          return;
        }

        // Remove old sprite for selection change
        animController.unregisterAgent(agentId);
        existingSprite.destroy({ children: true });
        spritesRef.current.delete(agentId);
      }

      // Create new sprite
      const sprite = createAgentSprite(
        agentId,
        AGENT_DISPLAY_NAMES[agentId] || agentId,
        x,
        y,
        status,
        selectedAgentId === agentId
      );

      // Store selection state for future comparison
      (sprite as any)._isSelected = selectedAgentId === agentId;

      // Add click handler
      sprite.on('pointerdown', () => handleAgentClick(agentId));

      // Set z-index based on y position (for depth sorting)
      sprite.zIndex = y;

      // Add to parent container
      parentContainer.addChild(sprite);
      spritesRef.current.set(agentId, sprite);

      // Register with animation controller
      animController.registerAgent(agentId, sprite, status);
    });

    // Sort children by zIndex
    parentContainer.sortChildren();

    // Cleanup on unmount
    return () => {
      spritesRef.current.forEach((sprite, agentId) => {
        animController.unregisterAgent(agentId);
        sprite.destroy({ children: true });
      });
      spritesRef.current.clear();
    };
  }, [parentContainer, agents, selectedAgentId, mapLoaded, getSpawnPoint, handleAgentClick, animController]);

  return null; // This is a Pixi component, no React DOM
}

export default AgentSpriteManager;
