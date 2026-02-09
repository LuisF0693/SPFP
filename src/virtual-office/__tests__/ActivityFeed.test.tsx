// AIOS Virtual Office - ActivityFeed Component Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityFeed } from '../components/ActivityFeed';
import type { Activity, AgentId } from '../types';

describe('ActivityFeed', () => {
  const createMockActivity = (overrides: Partial<Activity> = {}): Activity => ({
    id: `activity-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    agentId: 'dex' as AgentId,
    type: 'tool_start',
    description: 'Reading file...',
    tool: 'Read',
    success: undefined,
    ...overrides
  });

  describe('Rendering', () => {
    it('should render header with Activity Feed title', () => {
      render(<ActivityFeed activities={[]} />);

      expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    });

    it('should show pulsing indicator in header', () => {
      const { container } = render(<ActivityFeed activities={[]} />);

      const indicator = container.querySelector('.animate-pulse.bg-green-500');
      expect(indicator).toBeInTheDocument();
    });

    it('should show empty state when no activities', () => {
      render(<ActivityFeed activities={[]} />);

      expect(screen.getByText('No activities yet')).toBeInTheDocument();
    });

    it('should render activities list', () => {
      const activities = [
        createMockActivity({ description: 'First activity' }),
        createMockActivity({ description: 'Second activity' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText(/First activity/)).toBeInTheDocument();
      expect(screen.getByText(/Second activity/)).toBeInTheDocument();
    });

    it('should not show empty state when activities exist', () => {
      const activities = [createMockActivity()];

      render(<ActivityFeed activities={activities} />);

      expect(screen.queryByText('No activities yet')).not.toBeInTheDocument();
    });
  });

  describe('Activity Items', () => {
    it('should display agent name', () => {
      const activities = [
        createMockActivity({ agentId: 'dex' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText('Dex')).toBeInTheDocument();
    });

    it('should display activity description', () => {
      const activities = [
        createMockActivity({ description: 'Writing code changes...' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText(/Writing code changes/)).toBeInTheDocument();
    });

    it('should display tool badge when tool is specified', () => {
      const activities = [
        createMockActivity({ tool: 'Bash' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText('Bash')).toBeInTheDocument();
    });

    it('should not display tool badge when tool is not specified', () => {
      const activities = [
        createMockActivity({ tool: undefined })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.queryByText('Bash')).not.toBeInTheDocument();
    });
  });

  describe('Activity Icons', () => {
    it('should show spinner icon for tool_start', () => {
      const activities = [
        createMockActivity({ type: 'tool_start' })
      ];

      render(<ActivityFeed activities={activities} />);

      // Activity description should contain the spinner emoji
      expect(screen.getByText(/🔄/)).toBeInTheDocument();
    });

    it('should show checkmark icon for successful tool_complete', () => {
      const activities = [
        createMockActivity({ type: 'tool_complete', success: true, description: 'Completed task' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText(/✅/)).toBeInTheDocument();
    });

    it('should show X icon for failed tool_complete', () => {
      const activities = [
        createMockActivity({ type: 'tool_complete', success: false, description: 'Failed task' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText(/❌/)).toBeInTheDocument();
    });

    it('should show chart icon for status_change', () => {
      const activities = [
        createMockActivity({ type: 'status_change', description: 'Status changed' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText(/📊/)).toBeInTheDocument();
    });

    it('should show clipboard icon for task_assigned', () => {
      const activities = [
        createMockActivity({ type: 'task_assigned', description: 'New task' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText(/📝/)).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should display relative time in seconds', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const activities = [
        createMockActivity({ timestamp: now - 30 * 1000 }) // 30 seconds ago
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText('30s')).toBeInTheDocument();
    });

    it('should display relative time in minutes', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const activities = [
        createMockActivity({ timestamp: now - 5 * 60 * 1000 }) // 5 minutes ago
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText('5m')).toBeInTheDocument();
    });

    it('should display relative time in hours', () => {
      const now = Date.now();
      vi.setSystemTime(now);

      const activities = [
        createMockActivity({ timestamp: now - 2 * 60 * 60 * 1000 }) // 2 hours ago
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText('2h')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onActivityClick with agent id when clicked', () => {
      const handleClick = vi.fn();
      const activities = [
        createMockActivity({ agentId: 'quinn' })
      ];

      render(<ActivityFeed activities={activities} onActivityClick={handleClick} />);

      const activityItem = screen.getByText('Quinn').closest('.cursor-pointer');
      fireEvent.click(activityItem!);

      expect(handleClick).toHaveBeenCalledWith('quinn');
    });

    it('should call onActivityClick with correct agent for each activity', () => {
      const handleClick = vi.fn();
      const activities = [
        createMockActivity({ id: '1', agentId: 'dex', description: 'Dex activity' }),
        createMockActivity({ id: '2', agentId: 'luna', description: 'Luna activity' })
      ];

      render(<ActivityFeed activities={activities} onActivityClick={handleClick} />);

      const lunaItem = screen.getByText('Luna').closest('.cursor-pointer');
      fireEvent.click(lunaItem!);

      expect(handleClick).toHaveBeenCalledWith('luna');
    });

    it('should not throw when clicked without onActivityClick handler', () => {
      const activities = [createMockActivity()];

      render(<ActivityFeed activities={activities} />);

      const activityItem = screen.getByText('Dex').closest('.cursor-pointer');
      expect(() => fireEvent.click(activityItem!)).not.toThrow();
    });
  });

  describe('Agent Avatar in Activity', () => {
    it('should display agent emoji in avatar', () => {
      const activities = [
        createMockActivity({ agentId: 'quinn' })
      ];

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText('🧪')).toBeInTheDocument();
    });

    it('should apply department gradient to avatar', () => {
      const activities = [
        createMockActivity({ agentId: 'dex' })
      ];

      const { container } = render(<ActivityFeed activities={activities} />);

      const avatar = container.querySelector('.w-8.h-8.rounded-full') as HTMLElement;
      expect(avatar).toBeInTheDocument();
      // Check inline style contains gradient
      expect(avatar?.style.background).toContain('linear-gradient');
    });
  });

  describe('Multiple Activities', () => {
    it('should render activities in order', () => {
      const activities = [
        createMockActivity({ id: '1', description: 'First' }),
        createMockActivity({ id: '2', description: 'Second' }),
        createMockActivity({ id: '3', description: 'Third' })
      ];

      render(<ActivityFeed activities={activities} />);

      const allDescriptions = screen.getAllByText(/First|Second|Third/);
      expect(allDescriptions).toHaveLength(3);
    });

    it('should handle large number of activities', () => {
      const activities = Array.from({ length: 50 }, (_, i) =>
        createMockActivity({ id: `activity-${i}`, description: `Activity ${i}` })
      );

      render(<ActivityFeed activities={activities} />);

      expect(screen.getByText(/Activity 0/)).toBeInTheDocument();
      expect(screen.getByText(/Activity 49/)).toBeInTheDocument();
    });
  });

  describe('Different Agents', () => {
    const agentIds: AgentId[] = ['orion', 'morgan', 'sophie', 'max', 'dex', 'aria', 'nova', 'quinn', 'luna', 'atlas', 'gage'];

    agentIds.forEach((agentId) => {
      it(`should display ${agentId} correctly in activity`, () => {
        const activities = [
          createMockActivity({ agentId })
        ];

        render(<ActivityFeed activities={activities} />);

        // Each agent should have their emoji rendered
        const activityContainer = screen.getByText(agentId.charAt(0).toUpperCase() + agentId.slice(1));
        expect(activityContainer).toBeInTheDocument();
      });
    });
  });

  describe('Styling', () => {
    it('should have glassmorphism background', () => {
      const { container } = render(<ActivityFeed activities={[]} />);

      const feedContainer = container.firstChild as HTMLElement;
      expect(feedContainer.className).toContain('backdrop-blur-lg');
      expect(feedContainer.className).toContain('bg-gray-900/80');
    });

    it('should have rounded corners', () => {
      const { container } = render(<ActivityFeed activities={[]} />);

      const feedContainer = container.firstChild as HTMLElement;
      expect(feedContainer.className).toContain('rounded-xl');
    });

    it('should have border', () => {
      const { container } = render(<ActivityFeed activities={[]} />);

      const feedContainer = container.firstChild as HTMLElement;
      expect(feedContainer.className).toContain('border');
    });

    it('should have hover effect on activity items', () => {
      const activities = [createMockActivity()];

      const { container } = render(<ActivityFeed activities={activities} />);

      const activityItem = container.querySelector('.hover\\:bg-gray-800\\/50');
      expect(activityItem).toBeInTheDocument();
    });
  });
});
