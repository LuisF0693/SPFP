/**
 * CanvaConnect.tsx
 * Botão de conexão com o Canva + seletor de templates para gerar imagens
 */

import React, { useState, useEffect } from 'react';
import { Palette, Link2, Link2Off, RefreshCw, Image, ChevronDown } from 'lucide-react';
import {
  generateOAuthUrl,
  isConnected,
  disconnect,
  listBrandTemplates,
  createDesignFromTemplate,
  exportDesignAsImage,
  CanvaBrandTemplate,
} from '../../../services/canvaService';

interface Props {
  /** Título do conteúdo — usado para preencher o template */
  contentTitle?: string;
  /** Legenda/caption — usada para preencher o template */
  contentCaption?: string;
  /** Callback chamado quando uma imagem é gerada com sucesso */
  onImageGenerated?: (url: string) => void;
}

const CanvaConnect: React.FC<Props> = ({ contentTitle, contentCaption, onImageGenerated }) => {
  const [connected, setConnected] = useState(false);
  const [templates, setTemplates] = useState<CanvaBrandTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setConnected(isConnected());
  }, []);

  const handleConnect = async () => {
    try {
      const url = await generateOAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      setError('Erro ao iniciar conexão com o Canva: ' + err.message);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setConnected(false);
    setTemplates([]);
    setSelectedTemplate('');
    setShowTemplates(false);
  };

  const handleLoadTemplates = async () => {
    setLoadingTemplates(true);
    setError('');
    try {
      const list = await listBrandTemplates();
      setTemplates(list);
      setShowTemplates(true);
      if (list.length === 0) {
        setError('Nenhum Brand Template encontrado na sua conta Canva. Crie um template com o nome dos campos de dados.');
      }
    } catch (err: any) {
      setError('Erro ao carregar templates: ' + err.message);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedTemplate) {
      setError('Selecione um template Canva primeiro.');
      return;
    }
    if (!contentTitle) {
      setError('O conteúdo precisa de um título para gerar a imagem.');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const designId = await createDesignFromTemplate(selectedTemplate, contentTitle, {
        titulo: contentTitle,
        legenda: contentCaption ?? '',
      });
      const imageUrl = await exportDesignAsImage(designId);
      onImageGenerated?.(imageUrl);
    } catch (err: any) {
      setError('Erro ao gerar imagem: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Não conectado ──────────────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="space-y-2">
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 px-4 py-2 bg-[#7D2AE8]/10 border border-[#7D2AE8]/30 rounded-xl text-[#a855f7] text-sm font-medium hover:bg-[#7D2AE8]/20 transition-colors"
        >
          <Palette size={15} />
          Conectar Canva
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    );
  }

  // ── Conectado ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Status conectado */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Link2 size={13} className="text-green-400" />
          <span className="text-green-400 text-xs font-medium">Canva conectado</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-1 text-gray-500 hover:text-red-400 text-xs transition-colors"
        >
          <Link2Off size={12} />
          Desconectar
        </button>
      </div>

      {/* Ação de gerar imagem */}
      {onImageGenerated && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* Botão carregar templates */}
            <button
              onClick={handleLoadTemplates}
              disabled={loadingTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={loadingTemplates ? 'animate-spin' : ''} />
              {templates.length > 0 ? 'Atualizar templates' : 'Carregar templates'}
            </button>

            {/* Dropdown de templates */}
            {templates.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-xs hover:bg-white/10 transition-colors"
                >
                  {selectedTemplate
                    ? templates.find((t) => t.id === selectedTemplate)?.title ?? 'Template selecionado'
                    : 'Selecionar template'}
                  <ChevronDown size={12} />
                </button>

                {showTemplates && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {templates.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => {
                          setSelectedTemplate(tmpl.id);
                          setShowTemplates(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 text-left transition-colors"
                      >
                        {tmpl.thumbnail?.url ? (
                          <img
                            src={tmpl.thumbnail.url}
                            alt={tmpl.title}
                            className="w-10 h-7 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-7 bg-white/5 rounded flex items-center justify-center">
                            <Palette size={12} className="text-gray-500" />
                          </div>
                        )}
                        <span className="text-white text-xs truncate">{tmpl.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botão gerar imagem */}
            {selectedTemplate && (
              <button
                onClick={handleGenerateImage}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
              >
                <Image size={12} className={generating ? 'animate-pulse' : ''} />
                {generating ? 'Gerando...' : 'Gerar imagem'}
              </button>
            )}
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default CanvaConnect;
