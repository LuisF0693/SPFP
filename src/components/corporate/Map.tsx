/**
 * Map Component
 * Wrapper para PhaserGame com integração de Context
 */

import React, { useEffect, useCallback } from 'react';
import { PhaserGame } from './phaser/PhaserGame';
import { useVirtualOffice } from '@/context/VirtualOfficeContext';

export function Map() {
  const { selectRoom, setHoveredRoom, rooms, openModal } = useVirtualOffice();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const rooms_list = [
        { id: 'estrategia', pos: { x: 0, y: 0 } },
        { id: 'ideacao', pos: { x: 1, y: 0 } },
        { id: 'producao', pos: { x: 0, y: 1 } },
        { id: 'design', pos: { x: 1, y: 1 } },
      ];

      // Find current selected position
      const currentRoom = rooms.find((r) => r.isActive);
      let currentPos = currentRoom
        ? rooms_list.find((r) => r.id === currentRoom.id)?.pos || { x: 0, y: 0 }
        : { x: 0, y: 0 };

      let nextPos = { ...currentPos };

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          nextPos.y = Math.max(0, nextPos.y - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextPos.y = Math.min(1, nextPos.y + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextPos.x = Math.max(0, nextPos.x - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPos.x = Math.min(1, nextPos.x + 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (currentRoom) {
            openModal(currentRoom.id);
          }
          return;
        default:
          return;
      }

      // Find room at new position
      const nextRoom = rooms_list.find((r) => r.pos.x === nextPos.x && r.pos.y === nextPos.y);
      if (nextRoom) {
        selectRoom(nextRoom.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rooms, selectRoom, openModal]);

  const handleRoomSelect = useCallback((roomId: string) => {
    selectRoom(roomId);
    // Double click to open, single click to select
    // We'll implement double-click separately
  }, [selectRoom]);

  const handleRoomHover = useCallback((roomId: string | null) => {
    setHoveredRoom(roomId);
  }, [setHoveredRoom]);

  return (
    <div className="w-full h-full">
      <PhaserGame
        onDepartmentClick={handleRoomSelect}
        className="w-full h-full"
        useVirtualOffice={true}
      />
    </div>
  );
}
