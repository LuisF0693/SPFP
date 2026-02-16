import React, { useState } from 'react'
import { useCRM } from '@/hooks/crm/useCRM'
import { X } from 'lucide-react'

interface NewClientModalProps {
  onClose: () => void
}

export function NewClientModal({ onClose }: NewClientModalProps) {
  const { createClient } = useCRM()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    CPF: '',
    patrimony: 0,
    profile: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createClient({
        ...formData,
        healthScore: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      onClose()
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Novo Cliente</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-purple-500/20 rounded text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">CPF</label>
            <input
              type="text"
              value={formData.CPF}
              onChange={(e) => setFormData({ ...formData, CPF: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Patrimônio (R$)</label>
            <input
              type="number"
              value={formData.patrimony}
              onChange={(e) => setFormData({ ...formData, patrimony: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Perfil de Investimento</label>
            <select
              value={formData.profile}
              onChange={(e) => setFormData({ ...formData, profile: e.target.value as any })}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/20 rounded text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              <option value="conservative">Conservador</option>
              <option value="moderate">Moderado</option>
              <option value="aggressive">Agressivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Anotações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors h-20"
              placeholder="Anotações sobre o cliente..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 rounded text-white font-medium transition-colors"
            >
              {isLoading ? 'Criando...' : 'Criar Cliente'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-black/30 hover:bg-black/50 rounded text-gray-300 font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
