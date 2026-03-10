/**
 * setup-clickup.mjs
 * Implementa estrutura completa do SPFP no ClickUp via API v2
 * Arquiteto: Pedro Valerio (OPS)
 */

const TOKEN = 'pk_284509678_BD2KU92GWEPO8O3C7X8RK0H9F40HZ5SV';
const HEADERS = { 'Authorization': TOKEN, 'Content-Type': 'application/json' };

const SPACES = {
  CS:           '901313441503',
  Vendas:       '901313444340',
  Marketing:    '901313444374',  // Marketing/Produtos
  Admin:        '901313463172',  // Administração
  OPS:          '901313463175',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

async function api(method, path, body) {
  const r = await fetch('https://api.clickup.com/api/v2' + path, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}: ${JSON.stringify(data)}`);
  return data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createFolder(spaceId, name) {
  const d = await api('POST', `/space/${spaceId}/folder`, { name });
  console.log(`  📁 Folder criado: "${name}" (${d.id})`);
  return d.id;
}

async function createList(parentType, parentId, name) {
  const path = parentType === 'folder'
    ? `/folder/${parentId}/list`
    : `/space/${parentId}/list`;
  const d = await api('POST', path, { name });
  console.log(`    📋 Lista criada: "${name}" (${d.id})`);
  return d.id;
}

async function createDropdown(listId, name, options) {
  try {
    const typeConfig = {
      options: options.map((opt, i) => ({
        name: opt.name,
        color: opt.color || null,
        orderindex: i,
      })),
    };
    await api('POST', `/list/${listId}/field`, {
      name,
      type: 'drop_down',
      type_config: typeConfig,
    });
    console.log(`      🏷️  Campo dropdown: "${name}"`);
  } catch(e) {
    console.log(`      ⚠️  Campo "${name}" ignorado: ${e.message.slice(0,80)}`);
  }
}

async function createTextField(listId, name) {
  try {
    await api('POST', `/list/${listId}/field`, { name, type: 'text' });
    console.log(`      📝 Campo texto: "${name}"`);
  } catch(e) {
    console.log(`      ⚠️  Campo "${name}" ignorado`);
  }
}

async function createDateField(listId, name) {
  try {
    await api('POST', `/list/${listId}/field`, { name, type: 'date' });
    console.log(`      📅 Campo data: "${name}"`);
  } catch(e) {
    console.log(`      ⚠️  Campo "${name}" ignorado`);
  }
}

async function createNumberField(listId, name) {
  try {
    await api('POST', `/list/${listId}/field`, { name, type: 'number' });
    console.log(`      🔢 Campo número: "${name}"`);
  } catch(e) {
    console.log(`      ⚠️  Campo "${name}" ignorado`);
  }
}

// ─── PRIORIDADE (campo padrão extra) ─────────────────────────────────────────

const PRIORIDADE = [
  { name: 'Crítica', color: '#f50000' },
  { name: 'Alta',    color: '#f8ae00' },
  { name: 'Média',   color: '#6fddff' },
  { name: 'Baixa',   color: '#d8d8d8' },
];

// ─── CS ───────────────────────────────────────────────────────────────────────

async function setupCS() {
  console.log('\n🟡 CS Space...');

  // Onboarding
  const onb = await createList('space', SPACES.CS, '🚀 Onboarding', []);
  await sleep(300);
  await createDropdown(onb, 'Plano do Cliente', [
    { name: 'Free',    color: '#d8d8d8' },
    { name: 'Basic',   color: '#6fddff' },
    { name: 'Premium', color: '#f8ae00' },
  ]);
  await createDropdown(onb, 'Health Score', [
    { name: '🟢 Verde',    color: '#008844' },
    { name: '🟡 Amarelo',  color: '#f8ae00' },
    { name: '🔴 Vermelho', color: '#f50000' },
  ]);
  await createDateField(onb, 'SLA');
  await createTextField(onb, 'Responsável Onboarding');

  // Suporte
  const sup = await createList('space', SPACES.CS, '🎫 Suporte');
  await sleep(300);
  await createDropdown(sup, 'Motivo do Ticket', [
    { name: 'Bug' },
    { name: 'Dúvida' },
    { name: 'Melhoria' },
    { name: 'Reclamação' },
    { name: 'Acesso' },
  ]);
  await createDropdown(sup, 'Severidade', [
    { name: 'Crítica',  color: '#f50000' },
    { name: 'Alta',     color: '#f8ae00' },
    { name: 'Média',    color: '#6fddff' },
    { name: 'Baixa',    color: '#d8d8d8' },
  ]);
  await createDropdown(sup, 'Plano do Cliente', [
    { name: 'Free' }, { name: 'Basic' }, { name: 'Premium' },
  ]);
  await createDateField(sup, 'SLA');
  await createNumberField(sup, 'Dias como Cliente');

  // Retenção & Health
  const ret = await createList('space', SPACES.CS, '💚 Retenção & Health');
  await sleep(300);
  await createDropdown(ret, 'Health Score', [
    { name: '🟢 Verde', color: '#008844' },
    { name: '🟡 Amarelo', color: '#f8ae00' },
    { name: '🔴 Vermelho', color: '#f50000' },
  ]);
  await createDropdown(ret, 'Plano do Cliente', [
    { name: 'Free' }, { name: 'Basic' }, { name: 'Premium' },
  ]);
  await createNumberField(ret, 'NPS');
  await createDateField(ret, 'Próxima Ação');

  // NPS & Feedback
  const nps = await createList('space', SPACES.CS, '📣 NPS & Feedback');
  await sleep(300);
  await createNumberField(nps, 'Score NPS');
  await createDropdown(nps, 'Categoria', [
    { name: 'Promotor', color: '#008844' },
    { name: 'Neutro',   color: '#f8ae00' },
    { name: 'Detrator', color: '#f50000' },
  ]);
  await createDropdown(nps, 'Plano do Cliente', [
    { name: 'Free' }, { name: 'Basic' }, { name: 'Premium' },
  ]);
}

// ─── VENDAS ───────────────────────────────────────────────────────────────────

async function setupVendas() {
  console.log('\n🔵 Vendas Space...');

  // Pipeline SDR
  const sdr = await createList('space', SPACES.Vendas, '🎯 Pipeline SDR');
  await sleep(300);
  await createDropdown(sdr, 'Fonte do Lead', [
    { name: 'Orgânico' },
    { name: 'Pago' },
    { name: 'Indicação' },
    { name: 'Parceria' },
    { name: 'Evento' },
  ]);
  await createDropdown(sdr, 'Plano de Interesse', [
    { name: 'Free' }, { name: 'Basic' }, { name: 'Premium' },
  ]);
  await createTextField(sdr, 'Próxima Ação');
  await createDateField(sdr, 'Data Próxima Ação');
  await createTextField(sdr, 'Telefone/WhatsApp');

  // Pipeline Closer
  const closer = await createList('space', SPACES.Vendas, '💰 Pipeline Closer');
  await sleep(300);
  await createDropdown(closer, 'Plano de Interesse', [
    { name: 'Free' }, { name: 'Basic' }, { name: 'Premium' },
  ]);
  await createDropdown(closer, 'Motivo de Perda', [
    { name: 'Preço' },
    { name: 'Concorrente' },
    { name: 'Sem Interesse' },
    { name: 'Timing' },
    { name: 'Produto' },
  ]);
  await createTextField(closer, 'Próxima Ação');
  await createDateField(closer, 'Data Próxima Ação');
  await createTextField(closer, 'Dor Principal');

  // Análise & Forecast
  const forecast = await createList('space', SPACES.Vendas, '📈 Análise & Forecast');
  await sleep(300);
  await createDropdown(forecast, 'Tipo de Relatório', [
    { name: 'Semanal' }, { name: 'Mensal' }, { name: 'Trimestral' },
  ]);
  await createDateField(forecast, 'Período');
}

// ─── MARKETING / PRODUTO ──────────────────────────────────────────────────────

async function setupMarketing() {
  console.log('\n🟢 Marketing/Produtos Space...');

  // — Folder Marketing —
  const mktFolder = await createFolder(SPACES.Marketing, '📢 Marketing');
  await sleep(300);

  const cal = await createList('folder', mktFolder, '🗓️ Calendário Editorial');
  await sleep(300);
  await createDropdown(cal, 'Canal', [
    { name: 'Instagram' }, { name: 'YouTube' }, { name: 'Email' },
    { name: 'Meta Ads' }, { name: 'Google Ads' }, { name: 'TikTok' }, { name: 'LinkedIn' },
  ]);
  await createDropdown(cal, 'Formato', [
    { name: 'Carrossel' }, { name: 'Reels' }, { name: 'Story' },
    { name: 'Post' }, { name: 'Email' }, { name: 'Vídeo' }, { name: 'Blog' },
  ]);
  await createDropdown(cal, 'Status de Aprovação', [
    { name: 'Pendente', color: '#f8ae00' },
    { name: 'Aprovado', color: '#008844' },
    { name: 'Reprovado', color: '#f50000' },
  ]);
  await createDateField(cal, 'Data de Publicação');
  await createTextField(cal, 'Aprovador');
  await createDropdown(cal, 'Prioridade', PRIORIDADE);

  const trafico = await createList('folder', mktFolder, '📢 Tráfego Pago');
  await sleep(300);
  await createDropdown(trafico, 'Plataforma', [
    { name: 'Meta Ads' }, { name: 'Google Ads' }, { name: 'TikTok Ads' },
  ]);
  await createTextField(trafico, 'Orçamento Diário (R$)');
  await createDateField(trafico, 'Data de Início');
  await createDateField(trafico, 'Data de Término');
  await createDropdown(trafico, 'Objetivo', [
    { name: 'Leads' }, { name: 'Conversão' }, { name: 'Awareness' }, { name: 'Tráfego' },
  ]);

  const email = await createList('folder', mktFolder, '📧 Email Marketing');
  await sleep(300);
  await createDropdown(email, 'Tipo', [
    { name: 'Sequência de Automação' }, { name: 'Campanha' }, { name: 'Newsletter' },
  ]);
  await createDateField(email, 'Data de Envio');
  await createTextField(email, 'Segmento de Lista');

  const research = await createList('folder', mktFolder, '🔍 Research & Intel');
  await sleep(300);
  await createDropdown(research, 'Tipo', [
    { name: 'Concorrente' }, { name: 'Tendência' }, { name: 'Swipe File' }, { name: 'Mercado' },
  ]);
  await createTextField(research, 'Fonte');

  const perf = await createList('folder', mktFolder, '📊 Performance');
  await sleep(300);
  await createDropdown(perf, 'Tipo de Relatório', [
    { name: 'Semanal' }, { name: 'Mensal' }, { name: 'Campanha' },
  ]);
  await createDateField(perf, 'Período');

  // — Folder Produto —
  const prodFolder = await createFolder(SPACES.Marketing, '📦 Produto');
  await sleep(300);

  const discovery = await createList('folder', prodFolder, '🔭 Discovery');
  await sleep(300);
  await createDropdown(discovery, 'Produto', [
    { name: 'SPFP SaaS' }, { name: 'Infoproduto' },
  ]);
  await createDropdown(discovery, 'Tipo', [
    { name: 'Hipótese' }, { name: 'Pesquisa de Usuário' }, { name: 'Análise de Dados' },
  ]);

  const backlog = await createList('folder', prodFolder, '📋 Backlog');
  await sleep(300);
  await createDropdown(backlog, 'Tipo', [
    { name: 'Feature' }, { name: 'Melhoria' }, { name: 'Spike' }, { name: 'Conteúdo' },
  ]);
  await createDropdown(backlog, 'Complexidade', [
    { name: 'P (1-2d)', color: '#008844' },
    { name: 'M (3-5d)', color: '#6fddff' },
    { name: 'G (1-2s)', color: '#f8ae00' },
    { name: 'GG (+2s)', color: '#f50000' },
  ]);
  await createNumberField(backlog, 'Story Points');
  await createDropdown(backlog, 'Produto', [
    { name: 'SPFP SaaS' }, { name: 'Infoproduto' },
  ]);
  await createDropdown(backlog, 'Impacto', [
    { name: 'Crítico', color: '#f50000' },
    { name: 'Alto',    color: '#f8ae00' },
    { name: 'Médio',   color: '#6fddff' },
    { name: 'Baixo',   color: '#d8d8d8' },
  ]);

  const sprint = await createList('folder', prodFolder, '🏃 Sprint Ativo');
  await sleep(300);
  await createTextField(sprint, 'Sprint');
  await createNumberField(sprint, 'Story Points');
  await createDropdown(sprint, 'Tipo', [
    { name: 'Feature' }, { name: 'Bug' }, { name: 'Melhoria' }, { name: 'Spike' },
  ]);

  const bugs = await createList('folder', prodFolder, '🐛 Bugs');
  await sleep(300);
  await createDropdown(bugs, 'Severidade', [
    { name: 'Crítico',  color: '#f50000' },
    { name: 'Alto',     color: '#f8ae00' },
    { name: 'Moderado', color: '#6fddff' },
    { name: 'Baixo',    color: '#d8d8d8' },
  ]);
  await createDropdown(bugs, 'Produto', [
    { name: 'SPFP SaaS' }, { name: 'Infoproduto' },
  ]);
  await createTextField(bugs, 'Passos para Reproduzir');
  await createTextField(bugs, 'Ambiente');

  const info = await createList('folder', prodFolder, '🎓 Infoprodutos');
  await sleep(300);
  await createDropdown(info, 'Tipo', [
    { name: 'Curso' }, { name: 'Ebook' }, { name: 'Masterclass' }, { name: 'Mentoria' },
  ]);
  await createDropdown(info, 'Status de Produção', [
    { name: 'Ideia' }, { name: 'Planejando' }, { name: 'Produzindo' },
    { name: 'Revisão' }, { name: 'Publicado' },
  ]);
  await createDateField(info, 'Data de Lançamento');
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

async function setupAdmin() {
  console.log('\n🟣 Administração Space...');

  const fin = await createList('space', SPACES.Admin, '💵 Financeiro');
  await sleep(300);
  await createDropdown(fin, 'Categoria', [
    { name: 'Receita',           color: '#008844' },
    { name: 'Despesa Fixa',      color: '#f50000' },
    { name: 'Despesa Variável',  color: '#f8ae00' },
    { name: 'Investimento',      color: '#6fddff' },
  ]);
  await createDropdown(fin, 'Status de Pagamento', [
    { name: 'Pendente', color: '#f8ae00' },
    { name: 'Pago',     color: '#008844' },
    { name: 'Vencido',  color: '#f50000' },
    { name: 'Cancelado', color: '#d8d8d8' },
  ]);
  await createDateField(fin, 'Vencimento');
  await createTextField(fin, 'Fornecedor/Empresa');
  await createTextField(fin, 'Valor (R$)');

  const jur = await createList('space', SPACES.Admin, '⚖️ Jurídico & Compliance');
  await sleep(300);
  await createDropdown(jur, 'Tipo', [
    { name: 'Contrato' }, { name: 'LGPD' }, { name: 'Compliance' },
    { name: 'Disputa' }, { name: 'Política Interna' },
  ]);
  await createDropdown(jur, 'Urgência', [
    { name: 'Urgente', color: '#f50000' },
    { name: 'Normal',  color: '#6fddff' },
    { name: 'Baixa',   color: '#d8d8d8' },
  ]);
  await createDateField(jur, 'Prazo');
  await createTextField(jur, 'Partes Envolvidas');

  const rh = await createList('space', SPACES.Admin, '👥 RH & People');
  await sleep(300);
  await createDropdown(rh, 'Tipo', [
    { name: 'Recrutamento' }, { name: 'Onboarding Interno' },
    { name: 'Offboarding' }, { name: 'Treinamento' }, { name: 'Performance' },
  ]);
  await createTextField(rh, 'Cargo/Função');
  await createDateField(rh, 'Data Início');

  const fac = await createList('space', SPACES.Admin, '🔧 Facilities & SaaS');
  await sleep(300);
  await createDropdown(fac, 'Tipo', [
    { name: 'Acesso/Conta' }, { name: 'Ferramenta SaaS' },
    { name: 'Fornecedor' }, { name: 'Equipamento' },
  ]);
  await createTextField(fac, 'Ferramenta/Sistema');
  await createDropdown(fac, 'Urgência', [
    { name: 'Urgente', color: '#f50000' },
    { name: 'Normal',  color: '#6fddff' },
  ]);
}

// ─── OPS ──────────────────────────────────────────────────────────────────────

async function setupOPS() {
  console.log('\n🔷 OPS Space...');

  const map = await createList('space', SPACES.OPS, '🗺️ Mapeamento de Processos');
  await sleep(300);
  await createDropdown(map, 'Squad', [
    { name: 'Marketing' }, { name: 'Vendas' }, { name: 'CS' },
    { name: 'Produto' }, { name: 'Admin' }, { name: 'OPS' },
  ]);
  await createDropdown(map, 'Fase OPS', [
    { name: 'Discovery' }, { name: 'Create' }, { name: 'Architecture' },
    { name: 'Automation' }, { name: 'QA' },
  ]);
  await createTextField(map, 'Processo');

  const arq = await createList('space', SPACES.OPS, '🏗️ Arquitetura de Processos');
  await sleep(300);
  await createDropdown(arq, 'Squad', [
    { name: 'Marketing' }, { name: 'Vendas' }, { name: 'CS' },
    { name: 'Produto' }, { name: 'Admin' }, { name: 'OPS' },
  ]);
  await createNumberField(arq, 'Score QA (0-100)');
  await createDropdown(arq, 'Status QA', [
    { name: 'Aguardando QA', color: '#f8ae00' },
    { name: 'Aprovado ✅',   color: '#008844' },
    { name: 'Reprovado ❌',  color: '#f50000' },
  ]);

  const aut = await createList('space', SPACES.OPS, '⚙️ Automações');
  await sleep(300);
  await createDropdown(aut, 'Ferramenta', [
    { name: 'ClickUp Automations' }, { name: 'N8N' }, { name: 'Manual' },
  ]);
  await createDropdown(aut, 'Squad', [
    { name: 'Marketing' }, { name: 'Vendas' }, { name: 'CS' },
    { name: 'Produto' }, { name: 'Admin' }, { name: 'OPS' },
  ]);
  await createTextField(aut, 'Trigger');
  await createTextField(aut, 'Ação');

  const qa = await createList('space', SPACES.OPS, '✅ QA de Processos');
  await sleep(300);
  await createNumberField(qa, 'Score (0-100)');
  await createDropdown(qa, 'Veredicto', [
    { name: 'Aprovado ✅',   color: '#008844' },
    { name: 'Reprovado ❌',  color: '#f50000' },
    { name: 'Em Revisão',    color: '#f8ae00' },
  ]);
  await createTextField(qa, 'Processo Avaliado');
  await createTextField(qa, 'Feedback de Reprovação');

  const sop = await createList('space', SPACES.OPS, '📚 SOPs');
  await sleep(300);
  await createDropdown(sop, 'Squad', [
    { name: 'Marketing' }, { name: 'Vendas' }, { name: 'CS' },
    { name: 'Produto' }, { name: 'Admin' }, { name: 'OPS' },
  ]);
  await createDropdown(sop, 'Status do SOP', [
    { name: 'Rascunho',      color: '#f8ae00' },
    { name: 'Publicado ✅',  color: '#008844' },
    { name: 'Desatualizado', color: '#f50000' },
  ]);
  await createTextField(sop, 'Link do Documento');
  await createTextField(sop, 'Responsável pelo SOP');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏗️ Implementando estrutura SPFP no ClickUp...');
  console.log('═══════════════════════════════════════════\n');

  try {
    await setupCS();
    await sleep(500);
    await setupVendas();
    await sleep(500);
    await setupMarketing();
    await sleep(500);
    await setupAdmin();
    await sleep(500);
    await setupOPS();

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ Estrutura implementada com sucesso!');
    console.log('\nPróximo passo: abrir o ClickUp e configurar');
    console.log('as automações nativas em cada lista.');
  } catch(e) {
    console.error('\n❌ Erro:', e.message);
    process.exit(1);
  }
}

main();
