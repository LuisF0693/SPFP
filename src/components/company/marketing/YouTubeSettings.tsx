import React, { useState } from 'react';
import { Save, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../context/AuthContext';

export const YouTubeSettings: React.FC = () => {
  const { user } = useAuth();
  const [refreshToken, setRefreshToken] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refreshToken || !clientId) { setError('Refresh Token e Client ID são obrigatórios'); return; }
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('social_credentials')
        .upsert({
          user_id: user?.id,
          platform: 'youtube',
          refresh_token: refreshToken,
          metadata: { client_id: clientId, client_secret: clientSecret },
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
        <h3 className="text-white font-semibold mb-1">YouTube Data API v3</h3>
        <p className="text-gray-400 text-sm">Configure OAuth2 para upload de vídeos diretamente do SPFP.</p>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15 space-y-2">
        <p className="text-red-400 text-sm font-medium">Como configurar:</p>
        <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
          <li>Google Cloud Console → Crie um projeto</li>
          <li>Habilite a YouTube Data API v3</li>
          <li>Crie credenciais OAuth2 (tipo: Web Application)</li>
          <li>Execute o fluxo OAuth2 e obtenha o Refresh Token</li>
          <li>Scope necessário: <code className="text-red-300">youtube.upload</code></li>
        </ol>
        <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-red-400 text-xs hover:underline">
          <ExternalLink size={11} />
          Google Cloud Console
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">OAuth2 Client ID *</label>
            <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="xxxxxx.apps.googleusercontent.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Client Secret</label>
            <input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} placeholder="GOCSPX-xxxxx" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Refresh Token *</label>
          <input type="password" value={refreshToken} onChange={(e) => setRefreshToken(e.target.value)} placeholder="1//xxxxxxxxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm font-mono" />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-white font-semibold text-sm hover:bg-red-500/30 transition-all disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <ShieldCheck size={15} /> : <Save size={15} />}
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Credenciais YouTube'}
        </button>
      </form>
    </div>
  );
};
