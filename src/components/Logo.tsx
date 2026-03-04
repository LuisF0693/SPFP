import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 40,
  variant = 'icon'
}) => {
  if (variant === 'full') {
    return (
      <img
        src="/branding/logo.png"
        alt="SPFP Logo"
        width={size * 4}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  return (
    <img
      src="/branding/app-icon.png"
      alt="SPFP"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};
