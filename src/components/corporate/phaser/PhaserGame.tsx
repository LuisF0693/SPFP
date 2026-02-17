/**
 * PhaserGame Component
 * Container React para Phaser scene
 */

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainMapScene } from './MainMapScene';
import { VirtualOfficeScene } from './VirtualOfficeScene';
import { DepartmentArea } from './types';

interface PhaserGameProps {
  onDepartmentClick: (departmentId: string) => void;
  departments?: DepartmentArea[];
  className?: string;
  useVirtualOffice?: boolean;
}

export function PhaserGame({ onDepartmentClick, departments, className = '', useVirtualOffice = true }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current) return; // Já inicializado

    const startTime = performance.now();

    // Config Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current || undefined,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%',
        expandParent: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: useVirtualOffice ? [VirtualOfficeScene] : [MainMapScene],
      backgroundColor: '#0f172a',
      render: {
        antialias: true,
        pixelArt: true,
      },
    };

    // Criar instância Phaser
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Aguardar scene e passar dados
    if (useVirtualOffice) {
      const scene = game.scene.getScene('VirtualOffice') as VirtualOfficeScene;
      if (scene) {
        scene.init({
          onRoomSelect: onDepartmentClick,
        });
      }
    } else {
      const scene = game.scene.getScene('MainMap') as MainMapScene;
      if (scene) {
        scene.init({
          departments,
          onDepartmentClick,
        });
      }
    }

    const loadTime = performance.now() - startTime;
    console.log(`⏱️ Phaser scene initialized in ${loadTime.toFixed(2)}ms`);

    // Cleanup
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onDepartmentClick, departments, useVirtualOffice]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-slate-900 ${className}`}
      style={{ minHeight: '100vh' }}
    />
  );
}
