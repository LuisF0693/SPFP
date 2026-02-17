import React, { useState, useEffect } from 'react';
import { Eye, RotateCcw, Filter } from 'lucide-react';
import { historyService, SentAta } from '../../../services/historyService';

interface HistoryTabProps {
  clientId: string;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ clientId }) => {
  const [atas, setAtas] = useState<SentAta[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'reuniao' | 'investimentos'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [clientId]);

  const loadHistory = async () => {
    try {
      const loaded = await historyService.getSentAtas(clientId);
      setAtas(loaded);
    } finally {
      setLoading(false);
    }
  };

  const filtered = atas.filter(a => {
    const typeMatch = typeFilter === 'all' || a.type === typeFilter;
    const channelMatch = channelFilter === 'all' || a.channel === channelFilter;
    return typeMatch && channelMatch;
  });

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Carregando...</div>;
  }

  if (atas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        Nenhuma ata enviada ainda
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-4 py-2 glass rounded-lg border border-white/10 text-white focus:border-accent text-sm"
        >
          <option value="all">Todos os tipos</option>
          <option value="reuniao">Reuniões</option>
          <option value="investimentos">Investimentos</option>
        </select>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value as any)}
          className="px-4 py-2 glass rounded-lg border border-white/10 text-white focus:border-accent text-sm"
        >
          <option value="all">Todos os canais</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(ata => (
          <div key={ata.id} className="glass p-4 rounded-lg border border-white/10 flex items-center justify-between group hover:bg-white/5">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div>
                <p className="text-white font-medium">
                  {ata.type === 'reuniao' ? '📝 Ata de Reunião' : '📊 Ata de Investimentos'}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{ata.channel === 'email' ? '✉️ Email' : '💬 WhatsApp'}</span>
                  <span>•</span>
                  <span>{new Date(ata.sentAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <Eye size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          Nenhuma ata encontrada com esses filtros
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
