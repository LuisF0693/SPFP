// Pixel Art Virtual Office - Pixi Application Hook
import { useRef, useEffect, useState, useCallback } from 'react';
import { Application, Container } from 'pixi.js';
import { MAP_WIDTH_PX, MAP_HEIGHT_PX } from '../types';
import { LightingOverlay, type TimeOfDay } from '../pixi/LightingOverlay';
import { useVirtualOfficeStore } from '../../virtual-office/store/virtualOfficeStore';

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
  timeOfDay: TimeOfDay;
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
  const lightingRef = useRef<LightingOverlay | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fps, setFps] = useState(60);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');

  // Get theme mode from store
  const themeMode = useVirtualOfficeStore((state) => state.themeMode);
  const getResolvedTheme = useVirtualOfficeStore((state) => state.getResolvedTheme);

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

      // Create agents container (on top of map, below lighting)
      const agentsContainer = new Container();
      agentsContainer.label = 'AgentsContainer';
      agentsContainer.sortableChildren = true; // Enable z-sorting for agents
      mainContainer.addChild(agentsContainer);

      // Create lighting overlay (on top of everything for visual effects)
      const lighting = new LightingOverlay(MAP_WIDTH_PX, MAP_HEIGHT_PX);
      mainContainer.addChild(lighting.getContainer());

      // Apply color filter to entire main container
      mainContainer.filters = [lighting.getFilter()];

      appRef.current = app;
      mainContainerRef.current = mainContainer;
      agentsContainerRef.current = agentsContainer;
      lightingRef.current = lighting;

      // Lighting update loop
      let lastTime = performance.now();
      app.ticker.add(() => {
        const now = performance.now();
        const delta = now - lastTime;
        lastTime = now;
        if (lightingRef.current) {
          lightingRef.current.update(delta);
        }
      });

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

  // Update lighting based on theme mode
  useEffect(() => {
    if (!lightingRef.current || !isReady) return;

    let newTimeOfDay: TimeOfDay;

    if (themeMode === 'auto') {
      // Use current hour to determine time of day
      const hour = new Date().getHours();
      newTimeOfDay = LightingOverlay.getTimeFromHour(hour);
    } else if (themeMode === 'night') {
      newTimeOfDay = 'night';
    } else {
      newTimeOfDay = 'day';
    }

    lightingRef.current.setTimeOfDay(newTimeOfDay, true);
    setTimeOfDay(newTimeOfDay);
  }, [themeMode, isReady, getResolvedTheme]);

  // Auto-update time of day when in auto mode
  useEffect(() => {
    if (themeMode !== 'auto' || !lightingRef.current) return;

    const updateTime = () => {
      const hour = new Date().getHours();
      const newTimeOfDay = LightingOverlay.getTimeFromHour(hour);
      if (lightingRef.current && newTimeOfDay !== lightingRef.current.getCurrentTime()) {
        lightingRef.current.setTimeOfDay(newTimeOfDay, true);
        setTimeOfDay(newTimeOfDay);
      }
    };

    // Check every minute
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [themeMode]);

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
    timeOfDay,
    panTo,
    zoomTo,
    resetCamera,
  };
}

export default usePixiApp;
