// AIOS Virtual Office - Avatar Customizer Modal
import { useState, useCallback, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useVirtualOfficeStore, AVATAR_EMOJIS, ACCENT_COLORS, DEFAULT_USER_CUSTOMIZATION } from '../store/virtualOfficeStore';
import { useUserAvatarStore, USER_AVATAR_CONFIG } from '../store/userAvatarStore';

interface LocalCustomization {
  emoji: string;
  displayName: string;
  accentColor: string;
}

export function AvatarCustomizer() {
  const {
    userCustomization,
    isCustomizerOpen,
    setUserCustomization,
    resetUserCustomization,
    closeCustomizer
  } = useVirtualOfficeStore();

  const { emoji: avatarEmoji, name: avatarName, setEmoji, setName } = useUserAvatarStore();

  // Merge both stores for local editing
  const initialState: LocalCustomization = {
    emoji: avatarEmoji || userCustomization.emoji,
    displayName: avatarName || userCustomization.displayName,
    accentColor: userCustomization.accentColor
  };

  // Local state for editing (before saving)
  const [localCustomization, setLocalCustomization] = useState<LocalCustomization>(initialState);

  // Sync local state when modal opens
  useEffect(() => {
    if (isCustomizerOpen) {
      setLocalCustomization({
        emoji: avatarEmoji || userCustomization.emoji,
        displayName: avatarName || userCustomization.displayName,
        accentColor: userCustomization.accentColor
      });
    }
  }, [isCustomizerOpen, avatarEmoji, avatarName, userCustomization]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setLocalCustomization((prev) => ({ ...prev, emoji }));
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    setLocalCustomization((prev) => ({ ...prev, accentColor: color }));
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalCustomization((prev) => ({ ...prev, displayName: e.target.value }));
  }, []);

  const handleSave = useCallback(() => {
    // Save to both stores
    setEmoji(localCustomization.emoji);
    setName(localCustomization.displayName);
    setUserCustomization({
      emoji: localCustomization.emoji,
      displayName: localCustomization.displayName,
      accentColor: localCustomization.accentColor
    });
    closeCustomizer();
  }, [localCustomization, setEmoji, setName, setUserCustomization, closeCustomizer]);

  const handleCancel = useCallback(() => {
    setLocalCustomization({
      emoji: avatarEmoji || userCustomization.emoji,
      displayName: avatarName || userCustomization.displayName,
      accentColor: userCustomization.accentColor
    });
    closeCustomizer();
  }, [avatarEmoji, avatarName, userCustomization, closeCustomizer]);

  const handleReset = useCallback(() => {
    setLocalCustomization({
      emoji: USER_AVATAR_CONFIG.DEFAULT_EMOJI,
      displayName: USER_AVATAR_CONFIG.DEFAULT_NAME,
      accentColor: DEFAULT_USER_CUSTOMIZATION.accentColor
    });
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }, [handleCancel]);

  if (!isCustomizerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden
          bg-gray-900/95 backdrop-blur-xl border border-gray-700/50
          shadow-2xl animate-scale-in"
        style={{
          boxShadow: `0 0 60px ${localCustomization.accentColor}30, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            Personalize seu Avatar
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Preview */}
        <div className="p-6 flex flex-col items-center border-b border-gray-700/50 bg-gray-800/30">
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center text-5xl
              transition-all duration-300 shadow-lg animate-breathing"
            style={{
              background: `linear-gradient(135deg, ${localCustomization.accentColor}, ${adjustColor(localCustomization.accentColor, -30)})`,
              boxShadow: `0 0 40px ${localCustomization.accentColor}60, 0 0 80px ${localCustomization.accentColor}30`,
              border: `3px solid ${localCustomization.accentColor}80`
            }}
          >
            {/* Inner glow */}
            <div
              className="absolute inset-1 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 50%)'
              }}
            />
            <span className="relative z-10">{localCustomization.emoji}</span>
            {/* Online status indicator */}
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900 animate-pulse" />
          </div>
          <p className="mt-3 text-lg font-semibold text-white">
            {localCustomization.displayName || 'Seu Nome'}
          </p>
          <p className="text-sm text-gray-400">Preview</p>
        </div>

        {/* Name Input */}
        <div className="p-4 border-b border-gray-700/50">
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
            Nome de Exibicao
          </label>
          <input
            type="text"
            value={localCustomization.displayName}
            onChange={handleNameChange}
            placeholder="Digite seu nome"
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-lg
              bg-gray-800/50 border border-gray-700/50
              text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:border-transparent
              transition-all"
            style={{
              '--tw-ring-color': localCustomization.accentColor
            } as React.CSSProperties}
          />
        </div>

        {/* Emoji Grid */}
        <div className="p-4 border-b border-gray-700/50">
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-3">
            Escolha seu Avatar
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className={`
                  p-2 text-2xl rounded-lg transition-all duration-200
                  ${localCustomization.emoji === emoji
                    ? 'bg-white/20 scale-110'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 hover:scale-105'
                  }
                `}
                style={{
                  boxShadow: localCustomization.emoji === emoji
                    ? `0 0 0 2px ${localCustomization.accentColor}, 0 4px 12px ${localCustomization.accentColor}40`
                    : undefined
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div className="p-4 border-b border-gray-700/50">
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-3">
            Cor de Destaque
          </label>
          <div className="flex gap-3 justify-center flex-wrap">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`
                  w-10 h-10 rounded-full transition-all duration-200
                  ${localCustomization.accentColor === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                    : 'hover:scale-110'
                  }
                `}
                style={{
                  background: `linear-gradient(135deg, ${color}, ${adjustColor(color, -30)})`,
                  boxShadow: localCustomization.accentColor === color
                    ? `0 0 20px ${color}80`
                    : `0 4px 12px rgba(0, 0, 0, 0.3)`
                }}
                title={getColorName(color)}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50
              text-gray-400 hover:text-white transition-all"
            title="Voltar ao padrao"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-lg
              bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50
              text-gray-300 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${localCustomization.accentColor}, ${adjustColor(localCustomization.accentColor, -30)})`,
              boxShadow: `0 4px 20px ${localCustomization.accentColor}40`
            }}
          >
            Salvar
          </button>
        </div>
      </div>
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

// Get color name for accessibility
function getColorName(color: string): string {
  const colorNames: Record<string, string> = {
    '#4A90D9': 'Azul',
    '#50C878': 'Verde',
    '#FF6B6B': 'Vermelho',
    '#FFA500': 'Laranja',
    '#9B59B6': 'Roxo',
    '#F1C40F': 'Amarelo',
    '#E91E63': 'Rosa',
    '#00BCD4': 'Ciano'
  };
  return colorNames[color] || color;
}

export default AvatarCustomizer;
