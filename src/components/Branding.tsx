import React from 'react';

const colors = [
  { name: 'Navy-900', hex: '#0A1628', label: 'Fundo escuro premium', rgb: '10, 22, 40' },
  { name: 'Navy-700', hex: '#1B3A6B', label: 'Cor principal da marca', rgb: '27, 58, 107' },
  { name: 'Blue-Logo', hex: '#1B85E3', label: 'Símbolo — cor do logo aprovado', rgb: '27, 133, 227' },
  { name: 'Blue-300', hex: '#6AA9F4', label: 'Hover, ícones secundários', rgb: '106, 169, 244' },
  { name: 'Blue-100', hex: '#E8F1FD', label: 'Backgrounds suaves', rgb: '232, 241, 253' },
  { name: 'Teal-500', hex: '#00C2A0', label: 'Finn, metas, sucesso', rgb: '0, 194, 160' },
  { name: 'Teal-200', hex: '#99EAD8', label: 'Hover de sucesso', rgb: '153, 234, 216' },
  { name: 'Gray-900', hex: '#111827', label: 'Texto principal', rgb: '17, 24, 39' },
  { name: 'Gray-500', hex: '#6B7280', label: 'Texto terciário', rgb: '107, 114, 128' },
  { name: 'White', hex: '#FFFFFF', label: 'Base, cards', rgb: '255, 255, 255' },
];

const feedbackColors = [
  { name: 'Sucesso', hex: '#10B981', label: 'Meta atingida, saldo positivo' },
  { name: 'Erro', hex: '#EF4444', label: 'Saldo negativo, orçamento estourado' },
  { name: 'Alerta', hex: '#F59E0B', label: 'Próximo do limite' },
  { name: 'Info', hex: '#3B82F6', label: 'Mensagem neutra do Finn' },
];

const typographyScale = [
  { name: 'Display', font: 'Sora', weight: '800', size: '56–72px', use: 'Headline principal da landing' },
  { name: 'H1', font: 'Plus Jakarta Sans', weight: '800', size: '48px', use: 'Título de seção' },
  { name: 'H2', font: 'Plus Jakarta Sans', weight: '700', size: '36px', use: 'Subtítulos, módulos' },
  { name: 'H3', font: 'Plus Jakarta Sans', weight: '600', size: '24px', use: 'Cards, labels' },
  { name: 'Body', font: 'Plus Jakarta Sans', weight: '400', size: '16px', use: 'Texto padrão do app' },
  { name: 'Caption', font: 'Plus Jakarta Sans', weight: '400', size: '12px', use: 'Legendas, rodapés' },
];

export const Branding: React.FC = () => {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif", background: '#0A1628', color: '#FFFFFF', minHeight: '100vh' }}>

      {/* Top Banner */}
      <div style={{ background: '#1B3A6B', borderBottom: '1px solid #1B85E3', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#6AA9F4', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          SPFP · Brand Guidelines v1.1
        </span>
        <span style={{ fontSize: '12px', color: '#6AA9F4' }}>
          Uso interno — equipe e parceiros
        </span>
      </div>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', borderBottom: '1px solid rgba(107,169,244,0.15)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <img
            src="/branding/logo.png"
            alt="SPFP Logo"
            style={{ maxWidth: '340px', width: '100%', marginBottom: '32px', filter: 'brightness(1)' }}
          />
          <h1 style={{ fontSize: '18px', fontWeight: 400, color: '#6AA9F4', margin: '0 0 12px', letterSpacing: '0.02em' }}>
            "Consultoria especializada. Inteligência que nunca dorme."
          </h1>
          <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
            Tagline principal aprovada · Brand Chief: Marty Neumeier · Visual: Paula Scher
          </p>
        </div>
      </section>

      {/* Positioning */}
      <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(107,169,244,0.15)', maxWidth: '960px', margin: '0 auto' }}>
        <SectionTitle>Posicionamento</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '32px' }}>
          <Card accent="#1B85E3">
            <CardLabel color="#1B85E3">01 · Premium</CardLabel>
            <CardTitle>Consultoria com Luis</CardTitle>
            <CardText>O produto principal. Sessões estratégicas com especialista — para quem quer visão e decisão, não só números.</CardText>
          </Card>
          <Card accent="#00C2A0">
            <CardLabel color="#00C2A0">02 · Feature</CardLabel>
            <CardTitle>Finn (IA)</CardTitle>
            <CardText>A inteligência 24/7 que torna a consultoria 10× mais eficiente. Monitora, alerta e organiza entre as sessões.</CardText>
          </Card>
          <Card accent="#6AA9F4">
            <CardLabel color="#6AA9F4">03 · Ambiente</CardLabel>
            <CardTitle>Plataforma SPFP</CardTitle>
            <CardText>Onde tudo acontece. Interface clara, segura e organizada para toda a vida financeira do usuário.</CardText>
          </Card>
        </div>
        <div style={{ marginTop: '32px', background: 'rgba(27, 133, 227, 0.08)', border: '1px solid rgba(27, 133, 227, 0.2)', borderRadius: '12px', padding: '20px 24px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#6AA9F4', lineHeight: 1.6 }}>
            <strong style={{ color: '#E8F1FD' }}>Headline principal:</strong>{' '}
            "A consultoria do Luis. A inteligência do Finn."
          </p>
        </div>
      </section>

      {/* Colors */}
      <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(107,169,244,0.15)', maxWidth: '960px', margin: '0 auto' }}>
        <SectionTitle>Paleta de Cores</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '32px' }}>
          {colors.map((c) => (
            <div key={c.name} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ background: c.hex, height: '72px' }} />
              <div style={{ background: '#111827', padding: '10px 12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#E8F1FD', marginBottom: '2px' }}>{c.name}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>{c.hex}</div>
                <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '4px', lineHeight: 1.3 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feedback</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {feedbackColors.map((c) => (
              <div key={c.name} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ background: c.hex, height: '48px' }} />
                <div style={{ background: '#111827', padding: '8px 12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#E8F1FD', marginBottom: '2px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontFamily: 'monospace' }}>{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(107,169,244,0.15)', maxWidth: '960px', margin: '0 auto' }}>
        <SectionTitle>Tipografia</SectionTitle>
        <div style={{ marginTop: '32px', display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#111827', borderRadius: '10px', padding: '16px 20px', flex: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Principal</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#E8F1FD' }}>Plus Jakarta Sans</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Weights: 400 · 500 · 600 · 700 · 800</div>
          </div>
          <div style={{ background: '#111827', borderRadius: '10px', padding: '16px 20px', flex: 1, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Display</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#E8F1FD' }}>Sora</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>Uso restrito: headlines de campanha</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {typographyScale.map((t) => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'baseline', gap: '16px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ minWidth: '80px', fontSize: '11px', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.name}</div>
              <div style={{ minWidth: '140px', fontSize: '11px', color: '#4B5563', fontFamily: 'monospace' }}>{t.font} · {t.weight} · {t.size}</div>
              <div style={{ fontSize: '13px', color: '#6AA9F4' }}>{t.use}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Finn */}
      <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(107,169,244,0.15)', maxWidth: '960px', margin: '0 auto' }}>
        <SectionTitle>Finn — Assistente de IA</SectionTitle>
        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px', marginBottom: '40px' }}>
          Finn é a feature de IA do SPFP — não substitui a consultoria do Luis. Opera em 2 modos adaptativos.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#111827', borderRadius: '16px', padding: '32px', border: '1px solid #1B85E3', textAlign: 'center' }}>
            <img src="/branding/finn-advisor.png" alt="Finn Advisor" style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '20px' }} />
            <div style={{ fontSize: '11px', color: '#1B85E3', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>Modo Advisor</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#E8F1FD', margin: '0 0 12px' }}>Finn Analítico</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              Ativa em dados preocupantes, análise mensal e decisões importantes. Tom direto e baseado em dados.
            </p>
            <div style={{ background: '#0A1628', borderRadius: '10px', padding: '14px', textAlign: 'left' }}>
              <p style={{ fontSize: '13px', color: '#D1D5DB', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                "Finn analisou outubro. Lazer: R$680 — 40% acima da média. Quer ver as opções de ajuste?"
              </p>
            </div>
          </div>
          <div style={{ background: '#111827', borderRadius: '16px', padding: '32px', border: '1px solid #00C2A0', textAlign: 'center' }}>
            <img src="/branding/finn-partner.png" alt="Finn Parceiro" style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '20px' }} />
            <div style={{ fontSize: '11px', color: '#00C2A0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>Modo Parceiro</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#E8F1FD', margin: '0 0 12px' }}>Finn Encorajador</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px', lineHeight: 1.6 }}>
              Ativa em metas atingidas, onboarding e marcos de progresso. Tom caloroso e genuíno.
            </p>
            <div style={{ background: '#0A1628', borderRadius: '10px', padding: '14px', textAlign: 'left' }}>
              <p style={{ fontSize: '13px', color: '#D1D5DB', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>
                "Meta de viagem: concluída. Você guardou R$4.200 em 6 meses. Consistente. Aproveita cada segundo."
              </p>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '20px', background: 'rgba(0, 194, 160, 0.06)', border: '1px solid rgba(0, 194, 160, 0.2)', borderRadius: '10px', padding: '16px 20px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#99EAD8' }}>
            <strong>Regra de ouro:</strong> Finn nunca culpa. Finn nunca ignora. Finn nunca exagera. Finn nunca substitui o julgamento humano do consultor.
          </p>
        </div>
      </section>

      {/* App Icon */}
      <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(107,169,244,0.15)', maxWidth: '960px', margin: '0 auto' }}>
        <SectionTitle>App Icon</SectionTitle>
        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <img src="/branding/app-icon.png" alt="SPFP App Icon" style={{ width: '120px', height: '120px', borderRadius: '26px' }} />
          <img src="/branding/app-icon.png" alt="SPFP App Icon SM" style={{ width: '80px', height: '80px', borderRadius: '18px' }} />
          <img src="/branding/app-icon.png" alt="SPFP App Icon XS" style={{ width: '48px', height: '48px', borderRadius: '11px' }} />
          <img src="/branding/app-icon.png" alt="SPFP App Icon Tiny" style={{ width: '32px', height: '32px', borderRadius: '7px' }} />
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            <div>Fundo: Navy-900 (#0A1628)</div>
            <div>F: Blue-300 (#6AA9F4) · ExtraBold</div>
            <div>Ponto: Teal-500 (#00C2A0)</div>
            <div>Cantos: 22% (iOS padrão)</div>
          </div>
        </div>
      </section>

      {/* Voice */}
      <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(107,169,244,0.15)', maxWidth: '960px', margin: '0 auto' }}>
        <SectionTitle>Tom de Voz</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '32px' }}>
          {[
            { attr: 'Claro', desc: 'Direto, sem jargão — qualquer pessoa entende', color: '#1B85E3' },
            { attr: 'Humano', desc: 'Caloroso como conversa, sem perder seriedade', color: '#00C2A0' },
            { attr: 'Encorajador', desc: 'Positivo sem pressão, motivador sem ser falso', color: '#6AA9F4' },
            { attr: 'Confiável', desc: 'Preciso, consistente, cumpre o que promete', color: '#99EAD8' },
          ].map((v) => (
            <div key={v.attr} style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: `1px solid ${v.color}33` }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: v.color, marginBottom: '8px' }}>{v.attr}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>{v.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '11px', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '12px' }}>Escreva assim</div>
            {['Finn analisou. Você gastou mais do que o planejado.', 'Meta de reserva: 67% concluída. Faltam R$990.', 'Esse mês foi bom. Finn registrou.'].map(t => (
              <div key={t} style={{ fontSize: '13px', color: '#D1D5DB', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10B981' }}>✓</span> {t}
              </div>
            ))}
          </div>
          <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontSize: '11px', color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '12px' }}>Nunca escreva</div>
            {['Nossa IA revolucionária detectou anomalias.', 'ALERTA CRÍTICO: Você ultrapassou o orçamento!', 'Transforme sua vida financeira hoje mesmo!'].map(t => (
              <div key={t} style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#EF4444' }}>✕</span> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Board */}
      <section style={{ padding: '60px 24px', borderBottom: '1px solid rgba(107,169,244,0.15)', maxWidth: '960px', margin: '0 auto' }}>
        <SectionTitle>Mood Board</SectionTitle>
        <div style={{ marginTop: '32px' }}>
          <img src="/branding/mood-board.png" alt="SPFP Brand Mood Board" style={{ width: '100%', borderRadius: '16px', border: '1px solid rgba(107,169,244,0.15)' }} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', color: '#374151' }}>
        <div style={{ fontSize: '13px' }}>
          SPFP Brand Guidelines v1.1 · Squad Branding · 2026-03-04
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Marty Neumeier (Strategy) · Paula Scher (Visual) · Ann Handley (Voice) · David Aaker (Audit)
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#E8F1FD', margin: 0, borderLeft: '3px solid #1B85E3', paddingLeft: '12px' }}>
    {children}
  </h2>
);

const Card: React.FC<{ children: React.ReactNode; accent: string }> = ({ children, accent }) => (
  <div style={{ background: '#111827', borderRadius: '14px', padding: '24px', border: `1px solid ${accent}33` }}>
    {children}
  </div>
);

const CardLabel: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <div style={{ fontSize: '11px', color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#E8F1FD', margin: '0 0 8px' }}>{children}</h3>
);

const CardText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>{children}</p>
);
