import React, { useEffect } from 'react'
import { useCRM } from '@/hooks/crm/useCRM'
import { ClientList } from './ClientList'
import { ClientProfile } from './ClientProfile'
import { AlertCircle } from 'lucide-react'

export function CRMDashboard() {
  const { clients, selectedClientId, isLoading, error, loadClients, selectClient, clearError } = useCRM()

  useEffect(() => {
    loadClients()
  }, [loadClients])

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
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

      <div className="flex gap-6">
        {/* Left: Client List */}
        <div className="w-1/3">
          <ClientList
            clients={clients}
            selectedId={selectedClientId}
            onSelect={selectClient}
          />
        </div>

        {/* Right: Client Profile */}
        <div className="w-2/3">
          {selectedClientId ? (
            <ClientProfile clientId={selectedClientId} />
          ) : (
            <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-lg p-8 text-center">
              <p className="text-gray-400">Selecione um cliente para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
