/**
 * VirtualOfficeScene
 * Phaser scene principal para o escritório virtual
 */

import Phaser from 'phaser';
import { RoomManager } from './RoomManager';
import { NPCManager } from './NPCManager';
import { VirtualRoom } from '@/types/virtual-office';

interface SceneInitData {
  onRoomSelect?: (roomId: string) => void;
  onRoomHover?: (roomId: string | null) => void;
  onNPCClick?: (npcId: string) => void;
}

export class VirtualOfficeScene extends Phaser.Scene {
  private roomManager!: RoomManager;
  private npcManager!: NPCManager;
  private initData: SceneInitData = {};
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private loadTime = Date.now();

  constructor() {
    super({ key: 'VirtualOffice' });
  }

  init(data: SceneInitData): void {
    this.initData = data;
  }

  preload(): void {
    // Pre-load assets if needed (sprites, sounds, etc)
    // For now, all rendering is done with Graphics
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor('#0F172A');

    // Initialize managers
    this.roomManager = new RoomManager(
      this,
      (roomId) => {
        this.initData.onRoomSelect?.(roomId);
      },
      (roomId) => {
        this.initData.onRoomHover?.(roomId);
      }
    );

    this.npcManager = new NPCManager(this);

    // Input handling
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.roomManager.handleClick(pointer.x, pointer.y);
    });

    // Mouse over for hover effects
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.roomManager.handleHover(pointer.x, pointer.y);
    });

    // Initial render
    this.roomManager.render();

    // Log load time
    const loadTime = Date.now() - this.loadTime;
    console.log(`✅ VirtualOfficeScene loaded in ${loadTime}ms`);
  }

  update(): void {
    this.npcManager.update();
  }

  shutdown(): void {
    this.roomManager.destroy();
    this.npcManager.destroy();
  }

  getRooms(): VirtualRoom[] {
    return this.roomManager.getRooms();
  }

  getSelectedRoom(): VirtualRoom | undefined {
    return this.roomManager.getSelectedRoom();
  }
}
