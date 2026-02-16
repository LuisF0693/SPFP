import React, { useRef, useState } from 'react'
import { useCRM } from '@/hooks/crm/useCRM'
import { Upload, Trash2, Download, FileText } from 'lucide-react'

interface ClientFilesProps {
  clientId: string
}

export function ClientFiles({ clientId }: ClientFilesProps) {
  const { clientFiles, uploadFile, deleteFile } = useCRM()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('document')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      await uploadFile(clientId, file, selectedCategory)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const clientFilesList = clientFiles.filter(f => f.clientId === clientId)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      document: 'bg-blue-500/20 text-blue-300',
      report: 'bg-green-500/20 text-green-300',
      investment: 'bg-purple-500/20 text-purple-300',
      personal: 'bg-yellow-500/20 text-yellow-300',
      other: 'bg-gray-500/20 text-gray-300'
    }
    return colors[category] || colors.other
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      document: 'Documento',
      report: 'Relatório',
      investment: 'Investimento',
      personal: 'Pessoal',
      other: 'Outro'
    }
    return labels[category] || category
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="bg-black/30 border-2 border-dashed border-purple-500/30 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center">
          <Upload className="text-purple-400 mb-2" size={24} />
          <p className="text-sm text-gray-300 mb-2">Clique para enviar um arquivo</p>
          <div className="flex gap-2 items-center mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 bg-black/50 border border-purple-500/20 rounded text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="document">Documento</option>
              <option value="report">Relatório</option>
              <option value="investment">Investimento</option>
              <option value="personal">Pessoal</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 rounded text-white text-sm font-medium transition-colors"
          >
            {isUploading ? 'Enviando...' : 'Selecionar Arquivo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-2">
        {clientFilesList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhum arquivo enviado</p>
          </div>
        ) : (
          clientFilesList.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-black/20 border border-purple-500/20 rounded-lg p-4 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <FileText className="text-purple-400 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(file.category)}`}>
                      {getCategoryLabel(file.category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={file.url}
                  download
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  title="Baixar"
                >
                  <Download size={18} />
                </a>
                <button
                  onClick={() => deleteFile(file.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Deletar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
