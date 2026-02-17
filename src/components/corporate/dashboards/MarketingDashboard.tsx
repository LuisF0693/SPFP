/**
 * MarketingDashboard
 * Calendário de posts, criativos, aprovações (US-404)
 */

import React, { useState, useMemo } from 'react';
import { format, getDaysInMonth, startOfMonth, addMonths, parse } from 'date-fns';
import { Plus, X, Check, AlertCircle } from 'lucide-react';
import { MarketingPost, marketingMockData, getStatusLabel, getStatusColor, getPlatformLabel, getPlatformIcon, getPostsByDate } from '@/data/marketingData';
import PostCalendar from './components/PostCalendar';
import CreativeList from './components/CreativeList';
import PostForm from './components/PostForm';

type ViewMode = 'calendar' | 'list';

export function MarketingDashboard() {
  const [posts, setPosts] = useState<MarketingPost[]>(marketingMockData.posts);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleAddPost = (newPost: Omit<MarketingPost, 'id' | 'created_at' | 'updated_at'>) => {
    const post: MarketingPost = {
      ...newPost,
      id: `post-${Date.now()}`,
      created_at: format(new Date(), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(new Date(), 'yyyy-MM-ddTHH:mm:ss'),
    };
    setPosts([...posts, post]);
    setShowPostForm(false);
  };

  const handleApprove = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, status: 'approved' as const, updated_at: format(new Date(), 'yyyy-MM-ddTHH:mm:ss') } : post
      )
    );
  };

  const handleReject = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, status: 'rejected' as const, updated_at: format(new Date(), 'yyyy-MM-ddTHH:mm:ss') } : post
      )
    );
  };

  const postsForMonth = useMemo(() => {
    const monthStr = format(currentMonth, 'yyyy-MM');
    return posts.filter((p) => p.scheduled_date.startsWith(monthStr));
  }, [posts, currentMonth]);

  const monthStr = format(currentMonth, 'yyyy-MM');

  return (
    <div className="space-y-6 p-6 bg-slate-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Dashboard de Marketing</h3>
        <button
          onClick={() => setShowPostForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Novo Post
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Calendário
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Lista de Criativos
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <PostCalendar
          posts={postsForMonth}
          currentMonth={currentMonth}
          onPrevMonth={() => setCurrentMonth(addMonths(currentMonth, -1))}
          onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
          onSelectDay={(day) => setSelectedDay(day)}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <CreativeList
          posts={postsForMonth}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Daily Posts Display */}
      {selectedDay && viewMode === 'calendar' && (
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">
              Posts em {selectedDay}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {getPostsByDate(postsForMonth, selectedDay).length > 0 ? (
              getPostsByDate(postsForMonth, selectedDay).map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-800 p-3 rounded border border-slate-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {post.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {getPlatformIcon(post.platform)} {getPlatformLabel(post.platform)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        getStatusColor(post.status).bg
                      } ${getStatusColor(post.status).text}`}
                    >
                      {getStatusColor(post.status).icon} {getStatusLabel(post.status)}
                    </span>
                  </div>
                  {post.metrics && (
                    <div className="flex gap-4 text-xs text-slate-300 mt-2">
                      <span>👍 {post.metrics.likes}</span>
                      <span>💬 {post.metrics.comments}</span>
                      <span>↗️ {post.metrics.shares}</span>
                      <span>📊 {post.metrics.reach}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Nenhum post agendado para este dia</p>
            )}
          </div>
        </div>
      )}

      {/* Post Form Modal */}
      {showPostForm && (
        <PostForm
          onSubmit={handleAddPost}
          onClose={() => setShowPostForm(false)}
        />
      )}
    </div>
  );
}
