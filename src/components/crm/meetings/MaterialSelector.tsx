import React, { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';

interface MaterialSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const AVAILABLE_MATERIALS = [
  'Finclass - Guia Completo',
  'Finclass - Curso de Ações',
  'Finclass - Renda Fixa',
  'XP Educação - Investimentos',
  'BTG Pactual - Análise',
  'Genial - Educação',
  'Outro Material',
];

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const addMaterial = (material: string) => {
    if (!value.includes(material)) {
      onChange([...value, material]);
    }
    setIsOpen(false);
  };

  const removeMaterial = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-white">Materiais Recomendados</label>

      {/* Selected Materials */}
      <div className="space-y-2">
        {value.map((material, idx) => (
          <div key={idx} className="glass p-3 rounded-lg border border-white/10 flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <GripVertical size={14} className="text-gray-500 group-hover:text-white" />
              <span className="text-sm text-white">{material}</span>
            </div>
            <button
              onClick={() => removeMaterial(idx)}
              className="p-1 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Material Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-white hover:border-accent transition-colors"
        >
          + Adicionar Material
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 glass border border-white/10 rounded-lg p-2 z-50 space-y-1">
            {AVAILABLE_MATERIALS.filter(m => !value.includes(m)).map((material) => (
              <button
                key={material}
                onClick={() => addMaterial(material)}
                className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm text-gray-300 transition-colors"
              >
                {material}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialSelector;
