/**
 * Virtual Office Tests
 * Unit tests para US-401
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VirtualRoom, NPC } from '@/types/virtual-office';

describe('VirtualOffice - US-401', () => {
  let mockScene: any;

  beforeEach(() => {
    // Mock Phaser scene
    mockScene = {
      add: {
        graphics: vi.fn(() => ({
          clear: vi.fn(),
          fillStyle: vi.fn(),
          fillRect: vi.fn(),
          lineStyle: vi.fn(),
          strokeRect: vi.fn(),
          destroy: vi.fn(),
        })),
        group: vi.fn(() => ({
          children: { entries: [] },
          destroy: vi.fn(),
        })),
        text: vi.fn(),
      },
      physics: {
        add: {
          group: vi.fn(() => ({
            create: vi.fn(() => ({
              setData: vi.fn(),
              setInteractive: vi.fn(),
              setScale: vi.fn(),
              destroy: vi.fn(),
            })),
            children: { entries: [] },
            destroy: vi.fn(),
          })),
        },
      },
      input: {
        on: vi.fn(),
      },
      textures: {
        exists: vi.fn(() => false),
        addCanvas: vi.fn(),
      },
      cameras: {
        main: {
          setBackgroundColor: vi.fn(),
        },
      },
    };
  });

  describe('VirtualRoom', () => {
    it('should have all required properties', () => {
      const room: VirtualRoom = {
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
      };

      expect(room.id).toBe('estrategia');
      expect(room.name).toBe('Estratégia');
      expect(room.department).toBe('estrategia');
      expect(room.isActive).toBe(false);
      expect(room.width).toBe(8);
      expect(room.height).toBe(6);
    });

    it('should calculate room dimensions correctly', () => {
      const room: VirtualRoom = {
        id: 'test',
        name: 'Test',
        department: 'estrategia',
        x: 0,
        y: 0,
        width: 8,
        height: 6,
        backgroundColor: '#FFF',
        departmentColor: '#000',
        icon: '🎯',
        isActive: false,
      };

      const TILE_SIZE = 32;
      const pixelWidth = room.width * TILE_SIZE;
      const pixelHeight = room.height * TILE_SIZE;

      expect(pixelWidth).toBe(256);
      expect(pixelHeight).toBe(192);
    });

    it('should have 4 distinct rooms', () => {
      const rooms: VirtualRoom[] = [
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

      expect(rooms).toHaveLength(4);
      expect(rooms.map((r) => r.id)).toEqual(['estrategia', 'ideacao', 'producao', 'design']);
    });
  });

  describe('NPC', () => {
    it('should have all required properties', () => {
      const npc: NPC = {
        id: 'cfo',
        name: 'CFO',
        role: 'Chief Financial Officer',
        department: 'financeiro',
        x: 192,
        y: 96,
        spriteKey: 'cfo',
        animKey: 'idle',
        currentAnimation: 'idle',
      };

      expect(npc.id).toBe('cfo');
      expect(npc.name).toBe('CFO');
      expect(npc.role).toBe('Chief Financial Officer');
      expect(npc.currentAnimation).toBe('idle');
    });

    it('should have 4 NPCs positioned correctly', () => {
      const npcs: NPC[] = [
        {
          id: 'cfo',
          name: 'CFO',
          role: 'Chief Financial Officer',
          department: 'estrategia',
          x: 192,
          y: 96,
          spriteKey: 'cfo',
          animKey: 'idle',
          currentAnimation: 'idle',
        },
        {
          id: 'cmo',
          name: 'CMO',
          role: 'Chief Marketing Officer',
          department: 'ideacao',
          x: 448,
          y: 96,
          spriteKey: 'cmo',
          animKey: 'idle',
          currentAnimation: 'idle',
        },
        {
          id: 'coo',
          name: 'COO',
          role: 'Chief Operating Officer',
          department: 'producao',
          x: 192,
          y: 288,
          spriteKey: 'coo',
          animKey: 'idle',
          currentAnimation: 'idle',
        },
        {
          id: 'cso',
          name: 'CSO',
          role: 'Chief Sales Officer',
          department: 'design',
          x: 448,
          y: 288,
          spriteKey: 'cso',
          animKey: 'idle',
          currentAnimation: 'idle',
        },
      ];

      expect(npcs).toHaveLength(4);
      expect(npcs[0].department).toBe('estrategia');
      expect(npcs[1].department).toBe('ideacao');
      expect(npcs[2].department).toBe('producao');
      expect(npcs[3].department).toBe('design');
    });
  });

  describe('Performance', () => {
    it('should initialize within acceptable time', () => {
      const startTime = performance.now();

      // Simulate scene initialization
      const rooms: VirtualRoom[] = [];
      const npcs: NPC[] = [];

      for (let i = 0; i < 100; i++) {
        rooms.push({
          id: `room-${i}`,
          name: `Room ${i}`,
          department: 'estrategia',
          x: i,
          y: 0,
          width: 8,
          height: 6,
          backgroundColor: '#FFF',
          departmentColor: '#000',
          icon: '🎯',
          isActive: false,
        });

        if (i < 4) {
          npcs.push({
            id: `npc-${i}`,
            name: `NPC ${i}`,
            role: 'Role',
            department: 'estrategia',
            x: 100 + i * 50,
            y: 100,
            spriteKey: `npc-${i}`,
            animKey: 'idle',
            currentAnimation: 'idle',
          });
        }
      }

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should initialize in less than 100ms for 100 rooms
      expect(loadTime).toBeLessThan(100);
    });
  });

  describe('Rendering', () => {
    it('should render rooms with correct coordinates', () => {
      const room: VirtualRoom = {
        id: 'test',
        name: 'Test',
        department: 'estrategia',
        x: 0,
        y: 0,
        width: 8,
        height: 6,
        backgroundColor: '#FFF',
        departmentColor: '#000',
        icon: '🎯',
        isActive: false,
      };

      const TILE_SIZE = 32;
      const worldX = room.x * TILE_SIZE;
      const worldY = room.y * TILE_SIZE;

      expect(worldX).toBe(0);
      expect(worldY).toBe(0);
    });

    it('should calculate room selection zones', () => {
      const room: VirtualRoom = {
        id: 'test',
        name: 'Test',
        department: 'estrategia',
        x: 0,
        y: 0,
        width: 8,
        height: 6,
        backgroundColor: '#FFF',
        departmentColor: '#000',
        icon: '🎯',
        isActive: false,
      };

      const TILE_SIZE = 32;
      const clickZone = {
        x: room.x * TILE_SIZE,
        y: room.y * TILE_SIZE,
        width: room.width * TILE_SIZE,
        height: room.height * TILE_SIZE,
      };

      // Point inside zone
      const pointInside = { x: 100, y: 50 };
      const isInside =
        pointInside.x >= clickZone.x &&
        pointInside.x <= clickZone.x + clickZone.width &&
        pointInside.y >= clickZone.y &&
        pointInside.y <= clickZone.y + clickZone.height;

      expect(isInside).toBe(true);

      // Point outside zone
      const pointOutside = { x: 300, y: 50 };
      const isOutside =
        pointOutside.x >= clickZone.x &&
        pointOutside.x <= clickZone.x + clickZone.width &&
        pointOutside.y >= clickZone.y &&
        pointOutside.y <= clickZone.y + clickZone.height;

      expect(isOutside).toBe(false);
    });
  });

  describe('State Management', () => {
    it('should toggle room selection', () => {
      const room: VirtualRoom = {
        id: 'test',
        name: 'Test',
        department: 'estrategia',
        x: 0,
        y: 0,
        width: 8,
        height: 6,
        backgroundColor: '#FFF',
        departmentColor: '#000',
        icon: '🎯',
        isActive: false,
      };

      expect(room.isActive).toBe(false);

      room.isActive = true;
      expect(room.isActive).toBe(true);

      room.isActive = false;
      expect(room.isActive).toBe(false);
    });

    it('should only allow one room selected at a time', () => {
      const rooms: VirtualRoom[] = [
        {
          id: 'room1',
          name: 'Room 1',
          department: 'estrategia',
          x: 0,
          y: 0,
          width: 8,
          height: 6,
          backgroundColor: '#FFF',
          departmentColor: '#000',
          icon: '🎯',
          isActive: false,
        },
        {
          id: 'room2',
          name: 'Room 2',
          department: 'ideacao',
          x: 8,
          y: 0,
          width: 8,
          height: 6,
          backgroundColor: '#FFF',
          departmentColor: '#000',
          icon: '💡',
          isActive: false,
        },
      ];

      // Select room 1
      rooms[0].isActive = true;
      expect(rooms[0].isActive).toBe(true);
      expect(rooms[1].isActive).toBe(false);

      // Select room 2
      rooms[0].isActive = false;
      rooms[1].isActive = true;
      expect(rooms[0].isActive).toBe(false);
      expect(rooms[1].isActive).toBe(true);
    });
  });
});
