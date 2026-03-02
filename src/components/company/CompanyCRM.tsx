import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell, Plus, Menu, X, LayoutGrid, Users, Activity, Archive } from 'lucide-react';
import { CompanySidebar } from './CompanySidebar';
import { SquadForm } from './forms/SquadForm';
import { CompanyProvider, useCompany } from '../../context/CompanyContext';
import { CompanySquad } from '../../types/company';

// ---- Squad view (main area) ----
const CompanyMainArea: React.FC<{
  squadId: string | null;
  onEditSquad: (squad: CompanySquad) => void;
}> = ({ squadId, onEditSquad }) => {
  const { squads } = useCompany();
  const squad = squads.find((s) => s.id === squadId);

  if (!squadId || !squad) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="p-5 rounded-2xl bg-accent/10 text-accent mb-5">
          <LayoutGrid size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Selecione um Squad</h2>
        <p className="text-gray-400 max-w-sm">
          Escolha um squad na sidebar para visualizar seus boards e tarefas.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Squad header */}
      <div className="flex items-center gap-4">
        <span
          className="text-3xl w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0"
          style={{ backgroundColor: `${squad.color}20` }}
        >
          {squad.icon}
        </span>
        <div>
          <h2 className="text-2xl font-bold text-white">{squad.name}</h2>
          {squad.description && (
            <p className="text-gray-400 text-sm">{squad.description}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onEditSquad(squad)}
            className="px-3 py-2 glass border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors text-sm"
          >
            Editar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/80 transition-colors">
            <Plus size={16} />
            Novo Board
          </button>
        </div>
      </div>

      {/* Placeholder board cards (Story 9.3 will populate real boards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass rounded-2xl p-5 border border-white/5 cursor-pointer hover:border-accent/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-2 rounded-xl"
                style={{ backgroundColor: `${squad.color}20`, color: squad.color }}
              >
                <LayoutGrid size={16} />
              </div>
              <span className="text-[10px] text-gray-500 font-medium bg-white/5 px-2 py-1 rounded-full">
                Em breve
              </span>
            </div>
            <h3 className="text-white font-semibold text-sm group-hover:text-accent transition-colors">
              Board {i} — {squad.name}
            </h3>
            <p className="text-gray-500 text-xs mt-1">Boards disponíveis na Story 9.3</p>
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Activity size={12} />
                0 tasks
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Users size={12} />
                0 membros
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Inner CRM (needs CompanyContext) ----
const CompanyCRMInner: React.FC = () => {
  const navigate = useNavigate();
  const { addSquad, updateSquad } = useCompany();
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSquadForm, setShowSquadForm] = useState(false);
  const [editingSquad, setEditingSquad] = useState<CompanySquad | null>(null);

  const handleNewSquad = () => {
    setEditingSquad(null);
    setShowSquadForm(true);
  };

  const handleEditSquad = (squad: CompanySquad) => {
    setEditingSquad(squad);
    setShowSquadForm(true);
  };

  const handleSquadFormSubmit = async (data: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>) => {
    if (editingSquad) {
      await updateSquad(editingSquad.id, data);
    } else {
      await addSquad(data);
    }
  };

  return (
    <div className="flex h-screen bg-[#080812] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 md:z-auto h-full transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <CompanySidebar
          activeSquadId={activeSquadId}
          onSelectSquad={(id) => {
            setActiveSquadId(id);
            setMobileSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          onNewSquad={handleNewSquad}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-white/5 bg-[#080812]/80 backdrop-blur-md flex-shrink-0">
          {/* Mobile menu */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileSidebarOpen((v) => !v)}
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Back to CRM Clientes */}
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">← CRM Clientes</span>
          </button>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />
          <span className="text-white font-bold text-sm hidden sm:block">CRM Empresa</span>

          {/* Search */}
          <div className="flex-1 max-w-md mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={15} className="text-gray-500 group-focus-within:text-accent transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar boards, tasks, membros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleNewSquad}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
            >
              <Plus size={15} />
              Squad
            </button>
            <button className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto">
          <CompanyMainArea squadId={activeSquadId} onEditSquad={handleEditSquad} />
        </main>
      </div>

      {/* Squad form modal */}
      {showSquadForm && (
        <SquadForm
          initial={editingSquad || undefined}
          onSubmit={handleSquadFormSubmit}
          onClose={() => { setShowSquadForm(false); setEditingSquad(null); }}
        />
      )}
    </div>
  );
};

// ---- Public export (wraps with provider) ----
export const CompanyCRM: React.FC = () => (
  <CompanyProvider>
    <CompanyCRMInner />
  </CompanyProvider>
);
