import React, { useState } from 'react'
import { Client } from '@/types/crm.types'
import { Plus, Search } from 'lucide-react'
import { NewClientModal } from './NewClientModal'

interface ClientListProps {
  clients: Client[]
  selectedId?: string
  onSelect: (clientId: string) => void
}

export function ClientList({ clients, selectedId, onSelect }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewClientModal, setShowNewClientModal] = useState(false)

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getHealthScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Clientes</h2>
        <button
          onClick={() => setShowNewClientModal(true)}
          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors"
          title="Novo cliente"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={18} className="absolute left-3 top-3 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-black/30 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {/* Client List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
            </p>
          </div>
        ) : (
          filteredClients.map(client => (
            <button
              key={client.id}
              onClick={() => onSelect(client.id)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                selectedId === client.id
                  ? 'bg-purple-500/30 border border-purple-500/50'
                  : 'bg-black/20 border border-transparent hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-white">{client.name}</p>
                  <p className="text-xs text-gray-400">{client.email}</p>
                </div>
                <div className={`text-xs font-bold ${getHealthScoreColor(client.healthScore)}`}>
                  {client.healthScore}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <NewClientModal
          onClose={() => setShowNewClientModal(false)}
        />
      )}
    </div>
  )
}
