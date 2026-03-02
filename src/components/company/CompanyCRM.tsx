import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell, Plus, Menu, X, LayoutGrid, Users, Activity } from 'lucide-react';
import { CompanySidebar } from './CompanySidebar';
import { SquadView } from './SquadView';
import { MembersView } from './MembersView';
import { ActivityFeed } from './ActivityFeed';
import { SquadForm } from './forms/SquadForm';
import { CompanyProvider, useCompany } from '../../context/CompanyContext';
import { CompanySquad } from '../../types/company';

// ---- Welcome screen when no squad selected ----
const WelcomeArea: React.FC<{ onNewSquad: () => void }> = ({ onNewSquad }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-8">
    <div className="p-5 rounded-2xl bg-accent/10 text-accent mb-5">
      <LayoutGrid size={40} />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Selecione um Squad</h2>
    <p className="text-gray-400 max-w-sm mb-6">
      Escolha um squad na sidebar para visualizar seus boards e tarefas.
    </p>
    <button
      onClick={onNewSquad}
      className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
    >
      <Plus size={15} />
      Criar Squad
    </button>
  </div>
);

// ---- Inner CRM (needs CompanyContext) ----
const CompanyCRMInner: React.FC = () => {
  const navigate = useNavigate();
  const { squads, addSquad, updateSquad } = useCompany();
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSquadForm, setShowSquadForm] = useState(false);
  const [editingSquad, setEditingSquad] = useState<CompanySquad | null>(null);

  const activeSquad = squads.find((s) => s.id === activeSquadId) || null;

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
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileSidebarOpen((v) => !v)}
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

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

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => { setShowActivity((v) => !v); setShowMembers(false); setActiveSquadId(null); }}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                showActivity
                  ? 'bg-accent/10 border border-accent/20 text-accent'
                  : 'border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity size={15} />
              Atividade
            </button>
            <button
              onClick={() => { setShowMembers((v) => !v); setShowActivity(false); setActiveSquadId(null); }}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                showMembers
                  ? 'bg-accent/10 border border-accent/20 text-accent'
                  : 'border border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={15} />
              Membros
            </button>
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
          {showActivity ? (
            <ActivityFeed />
          ) : showMembers ? (
            <MembersView />
          ) : activeSquad ? (
            <SquadView squad={activeSquad} onEditSquad={handleEditSquad} />
          ) : (
            <WelcomeArea onNewSquad={handleNewSquad} />
          )}
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
