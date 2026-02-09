// AIOS Virtual Office - Store Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useVirtualOfficeStore } from '../store/virtualOfficeStore';
import type { AgentId, AgentStatus } from '../types';

describe('virtualOfficeStore', () => {
  // Reset store state before each test
  beforeEach(() => {
    const store = useVirtualOfficeStore.getState();
    // Reset to initial state
    act(() => {
      store.clearActivities();
      store.selectAgent(null);
      store.setMockMode(true);
      store.setConnected(false);
      // Reset all agents to idle
      Object.keys(store.agents).forEach((agentId) => {
        store.setAgentStatus(agentId as AgentId, 'idle', undefined);
      });
    });
  });

  describe('Initial State', () => {
    it('should have all 11 agents initialized', () => {
      const { agents } = useVirtualOfficeStore.getState();
      const agentIds = Object.keys(agents);

      expect(agentIds).toHaveLength(11);
      expect(agentIds).toContain('orion');
      expect(agentIds).toContain('morgan');
      expect(agentIds).toContain('dex');
      expect(agentIds).toContain('quinn');
      expect(agentIds).toContain('luna');
    });

    it('should initialize all agents with idle status', () => {
      const { agents } = useVirtualOfficeStore.getState();

      Object.values(agents).forEach((agent) => {
        expect(agent.status).toBe('idle');
        expect(agent.currentActivity).toBeUndefined();
      });
    });

    it('should start with no selected agent', () => {
      const { selectedAgentId, isPanelOpen } = useVirtualOfficeStore.getState();

      expect(selectedAgentId).toBeNull();
      expect(isPanelOpen).toBe(false);
    });

    it('should start with empty activities', () => {
      const { activities } = useVirtualOfficeStore.getState();

      expect(activities).toEqual([]);
    });

    it('should start in mock mode', () => {
      const { mockMode } = useVirtualOfficeStore.getState();

      expect(mockMode).toBe(true);
    });

    it('should start disconnected', () => {
      const { isConnected } = useVirtualOfficeStore.getState();

      expect(isConnected).toBe(false);
    });
  });

  describe('setAgentStatus', () => {
    it('should update agent status', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.setAgentStatus('dex', 'working', 'Writing code...');
      });

      const { agents } = useVirtualOfficeStore.getState();
      expect(agents.dex.status).toBe('working');
      expect(agents.dex.currentActivity).toBe('Writing code...');
    });

    it('should update lastActivityTime when status changes', () => {
      const store = useVirtualOfficeStore.getState();
      const beforeTime = Date.now();

      act(() => {
        store.setAgentStatus('quinn', 'thinking', 'Analyzing tests...');
      });

      const { agents } = useVirtualOfficeStore.getState();
      expect(agents.quinn.lastActivityTime).toBeGreaterThanOrEqual(beforeTime);
    });

    it('should handle all status types', () => {
      const store = useVirtualOfficeStore.getState();
      const statuses: AgentStatus[] = ['idle', 'working', 'thinking', 'waiting', 'error'];

      statuses.forEach((status) => {
        act(() => {
          store.setAgentStatus('aria', status);
        });

        const { agents } = useVirtualOfficeStore.getState();
        expect(agents.aria.status).toBe(status);
      });
    });

    it('should clear activity when status is idle without activity', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.setAgentStatus('nova', 'working', 'Building pipeline...');
      });

      act(() => {
        store.setAgentStatus('nova', 'idle', undefined);
      });

      const { agents } = useVirtualOfficeStore.getState();
      expect(agents.nova.status).toBe('idle');
      expect(agents.nova.currentActivity).toBeUndefined();
    });
  });

  describe('selectAgent', () => {
    it('should select an agent and open panel', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.selectAgent('morgan');
      });

      const { selectedAgentId, isPanelOpen } = useVirtualOfficeStore.getState();
      expect(selectedAgentId).toBe('morgan');
      expect(isPanelOpen).toBe(true);
    });

    it('should deselect agent and close panel when null', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.selectAgent('sophie');
      });

      act(() => {
        store.selectAgent(null);
      });

      const { selectedAgentId, isPanelOpen } = useVirtualOfficeStore.getState();
      expect(selectedAgentId).toBeNull();
      expect(isPanelOpen).toBe(false);
    });

    it('should switch between agents correctly', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.selectAgent('max');
      });

      expect(useVirtualOfficeStore.getState().selectedAgentId).toBe('max');

      act(() => {
        store.selectAgent('gage');
      });

      const { selectedAgentId, isPanelOpen } = useVirtualOfficeStore.getState();
      expect(selectedAgentId).toBe('gage');
      expect(isPanelOpen).toBe(true);
    });
  });

  describe('addActivity', () => {
    it('should add activity with generated id', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.addActivity({
          timestamp: Date.now(),
          agentId: 'dex',
          type: 'tool_start',
          description: 'Reading file...',
          tool: 'Read'
        });
      });

      const { activities } = useVirtualOfficeStore.getState();
      expect(activities).toHaveLength(1);
      expect(activities[0].id).toBeDefined();
      expect(activities[0].agentId).toBe('dex');
      expect(activities[0].type).toBe('tool_start');
      expect(activities[0].tool).toBe('Read');
    });

    it('should prepend new activities (newest first)', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.addActivity({
          timestamp: 1000,
          agentId: 'quinn',
          type: 'tool_start',
          description: 'First activity'
        });
      });

      act(() => {
        store.addActivity({
          timestamp: 2000,
          agentId: 'luna',
          type: 'tool_complete',
          description: 'Second activity',
          success: true
        });
      });

      const { activities } = useVirtualOfficeStore.getState();
      expect(activities).toHaveLength(2);
      expect(activities[0].description).toBe('Second activity');
      expect(activities[1].description).toBe('First activity');
    });

    it('should limit activities to 50 entries', () => {
      const store = useVirtualOfficeStore.getState();

      // Add 55 activities
      act(() => {
        for (let i = 0; i < 55; i++) {
          store.addActivity({
            timestamp: i * 1000,
            agentId: 'atlas',
            type: 'status_change',
            description: `Activity ${i}`
          });
        }
      });

      const { activities } = useVirtualOfficeStore.getState();
      expect(activities).toHaveLength(50);
      // Newest should be first
      expect(activities[0].description).toBe('Activity 54');
      // Oldest (first 5 added) should be trimmed
    });

    it('should handle different activity types', () => {
      const store = useVirtualOfficeStore.getState();

      const activityTypes = [
        { type: 'tool_start' as const, tool: 'Read' },
        { type: 'tool_complete' as const, tool: 'Write', success: true },
        { type: 'status_change' as const },
        { type: 'task_assigned' as const }
      ];

      activityTypes.forEach((activityData, index) => {
        act(() => {
          store.addActivity({
            timestamp: index * 1000,
            agentId: 'orion',
            description: `Activity type: ${activityData.type}`,
            ...activityData
          });
        });
      });

      const { activities } = useVirtualOfficeStore.getState();
      expect(activities).toHaveLength(4);
    });
  });

  describe('setMockMode', () => {
    it('should enable mock mode', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.setMockMode(false);
      });

      expect(useVirtualOfficeStore.getState().mockMode).toBe(false);

      act(() => {
        store.setMockMode(true);
      });

      expect(useVirtualOfficeStore.getState().mockMode).toBe(true);
    });
  });

  describe('setConnected', () => {
    it('should update connection status', () => {
      const store = useVirtualOfficeStore.getState();

      act(() => {
        store.setConnected(true);
      });

      expect(useVirtualOfficeStore.getState().isConnected).toBe(true);

      act(() => {
        store.setConnected(false);
      });

      expect(useVirtualOfficeStore.getState().isConnected).toBe(false);
    });
  });

  describe('clearActivities', () => {
    it('should clear all activities', () => {
      const store = useVirtualOfficeStore.getState();

      // Add some activities
      act(() => {
        store.addActivity({
          timestamp: Date.now(),
          agentId: 'dex',
          type: 'tool_start',
          description: 'Activity 1'
        });
        store.addActivity({
          timestamp: Date.now(),
          agentId: 'quinn',
          type: 'tool_complete',
          description: 'Activity 2',
          success: true
        });
      });

      expect(useVirtualOfficeStore.getState().activities.length).toBeGreaterThan(0);

      act(() => {
        store.clearActivities();
      });

      expect(useVirtualOfficeStore.getState().activities).toEqual([]);
    });
  });

  describe('Agent Properties', () => {
    it('should have correct agent departments', () => {
      const { agents } = useVirtualOfficeStore.getState();

      // Product team
      expect(agents.morgan.department).toBe('product');
      expect(agents.sophie.department).toBe('product');
      expect(agents.max.department).toBe('product');

      // Engineering team
      expect(agents.dex.department).toBe('engineering');
      expect(agents.aria.department).toBe('engineering');
      expect(agents.nova.department).toBe('engineering');

      // Quality team
      expect(agents.quinn.department).toBe('quality');

      // Design team
      expect(agents.luna.department).toBe('design');

      // Operations team
      expect(agents.orion.department).toBe('operations');
      expect(agents.atlas.department).toBe('operations');
      expect(agents.gage.department).toBe('operations');
    });

    it('should have correct agent roles', () => {
      const { agents } = useVirtualOfficeStore.getState();

      expect(agents.orion.role).toBe('Master Orchestrator');
      expect(agents.dex.role).toBe('Developer');
      expect(agents.quinn.role).toBe('QA Engineer');
      expect(agents.luna.role).toBe('UX Designer');
    });

    it('should have correct agent emojis', () => {
      const { agents } = useVirtualOfficeStore.getState();

      expect(agents.orion.emoji).toBeDefined();
      expect(agents.dex.emoji).toBeDefined();
      expect(agents.quinn.emoji).toBeDefined();
    });
  });
});
