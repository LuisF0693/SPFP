import React, { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Target, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { Goal, CategoryIconName } from '../../types';
import { CategoryIcon } from '../CategoryIcon';
import { InlineEdit } from '../ui/InlineEdit';

interface GoalCarouselProps {
  goals: Goal[];
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  className?: string;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: (updates: Partial<Goal>) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onUpdate }) => {
  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = progress >= 100;

  // Calculate monthly contribution needed
  const deadline = new Date(goal.deadline);
  const now = new Date();
  const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const monthlyNeeded = remaining > 0 ? remaining / monthsRemaining : 0;

  return (
    <div
      className="
        relative w-[320px] shrink-0
        rounded-2xl bg-gradient-to-br from-[#1A2233] to-[#101622]
        border border-[#2e374a] hover:border-[#135bec]/50
        p-5 transition-all duration-300
        group
      "
    >
      {/* Glow effect */}
      <div
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity"
        style={{ backgroundColor: goal.color }}
      />

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Concluído
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${goal.color}30, ${goal.color}10)`,
            color: goal.color
          }}
        >
          <CategoryIcon iconName={(goal.icon as CategoryIconName) || 'target'} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate">{goal.name}</h3>
          <p className="text-xs text-[#92a4c9]">
            Prazo: {deadline.toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Editable Values */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-[#101622]/50">
          <p className="text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">Atual</p>
          <InlineEdit
            value={goal.currentAmount}
            onSave={(value) => onUpdate({ currentAmount: value })}
            format="currency"
            min={0}
            max={goal.targetAmount * 2}
            step={100}
            ariaLabel={`Valor atual do objetivo ${goal.name}`}
            valueClassName="text-emerald-400 text-lg"
          />
        </div>
        <div className="p-3 rounded-xl bg-[#101622]/50">
          <p className="text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">Meta</p>
          <InlineEdit
            value={goal.targetAmount}
            onSave={(value) => onUpdate({ targetAmount: value })}
            format="currency"
            min={goal.currentAmount}
            step={100}
            ariaLabel={`Meta do objetivo ${goal.name}`}
            valueClassName="text-white text-lg"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-3">
        <div className="h-2 bg-[#101622] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${goal.color}CC, ${goal.color})`,
              boxShadow: `0 0 10px ${goal.color}60`
            }}
          />
        </div>
        <span className="absolute right-0 -top-5 text-xs font-bold text-[#92a4c9]">
          {progress.toFixed(0)}%
        </span>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-[#92a4c9]">
          <Target className="w-3.5 h-3.5" />
          <span>Faltam: <span className="text-white font-medium">{formatCurrency(remaining)}</span></span>
        </div>
        {monthlyNeeded > 0 && (
          <div className="flex items-center gap-1 text-[#92a4c9]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">{formatCurrency(monthlyNeeded)}/mês</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const GoalCarousel: React.FC<GoalCarouselProps> = ({
  goals,
  onUpdateGoal,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 340; // Card width + gap
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();

    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition]);

  if (goals.length === 0) {
    return (
      <div className={`
        flex items-center justify-center h-48
        rounded-2xl bg-[#1A2233] border-2 border-dashed border-[#2e374a]
        text-[#92a4c9]
        ${className}
      `}>
        <div className="text-center">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma meta cadastrada</p>
          <p className="text-sm opacity-75">Crie sua primeira meta financeira!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Metas anteriores"
          className="
            absolute left-0 top-1/2 -translate-y-1/2 z-10
            w-10 h-10 rounded-full
            bg-[#1A2233] border border-[#2e374a]
            shadow-lg shadow-black/30
            flex items-center justify-center
            text-[#92a4c9] hover:text-white
            hover:border-[#135bec] hover:scale-110
            transition-all duration-200
            -ml-5
          "
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="
          flex gap-5 overflow-x-auto scroll-smooth
          scrollbar-hide
          -mx-4 px-4 py-2
        "
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {goals.map(goal => (
          <div key={goal.id} style={{ scrollSnapAlign: 'start' }}>
            <GoalCard
              goal={goal}
              onUpdate={(updates) => onUpdateGoal(goal.id, updates)}
            />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Próximas metas"
          className="
            absolute right-0 top-1/2 -translate-y-1/2 z-10
            w-10 h-10 rounded-full
            bg-[#1A2233] border border-[#2e374a]
            shadow-lg shadow-black/30
            flex items-center justify-center
            text-[#92a4c9] hover:text-white
            hover:border-[#135bec] hover:scale-110
            transition-all duration-200
            -mr-5
          "
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Scroll Indicators */}
      {goals.length > 3 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: Math.ceil(goals.length / 3) }).map((_, idx) => (
            <div
              key={idx}
              className={`
                w-1.5 h-1.5 rounded-full transition-all duration-300
                ${idx === 0 ? 'w-4 bg-[#135bec]' : 'bg-[#2e374a]'}
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalCarousel;
