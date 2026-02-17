import { DepartmentConfig } from '@/types/corporate';

interface DepartmentProps {
  department: DepartmentConfig;
  isHovered: boolean;
  isSelected: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export function Department({
  department,
  isHovered,
  isSelected,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: DepartmentProps) {
  return (
    <div
      className={`
        relative w-full aspect-square cursor-pointer
        transition-all duration-200 ease-out
        ${isHovered || isSelected ? 'scale-105' : 'scale-100'}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${department.label} Department`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      {/* Outer pixelated border */}
      <div
        className={`
          absolute inset-0 rounded-none
          border-4 transition-all duration-200
          ${isSelected ? 'border-yellow-300 shadow-lg' : department.borderColor}
          ${isHovered || isSelected ? 'shadow-2xl' : 'shadow-md'}
        `}
        style={{
          boxShadow: isHovered || isSelected
            ? `0 0 20px ${department.color}80, inset 0 0 20px ${department.color}40`
            : `0 4px 8px rgba(0,0,0,0.2), inset 0 0 10px ${department.color}30`
        }}
      >
        {/* Background */}
        <div
          className="absolute inset-1 overflow-hidden"
          style={{ backgroundColor: department.bgColor }}
        >
          {/* Pixel pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(0,0,0,0.5) 2px,
                  rgba(0,0,0,0.5) 4px
                )
              `,
            }}
          />

          {/* Content */}
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            {/* Main emoji "sprite" */}
            <div className="text-6xl mb-2 drop-shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
              {department.emoji}
            </div>

            {/* Department name */}
            <h2
              className="text-center font-bold text-lg mb-3 font-pixel"
              style={{
                color: department.color,
                textShadow: `2px 2px 0 rgba(0,0,0,0.3)`,
              }}
            >
              {department.label}
            </h2>

            {/* NPC at bottom */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-3xl">{department.npc.emoji}</div>
              <p
                className="text-xs font-semibold font-pixel"
                style={{
                  color: department.color,
                  textShadow: `1px 1px 0 rgba(0,0,0,0.3)`,
                }}
              >
                {department.npc.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hover indicator */}
      {(isHovered || isSelected) && (
        <div
          className="absolute top-2 right-2 w-3 h-3 rounded-none animate-pulse"
          style={{ backgroundColor: department.color }}
        />
      )}
    </div>
  );
}
