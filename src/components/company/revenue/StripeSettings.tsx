import React, { useState } from 'react';
import { Save, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../context/AuthContext';

export const StripeSettings: React.FC = () => {
  const { user } = useAuth();
  const [webhookSecret, setWebhookSecret] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookSecret.trim()) { setError('Webhook Secret é obrigatório'); return; }
    setSaving(true);
    try {
      const { error: err } = await supabase
        .from('social_credentials')
        .upsert({
          user_id: user?.id,
          platform: 'stripe',
          access_token: webhookSecret,
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
        <h3 className="text-white font-semibold mb-1">Stripe Webhooks</h3>
        <p className="text-gray-400 text-sm">Receba notificações de pagamentos em tempo real.</p>
      </div>

      <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/15 space-y-2">
        <p className="text-violet-400 text-sm font-medium">Como configurar:</p>
        <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
          <li>Stripe Dashboard → Developers → Webhooks</li>
          <li>Adicionar endpoint: <code className="text-violet-300">[url]/stripe-webhook</code></li>
          <li>Eventos: <code className="text-violet-300">checkout.session.completed, invoice.paid, customer.subscription.deleted</code></li>
          <li>Copiar o Signing Secret gerado</li>
        </ol>
        <a
          href="https://dashboard.stripe.com/webhooks"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-violet-400 text-xs hover:underline"
        >
          <ExternalLink size={11} />
          Stripe Dashboard
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
            Webhook Signing Secret *
          </label>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="whsec_xxxxxxxxxxxxxxxxxx"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm font-mono"
          />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30 text-white font-semibold text-sm hover:bg-violet-500/30 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <ShieldCheck size={15} /> : <Save size={15} />}
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Stripe Secret'}
        </button>
      </form>
    </div>
  );
};
