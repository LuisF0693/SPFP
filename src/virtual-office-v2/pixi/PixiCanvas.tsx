// Pixel Art Virtual Office - Pixi.js Canvas Container
import { useCallback, useEffect, useRef, useState } from 'react';
import { Application, Container } from 'pixi.js';
import { MAP_WIDTH_PX, MAP_HEIGHT_PX } from '../types';

interface PixiCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: number;
  children?: (app: Application, container: Container) => React.ReactNode;
  onReady?: (app: Application) => void;
}

export function PixiCanvas({
  width = 1200,
  height = 800,
  backgroundColor = 0x1a1a2e,
  children,
  onReady,
}: PixiCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const containerRef = useRef<Container | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fps, setFps] = useState(60);

  // Initialize Pixi Application
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const initPixi = async () => {
      // Create Pixi Application
      const app = new Application();

      await app.init({
        width,
        height,
        backgroundColor,
        antialias: false, // Pixel art needs crisp edges
        resolution: 1,
        autoDensity: true,
        powerPreference: 'high-performance',
      });

      // Append canvas to container
      if (canvasRef.current) {
        canvasRef.current.appendChild(app.canvas as HTMLCanvasElement);
      }

      // Create main container for camera transforms
      const mainContainer = new Container();
      mainContainer.label = 'MainContainer';
      app.stage.addChild(mainContainer);

      // Store references
      appRef.current = app;
      containerRef.current = mainContainer;

      // FPS monitoring
      app.ticker.add(() => {
        setFps(Math.round(app.ticker.FPS));
      });

      setIsReady(true);
      onReady?.(app);
    };

    initPixi();

    // Cleanup
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
        containerRef.current = null;
      }
    };
  }, [width, height, backgroundColor, onReady]);

  // Handle resize
  useEffect(() => {
    if (!appRef.current) return;
    appRef.current.renderer.resize(width, height);
  }, [width, height]);

  return (
    <div className="pixi-canvas-container relative">
      {/* Canvas mount point */}
      <div
        ref={canvasRef}
        className="pixi-canvas"
        style={{
          width,
          height,
          imageRendering: 'pixelated', // Crisp pixel art
          cursor: 'grab',
        }}
      />

      {/* FPS Counter (dev mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-green-400 font-mono">
          {fps} FPS
        </div>
      )}

      {/* Ready indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-sm">Initializing Pixi.js...</div>
        </div>
      )}

      {/* Render children if ready */}
      {isReady && appRef.current && containerRef.current && children?.(appRef.current, containerRef.current)}
    </div>
  );
}

export default PixiCanvas;
