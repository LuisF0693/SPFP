/**
 * Tipos específicos para Phaser
 */

import Phaser from 'phaser';

export interface DepartmentArea {
  id: 'financeiro' | 'marketing' | 'operacional' | 'comercial';
  name: string;
  color: string;
  emoji: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  npc: {
    role: string;
    emoji: string;
  };
}

export interface SceneConfig {
  canvasWidth: number;
  canvasHeight: number;
  departments: DepartmentArea[];
}

export interface ClickHandlerContext {
  scene: Phaser.Scene;
  departmentId: string;
  x: number;
  y: number;
}
