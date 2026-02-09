// Pixel Art Virtual Office - Chat Bubble Component
// Renders speech bubbles above agents with pixel art style
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { AGENT_COLORS, type AgentId } from '../types';

export interface ChatBubbleConfig {
  agentId: AgentId;
  message: string;
  type: 'info' | 'success' | 'error' | 'thinking';
  duration?: number; // ms, default 5000
}

const BUBBLE_COLORS = {
  info: { bg: 0xffffff, border: 0x333333, text: 0x333333 },
  success: { bg: 0xd4edda, border: 0x28a745, text: 0x155724 },
  error: { bg: 0xf8d7da, border: 0xdc3545, text: 0x721c24 },
  thinking: { bg: 0xfff3cd, border: 0xffc107, text: 0x856404 },
};

const MAX_WIDTH = 180;
const PADDING = 10;
const TAIL_SIZE = 8;
const FONT_SIZE = 10;

/**
 * Creates a pixel-art style chat bubble
 */
export function createChatBubble(config: ChatBubbleConfig): Container {
  const { agentId, message, type } = config;
  const colors = BUBBLE_COLORS[type];
  const agentColor = AGENT_COLORS[agentId]?.hex || 0x888888;

  const container = new Container();
  container.label = `bubble_${agentId}`;

  // Create text first to measure
  const textStyle = new TextStyle({
    fontFamily: '"Press Start 2P", monospace',
    fontSize: FONT_SIZE,
    fill: colors.text,
    wordWrap: true,
    wordWrapWidth: MAX_WIDTH - PADDING * 2,
    lineHeight: FONT_SIZE * 1.4,
  });

  const text = new Text({ text: message, style: textStyle });

  // Calculate bubble dimensions
  const bubbleWidth = Math.min(MAX_WIDTH, text.width + PADDING * 2);
  const bubbleHeight = text.height + PADDING * 2;

  // Draw bubble background
  const bubble = new Graphics();

  // Main bubble (rounded rect)
  bubble.roundRect(0, 0, bubbleWidth, bubbleHeight, 6);
  bubble.fill(colors.bg);
  bubble.stroke({ width: 2, color: colors.border });

  // Speech tail (pointing down)
  bubble.moveTo(bubbleWidth / 2 - TAIL_SIZE, bubbleHeight);
  bubble.lineTo(bubbleWidth / 2, bubbleHeight + TAIL_SIZE);
  bubble.lineTo(bubbleWidth / 2 + TAIL_SIZE, bubbleHeight);
  bubble.fill(colors.bg);

  // Tail border
  const tailBorder = new Graphics();
  tailBorder.moveTo(bubbleWidth / 2 - TAIL_SIZE, bubbleHeight - 1);
  tailBorder.lineTo(bubbleWidth / 2, bubbleHeight + TAIL_SIZE);
  tailBorder.lineTo(bubbleWidth / 2 + TAIL_SIZE, bubbleHeight - 1);
  tailBorder.stroke({ width: 2, color: colors.border });

  container.addChild(bubble);
  container.addChild(tailBorder);

  // Position text
  text.x = PADDING;
  text.y = PADDING;
  container.addChild(text);

  // Type indicator icon (top-left corner)
  const icon = new Graphics();
  const iconSize = 6;
  icon.circle(8, 8, iconSize);
  icon.fill(type === 'thinking' ? 0xffc107 : type === 'success' ? 0x28a745 : type === 'error' ? 0xdc3545 : agentColor);
  container.addChild(icon);

  // Center the bubble horizontally (will be positioned above agent)
  container.pivot.x = bubbleWidth / 2;
  container.pivot.y = bubbleHeight + TAIL_SIZE + 10; // 10px above the tail

  return container;
}

/**
 * Manages multiple chat bubbles with auto-dismiss
 */
export class ChatBubbleManager {
  private bubbles: Map<string, { container: Container; expiresAt: number }> = new Map();
  private parentContainer: Container | null = null;
  private agentPositions: Map<AgentId, { x: number; y: number }> = new Map();

  setParentContainer(container: Container): void {
    this.parentContainer = container;
  }

  setAgentPosition(agentId: AgentId, x: number, y: number): void {
    this.agentPositions.set(agentId, { x, y });

    // Update existing bubble position if any
    const bubbleKey = `bubble_${agentId}`;
    const existing = this.bubbles.get(bubbleKey);
    if (existing) {
      existing.container.x = x;
      existing.container.y = y - 60; // Above agent head
    }
  }

  showBubble(config: ChatBubbleConfig): void {
    if (!this.parentContainer) return;

    const bubbleKey = `bubble_${config.agentId}`;

    // Remove existing bubble for this agent
    this.removeBubble(config.agentId);

    // Create new bubble
    const bubble = createChatBubble(config);
    const duration = config.duration || 5000;
    const expiresAt = Date.now() + duration;

    // Position above agent
    const pos = this.agentPositions.get(config.agentId);
    if (pos) {
      bubble.x = pos.x;
      bubble.y = pos.y - 60;
    }

    // Fade in animation
    bubble.alpha = 0;
    this.animateFadeIn(bubble);

    this.parentContainer.addChild(bubble);
    this.bubbles.set(bubbleKey, { container: bubble, expiresAt });
  }

  removeBubble(agentId: AgentId): void {
    const bubbleKey = `bubble_${agentId}`;
    const existing = this.bubbles.get(bubbleKey);
    if (existing) {
      if (existing.container.parent) {
        existing.container.parent.removeChild(existing.container);
      }
      existing.container.destroy({ children: true });
      this.bubbles.delete(bubbleKey);
    }
  }

  /**
   * Call this in the animation loop to handle auto-dismiss
   */
  update(): void {
    const now = Date.now();

    this.bubbles.forEach((bubble, key) => {
      if (now >= bubble.expiresAt) {
        // Fade out and remove
        this.animateFadeOut(bubble.container, () => {
          if (bubble.container.parent) {
            bubble.container.parent.removeChild(bubble.container);
          }
          bubble.container.destroy({ children: true });
          this.bubbles.delete(key);
        });
      }
    });
  }

  private animateFadeIn(container: Container): void {
    const startAlpha = 0;
    const endAlpha = 1;
    const duration = 200; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.alpha = startAlpha + (endAlpha - startAlpha) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  private animateFadeOut(container: Container, onComplete: () => void): void {
    const startAlpha = container.alpha;
    const endAlpha = 0;
    const duration = 300; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      container.alpha = startAlpha + (endAlpha - startAlpha) * progress;

      // Float up slightly
      container.y -= 0.5;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();
  }

  destroy(): void {
    this.bubbles.forEach((bubble) => {
      if (bubble.container.parent) {
        bubble.container.parent.removeChild(bubble.container);
      }
      bubble.container.destroy({ children: true });
    });
    this.bubbles.clear();
    this.agentPositions.clear();
  }
}

// Singleton
let bubbleManagerInstance: ChatBubbleManager | null = null;

export function getChatBubbleManager(): ChatBubbleManager {
  if (!bubbleManagerInstance) {
    bubbleManagerInstance = new ChatBubbleManager();
  }
  return bubbleManagerInstance;
}

export default ChatBubbleManager;
