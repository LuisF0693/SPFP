import React, { useState } from 'react';
import { Save, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../context/AuthContext';

export const MetaSettings: React.FC = () => {
  const { user } = useAuth();
  const [accessToken, setAccessToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [instagramId, setInstagramId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !pageId) { setError('Access Token e Page ID são obrigatórios'); return; }
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('social_credentials')
        .upsert({
          user_id: user?.id,
          platform: 'meta',
          access_token: accessToken,
          page_id: pageId,
          account_id: instagramId || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform' });
      if (err) throw err;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar credenciais');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-white font-semibold mb-1">Meta Business API</h3>
        <p className="text-gray-400 text-sm">Configure as credenciais para publicar no Instagram e Facebook.</p>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 space-y-2">
        <p className="text-blue-400 text-sm font-medium">Como obter as credenciais:</p>
        <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
          <li>Acesse Meta Developers → Crie um App de negócios</li>
          <li>Adicione o produto "Instagram Graph API"</li>
          <li>Gere um Long-lived Page Access Token</li>
          <li>Copie o Page ID da sua Página do Facebook</li>
          <li>Copie o Instagram Business Account ID</li>
        </ol>
        <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 text-xs hover:underline">
          <ExternalLink size={11} />
          Meta Developers Console
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Access Token *</label>
          <input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="EAAxxxxx..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Facebook Page ID *</label>
            <input type="text" value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="123456789" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Instagram Account ID</label>
            <input type="text" value={instagramId} onChange={(e) => setInstagramId(e.target.value)} placeholder="987654321" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm" />
          </div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/80 transition-all disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <ShieldCheck size={15} /> : <Save size={15} />}
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Credenciais'}
        </button>
      </form>
    </div>
  );
};
