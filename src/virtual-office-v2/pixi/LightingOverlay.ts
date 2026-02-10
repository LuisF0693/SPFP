// Pixel Art Virtual Office - Day/Night Lighting System
import { Container, Graphics, ColorMatrixFilter } from 'pixi.js';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

interface LightingConfig {
  overlayColor: number;
  overlayAlpha: number;
  brightness: number;
  contrast: number;
  saturation: number;
}

const LIGHTING_CONFIGS: Record<TimeOfDay, LightingConfig> = {
  dawn: {
    overlayColor: 0xffa07a, // Light salmon
    overlayAlpha: 0.1,
    brightness: 1.05,
    contrast: 1.0,
    saturation: 1.1,
  },
  day: {
    overlayColor: 0xffffff,
    overlayAlpha: 0,
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
  },
  dusk: {
    overlayColor: 0xff6b4a, // Orange-red
    overlayAlpha: 0.15,
    brightness: 0.95,
    contrast: 1.05,
    saturation: 1.15,
  },
  night: {
    overlayColor: 0x1a237e, // Deep indigo
    overlayAlpha: 0.25,
    brightness: 0.75,
    contrast: 1.1,
    saturation: 0.8,
  },
};

export class LightingOverlay {
  private container: Container;
  private overlay: Graphics;
  private filter: ColorMatrixFilter;
  private currentTime: TimeOfDay = 'day';
  private targetConfig: LightingConfig;
  private currentConfig: LightingConfig;
  private transitionProgress: number = 1;
  private readonly transitionDuration: number = 2000; // ms

  constructor(width: number, height: number) {
    this.container = new Container();
    this.container.label = 'lighting_overlay';

    // Create overlay graphics
    this.overlay = new Graphics();
    this.overlay.rect(0, 0, width, height);
    this.overlay.fill(0x000000);
    this.overlay.alpha = 0;
    this.container.addChild(this.overlay);

    // Create color filter
    this.filter = new ColorMatrixFilter();

    this.targetConfig = { ...LIGHTING_CONFIGS.day };
    this.currentConfig = { ...LIGHTING_CONFIGS.day };
  }

  getContainer(): Container {
    return this.container;
  }

  getFilter(): ColorMatrixFilter {
    return this.filter;
  }

  /**
   * Set the time of day (instant or animated)
   */
  setTimeOfDay(time: TimeOfDay, animate: boolean = true): void {
    if (time === this.currentTime) return;

    this.currentTime = time;
    this.targetConfig = { ...LIGHTING_CONFIGS[time] };

    if (!animate) {
      this.currentConfig = { ...this.targetConfig };
      this.applyConfig(this.currentConfig);
      this.transitionProgress = 1;
    } else {
      this.transitionProgress = 0;
    }
  }

  /**
   * Get time of day based on real clock
   */
  static getTimeFromHour(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  }

  /**
   * Update animation (call each frame)
   */
  update(deltaMs: number): void {
    if (this.transitionProgress >= 1) return;

    this.transitionProgress = Math.min(1, this.transitionProgress + deltaMs / this.transitionDuration);

    // Ease out cubic
    const t = 1 - Math.pow(1 - this.transitionProgress, 3);

    // Interpolate config
    this.currentConfig.overlayAlpha = this.lerp(this.currentConfig.overlayAlpha, this.targetConfig.overlayAlpha, t);
    this.currentConfig.brightness = this.lerp(this.currentConfig.brightness, this.targetConfig.brightness, t);
    this.currentConfig.contrast = this.lerp(this.currentConfig.contrast, this.targetConfig.contrast, t);
    this.currentConfig.saturation = this.lerp(this.currentConfig.saturation, this.targetConfig.saturation, t);

    // Color interpolation is more complex, just set target on transition start
    if (this.transitionProgress < 0.1) {
      this.currentConfig.overlayColor = this.targetConfig.overlayColor;
    }

    this.applyConfig(this.currentConfig);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private applyConfig(config: LightingConfig): void {
    // Update overlay
    this.overlay.clear();
    this.overlay.rect(0, 0, 2000, 2000); // Large enough to cover
    this.overlay.fill(config.overlayColor);
    this.overlay.alpha = config.overlayAlpha;

    // Update filter
    this.filter.reset();
    this.filter.brightness(config.brightness, false);
    this.filter.contrast(config.contrast, false);
    this.filter.saturate(config.saturation - 1, false); // saturate expects delta
  }

  /**
   * Get current time of day
   */
  getCurrentTime(): TimeOfDay {
    return this.currentTime;
  }

  destroy(): void {
    this.overlay.destroy();
    this.container.destroy({ children: true });
  }
}

// Singleton for easy access
let lightingInstance: LightingOverlay | null = null;

export function getLightingOverlay(width: number = 1280, height: number = 960): LightingOverlay {
  if (!lightingInstance) {
    lightingInstance = new LightingOverlay(width, height);
  }
  return lightingInstance;
}

export function destroyLightingOverlay(): void {
  if (lightingInstance) {
    lightingInstance.destroy();
    lightingInstance = null;
  }
}
