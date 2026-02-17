/**
 * NPCManager
 * Gerencia NPCs, animações e posicionamento
 */

import Phaser from 'phaser';
import { NPC, VirtualRoom } from '@/types/virtual-office';

const NPC_CONFIG = {
  cfo: {
    name: 'CFO',
    role: 'Chief Financial Officer',
    department: 'financeiro',
    color: '#3B82F6',
    emoji: '💰',
  },
  cmo: {
    name: 'CMO',
    role: 'Chief Marketing Officer',
    department: 'marketing',
    color: '#8B5CF6',
    emoji: '📢',
  },
  coo: {
    name: 'COO',
    role: 'Chief Operating Officer',
    department: 'operacional',
    color: '#F59E0B',
    emoji: '⚙️',
  },
  cso: {
    name: 'CSO',
    role: 'Chief Sales Officer',
    department: 'comercial',
    color: '#3B82F6',
    emoji: '💼',
  },
};

const TILE_SIZE = 32;

export class NPCManager {
  private scene: Phaser.Scene;
  private npcs: NPC[] = [];
  private spriteGroup!: Phaser.Physics.Arcade.Group;
  private textGroup!: Phaser.GameObjects.Group;
  private animationFrameCounter = 0;
  private currentAnimFrame = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.spriteGroup = scene.physics.add.group();
    this.textGroup = scene.add.group();
    this.initializeNPCs();
    this.setupAnimations();
  }

  private initializeNPCs(): void {
    // CFO in Estratégia (room 0,0)
    this.createNPC('cfo', 6 * TILE_SIZE, 3 * TILE_SIZE, 'estrategia');

    // CMO in Ideação (room 8,0)
    this.createNPC('cmo', 14 * TILE_SIZE, 3 * TILE_SIZE, 'ideacao');

    // COO in Produção (room 0,6)
    this.createNPC('coo', 6 * TILE_SIZE, 9 * TILE_SIZE, 'producao');

    // CSO in Design (room 8,6)
    this.createNPC('cso', 14 * TILE_SIZE, 9 * TILE_SIZE, 'design');
  }

  private createNPC(npcKey: keyof typeof NPC_CONFIG, x: number, y: number, department: string): void {
    const config = NPC_CONFIG[npcKey];
    const npc: NPC = {
      id: npcKey,
      name: config.name,
      role: config.role,
      department: department as any,
      x,
      y,
      spriteKey: npcKey,
      animKey: 'idle',
      currentAnimation: 'idle',
    };

    this.npcs.push(npc);

    // Create sprite placeholder (emoji + background)
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(Phaser.Display.Color.HexStringToColor(config.color).color, 0.8);
    graphics.fillCircle(x + 8, y + 8, 10);
    graphics.generateTexture(`npc-${npcKey}`, 32, 32);
    graphics.destroy();

    // Add sprite
    const sprite = this.spriteGroup.create(x, y, `npc-${npcKey}`);
    sprite.setData('npcId', npcKey);
    sprite.setData('name', npc.name);
    sprite.setInteractive();

    // Add name label below NPC
    const text = this.scene.add.text(x + 8, y + 24, config.name, {
      fontSize: '10px',
      color: '#F1F5F9',
      align: 'center',
    });
    text.setOrigin(0.5);
    this.textGroup.add(text);
  }

  private setupAnimations(): void {
    // Idle animation (4 frames, cycling)
    // We'll simulate by changing tint/opacity
  }

  public update(): void {
    // Animate NPCs
    this.animationFrameCounter++;

    if (this.animationFrameCounter % 12 === 0) {
      // Change idle animation frame every 12 frames (200ms at 60fps)
      this.currentAnimFrame = (this.currentAnimFrame + 1) % 4;

      // Cycle through slight scale changes to simulate bobbing
      const scale = 1 + Math.sin(this.currentAnimFrame * Math.PI / 2) * 0.05;

      this.spriteGroup.children.entries.forEach((child: any) => {
        child.setScale(scale);
      });
    }
  }

  public getNPCs(): NPC[] {
    return this.npcs;
  }

  public getNPCAt(x: number, y: number, radius: number = 16): NPC | undefined {
    for (const npc of this.npcs) {
      const dx = npc.x - x;
      const dy = npc.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        return npc;
      }
    }
    return undefined;
  }

  public destroy(): void {
    this.spriteGroup.destroy(true);
    this.textGroup.destroy(true);
    this.npcs = [];
  }
}
