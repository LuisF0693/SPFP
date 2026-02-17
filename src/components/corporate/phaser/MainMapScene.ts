/**
 * MainMapScene - Mapa 2D do escritório virtual em Phaser
 * 4 departamentos interativos com NPCs estáticos
 */

import Phaser from 'phaser';
import { DepartmentArea } from './types';

export class MainMapScene extends Phaser.Scene {
  private departments: DepartmentArea[] = [];
  private departmentAreas: Map<
    string,
    {
      zone: Phaser.Geom.Rectangle;
      graphics: Phaser.GameObjects.Graphics;
      text: Phaser.GameObjects.Text;
      npcEmoji: Phaser.GameObjects.Text;
    }
  > = new Map();

  private clickCallback?: (departmentId: string) => void;
  private hoveredDepartment: string | null = null;

  constructor() {
    super({ key: 'MainMap' });
  }

  init(data: any) {
    this.departments = data.departments || this.getDefaultDepartments();
    this.clickCallback = data.onDepartmentClick;
  }

  preload() {
    // MVP: Usando graphics + emojis, sem sprites
  }

  create() {
    // Background
    const cam = this.cameras.main;
    this.add
      .rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, 0x0f172a)
      .setOrigin(0.5);

    // Renderizar departamentos
    this.departments.forEach((dept) => {
      this.createDepartmentArea(dept);
    });

    // Input
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerdown', this.handlePointerDown, this);
  }

  update() {
    // Atualizar visual state se necessário
  }

  /**
   * Criar área visual para departamento
   */
  private createDepartmentArea(dept: DepartmentArea) {
    const { x, y, width, height } = {
      x: dept.position.x,
      y: dept.position.y,
      width: dept.size.width,
      height: dept.size.height,
    };

    // Fundo do departamento (com cor de tema)
    const graphics = this.add.graphics();
    graphics.fillStyle(parseInt(dept.color.replace('#', '0x')), 0.1);
    graphics.fillRect(x, y, width, height);
    graphics.lineStyle(2, parseInt(dept.color.replace('#', '0x')), 1);
    graphics.strokeRect(x, y, width, height);

    // Nome do departamento
    const text = this.add.text(x + width / 2, y + 20, dept.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);

    // NPC emoji
    const npcEmoji = this.add.text(x + width / 2, y + height / 2, dept.npc.emoji, {
      fontSize: '64px',
    });
    npcEmoji.setOrigin(0.5);

    // Descrição do role
    const roleText = this.add.text(x + width / 2, y + height - 30, dept.npc.role, {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial',
    });
    roleText.setOrigin(0.5);

    // Emoji do departamento (pequeno no canto)
    const deptEmoji = this.add.text(x + 10, y + 10, dept.emoji, {
      fontSize: '24px',
    });

    // Armazenar referência
    this.departmentAreas.set(dept.id, {
      zone: new Phaser.Geom.Rectangle(x, y, width, height),
      graphics,
      text,
      npcEmoji,
    });
  }

  /**
   * Handle mouse move - hover effect
   */
  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    let hoveredDept: string | null = null;

    for (const [deptId, area] of this.departmentAreas.entries()) {
      const contains = Phaser.Geom.Rectangle.Contains(
        area.zone,
        pointer.x,
        pointer.y
      );

      if (contains) {
        hoveredDept = deptId;
        if (this.hoveredDepartment !== deptId) {
          this.applyHoverEffect(deptId, true);
        }
      } else {
        if (this.hoveredDepartment === deptId) {
          this.applyHoverEffect(deptId, false);
        }
      }
    }

    this.hoveredDepartment = hoveredDept;
  }

  /**
   * Handle click - select department
   */
  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    for (const [deptId, area] of this.departmentAreas.entries()) {
      const contains = Phaser.Geom.Rectangle.Contains(
        area.zone,
        pointer.x,
        pointer.y
      );

      if (contains) {
        this.clickCallback?.(deptId);
        break;
      }
    }
  }

  /**
   * Aplicar/remover efeito hover
   */
  private applyHoverEffect(departmentId: string, isHovering: boolean) {
    const area = this.departmentAreas.get(departmentId);
    if (!area) return;

    if (isHovering) {
      area.graphics.lineStyle(4, 0xffff00, 1);
      area.text.setColor('#ffff00');
      area.npcEmoji.setScale(1.2);
    } else {
      const dept = this.departments.find((d) => d.id === departmentId);
      if (dept) {
        area.graphics.lineStyle(2, parseInt(dept.color.replace('#', '0x')), 1);
        area.text.setColor('#ffffff');
        area.npcEmoji.setScale(1);
      }
    }
  }

  /**
   * Departamentos padrão se não fornecidos
   */
  private getDefaultDepartments(): DepartmentArea[] {
    const width = this.scale.width;
    const height = this.scale.height;
    const deptWidth = width / 2 - 20;
    const deptHeight = height / 2 - 20;

    return [
      {
        id: 'financeiro',
        name: 'Financeiro',
        color: '#10B981',
        emoji: '💰',
        position: { x: 10, y: 10 },
        size: { width: deptWidth, height: deptHeight },
        npc: { role: 'CFO', emoji: '👨‍💼' },
      },
      {
        id: 'marketing',
        name: 'Marketing',
        color: '#8B5CF6',
        emoji: '📣',
        position: { x: deptWidth + 20, y: 10 },
        size: { width: deptWidth, height: deptHeight },
        npc: { role: 'CMO', emoji: '👩‍💼' },
      },
      {
        id: 'operacional',
        name: 'Operacional',
        color: '#F59E0B',
        emoji: '⚙️',
        position: { x: 10, y: deptHeight + 20 },
        size: { width: deptWidth, height: deptHeight },
        npc: { role: 'COO', emoji: '👨‍💻' },
      },
      {
        id: 'comercial',
        name: 'Comercial',
        color: '#3B82F6',
        emoji: '🤝',
        position: { x: deptWidth + 20, y: deptHeight + 20 },
        size: { width: deptWidth, height: deptHeight },
        npc: { role: 'CSO', emoji: '👩‍💻' },
      },
    ];
  }
}
