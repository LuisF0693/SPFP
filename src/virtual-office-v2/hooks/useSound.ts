// Pixel Art Virtual Office - Sound Hook
import { useEffect, useCallback } from 'react';
import { getSoundService, type SoundType } from '../services/soundService';
import { useVirtualOfficeStore } from '../../virtual-office/store/virtualOfficeStore';

interface UseSoundReturn {
  play: (type: Exclude<SoundType, 'ambient'>) => void;
  toggleAmbient: () => void;
  isAmbientPlaying: boolean;
}

export function useSound(): UseSoundReturn {
  const soundSettings = useVirtualOfficeStore((state) => state.soundSettings);
  const setAmbientPlaying = useVirtualOfficeStore((state) => state.setAmbientPlaying);

  const soundService = getSoundService();

  // Sync sound settings with service
  useEffect(() => {
    soundService.setEnabled(soundSettings.enabled);
    soundService.setVolume(soundSettings.volume / 100);

    // Sync ambient state
    if (soundSettings.ambientPlaying && !soundService.getIsAmbientPlaying()) {
      soundService.startAmbient();
    } else if (!soundSettings.ambientPlaying && soundService.getIsAmbientPlaying()) {
      soundService.stopAmbient();
    }
  }, [soundSettings.enabled, soundSettings.volume, soundSettings.ambientPlaying, soundService]);

  // Play sound effect
  const play = useCallback((type: Exclude<SoundType, 'ambient'>) => {
    if (soundSettings.enabled) {
      soundService.play(type);
    }
  }, [soundSettings.enabled, soundService]);

  // Toggle ambient music
  const toggleAmbient = useCallback(() => {
    soundService.toggleAmbient();
    setAmbientPlaying(soundService.getIsAmbientPlaying());
  }, [soundService, setAmbientPlaying]);

  return {
    play,
    toggleAmbient,
    isAmbientPlaying: soundSettings.ambientPlaying,
  };
}

export default useSound;
