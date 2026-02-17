import React, { useState, useEffect } from 'react';
import { Upload, Search, Star, Trash2, Download } from 'lucide-react';
import { fileService, UserFile } from '../../../services/fileService';

interface FileManagerProps {
  userId: string;
}

export const FileManager: React.FC<FileManagerProps> = ({ userId }) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [userId]);

  const loadFiles = async () => {
    try {
      const loaded = await fileService.getFiles(userId);
      setFiles(loaded);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Deletar arquivo?')) {
      await fileService.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    }
  };

  const handleToggleFavorite = async (fileId: string) => {
    await fileService.toggleFavorite(fileId);
    setFiles(files.map(f => f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f));
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="glass p-8 rounded-3xl border-2 border-dashed border-white/20 hover:border-accent transition-colors text-center">
        <Upload size={32} className="mx-auto mb-3 text-gray-500" />
        <p className="text-white font-semibold mb-1">Arraste arquivos aqui</p>
        <p className="text-sm text-gray-400 mb-4">ou</p>
        <button className="px-6 py-2 bg-accent rounded-lg text-white font-semibold hover:bg-accent/80">
          Selecionar Arquivo
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass rounded-lg border border-white/10 text-white focus:border-accent"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 glass rounded-lg border border-white/10 text-white focus:border-accent"
        >
          <option value="all">Todas as categorias</option>
          <option value="investimentos">Investimentos</option>
          <option value="planejamento">Planejamento</option>
          <option value="educacional">Educacional</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      {/* File List */}
      <div className="space-y-2">
        {filteredFiles.map(file => (
          <div key={file.id} className="glass p-4 rounded-lg border border-white/10 flex items-center justify-between group hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <span className="text-2xl">📄</span>
              <div className="min-w-0 flex-1">
                <p className="text-white truncate font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.sizeBytes / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleFavorite(file.id)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-yellow-400"
              >
                <Star size={16} fill={file.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {filteredFiles.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhum arquivo encontrado
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
