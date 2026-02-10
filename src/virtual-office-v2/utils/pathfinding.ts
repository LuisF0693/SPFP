// Pixel Art Virtual Office - Simple A* Pathfinding
import { MAP_WIDTH_PX, MAP_HEIGHT_PX, TILE_SIZE } from '../types';

export interface PathNode {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

export interface Point {
  x: number;
  y: number;
}

// Grid dimensions
const GRID_WIDTH = Math.ceil(MAP_WIDTH_PX / TILE_SIZE);
const GRID_HEIGHT = Math.ceil(MAP_HEIGHT_PX / TILE_SIZE);

// Simple obstacle map (can be extended to read from office-map.json)
// 0 = walkable, 1 = blocked
const obstacleMap: number[][] = [];

// Initialize empty obstacle map
function initObstacleMap(): void {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    obstacleMap[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      obstacleMap[y][x] = 0; // All walkable by default
    }
  }
}

// Convert world coordinates to grid coordinates
function worldToGrid(x: number, y: number): Point {
  return {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE),
  };
}

// Convert grid coordinates to world coordinates (center of tile)
function gridToWorld(x: number, y: number): Point {
  return {
    x: x * TILE_SIZE + TILE_SIZE / 2,
    y: y * TILE_SIZE + TILE_SIZE / 2,
  };
}

// Manhattan distance heuristic
function heuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Check if a position is walkable
function isWalkable(x: number, y: number): boolean {
  if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
    return false;
  }
  return obstacleMap[y]?.[x] === 0;
}

// Get neighbors of a node
function getNeighbors(node: PathNode): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: 0, y: -1 },  // Up
    { x: 1, y: 0 },   // Right
    { x: 0, y: 1 },   // Down
    { x: -1, y: 0 },  // Left
    // Diagonals
    { x: 1, y: -1 },  // Up-Right
    { x: 1, y: 1 },   // Down-Right
    { x: -1, y: 1 },  // Down-Left
    { x: -1, y: -1 }, // Up-Left
  ];

  for (const dir of directions) {
    const nx = node.x + dir.x;
    const ny = node.y + dir.y;
    if (isWalkable(nx, ny)) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
}

// A* pathfinding algorithm
export function findPath(startWorld: Point, endWorld: Point): Point[] {
  // Initialize obstacle map if empty
  if (obstacleMap.length === 0) {
    initObstacleMap();
  }

  const start = worldToGrid(startWorld.x, startWorld.y);
  const end = worldToGrid(endWorld.x, endWorld.y);

  // Early exit if start or end is not walkable
  if (!isWalkable(start.x, start.y) || !isWalkable(end.x, end.y)) {
    return [];
  }

  const openSet: PathNode[] = [];
  const closedSet: Set<string> = new Set();

  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null,
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    // Find node with lowest f cost
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const currentKey = `${current.x},${current.y}`;

    // Check if we reached the goal
    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path: Point[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(gridToWorld(node.x, node.y));
        node = node.parent;
      }
      return path;
    }

    closedSet.add(currentKey);

    // Process neighbors
    for (const neighbor of getNeighbors(current)) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;

      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Calculate costs
      const isDiagonal = neighbor.x !== current.x && neighbor.y !== current.y;
      const moveCost = isDiagonal ? 1.414 : 1; // Diagonal costs more
      const g = current.g + moveCost;
      const h = heuristic(neighbor, end);
      const f = g + h;

      // Check if this path is better
      const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openSet.push({
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: current,
        });
      }
    }

    // Safety limit to prevent infinite loops
    if (closedSet.size > 1000) {
      console.warn('Pathfinding: exceeded max iterations');
      return [];
    }
  }

  // No path found
  return [];
}

// Smooth path by removing unnecessary waypoints
export function smoothPath(path: Point[]): Point[] {
  if (path.length <= 2) return path;

  const smoothed: Point[] = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    // Check if direction changes
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    if (dx1 !== dx2 || dy1 !== dy2) {
      smoothed.push(curr);
    }
  }

  smoothed.push(path[path.length - 1]);
  return smoothed;
}

// Calculate distance between two points
export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Interpolate between two points
export function lerp(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

// Agent path state
export interface AgentPathState {
  agentId: string;
  path: Point[];
  currentIndex: number;
  progress: number; // 0-1 between current and next waypoint
  speed: number; // pixels per second
  isMoving: boolean;
}

// Create a new path state for an agent
export function createPathState(agentId: string, speed: number = 100): AgentPathState {
  return {
    agentId,
    path: [],
    currentIndex: 0,
    progress: 0,
    speed,
    isMoving: false,
  };
}

// Start agent moving to a destination
export function startPath(state: AgentPathState, from: Point, to: Point): boolean {
  const path = findPath(from, to);
  if (path.length === 0) {
    return false;
  }

  state.path = smoothPath(path);
  state.currentIndex = 0;
  state.progress = 0;
  state.isMoving = true;
  return true;
}

// Update agent position along path
export function updatePath(state: AgentPathState, deltaTime: number): Point | null {
  if (!state.isMoving || state.path.length === 0) {
    return null;
  }

  const current = state.path[state.currentIndex];
  const next = state.path[state.currentIndex + 1];

  if (!next) {
    // Reached destination
    state.isMoving = false;
    return current;
  }

  const segmentDistance = distance(current, next);
  const moveDistance = state.speed * deltaTime;
  state.progress += moveDistance / segmentDistance;

  if (state.progress >= 1) {
    // Move to next segment
    state.currentIndex++;
    state.progress = 0;

    if (state.currentIndex >= state.path.length - 1) {
      // Reached final destination
      state.isMoving = false;
      return state.path[state.path.length - 1];
    }
  }

  return lerp(current, next, Math.min(state.progress, 1));
}

// Stop agent movement
export function stopPath(state: AgentPathState): void {
  state.isMoving = false;
  state.path = [];
  state.currentIndex = 0;
  state.progress = 0;
}
