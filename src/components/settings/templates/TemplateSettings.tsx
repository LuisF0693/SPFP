import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { templateService } from '../../../services/templateService';

interface TemplateSettingsProps {
  userId: string;
}

export const TemplateSettings: React.FC<TemplateSettingsProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('reuniao');
  const [template, setTemplate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [activeTab, userId]);

  const loadTemplate = async () => {
    const tabType = activeTab as 'reuniao' | 'investimentos';
    const custom = await templateService.getCustomTemplates(userId, tabType);
    const defaults = templateService.getDefaults();
    setTemplate(custom?.content || defaults[tabType]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await templateService.saveTemplate({
        id: Math.random().toString(36),
        userId,
        type: activeTab as 'reuniao' | 'investimentos',
        content: template,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      alert('Template salvo!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Restaurar padrão?')) {
      await templateService.resetTemplate(userId, activeTab as 'reuniao' | 'investimentos');
      await loadTemplate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('reuniao')}
          className="px-4 py-2 font-semibold border-b-2 transition-colors text-white"
        >
          Ata Reunião
        </button>
        <button
          onClick={() => setActiveTab('investimentos')}
          className="px-4 py-2 font-semibold border-b-2 transition-colors text-white"
        >
          Ata Investimentos
        </button>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-4">
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full h-64 bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:border-accent resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5"
        >
          Restaurar Padrão
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 bg-accent rounded-lg text-white font-semibold hover:bg-accent/80 disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
};

export default TemplateSettings;
