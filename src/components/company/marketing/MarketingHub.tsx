import React, { useEffect, useState } from 'react';
import { Plus, Loader2, LayoutGrid, Calendar, List, Settings2, Filter, Search } from 'lucide-react';
import { MarketingProvider, useMarketing, MarketingContent } from '../../../context/MarketingContext';
import { ContentCard } from './ContentCard';
import { ContentForm } from './ContentForm';
import { ContentCalendar } from './ContentCalendar';
import { PublishQueue } from './PublishQueue';
import { MetaSettings } from './MetaSettings';
import { YouTubeSettings } from './YouTubeSettings';

type Tab = 'biblioteca' | 'calendario' | 'fila' | 'configuracoes';

const STATUS_TABS = [
  { value: 'all',       label: 'Todos' },
  { value: 'draft',     label: 'Rascunhos' },
  { value: 'ready',     label: 'Prontos' },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'published', label: 'Publicados' },
];

const MarketingHubInner: React.FC = () => {
  const { contents, loading, loadContents, addContent, updateContent, deleteContent } = useMarketing();
  const [activeTab, setActiveTab] = useState<Tab>('biblioteca');
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<MarketingContent | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [menuContentId, setMenuContentId] = useState<string | null>(null);

  useEffect(() => { loadContents(); }, [loadContents]);

  const filteredContents = contents.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleContentClick = (content: MarketingContent) => {
    setEditingContent(content);
    setShowForm(true);
  };

  const handleMenuClick = (content: MarketingContent, e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuContentId(menuContentId === content.id ? null : content.id);
  };

  const handleFormSubmit = async (data: Omit<MarketingContent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingContent) {
      await updateContent(editingContent.id, data);
    } else {
      await addContent(data);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { id: 'biblioteca',    label: 'Biblioteca',    icon: LayoutGrid },
    { id: 'calendario',   label: 'Calendário',    icon: Calendar },
    { id: 'fila',         label: 'Fila de Publicação', icon: List },
    { id: 'configuracoes', label: 'Configurações',  icon: Settings2 },
  ];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Marketing Hub</h2>
          <p className="text-gray-400 text-sm">{contents.length} conteúdos · Crie, agende e publique</p>
        </div>
        <button
          onClick={() => { setEditingContent(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/80 transition-colors"
        >
          <Plus size={16} />
          Novo Conteúdo
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-white/5 pb-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent bg-accent/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'biblioteca' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar conteúdo..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm" />
            </div>
            <div className="flex gap-1">
              {STATUS_TABS.map((s) => (
                <button key={s.value} onClick={() => setStatusFilter(s.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s.value ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-gray-500" /></div>
          ) : filteredContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-2xl bg-white/5 text-gray-600 mb-4">🖼️</div>
              <p className="text-gray-500 text-sm">Nenhum conteúdo ainda</p>
              <button onClick={() => setShowForm(true)} className="mt-3 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
                Criar primeiro conteúdo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredContents.map((content) => (
                <div key={content.id} className="relative">
                  <ContentCard content={content} onClick={handleContentClick} onMenuClick={handleMenuClick} />
                  {menuContentId === content.id && (
                    <div className="absolute top-12 right-2 z-20 glass border border-white/10 rounded-xl py-1 shadow-xl min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => { setEditingContent(content); setShowForm(true); setMenuContentId(null); }}>Editar</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-white/5 transition-colors" onClick={async () => { await updateContent(content.id, { status: 'ready' }); setMenuContentId(null); }}>Marcar Pronto</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors" onClick={async () => { await deleteContent(content.id); setMenuContentId(null); }}>Excluir</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendario' && (
        <ContentCalendar onSelectContent={handleContentClick} />
      )}

      {activeTab === 'fila' && (
        <PublishQueue onSelectContent={handleContentClick} />
      )}

      {activeTab === 'configuracoes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl border border-white/5 p-6">
            <MetaSettings />
          </div>
          <div className="glass rounded-2xl border border-white/5 p-6">
            <YouTubeSettings />
          </div>
        </div>
      )}

      {/* Content form modal */}
      {showForm && (
        <ContentForm
          initial={editingContent || undefined}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingContent(null); }}
        />
      )}
    </div>
  );
};

export const MarketingHub: React.FC = () => (
  <MarketingProvider>
    <MarketingHubInner />
  </MarketingProvider>
);
