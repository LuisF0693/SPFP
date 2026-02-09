// AIOS Virtual Office - User Avatar on Office Floor (with movement)
import { useMemo } from 'react';
import { useUserAvatarStore, USER_AVATAR_CONFIG } from '../store/userAvatarStore';
import type { Position } from '../types';

interface UserAvatarOfficeProps {
  /** Show destination indicator when moving */
  showDestination?: boolean;
}

export function UserAvatarOffice({ showDestination = true }: UserAvatarOfficeProps) {
  const { position, targetPosition, isMoving, emoji, name } = useUserAvatarStore();

  // Calculate current display position (target if moving, otherwise position)
  const displayPosition = useMemo<Position>(() => {
    return isMoving && targetPosition ? targetPosition : position;
  }, [isMoving, targetPosition, position]);

  return (
    <>
      {/* Destination Indicator - Pulsing circle at target */}
      {showDestination && isMoving && targetPosition && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: targetPosition.x,
            top: targetPosition.y,
            transform: 'translate(-50%, -50%)',
            zIndex: 45
          }}
        >
          {/* Pulsing outer ring */}
          <div className="absolute inset-0 w-12 h-12 -ml-6 -mt-6">
            <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-amber-400/40 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-amber-400/60" />
          </div>
        </div>
      )}

      {/* User Avatar */}
      <div
        data-user-avatar
        className="absolute flex flex-col items-center cursor-default select-none"
        style={{
          left: displayPosition.x,
          top: displayPosition.y,
          transform: `translate(-50%, -50%) scale(${USER_AVATAR_CONFIG.SCALE})`,
          transition: isMoving
            ? `left ${USER_AVATAR_CONFIG.MOVE_DURATION}ms ease-out, top ${USER_AVATAR_CONFIG.MOVE_DURATION}ms ease-out`
            : 'none',
          zIndex: 50 // Above agents (agents are z-index 10)
        }}
      >
        {/* Avatar Circle with golden border */}
        <div
          className={`
            relative w-16 h-16 rounded-full flex items-center justify-center
            ${isMoving ? '' : 'animate-breathing'}
            transition-shadow duration-300
          `}
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            boxShadow: `
              0 0 20px rgba(255, 215, 0, 0.5),
              0 0 40px rgba(255, 215, 0, 0.3),
              inset 0 0 20px rgba(255, 255, 255, 0.2)
            `,
            border: '3px solid rgba(255, 215, 0, 0.8)'
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-1 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 50%)'
            }}
          />

          {/* Emoji */}
          <span className="text-3xl relative z-10">{emoji}</span>

          {/* Online status indicator */}
          <div
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full
              bg-green-500 border-2 border-gray-900 animate-pulse"
          />
        </div>

        {/* Name label */}
        <div className="text-center mt-2 max-w-[80px]">
          <p className="text-sm text-white font-semibold drop-shadow-lg truncate">
            {name}
          </p>
          <p className="text-[10px] text-amber-300/80 truncate">
            Controlador
          </p>
        </div>

        {/* Movement trail effect (subtle glow while moving) */}
        {isMoving && (
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              width: '100px',
              height: '100px',
              marginLeft: '-18px',
              marginTop: '-18px',
              background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
              animation: 'pulse 0.5s ease-out infinite'
            }}
          />
        )}
      </div>
    </>
  );
}

export default UserAvatarOffice;
