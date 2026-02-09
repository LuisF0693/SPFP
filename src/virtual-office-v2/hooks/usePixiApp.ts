// Pixel Art Virtual Office - Pixi Application Hook
import { useRef, useEffect, useState, useCallback } from 'react';
import { Application, Container } from 'pixi.js';
import { MAP_WIDTH_PX, MAP_HEIGHT_PX } from '../types';

interface UsePixiAppOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
  /** If true, skip creating placeholder content */
  skipPlaceholders?: boolean;
}

interface UsePixiAppReturn {
  canvasRef: React.RefObject<HTMLDivElement>;
  app: Application | null;
  mainContainer: Container | null;
  agentsContainer: Container | null;
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
    skipPlaceholders = false,
  } = options;

  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const mainContainerRef = useRef<Container | null>(null);
  const agentsContainerRef = useRef<Container | null>(null);
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

      // Create agents container (on top of everything)
      const agentsContainer = new Container();
      agentsContainer.label = 'AgentsContainer';
      agentsContainer.sortableChildren = true; // Enable z-sorting for agents
      mainContainer.addChild(agentsContainer);

      appRef.current = app;
      mainContainerRef.current = mainContainer;
      agentsContainerRef.current = agentsContainer;

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
        agentsContainerRef.current = null;
        setIsReady(false);
      }
    };
  }, [width, height, backgroundColor, skipPlaceholders]);

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
    agentsContainer: agentsContainerRef.current,
    isReady,
    fps,
    panTo,
    zoomTo,
    resetCamera,
  };
}

export default usePixiApp;
