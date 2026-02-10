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

// Agent visual profiles - unique appearance per agent
interface AgentProfile {
  skinTone: number;
  hairColor: number;
  hairStyle: 'short' | 'medium' | 'long' | 'bald' | 'spiky' | 'ponytail' | 'crown';
  hasGlasses: boolean;
  hasBeard: boolean;
  gender: 'male' | 'female' | 'neutral';
  accessoryColor: number;
}

const AGENT_PROFILES: Record<AgentId, AgentProfile> = {
  dex: { skinTone: 0xf5deb3, hairColor: 0x2c1810, hairStyle: 'spiky', hasGlasses: true, hasBeard: false, gender: 'male', accessoryColor: 0x4a90d9 },
  quinn: { skinTone: 0xd4a574, hairColor: 0x8b4513, hairStyle: 'short', hasGlasses: false, hasBeard: false, gender: 'female', accessoryColor: 0x50c878 },
  aria: { skinTone: 0xf0d5c2, hairColor: 0x1a1a2e, hairStyle: 'long', hasGlasses: true, hasBeard: false, gender: 'female', accessoryColor: 0x9b59b6 },
  morgan: { skinTone: 0xc68642, hairColor: 0x1a1a1a, hairStyle: 'short', hasGlasses: false, hasBeard: true, gender: 'male', accessoryColor: 0xff8c42 },
  sophie: { skinTone: 0xffe0bd, hairColor: 0xd4a574, hairStyle: 'ponytail', hasGlasses: false, hasBeard: false, gender: 'female', accessoryColor: 0xe91e63 },
  max: { skinTone: 0xf5deb3, hairColor: 0xffd700, hairStyle: 'medium', hasGlasses: false, hasBeard: false, gender: 'male', accessoryColor: 0xf1c40f },
  luna: { skinTone: 0xffdfc4, hairColor: 0xff69b4, hairStyle: 'long', hasGlasses: false, hasBeard: false, gender: 'female', accessoryColor: 0x00bcd4 },
  atlas: { skinTone: 0x8d5524, hairColor: 0x1a1a1a, hairStyle: 'bald', hasGlasses: true, hasBeard: true, gender: 'male', accessoryColor: 0xe74c3c },
  nova: { skinTone: 0xf0c8a0, hairColor: 0x4a0080, hairStyle: 'short', hasGlasses: false, hasBeard: false, gender: 'female', accessoryColor: 0x3f51b5 },
  gage: { skinTone: 0xd4a574, hairColor: 0x333333, hairStyle: 'spiky', hasGlasses: false, hasBeard: true, gender: 'male', accessoryColor: 0x607d8b },
  nando: { skinTone: 0xc68642, hairColor: 0x2c1810, hairStyle: 'medium', hasGlasses: false, hasBeard: true, gender: 'male', accessoryColor: 0xffd700 },
  orion: { skinTone: 0xf5deb3, hairColor: 0x8b4513, hairStyle: 'crown', hasGlasses: false, hasBeard: false, gender: 'neutral', accessoryColor: 0x8b4513 },
};

// Status colors
const STATUS_COLORS: Record<AgentStatus, number> = {
  idle: 0x808080,
  working: 0x4caf50,
  thinking: 0xff9800,
  waiting: 0x2196f3,
  walking: 0x9c27b0,
  celebrating: 0xe91e63,
  error: 0xf44336,
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
  const statusColor = STATUS_COLORS[status] || 0x808080;
  const profile = AGENT_PROFILES[agentId] || {
    skinTone: 0xffdbac, hairColor: 0x3d2314, hairStyle: 'short' as const,
    hasGlasses: false, hasBeard: false, gender: 'neutral' as const, accessoryColor: 0x888888
  };

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

  // Legs (pants color varies by gender)
  const pantsColor = profile.gender === 'female' ? 0x4a4a6a : 0x4a4a5a;
  body.rect(-6, SPRITE_HEIGHT / 2 - 20, 4, 10);
  body.fill(pantsColor);
  body.rect(2, SPRITE_HEIGHT / 2 - 20, 4, 10);
  body.fill(pantsColor);

  // Torso
  body.roundRect(-10, SPRITE_HEIGHT / 2 - 34, 20, 16, 3);
  body.fill(colors.hex);
  body.stroke({ width: 1, color: 0x000000, alpha: 0.3 });

  // Collar/neckline
  if (profile.gender === 'female') {
    body.arc(0, SPRITE_HEIGHT / 2 - 34, 6, Math.PI, 0);
    body.fill(profile.skinTone);
  } else {
    body.rect(-4, SPRITE_HEIGHT / 2 - 35, 8, 3);
    body.fill(0xffffff); // Collar
  }

  // Arms
  body.roundRect(-14, SPRITE_HEIGHT / 2 - 32, 5, 12, 2);
  body.fill(colors.hex);
  body.roundRect(9, SPRITE_HEIGHT / 2 - 32, 5, 12, 2);
  body.fill(colors.hex);

  // Hands
  body.circle(-12, SPRITE_HEIGHT / 2 - 18, 3);
  body.fill(profile.skinTone);
  body.circle(12, SPRITE_HEIGHT / 2 - 18, 3);
  body.fill(profile.skinTone);

  // Head
  body.roundRect(-9, SPRITE_HEIGHT / 2 - 48, 18, 16, 4);
  body.fill(profile.skinTone);
  body.stroke({ width: 1, color: 0x000000, alpha: 0.2 });

  // Hair based on style
  switch (profile.hairStyle) {
    case 'short':
      body.roundRect(-10, SPRITE_HEIGHT / 2 - 52, 20, 6, 3);
      body.fill(profile.hairColor);
      break;
    case 'medium':
      body.roundRect(-10, SPRITE_HEIGHT / 2 - 52, 20, 8, 3);
      body.fill(profile.hairColor);
      body.roundRect(-11, SPRITE_HEIGHT / 2 - 48, 4, 6, 2);
      body.fill(profile.hairColor);
      body.roundRect(7, SPRITE_HEIGHT / 2 - 48, 4, 6, 2);
      body.fill(profile.hairColor);
      break;
    case 'long':
      body.roundRect(-10, SPRITE_HEIGHT / 2 - 52, 20, 8, 3);
      body.fill(profile.hairColor);
      body.roundRect(-12, SPRITE_HEIGHT / 2 - 48, 6, 16, 2);
      body.fill(profile.hairColor);
      body.roundRect(6, SPRITE_HEIGHT / 2 - 48, 6, 16, 2);
      body.fill(profile.hairColor);
      break;
    case 'spiky':
      body.roundRect(-10, SPRITE_HEIGHT / 2 - 52, 20, 6, 2);
      body.fill(profile.hairColor);
      // Spikes
      for (let i = 0; i < 5; i++) {
        body.moveTo(-8 + i * 4, SPRITE_HEIGHT / 2 - 52);
        body.lineTo(-6 + i * 4, SPRITE_HEIGHT / 2 - 58);
        body.lineTo(-4 + i * 4, SPRITE_HEIGHT / 2 - 52);
        body.fill(profile.hairColor);
      }
      break;
    case 'ponytail':
      body.roundRect(-10, SPRITE_HEIGHT / 2 - 52, 20, 6, 3);
      body.fill(profile.hairColor);
      // Ponytail
      body.roundRect(8, SPRITE_HEIGHT / 2 - 50, 4, 18, 2);
      body.fill(profile.hairColor);
      break;
    case 'bald':
      // No hair, just a slight shine
      body.arc(0, SPRITE_HEIGHT / 2 - 48, 6, Math.PI, 0);
      body.fill({ color: 0xffffff, alpha: 0.2 });
      break;
    case 'crown':
      // Orion's crown
      body.roundRect(-10, SPRITE_HEIGHT / 2 - 52, 20, 6, 3);
      body.fill(profile.hairColor);
      // Crown
      body.moveTo(-8, SPRITE_HEIGHT / 2 - 54);
      body.lineTo(-6, SPRITE_HEIGHT / 2 - 60);
      body.lineTo(-4, SPRITE_HEIGHT / 2 - 54);
      body.lineTo(-2, SPRITE_HEIGHT / 2 - 62);
      body.lineTo(0, SPRITE_HEIGHT / 2 - 54);
      body.lineTo(2, SPRITE_HEIGHT / 2 - 62);
      body.lineTo(4, SPRITE_HEIGHT / 2 - 54);
      body.lineTo(6, SPRITE_HEIGHT / 2 - 60);
      body.lineTo(8, SPRITE_HEIGHT / 2 - 54);
      body.fill(0xffd700);
      body.stroke({ width: 1, color: 0xdaa520 });
      break;
  }

  // Beard if applicable
  if (profile.hasBeard) {
    body.roundRect(-6, SPRITE_HEIGHT / 2 - 38, 12, 6, 2);
    body.fill(profile.hairColor);
  }

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

  // Glasses if applicable
  if (profile.hasGlasses) {
    body.circle(-4, SPRITE_HEIGHT / 2 - 42, 4);
    body.stroke({ width: 1, color: 0x333333 });
    body.circle(4, SPRITE_HEIGHT / 2 - 42, 4);
    body.stroke({ width: 1, color: 0x333333 });
    body.moveTo(0, SPRITE_HEIGHT / 2 - 42);
    body.lineTo(0, SPRITE_HEIGHT / 2 - 42);
    body.stroke({ width: 1, color: 0x333333 });
  }

  // Mouth (based on status)
  if (status === 'working') {
    body.rect(-3, SPRITE_HEIGHT / 2 - 38, 6, 1);
    body.fill(0x000000);
  } else if (status === 'thinking') {
    body.circle(0, SPRITE_HEIGHT / 2 - 37, 2);
    body.stroke({ width: 1, color: 0x000000 });
  } else if (status === 'celebrating') {
    // Big smile
    body.arc(0, SPRITE_HEIGHT / 2 - 39, 4, 0, Math.PI);
    body.fill(0x000000);
  } else if (status === 'error') {
    // Frown
    body.arc(0, SPRITE_HEIGHT / 2 - 35, 3, Math.PI, 0);
    body.stroke({ width: 1, color: 0x000000 });
  } else {
    // Normal smile
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

  // Celebration indicator (confetti/stars)
  if (status === 'celebrating') {
    const confetti = new Graphics();
    const confettiColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 20 + Math.random() * 10;
      const cx = Math.cos(angle) * dist;
      const cy = Math.sin(angle) * dist - 30;
      const color = confettiColors[i % confettiColors.length];
      confetti.rect(cx - 2, cy - 2, 4, 4);
      confetti.fill(color);
    }
    container.addChild(confetti);
  }

  // Error indicator (warning symbol)
  if (status === 'error') {
    const errorIndicator = new Graphics();
    // Warning triangle
    errorIndicator.moveTo(-20, SPRITE_HEIGHT / 2 - 45);
    errorIndicator.lineTo(-14, SPRITE_HEIGHT / 2 - 55);
    errorIndicator.lineTo(-8, SPRITE_HEIGHT / 2 - 45);
    errorIndicator.closePath();
    errorIndicator.fill(0xf44336);
    errorIndicator.stroke({ width: 1, color: 0xd32f2f });
    // Exclamation mark
    errorIndicator.rect(-15, SPRITE_HEIGHT / 2 - 53, 2, 4);
    errorIndicator.fill(0xffffff);
    errorIndicator.rect(-15, SPRITE_HEIGHT / 2 - 48, 2, 2);
    errorIndicator.fill(0xffffff);
    container.addChild(errorIndicator);
  }

  // Walking indicator (footsteps)
  if (status === 'walking') {
    const footsteps = new Graphics();
    footsteps.ellipse(-10, SPRITE_HEIGHT / 2 + 2, 3, 2);
    footsteps.fill({ color: 0x000000, alpha: 0.2 });
    footsteps.ellipse(0, SPRITE_HEIGHT / 2 + 6, 3, 2);
    footsteps.fill({ color: 0x000000, alpha: 0.15 });
    footsteps.ellipse(10, SPRITE_HEIGHT / 2 + 10, 3, 2);
    footsteps.fill({ color: 0x000000, alpha: 0.1 });
    container.addChild(footsteps);
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
