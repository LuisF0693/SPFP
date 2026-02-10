import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselProps {
  children: React.ReactNode[];
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  gap?: number;
  className?: string;
  itemClassName?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  gap = 16,
  className = '',
  itemClassName = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const totalItems = React.Children.count(children);

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate active index based on scroll position
    const itemWidth = container.firstElementChild?.clientWidth || 0;
    const newIndex = Math.round(scrollLeft / (itemWidth + gap));
    setActiveIndex(Math.min(newIndex, totalItems - 1));
  }, [gap, totalItems]);

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;

      const itemWidth = container.firstElementChild?.clientWidth || 0;
      container.scrollTo({
        left: index * (itemWidth + gap),
        behavior: 'smooth',
      });
    },
    [gap]
  );

  // Navigation handlers
  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeIndex < totalItems - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  // Auto play
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      if (activeIndex < totalItems - 1) {
        scrollToIndex(activeIndex + 1);
      } else {
        scrollToIndex(0);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, activeIndex, totalItems, scrollToIndex]);

  // Listen to scroll events
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition(); // Initial check

    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition]);

  return (
    <div className={`relative ${className}`}>
      {/* Left Arrow */}
      {showArrows && canScrollLeft && (
        <button
          onClick={handlePrev}
          aria-label="Anterior"
          className="
            absolute left-0 top-1/2 -translate-y-1/2 z-10
            w-10 h-10 rounded-full
            bg-white dark:bg-[#1A2233]
            border border-[#e6e8eb] dark:border-[#2e374a]
            shadow-md
            flex items-center justify-center
            text-[#637588] dark:text-[#92a4c9]
            hover:text-[#111418] dark:hover:text-white
            hover:scale-110 active:scale-95
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
          flex overflow-x-auto scroll-smooth
          scrollbar-hide
          -mx-4 px-4
        "
        style={{
          gap: `${gap}px`,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className={`flex-shrink-0 scroll-snap-align-start ${itemClassName}`}
            style={{ scrollSnapAlign: 'start' }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {showArrows && canScrollRight && (
        <button
          onClick={handleNext}
          aria-label="Próximo"
          className="
            absolute right-0 top-1/2 -translate-y-1/2 z-10
            w-10 h-10 rounded-full
            bg-white dark:bg-[#1A2233]
            border border-[#e6e8eb] dark:border-[#2e374a]
            shadow-md
            flex items-center justify-center
            text-[#637588] dark:text-[#92a4c9]
            hover:text-[#111418] dark:hover:text-white
            hover:scale-110 active:scale-95
            transition-all duration-200
            -mr-5
          "
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Dots */}
      {showDots && totalItems > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${index === activeIndex
                  ? 'bg-[#135bec] w-4'
                  : 'bg-[#e6e8eb] dark:bg-[#2e374a] hover:bg-[#135bec]/50'
                }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
