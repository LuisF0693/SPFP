import React, { useMemo } from 'react';
import { designSystem } from '../../styles/designSystem';

interface HealthScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

/**
 * HealthScoreGauge: Visual representation of client health score
 * Displays a circular gauge with color coding
 */
export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  animated = true,
}) => {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  const sizeConfig = {
    sm: { diameter: 60, strokeWidth: 4, fontSize: 'text-sm' },
    md: { diameter: 80, strokeWidth: 6, fontSize: 'text-base' },
    lg: { diameter: 120, strokeWidth: 8, fontSize: 'text-xl' },
  };

  const config = sizeConfig[size];
  const radius = config.diameter / 2 - config.strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 80) return { fill: '#10B981', label: 'Saudável' };
    if (score >= 50) return { fill: '#F59E0B', label: 'Atenção' };
    return { fill: '#EF4444', label: 'Risco' };
  };

  const { fill, label } = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={config.diameter}
        height={config.diameter}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={config.strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          r={radius}
          fill="none"
          stroke={fill}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animated ? offset : 0}
          strokeLinecap="round"
          style={{
            transition: animated ? `stroke-dashoffset 1s ease-in-out` : 'none',
            filter: `drop-shadow(0 0 8px ${fill}40)`,
          }}
        />

        {/* Center text */}
        <text
          x={config.diameter / 2}
          y={config.diameter / 2}
          textAnchor="middle"
          dy="0.3em"
          className={`font-bold fill-white ${config.fontSize}`}
        >
          {Math.round(clampedScore)}%
        </text>
      </svg>

      {showLabel && (
        <div className="mt-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: fill }}>
            {label}
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthScoreGauge;
