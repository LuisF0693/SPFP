import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils';

interface BudgetSliderProps {
    spent: number;
    limit: number;
    color: string;
    onChangeLimit: (newLimit: number) => void;
}

export const BudgetSlider: React.FC<BudgetSliderProps> = ({ spent, limit, color, onChangeLimit }) => {
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // The maximum range of the slider is typically slightly more than the larger of spent or limit,
    // to give some breathing room. Let's say max is 1.5x the higher value, or a default base.
    // If both are 0, default to 1000.
    const maxValue = Math.max(spent, limit, 500) * 1.5;

    const getPercentage = (value: number) => {
        return Math.min((value / maxValue) * 100, 100);
    };

    const handleInteraction = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;

        // Calculate raw percentage based on click/drag position
        let percentage = x / width;
        percentage = Math.max(0, Math.min(percentage, 1)); // Clamp 0-1

        const newValue = percentage * maxValue;
        onChangeLimit(Math.round(newValue)); // Round to integer for cleaner UI
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            handleInteraction(e.clientX);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const spentPercentage = getPercentage(spent);
    const limitPercentage = getPercentage(limit);

    // Alert logic for colors
    const ratio = limit > 0 ? spent / limit : (spent > 0 ? 1.1 : 0);
    let statusColor = color; // Default category color

    if (ratio >= 1) statusColor = '#ef4444'; // Red (Critical)
    else if (ratio >= 0.9) statusColor = '#f97316'; // Orange (Danger)
    else if (ratio >= 0.75) statusColor = '#eab308'; // Yellow (Warning)

    return (
        <div className="relative h-12 flex items-center select-none cursor-pointer group" ref={containerRef} onMouseDown={handleMouseDown}>
            {/* Background Track */}
            <div className="absolute w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                {/* Spent Bar */}
                <div
                    className="h-full transition-all duration-300 rounded-full border-r-2 border-gray-900"
                    style={{
                        width: `${spentPercentage}%`,
                        backgroundColor: statusColor
                    }}
                />
            </div>

            {/* Limit Marker (The "Stick") */}
            <div
                className="absolute h-6 w-1 hover:w-1.5 hover:h-8 hover:brightness-125 transition-all duration-100 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10 cursor-ew-resize rounded-full"
                style={{ left: `${limitPercentage}%` }}
            >
                {/* Tooltip on Hover/Drag */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded border border-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Meta: {formatCurrency(limit)}
                </div>
            </div>

            {/* Spent Marker Visual (Optional, maybe just the bar is enough, but a dot at the end of spent bar looks nice) */}
            <div
                className="absolute h-3 w-3 rounded-full border-2 border-gray-900 z-0 transition-all duration-300"
                style={{
                    left: `${spentPercentage}%`,
                    backgroundColor: statusColor,
                    marginLeft: '-6px' // Center the dot
                }}
            />

        </div>
    );
};
