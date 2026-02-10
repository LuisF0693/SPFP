// Pixel Art Virtual Office - Type Definitions
import type { AgentId, AgentStatus, Department, Position } from '../../virtual-office/types';

// Re-export existing types
export type { AgentId, AgentStatus, Department, Position };

// Animation types
export type AnimationState = 'idle' | 'walk' | 'work' | 'think' | 'celebrate' | 'error';
export type Direction = 'up' | 'down' | 'left' | 'right';

// Sprite configuration
export interface SpriteConfig {
  agentId: AgentId;
  color: string;
  secondaryColor: string;
  accessory: string;
}

// Tile types
export interface TileData {
  id: number;
  x: number;
  y: number;
  walkable: boolean;
}

// Map layer types
export interface MapLayer {
  name: string;
  type: 'tilelayer' | 'objectgroup';
  data?: number[];
  objects?: MapObject[];
  visible: boolean;
}

export interface MapObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: Record<string, unknown>;
}

// Tilemap configuration
export interface TileMapConfig {
  width: number;      // Number of tiles horizontally
  height: number;     // Number of tiles vertically
  tileWidth: number;  // Pixel width of each tile
  tileHeight: number; // Pixel height of each tile
  layers: MapLayer[];
}

// Camera state for Pixi
export interface PixiCameraState {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
}

// Chat bubble
export interface ChatBubble {
  id: string;
  agentId: AgentId;
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: number;
  expiresAt: number;
}

// Agent sprite state
export interface AgentSpriteState {
  agentId: AgentId;
  position: Position;
  targetPosition: Position | null;
  animation: AnimationState;
  direction: Direction;
  isMoving: boolean;
}

// Constants
export const TILE_SIZE = 32;
export const MAP_WIDTH_TILES = 40;
export const MAP_HEIGHT_TILES = 30;
export const MAP_WIDTH_PX = MAP_WIDTH_TILES * TILE_SIZE;  // 1280
export const MAP_HEIGHT_PX = MAP_HEIGHT_TILES * TILE_SIZE; // 960

export const SPRITE_WIDTH = 32;
export const SPRITE_HEIGHT = 48;

export const ANIMATION_SPEED = {
  idle: 0.05,
  walk: 0.15,
  work: 0.12,
  think: 0.08,
  celebrate: 0.2,
  error: 0.15,
};

// Status to animation mapping
export const STATUS_TO_ANIMATION: Record<AgentStatus, AnimationState> = {
  idle: 'idle',
  working: 'work',
  thinking: 'think',
  waiting: 'idle',
};

// Department colors (matching Luna's design spec)
export const DEPARTMENT_COLORS: Record<Department, { primary: string; hex: number }> = {
  product: { primary: '#FF8C42', hex: 0xff8c42 },
  engineering: { primary: '#4A90D9', hex: 0x4a90d9 },
  quality: { primary: '#50C878', hex: 0x50c878 },
  design: { primary: '#E91E63', hex: 0xe91e63 },
  operations: { primary: '#9B59B6', hex: 0x9b59b6 },
};

// Agent colors
export const AGENT_COLORS: Record<AgentId, { primary: string; hex: number }> = {
  dex: { primary: '#4A90D9', hex: 0x4a90d9 },
  quinn: { primary: '#50C878', hex: 0x50c878 },
  aria: { primary: '#9B59B6', hex: 0x9b59b6 },
  morgan: { primary: '#FF8C42', hex: 0xff8c42 },
  sophie: { primary: '#E91E63', hex: 0xe91e63 },
  max: { primary: '#F1C40F', hex: 0xf1c40f },
  luna: { primary: '#00BCD4', hex: 0x00bcd4 },
  atlas: { primary: '#E74C3C', hex: 0xe74c3c },
  nova: { primary: '#3F51B5', hex: 0x3f51b5 },
  gage: { primary: '#607D8B', hex: 0x607d8b },
  nando: { primary: '#FFD700', hex: 0xffd700 },  // Gold for the CEO!
  orion: { primary: '#8B4513', hex: 0x8b4513 },  // Saddle brown for orchestrator
};
