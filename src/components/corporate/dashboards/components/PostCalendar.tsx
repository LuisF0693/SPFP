/**
 * PostCalendar
 * Calendário visual com posts agendados
 */

import React from 'react';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MarketingPost, getStatusColor } from '@/data/marketingData';

interface PostCalendarProps {
  posts: MarketingPost[];
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: string) => void;
}

export default function PostCalendar({
  posts,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}: PostCalendarProps) {
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getDay(startOfMonth(currentMonth));
  const monthStr = format(currentMonth, 'yyyy-MM');
  const monthLabel = format(currentMonth, 'MMMM yyyy', { locale: require('date-fns/locale/pt-BR') });

  const getPostsForDay = (day: number) => {
    const dateStr = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd');
    return posts.filter((p) => p.scheduled_date === dateStr);
  };

  const getDayPosts = (day: number) => {
    return getPostsForDay(day);
  };

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum <= 0 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  return (
    <div className="bg-slate-700/50 p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevMonth}
          className="p-2 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold text-white capitalize">{monthLabel}</h3>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Names */}
        {dayNames.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-semibold text-slate-400 py-2"
          >
            {name}
          </div>
        ))}

        {/* Days */}
        {days.map((day, index) => {
          const dayPosts = day ? getDayPosts(day) : [];
          const dateStr = day ? format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), 'yyyy-MM-dd') : '';

          return (
            <div
              key={index}
              onClick={() => day && dayPosts.length > 0 && onSelectDay(dateStr)}
              className={`aspect-square p-1 rounded border ${
                day
                  ? dayPosts.length > 0
                    ? 'bg-slate-600/50 border-slate-500 cursor-pointer hover:bg-slate-600'
                    : 'bg-slate-800/30 border-slate-700'
                  : 'border-transparent'
              }`}
            >
              {day && (
                <>
                  <p className="text-xs font-medium text-slate-300 mb-1">{day}</p>
                  <div className="space-y-0.5">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className={`h-1.5 rounded text-xs ${getStatusColor(post.status).bg}`}
                        title={post.title}
                      />
                    ))}
                    {dayPosts.length > 2 && (
                      <p className="text-xs text-slate-400">+{dayPosts.length - 2}</p>
                    )}
                    {dayPosts.length > 0 && (
                      <p className="text-xs text-slate-300 font-medium mt-1">
                        {dayPosts.length}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-gray-400" />
          <span>Rascunho</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-yellow-400" />
          <span>Aguardando</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-green-400" />
          <span>Aprovado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-blue-400" />
          <span>Postado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-red-400" />
          <span>Rejeitado</span>
        </div>
      </div>
    </div>
  );
}
