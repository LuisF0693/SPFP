// AIOS Bridge - Mock Data Generator for Development
import type { AgentId, AgentStatus } from '../types';
import type { AIOSInboundEvent } from './EventTypes';
import { AGENTS } from '../data/agents';

const AGENT_IDS = Object.keys(AGENTS) as AgentId[];
const STATUSES: AgentStatus[] = ['idle', 'working', 'thinking', 'waiting'];
const TOOLS = ['Read', 'Write', 'Bash', 'Grep', 'Edit', 'Task', 'Glob', 'WebFetch'];

const ACTIVITIES = [
  'Reading file contents...',
  'Writing code changes...',
  'Running tests...',
  'Searching codebase...',
  'Analyzing requirements...',
  'Creating documentation...',
  'Reviewing code...',
  'Fixing bug in component...',
  'Implementing new feature...',
  'Refactoring module...',
  'Updating dependencies...',
  'Checking types...',
  'Building project...',
  'Deploying changes...',
  'Optimizing performance...'
];

export class MockBridge {
  private intervalId: NodeJS.Timeout | null = null;
  private eventCallback: ((event: AIOSInboundEvent) => void) | null = null;
  private statusIntervalId: NodeJS.Timeout | null = null;

  constructor(private config: {
    activityInterval: number;
    statusInterval: number;
  } = {
    activityInterval: 5000,
    statusInterval: 3000
  }) {}

  start(onEvent: (event: AIOSInboundEvent) => void): void {
    this.eventCallback = onEvent;

    // Generate random activities
    this.intervalId = setInterval(() => {
      this.generateRandomActivity();
    }, this.config.activityInterval);

    // Generate random status changes
    this.statusIntervalId = setInterval(() => {
      this.generateRandomStatusChange();
    }, this.config.statusInterval);

    // Initial activity
    setTimeout(() => this.generateRandomActivity(), 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.statusIntervalId) {
      clearInterval(this.statusIntervalId);
      this.statusIntervalId = null;
    }
    this.eventCallback = null;
  }

  private generateRandomActivity(): void {
    if (!this.eventCallback) return;

    const agentId = this.getRandomItem(AGENT_IDS);
    const tool = this.getRandomItem(TOOLS);
    const description = this.getRandomItem(ACTIVITIES);
    const isStart = Math.random() > 0.6;

    const event: AIOSInboundEvent = isStart
      ? {
          type: 'tool_start',
          timestamp: Date.now(),
          agentId,
          toolName: tool,
          description
        }
      : {
          type: 'tool_complete',
          timestamp: Date.now(),
          agentId,
          toolName: tool,
          success: Math.random() > 0.1,
          summary: description,
          duration: Math.floor(Math.random() * 5000) + 500
        };

    this.eventCallback(event);
  }

  private generateRandomStatusChange(): void {
    if (!this.eventCallback) return;

    const agentId = this.getRandomItem(AGENT_IDS);
    const status = this.getRandomItem(STATUSES);
    const activity = status !== 'idle' ? this.getRandomItem(ACTIVITIES) : undefined;

    const event: AIOSInboundEvent = {
      type: 'agent_state',
      timestamp: Date.now(),
      agentId,
      status,
      activity
    };

    this.eventCallback(event);
  }

  private getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Simulate a specific agent working
  simulateAgentWorking(agentId: AgentId, activity: string): void {
    if (!this.eventCallback) return;

    // Start event
    this.eventCallback({
      type: 'agent_state',
      timestamp: Date.now(),
      agentId,
      status: 'working',
      activity
    });

    // Tool start
    setTimeout(() => {
      this.eventCallback?.({
        type: 'tool_start',
        timestamp: Date.now(),
        agentId,
        toolName: 'Task',
        description: activity
      });
    }, 500);

    // Complete after random time
    setTimeout(() => {
      this.eventCallback?.({
        type: 'tool_complete',
        timestamp: Date.now(),
        agentId,
        toolName: 'Task',
        success: true,
        summary: `Completed: ${activity}`
      });

      this.eventCallback?.({
        type: 'agent_state',
        timestamp: Date.now(),
        agentId,
        status: 'idle'
      });
    }, Math.random() * 10000 + 5000);
  }
}

// Singleton instance
let mockBridgeInstance: MockBridge | null = null;

export function getMockBridge(): MockBridge {
  if (!mockBridgeInstance) {
    mockBridgeInstance = new MockBridge();
  }
  return mockBridgeInstance;
}

export default MockBridge;
