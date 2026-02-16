import React, { useEffect, useState } from 'react'
import { useCRM } from '@/hooks/crm/useCRM'
import { MeetingNotes } from './MeetingNotes'
import { ClientFiles } from './ClientFiles'
import { Mail, Phone, User, TrendingUp } from 'lucide-react'

interface ClientProfileProps {
  clientId: string
}

export function ClientProfile({ clientId }: ClientProfileProps) {
  const { clients, meetingNotes, clientFiles, loadMeetingNotes, loadClientFiles } = useCRM()
  const [activeTab, setActiveTab] = useState<'profile' | 'notes' | 'files'>('profile')

  const client = clients.find(c => c.id === clientId)

  useEffect(() => {
    if (clientId) {
      loadMeetingNotes(clientId)
      loadClientFiles(clientId)
    }
  }, [clientId, loadMeetingNotes, loadClientFiles])

  if (!client) {
    return (
      <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-lg p-8 text-center">
        <p className="text-gray-400">Cliente não encontrado</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-purple-500/20">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-4 px-6 font-medium transition-all ${
            activeTab === 'profile'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Perfil
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-4 px-6 font-medium transition-all ${
            activeTab === 'notes'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Atas ({meetingNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-4 px-6 font-medium transition-all ${
            activeTab === 'files'
              ? 'text-purple-400 border-b-2 border-purple-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Arquivos ({clientFiles.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-purple-500/20">
              <div>
                <h2 className="text-2xl font-bold text-white">{client.name}</h2>
                <p className="text-gray-400 mt-1">ID: {client.id}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-400">{client.healthScore}</div>
                <p className="text-xs text-gray-400">Health Score</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white mb-3">Contato</h3>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail size={18} className="text-purple-400" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone size={18} className="text-purple-400" />
                <span>{client.phone || 'Não informado'}</span>
              </div>
              {client.CPF && (
                <div className="flex items-center gap-3 text-gray-300">
                  <User size={18} className="text-purple-400" />
                  <span>{client.CPF}</span>
                </div>
              )}
            </div>

            {/* Financial Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white mb-3">Informações Financeiras</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 border border-purple-500/20 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Patrimônio</p>
                  <p className="text-lg font-bold text-purple-400">
                    R$ {(client.patrimony || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-black/20 border border-purple-500/20 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Perfil</p>
                  <p className="text-lg font-bold text-blue-400 capitalize">{client.profile}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Anotações</h3>
                <p className="text-gray-300 text-sm">{client.notes}</p>
              </div>
            )}

            {/* Dates */}
            <div className="pt-6 border-t border-purple-500/20 space-y-2 text-sm text-gray-400">
              <p>Criado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}</p>
              <p>Atualizado em: {new Date(client.updatedAt).toLocaleDateString('pt-BR')}</p>
              {client.lastMeetingDate && (
                <p>Último encontro: {new Date(client.lastMeetingDate).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <MeetingNotes clientId={clientId} />
        )}

        {activeTab === 'files' && (
          <ClientFiles clientId={clientId} />
        )}
      </div>
    </div>
  )
}
