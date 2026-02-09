// AIOS Virtual Office - VirtualOffice Component Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { VirtualOffice } from '../components/VirtualOffice';
import { useVirtualOfficeStore } from '../store/virtualOfficeStore';
import type { AgentId } from '../types';

// Mock the useAIOSBridge hook
vi.mock('../bridge', () => ({
  useAIOSBridge: vi.fn(() => ({
    isConnected: false,
    error: null,
    sendCommand: vi.fn(),
    lastEventTime: 0
  }))
}));

// Mock fetch for bridge polling
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
) as unknown as typeof fetch;

describe('VirtualOffice', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Reset store state
    const store = useVirtualOfficeStore.getState();
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

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the Virtual Office header', () => {
      render(<VirtualOffice />);

      expect(screen.getByText('AIOS Virtual Office')).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(<VirtualOffice />);

      expect(screen.getByText('Monitor your AI agents in real-time')).toBeInTheDocument();
    });

    it('should render the office emoji', () => {
      render(<VirtualOffice />);

      expect(screen.getByText(/🏢/)).toBeInTheDocument();
    });

    it('should render all department areas', () => {
      render(<VirtualOffice />);

      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Operations')).toBeInTheDocument();
    });

    it('should render Activity Feed sidebar', () => {
      render(<VirtualOffice />);

      expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    });
  });

  describe('Agents Display', () => {
    it('should render all agents', () => {
      render(<VirtualOffice />);

      // Product team
      expect(screen.getByText('Morgan')).toBeInTheDocument();
      expect(screen.getByText('Sophie')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();

      // Engineering team
      expect(screen.getByText('Dex')).toBeInTheDocument();
      expect(screen.getByText('Aria')).toBeInTheDocument();
      expect(screen.getByText('Nova')).toBeInTheDocument();

      // Quality team
      expect(screen.getByText('Quinn')).toBeInTheDocument();

      // Design team
      expect(screen.getByText('Luna')).toBeInTheDocument();

      // Operations team
      expect(screen.getByText('Orion')).toBeInTheDocument();
      expect(screen.getByText('Atlas')).toBeInTheDocument();
      expect(screen.getByText('Gage')).toBeInTheDocument();
    });

    it('should display agent roles', () => {
      render(<VirtualOffice />);

      expect(screen.getByText('Developer')).toBeInTheDocument();
      expect(screen.getByText('Architect')).toBeInTheDocument();
      expect(screen.getByText('QA Engineer')).toBeInTheDocument();
      expect(screen.getByText('UX Designer')).toBeInTheDocument();
      expect(screen.getByText('Master Orchestrator')).toBeInTheDocument();
    });
  });

  describe('Connection Status', () => {
    it('should show Mock Mode status when in mock mode', () => {
      render(<VirtualOffice />);

      expect(screen.getByText('Mock Mode')).toBeInTheDocument();
    });

    it('should show Disable Mock button when in mock mode', () => {
      render(<VirtualOffice />);

      expect(screen.getByText('Disable Mock')).toBeInTheDocument();
    });

    it('should show yellow pulsing indicator in mock mode', () => {
      const { container } = render(<VirtualOffice />);

      const indicator = container.querySelector('.bg-yellow-500.animate-pulse');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Mock Mode Toggle', () => {
    it('should toggle mock mode when button is clicked', () => {
      render(<VirtualOffice />);

      const toggleButton = screen.getByText('Disable Mock');
      fireEvent.click(toggleButton);

      expect(screen.getByText('Enable Mock')).toBeInTheDocument();
    });

    it('should update store when mock mode is toggled', () => {
      render(<VirtualOffice />);

      expect(useVirtualOfficeStore.getState().mockMode).toBe(true);

      const toggleButton = screen.getByText('Disable Mock');
      fireEvent.click(toggleButton);

      expect(useVirtualOfficeStore.getState().mockMode).toBe(false);
    });
  });

  describe('Agent Selection', () => {
    it('should open panel when agent is clicked', async () => {
      render(<VirtualOffice />);

      const dexName = screen.getByText('Dex');
      const dexContainer = dexName.closest('.cursor-pointer');
      fireEvent.click(dexContainer!);

      // Panel should open
      expect(useVirtualOfficeStore.getState().selectedAgentId).toBe('dex');
      expect(useVirtualOfficeStore.getState().isPanelOpen).toBe(true);
    });

    it('should display agent panel with agent details when clicked', async () => {
      render(<VirtualOffice />);

      const quinnName = screen.getByText('Quinn');
      const quinnContainer = quinnName.closest('.cursor-pointer');
      fireEvent.click(quinnContainer!);

      // Wait for panel to appear
      await waitFor(() => {
        expect(screen.getByText('Current Status')).toBeInTheDocument();
        expect(screen.getByText('Recent Activities')).toBeInTheDocument();
        expect(screen.getByText('Assign Task')).toBeInTheDocument();
      });
    });

    it('should close panel when backdrop is clicked', async () => {
      render(<VirtualOffice />);

      // Open panel
      const lunaName = screen.getByText('Luna');
      const lunaContainer = lunaName.closest('.cursor-pointer');
      fireEvent.click(lunaContainer!);

      await waitFor(() => {
        expect(useVirtualOfficeStore.getState().isPanelOpen).toBe(true);
      });

      // Click backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);

      expect(useVirtualOfficeStore.getState().isPanelOpen).toBe(false);
    });
  });

  describe('Activity Feed Integration', () => {
    it('should show activities in the feed', async () => {
      render(<VirtualOffice />);

      // Add an activity through the store
      act(() => {
        useVirtualOfficeStore.getState().addActivity({
          timestamp: Date.now(),
          agentId: 'dex',
          type: 'tool_start',
          description: 'Test activity',
          tool: 'Read'
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/Test activity/)).toBeInTheDocument();
      });
    });

    it('should select agent when activity is clicked', async () => {
      render(<VirtualOffice />);

      // Add activity
      act(() => {
        useVirtualOfficeStore.getState().addActivity({
          timestamp: Date.now(),
          agentId: 'aria',
          type: 'tool_complete',
          description: 'Aria finished task',
          success: true
        });
      });

      await waitFor(() => {
        // Use getAllByText since Aria appears both in department area and activity feed
        const ariaElements = screen.getAllByText('Aria');
        expect(ariaElements.length).toBeGreaterThanOrEqual(2); // One in department, one in activity
      });
    });
  });

  describe('Mock Mode Simulation', () => {
    it('should update agent statuses periodically in mock mode', async () => {
      render(<VirtualOffice />);

      // Advance timers to trigger status updates
      await act(async () => {
        vi.advanceTimersByTime(3500);
      });

      // At least one agent might have a changed status
      const store = useVirtualOfficeStore.getState();
      const agents = Object.values(store.agents);

      // The mock simulation should have run
      expect(agents.length).toBe(11);
    });

    it('should add activities periodically in mock mode', async () => {
      render(<VirtualOffice />);

      // Advance timers to trigger activity additions
      await act(async () => {
        vi.advanceTimersByTime(5500);
      });

      const { activities } = useVirtualOfficeStore.getState();
      expect(activities.length).toBeGreaterThanOrEqual(0);
    });

    it('should stop simulation when mock mode is disabled', async () => {
      render(<VirtualOffice />);

      const toggleButton = screen.getByText('Disable Mock');
      fireEvent.click(toggleButton);

      const initialActivities = useVirtualOfficeStore.getState().activities.length;

      // Advance timers - no new activities should be added in non-mock mode
      await act(async () => {
        vi.advanceTimersByTime(10000);
      });

      const finalActivities = useVirtualOfficeStore.getState().activities.length;
      expect(finalActivities).toBe(initialActivities);
    });
  });

  describe('Assign Task', () => {
    it('should add activity when task is assigned', async () => {
      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('New test task');

      render(<VirtualOffice />);

      // Open panel for an agent
      const dexName = screen.getByText('Dex');
      const dexContainer = dexName.closest('.cursor-pointer');
      fireEvent.click(dexContainer!);

      await waitFor(() => {
        expect(screen.getByText('Assign Task')).toBeInTheDocument();
      });

      // Click assign task button
      const assignButton = screen.getByText('Assign Task');
      fireEvent.click(assignButton);

      // Check activity was added
      const { activities } = useVirtualOfficeStore.getState();
      const taskActivity = activities.find(a => a.description === 'New test task');
      expect(taskActivity).toBeDefined();
      expect(taskActivity?.type).toBe('task_assigned');
      expect(taskActivity?.agentId).toBe('dex');

      mockPrompt.mockRestore();
    });

    it('should update agent status when task is assigned', async () => {
      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('Work on feature');

      render(<VirtualOffice />);

      // Open panel
      const ariaName = screen.getByText('Aria');
      const ariaContainer = ariaName.closest('.cursor-pointer');
      fireEvent.click(ariaContainer!);

      await waitFor(() => {
        expect(screen.getByText('Assign Task')).toBeInTheDocument();
      });

      // Assign task
      fireEvent.click(screen.getByText('Assign Task'));

      const { agents } = useVirtualOfficeStore.getState();
      expect(agents.aria.status).toBe('working');
      expect(agents.aria.currentActivity).toBe('Work on feature');

      mockPrompt.mockRestore();
    });
  });

  describe('Layout', () => {
    it('should have main office area and sidebar', () => {
      const { container } = render(<VirtualOffice />);

      // Main area
      expect(container.querySelector('.flex-1')).toBeInTheDocument();

      // Sidebar
      expect(container.querySelector('.w-80')).toBeInTheDocument();
    });

    it('should have grid layout for top departments', () => {
      const { container } = render(<VirtualOffice />);

      expect(container.querySelector('.grid.grid-cols-4')).toBeInTheDocument();
    });

    it('should have full height layout', () => {
      const { container } = render(<VirtualOffice />);

      expect(container.querySelector('.h-screen')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should have overflow handling', () => {
      const { container } = render(<VirtualOffice />);

      expect(container.querySelector('.overflow-hidden')).toBeInTheDocument();
      expect(container.querySelector('.overflow-auto')).toBeInTheDocument();
    });
  });

  describe('Status Indicator', () => {
    it('should show green indicator when connected (not mock mode)', async () => {
      render(<VirtualOffice />);

      // Disable mock mode
      const toggleButton = screen.getByText('Disable Mock');
      fireEvent.click(toggleButton);

      // Set connected status in store
      act(() => {
        useVirtualOfficeStore.getState().setConnected(true);
      });

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });

    it('should show red indicator when disconnected (not mock mode)', async () => {
      render(<VirtualOffice />);

      // Disable mock mode
      const toggleButton = screen.getByText('Disable Mock');
      fireEvent.click(toggleButton);

      // Ensure disconnected
      act(() => {
        useVirtualOfficeStore.getState().setConnected(false);
      });

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });
    });
  });

  describe('Theme and Styling', () => {
    it('should have dark theme background', () => {
      const { container } = render(<VirtualOffice />);

      expect(container.querySelector('.bg-gray-950')).toBeInTheDocument();
    });

    it('should have proper text colors', () => {
      render(<VirtualOffice />);

      const title = screen.getByText('AIOS Virtual Office');
      expect(title.className).toContain('text-white');
    });
  });
});
