/**
 * RoomManager
 * Gerencia salas, renderização e interatividade
 */

import Phaser from 'phaser';
import { VirtualRoom } from '@/types/virtual-office';

const TILE_SIZE = 32;
const ROOM_CONFIGS: Record<string, Partial<VirtualRoom>> = {
  estrategia: {
    name: 'Estratégia',
    department: 'estrategia',
    backgroundColor: '#4C1D95',
    departmentColor: '#6366F1',
    icon: '🎯',
    x: 0,
    y: 0,
    width: 8,
    height: 6,
  },
  ideacao: {
    name: 'Ideação',
    department: 'ideacao',
    backgroundColor: '#831843',
    departmentColor: '#EC4899',
    icon: '💡',
    x: 8,
    y: 0,
    width: 8,
    height: 6,
  },
  producao: {
    name: 'Produção',
    department: 'producao',
    backgroundColor: '#0C4A6E',
    departmentColor: '#06B6D4',
    icon: '🏭',
    x: 0,
    y: 6,
    width: 8,
    height: 6,
  },
  design: {
    name: 'Design',
    department: 'design',
    backgroundColor: '#7C2D12',
    departmentColor: '#F97316',
    icon: '🎨',
    x: 8,
    y: 6,
    width: 8,
    height: 6,
  },
};

export class RoomManager {
  private scene: Phaser.Scene;
  private rooms: VirtualRoom[] = [];
  private graphics: Phaser.GameObjects.Graphics;
  private roomClickZones: Map<string, Phaser.Geom.Rectangle> = new Map();
  private selectedRoomId: string | null = null;
  private onRoomSelect?: (roomId: string) => void;

  constructor(scene: Phaser.Scene, onRoomSelect?: (roomId: string) => void) {
    this.scene = scene;
    this.onRoomSelect = onRoomSelect;
    this.graphics = scene.add.graphics();
    this.initializeRooms();
  }

  private initializeRooms(): void {
    // Create 4 rooms
    Object.values(ROOM_CONFIGS).forEach((config) => {
      const room: VirtualRoom = {
        id: config.department!,
        name: config.name!,
        department: config.department!,
        x: config.x!,
        y: config.y!,
        width: config.width!,
        height: config.height!,
        backgroundColor: config.backgroundColor!,
        departmentColor: config.departmentColor!,
        icon: config.icon!,
        isActive: false,
      };
      this.rooms.push(room);
    });
  }

  public render(): void {
    this.graphics.clear();
    this.graphics.fillStyle(0x000000, 0);

    this.rooms.forEach((room) => {
      this.renderRoom(room);
    });
  }

  private renderRoom(room: VirtualRoom): void {
    const x = room.x * TILE_SIZE;
    const y = room.y * TILE_SIZE;
    const width = room.width * TILE_SIZE;
    const height = room.height * TILE_SIZE;

    // Background
    this.graphics.fillStyle(Phaser.Display.Color.HexStringToColor(room.backgroundColor).color, 1);
    this.graphics.fillRect(x, y, width, height);

    // Room border
    const borderColor = room.isActive
      ? Phaser.Display.Color.HexStringToColor(room.departmentColor).color
      : 0x334155;
    const borderWidth = room.isActive ? 3 : 1;
    this.graphics.lineStyle(borderWidth, borderColor, 1);
    this.graphics.strokeRect(x, y, width, height);

    // Furniture - simple rectangles
    this.renderFurniture(room, x, y);

    // Room name + icon (render as text)
    if (!this.scene.textures.exists('tempText')) {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 50;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${room.icon} ${room.name}`, 50, 30);
      this.scene.textures.addCanvas(`room-label-${room.id}`, canvas);
    }

    // Store click zone
    this.roomClickZones.set(room.id, new Phaser.Geom.Rectangle(x, y, width, height));
  }

  private renderFurniture(room: VirtualRoom, baseX: number, baseY: number): void {
    const deskColor = Phaser.Display.Color.HexStringToColor('#8B7355').color;
    const computerColor = Phaser.Display.Color.HexStringToColor('#1E293B').color;
    const computerScreenColor = Phaser.Display.Color.HexStringToColor('#10B981').color;

    // 2 desks per room
    for (let i = 0; i < 2; i++) {
      const deskX = baseX + 32 + i * 128;
      const deskY = baseY + 48;

      // Desk
      this.graphics.fillStyle(deskColor, 0.7);
      this.graphics.fillRect(deskX, deskY, 32, 32);

      // Computer on desk
      this.graphics.fillStyle(computerColor, 0.8);
      this.graphics.fillRect(deskX + 4, deskY + 4, 24, 24);

      // Screen glow
      this.graphics.fillStyle(computerScreenColor, 0.5);
      this.graphics.fillRect(deskX + 6, deskY + 6, 20, 20);

      // Chair next to desk
      const chairColor = Phaser.Display.Color.HexStringToColor('#6366F1').color;
      this.graphics.fillStyle(chairColor, 0.7);
      this.graphics.fillRect(deskX - 20, deskY, 16, 16);
    }

    // Plant decoration
    const plantColor = Phaser.Display.Color.HexStringToColor('#10B981').color;
    this.graphics.fillStyle(plantColor, 0.6);
    this.graphics.fillRect(baseX + 16, baseY + 16, 24, 32);

    // Whiteboard on wall
    const boardColor = 0xFFFFFF;
    this.graphics.fillStyle(boardColor, 0.5);
    this.graphics.fillRect(baseX + room.width * TILE_SIZE - 64, baseY + 16, 48, 32);
  }

  public handleClick(x: number, y: number): void {
    for (const [roomId, zone] of this.roomClickZones) {
      if (Phaser.Geom.Rectangle.Contains(zone, x, y)) {
        this.selectRoom(roomId);
        return;
      }
    }
  }

  public selectRoom(roomId: string): void {
    // Deselect previous
    if (this.selectedRoomId) {
      const prevRoom = this.rooms.find((r) => r.id === this.selectedRoomId);
      if (prevRoom) prevRoom.isActive = false;
    }

    // Select new
    const room = this.rooms.find((r) => r.id === roomId);
    if (room) {
      room.isActive = true;
      this.selectedRoomId = roomId;
      this.onRoomSelect?.(roomId);
      this.render();
    }
  }

  public getRooms(): VirtualRoom[] {
    return this.rooms;
  }

  public getSelectedRoom(): VirtualRoom | undefined {
    return this.rooms.find((r) => r.id === this.selectedRoomId);
  }

  public destroy(): void {
    this.graphics.destroy();
    this.roomClickZones.clear();
  }
}
