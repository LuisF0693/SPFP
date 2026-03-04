import React from 'react';

interface FinnAvatarProps {
  mode?: 'advisor' | 'partner';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
}

const SIZES = { sm: 32, md: 40, lg: 80, xl: 120 } as const;
const BORDERS = { advisor: '#1B85E3', partner: '#00C2A0' } as const;
const IMAGES = {
  advisor: '/branding/finn-advisor.png',
  partner: '/branding/finn-partner.png',
} as const;
const LABELS = { advisor: 'Finn · Advisor', partner: 'Finn · Parceiro' } as const;
const ALTS = {
  advisor: 'Finn — modo analítico',
  partner: 'Finn — modo parceiro',
} as const;

export const FinnAvatar: React.FC<FinnAvatarProps> = ({
  mode = 'advisor',
  size = 'md',
  className = '',
  showLabel = false,
}) => {
  const px = SIZES[size];
  const border = BORDERS[mode];

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <img
        src={IMAGES[mode]}
        alt={ALTS[mode]}
        width={px}
        height={px}
        style={{
          borderRadius: '50%',
          border: `2px solid ${border}`,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      {showLabel && (
        <span
          style={{
            fontSize: 11,
            color: border,
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {LABELS[mode]}
        </span>
      )}
    </div>
  );
};
