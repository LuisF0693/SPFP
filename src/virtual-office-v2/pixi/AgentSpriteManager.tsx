// Pixel Art Virtual Office - Agent Sprite Manager
// Manages all agent sprites and syncs with Zustand store
import { useEffect, useRef, useCallback } from 'react';
import { Container } from 'pixi.js';
import { createAgentSprite } from './AgentSprite';
import { useTileMap } from '../hooks/useTileMap';
import { useVirtualOfficeStore } from '../../virtual-office/store/virtualOfficeStore';
import type { AgentId, AgentStatus } from '../types';

interface AgentSpriteManagerProps {
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

export function AgentSpriteManager({ parentContainer, onAgentClick }: AgentSpriteManagerProps) {
  const spritesRef = useRef<Map<AgentId, Container>>(new Map());
  const { getSpawnPoint, isLoaded: mapLoaded } = useTileMap();

  // Get agents state from store
  const agents = useVirtualOfficeStore((state) => state.agents);
  const selectedAgentId = useVirtualOfficeStore((state) => state.selectedAgentId);
  const selectAgent = useVirtualOfficeStore((state) => state.selectAgent);

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

      // Get spawn point from tile map
      const spawnPoint = getSpawnPoint(agentId);
      const x = spawnPoint?.x ?? agent.position.x;
      const y = spawnPoint?.y ?? agent.position.y;

      // Remove old sprite if exists
      const existingSprite = spritesRef.current.get(agentId);
      if (existingSprite) {
        existingSprite.destroy({ children: true });
        spritesRef.current.delete(agentId);
      }

      // Create new sprite
      const sprite = createAgentSprite(
        agentId,
        AGENT_DISPLAY_NAMES[agentId] || agentId,
        x,
        y,
        mapStatus(agent.status),
        selectedAgentId === agentId
      );

      // Add click handler
      sprite.on('pointerdown', () => handleAgentClick(agentId));

      // Set z-index based on y position (for depth sorting)
      sprite.zIndex = y;

      // Add to parent container
      parentContainer.addChild(sprite);
      spritesRef.current.set(agentId, sprite);
    });

    // Sort children by zIndex
    parentContainer.sortChildren();

    // Cleanup on unmount
    return () => {
      spritesRef.current.forEach((sprite) => {
        sprite.destroy({ children: true });
      });
      spritesRef.current.clear();
    };
  }, [parentContainer, agents, selectedAgentId, mapLoaded, getSpawnPoint, handleAgentClick]);

  return null; // This is a Pixi component, no React DOM
}

export default AgentSpriteManager;
