// Pixel Art Virtual Office - TileMap Hook
import { useState, useEffect, useCallback } from 'react';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import officeMapData from '../assets/office-map.json';
import { TILE_SIZE, MAP_WIDTH_PX, MAP_HEIGHT_PX, type MapLayer, type MapObject } from '../types';

interface TileMapState {
  isLoaded: boolean;
  layers: MapLayer[];
  departments: MapObject[];
  spawnPoints: MapObject[];
  furniture: MapObject[];
}

interface UseTileMapReturn extends TileMapState {
  renderMap: (container: Container) => void;
  getSpawnPoint: (agentName: string) => { x: number; y: number } | null;
  getDepartmentAt: (x: number, y: number) => MapObject | null;
}

// Color mapping for departments
const DEPARTMENT_COLORS: Record<string, number> = {
  '#FF8C42': 0xff8c42, // Product - Orange
  '#4A90D9': 0x4a90d9, // Engineering - Blue
  '#50C878': 0x50c878, // Quality - Green
  '#E91E63': 0xe91e63, // Design - Pink
  '#E74C3C': 0xe74c3c, // Analytics - Red
  '#9B59B6': 0x9b59b6, // Operations - Purple
};

// Floor tile patterns (pixel art style)
const FLOOR_COLORS = {
  base: 0x2d2d44,
  carpet: 0x3d3d5c,
  wood: 0x8b7355,
  highlight: 0x4a4a6a,
};

export function useTileMap(): UseTileMapReturn {
  const [state, setState] = useState<TileMapState>({
    isLoaded: false,
    layers: [],
    departments: [],
    spawnPoints: [],
    furniture: [],
  });

  // Load map data
  useEffect(() => {
    const mapData = officeMapData as {
      width: number;
      height: number;
      layers: MapLayer[];
    };

    const departments = mapData.layers
      .find(l => l.name === 'departments')
      ?.objects?.filter(o => o.type === 'department' || o.type === 'common') || [];

    const spawnPoints = mapData.layers
      .find(l => l.name === 'spawn_points')
      ?.objects || [];

    const furniture = mapData.layers
      .find(l => l.name === 'furniture')
      ?.objects || [];

    setState({
      isLoaded: true,
      layers: mapData.layers,
      departments,
      spawnPoints,
      furniture,
    });
  }, []);

  // Render the map to a Pixi container
  const renderMap = useCallback((container: Container) => {
    // Clear existing children
    container.removeChildren();

    // 1. Render base floor
    const floor = new Graphics();
    floor.rect(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
    floor.fill(FLOOR_COLORS.base);
    container.addChild(floor);

    // 2. Render tile grid (subtle)
    const grid = new Graphics();
    grid.setStrokeStyle({ width: 1, color: FLOOR_COLORS.highlight, alpha: 0.15 });

    for (let x = 0; x <= MAP_WIDTH_PX; x += TILE_SIZE) {
      grid.moveTo(x, 0);
      grid.lineTo(x, MAP_HEIGHT_PX);
    }
    for (let y = 0; y <= MAP_HEIGHT_PX; y += TILE_SIZE) {
      grid.moveTo(0, y);
      grid.lineTo(MAP_WIDTH_PX, y);
    }
    grid.stroke();
    container.addChild(grid);

    // 3. Render departments
    state.departments.forEach(dept => {
      const deptContainer = new Container();
      deptContainer.label = `dept_${dept.name}`;

      const color = dept.properties?.color
        ? DEPARTMENT_COLORS[dept.properties.color as string] || 0x4a4a6a
        : 0x4a4a6a;

      // Department floor with gradient effect
      const deptFloor = new Graphics();

      // Outer glow
      deptFloor.rect(dept.x, dept.y, dept.width, dept.height);
      deptFloor.fill({ color, alpha: 0.08 });

      // Inner area (slightly brighter)
      deptFloor.rect(dept.x + 8, dept.y + 8, dept.width - 16, dept.height - 16);
      deptFloor.fill({ color, alpha: 0.12 });

      // Border
      deptFloor.rect(dept.x + 2, dept.y + 2, dept.width - 4, dept.height - 4);
      deptFloor.stroke({ width: 2, color, alpha: 0.4 });

      deptContainer.addChild(deptFloor);

      // Department label
      const label = dept.properties?.label as string || dept.name.toUpperCase();
      const labelStyle = new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: dept.type === 'department' ? 11 : 10,
        fill: dept.type === 'department' ? color : 0x6a6a8a,
        fontWeight: 'bold',
        letterSpacing: 1,
      });

      const labelText = new Text({ text: label, style: labelStyle });
      labelText.x = dept.x + dept.width / 2 - labelText.width / 2;
      labelText.y = dept.y + (dept.type === 'department' ? 20 : dept.height / 2 - labelText.height / 2);
      deptContainer.addChild(labelText);

      // Corner decorations for departments
      if (dept.type === 'department') {
        const corners = new Graphics();
        const cornerSize = 8;

        // Top-left
        corners.moveTo(dept.x + 4, dept.y + 4 + cornerSize);
        corners.lineTo(dept.x + 4, dept.y + 4);
        corners.lineTo(dept.x + 4 + cornerSize, dept.y + 4);

        // Top-right
        corners.moveTo(dept.x + dept.width - 4 - cornerSize, dept.y + 4);
        corners.lineTo(dept.x + dept.width - 4, dept.y + 4);
        corners.lineTo(dept.x + dept.width - 4, dept.y + 4 + cornerSize);

        // Bottom-left
        corners.moveTo(dept.x + 4, dept.y + dept.height - 4 - cornerSize);
        corners.lineTo(dept.x + 4, dept.y + dept.height - 4);
        corners.lineTo(dept.x + 4 + cornerSize, dept.y + dept.height - 4);

        // Bottom-right
        corners.moveTo(dept.x + dept.width - 4 - cornerSize, dept.y + dept.height - 4);
        corners.lineTo(dept.x + dept.width - 4, dept.y + dept.height - 4);
        corners.lineTo(dept.x + dept.width - 4, dept.y + dept.height - 4 - cornerSize);

        corners.stroke({ width: 2, color, alpha: 0.6 });
        deptContainer.addChild(corners);
      }

      container.addChild(deptContainer);
    });

    // 4. Render furniture (placeholder graphics)
    state.furniture.forEach(item => {
      const furnitureGraphic = new Graphics();

      switch (item.type) {
        case 'desk':
          // Desk with monitor
          furnitureGraphic.rect(item.x, item.y, item.width, item.height);
          furnitureGraphic.fill(0x5c4a3d); // Dark wood
          furnitureGraphic.stroke({ width: 1, color: 0x3d3229 });

          // Monitor
          furnitureGraphic.rect(item.x + item.width / 2 - 12, item.y - 8, 24, 16);
          furnitureGraphic.fill(0x2a2a3a);
          furnitureGraphic.stroke({ width: 1, color: 0x1a1a2a });

          // Screen glow
          furnitureGraphic.rect(item.x + item.width / 2 - 10, item.y - 6, 20, 12);
          furnitureGraphic.fill(0x4a90d9, 0.3);
          break;

        case 'sofa':
          // Sofa
          furnitureGraphic.roundRect(item.x, item.y, item.width, item.height, 8);
          furnitureGraphic.fill(0x6b5b95);
          furnitureGraphic.stroke({ width: 2, color: 0x4a4a6a });

          // Cushions
          furnitureGraphic.roundRect(item.x + 8, item.y + 8, 32, 32, 4);
          furnitureGraphic.fill(0x7b6ba5);
          furnitureGraphic.roundRect(item.x + 48, item.y + 8, 32, 32, 4);
          furnitureGraphic.fill(0x7b6ba5);
          break;

        case 'table':
          // Meeting table
          furnitureGraphic.roundRect(item.x, item.y, item.width, item.height, 4);
          furnitureGraphic.fill(0x4a3d2d);
          furnitureGraphic.stroke({ width: 2, color: 0x3d3229 });
          break;

        case 'decoration':
          // Plant
          // Pot
          furnitureGraphic.rect(item.x + 8, item.y + 16, 16, 16);
          furnitureGraphic.fill(0x8b4513);

          // Leaves
          furnitureGraphic.circle(item.x + 16, item.y + 12, 10);
          furnitureGraphic.fill(0x228b22);
          furnitureGraphic.circle(item.x + 12, item.y + 8, 6);
          furnitureGraphic.fill(0x32cd32);
          furnitureGraphic.circle(item.x + 20, item.y + 8, 6);
          furnitureGraphic.fill(0x32cd32);
          break;

        case 'coffee':
          // Coffee machine body
          furnitureGraphic.roundRect(item.x, item.y + 8, item.width, item.height - 8, 3);
          furnitureGraphic.fill(0x2a2a2a);
          furnitureGraphic.stroke({ width: 1, color: 0x1a1a1a });
          // Water tank (top)
          furnitureGraphic.roundRect(item.x + 4, item.y, item.width - 8, 12, 2);
          furnitureGraphic.fill(0x87ceeb, 0.5);
          // Display light
          furnitureGraphic.circle(item.x + item.width / 2, item.y + 18, 3);
          furnitureGraphic.fill(0x00ff00);
          // Drip tray
          furnitureGraphic.rect(item.x + 2, item.y + item.height - 6, item.width - 4, 4);
          furnitureGraphic.fill(0x3d3d3d);
          break;

        case 'water':
          // Water cooler
          // Bottle (top)
          furnitureGraphic.roundRect(item.x + 2, item.y, item.width - 4, 16, 4);
          furnitureGraphic.fill(0x87ceeb, 0.6);
          furnitureGraphic.stroke({ width: 1, color: 0x5cacee });
          // Body
          furnitureGraphic.roundRect(item.x, item.y + 14, item.width, item.height - 18, 2);
          furnitureGraphic.fill(0xf0f0f0);
          furnitureGraphic.stroke({ width: 1, color: 0xcccccc });
          // Tap
          furnitureGraphic.rect(item.x + item.width / 2 - 3, item.y + 22, 6, 4);
          furnitureGraphic.fill(0x4a90d9);
          break;

        case 'whiteboard':
          // Frame
          furnitureGraphic.rect(item.x, item.y, item.width, item.height);
          furnitureGraphic.fill(0x8b7355);
          // Board surface
          furnitureGraphic.rect(item.x + 2, item.y + 2, item.width - 4, item.height - 4);
          furnitureGraphic.fill(0xffffff);
          // Some scribbles
          furnitureGraphic.setStrokeStyle({ width: 1, color: 0x333333 });
          furnitureGraphic.moveTo(item.x + 6, item.y + 10);
          furnitureGraphic.lineTo(item.x + 16, item.y + 10);
          furnitureGraphic.moveTo(item.x + 6, item.y + 18);
          furnitureGraphic.lineTo(item.x + 14, item.y + 18);
          furnitureGraphic.moveTo(item.x + 6, item.y + 26);
          furnitureGraphic.lineTo(item.x + 18, item.y + 26);
          furnitureGraphic.stroke();
          // Marker tray
          furnitureGraphic.rect(item.x + 2, item.y + item.height - 4, item.width - 4, 4);
          furnitureGraphic.fill(0x6b6b6b);
          break;

        case 'bookshelf':
          // Shelf frame
          furnitureGraphic.rect(item.x, item.y, item.width, item.height);
          furnitureGraphic.fill(0x5c4a3d);
          furnitureGraphic.stroke({ width: 1, color: 0x3d3229 });
          // Shelves (4 levels)
          for (let i = 0; i < 4; i++) {
            const shelfY = item.y + 10 + i * 14;
            furnitureGraphic.rect(item.x + 2, shelfY, item.width - 4, 2);
            furnitureGraphic.fill(0x4a3d2d);
            // Books
            for (let j = 0; j < 3; j++) {
              const bookColor = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6][Math.floor(Math.random() * 5)];
              furnitureGraphic.rect(item.x + 4 + j * 10, shelfY - 10, 8, 10);
              furnitureGraphic.fill(bookColor);
            }
          }
          break;

        case 'printer':
          // Printer body
          furnitureGraphic.roundRect(item.x, item.y + 8, item.width, item.height - 8, 3);
          furnitureGraphic.fill(0x2a2a2a);
          furnitureGraphic.stroke({ width: 1, color: 0x1a1a1a });
          // Paper tray (top)
          furnitureGraphic.rect(item.x + 4, item.y, item.width - 8, 10);
          furnitureGraphic.fill(0xf5f5f5);
          // Output tray
          furnitureGraphic.rect(item.x + 2, item.y + item.height - 4, item.width - 4, 4);
          furnitureGraphic.fill(0x3d3d3d);
          // Status light
          furnitureGraphic.circle(item.x + item.width - 6, item.y + 14, 2);
          furnitureGraphic.fill(0x00ff00);
          break;

        case 'window':
          // Window frame
          furnitureGraphic.rect(item.x, item.y, item.width, item.height);
          furnitureGraphic.fill(0x5a5a6a);
          // Glass panes
          furnitureGraphic.rect(item.x + 2, item.y + 2, item.width - 4, item.height / 2 - 3);
          furnitureGraphic.fill(0x87ceeb, 0.4);
          furnitureGraphic.rect(item.x + 2, item.y + item.height / 2 + 1, item.width - 4, item.height / 2 - 3);
          furnitureGraphic.fill(0x87ceeb, 0.4);
          // Light glow effect
          furnitureGraphic.rect(item.x + 4, item.y + 4, item.width - 8, item.height - 8);
          furnitureGraphic.fill(0xfffacd, 0.2);
          break;

        case 'server':
          // Server rack
          furnitureGraphic.rect(item.x, item.y, item.width, item.height);
          furnitureGraphic.fill(0x1a1a1a);
          furnitureGraphic.stroke({ width: 1, color: 0x333333 });
          // Server units
          for (let i = 0; i < 4; i++) {
            const unitY = item.y + 4 + i * 11;
            furnitureGraphic.rect(item.x + 2, unitY, item.width - 4, 9);
            furnitureGraphic.fill(0x2a2a2a);
            // LEDs
            furnitureGraphic.circle(item.x + 6, unitY + 4, 2);
            furnitureGraphic.fill(i % 2 === 0 ? 0x00ff00 : 0x4a90d9);
            furnitureGraphic.circle(item.x + 12, unitY + 4, 2);
            furnitureGraphic.fill(0x00ff00);
          }
          break;
      }

      container.addChild(furnitureGraphic);
    });

    // 5. Add office boundary
    const boundary = new Graphics();
    boundary.rect(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
    boundary.stroke({ width: 4, color: 0x4a4a6a });
    container.addChild(boundary);

  }, [state.departments, state.furniture]);

  // Get spawn point for an agent
  const getSpawnPoint = useCallback((agentName: string): { x: number; y: number } | null => {
    const spawn = state.spawnPoints.find(
      sp => sp.name.toLowerCase() === agentName.toLowerCase()
    );
    return spawn ? { x: spawn.x, y: spawn.y } : null;
  }, [state.spawnPoints]);

  // Get department at a position
  const getDepartmentAt = useCallback((x: number, y: number): MapObject | null => {
    return state.departments.find(
      dept => x >= dept.x && x <= dept.x + dept.width &&
              y >= dept.y && y <= dept.y + dept.height
    ) || null;
  }, [state.departments]);

  return {
    ...state,
    renderMap,
    getSpawnPoint,
    getDepartmentAt,
  };
}

export default useTileMap;
