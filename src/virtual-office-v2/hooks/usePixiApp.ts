// Pixel Art Virtual Office - Pixi Application Hook
import { useRef, useEffect, useState, useCallback } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { MAP_WIDTH_PX, MAP_HEIGHT_PX, TILE_SIZE, DEPARTMENT_COLORS, type Department } from '../types';

interface UsePixiAppOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
}

interface UsePixiAppReturn {
  canvasRef: React.RefObject<HTMLDivElement>;
  app: Application | null;
  mainContainer: Container | null;
  isReady: boolean;
  fps: number;
  // Camera controls
  panTo: (x: number, y: number) => void;
  zoomTo: (zoom: number) => void;
  resetCamera: () => void;
}

export function usePixiApp(options: UsePixiAppOptions = {}): UsePixiAppReturn {
  const {
    width = 1200,
    height = 800,
    backgroundColor = 0x1a1a2e,
  } = options;

  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const mainContainerRef = useRef<Container | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fps, setFps] = useState(60);

  // Camera state
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

  // Initialize Pixi
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    let app: Application | null = null;

    const init = async () => {
      app = new Application();

      await app.init({
        width,
        height,
        backgroundColor,
        antialias: false,
        resolution: 1,
        autoDensity: true,
        powerPreference: 'high-performance',
      });

      // Apply pixel art rendering
      const canvas = app.canvas as HTMLCanvasElement;
      canvas.style.imageRendering = 'pixelated';

      if (canvasRef.current) {
        canvasRef.current.appendChild(canvas);
      }

      // Create main container
      const mainContainer = new Container();
      mainContainer.label = 'OfficeContainer';

      // Center the office in the viewport
      mainContainer.x = width / 2 - MAP_WIDTH_PX / 2;
      mainContainer.y = height / 2 - MAP_HEIGHT_PX / 2;

      app.stage.addChild(mainContainer);

      // Create placeholder content for POC
      createPlaceholderOffice(mainContainer);

      appRef.current = app;
      mainContainerRef.current = mainContainer;

      // FPS tracking
      app.ticker.add(() => {
        setFps(Math.round(app!.ticker.FPS));
      });

      setIsReady(true);
    };

    init();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
        mainContainerRef.current = null;
        setIsReady(false);
      }
    };
  }, [width, height, backgroundColor]);

  // Camera controls
  const panTo = useCallback((x: number, y: number) => {
    if (!mainContainerRef.current) return;
    cameraRef.current.x = x;
    cameraRef.current.y = y;
    mainContainerRef.current.x = x;
    mainContainerRef.current.y = y;
  }, []);

  const zoomTo = useCallback((zoom: number) => {
    if (!mainContainerRef.current) return;
    const clampedZoom = Math.max(0.5, Math.min(2, zoom));
    cameraRef.current.zoom = clampedZoom;
    mainContainerRef.current.scale.set(clampedZoom);
  }, []);

  const resetCamera = useCallback(() => {
    if (!mainContainerRef.current) return;
    cameraRef.current = { x: 0, y: 0, zoom: 1 };
    mainContainerRef.current.x = (width / 2) - (MAP_WIDTH_PX / 2);
    mainContainerRef.current.y = (height / 2) - (MAP_HEIGHT_PX / 2);
    mainContainerRef.current.scale.set(1);
  }, [width, height]);

  return {
    canvasRef,
    app: appRef.current,
    mainContainer: mainContainerRef.current,
    isReady,
    fps,
    panTo,
    zoomTo,
    resetCamera,
  };
}

/**
 * Create placeholder office for POC visualization
 */
function createPlaceholderOffice(container: Container): void {
  // Office background
  const bg = new Graphics();
  bg.rect(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
  bg.fill(0x2d2d44); // Dark floor
  bg.stroke({ width: 4, color: 0x4a4a6a });
  container.addChild(bg);

  // Grid lines (tile boundaries)
  const grid = new Graphics();
  grid.setStrokeStyle({ width: 1, color: 0x3d3d5c, alpha: 0.3 });

  // Vertical lines
  for (let x = 0; x <= MAP_WIDTH_PX; x += TILE_SIZE) {
    grid.moveTo(x, 0);
    grid.lineTo(x, MAP_HEIGHT_PX);
  }

  // Horizontal lines
  for (let y = 0; y <= MAP_HEIGHT_PX; y += TILE_SIZE) {
    grid.moveTo(0, y);
    grid.lineTo(MAP_WIDTH_PX, y);
  }
  grid.stroke();
  container.addChild(grid);

  // Department areas
  const departments: { dept: Department; x: number; y: number; w: number; h: number }[] = [
    { dept: 'product', x: 0, y: 320, w: 320, h: 320 },
    { dept: 'engineering', x: 320, y: 320, w: 320, h: 320 },
    { dept: 'quality', x: 640, y: 320, w: 320, h: 320 },
    { dept: 'design', x: 0, y: 640, w: 320, h: 320 },
    { dept: 'operations', x: 640, y: 640, w: 320, h: 320 },
  ];

  departments.forEach(({ dept, x, y, w, h }) => {
    const colors = DEPARTMENT_COLORS[dept];

    // Department floor
    const floor = new Graphics();
    floor.rect(x + 4, y + 4, w - 8, h - 8);
    floor.fill({ color: colors.hex, alpha: 0.15 });
    floor.stroke({ width: 2, color: colors.hex, alpha: 0.4 });
    container.addChild(floor);

    // Department label
    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 14,
      fill: colors.hex,
      fontWeight: 'bold',
    });
    const label = new Text({ text: dept.toUpperCase(), style });
    label.x = x + w / 2 - label.width / 2;
    label.y = y + 16;
    container.addChild(label);
  });

  // Common areas labels
  const commonAreas = [
    { name: 'LOUNGE', x: 320, y: 0, w: 320, h: 160 },
    { name: 'MEETING ROOM', x: 640, y: 0, w: 320, h: 160 },
    { name: 'ENTRANCE', x: 0, y: 0, w: 320, h: 160 },
  ];

  commonAreas.forEach(({ name, x, y, w, h }) => {
    const area = new Graphics();
    area.rect(x + 4, y + 4, w - 8, h - 8);
    area.fill({ color: 0x4a4a6a, alpha: 0.2 });
    area.stroke({ width: 2, color: 0x5c5c7a, alpha: 0.4 });
    container.addChild(area);

    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 12,
      fill: 0x8a8aaa,
    });
    const label = new Text({ text: name, style });
    label.x = x + w / 2 - label.width / 2;
    label.y = y + h / 2 - label.height / 2;
    container.addChild(label);
  });

  // Placeholder agent dots
  const agentPositions: { name: string; x: number; y: number; color: number }[] = [
    { name: 'Dex', x: 400, y: 450, color: 0x4a90d9 },
    { name: 'Quinn', x: 720, y: 450, color: 0x50c878 },
    { name: 'Aria', x: 100, y: 750, color: 0x9b59b6 },
    { name: 'Morgan', x: 100, y: 450, color: 0xff8c42 },
    { name: 'Sophie', x: 200, y: 450, color: 0xe91e63 },
    { name: 'Max', x: 720, y: 750, color: 0xf1c40f },
    { name: 'Luna', x: 200, y: 750, color: 0x00bcd4 },
    { name: 'Atlas', x: 400, y: 750, color: 0xe74c3c },
    { name: 'Nova', x: 500, y: 450, color: 0x3f51b5 },
    { name: 'Gage', x: 400, y: 550, color: 0x607d8b },
  ];

  agentPositions.forEach(({ name, x, y, color }) => {
    // Agent circle (placeholder for sprite)
    const agent = new Graphics();
    agent.circle(0, 0, 16);
    agent.fill(color);
    agent.stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
    agent.x = x;
    agent.y = y;
    container.addChild(agent);

    // Agent name label
    const style = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 10,
      fill: 0xffffff,
    });
    const label = new Text({ text: name, style });
    label.x = x - label.width / 2;
    label.y = y - 30;
    container.addChild(label);

    // Idle animation (breathing effect)
    let time = Math.random() * Math.PI * 2;
    const ticker = agent.parent?.parent;
    // Note: Animation will be added in later sprints
  });

  // Title
  const titleStyle = new TextStyle({
    fontFamily: 'monospace',
    fontSize: 24,
    fill: 0xffffff,
    fontWeight: 'bold',
  });
  const title = new Text({ text: 'AIOS Virtual Office - Pixi.js POC', style: titleStyle });
  title.x = MAP_WIDTH_PX / 2 - title.width / 2;
  title.y = 200;
  container.addChild(title);

  const subtitleStyle = new TextStyle({
    fontFamily: 'monospace',
    fontSize: 14,
    fill: 0x888888,
  });
  const subtitle = new Text({ text: 'Sprint 0 - Setup Complete', style: subtitleStyle });
  subtitle.x = MAP_WIDTH_PX / 2 - subtitle.width / 2;
  subtitle.y = 240;
  container.addChild(subtitle);
}

export default usePixiApp;
