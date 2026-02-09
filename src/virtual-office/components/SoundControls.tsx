// AIOS Virtual Office - Sound Controls Component
import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

interface SoundControlsProps {
  enabled: boolean;
  volume: number;
  ambientPlaying: boolean;
  onToggleEnabled: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleAmbient: () => void;
}

export function SoundControls({
  enabled,
  volume,
  ambientPlaying,
  onToggleEnabled,
  onVolumeChange,
  onToggleAmbient
}: SoundControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseInt(e.target.value, 10));
  }, [onVolumeChange]);

  return (
    <div ref={containerRef} className="relative">
      {/* Sound Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center
          w-9 h-9 rounded-lg
          transition-all duration-200
          ${enabled
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
            : 'bg-gray-800/50 text-gray-500 border border-gray-700/50 hover:bg-gray-700/50 hover:text-gray-400'
          }
        `}
        title={enabled ? 'Sound settings' : 'Sound off - click to open settings'}
        aria-label="Sound controls"
        aria-expanded={isOpen}
      >
        {enabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className="
            absolute top-full right-0 mt-2
            w-64 p-4
            bg-gray-900/95 backdrop-blur-xl
            border border-gray-700/50 rounded-xl
            shadow-2xl z-50
            animate-fade-in
          "
          style={{
            boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Sound Settings</h3>
            <button
              onClick={onToggleEnabled}
              className={`
                px-2 py-1 rounded-md text-xs font-medium
                transition-all duration-200
                ${enabled
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
                }
              `}
            >
              {enabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Volume Slider */}
          <div className={`space-y-3 ${!enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Master Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Master Volume</span>
                <span className="text-xs text-gray-500">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="
                  w-full h-1.5 rounded-full
                  bg-gray-700 appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-blue-500
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-blue-500/30
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:appearance-none
                  [&::-moz-range-thumb]:w-3.5
                  [&::-moz-range-thumb]:h-3.5
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-blue-500
                  [&::-moz-range-thumb]:border-none
                  [&::-moz-range-thumb]:cursor-pointer
                "
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #374151 ${volume}%, #374151 100%)`
                }}
                disabled={!enabled}
                aria-label="Master volume"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-800 my-3" />

            {/* Ambient Music Toggle */}
            <button
              onClick={onToggleAmbient}
              disabled={!enabled}
              className={`
                w-full flex items-center gap-3 p-2.5 rounded-lg
                transition-all duration-200
                ${ambientPlaying
                  ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                  : 'bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                }
              `}
            >
              <div className={`
                p-1.5 rounded-md
                ${ambientPlaying ? 'bg-purple-500/30' : 'bg-gray-700/50'}
              `}>
                <Music className={`w-4 h-4 ${ambientPlaying ? 'animate-pulse' : ''}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-medium">Ambient Music</div>
                <div className="text-[10px] text-gray-500">
                  {ambientPlaying ? 'Playing lofi beats...' : 'Lofi beats for focus'}
                </div>
              </div>
              <div className={`
                w-2 h-2 rounded-full
                ${ambientPlaying ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}
              `} />
            </button>

            {/* Sound Effects Info */}
            <div className="mt-3 p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30">
              <div className="text-[10px] text-gray-500 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">*</span>
                  <span>Task complete: success chime</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">*</span>
                  <span>New message: notification blip</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer hint */}
          <div className="mt-3 text-[10px] text-gray-600 text-center">
            Sounds muted by default for privacy
          </div>
        </div>
      )}
    </div>
  );
}

export default SoundControls;
