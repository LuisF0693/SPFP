// AIOS Virtual Office - AgentPanel Component Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentPanel } from '../components/AgentPanel';
import type { AgentState, Activity } from '../types';

describe('AgentPanel', () => {
  const createMockAgent = (overrides: Partial<AgentState> = {}): AgentState => ({
    id: 'dex',
    name: 'Dex',
    role: 'Developer',
    department: 'engineering',
    emoji: '💻',
    position: { x: 230, y: 100 },
    status: 'idle',
    currentActivity: undefined,
    lastActivityTime: undefined,
    ...overrides
  });

  const createMockActivity = (overrides: Partial<Activity> = {}): Activity => ({
    id: `activity-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    agentId: 'dex',
    type: 'tool_start',
    description: 'Reading file...',
    tool: 'Read',
    ...overrides
  });

  const defaultProps = {
    agent: createMockAgent(),
    activities: [],
    isOpen: true,
    onClose: vi.fn(),
    onAssignTask: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when agent is null', () => {
      const { container } = render(
        <AgentPanel {...defaultProps} agent={null} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when isOpen is false', () => {
      const { container } = render(
        <AgentPanel {...defaultProps} isOpen={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when agent is provided and isOpen is true', () => {
      render(<AgentPanel {...defaultProps} />);

      expect(screen.getByText('Dex')).toBeInTheDocument();
    });

    it('should display agent name and role', () => {
      render(<AgentPanel {...defaultProps} />);

      expect(screen.getByText('Dex')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });

    it('should display agent emoji', () => {
      render(<AgentPanel {...defaultProps} />);

      expect(screen.getByText('💻')).toBeInTheDocument();
    });

    it('should display department badge', () => {
      render(<AgentPanel {...defaultProps} />);

      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('should render close button', () => {
      const { container } = render(<AgentPanel {...defaultProps} />);

      // Look for the X icon from lucide-react
      const closeButton = container.querySelector('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      const { container } = render(
        <AgentPanel {...defaultProps} onClose={handleClose} />
      );

      const closeButton = container.querySelector('button');
      fireEvent.click(closeButton!);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      const handleClose = vi.fn();
      const { container } = render(
        <AgentPanel {...defaultProps} onClose={handleClose} />
      );

      const backdrop = container.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when panel content is clicked', () => {
      const handleClose = vi.fn();
      render(<AgentPanel {...defaultProps} onClose={handleClose} />);

      // Click on the agent name inside the panel
      const agentName = screen.getByText('Dex');
      fireEvent.click(agentName);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Status Display', () => {
    it('should display current status section', () => {
      render(<AgentPanel {...defaultProps} />);

      expect(screen.getByText('Current Status')).toBeInTheDocument();
    });

    it('should display idle status', () => {
      render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({ status: 'idle' })}
        />
      );

      expect(screen.getByText('idle')).toBeInTheDocument();
    });

    it('should display working status', () => {
      render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({ status: 'working' })}
        />
      );

      expect(screen.getByText('working')).toBeInTheDocument();
    });

    it('should display current activity when available', () => {
      render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({
            status: 'working',
            currentActivity: 'Writing unit tests...'
          })}
        />
      );

      expect(screen.getByText('Writing unit tests...')).toBeInTheDocument();
    });

    it('should not display activity text when no current activity', () => {
      render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({ currentActivity: undefined })}
        />
      );

      expect(screen.queryByText('Writing unit tests...')).not.toBeInTheDocument();
    });
  });

  describe('Status Badge Colors', () => {
    it('should show green badge for working status', () => {
      const { container } = render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({ status: 'working' })}
        />
      );

      const badge = container.querySelector('.bg-green-500');
      expect(badge).toBeInTheDocument();
    });

    it('should show yellow badge for thinking status', () => {
      const { container } = render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({ status: 'thinking' })}
        />
      );

      const badge = container.querySelector('.bg-yellow-500');
      expect(badge).toBeInTheDocument();
    });

    it('should show gray badge for waiting status', () => {
      const { container } = render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({ status: 'waiting' })}
        />
      );

      const badge = container.querySelector('.bg-gray-400');
      expect(badge).toBeInTheDocument();
    });

    it('should show red badge for error status', () => {
      const { container } = render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({ status: 'error' })}
        />
      );

      const badge = container.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
    });

    it('should show gray badge for idle status', () => {
      const { container } = render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({ status: 'idle' })}
        />
      );

      const badge = container.querySelector('.bg-gray-500');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Recent Activities', () => {
    it('should display Recent Activities section', () => {
      render(<AgentPanel {...defaultProps} />);

      expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    });

    it('should show message when no recent activities', () => {
      render(<AgentPanel {...defaultProps} activities={[]} />);

      expect(screen.getByText('No recent activities')).toBeInTheDocument();
    });

    it('should display agent activities', () => {
      const activities = [
        createMockActivity({ agentId: 'dex', description: 'Reading config file' }),
        createMockActivity({ agentId: 'dex', description: 'Writing test file' })
      ];

      render(<AgentPanel {...defaultProps} activities={activities} />);

      expect(screen.getByText('Reading config file')).toBeInTheDocument();
      expect(screen.getByText('Writing test file')).toBeInTheDocument();
    });

    it('should only show activities for the selected agent', () => {
      const activities = [
        createMockActivity({ agentId: 'dex', description: 'Dex activity' }),
        createMockActivity({ agentId: 'quinn', description: 'Quinn activity' })
      ];

      render(<AgentPanel {...defaultProps} activities={activities} />);

      expect(screen.getByText('Dex activity')).toBeInTheDocument();
      expect(screen.queryByText('Quinn activity')).not.toBeInTheDocument();
    });

    it('should limit activities to 5', () => {
      const activities = Array.from({ length: 10 }, (_, i) =>
        createMockActivity({
          id: `activity-${i}`,
          agentId: 'dex',
          description: `Activity ${i}`
        })
      );

      render(<AgentPanel {...defaultProps} activities={activities} />);

      // Should only show first 5 activities
      expect(screen.getByText('Activity 0')).toBeInTheDocument();
      expect(screen.getByText('Activity 4')).toBeInTheDocument();
      expect(screen.queryByText('Activity 5')).not.toBeInTheDocument();
    });

    it('should show success icon for completed activities', () => {
      const activities = [
        createMockActivity({
          agentId: 'dex',
          type: 'tool_complete',
          success: true,
          description: 'Completed task'
        })
      ];

      render(<AgentPanel {...defaultProps} activities={activities} />);

      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('should show spinner icon for in-progress activities', () => {
      const activities = [
        createMockActivity({
          agentId: 'dex',
          type: 'tool_start',
          description: 'In progress'
        })
      ];

      render(<AgentPanel {...defaultProps} activities={activities} />);

      expect(screen.getByText('🔄')).toBeInTheDocument();
    });
  });

  describe('Assign Task Button', () => {
    it('should render Assign Task button', () => {
      render(<AgentPanel {...defaultProps} />);

      expect(screen.getByText('Assign Task')).toBeInTheDocument();
    });

    it('should call onAssignTask when task is assigned', () => {
      const handleAssignTask = vi.fn();
      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('New task');

      render(
        <AgentPanel {...defaultProps} onAssignTask={handleAssignTask} />
      );

      const assignButton = screen.getByText('Assign Task');
      fireEvent.click(assignButton);

      expect(mockPrompt).toHaveBeenCalledWith('Assign task to Dex:');
      expect(handleAssignTask).toHaveBeenCalledWith('dex', 'New task');

      mockPrompt.mockRestore();
    });

    it('should not call onAssignTask when prompt is cancelled', () => {
      const handleAssignTask = vi.fn();
      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue(null);

      render(
        <AgentPanel {...defaultProps} onAssignTask={handleAssignTask} />
      );

      const assignButton = screen.getByText('Assign Task');
      fireEvent.click(assignButton);

      expect(handleAssignTask).not.toHaveBeenCalled();

      mockPrompt.mockRestore();
    });

    it('should not call onAssignTask when empty string is entered', () => {
      const handleAssignTask = vi.fn();
      const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('');

      render(
        <AgentPanel {...defaultProps} onAssignTask={handleAssignTask} />
      );

      const assignButton = screen.getByText('Assign Task');
      fireEvent.click(assignButton);

      expect(handleAssignTask).not.toHaveBeenCalled();

      mockPrompt.mockRestore();
    });
  });

  describe('Different Agents', () => {
    it('should display Quinn correctly', () => {
      render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({
            id: 'quinn',
            name: 'Quinn',
            role: 'QA Engineer',
            department: 'quality',
            emoji: '🧪'
          })}
        />
      );

      expect(screen.getByText('Quinn')).toBeInTheDocument();
      expect(screen.getByText('QA Engineer')).toBeInTheDocument();
      expect(screen.getByText('Quality')).toBeInTheDocument();
      expect(screen.getByText('🧪')).toBeInTheDocument();
    });

    it('should display Orion correctly', () => {
      render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({
            id: 'orion',
            name: 'Orion',
            role: 'Master Orchestrator',
            department: 'operations',
            emoji: '👑'
          })}
        />
      );

      expect(screen.getByText('Orion')).toBeInTheDocument();
      expect(screen.getByText('Master Orchestrator')).toBeInTheDocument();
      expect(screen.getByText('Operations')).toBeInTheDocument();
      expect(screen.getByText('👑')).toBeInTheDocument();
    });

    it('should display Luna correctly', () => {
      render(
        <AgentPanel
          {...defaultProps}
          agent={createMockAgent({
            id: 'luna',
            name: 'Luna',
            role: 'UX Designer',
            department: 'design',
            emoji: '🎨'
          })}
        />
      );

      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('UX Designer')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('🎨')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have backdrop blur effect', () => {
      const { container } = render(<AgentPanel {...defaultProps} />);

      const backdrop = container.querySelector('.backdrop-blur-sm');
      expect(backdrop).toBeInTheDocument();
    });

    it('should have slide-in animation class', () => {
      const { container } = render(<AgentPanel {...defaultProps} />);

      const panel = container.querySelector('.animate-slide-in-right');
      expect(panel).toBeInTheDocument();
    });

    it('should apply department gradient to avatar', () => {
      const { container } = render(<AgentPanel {...defaultProps} />);

      const avatar = container.querySelector('.w-20.h-20.rounded-full') as HTMLElement;
      expect(avatar).toBeInTheDocument();
      // Check inline style contains gradient
      expect(avatar?.style.background).toContain('linear-gradient');
    });

    it('should apply department gradient to assign button', () => {
      render(<AgentPanel {...defaultProps} />);

      const button = screen.getByText('Assign Task') as HTMLElement;
      // Check inline style contains gradient
      expect(button.style.background).toContain('linear-gradient');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible for close button', () => {
      const handleClose = vi.fn();
      const { container } = render(
        <AgentPanel {...defaultProps} onClose={handleClose} />
      );

      const closeButton = container.querySelector('button');
      closeButton?.focus();
      fireEvent.keyDown(closeButton!, { key: 'Enter' });

      // Button should be focusable
      expect(document.activeElement).toBe(closeButton);
    });
  });
});
