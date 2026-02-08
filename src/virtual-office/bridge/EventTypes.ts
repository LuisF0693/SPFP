// AIOS Bridge - Event Type Definitions
import type { AgentId, AgentStatus } from '../types';

// Inbound events (Claude Code -> Virtual Office)
export interface AgentStateEvent {
  type: 'agent_state';
  timestamp: number;
  agentId: AgentId;
  status: AgentStatus;
  activity?: string;
}

export interface ToolStartEvent {
  type: 'tool_start';
  timestamp: number;
  agentId: AgentId;
  toolName: string;
  description?: string;
}

export interface ToolCompleteEvent {
  type: 'tool_complete';
  timestamp: number;
  agentId: AgentId;
  toolName: string;
  success: boolean;
  summary?: string;
  duration?: number;
}

export interface TaskAssignedEvent {
  type: 'task_assigned';
  timestamp: number;
  agentId: AgentId;
  taskDescription: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AgentStopEvent {
  type: 'agent_stop';
  timestamp: number;
  agentId: AgentId;
  summary?: string;
}

export type AIOSInboundEvent =
  | AgentStateEvent
  | ToolStartEvent
  | ToolCompleteEvent
  | TaskAssignedEvent
  | AgentStopEvent;

// Outbound events (Virtual Office -> Claude Code)
export interface CommandEvent {
  type: 'command';
  timestamp: number;
  targetAgent: AgentId;
  command: string;
  args?: Record<string, unknown>;
}

export type AIOSOutboundEvent = CommandEvent;

// Bridge configuration
export interface AIOSBridgeConfig {
  pollInterval: number;
  eventsEndpoint: string;
  commandsEndpoint: string;
  onEvent: (event: AIOSInboundEvent) => void;
  onConnectionChange?: (connected: boolean) => void;
}
