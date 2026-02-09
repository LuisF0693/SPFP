// AIOS Virtual Office - Department Area Component
import type { Department, AgentState, AgentId } from '../types';
import { DEPARTMENTS, DEPARTMENT_COLORS } from '../data/agents';
import { AgentAvatar } from './AgentAvatar';

interface DepartmentAreaProps {
  department: Department;
  agents: AgentState[];
  selectedAgentId: string | null;
  onAgentClick: (agentId: string) => void;
  onAgentDoubleClick?: (agentId: AgentId) => void;
}

export function DepartmentArea({
  department,
  agents,
  selectedAgentId,
  onAgentClick,
  onAgentDoubleClick
}: DepartmentAreaProps) {
  const config = DEPARTMENTS[department];
  const colors = DEPARTMENT_COLORS[department];

  return (
    <div
      className="relative rounded-xl p-4 transition-all duration-300"
      style={{
        background: config.background,
        border: `1px solid ${colors.primary}33`,
        minWidth: config.bounds.w,
        minHeight: config.bounds.h
      }}
    >
      {/* Department Label */}
      <div
        className="absolute -top-3 left-4 px-3 py-0.5 rounded-full text-xs font-semibold"
        style={{
          background: colors.primary,
          color: '#fff'
        }}
      >
        {config.name}
      </div>

      {/* Agents Grid */}
      <div className="flex flex-wrap gap-6 pt-2 justify-center">
        {agents.map((agent) => (
          <AgentAvatar
            key={agent.id}
            agent={agent}
            selected={selectedAgentId === agent.id}
            onClick={() => onAgentClick(agent.id)}
            onDoubleClick={() => onAgentDoubleClick?.(agent.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default DepartmentArea;
