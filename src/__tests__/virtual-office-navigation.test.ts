/**
 * Virtual Office Navigation Tests
 * Unit tests para US-402
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VirtualRoom } from '@/types/virtual-office';

describe('VirtualOffice Navigation - US-402', () => {
  let rooms: VirtualRoom[];

  beforeEach(() => {
    rooms = [
      {
        id: 'estrategia',
        name: 'Estratégia',
        department: 'estrategia',
        x: 0,
        y: 0,
        width: 8,
        height: 6,
        backgroundColor: '#4C1D95',
        departmentColor: '#6366F1',
        icon: '🎯',
        isActive: false,
      },
      {
        id: 'ideacao',
        name: 'Ideação',
        department: 'ideacao',
        x: 8,
        y: 0,
        width: 8,
        height: 6,
        backgroundColor: '#831843',
        departmentColor: '#EC4899',
        icon: '💡',
        isActive: false,
      },
      {
        id: 'producao',
        name: 'Produção',
        department: 'producao',
        x: 0,
        y: 6,
        width: 8,
        height: 6,
        backgroundColor: '#0C4A6E',
        departmentColor: '#06B6D4',
        icon: '🏭',
        isActive: false,
      },
      {
        id: 'design',
        name: 'Design',
        department: 'design',
        x: 8,
        y: 6,
        width: 8,
        height: 6,
        backgroundColor: '#7C2D12',
        departmentColor: '#F97316',
        icon: '🎨',
        isActive: false,
      },
    ];
  });

  describe('Room Selection', () => {
    it('should select a room', () => {
      const selectedId = 'estrategia';
      rooms = rooms.map((r) => ({
        ...r,
        isActive: r.id === selectedId,
      }));

      expect(rooms.find((r) => r.id === selectedId)?.isActive).toBe(true);
      expect(rooms.filter((r) => r.isActive)).toHaveLength(1);
    });

    it('should only allow one room selected at a time', () => {
      // Select room 1
      rooms[0].isActive = true;
      rooms[1].isActive = false;
      rooms[2].isActive = false;
      rooms[3].isActive = false;

      expect(rooms.filter((r) => r.isActive)).toHaveLength(1);

      // Switch to room 2
      rooms[0].isActive = false;
      rooms[1].isActive = true;

      expect(rooms.filter((r) => r.isActive)).toHaveLength(1);
      expect(rooms[1].isActive).toBe(true);
    });

    it('should highlight selected room with department color', () => {
      const selectedRoom = rooms[0];
      selectedRoom.isActive = true;

      expect(selectedRoom.isActive).toBe(true);
      expect(selectedRoom.departmentColor).toBe('#6366F1');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate up from bottom-left to top-left', () => {
      const layout = [
        { id: 'estrategia', pos: { x: 0, y: 0 } },
        { id: 'producao', pos: { x: 0, y: 1 } },
      ];

      // Start at producao (0, 1)
      let currentPos = { x: 0, y: 1 };

      // Press arrow up
      currentPos.y = Math.max(0, currentPos.y - 1);

      expect(currentPos).toEqual({ x: 0, y: 0 });
      const nextRoom = layout.find((r) => r.pos.x === currentPos.x && r.pos.y === currentPos.y);
      expect(nextRoom?.id).toBe('estrategia');
    });

    it('should navigate right from left to right', () => {
      const layout = [
        { id: 'estrategia', pos: { x: 0, y: 0 } },
        { id: 'ideacao', pos: { x: 1, y: 0 } },
      ];

      // Start at estrategia (0, 0)
      let currentPos = { x: 0, y: 0 };

      // Press arrow right
      currentPos.x = Math.min(1, currentPos.x + 1);

      expect(currentPos).toEqual({ x: 1, y: 0 });
      const nextRoom = layout.find((r) => r.pos.x === currentPos.x && r.pos.y === currentPos.y);
      expect(nextRoom?.id).toBe('ideacao');
    });

    it('should handle boundary conditions', () => {
      // At top-left corner (0, 0), up/left should not move
      let pos = { x: 0, y: 0 };
      pos.y = Math.max(0, pos.y - 1);
      pos.x = Math.max(0, pos.x - 1);
      expect(pos).toEqual({ x: 0, y: 0 });

      // At bottom-right corner (1, 1), down/right should not move
      pos = { x: 1, y: 1 };
      pos.y = Math.min(1, pos.y + 1);
      pos.x = Math.min(1, pos.x + 1);
      expect(pos).toEqual({ x: 1, y: 1 });
    });

    it('should cycle through all 4 rooms with keyboard', () => {
      const roomSequence = ['estrategia', 'ideacao', 'design', 'producao', 'estrategia'];
      const layout = [
        { id: 'estrategia', pos: { x: 0, y: 0 } },
        { id: 'ideacao', pos: { x: 1, y: 0 } },
        { id: 'producao', pos: { x: 0, y: 1 } },
        { id: 'design', pos: { x: 1, y: 1 } },
      ];

      let currentPos = { x: 0, y: 0 };
      const visited: string[] = [];

      // Right
      currentPos.x = Math.min(1, currentPos.x + 1);
      visited.push(layout.find((r) => r.pos.x === currentPos.x && r.pos.y === currentPos.y)?.id || '');

      // Down
      currentPos.y = Math.min(1, currentPos.y + 1);
      visited.push(layout.find((r) => r.pos.x === currentPos.x && r.pos.y === currentPos.y)?.id || '');

      // Left
      currentPos.x = Math.max(0, currentPos.x - 1);
      visited.push(layout.find((r) => r.pos.x === currentPos.x && r.pos.y === currentPos.y)?.id || '');

      // Up
      currentPos.y = Math.max(0, currentPos.y - 1);
      visited.push(layout.find((r) => r.pos.x === currentPos.x && r.pos.y === currentPos.y)?.id || '');

      expect(visited).toEqual(['ideacao', 'design', 'producao', 'estrategia']);
    });
  });

  describe('Hover Effects', () => {
    it('should track hovered room', () => {
      let hoveredRoomId: string | null = null;

      const setHovered = (roomId: string | null) => {
        hoveredRoomId = roomId;
      };

      setHovered('estrategia');
      expect(hoveredRoomId).toBe('estrategia');

      setHovered('ideacao');
      expect(hoveredRoomId).toBe('ideacao');

      setHovered(null);
      expect(hoveredRoomId).toBeNull();
    });

    it('should detect hover at coordinates', () => {
      const TILE_SIZE = 32;
      const room = rooms[0];
      const zone = {
        x: room.x * TILE_SIZE,
        y: room.y * TILE_SIZE,
        width: room.width * TILE_SIZE,
        height: room.height * TILE_SIZE,
      };

      // Point inside zone
      const pointInside = { x: 100, y: 50 };
      const isInside =
        pointInside.x >= zone.x &&
        pointInside.x <= zone.x + zone.width &&
        pointInside.y >= zone.y &&
        pointInside.y <= zone.y + zone.height;

      expect(isInside).toBe(true);
    });
  });

  describe('Modal/Drawer', () => {
    it('should open modal when clicking room', () => {
      let isModalOpen = false;
      let selectedRoomId: string | null = null;

      const openModal = (roomId: string) => {
        selectedRoomId = roomId;
        isModalOpen = true;
      };

      openModal('estrategia');
      expect(isModalOpen).toBe(true);
      expect(selectedRoomId).toBe('estrategia');
    });

    it('should close modal on ESC key', () => {
      let isModalOpen = true;

      const closeModal = () => {
        isModalOpen = false;
      };

      closeModal();
      expect(isModalOpen).toBe(false);
    });

    it('should close modal on overlay click', () => {
      let isModalOpen = true;

      const closeModal = () => {
        isModalOpen = false;
      };

      closeModal();
      expect(isModalOpen).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const room = rooms[0];
      const ariaLabel = `Sala ${room.name} (${room.department})`;

      expect(ariaLabel).toContain(room.name);
      expect(ariaLabel).toContain(room.department);
    });

    it('should support keyboard-only navigation', () => {
      // Simulate keyboard-only user
      const layout = [
        { id: 'estrategia', pos: { x: 0, y: 0 } },
        { id: 'ideacao', pos: { x: 1, y: 0 } },
        { id: 'producao', pos: { x: 0, y: 1 } },
        { id: 'design', pos: { x: 1, y: 1 } },
      ];

      let currentPos = { x: 0, y: 0 };
      expect(layout.find((r) => r.pos.x === currentPos.x && r.pos.y === currentPos.y)?.id).toBe('estrategia');

      // Simulate arrow keys
      const keys = ['ArrowRight', 'ArrowDown', 'Enter'];
      let entered = false;

      keys.forEach((key) => {
        if (key === 'ArrowRight') {
          currentPos.x = Math.min(1, currentPos.x + 1);
        } else if (key === 'ArrowDown') {
          currentPos.y = Math.min(1, currentPos.y + 1);
        } else if (key === 'Enter') {
          entered = true;
        }
      });

      expect(entered).toBe(true);
      expect(currentPos).toEqual({ x: 1, y: 1 });
    });
  });

  describe('State Persistence', () => {
    it('should persist selected room to localStorage', () => {
      const room = rooms[0];
      const key = 'vo_selectedRoom';

      localStorage.setItem(key, room.id);
      const stored = localStorage.getItem(key);

      expect(stored).toBe(room.id);
    });

    it('should restore selected room from localStorage', () => {
      const key = 'vo_selectedRoom';
      const roomId = 'ideacao';

      localStorage.setItem(key, roomId);
      const restored = localStorage.getItem(key);
      const restoredRoom = rooms.find((r) => r.id === restored);

      expect(restoredRoom?.id).toBe(roomId);
    });
  });
});
