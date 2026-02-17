import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClientCard } from './ClientCard';

interface GridClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  healthScore: number;
  status: 'ativo' | 'inativo' | 'pendente';
  lastActive?: Date;
  isNew?: boolean;
}

interface ClientGridProps {
  clients: GridClient[];
  isLoading?: boolean;
  onClientClick?: (clientId: string) => void;
  onShowTimeline?: (clientId: string) => void;
  onGenerateBriefing?: (clientId: string) => void;
  emptyState?: React.ReactNode;
}

export const ClientGrid: React.FC<ClientGridProps> = ({
  clients,
  isLoading = false,
  onClientClick,
  onShowTimeline,
  onGenerateBriefing,
  emptyState,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass p-6 rounded-3xl h-64 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyState || (
          <div className="space-y-4">
            <div className="text-6xl opacity-20">📭</div>
            <p className="text-gray-400 text-lg font-medium">Nenhum cliente encontrado</p>
            <p className="text-gray-500 text-sm">Comece adicionando seus primeiros clientes</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            id={client.id}
            name={client.name}
            email={client.email}
            phone={client.phone}
            avatar={client.avatar}
            healthScore={client.healthScore}
            status={client.status}
            lastActive={client.lastActive}
            isNew={client.isNew}
            onViewDetails={() => onClientClick?.(client.id)}
            onShowTimeline={() => onShowTimeline?.(client.id)}
            onGenerateBriefing={() => onGenerateBriefing?.(client.id)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientGrid;
