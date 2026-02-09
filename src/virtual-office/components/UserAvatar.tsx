// AIOS Virtual Office - User Avatar Component
import { useVirtualOfficeStore } from '../store/virtualOfficeStore';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showName?: boolean;
}

const SIZES = {
  sm: { container: 'w-8 h-8', emoji: 'text-lg', name: 'text-xs' },
  md: { container: 'w-12 h-12', emoji: 'text-2xl', name: 'text-sm' },
  lg: { container: 'w-16 h-16', emoji: 'text-3xl', name: 'text-base' }
};

export function UserAvatar({ size = 'md', onClick, showName = false }: UserAvatarProps) {
  const { userCustomization, openCustomizer } = useVirtualOfficeStore();
  const sizeClasses = SIZES[size];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      openCustomizer();
    }
  };

  return (
    <div
      className="flex items-center gap-2 cursor-pointer group"
      onClick={handleClick}
    >
      <div
        className={`
          ${sizeClasses.container} rounded-full flex items-center justify-center
          transition-all duration-200 group-hover:scale-110
        `}
        style={{
          background: `linear-gradient(135deg, ${userCustomization.accentColor}, ${adjustColor(userCustomization.accentColor, -30)})`,
          boxShadow: `0 4px 15px ${userCustomization.accentColor}40`
        }}
      >
        <span className={sizeClasses.emoji}>{userCustomization.emoji}</span>
      </div>
      {showName && (
        <span className={`${sizeClasses.name} text-white font-medium`}>
          {userCustomization.displayName}
        </span>
      )}
    </div>
  );
}

// Helper function to darken/lighten a hex color
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export default UserAvatar;
