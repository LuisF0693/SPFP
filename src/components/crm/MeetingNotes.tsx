import React, { useState } from 'react'
import { useCRM } from '@/hooks/crm/useCRM'
import { Plus, Trash2, Edit2 } from 'lucide-react'

interface MeetingNotesProps {
  clientId: string
}

export function MeetingNotes({ clientId }: MeetingNotesProps) {
  const { meetingNotes, createMeetingNote, deleteMeetingNote } = useCRM()
  const [showNewNoteForm, setShowNewNoteForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    topics: '',
    actionItems: ''
  })

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMeetingNote({
        clientId,
        userId: '', // Will be set by backend
        title: formData.title,
        content: formData.content,
        topics: formData.topics.split(',').map(t => t.trim()).filter(Boolean),
        actionItems: formData.actionItems.split(',').map(a => a.trim()).filter(Boolean),
        materials: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setFormData({ title: '', content: '', topics: '', actionItems: '' })
      setShowNewNoteForm(false)
    } catch (error) {
      console.error('Erro ao criar ata:', error)
    }
  }

  const clientMeetingNotes = meetingNotes.filter(n => n.clientId === clientId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Atas de Reunião</h3>
        <button
          onClick={() => setShowNewNoteForm(!showNewNoteForm)}
          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* New Note Form */}
      {showNewNoteForm && (
        <form onSubmit={handleCreateNote} className="bg-black/30 border border-purple-500/20 rounded-lg p-4 space-y-4">
          <input
            type="text"
            placeholder="Título da ata"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            required
          />
          <textarea
            placeholder="Conteúdo da ata"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 h-24"
            required
          />
          <input
            type="text"
            placeholder="Tópicos (separados por vírgula)"
            value={formData.topics}
            onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
          <input
            type="text"
            placeholder="Ações (separadas por vírgula)"
            value={formData.actionItems}
            onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded text-white font-medium transition-colors"
            >
              Criar Ata
            </button>
            <button
              type="button"
              onClick={() => setShowNewNoteForm(false)}
              className="flex-1 px-4 py-2 bg-black/30 hover:bg-black/50 rounded text-gray-400 font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-2">
        {clientMeetingNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma ata de reunião registrada</p>
          </div>
        ) : (
          clientMeetingNotes.map(note => (
            <div
              key={note.id}
              className="bg-black/20 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white">{note.title}</h4>
                <button
                  onClick={() => deleteMeetingNote(note.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-2">{note.content}</p>
              {note.topics.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Tópicos:</p>
                  <div className="flex flex-wrap gap-2">
                    {note.topics.map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {note.actionItems.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ações:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {note.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">
                {new Date(note.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
