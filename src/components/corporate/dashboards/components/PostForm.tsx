/**
 * PostForm
 * Form para criar novo post de marketing
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MarketingPost } from '@/data/marketingData';

interface PostFormProps {
  onSubmit: (post: Omit<MarketingPost, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

export default function PostForm({ onSubmit, onClose }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'other'>('instagram');
  const [scheduled_date, setScheduled_date] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Título é obrigatório');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      platform,
      scheduled_date,
      image_url: imageUrl || undefined,
      status: 'pending',
      metrics: undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Novo Post</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Dica rápida de produtividade"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escreva o conteúdo do post..."
              rows={4}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Plataforma
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="other">Outro</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Data de Publicação
            </label>
            <input
              type="date"
              value={scheduled_date}
              onChange={(e) => setScheduled_date(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              URL da Imagem
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Pré-visualização</p>
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-32 object-cover rounded"
                onError={() => alert('Erro ao carregar imagem')}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
            >
              Criar Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
