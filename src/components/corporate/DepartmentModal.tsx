import { X } from 'lucide-react';
import { Department as DepartmentType } from '@/types/corporate';
import { useCorporate } from './CorporateContext';

const departmentInfo: Record<DepartmentType, { color: string; description: string }> = {
  financeiro: {
    color: '#10B981',
    description: 'Financial Dashboard - Track revenue, expenses, and financial health',
  },
  marketing: {
    color: '#8B5CF6',
    description: 'Marketing Dashboard - Manage posts, campaigns, and engagement metrics',
  },
  operacional: {
    color: '#F59E0B',
    description: 'Operational Dashboard - Manage tasks, workflows, and team productivity',
  },
  comercial: {
    color: '#3B82F6',
    description: 'Commercial Dashboard - Track sales pipeline, leads, and revenue goals',
  },
};

export function DepartmentModal() {
  const { selectedDepartment, isModalOpen, setIsModalOpen, setSelectedDepartment } = useCorporate();

  if (!isModalOpen || !selectedDepartment) return null;

  const info = departmentInfo[selectedDepartment];

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* Modal container */}
      <div
        className="bg-slate-800 border-4 rounded-none shadow-2xl w-full max-w-2xl"
        style={{
          borderColor: info.color,
          boxShadow: `0 0 30px ${info.color}60, inset 0 0 20px ${info.color}20`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b-2 flex items-center justify-between"
          style={{ borderColor: info.color, backgroundColor: `${info.color}20` }}
        >
          <h2
            className="text-2xl font-black font-pixel"
            style={{
              color: info.color,
              textShadow: `2px 2px 0 rgba(0,0,0,0.5)`,
            }}
          >
            {selectedDepartment.toUpperCase()} DASHBOARD
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-slate-300" />
          </button>
        </div>

        {/* Content - Placeholder */}
        <div className="p-8">
          <p className="text-slate-300 mb-4">{info.description}</p>

          {/* Coming soon message */}
          <div
            className="border-4 border-dashed p-6 text-center"
            style={{ borderColor: info.color }}
          >
            <p
              className="text-xl font-bold pixelated mb-2"
              style={{ color: info.color }}
            >
              🚀 COMING SOON
            </p>
            <p className="text-slate-400 text-sm">
              This dashboard is under construction. Check back soon!
            </p>
          </div>

          {/* Department info */}
          <div className="mt-6 p-4 bg-slate-700 border-2 border-slate-600 rounded">
            <h3 className="font-bold text-slate-200 mb-2">Department Info</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Status: Active</li>
              <li>• Members: Team in progress</li>
              <li>• Last update: Today</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-700 border-t-2" style={{ borderColor: info.color }}>
          <button
            onClick={handleClose}
            className="w-full py-2 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
