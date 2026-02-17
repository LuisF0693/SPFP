import { useState } from 'react';
import { DepartmentConfig, Department as DepartmentType } from '@/types/corporate';
import { Department } from './Department';
import { useCorporate } from './CorporateContext';

// Department configurations with pixel art style
const departments: DepartmentConfig[] = [
  {
    id: 'financeiro',
    name: 'Financeiro',
    label: 'Financeiro',
    color: '#10B981', // Emerald
    bgColor: '#D1FAE5', // Light emerald
    borderColor: 'border-emerald-500',
    emoji: '💰',
    npc: { role: 'CFO', emoji: '👤' },
    position: { row: 0, col: 0 },
    description: 'Financial department with budget tracking and revenue analysis',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    label: 'Marketing',
    color: '#8B5CF6', // Violet
    bgColor: '#EDE9FE', // Light violet
    borderColor: 'border-violet-500',
    emoji: '📣',
    npc: { role: 'CMO', emoji: '👤' },
    position: { row: 0, col: 1 },
    description: 'Marketing department with social posts and campaigns',
  },
  {
    id: 'operacional',
    name: 'Operacional',
    label: 'Operacional',
    color: '#F59E0B', // Amber
    bgColor: '#FEF3C7', // Light amber
    borderColor: 'border-amber-500',
    emoji: '⚙️',
    npc: { role: 'COO', emoji: '👤' },
    position: { row: 1, col: 0 },
    description: 'Operational department with task management and workflows',
  },
  {
    id: 'comercial',
    name: 'Comercial',
    label: 'Comercial',
    color: '#3B82F6', // Blue
    bgColor: '#DBEAFE', // Light blue
    borderColor: 'border-blue-500',
    emoji: '🤝',
    npc: { role: 'CSO', emoji: '👤' },
    position: { row: 1, col: 1 },
    description: 'Commercial department with sales pipeline and leads',
  },
];

export function OfficeMap() {
  const { selectedDepartment, setSelectedDepartment, setIsModalOpen } = useCorporate();
  const [hoveredDepartment, setHoveredDepartment] = useState<DepartmentType | null>(null);

  const handleDepartmentClick = (dept: DepartmentConfig) => {
    setSelectedDepartment(dept.id);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-4xl font-black font-pixel mb-2 tracking-widest"
          style={{
            color: '#FFD700',
            textShadow: `3px 3px 0 rgba(0,0,0,0.8), 6px 6px 0 rgba(255,215,0,0.3)`,
          }}
        >
          CORPORATE HQ
        </h1>
        <p className="text-slate-300 text-sm">Click on a department to view its dashboard</p>
      </div>

      {/* Office Map Grid */}
      <div className="grid grid-cols-2 gap-6 flex-1 max-w-6xl mx-auto w-full mb-6">
        {departments.map((dept) => (
          <Department
            key={dept.id}
            department={dept}
            isHovered={hoveredDepartment === dept.id}
            isSelected={selectedDepartment === dept.id}
            onMouseEnter={() => setHoveredDepartment(dept.id)}
            onMouseLeave={() => setHoveredDepartment(null)}
            onClick={() => handleDepartmentClick(dept)}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div className="text-center text-slate-400 text-xs">
        <p>Hover over departments to interact • Click to open dashboard</p>
      </div>
    </div>
  );
}
