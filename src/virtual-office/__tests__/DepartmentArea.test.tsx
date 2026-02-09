// AIOS Virtual Office - DepartmentArea Component Tests
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DepartmentArea } from '../components/DepartmentArea';
import type { AgentState, Department } from '../types';

describe('DepartmentArea', () => {
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

  const engineeringAgents: AgentState[] = [
    createMockAgent({ id: 'dex', name: 'Dex', role: 'Developer', department: 'engineering' }),
    createMockAgent({ id: 'aria', name: 'Aria', role: 'Architect', department: 'engineering', emoji: '🏗️' }),
    createMockAgent({ id: 'nova', name: 'Nova', role: 'Data Engineer', department: 'engineering', emoji: '🔧' })
  ];

  const productAgents: AgentState[] = [
    createMockAgent({ id: 'morgan', name: 'Morgan', role: 'Product Manager', department: 'product', emoji: '👔' }),
    createMockAgent({ id: 'sophie', name: 'Sophie', role: 'Product Owner', department: 'product', emoji: '👁️' }),
    createMockAgent({ id: 'max', name: 'Max', role: 'Scrum Master', department: 'product', emoji: '📋' })
  ];

  describe('Rendering', () => {
    it('should render department label', () => {
      render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('should render all agents in the department', () => {
      render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      expect(screen.getByText('Dex')).toBeInTheDocument();
      expect(screen.getByText('Aria')).toBeInTheDocument();
      expect(screen.getByText('Nova')).toBeInTheDocument();
    });

    it('should render product department correctly', () => {
      render(
        <DepartmentArea
          department="product"
          agents={productAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Morgan')).toBeInTheDocument();
      expect(screen.getByText('Sophie')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
    });

    it('should render quality department with Quinn', () => {
      const qualityAgents: AgentState[] = [
        createMockAgent({ id: 'quinn', name: 'Quinn', role: 'QA Engineer', department: 'quality', emoji: '🧪' })
      ];

      render(
        <DepartmentArea
          department="quality"
          agents={qualityAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      expect(screen.getByText('Quality')).toBeInTheDocument();
      expect(screen.getByText('Quinn')).toBeInTheDocument();
    });

    it('should render design department with Luna', () => {
      const designAgents: AgentState[] = [
        createMockAgent({ id: 'luna', name: 'Luna', role: 'UX Designer', department: 'design', emoji: '🎨' })
      ];

      render(
        <DepartmentArea
          department="design"
          agents={designAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Luna')).toBeInTheDocument();
    });

    it('should render operations department', () => {
      const operationsAgents: AgentState[] = [
        createMockAgent({ id: 'orion', name: 'Orion', role: 'Master Orchestrator', department: 'operations', emoji: '👑' }),
        createMockAgent({ id: 'atlas', name: 'Atlas', role: 'Analyst', department: 'operations', emoji: '📊' }),
        createMockAgent({ id: 'gage', name: 'Gage', role: 'DevOps', department: 'operations', emoji: '🚀' })
      ];

      render(
        <DepartmentArea
          department="operations"
          agents={operationsAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      expect(screen.getByText('Operations')).toBeInTheDocument();
      expect(screen.getByText('Orion')).toBeInTheDocument();
      expect(screen.getByText('Atlas')).toBeInTheDocument();
      expect(screen.getByText('Gage')).toBeInTheDocument();
    });

    it('should handle empty agents array', () => {
      render(
        <DepartmentArea
          department="engineering"
          agents={[]}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.queryByText('Dex')).not.toBeInTheDocument();
    });
  });

  describe('Agent Selection', () => {
    it('should highlight selected agent', () => {
      render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId="dex"
          onAgentClick={() => {}}
        />
      );

      // Dex should be selected
      expect(screen.getByText('Dex')).toBeInTheDocument();
    });

    it('should not highlight non-selected agents', () => {
      render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId="dex"
          onAgentClick={() => {}}
        />
      );

      // Aria and Nova should not be selected
      expect(screen.getByText('Aria')).toBeInTheDocument();
      expect(screen.getByText('Nova')).toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onAgentClick with agent id when agent is clicked', () => {
      const handleClick = vi.fn();

      render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId={null}
          onAgentClick={handleClick}
        />
      );

      // Click on Dex's name container
      const dexName = screen.getByText('Dex');
      const dexContainer = dexName.closest('.cursor-pointer');
      fireEvent.click(dexContainer!);

      expect(handleClick).toHaveBeenCalledWith('dex');
    });

    it('should call onAgentClick with correct agent id for each agent', () => {
      const handleClick = vi.fn();

      render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId={null}
          onAgentClick={handleClick}
        />
      );

      // Click on each agent
      const ariaName = screen.getByText('Aria');
      const ariaContainer = ariaName.closest('.cursor-pointer');
      fireEvent.click(ariaContainer!);

      expect(handleClick).toHaveBeenCalledWith('aria');

      const novaName = screen.getByText('Nova');
      const novaContainer = novaName.closest('.cursor-pointer');
      fireEvent.click(novaContainer!);

      expect(handleClick).toHaveBeenCalledWith('nova');
    });
  });

  describe('Styling', () => {
    it('should apply department background color', () => {
      const { container } = render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      const departmentArea = container.firstChild as HTMLElement;
      // Check inline style contains rgba background
      expect(departmentArea.style.background).toContain('rgba');
    });

    it('should apply department border color', () => {
      const { container } = render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      const departmentArea = container.firstChild as HTMLElement;
      // Check inline style contains border
      expect(departmentArea.style.border).toContain('solid');
    });

    it('should have rounded corners', () => {
      const { container } = render(
        <DepartmentArea
          department="product"
          agents={productAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      const departmentArea = container.firstChild as HTMLElement;
      expect(departmentArea.className).toContain('rounded-xl');
    });

    it('should have correct padding', () => {
      const { container } = render(
        <DepartmentArea
          department="quality"
          agents={[]}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      const departmentArea = container.firstChild as HTMLElement;
      expect(departmentArea.className).toContain('p-4');
    });
  });

  describe('Department Label', () => {
    it('should have label positioned at top', () => {
      const { container } = render(
        <DepartmentArea
          department="design"
          agents={[]}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      const label = container.querySelector('.absolute');
      expect(label).toBeInTheDocument();
      expect(label?.className).toContain('-top-3');
    });

    it('should apply department primary color to label background', () => {
      render(
        <DepartmentArea
          department="engineering"
          agents={engineeringAgents}
          selectedAgentId={null}
          onAgentClick={() => {}}
        />
      );

      const label = screen.getByText('Engineering') as HTMLElement;
      // Check inline style contains rgb background color
      expect(label.style.background).toContain('rgb');
    });
  });

  describe('All Departments', () => {
    const departments: Department[] = ['product', 'engineering', 'quality', 'design', 'operations'];

    departments.forEach((department) => {
      it(`should render ${department} department correctly`, () => {
        render(
          <DepartmentArea
            department={department}
            agents={[]}
            selectedAgentId={null}
            onAgentClick={() => {}}
          />
        );

        // Department name should be capitalized
        const expectedName = department.charAt(0).toUpperCase() + department.slice(1);
        expect(screen.getByText(expectedName)).toBeInTheDocument();
      });
    });
  });
});
