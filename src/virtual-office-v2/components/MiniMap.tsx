// Pixel Art Virtual Office - Mini Map Component
// Shows a small overview of the office with agent positions
import { useMemo } from 'react';
import { useVirtualOfficeStore } from '../../virtual-office/store/virtualOfficeStore';
import { useTileMap } from '../hooks/useTileMap';
import { AGENT_COLORS, MAP_WIDTH_PX, MAP_HEIGHT_PX, type AgentId } from '../types';

interface MiniMapProps {
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  onNavigate?: (x: number, y: number) => void;
}

const MINI_MAP_WIDTH = 160;
const MINI_MAP_HEIGHT = 120;

// Scale factor from real map to mini map
const SCALE_X = MINI_MAP_WIDTH / MAP_WIDTH_PX;
const SCALE_Y = MINI_MAP_HEIGHT / MAP_HEIGHT_PX;

export function MiniMap({
  viewportX,
  viewportY,
  viewportWidth,
  viewportHeight,
  zoom,
  onNavigate,
}: MiniMapProps) {
  const agents = useVirtualOfficeStore((state) => state.agents);
  const selectedAgentId = useVirtualOfficeStore((state) => state.selectedAgentId);
  const { departments, getSpawnPoint, isLoaded } = useTileMap();

  // Calculate viewport rectangle on mini map
  const viewportRect = useMemo(() => {
    // The viewport position is negative when panned right/down
    const offsetX = -(viewportX - (viewportWidth / 2 - MAP_WIDTH_PX / 2)) / zoom;
    const offsetY = -(viewportY - (viewportHeight / 2 - MAP_HEIGHT_PX / 2)) / zoom;

    return {
      x: offsetX * SCALE_X,
      y: offsetY * SCALE_Y,
      width: (viewportWidth / zoom) * SCALE_X,
      height: (viewportHeight / zoom) * SCALE_Y,
    };
  }, [viewportX, viewportY, viewportWidth, viewportHeight, zoom]);

  // Handle click to navigate
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onNavigate) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert mini map coords to real map coords
    const realX = clickX / SCALE_X;
    const realY = clickY / SCALE_Y;

    // Calculate new viewport position to center on clicked point
    const newViewportX = (viewportWidth / 2 - MAP_WIDTH_PX / 2) - (realX - MAP_WIDTH_PX / 2) * zoom;
    const newViewportY = (viewportHeight / 2 - MAP_HEIGHT_PX / 2) - (realY - MAP_HEIGHT_PX / 2) * zoom;

    onNavigate(newViewportX, newViewportY);
  };

  if (!isLoaded) return null;

  return (
    <div
      className="absolute top-4 left-4 rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-900/90 backdrop-blur-sm cursor-crosshair shadow-xl"
      style={{ width: MINI_MAP_WIDTH, height: MINI_MAP_HEIGHT }}
      onClick={handleClick}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: '#2d2d44' }}
      />

      {/* Departments */}
      {departments.map((dept) => {
        const color = dept.properties?.color as string || '#4a4a6a';
        return (
          <div
            key={dept.id}
            className="absolute border"
            style={{
              left: dept.x * SCALE_X,
              top: dept.y * SCALE_Y,
              width: dept.width * SCALE_X,
              height: dept.height * SCALE_Y,
              backgroundColor: `${color}33`,
              borderColor: `${color}66`,
            }}
          />
        );
      })}

      {/* Agents */}
      {Object.entries(agents).map(([agentId, agent]) => {
        const spawn = getSpawnPoint(agentId);
        if (!spawn) return null;

        const color = AGENT_COLORS[agentId as AgentId]?.primary || '#888888';
        const isSelected = selectedAgentId === agentId;

        return (
          <div
            key={agentId}
            className={`absolute rounded-full transition-all ${isSelected ? 'ring-2 ring-white' : ''}`}
            style={{
              left: spawn.x * SCALE_X - 3,
              top: spawn.y * SCALE_Y - 3,
              width: 6,
              height: 6,
              backgroundColor: color,
              boxShadow: agent.status === 'working' ? `0 0 4px ${color}` : 'none',
            }}
            title={agent.name}
          />
        );
      })}

      {/* Viewport rectangle */}
      <div
        className="absolute border-2 border-white/60 pointer-events-none"
        style={{
          left: Math.max(0, viewportRect.x),
          top: Math.max(0, viewportRect.y),
          width: Math.min(viewportRect.width, MINI_MAP_WIDTH - viewportRect.x),
          height: Math.min(viewportRect.height, MINI_MAP_HEIGHT - viewportRect.y),
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      />

      {/* Label */}
      <div className="absolute bottom-1 right-1 text-[8px] text-gray-500 font-mono">
        MAP
      </div>
    </div>
  );
}

export default MiniMap;
