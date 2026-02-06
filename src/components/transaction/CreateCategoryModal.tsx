import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { CategoryGroup } from '../../types';

// Emojis disponíveis para categorias
const AVAILABLE_EMOJIS = [
  '🏠', '🚗', '🏥', '🎓', '🛒', '🎉', '🍔', '🛍️', '📈', '🛡️', '☂️', '💰', '💵',
  '✈️', '🎮', '🎬', '📚', '☕', '🎵', '🏋️', '💻', '📱', '🎁', '🔧', '⚡', '📶',
  '🐕', '🐈', '🌿', '💊', '🍕', '🍺', '🚌', '⛽', '🅿️', '🏦', '💳', '🎨', '✂️',
  '👶', '🧒', '👕', '👗', '👠', '💄', '🧴', '🧹', '🏡', '🌳', '🚿', '🛁', '🛏️'
];

const COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#64748b', '#84cc16'
];

const GROUP_LABELS: Record<CategoryGroup, string> = {
  'FIXED': 'Gastos Fixos',
  'VARIABLE': 'Gastos Variáveis',
  'INVESTMENT': 'Investimentos',
  'INCOME': 'Renda'
};

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCategory: (name: string, group: CategoryGroup, color: string, icon: string) => string;
  onCategoryCreated: (categoryId: string) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onCreateCategory,
  onCategoryCreated
}) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<CategoryGroup>('VARIABLE');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [icon, setIcon] = useState('📦');

  const handleCreate = () => {
    if (!name.trim()) return;

    const newId = onCreateCategory(name.trim(), group, color, icon);
    onCategoryCreated(newId);

    // Reset form
    setName('');
    setGroup('VARIABLE');
    setColor(COLOR_PALETTE[0]);
    setIcon('📦');
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setName('');
    setGroup('VARIABLE');
    setColor(COLOR_PALETTE[0]);
    setIcon('📦');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nova Categoria"
      variant="dark"
      size="md"
      footer={
        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Criar e Selecionar
        </button>
      }
    >
      <div className="space-y-5">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            Nome da Categoria
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Assinaturas, Manutenção..."
            className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:border-blue-500/50 text-slate-100 placeholder-slate-500"
            autoFocus
          />
        </div>

        {/* Group Select */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            Divisão Financeira
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(GROUP_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setGroup(key as CategoryGroup)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  group === key
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            Cor de Destaque
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-full border-2 transition-all active:scale-90 ${
                  color === c
                    ? 'border-white scale-110 shadow-lg'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Emoji Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            Emoji
          </label>
          <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-700/50 rounded-xl bg-slate-800/30">
            {AVAILABLE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`p-1.5 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 active:scale-95 ${
                  icon === emoji
                    ? 'bg-blue-600 shadow-lg ring-2 ring-blue-400'
                    : 'hover:bg-slate-700/50'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Preview</div>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${color}20`, borderColor: color, borderWidth: 2 }}
            >
              {icon}
            </div>
            <div>
              <div className="text-slate-100 font-medium">{name || 'Nome da categoria'}</div>
              <div className="text-xs text-slate-500">{GROUP_LABELS[group]}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
