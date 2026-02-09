// AIOS Virtual Office - Sound Management Hook
import { useEffect, useRef, useCallback } from 'react';

export type SoundType = 'success' | 'notification' | 'ambient';

// Sound URLs - royalty-free audio
// Using base64 encoded short sounds for reliability (no external dependencies)

// Success chime - short pleasant tone
const SUCCESS_SOUND_DATA = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsF0sIzqPw93HYiwjOoa/2MViLSM6hr7Yw2MtIzqFvdfDYy0jOoW818NjLSM6hL3Xw2MtIzqEvNbDZC0jOoO71sNkLiM6g7rWw2QuIzqDutXDZC4jOoK51cNlLiM6grjVw2UuIzqCuNTDZS4jOoG31MNmLiM6gbfUw2YuIzqBttPDZi8jOoC208NnLyM6gLXTw2cvIzqAtNPDZy8jOn+008NoLyM6f7PSw2gvIzp/s9LDaC8jOn6y0sNoMCM6frHSw2kwIDp+sdHDaTAgOn2w0cNpMCA6fbDRw2kwIDp9r9DDajAgOnyu0MNqMCA6fK7Qw2owIDp8rdDDajEgOnytz8NrMSA6e6zPw2sxIDp7rM/DazEgOnurz8NrMSA6e6vOw2wxIDp7qs7DbDEgOnqqzsNsMSA6eqnOw20xIDp5qc7DbTEgOnmozsFtMiA6eajOw20yIDp5p87DbTIgOnmmzsNuMiA6eabNw24yIDp5pc3DbjIgOnilzcNuMyA6eKTNw28zIDp4pM3DbzMgOnijzMNvMyA6d6PMw28zIDp3o8zDcDMgOnaizcBwMyA6dqLMw3AzIDp2oczDcDQgOnWhy8NxNCA6daHLw3E0IDp1oMvDcTQgOnSgy8NxNCA6dJ/Lw3I0IDp0n8vDcjQgOnSey8NyNCA6c57Lw3I1IDpznsvDcjUgOnOdy8NyNSA6c53Kw3M1IDpynMrDczUgOnKcysNzNSA6cpvKw3M1IDpxm8rDdDUgOnGaysN0NiA6cZrKw3Q2IDpxmcrDdDYgOnCZycN1NiA6cJnJw3U2IDpwmMnDdTYgOm+YycN1NiA6b5fJw3Y2IDpvl8jDdjYgOm+WyMN2NyA6bpbIw3c3IDpulsjDdzcgOm6VyMN3NyA6bZXIw3c3IDptlcjDdzcgOm2UyMN4NyA6bJTHw3g3IDpslMfDeDggOmyTx8N5OCA6a5PHw3k4IDprk8fDeTggOmuSx8N5OCA6apLHw3o4IDpqksfDejggOmqRx8N6OCA6apHGw3o4IDppkcbDezkgOmmQxsN7OSA6aZDGw3s5IDpokMbDezkgOmiPxsN8OSA6aI/Gw3w5IDpoj8bDfDkgOmePxsN8OSA6Z47Fw3w5IDpnjsXDfTkgOmeOxcN9OiA6Zo7Fw306IDpmjcXDfjogOmWNxcN+OiA6ZY3Fw346IDpljMXDfjogOmSMxcN/OiA6ZIzFw386IDpkjMXDfzogOmOLxcN/OiA6Y4vEw4A6IDpji8TDgDogOmOKxMOAOiA6YorEw4E6IDpiicTDgTsgOmKJxMOBOyA6YYnEw4E7IDphiMTDgjsgOmGIxMOCOyA6YYjEw4I7IDpgiMPDgjsgOmCHw8ODOyA6YIfDw4M7IDpfh8PDgzsgOl+Gw8ODPDIVHGqWqaSVe049NDxznaOhj3JMQDk9e6GhoIt0TT05PH6joaCHck49Nz1/pKOgiHNOPTY9gKSjn4hzTz02PYCko5+HdFA9NT2ApKSfhnRRPTU+gaSknod0UT00PoKlpJ6GdFE9ND6CpaSfhXNSPTM+gqalnYZzUzwyPoOmpZ2FdFM8Mj6DpqadhXRTPDI+hKamnYV0VDwxPoSkpp6EdFQ8MT6FpaaehnNUPDA+haWnn4VzVD0vPoalp5+Ec1U9Lz6Gpaegg3NVPS8/hqaooIN0VT0uP4enqKGDdFU9Lj+HqKmhg3RVPi0/h6ipooJ0Vj4tP4ioqaKCdFY+LT+IqaqignRWPi0/iKmroYJ0Vz4sP4mqq6GBdFg+LD+KqquhgXRYPiw/iqurooF0WD8rP4urq6KAdFk/Kz+Lq6yigHRZPys/i6ysooB0WT8rP4ysrKOAdFo/Kz+MrK2jgHRaPyo/jK2to390Wj8qP42trat/dFo/Kj+NrrCsfnRaPyo/jq6wrH50Wz8qP46usK19dFw/Kj+PrrCtfXRcPyo/j6+wrXx0XD8p';

// Notification blip - short alert sound
const NOTIFICATION_SOUND_DATA = 'data:audio/wav;base64,UklGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19teleUlGRl9vT19tele';

// Ambient music URL - lofi beats (royalty-free from Pixabay)
const AMBIENT_MUSIC_URL = 'https://cdn.pixabay.com/audio/2024/02/21/audio_8f3f66a4a0.mp3';

interface UseSoundOptions {
  volume: number; // 0-100
  enabled: boolean;
}

interface UseSoundReturn {
  playSuccess: () => void;
  playNotification: () => void;
  toggleAmbient: () => void;
  isAmbientPlaying: boolean;
  setVolume: (volume: number) => void;
  preloadSounds: () => void;
}

// Simple web audio beep generator for reliable sounds
function createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      if (type === 'sine') {
        sample = Math.sin(2 * Math.PI * frequency * t);
      } else if (type === 'triangle') {
        sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
      }

      // Apply envelope (attack/decay)
      const envelope = Math.min(1, t * 20) * Math.max(0, 1 - t * 3);
      data[i] = sample * envelope * 0.5;
    }

    audioContext.close();
    return buffer;
  } catch {
    return null;
  }
}

export function useSound({ volume, enabled }: UseSoundOptions): UseSoundReturn {
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAmbientPlayingRef = useRef(false);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio context lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  // Update volume
  useEffect(() => {
    const normalizedVolume = volume / 100;

    // Update Web Audio API gain
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = normalizedVolume;
    }

    // Update ambient audio volume
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = normalizedVolume;
    }
  }, [volume]);

  // Play a generated beep sound
  const playBeep = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled) return;

    try {
      const ctx = getAudioContext();

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.value = frequency;

      envelope.gain.setValueAtTime(0, ctx.currentTime);
      envelope.gain.linearRampToValueAtTime((volume / 100) * 0.3, ctx.currentTime + 0.01);
      envelope.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      oscillator.connect(envelope);
      envelope.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }, [enabled, volume, getAudioContext]);

  // Play success chime (pleasant ascending tones)
  const playSuccess = useCallback(() => {
    if (!enabled) return;

    try {
      const ctx = getAudioContext();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Play a pleasant chord progression
      const baseTime = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)

      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const envelope = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const startTime = baseTime + i * 0.05;
        const vol = (volume / 100) * 0.15;

        envelope.gain.setValueAtTime(0, startTime);
        envelope.gain.linearRampToValueAtTime(vol, startTime + 0.02);
        envelope.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        oscillator.connect(envelope);
        envelope.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
      });
    } catch (error) {
      console.warn('Failed to play success sound:', error);
    }
  }, [enabled, volume, getAudioContext]);

  // Play notification blip
  const playNotification = useCallback(() => {
    if (!enabled) return;

    try {
      const ctx = getAudioContext();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Short notification blip
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 880; // A5

      const vol = (volume / 100) * 0.2;

      envelope.gain.setValueAtTime(0, ctx.currentTime);
      envelope.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
      envelope.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      oscillator.connect(envelope);
      envelope.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [enabled, volume, getAudioContext]);

  // Toggle ambient music
  const toggleAmbient = useCallback(() => {
    if (!enabled) return;

    try {
      if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio(AMBIENT_MUSIC_URL);
        ambientAudioRef.current.loop = true;
        ambientAudioRef.current.volume = (volume / 100) * 0.5; // Ambient at half volume
      }

      if (isAmbientPlayingRef.current) {
        ambientAudioRef.current.pause();
        isAmbientPlayingRef.current = false;
      } else {
        ambientAudioRef.current.play().catch(console.warn);
        isAmbientPlayingRef.current = true;
      }
    } catch (error) {
      console.warn('Failed to toggle ambient music:', error);
    }
  }, [enabled, volume]);

  // Preload sounds (call on user interaction to enable audio)
  const preloadSounds = useCallback(() => {
    try {
      getAudioContext();

      // Create ambient audio element
      if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio(AMBIENT_MUSIC_URL);
        ambientAudioRef.current.loop = true;
        ambientAudioRef.current.volume = (volume / 100) * 0.5;
        ambientAudioRef.current.preload = 'auto';
      }
    } catch (error) {
      console.warn('Failed to preload sounds:', error);
    }
  }, [getAudioContext, volume]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Stop ambient when disabled
  useEffect(() => {
    if (!enabled && ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      isAmbientPlayingRef.current = false;
    }
  }, [enabled]);

  return {
    playSuccess,
    playNotification,
    toggleAmbient,
    isAmbientPlaying: isAmbientPlayingRef.current,
    setVolume: (v) => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.volume = (v / 100) * 0.5;
      }
    },
    preloadSounds
  };
}

export default useSound;
