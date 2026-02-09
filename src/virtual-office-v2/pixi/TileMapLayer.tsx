// Pixel Art Virtual Office - TileMap Layer Component
import { useEffect, useRef } from 'react';
import { Container } from 'pixi.js';
import { useTileMap } from '../hooks/useTileMap';

interface TileMapLayerProps {
  parentContainer: Container;
}

export function TileMapLayer({ parentContainer }: TileMapLayerProps) {
  const { isLoaded, renderMap } = useTileMap();
  const containerRef = useRef<Container | null>(null);

  useEffect(() => {
    if (!isLoaded || !parentContainer) return;

    // Create or reuse container
    if (!containerRef.current) {
      containerRef.current = new Container();
      containerRef.current.label = 'TileMapLayer';
      parentContainer.addChildAt(containerRef.current, 0); // Add at bottom
    }

    // Render the map
    renderMap(containerRef.current);

    return () => {
      if (containerRef.current) {
        containerRef.current.destroy({ children: true });
        containerRef.current = null;
      }
    };
  }, [isLoaded, parentContainer, renderMap]);

  return null; // This is a Pixi component, no React DOM
}

export default TileMapLayer;
