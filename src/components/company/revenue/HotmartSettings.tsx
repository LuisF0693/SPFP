import React, { useState } from 'react';
import { Save, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../context/AuthContext';

export const HotmartSettings: React.FC = () => {
  const { user } = useAuth();
  const [webhookToken, setWebhookToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookToken.trim()) { setError('Token é obrigatório'); return; }
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('social_credentials')
        .upsert({
          user_id: user?.id,
          platform: 'hotmart',
          access_token: webhookToken,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,platform' });
      if (err) throw err;
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-semibold mb-1">Hotmart Webhooks</h3>
        <p className="text-gray-400 text-sm">Receba notificações de vendas de cursos e produtos digitais.</p>
      </div>

      <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/15 space-y-2">
        <p className="text-orange-400 text-sm font-medium">Como configurar:</p>
        <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
          <li>Hotmart → Ferramentas → Webhooks</li>
          <li>Adicionar URL: <code className="text-orange-300">[url]/hotmart-webhook</code></li>
          <li>Eventos: <code className="text-orange-300">PURCHASE_COMPLETE, PURCHASE_CANCELED, PURCHASE_REFUNDED</code></li>
          <li>Copiar o token de segurança (hottok)</li>
        </ol>
        <a
          href="https://developers.hotmart.com/docs/pt-BR/webhooks/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-orange-400 text-xs hover:underline"
        >
          <ExternalLink size={11} />
          Hotmart Developers
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
            Webhook Token (hottok) *
          </label>
          <input
            type="password"
            value={webhookToken}
            onChange={(e) => setWebhookToken(e.target.value)}
            placeholder="hotmart-token-xxxxxxxxxxxx"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm font-mono"
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-white font-semibold text-sm hover:bg-orange-500/30 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <ShieldCheck size={15} /> : <Save size={15} />}
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Hotmart Token'}
        </button>
      </form>
    </div>
  );
};
