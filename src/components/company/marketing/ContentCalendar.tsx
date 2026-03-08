import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Instagram, Youtube, Mail, Share2 } from 'lucide-react';
import { useMarketing, MarketingContent } from '../../../context/MarketingContext';

const PLATFORM_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  instagram: Instagram,
  facebook: Share2,
  youtube: Youtube,
  email: Mail,
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const ContentCalendar: React.FC<{ onSelectContent: (c: MarketingContent) => void }> = ({ onSelectContent }) => {
  const marketing = useMarketing();
  const contents = marketing?.contents ?? [];
  const [currentDate, setCurrentDate] = useState(new Date());

  const { year, month } = { year: currentDate.getFullYear(), month: currentDate.getMonth() };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const scheduledByDate = useMemo(() => {
    const map: Record<string, MarketingContent[]> = {};
    contents
      .filter((c) => c.scheduled_at)
      .forEach((c) => {
        const d = new Date(c.scheduled_at!).toDateString();
        if (!map[d]) map[d] = [];
        map[d].push(c);
      });
    return map;
  }, [contents]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-white font-semibold capitalize">{monthName}</h3>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-600 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = new Date(year, month, day).toDateString();
          const dayContents = scheduledByDate[dateStr] || [];
          const isToday = new Date().toDateString() === dateStr;

          return (
            <div
              key={day}
              className={`min-h-[70px] rounded-xl p-1.5 border transition-colors ${
                isToday ? 'border-accent/40 bg-accent/5' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <span className={`text-xs font-medium block text-right mb-1 ${isToday ? 'text-accent' : 'text-gray-500'}`}>
                {day}
              </span>
              <div className="space-y-1">
                {dayContents.slice(0, 2).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectContent(c)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-white truncate">
                      <div className="flex gap-0.5">
                        {c.platform.slice(0, 2).map((p) => {
                          const Icon = PLATFORM_ICONS[p] || Share2;
                          return <Icon key={p} size={8} className="text-accent flex-shrink-0" />;
                        })}
                      </div>
                      <span className="truncate">{c.title}</span>
                    </div>
                  </button>
                ))}
                {dayContents.length > 2 && (
                  <span className="text-[9px] text-gray-600">+{dayContents.length - 2} mais</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
