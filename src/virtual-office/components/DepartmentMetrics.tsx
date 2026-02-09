// AIOS Virtual Office - Department Metrics Widget
import { useState, useMemo, useCallback } from 'react';
import { useVirtualOfficeStore } from '../store/virtualOfficeStore';
import { DEPARTMENTS, DEPARTMENT_COLORS, getAgentsByDepartment } from '../data/agents';
import type { Department, AgentId } from '../types';

interface DepartmentMetric {
  department: Department;
  name: string;
  color: string;
  activeAgents: number;
  totalAgents: number;
  completedTasksToday: number;
  progressPercent: number;
}

export function DepartmentMetrics() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredDept, setHoveredDept] = useState<Department | null>(null);

  const agents = useVirtualOfficeStore((state) => state.agents);
  const activities = useVirtualOfficeStore((state) => state.activities);

  // Calculate metrics for each department
  const metrics = useMemo((): DepartmentMetric[] => {
    const departments: Department[] = ['product', 'engineering', 'quality', 'design', 'operations'];
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTimestamp = todayStart.getTime();

    return departments.map((dept) => {
      const deptConfig = DEPARTMENTS[dept];
      const deptColors = DEPARTMENT_COLORS[dept];
      const deptAgents = getAgentsByDepartment(dept);
      const deptAgentIds = deptAgents.map(a => a.id);

      // Count active agents (status !== 'idle')
      const activeAgents = deptAgentIds.filter(
        (id) => agents[id]?.status !== 'idle'
      ).length;

      // Count completed tasks today (tool_complete activities)
      const completedTasksToday = activities.filter(
        (activity) =>
          activity.type === 'tool_complete' &&
          activity.success === true &&
          deptAgentIds.includes(activity.agentId) &&
          activity.timestamp >= todayTimestamp
      ).length;

      // Calculate progress percentage based on active agents ratio
      const progressPercent = deptAgents.length > 0
        ? Math.round((activeAgents / deptAgents.length) * 100)
        : 0;

      return {
        department: dept,
        name: deptConfig.name,
        color: deptColors.primary,
        activeAgents,
        totalAgents: deptAgents.length,
        completedTasksToday,
        progressPercent
      };
    });
  }, [agents, activities]);

  // Calculate totals for tooltip
  const totals = useMemo(() => {
    return metrics.reduce(
      (acc, m) => ({
        activeAgents: acc.activeAgents + m.activeAgents,
        totalAgents: acc.totalAgents + m.totalAgents,
        completedTasksToday: acc.completedTasksToday + m.completedTasksToday
      }),
      { activeAgents: 0, totalAgents: 0, completedTasksToday: 0 }
    );
  }, [metrics]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Collapsed state - just show icon
  if (isCollapsed) {
    return (
      <div
        className="absolute top-4 left-4 z-20"
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={toggleCollapse}
          className="w-10 h-10 rounded-xl flex items-center justify-center
            bg-gray-900/80 backdrop-blur-lg border border-gray-700/50
            hover:bg-gray-800/80 hover:border-gray-600/50
            transition-all duration-200 shadow-lg"
          title={`Metrics: ${totals.activeAgents}/${totals.totalAgents} active, ${totals.completedTasksToday} tasks completed today`}
        >
          <span className="text-lg">📊</span>
        </button>
      </div>
    );
  }

  // Expanded state - show full widget
  return (
    <div
      className="absolute top-4 left-4 z-20"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="w-64 rounded-xl overflow-hidden
          bg-gray-900/80 backdrop-blur-lg border border-gray-700/50
          shadow-lg shadow-black/20"
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-700/50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white flex items-center gap-2">
            <span>📊</span>
            Department Metrics
          </h3>
          <button
            onClick={toggleCollapse}
            className="w-6 h-6 rounded flex items-center justify-center
              text-gray-400 hover:text-white hover:bg-gray-700/50
              transition-colors duration-200"
            title="Collapse"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Department List */}
        <div className="px-2 py-2 space-y-1.5">
          {metrics.map((metric) => (
            <DepartmentRow
              key={metric.department}
              metric={metric}
              isHovered={hoveredDept === metric.department}
              onMouseEnter={() => setHoveredDept(metric.department)}
              onMouseLeave={() => setHoveredDept(null)}
            />
          ))}
        </div>

        {/* Footer Summary */}
        <div className="px-3 py-2 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>
              Total: {totals.activeAgents}/{totals.totalAgents} ativos
            </span>
            <span>
              {totals.completedTasksToday} tasks hoje
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DepartmentRowProps {
  metric: DepartmentMetric;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function DepartmentRow({ metric, isHovered, onMouseEnter, onMouseLeave }: DepartmentRowProps) {
  return (
    <div
      className={`relative px-2 py-1.5 rounded-lg transition-all duration-200
        ${isHovered ? 'bg-gray-800/60' : 'bg-gray-800/30'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Main Row Content */}
      <div className="flex items-center justify-between mb-1">
        {/* Department Name with Color Indicator */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: metric.color }}
          />
          <span className="text-xs font-medium text-white">{metric.name}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-[10px]">
          <span
            className={`${
              metric.activeAgents > 0 ? 'text-green-400' : 'text-gray-500'
            }`}
          >
            {metric.activeAgents}/{metric.totalAgents} ativos
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">{metric.completedTasksToday} tasks</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 rounded-full bg-gray-700/50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${metric.progressPercent}%`,
            backgroundColor: metric.color,
            boxShadow: metric.progressPercent > 0 ? `0 0 6px ${metric.color}` : 'none'
          }}
        />
      </div>

      {/* Tooltip on Hover */}
      {isHovered && (
        <div
          className="absolute left-full ml-2 top-0 z-30 w-48 p-2 rounded-lg
            bg-gray-900/95 backdrop-blur-sm border border-gray-600/50
            shadow-xl shadow-black/30 text-xs"
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color }}
            />
            <span className="font-semibold text-white">{metric.name}</span>
          </div>
          <div className="space-y-1 text-gray-300">
            <div className="flex justify-between">
              <span>Agentes ativos:</span>
              <span className="text-white font-medium">
                {metric.activeAgents} de {metric.totalAgents}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tasks completadas:</span>
              <span className="text-white font-medium">{metric.completedTasksToday}</span>
            </div>
            <div className="flex justify-between">
              <span>Utilizacao:</span>
              <span className="text-white font-medium">{metric.progressPercent}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentMetrics;
