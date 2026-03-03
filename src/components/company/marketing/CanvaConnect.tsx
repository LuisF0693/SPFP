/**
 * CanvaConnect.tsx
 * Botão de conexão com o Canva + seletor de designs existentes para exportar como imagem
 * Compatível com Canva Pro (não requer Brand Templates / Teams)
 */

import React, { useState, useEffect } from 'react';
import { Palette, Link2, Link2Off, RefreshCw, Image, ChevronDown, ExternalLink } from 'lucide-react';
import {
  generateOAuthUrl,
  isConnected,
  disconnect,
  listDesigns,
  exportDesignAsImage,
  CanvaDesign,
} from '../../../services/canvaService';

interface Props {
  /** Callback chamado quando uma imagem é exportada com sucesso */
  onImageGenerated?: (url: string) => void;
}

const CanvaConnect: React.FC<Props> = ({ onImageGenerated }) => {
  const [connected, setConnected] = useState(false);
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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
    setDesigns([]);
    setSelectedDesign('');
    setShowDropdown(false);
  };

  const handleLoadDesigns = async () => {
    setLoadingDesigns(true);
    setError('');
    try {
      const list = await listDesigns();
      setDesigns(list);
      setShowDropdown(true);
      if (list.length === 0) {
        setError('Nenhum design encontrado na sua conta Canva. Crie um design no Canva e tente novamente.');
      }
    } catch (err: any) {
      setError('Erro ao carregar designs: ' + err.message);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const handleExportImage = async () => {
    if (!selectedDesign) {
      setError('Selecione um design Canva primeiro.');
      return;
    }

    setExporting(true);
    setError('');
    try {
      const imageUrl = await exportDesignAsImage(selectedDesign);
      onImageGenerated?.(imageUrl);
    } catch (err: any) {
      setError('Erro ao exportar imagem: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const selectedDesignData = designs.find((d) => d.id === selectedDesign);

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

      {/* Seleção de design e exportação */}
      {onImageGenerated && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão carregar designs */}
            <button
              onClick={handleLoadDesigns}
              disabled={loadingDesigns}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={loadingDesigns ? 'animate-spin' : ''} />
              {designs.length > 0 ? 'Atualizar designs' : 'Carregar designs'}
            </button>

            {/* Dropdown de designs */}
            {designs.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-xs hover:bg-white/10 transition-colors max-w-[180px]"
                >
                  <span className="truncate">
                    {selectedDesignData?.title ?? 'Selecionar design'}
                  </span>
                  <ChevronDown size={12} className="shrink-0" />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-[#0f0f1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                    {designs.map((design) => (
                      <button
                        key={design.id}
                        onClick={() => {
                          setSelectedDesign(design.id);
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 text-left transition-colors"
                      >
                        {design.thumbnail?.url ? (
                          <img
                            src={design.thumbnail.url}
                            alt={design.title}
                            className="w-12 h-8 object-cover rounded shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-white/5 rounded flex items-center justify-center shrink-0">
                            <Palette size={12} className="text-gray-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-xs truncate">{design.title || 'Sem título'}</p>
                          {design.urls?.edit_url && (
                            <a
                              href={design.urls.edit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-accent mt-0.5 transition-colors"
                            >
                              <ExternalLink size={9} />
                              Abrir no Canva
                            </a>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botão exportar */}
            {selectedDesign && (
              <button
                onClick={handleExportImage}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-accent text-xs font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
              >
                <Image size={12} className={exporting ? 'animate-pulse' : ''} />
                {exporting ? 'Exportando...' : 'Usar como imagem'}
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
