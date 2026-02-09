// Pixel Art Virtual Office - Agent Sprite Component
import { useEffect, useRef, useCallback } from 'react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  type AgentId,
  type AgentStatus,
  type AnimationState,
  AGENT_COLORS,
  STATUS_TO_ANIMATION,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
} from '../types';

interface AgentSpriteProps {
  agentId: AgentId;
  name: string;
  x: number;
  y: number;
  status: AgentStatus;
  currentActivity?: string;
  isSelected?: boolean;
  onClick?: (agentId: AgentId) => void;
}

// Agent accessories based on role
const AGENT_ACCESSORIES: Record<AgentId, string> = {
  dex: '🎧',      // Headphones
  quinn: '📋',    // Clipboard
  aria: '📐',     // Blueprint
  morgan: '💼',   // Briefcase
  sophie: '👁️',   // Vision
  max: '📝',      // Post-its
  luna: '🎨',     // Palette
  atlas: '📊',    // Charts
  nova: '🗄️',     // Database
  gage: '⚙️',     // Terminal
};

// Status colors
const STATUS_COLORS: Record<AgentStatus, number> = {
  idle: 0x808080,
  working: 0x4caf50,
  thinking: 0xff9800,
  waiting: 0x2196f3,
};

export function createAgentSprite(
  agentId: AgentId,
  name: string,
  x: number,
  y: number,
  status: AgentStatus = 'idle',
  isSelected: boolean = false
): Container {
  const container = new Container();
  container.label = `agent_${agentId}`;
  container.x = x;
  container.y = y;
  container.eventMode = 'static';
  container.cursor = 'pointer';

  const colors = AGENT_COLORS[agentId] || { primary: '#888888', hex: 0x888888 };
  const statusColor = STATUS_COLORS[status];
  const accessory = AGENT_ACCESSORIES[agentId] || '👤';

  // Shadow
  const shadow = new Graphics();
  shadow.ellipse(0, SPRITE_HEIGHT / 2 - 4, 14, 6);
  shadow.fill({ color: 0x000000, alpha: 0.3 });
  container.addChild(shadow);

  // Body (pixel art style character)
  const body = new Graphics();

  // Feet
  body.roundRect(-8, SPRITE_HEIGHT / 2 - 12, 6, 8, 2);
  body.fill(0x333344);
  body.roundRect(2, SPRITE_HEIGHT / 2 - 12, 6, 8, 2);
  body.fill(0x333344);

  // Legs
  body.rect(-6, SPRITE_HEIGHT / 2 - 20, 4, 10);
  body.fill(0x4a4a5a);
  body.rect(2, SPRITE_HEIGHT / 2 - 20, 4, 10);
  body.fill(0x4a4a5a);

  // Torso
  body.roundRect(-10, SPRITE_HEIGHT / 2 - 34, 20, 16, 3);
  body.fill(colors.hex);
  body.stroke({ width: 1, color: 0x000000, alpha: 0.3 });

  // Arms
  body.roundRect(-14, SPRITE_HEIGHT / 2 - 32, 5, 12, 2);
  body.fill(colors.hex);
  body.roundRect(9, SPRITE_HEIGHT / 2 - 32, 5, 12, 2);
  body.fill(colors.hex);

  // Hands
  body.circle(-12, SPRITE_HEIGHT / 2 - 18, 3);
  body.fill(0xffdbac);
  body.circle(12, SPRITE_HEIGHT / 2 - 18, 3);
  body.fill(0xffdbac);

  // Head
  body.roundRect(-9, SPRITE_HEIGHT / 2 - 48, 18, 16, 4);
  body.fill(0xffdbac);
  body.stroke({ width: 1, color: 0x000000, alpha: 0.2 });

  // Hair
  body.roundRect(-10, SPRITE_HEIGHT / 2 - 52, 20, 8, 3);
  body.fill(0x3d2314);

  // Eyes
  body.circle(-4, SPRITE_HEIGHT / 2 - 42, 2);
  body.fill(0x000000);
  body.circle(4, SPRITE_HEIGHT / 2 - 42, 2);
  body.fill(0x000000);

  // Eye shine
  body.circle(-3, SPRITE_HEIGHT / 2 - 43, 0.8);
  body.fill(0xffffff);
  body.circle(5, SPRITE_HEIGHT / 2 - 43, 0.8);
  body.fill(0xffffff);

  // Mouth (based on status)
  if (status === 'working') {
    // Focused mouth
    body.rect(-3, SPRITE_HEIGHT / 2 - 38, 6, 1);
    body.fill(0x000000);
  } else if (status === 'thinking') {
    // Thinking mouth (O shape)
    body.circle(0, SPRITE_HEIGHT / 2 - 37, 2);
    body.stroke({ width: 1, color: 0x000000 });
  } else {
    // Smile
    body.arc(0, SPRITE_HEIGHT / 2 - 38, 3, 0, Math.PI);
    body.stroke({ width: 1, color: 0x000000 });
  }

  container.addChild(body);

  // Selection indicator
  if (isSelected) {
    const selection = new Graphics();
    selection.circle(0, 0, 24);
    selection.stroke({ width: 3, color: colors.hex, alpha: 0.8 });

    // Animated ring effect (static for now)
    selection.circle(0, 0, 28);
    selection.stroke({ width: 1, color: colors.hex, alpha: 0.4 });

    container.addChildAt(selection, 0);
  }

  // Status indicator dot
  const statusDot = new Graphics();
  statusDot.circle(12, SPRITE_HEIGHT / 2 - 50, 4);
  statusDot.fill(statusColor);
  statusDot.stroke({ width: 1, color: 0xffffff });
  container.addChild(statusDot);

  // Working animation indicator
  if (status === 'working') {
    // Floating particles effect
    for (let i = 0; i < 3; i++) {
      const particle = new Graphics();
      particle.rect(-1, -1, 2, 2);
      particle.fill(colors.hex);
      particle.x = -8 + i * 8;
      particle.y = SPRITE_HEIGHT / 2 - 55 - i * 4;
      particle.alpha = 0.6 - i * 0.15;
      container.addChild(particle);
    }
  }

  // Thinking indicator
  if (status === 'thinking') {
    const thinkBubble = new Graphics();
    thinkBubble.circle(14, SPRITE_HEIGHT / 2 - 54, 3);
    thinkBubble.fill(0xffffff);
    thinkBubble.circle(18, SPRITE_HEIGHT / 2 - 60, 2);
    thinkBubble.fill(0xffffff);
    thinkBubble.circle(20, SPRITE_HEIGHT / 2 - 64, 1.5);
    thinkBubble.fill(0xffffff);
    container.addChild(thinkBubble);
  }

  // Name label
  const nameStyle = new TextStyle({
    fontFamily: '"Press Start 2P", monospace',
    fontSize: 8,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 2 },
  });
  const nameLabel = new Text({ text: name, style: nameStyle });
  nameLabel.anchor.set(0.5, 0);
  nameLabel.x = 0;
  nameLabel.y = SPRITE_HEIGHT / 2 + 4;
  container.addChild(nameLabel);

  // Status text
  const statusStyle = new TextStyle({
    fontFamily: 'monospace',
    fontSize: 7,
    fill: statusColor,
  });
  const statusText = new Text({
    text: status === 'idle' ? '' : `[${status}]`,
    style: statusStyle
  });
  statusText.anchor.set(0.5, 0);
  statusText.x = 0;
  statusText.y = SPRITE_HEIGHT / 2 + 14;
  container.addChild(statusText);

  return container;
}

// Hook for managing agent sprite in React
export function useAgentSprite(
  parentContainer: Container | null,
  props: AgentSpriteProps
) {
  const spriteRef = useRef<Container | null>(null);

  const updateSprite = useCallback(() => {
    if (!parentContainer) return;

    // Remove old sprite
    if (spriteRef.current) {
      spriteRef.current.destroy({ children: true });
    }

    // Create new sprite
    spriteRef.current = createAgentSprite(
      props.agentId,
      props.name,
      props.x,
      props.y,
      props.status,
      props.isSelected
    );

    // Add click handler
    if (props.onClick) {
      spriteRef.current.on('pointerdown', () => {
        props.onClick?.(props.agentId);
      });
    }

    parentContainer.addChild(spriteRef.current);
  }, [parentContainer, props]);

  useEffect(() => {
    updateSprite();

    return () => {
      if (spriteRef.current) {
        spriteRef.current.destroy({ children: true });
        spriteRef.current = null;
      }
    };
  }, [updateSprite]);

  return spriteRef;
}

export default createAgentSprite;
