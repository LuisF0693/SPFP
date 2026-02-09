// AIOS Virtual Office - AgentAvatar Component Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentAvatar } from '../components/AgentAvatar';
import type { AgentState } from '../types';

describe('AgentAvatar', () => {
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

  describe('Rendering', () => {
    it('should render agent name and role', () => {
      render(<AgentAvatar agent={createMockAgent()} />);

      expect(screen.getByText('Dex')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });

    it('should render agent emoji', () => {
      render(<AgentAvatar agent={createMockAgent({ emoji: '🧪' })} />);

      expect(screen.getByText('🧪')).toBeInTheDocument();
    });

    it('should render different sizes correctly', () => {
      const { rerender, container } = render(
        <AgentAvatar agent={createMockAgent()} size="sm" />
      );

      // Check small size
      let avatarCircle = container.querySelector('.w-12');
      expect(avatarCircle).toBeInTheDocument();

      // Check medium size (default)
      rerender(<AgentAvatar agent={createMockAgent()} size="md" />);
      avatarCircle = container.querySelector('.w-16');
      expect(avatarCircle).toBeInTheDocument();

      // Check large size
      rerender(<AgentAvatar agent={createMockAgent()} size="lg" />);
      avatarCircle = container.querySelector('.w-20');
      expect(avatarCircle).toBeInTheDocument();
    });

    it('should apply selected styles when selected', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent()} selected={true} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('scale-110');
    });

    it('should not apply selected styles when not selected', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent()} selected={false} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).not.toContain('scale-110');
    });
  });

  describe('Status Badge', () => {
    it('should show gray badge for idle status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'idle' })} />
      );

      const badge = container.querySelector('.bg-gray-500');
      expect(badge).toBeInTheDocument();
    });

    it('should show green pulsing badge for working status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'working' })} />
      );

      const badge = container.querySelector('.bg-green-500');
      expect(badge).toBeInTheDocument();
      expect(badge?.className).toContain('animate-pulse');
    });

    it('should show yellow pulsing badge for thinking status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'thinking' })} />
      );

      const badge = container.querySelector('.bg-yellow-500');
      expect(badge).toBeInTheDocument();
      expect(badge?.className).toContain('animate-pulse');
    });

    it('should show gray badge for waiting status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'waiting' })} />
      );

      const badge = container.querySelector('.bg-gray-400');
      expect(badge).toBeInTheDocument();
    });

    it('should show red pinging badge for error status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'error' })} />
      );

      const badge = container.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
      expect(badge?.className).toContain('animate-ping');
    });
  });

  describe('Activity Indicator', () => {
    it('should show activity indicator when agent has current activity', () => {
      render(
        <AgentAvatar
          agent={createMockAgent({ currentActivity: 'Writing tests...' })}
        />
      );

      expect(screen.getByText('Writing tests...')).toBeInTheDocument();
    });

    it('should not show activity indicator when no current activity', () => {
      render(
        <AgentAvatar agent={createMockAgent({ currentActivity: undefined })} />
      );

      expect(screen.queryByText('Writing tests...')).not.toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<AgentAvatar agent={createMockAgent()} onClick={handleClick} />);

      const avatar = screen.getByText('Dex').closest('div')?.parentElement;
      fireEvent.click(avatar!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not throw when clicked without onClick handler', () => {
      render(<AgentAvatar agent={createMockAgent()} />);

      const avatar = screen.getByText('Dex').closest('div')?.parentElement;
      expect(() => fireEvent.click(avatar!)).not.toThrow();
    });
  });

  describe('Department Colors', () => {
    it('should apply engineering department gradient', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ department: 'engineering' })} />
      );

      const avatarCircle = container.querySelector('.rounded-full') as HTMLElement;
      expect(avatarCircle).toBeInTheDocument();
      // Check inline style contains gradient
      expect(avatarCircle?.style.background).toContain('linear-gradient');
    });

    it('should apply product department gradient', () => {
      const { container } = render(
        <AgentAvatar
          agent={createMockAgent({
            id: 'morgan',
            name: 'Morgan',
            department: 'product'
          })}
        />
      );

      const avatarCircle = container.querySelector('.rounded-full') as HTMLElement;
      expect(avatarCircle).toBeInTheDocument();
      expect(avatarCircle?.style.background).toContain('linear-gradient');
    });
  });

  describe('Animation Classes', () => {
    it('should apply breathing animation for idle status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'idle' })} />
      );

      const avatarCircle = container.querySelector('.animate-breathing');
      expect(avatarCircle).toBeInTheDocument();
    });

    it('should apply typing animation for working status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'working' })} />
      );

      const avatarCircle = container.querySelector('.animate-typing');
      expect(avatarCircle).toBeInTheDocument();
    });

    it('should apply thinking animation for thinking status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'thinking' })} />
      );

      const avatarCircle = container.querySelector('.animate-thinking');
      expect(avatarCircle).toBeInTheDocument();
    });

    it('should apply shake animation for error status', () => {
      const { container } = render(
        <AgentAvatar agent={createMockAgent({ status: 'error' })} />
      );

      const avatarCircle = container.querySelector('.animate-shake');
      expect(avatarCircle).toBeInTheDocument();
    });
  });
});
