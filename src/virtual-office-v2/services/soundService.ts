// Pixel Art Virtual Office - Sound Service
// Uses Web Audio API for sound effects and ambient music

type SoundType = 'click' | 'select' | 'success' | 'error' | 'notification' | 'ambient';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  attack?: number;
  decay?: number;
}

const SOUND_CONFIGS: Record<Exclude<SoundType, 'ambient'>, SoundConfig> = {
  click: { frequency: 800, duration: 0.05, type: 'square', volume: 0.1 },
  select: { frequency: 600, duration: 0.1, type: 'sine', volume: 0.15, attack: 0.01 },
  success: { frequency: 880, duration: 0.2, type: 'sine', volume: 0.2, attack: 0.02 },
  error: { frequency: 220, duration: 0.3, type: 'sawtooth', volume: 0.15 },
  notification: { frequency: 523, duration: 0.15, type: 'sine', volume: 0.2 },
};

class SoundService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isEnabled: boolean = false;
  private volume: number = 0.5;
  private isAmbientPlaying: boolean = false;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // Enable/disable all sounds
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAmbient();
    }
  }

  // Set master volume (0-1)
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  // Play a sound effect
  play(type: Exclude<SoundType, 'ambient'>): void {
    if (!this.isEnabled || !this.audioContext || !this.masterGain) return;

    // Resume audio context if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const config = SOUND_CONFIGS[type];
    if (!config) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = config.type;
      oscillator.frequency.value = config.frequency;

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

      // Attack
      const attackTime = config.attack || 0.01;
      gainNode.gain.linearRampToValueAtTime(
        config.volume,
        this.audioContext.currentTime + attackTime
      );

      // Decay to zero
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + config.duration
      );

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + config.duration);

      // For success sound, add a second note
      if (type === 'success') {
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();

        osc2.type = 'sine';
        osc2.frequency.value = 1046; // Higher note

        gain2.gain.setValueAtTime(0, this.audioContext.currentTime + 0.08);
        gain2.gain.linearRampToValueAtTime(config.volume, this.audioContext.currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

        osc2.connect(gain2);
        gain2.connect(this.masterGain);

        osc2.start(this.audioContext.currentTime + 0.08);
        osc2.stop(this.audioContext.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  // Start ambient music (simple generative ambient)
  startAmbient(): void {
    if (!this.isEnabled || !this.audioContext || !this.masterGain || this.isAmbientPlaying) return;

    try {
      this.ambientGain = this.audioContext.createGain();
      this.ambientGain.gain.value = 0.05; // Very quiet ambient
      this.ambientGain.connect(this.masterGain);

      // Create multiple drones for ambient texture
      const frequencies = [65.41, 98.00, 130.81, 196.00]; // C2, G2, C3, G3

      frequencies.forEach((freq, i) => {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        // Slight detuning for richness
        osc.detune.value = (Math.random() - 0.5) * 10;

        // Volume varies per voice
        gain.gain.value = 0.3 - i * 0.05;

        osc.connect(gain);
        gain.connect(this.ambientGain!);

        osc.start();
        this.ambientOscillators.push(osc);
      });

      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Error starting ambient:', e);
    }
  }

  // Stop ambient music
  stopAmbient(): void {
    this.ambientOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    this.ambientOscillators = [];

    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }

    this.isAmbientPlaying = false;
  }

  // Toggle ambient
  toggleAmbient(): void {
    if (this.isAmbientPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
  }

  // Check if ambient is playing
  getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }

  // Cleanup
  destroy(): void {
    this.stopAmbient();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
let soundServiceInstance: SoundService | null = null;

export function getSoundService(): SoundService {
  if (!soundServiceInstance) {
    soundServiceInstance = new SoundService();
  }
  return soundServiceInstance;
}

export function destroySoundService(): void {
  if (soundServiceInstance) {
    soundServiceInstance.destroy();
    soundServiceInstance = null;
  }
}

export type { SoundType };
export default SoundService;
