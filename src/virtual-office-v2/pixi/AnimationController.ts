// Pixel Art Virtual Office - Animation Controller
// Manages all sprite animations using Pixi.js ticker
import { Application, Container, Graphics } from 'pixi.js';
import type { AgentStatus } from '../types';

export interface AnimatedAgent {
  container: Container;
  agentId: string;
  status: AgentStatus;
  baseY: number;
  time: number;
  particles: Graphics[];
}

export class AnimationController {
  private app: Application | null = null;
  private agents: Map<string, AnimatedAgent> = new Map();
  private isRunning = false;
  private boundUpdate: (ticker: { deltaTime: number }) => void;

  constructor() {
    this.boundUpdate = this.update.bind(this);
  }

  /**
   * Start the animation loop
   */
  start(app: Application): void {
    if (this.isRunning) return;
    this.app = app;
    this.isRunning = true;
    app.ticker.add(this.boundUpdate);
  }

  /**
   * Stop the animation loop
   */
  stop(): void {
    if (!this.isRunning || !this.app) return;
    this.app.ticker.remove(this.boundUpdate);
    this.isRunning = false;
  }

  /**
   * Register an agent for animation
   */
  registerAgent(
    agentId: string,
    container: Container,
    status: AgentStatus = 'idle'
  ): void {
    // Clean up existing if any
    this.unregisterAgent(agentId);

    const animated: AnimatedAgent = {
      container,
      agentId,
      status,
      baseY: container.y,
      time: Math.random() * Math.PI * 2, // Random start phase
      particles: [],
    };

    this.agents.set(agentId, animated);

    // Create initial particles if working
    if (status === 'working') {
      this.createWorkingParticles(animated);
    }
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      // Clean up particles
      agent.particles.forEach(p => p.destroy());
      this.agents.delete(agentId);
    }
  }

  /**
   * Update agent status (triggers animation change)
   */
  updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const oldStatus = agent.status;
    agent.status = status;

    // Handle particle creation/destruction
    if (oldStatus !== 'working' && status === 'working') {
      this.createWorkingParticles(agent);
    } else if (oldStatus === 'working' && status !== 'working') {
      this.destroyWorkingParticles(agent);
    }
  }

  /**
   * Create floating work particles
   */
  private createWorkingParticles(agent: AnimatedAgent): void {
    // Clean existing
    this.destroyWorkingParticles(agent);

    // Create 5 particles
    for (let i = 0; i < 5; i++) {
      const particle = new Graphics();
      particle.rect(-2, -2, 4, 4);
      particle.fill(0x4a90d9);
      particle.alpha = 0;

      // Random position around head
      particle.x = -20 + Math.random() * 40;
      particle.y = -40 - Math.random() * 20;

      // Store initial position for animation
      (particle as any)._startY = particle.y;
      (particle as any)._phase = Math.random() * Math.PI * 2;
      (particle as any)._speed = 0.5 + Math.random() * 0.5;

      agent.container.addChild(particle);
      agent.particles.push(particle);
    }
  }

  /**
   * Destroy work particles
   */
  private destroyWorkingParticles(agent: AnimatedAgent): void {
    agent.particles.forEach(p => {
      if (p.parent) p.parent.removeChild(p);
      p.destroy();
    });
    agent.particles = [];
  }

  /**
   * Main update loop
   */
  private update(ticker: { deltaTime: number }): void {
    const dt = ticker.deltaTime * 0.016; // Convert to seconds-ish

    this.agents.forEach((agent) => {
      agent.time += dt;

      switch (agent.status) {
        case 'idle':
          this.animateIdle(agent, dt);
          break;
        case 'working':
          this.animateWorking(agent, dt);
          break;
        case 'thinking':
          this.animateThinking(agent, dt);
          break;
        case 'waiting':
          this.animateWaiting(agent, dt);
          break;
      }
    });
  }

  /**
   * Idle animation - gentle breathing/bobbing
   */
  private animateIdle(agent: AnimatedAgent, _dt: number): void {
    // Gentle vertical bob
    const breathe = Math.sin(agent.time * 2) * 2;
    agent.container.y = agent.baseY + breathe;

    // Slight scale pulse
    const pulse = 1 + Math.sin(agent.time * 2) * 0.02;
    agent.container.scale.set(pulse);
  }

  /**
   * Working animation - particles + focused movement
   */
  private animateWorking(agent: AnimatedAgent, dt: number): void {
    // Faster, smaller bob
    const bob = Math.sin(agent.time * 4) * 1;
    agent.container.y = agent.baseY + bob;

    // Animate particles
    agent.particles.forEach((particle) => {
      const p = particle as any;
      p._phase += dt * p._speed * 3;

      // Float upward
      particle.y = p._startY - (agent.time * 10) % 30;

      // Fade in/out based on position
      const fadeProgress = ((agent.time * 10) % 30) / 30;
      particle.alpha = Math.sin(fadeProgress * Math.PI) * 0.8;

      // Slight horizontal wave
      particle.x += Math.sin(p._phase) * 0.3;

      // Reset when too high
      if (particle.y < p._startY - 30) {
        particle.y = p._startY;
        particle.x = -20 + Math.random() * 40;
      }
    });
  }

  /**
   * Thinking animation - head tilt + thought bubbles pulse
   */
  private animateThinking(agent: AnimatedAgent, _dt: number): void {
    // Gentle sway
    const sway = Math.sin(agent.time * 1.5) * 3;
    agent.container.y = agent.baseY + sway;

    // Slight rotation (thinking head tilt)
    agent.container.rotation = Math.sin(agent.time * 0.8) * 0.05;
  }

  /**
   * Waiting animation - patient stance
   */
  private animateWaiting(agent: AnimatedAgent, _dt: number): void {
    // Very slow bob
    const wait = Math.sin(agent.time * 0.8) * 1.5;
    agent.container.y = agent.baseY + wait;

    // Reset rotation
    agent.container.rotation = 0;
  }

  /**
   * Clean up all animations
   */
  destroy(): void {
    this.stop();
    this.agents.forEach((agent) => {
      this.destroyWorkingParticles(agent);
    });
    this.agents.clear();
  }
}

// Singleton instance
let controllerInstance: AnimationController | null = null;

export function getAnimationController(): AnimationController {
  if (!controllerInstance) {
    controllerInstance = new AnimationController();
  }
  return controllerInstance;
}

export default AnimationController;
