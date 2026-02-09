// Pixel Art Virtual Office - Camera Controls Hook
// Provides smooth camera transitions and keyboard shortcuts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Container } from 'pixi.js';
import { MAP_WIDTH_PX, MAP_HEIGHT_PX } from '../types';

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

interface UseCameraControlsProps {
  mainContainer: Container | null;
  viewportWidth: number;
  viewportHeight: number;
  minZoom?: number;
  maxZoom?: number;
}

interface UseCameraControlsReturn {
  position: { x: number; y: number };
  zoom: number;
  isDragging: boolean;
  // Smooth transitions
  panTo: (x: number, y: number, animate?: boolean) => void;
  zoomTo: (zoom: number, animate?: boolean) => void;
  centerOn: (x: number, y: number, animate?: boolean) => void;
  resetCamera: (animate?: boolean) => void;
  // Mouse handlers
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleWheel: (e: React.WheelEvent) => void;
  // Direct position update (for mini-map)
  setPosition: (x: number, y: number) => void;
}

const ANIMATION_DURATION = 300; // ms
const ZOOM_STEP = 0.1;

export function useCameraControls({
  mainContainer,
  viewportWidth,
  viewportHeight,
  minZoom = 0.5,
  maxZoom = 2.0,
}: UseCameraControlsProps): UseCameraControlsReturn {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const lastPosRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  // Calculate initial center position
  const getDefaultPosition = useCallback(() => ({
    x: viewportWidth / 2 - MAP_WIDTH_PX / 2,
    y: viewportHeight / 2 - MAP_HEIGHT_PX / 2,
  }), [viewportWidth, viewportHeight]);

  // Initialize position
  useEffect(() => {
    const defaultPos = getDefaultPosition();
    setPosition(defaultPos);
    if (mainContainer) {
      mainContainer.x = defaultPos.x;
      mainContainer.y = defaultPos.y;
    }
  }, [mainContainer, getDefaultPosition]);

  // Animate to target
  const animateTo = useCallback((
    targetState: Partial<CameraState>,
    duration: number = ANIMATION_DURATION
  ) => {
    if (!mainContainer) return;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startX = mainContainer.x;
    const startY = mainContainer.y;
    const startZoom = mainContainer.scale.x;
    const startTime = performance.now();

    const targetX = targetState.x ?? startX;
    const targetY = targetState.y ?? startY;
    const targetZoom = targetState.zoom ?? startZoom;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      const newX = startX + (targetX - startX) * eased;
      const newY = startY + (targetY - startY) * eased;
      const newZoom = startZoom + (targetZoom - startZoom) * eased;

      mainContainer.x = newX;
      mainContainer.y = newY;
      mainContainer.scale.set(newZoom);

      setPosition({ x: newX, y: newY });
      setZoom(newZoom);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [mainContainer]);

  // Pan to position
  const panTo = useCallback((x: number, y: number, animate = true) => {
    if (!mainContainer) return;

    if (animate) {
      animateTo({ x, y });
    } else {
      mainContainer.x = x;
      mainContainer.y = y;
      setPosition({ x, y });
    }
  }, [mainContainer, animateTo]);

  // Zoom to level
  const zoomTo = useCallback((newZoom: number, animate = true) => {
    if (!mainContainer) return;

    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

    if (animate) {
      animateTo({ zoom: clampedZoom });
    } else {
      mainContainer.scale.set(clampedZoom);
      setZoom(clampedZoom);
    }
  }, [mainContainer, minZoom, maxZoom, animateTo]);

  // Center on a point in the map
  const centerOn = useCallback((mapX: number, mapY: number, animate = true) => {
    const targetX = viewportWidth / 2 - mapX * zoom;
    const targetY = viewportHeight / 2 - mapY * zoom;
    panTo(targetX, targetY, animate);
  }, [viewportWidth, viewportHeight, zoom, panTo]);

  // Reset camera
  const resetCamera = useCallback((animate = true) => {
    const defaultPos = getDefaultPosition();
    if (animate) {
      animateTo({ x: defaultPos.x, y: defaultPos.y, zoom: 1 });
    } else {
      if (mainContainer) {
        mainContainer.x = defaultPos.x;
        mainContainer.y = defaultPos.y;
        mainContainer.scale.set(1);
      }
      setPosition(defaultPos);
      setZoom(1);
    }
  }, [mainContainer, getDefaultPosition, animateTo]);

  // Direct position update (for mini-map navigation)
  const setPositionDirect = useCallback((x: number, y: number) => {
    if (!mainContainer) return;
    mainContainer.x = x;
    mainContainer.y = y;
    setPosition({ x, y });
  }, [mainContainer]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !mainContainer) return;

    const deltaX = e.clientX - lastPosRef.current.x;
    const deltaY = e.clientY - lastPosRef.current.y;

    mainContainer.x += deltaX;
    mainContainer.y += deltaY;

    setPosition({ x: mainContainer.x, y: mainContainer.y });
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, mainContainer]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!mainContainer) return;

    const delta = -Math.sign(e.deltaY) * ZOOM_STEP;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));

    // Zoom towards mouse position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new position to keep mouse point stationary
    const zoomRatio = newZoom / zoom;
    const newX = mouseX - (mouseX - mainContainer.x) * zoomRatio;
    const newY = mouseY - (mouseY - mainContainer.y) * zoomRatio;

    mainContainer.x = newX;
    mainContainer.y = newY;
    mainContainer.scale.set(newZoom);

    setPosition({ x: newX, y: newY });
    setZoom(newZoom);
  }, [mainContainer, zoom, minZoom, maxZoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Home':
        case 'h':
          resetCamera(true);
          break;
        case '+':
        case '=':
          zoomTo(zoom + ZOOM_STEP, true);
          break;
        case '-':
        case '_':
          zoomTo(zoom - ZOOM_STEP, true);
          break;
        case '0':
          zoomTo(1, true);
          break;
        case 'ArrowLeft':
          panTo(position.x + 50, position.y, false);
          break;
        case 'ArrowRight':
          panTo(position.x - 50, position.y, false);
          break;
        case 'ArrowUp':
          panTo(position.x, position.y + 50, false);
          break;
        case 'ArrowDown':
          panTo(position.x, position.y - 50, false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetCamera, zoomTo, panTo, zoom, position]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    position,
    zoom,
    isDragging,
    panTo,
    zoomTo,
    centerOn,
    resetCamera,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    setPosition: setPositionDirect,
  };
}

export default useCameraControls;
