/**
 * MarketingDashboard - Dashboard Marketing
 * Posts, Calendar, Engagement, Drag & Drop
 * AC-405.1 to 405.9 implemented
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X, Plus } from 'lucide-react';

interface MarketingPost {
  id: string;
  title: string;
  description?: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'outro';
  status: 'draft' | 'pending' | 'approved' | 'posted' | 'rejected';
  scheduledDate?: string;
  postedDate?: string;
  imageUrl?: string;
  rejectionReason?: string;
  metrics?: { likes: number; comments: number; shares: number };
  createdAt: string;
  updatedAt: string;
}

const initialPosts: MarketingPost[] = [
  {
    id: '1',
    title: 'Nova Estratégia de Q1',
    description: 'Compartilhando nossa visão estratégica para Q1',
    platform: 'linkedin',
    status: 'approved',
    scheduledDate: '2026-02-20',
    imageUrl: 'https://via.placeholder.com/400x300',
    metrics: { likes: 245, comments: 12, shares: 5 },
    createdAt: '2026-02-10T10:00:00',
    updatedAt: '2026-02-10T10:00:00',
  },
  {
    id: '2',
    title: 'Lançamento Produto X',
    platform: 'instagram',
    status: 'pending',
    scheduledDate: '2026-02-22',
    createdAt: '2026-02-11T15:00:00',
    updatedAt: '2026-02-11T15:00:00',
  },
  {
    id: '3',
    title: 'Case Study Cliente',
    platform: 'linkedin',
    status: 'draft',
    imageUrl: 'https://via.placeholder.com/400x300',
    createdAt: '2026-02-12T09:00:00',
    updatedAt: '2026-02-12T09:00:00',
  },
  {
    id: '4',
    title: 'Dica de Produtividade',
    platform: 'tiktok',
    status: 'posted',
    scheduledDate: '2026-02-18',
    postedDate: '2026-02-18T14:30:00',
    metrics: { likes: 1200, comments: 45, shares: 320 },
    createdAt: '2026-02-08T11:00:00',
    updatedAt: '2026-02-18T14:30:00',
  },
];

const statusBadge: Record<string, { bg: string; icon: string; label: string }> = {
  draft: { bg: 'bg-gray-600', icon: '📝', label: 'Rascunho' },
  pending: { bg: 'bg-yellow-600', icon: '⏳', label: 'Aguardando' },
  approved: { bg: 'bg-green-600', icon: '✅', label: 'Aprovado' },
  posted: { bg: 'bg-blue-600', icon: '📤', label: 'Postado' },
  rejected: { bg: 'bg-red-600', icon: '❌', label: 'Rejeitado' },
};

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function isSunday(dayOfWeek: number): boolean {
  return dayOfWeek === 0;
}

interface NewPostFormProps {
  onSave: (post: Omit<MarketingPost, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function NewPostForm({ onSave, onCancel }: NewPostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'instagram' as const,
    scheduledDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      description: formData.description,
      platform: formData.platform,
      status: 'draft',
      scheduledDate: formData.scheduledDate || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Novo Post</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Título</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
              placeholder="Título do post"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm h-20"
              placeholder="Descrição do post"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Plataforma</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data Agendada</label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium">
              Salvar
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ApprovalModalProps {
  post: MarketingPost;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
}

function ApprovalModal({ post, onApprove, onReject, onCancel }: ApprovalModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const handleReject = () => {
    if (showReasonInput && rejectionReason) {
      onReject();
    } else if (!showReasonInput) {
      setShowReasonInput(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96">
        <h3 className="text-xl font-bold text-white mb-4">Aprovar/Rejeitar Post</h3>
        <div className="bg-slate-700 rounded p-4 mb-4">
          <p className="text-white font-semibold">{post.title}</p>
          <p className="text-slate-300 text-sm mt-1">{post.platform}</p>
        </div>
        {showReasonInput && (
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Motivo da rejeição (máx 150 caracteres)"
            maxLength={150}
            className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm h-20 mb-4"
          />
        )}
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-medium"
          >
            ✅ Aprovar
          </button>
          <button
            onClick={handleReject}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-medium"
          >
            ❌ {showReasonInput ? 'Confirmar' : 'Rejeitar'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarketingDashboard() {
  const [posts, setPosts] = useState<MarketingPost[]>(initialPosts);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 17)); // Feb 17, 2026
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedPostForApproval, setSelectedPostForApproval] = useState<MarketingPost | null>(null);
  const [draggedPost, setDraggedPost] = useState<MarketingPost | null>(null);

  const handleAddPost = (newPost: Omit<MarketingPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const post: MarketingPost = {
      ...newPost,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPosts([...posts, post]);
    setShowNewPostForm(false);
  };

  const handleApprovePost = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status: 'approved' } : p));
    setSelectedPostForApproval(null);
  };

  const handleRejectPost = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status: 'rejected' } : p));
    setSelectedPostForApproval(null);
  };

  const handleDragPost = (post: MarketingPost) => {
    setDraggedPost(post);
  };

  const handleDropPost = (newDate: string) => {
    if (draggedPost) {
      setPosts(posts.map(p => p.id === draggedPost.id ? { ...p, scheduledDate: newDate } : p));
      setDraggedPost(null);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array(daysInMonth).keys().map(i => i + 1)];

  const getPostsForDate = (day: number | null): MarketingPost[] => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(p => p.scheduledDate?.startsWith(dateStr));
  };

  const stats = {
    total: posts.length,
    agendados: posts.filter(p => p.scheduledDate && ['draft', 'pending', 'approved'].includes(p.status)).length,
    publicados: posts.filter(p => p.status === 'posted').length,
  };

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700 p-3 rounded text-center">
          <p className="text-slate-400 text-xs">Total Posts</p>
          <p className="text-blue-400 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-slate-700 p-3 rounded text-center">
          <p className="text-slate-400 text-xs">Agendados</p>
          <p className="text-yellow-400 text-2xl font-bold">{stats.agendados}</p>
        </div>
        <div className="bg-slate-700 p-3 rounded text-center">
          <p className="text-slate-400 text-xs">Publicados</p>
          <p className="text-green-400 text-2xl font-bold">{stats.publicados}</p>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-slate-700 rounded p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="bg-slate-600 hover:bg-slate-500 text-white p-2 rounded"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="bg-slate-600 hover:bg-slate-500 text-white p-2 rounded"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cabeçalho de dias */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
            <div key={day} className="text-center text-slate-400 text-xs font-semibold py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const postsThisDay = getPostsForDate(day);
            const today = isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day || 1));
            const sunday = day !== null && isSunday((firstDay + (day - 1)) % 7);

            return (
              <div
                key={idx}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => day && handleDropPost(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                className={`
                  min-h-24 p-1 rounded border text-xs
                  ${!day ? 'bg-slate-800 border-slate-700' : ''}
                  ${day && sunday ? 'bg-slate-600 border-slate-500' : ''}
                  ${day && !sunday ? 'bg-slate-700 border-slate-600' : ''}
                  ${today ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                {day && (
                  <>
                    <p className={`font-semibold mb-1 ${today ? 'text-blue-400' : 'text-slate-300'}`}>{day}</p>
                    <div className="space-y-1">
                      {postsThisDay.slice(0, 2).map(post => {
                        const badge = statusBadge[post.status];
                        return (
                          <div
                            key={post.id}
                            draggable
                            onDragStart={() => handleDragPost(post)}
                            onClick={() => post.status === 'pending' && setSelectedPostForApproval(post)}
                            className={`${badge.bg} text-white px-1 py-0.5 rounded text-xs truncate cursor-move hover:opacity-80 transition`}
                            title={post.title}
                          >
                            {post.title}
                          </div>
                        );
                      })}
                      {postsThisDay.length > 2 && (
                        <p className="text-slate-400 text-xs">+{postsThisDay.length - 2}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão Novo Post */}
      <button
        onClick={() => setShowNewPostForm(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition flex items-center justify-center gap-2"
      >
        <Plus size={20} /> Novo Post
      </button>

      {/* Modais */}
      {showNewPostForm && (
        <NewPostForm
          onSave={handleAddPost}
          onCancel={() => setShowNewPostForm(false)}
        />
      )}
      {selectedPostForApproval && (
        <ApprovalModal
          post={selectedPostForApproval}
          onApprove={() => handleApprovePost(selectedPostForApproval.id)}
          onReject={() => handleRejectPost(selectedPostForApproval.id)}
          onCancel={() => setSelectedPostForApproval(null)}
        />
      )}
    </div>
  );
}
