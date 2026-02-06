import React from 'react';

interface CategoryIconProps {
  iconName?: string;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * CategoryIcon - Renders an emoji icon for categories.
 * Now uses only emojis instead of Lucide icons for consistency.
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  size = 20,
  color,
  className
}) => {
  return (
    <span
      className={`flex items-center justify-center leading-none select-none ${className || ''}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        color: color
      }}
      role="img"
      aria-label="category icon"
    >
      {iconName || '📦'}
    </span>
  );
};

// Available emojis for category selection
export const AVAILABLE_EMOJIS = [
  '🏠', '🚗', '🏥', '🎓', '🛒', '🎉', '🍔', '🛍️', '📈', '🛡️', '☂️', '💰', '💵',
  '✈️', '🎮', '🎬', '📚', '☕', '🎵', '🏋️', '💻', '📱', '🎁', '🔧', '⚡', '📶',
  '🐕', '🐈', '🌿', '💊', '🍕', '🍺', '🚌', '⛽', '🅿️', '🏦', '💳', '🎨', '✂️',
  '👶', '🧒', '👕', '👗', '👠', '💄', '🧴', '🧹', '🏡', '🌳', '🚿', '🛁', '🛏️'
];

// Legacy export for backwards compatibility - now returns emojis
export const AVAILABLE_ICONS = AVAILABLE_EMOJIS;
