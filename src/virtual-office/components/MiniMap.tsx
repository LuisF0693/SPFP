// AIOS Virtual Office - Mini Map Component
import { useCallback, useMemo } from 'react';
import { useVirtualOfficeStore, CAMERA_CONFIG } from '../store/virtualOfficeStore';
import { DEPARTMENTS, DEPARTMENT_COLORS } from '../data/agents';
import type { Department, AgentState } from '../types';

interface MiniMapProps {
  agents: Record<string, AgentState>;
  containerWidth: number;
  containerHeight: number;
}

export function MiniMap({ agents, containerWidth, containerHeight }: MiniMapProps) {
  const { camera, setCameraPosition } = useVirtualOfficeStore();

  // Mini map dimensions (fixed size)
  const MINIMAP_WIDTH = 180;
  const MINIMAP_HEIGHT = 100;
  const MINIMAP_PADDING = 8;

  // Scale factor from office to minimap
  const scaleX = MINIMAP_WIDTH / CAMERA_CONFIG.OFFICE_WIDTH;
  const scaleY = MINIMAP_HEIGHT / CAMERA_CONFIG.OFFICE_HEIGHT;

  // Calculate viewport rectangle on minimap
  const viewport = useMemo(() => {
    const viewportWidth = containerWidth / camera.zoom;
    const viewportHeight = containerHeight / camera.zoom;

    // Convert camera position to minimap coordinates
    // Camera position is the offset, so we need to invert it
    const offsetX = (-camera.position.x / camera.zoom) * scaleX;
    const offsetY = (-camera.position.y / camera.zoom) * scaleY;

    return {
      x: (CAMERA_CONFIG.OFFICE_WIDTH / 2 - viewportWidth / 2) * scaleX + offsetX,
      y: (CAMERA_CONFIG.OFFICE_HEIGHT / 2 - viewportHeight / 2) * scaleY + offsetY,
      width: viewportWidth * scaleX,
      height: viewportHeight * scaleY
    };
  }, [camera.position, camera.zoom, containerWidth, containerHeight, scaleX, scaleY]);

  // Handle click on minimap to navigate
  const handleMiniMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left - MINIMAP_PADDING;
    const clickY = e.clientY - rect.top - MINIMAP_PADDING;

    // Convert click position to office coordinates
    const officeX = clickX / scaleX;
    const officeY = clickY / scaleY;

    // Calculate new camera position to center on clicked point
    const newPosition = {
      x: -(officeX - CAMERA_CONFIG.OFFICE_WIDTH / 2) * camera.zoom,
      y: -(officeY - CAMERA_CONFIG.OFFICE_HEIGHT / 2) * camera.zoom
    };

    setCameraPosition(newPosition);
  }, [scaleX, scaleY, camera.zoom, setCameraPosition]);

  // Render department areas on minimap
  const departmentAreas = useMemo(() => {
    return (Object.entries(DEPARTMENTS) as [Department, typeof DEPARTMENTS[Department]][]).map(
      ([dept, config]) => {
        const colors = DEPARTMENT_COLORS[dept];
        return (
          <div
            key={dept}
            className="absolute rounded-sm opacity-60"
            style={{
              left: config.bounds.x * scaleX,
              top: config.bounds.y * scaleY,
              width: config.bounds.w * scaleX,
              height: config.bounds.h * scaleY,
              background: colors.primary + '40'
            }}
          />
        );
      }
    );
  }, [scaleX, scaleY]);

  // Render agent dots on minimap
  const agentDots = useMemo(() => {
    return Object.values(agents).map((agent) => {
      const isWorking = agent.status === 'working' || agent.status === 'thinking';
      return (
        <div
          key={agent.id}
          className={`absolute w-2 h-2 rounded-full transition-all ${
            isWorking ? 'animate-pulse' : ''
          }`}
          style={{
            left: agent.position.x * scaleX - 4,
            top: agent.position.y * scaleY - 4,
            background: isWorking ? '#22c55e' : '#6b7280'
          }}
          title={`${agent.name} - ${agent.status}`}
        />
      );
    });
  }, [agents, scaleX, scaleY]);

  return (
    <div
      className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl overflow-hidden z-50"
      style={{
        width: MINIMAP_WIDTH + MINIMAP_PADDING * 2,
        height: MINIMAP_HEIGHT + MINIMAP_PADDING * 2 + 24 // Extra space for header
      }}
    >
      {/* Header */}
      <div className="px-2 py-1 bg-gray-800/80 border-b border-gray-700/50">
        <span className="text-xs text-gray-400 font-medium">Mini Map</span>
        <span className="text-xs text-gray-500 ml-2">
          {Math.round(camera.zoom * 100)}%
        </span>
      </div>

      {/* Map Content */}
      <div
        className="relative cursor-pointer hover:bg-gray-800/30 transition-colors"
        style={{
          width: MINIMAP_WIDTH,
          height: MINIMAP_HEIGHT,
          margin: MINIMAP_PADDING
        }}
        onClick={handleMiniMapClick}
      >
        {/* Office background */}
        <div className="absolute inset-0 bg-gray-800/50 rounded" />

        {/* Department areas */}
        {departmentAreas}

        {/* Agent dots */}
        {agentDots}

        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-cyan-400/80 bg-cyan-400/10 rounded-sm pointer-events-none transition-all duration-75"
          style={{
            left: Math.max(0, Math.min(MINIMAP_WIDTH - viewport.width, viewport.x)),
            top: Math.max(0, Math.min(MINIMAP_HEIGHT - viewport.height, viewport.y)),
            width: Math.min(MINIMAP_WIDTH, viewport.width),
            height: Math.min(MINIMAP_HEIGHT, viewport.height)
          }}
        />
      </div>
    </div>
  );
}

export default MiniMap;
