import React, { useEffect, useState } from 'react'
import { useCRM } from '@/hooks/crm/useCRM'
import { ClientList } from './ClientList'
import { ClientDetailModal } from './ClientDetailModal'
import { AlertCircle, Users } from 'lucide-react'

export function CRMDashboard() {
  const { clients, selectedClientId, isLoading, error, loadClients, selectClient, clearError } = useCRM()
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadClients()
  }, [loadClients])

  const handleClientClick = (clientId: string) => {
    selectClient(clientId)
    setShowDetailModal(true)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-400 text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-accent" size={24} />
          <h1 className="text-3xl font-bold text-white">CRM de Clientes</h1>
        </div>
        <p className="text-gray-400">Clique em um cliente para visualizar e gerenciar detalhes, atas e comunicações</p>
      </div>

      {/* Client List */}
      <div className="max-w-md">
        <div className="bg-gradient-to-br from-accent/10 to-blue-500/5 border border-accent/20 rounded-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Clientes ({clients.length})</h2>
          </div>

          {/* Client List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Nenhum cliente cadastrado</p>
              </div>
            ) : (
              clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => handleClientClick(client.id)}
                  className="w-full text-left p-3 rounded-lg transition-all bg-black/20 border border-transparent hover:border-accent/30 hover:bg-accent/5 active:bg-accent/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.email}</p>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded ${
                      client.healthScore >= 75 ? 'bg-green-500/20 text-green-400' :
                      client.healthScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {client.healthScore}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ClientDetailModal
        isOpen={showDetailModal}
        clientId={selectedClientId || ''}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  )
}
