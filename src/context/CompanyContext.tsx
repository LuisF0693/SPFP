import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';
import { CompanySquad, CompanyBoard, CompanyTask } from '../types/company';

const DEFAULT_SQUADS: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'Marketing',        icon: '🎯', color: '#ec4899', description: 'Squad de Marketing e Growth',        is_archived: false, sort_order: 0 },
  { name: 'Vendas',           icon: '💰', color: '#10b981', description: 'Squad de Vendas e Closers',          is_archived: false, sort_order: 1 },
  { name: 'Produtos',         icon: '📦', color: '#3b82f6', description: 'Squad de Produto e Conteúdo',        is_archived: false, sort_order: 2 },
  { name: 'OPS',              icon: '⚙️', color: '#f59e0b', description: 'Squad de Operações e Processos',     is_archived: false, sort_order: 3 },
  { name: 'Customer Success', icon: '💬', color: '#8b5cf6', description: 'Squad de CS e Retenção',            is_archived: false, sort_order: 4 },
  { name: 'Admin',            icon: '🏛️', color: '#6b7280', description: 'Squad Administrativo e Financeiro', is_archived: false, sort_order: 5 },
];

type DefaultBoard = { name: string; icon: string; description: string };

type DefaultTask = {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  assignee_name?: string;
  due_date?: string;
};

// Tarefas padrão por board do squad Marketing (geradas pelo Squad de Marketing — Thiago Finch)
const DEFAULT_TASKS_BY_BOARD: Record<string, DefaultTask[]> = {
  'Estratégia': [
    {
      title: 'Configurar conta MailerLite',
      description: 'Criar conta gratuita em mailerlite.com (grátis até 1.000 contatos). Configurar remetente como "Luis | SPFP". Verificar domínio de email.',
      priority: 'URGENT',
      tags: ['email-marketing', 'setup'],
      assignee_name: 'Luis',
    },
    {
      title: 'Integrar Calendly → MailerLite',
      description: 'No MailerLite: Integrations → Webhooks → copiar URL. No Calendly: Integrations → Webhooks → colar URL. Evento "Invitee Created" → lista "Leads Consulta Gratuita".',
      priority: 'URGENT',
      tags: ['integração', 'setup'],
      assignee_name: 'Luis',
    },
    {
      title: 'Definir ICP em 1 página',
      description: 'Responder: Quem é o cliente ideal? Qual a dor principal? Qual o momento de vida? Onde está online? O que já tentou antes do SPFP? Ver template em docs/marketing/ICP-SPFP-2026.md',
      priority: 'URGENT',
      tags: ['estratégia', 'icp'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Adicionar link Calendly na bio do Instagram',
      description: 'Bio do Instagram pessoal do Luis: "Consultor Financeiro | SPFP — Conversa gratuita de 30min sobre suas finanças → [link Calendly]"',
      priority: 'HIGH',
      tags: ['instagram', 'setup'],
      assignee_name: 'Luis',
    },
    {
      title: 'Mapear 5 parceiros para indicação',
      description: 'Listar 5 parceiros que já têm contato com o ICP: contadores, coaches de carreira, RH de empresas, corretores de imóveis. Proposta: "Você tem clientes que precisam organizar as finanças. Eu cuido disso."',
      priority: 'HIGH',
      tags: ['parceria', 'aquisição'],
      assignee_name: 'Luis',
    },
    {
      title: 'Criar conta Meta Business Suite',
      description: 'Criar conta em business.facebook.com. Conectar Instagram pessoal e da empresa. Instalar Pixel no site SPFP (necessário para retargeting). NÃO ligar anúncios ainda — aguardar gate orgânico.',
      priority: 'MEDIUM',
      tags: ['meta-ads', 'setup'],
      assignee_name: 'Luis',
    },
  ],
  'Campanhas': [
    {
      title: '🎬 Reel 1 — "Você sabe quanto gastou esse mês?"',
      description: 'Gancho (0-3s): "Você sabe exatamente quanto gastou esse mês?"\nDesenvolvimento: falar sobre a falta de visibilidade financeira — não é descuido, é falta de sistema.\nCTA: "Conversa gratuita — link na bio."\nPostar no Instagram pessoal e repurpose na empresa.',
      priority: 'URGENT',
      tags: ['reel', 'instagram', 'semana-1'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 2 — "O cliente que ganhava R$8k e vivia no limite"',
      description: 'Caso real anonimizado. Estrutura: situação inicial → o que descobrimos → resultado em 3 meses. Não citar valores exatos sem permissão do cliente. Foco na transformação.',
      priority: 'URGENT',
      tags: ['reel', 'instagram', 'prova-social', 'semana-1'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 3 — "3 perguntas que faço em toda primeira consulta" + CTA',
      description: 'Revelar as 3 perguntas da consulta diagnóstica. Terminar com: "Se você quer responder essas perguntas sobre a sua vida, agenda uma conversa gratuita comigo — link na bio."\nEste é o Reel de conversão da semana 1.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'conversão', 'semana-1'],
      assignee_name: 'Luis',
    },
    {
      title: '📺 YouTube — "Por que o dinheiro some no fim do mês"',
      description: 'Vídeo 8-15 minutos. Título SEO: "Por que o dinheiro some no fim do mês (não é falta de disciplina)". Thumbnail com rosto do Luis. Descrição com link Calendly. Capítulos no vídeo para retenção.',
      priority: 'HIGH',
      tags: ['youtube', 'seo', 'semana-1'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 4 — "Planilha do Excel: você cria no domingo, abandona na quarta"',
      description: 'Semana 2. Angle: por que planilha não funciona — não é fraqueza, é que ela só registra, não orienta. Comparar com o SPFP + Finn de forma sutil.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-2'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 5 — "O que separa quem guarda dinheiro de quem não consegue"',
      description: 'Semana 2. Angle: não é disciplina, é clareza e sistema. Quem guarda dinheiro não é mais esforçado — tem mais visibilidade sobre os gastos.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-2'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 6 — "Como o Finn faz em 15s o que a planilha não fez em 2 anos" + CTA',
      description: 'Semana 2 — Reel de conversão. Mostrar o Finn em ação (tela do produto). CTA direto para a consulta gratuita. Este é o Reel de conversão da semana 2.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'produto', 'conversão', 'semana-2'],
      assignee_name: 'Luis',
    },
    {
      title: '🤝 Abordar 3 parceiros com proposta de indicação',
      description: 'Script: "Você tem clientes que precisam organizar as finanças. Eu cuido disso. Posso ser o seu parceiro de indicação — sem exclusividade, sem custo para você. Ofereço comissão por indicação convertida ou sessão gratuita para sua base." Alvo: contadores, coaches, RH.',
      priority: 'MEDIUM',
      tags: ['parceria', 'aquisição', 'semana-2'],
      assignee_name: 'Luis',
    },
    {
      title: '📅 Stories semanais — CTA Calendly (toda sexta)',
      description: 'Todo domingo agendar 3 stories para sexta: 1) "Tenho [X] vagas abertas essa semana" 2) Enquete sobre dor financeira 3) Link Calendly. Ver templates em docs/marketing/CALENDARIO-EDITORIAL-90-DIAS.md',
      priority: 'MEDIUM',
      tags: ['stories', 'instagram', 'recorrente'],
      assignee_name: 'Luis',
    },
  ],
  'Análise': [
    {
      title: 'Montar dashboard semanal de métricas',
      description: 'Criar planilha simples (Google Sheets) com: Seguidores pessoal, Alcance Reels, Cliques bio, Agendamentos Calendly, Consultas realizadas, Taxa de fechamento, Novos clientes. Preencher toda segunda-feira.',
      priority: 'HIGH',
      tags: ['métricas', 'setup'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Review 30 dias — Gate para tráfego pago',
      description: 'Em 2026-04-07: analisar resultado orgânico. Gate: 2+ clientes fechados via orgânico OU landing page com CR ≥ 3%. Se gate atingido → ativar Meta Ads R$30/dia. Se não → revisar ângulo de copy e canal.',
      priority: 'HIGH',
      tags: ['review', 'gate', 'meta-ads'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Definir CAC máximo antes de ligar Meta Ads',
      description: 'Plano Essencial: LTV R$1.998 → CAC máximo R$666. Plano Wealth: LTV R$6.998 → CAC máximo R$2.333. CAC alvo operacional: < R$400. CPL alvo (consulta agendada): R$30-50. Registrar na planilha de métricas.',
      priority: 'HIGH',
      tags: ['métricas', 'financeiro', 'meta-ads'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Review 60 dias — Resultado Meta Ads',
      description: 'Em 2026-05-07: analisar 4 semanas de tráfego pago. Verificar: CTR > 1%? CPL < R$50? CAC < R$400? Taxa de fechamento > 30%? Se sim → escalar. Se não → diagnosticar funil.',
      priority: 'MEDIUM',
      tags: ['review', 'meta-ads'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Review trimestral — CAC, LTV, Churn, MRR',
      description: 'Em 2026-06-07: revisão completa. LTV/CAC ≥ 3x? Churn < 5%/mês? MRR crescendo? Payback < 6 meses? Decisão sobre escala, pivô de canal ou revisão de oferta.',
      priority: 'LOW',
      tags: ['review', 'trimestral', 'financeiro'],
      assignee_name: 'Thiago Finch',
    },
  ],

  // ============================================================
  // CALENDÁRIO EDITORIAL 90 DIAS — 12 semanas de conteúdo
  // Fonte: docs/marketing/CALENDARIO-EDITORIAL-90-DIAS.md
  // ============================================================
  'Calendário 90 Dias': [
    // ── MÊS 1 — MARÇO/ABRIL ──────────────────────────────────
    // Semana 1 (10-14 Mar) — Tema: Por que o dinheiro some
    {
      title: '🎬 S1-SEG | Reel — "Você sabe exatamente quanto gastou esse mês?"',
      description: 'Gancho (0-3s): "Você sabe exatamente quanto gastou esse mês?"\nDesenvolvimento: falta de visibilidade financeira — não é descuido, é ausência de sistema.\nSolução: clareza muda comportamento, não mais disciplina.\nCTA: "Conversa gratuita — link na bio."\nRepostagem automática no Instagram empresa após 24h.',
      priority: 'URGENT',
      tags: ['reel', 'instagram', 'semana-1', 'ansiedade'],
      assignee_name: 'Luis',
      due_date: '2026-03-10',
    },
    {
      title: '🎬 S1-QUA | Reel — "O cliente que ganhava R$8k/mês e vivia no limite"',
      description: 'Caso real anonimizado. Estrutura: R$8k/mês, sempre no limite → descoberta: R$890/mês em assinaturas esquecidas → resultado: R$2.400 guardados em 3 meses.\nNão revelar identidade. Foco na transformação emocional.\nLinguagem: "Tive um cliente que..." — não expor dados pessoais.',
      priority: 'URGENT',
      tags: ['reel', 'instagram', 'prova-social', 'semana-1'],
      assignee_name: 'Luis',
      due_date: '2026-03-12',
    },
    {
      title: '🎬 S1-SEX | Reel — "3 perguntas que faço em toda primeira consulta" + CTA',
      description: 'Revelar as 3 perguntas da consulta diagnóstica (gancho de curiosidade).\nTerminar com: "Se você quer responder essas perguntas sobre a sua vida, agenda uma conversa gratuita — link na bio."\n⚡ Reel de CONVERSÃO da semana 1 — CTA explícito obrigatório.',
      priority: 'URGENT',
      tags: ['reel', 'instagram', 'conversão', 'semana-1'],
      assignee_name: 'Luis',
      due_date: '2026-03-14',
    },
    {
      title: '📺 S1 | YouTube — "Por que o dinheiro some no fim do mês"',
      description: 'Duração: 8-15 minutos.\nTítulo SEO: "Por que o dinheiro some no fim do mês (não é falta de disciplina)"\nThumbnail: rosto do Luis com expressão de surpresa/descoberta.\nDescrição: incluir link Calendly. Capítulos para retenção.\nRepurpose: melhor trecho vira post LinkedIn.',
      priority: 'HIGH',
      tags: ['youtube', 'seo', 'semana-1'],
      assignee_name: 'Luis',
      due_date: '2026-03-11',
    },

    // Semana 2 (17-21 Mar) — Tema: O erro de quem tenta planilha
    {
      title: '🎬 S2-SEG | Reel — "Planilha do Excel: você cria no domingo, abandona na quarta"',
      description: 'Ângulo: planilha não funciona — não é fraqueza, ela só registra, não orienta.\n"Criei para centenas de clientes. A maioria abandona no 4º dia."\nSolução sutil — sistema que orienta. Sem citar SPFP diretamente.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-2', 'anti-planilha'],
      assignee_name: 'Luis',
      due_date: '2026-03-17',
    },
    {
      title: '🎬 S2-QUA | Reel — "O que separa quem consegue guardar dinheiro de quem não consegue"',
      description: 'Ângulo: não é disciplina, é clareza e sistema.\nBig insight: quem guarda dinheiro não é mais esforçado — tem mais visibilidade.\nExemplo: dois clientes com renda similar, resultados opostos. A diferença foi o sistema.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-2', 'educação'],
      assignee_name: 'Luis',
      due_date: '2026-03-19',
    },
    {
      title: '🎬 S2-SEX | Reel — "Como o Finn faz em 15s o que a planilha não fez em 2 anos" + CTA',
      description: 'Mostrar Finn em ação (screen record).\nComparação: "Antes: planilha, 40 minutos, abandonei. Agora: 15 segundos, feito."\nCTA direto para consulta gratuita.\n⚡ Reel de PRODUTO + CONVERSÃO da semana 2.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'produto', 'conversão', 'semana-2'],
      assignee_name: 'Luis',
      due_date: '2026-03-21',
    },
    {
      title: '📺 S2 | YouTube — "Por que apps gratuitos de finanças não mudam seu comportamento"',
      description: 'Comparar Mobills, Organizze, GuiaBolso com abordagem SPFP.\nAngle: apps gratuitos = dashboard do passado. SPFP = orientação prospectiva.\nNão atacar concorrentes — posicionar como categoria diferente.',
      priority: 'HIGH',
      tags: ['youtube', 'seo', 'semana-2'],
      assignee_name: 'Luis',
      due_date: '2026-03-18',
    },

    // Semana 3 (24-28 Mar) — Tema: Objetivos financeiros reais
    {
      title: '🎬 S3-SEG | Reel — "Qual é o seu objetivo financeiro para 2026?"',
      description: 'Gancho: pergunta direta ao público.\nInsight: objetivo sem prazo e sem número não é objetivo, é sonho.\nEngajamento: "Me conta nos comentários qual é o seu objetivo pra esse ano." — aumenta alcance orgânico.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-3', 'objetivos'],
      assignee_name: 'Luis',
      due_date: '2026-03-24',
    },
    {
      title: '🎬 S3-QUA | Reel — "Como calcular em quanto tempo você consegue comprar sua casa"',
      description: 'Conteúdo matemático acessível.\nFórmula: Valor do imóvel ÷ (renda × % guardado) = anos para dar entrada.\nExemplo com números reais — fazer as contas na tela.\nEngajamento: "Comenta o resultado do seu cálculo."',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-3', 'objetivos'],
      assignee_name: 'Luis',
      due_date: '2026-03-26',
    },
    {
      title: '🎬 S3-SEX | Reel — "Se você não sabe pra onde vai o dinheiro, não vai conseguir juntar nada" + CTA',
      description: '⚡ Reel de CONVERSÃO semana 3.\n"Você pode ter todas as planilhas do mundo, mas se não souber onde o dinheiro está indo, não tem como economizar."\nCTA: consulta gratuita para mapear gastos em 30 minutos.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'conversão', 'semana-3'],
      assignee_name: 'Luis',
      due_date: '2026-03-28',
    },
    {
      title: '📺 S3 | YouTube — "Como definir metas financeiras que você realmente vai cumprir"',
      description: 'Tutorial prático. Framework SMART adaptado para finanças pessoais.\nExemplos: "Quero guardar mais" (vago) vs "Quero guardar R$1k/mês por 12 meses para dar entrada num apartamento de R$200k" (SMART).\nMostrar como rastrear progresso no SPFP.',
      priority: 'HIGH',
      tags: ['youtube', 'seo', 'semana-3'],
      assignee_name: 'Luis',
      due_date: '2026-03-25',
    },

    // Semana 4 (31 Mar - 4 Abr) — Tema: Renda variável e autônomo
    {
      title: '🎬 S4-SEG | Reel — "Se sua renda varia todo mês, como você planeja?"',
      description: 'Gancho para autônomos/MEI/freelancers.\nDor: "Como separo o que é meu se meu salário muda todo mês?"\nProblema que apps e planilhas não resolvem para PJ. Preview da solução: planejamento por renda mínima garantida.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-4', 'autonomo'],
      assignee_name: 'Luis',
      due_date: '2026-03-31',
    },
    {
      title: '🎬 S4-QUA | Reel — "O maior erro financeiro de quem é autônomo ou MEI"',
      description: 'Case: autônomo que misturava PF e PJ. Não sabia o que era lucro real, devia imposto não provisionado.\nInsight: "Separar CNPJ de CPF não é complicação burocrática — é sobrevivência financeira."\nNão dar conselho jurídico — direcionar para consultor/contador.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-4', 'autonomo'],
      assignee_name: 'Luis',
      due_date: '2026-04-01',
    },
    {
      title: '🎬 S4-SEX | Reel — "Como separar o dinheiro pessoal do profissional de uma vez por todas" + CTA',
      description: '⚡ Reel de CONVERSÃO para persona autônomo.\n3 passos simples para separação PF/PJ.\nCTA: "Se você é autônomo e quer organizar isso de vez, a gente faz isso na consulta gratuita — link na bio."',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'conversão', 'semana-4', 'autonomo'],
      assignee_name: 'Luis',
      due_date: '2026-04-03',
    },
    {
      title: '📺 S4 | YouTube — "Planejamento financeiro para renda variável — guia completo"',
      description: 'Guia para autônomos e MEIs.\nConteúdo: renda mínima de referência, como provisionar impostos (DAS MEI, pró-labore), como definir "salário do dono".\nTítulo SEO: "Como planejar finanças com renda variável (autônomo, MEI, freelancer)"',
      priority: 'HIGH',
      tags: ['youtube', 'seo', 'semana-4', 'autonomo'],
      assignee_name: 'Luis',
      due_date: '2026-04-01',
    },

    // ── MÊS 2 — ABRIL/MAIO ───────────────────────────────────
    // Semana 5 — Ansiedade financeira
    {
      title: '🎬 S5-SEG | Reel — "O que você sente quando olha para o extrato bancário?"',
      description: 'Gancho emocional.\n"Sente aquela sensação ruim de não querer olhar? Você não está sozinho."\nInsight: a maioria evita o extrato por medo. Evitar não resolve — clareza alivia.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-5', 'ansiedade'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },
    {
      title: '🎬 S5-QUA | Reel — "Ansiedade financeira: como ela aparece na vida das pessoas"',
      description: 'Sintomas: evitar extrato, compras impulsivas para compensar estresse, sensação de descontrole permanente.\nLuis fala como consultor que observa isso diariamente.\nNão dar diagnóstico — posicionar como padrão observável.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-5', 'ansiedade'],
      assignee_name: 'Luis',
      due_date: '2026-04-09',
    },
    {
      title: '🎬 S5-SEX | Reel — "O que muda quando você tem clareza sobre seu dinheiro" + CTA',
      description: '⚡ Reel de CONVERSÃO semana 5.\nTransformação: ansiedade → clareza e controle.\n"Quando meus clientes param de evitar o extrato, a sensação não é de culpa — é de alívio."\nCTA: consulta gratuita.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'conversão', 'semana-5'],
      assignee_name: 'Luis',
      due_date: '2026-04-11',
    },
    {
      title: '📺 S5 | YouTube — "Ansiedade financeira: o que é e como organização resolve"',
      description: 'Tema: saúde financeira como saúde mental.\nEstrutura: o que é → como se manifesta → papel da clareza na redução da ansiedade → como começar.\nNão dar conselho terapêutico — foco em organização como ferramenta.',
      priority: 'MEDIUM',
      tags: ['youtube', 'seo', 'semana-5'],
      assignee_name: 'Luis',
      due_date: '2026-04-08',
    },

    // Semana 6 — Dívidas e saída do vermelho
    {
      title: '🎬 S6-SEG | Reel — "Ordem certa para sair das dívidas (a maioria faz errado)"',
      description: 'Gancho: "Você está tentando pagar dívidas na ordem errada?"\nAvalanche (maior juros primeiro) vs bola de neve (menor valor primeiro) — qual funciona melhor psicologicamente.\nLuis explica qual método usa com clientes e por quê.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-6', 'dividas'],
      assignee_name: 'Luis',
      due_date: '2026-04-14',
    },
    {
      title: '🎬 S6-QUA | Reel — Case: "R$12k de dívida eliminados em 8 meses"',
      description: 'Caso real anonimizado.\nEstrutura: situação → diagnóstico SPFP → plano → resultado em 8 meses.\nNão revelar identidade. Autenticidade > produção — gravar como consultor contando história.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'prova-social', 'semana-6', 'dividas'],
      assignee_name: 'Luis',
      due_date: '2026-04-16',
    },
    {
      title: '🎬 S6-SEX | Reel — "A diferença entre dívida boa e dívida ruim" + CTA',
      description: '⚡ Reel de CONVERSÃO semana 6.\nConceito: dívida com juros > inflação = ruim (cartão 400%aa). Dívida para geração de renda/patrimônio = potencialmente boa.\nCTA: "Se você tem dívidas e quer um plano para sair, conversa comigo — link na bio."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'conversão', 'semana-6'],
      assignee_name: 'Luis',
      due_date: '2026-04-18',
    },
    {
      title: '📺 S6 | YouTube — "Como sair das dívidas com renda de R$3k a R$8k/mês"',
      description: 'Tutorial para o ICP principal.\nConteúdo: mapeamento de dívidas, cálculo de juros, priorização, negociação com credores, fluxo de caixa para liquidação.\nTítulo SEO: "Como sair das dívidas — guia passo a passo [renda específica]"',
      priority: 'MEDIUM',
      tags: ['youtube', 'seo', 'semana-6', 'dividas'],
      assignee_name: 'Luis',
      due_date: '2026-04-15',
    },

    // Semana 7 — Investimentos para iniciantes
    {
      title: '🎬 S7-SEG | Reel — "Quanto você precisa ganhar para começar a investir?"',
      description: 'Gancho que quebra mito.\n"A maioria acha que precisa ganhar muito para investir. Errado."\nInsight: reserva de emergência primeiro → depois qualquer valor, mesmo R$50/mês.\nNão dar consultoria de investimento — princípios básicos.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-7', 'investimentos'],
      assignee_name: 'Luis',
      due_date: '2026-04-21',
    },
    {
      title: '🎬 S7-QUA | Reel — "Antes de investir, faça isso"',
      description: 'Sequência obrigatória:\n1. Eliminar dívidas de juros altos\n2. Construir reserva de emergência (3-6 meses)\n3. Definir objetivo para o investimento\nLuis fala com autoridade de quem já viu clientes investindo sem reserva e tendo que sacar na crise.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-7', 'investimentos'],
      assignee_name: 'Luis',
      due_date: '2026-04-23',
    },
    {
      title: '🎬 S7-SEX | Reel — "Reserva de emergência: quanto, onde e como" + CTA',
      description: '⚡ Reel de CONVERSÃO semana 7.\nConteúdo: 3-6 meses de despesas fixas → onde guardar (CDB liquidez diária, Tesouro Selic) → como construir progressivamente.\nCTA: "Quer um plano para construir sua reserva? Link na bio."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'conversão', 'semana-7', 'investimentos'],
      assignee_name: 'Luis',
      due_date: '2026-04-25',
    },
    {
      title: '📺 S7 | YouTube — "Por onde começar a investir se você ainda tem dívidas"',
      description: 'Responde a dúvida mais comum dos iniciantes.\nEstrutura: quando faz sentido investir mesmo com dívidas (boas) → quando não faz (ruins > rentabilidade) → plano de transição.\nTítulo SEO: "Investir ou pagar dívidas? Como decidir"',
      priority: 'MEDIUM',
      tags: ['youtube', 'seo', 'semana-7', 'investimentos'],
      assignee_name: 'Luis',
      due_date: '2026-04-22',
    },

    // Semana 8 — Casais e finanças
    {
      title: '🎬 S8-SEG | Reel — "Dinheiro é a causa nº1 de briga entre casais — por isso"',
      description: 'Dado real como gancho.\nInsight: não é falta de dinheiro — é falta de alinhamento sobre onde vai.\n"Atendo casais que ganham R$20k juntos e brigam por R$100. O problema nunca é o dinheiro em si."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-8', 'casais'],
      assignee_name: 'Luis',
      due_date: '2026-04-28',
    },
    {
      title: '🎬 S8-QUA | Reel — "Como organizar as finanças a dois (sem brigar)"',
      description: 'Método prático para casais:\n1. Reunião financeira mensal (data fixa, sem julgamento)\n2. Definir despesas comuns vs pessoais\n3. Meta financeira conjunta com prazo\nLuis com autoridade de consultor que já ajudou casais.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-8', 'casais'],
      assignee_name: 'Luis',
      due_date: '2026-04-30',
    },
    {
      title: '🎬 S8-SEX | Reel — "Conta conjunta ou separada? A resposta depende do seu perfil" + CTA',
      description: '⚡ Reel de CONVERSÃO semana 8.\n3 modelos: totalmente separado, conjunto, híbrido (mais comum).\nNão existe resposta certa — depende do casal.\nCTA: "Quer entender qual modelo funciona para vocês? Agenda uma conversa."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'conversão', 'semana-8', 'casais'],
      assignee_name: 'Luis',
      due_date: '2026-05-02',
    },
    {
      title: '📺 S8 | YouTube — "Finanças do casal: o método que uso com meus clientes"',
      description: 'Tutorial completo para casais.\nPlanilha/sistema compartilhado, reunião financeira mensal, separação pessoal vs conjunto.\nCase real de casal (anonimizado) que transformou as finanças com sistema conjunto.',
      priority: 'MEDIUM',
      tags: ['youtube', 'seo', 'semana-8', 'casais'],
      assignee_name: 'Luis',
      due_date: '2026-04-29',
    },

    // ── MÊS 3 — MAIO/JUNHO ───────────────────────────────────
    // Semana 9 — Aposentadoria e previdência
    {
      title: '🎬 S9-SEG | Reel — "Com que idade você quer se aposentar?"',
      description: 'Gancho: pergunta que a maioria nunca se fez concretamente.\n"Quero me aposentar com 60" — mas você sabe quanto precisa guardar por mês?\nDesenvolvimento: a matemática simples da aposentadoria que surpreende.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-9', 'aposentadoria'],
      assignee_name: 'Luis',
      due_date: '2026-05-05',
    },
    {
      title: '🎬 S9-QUA | Reel — "Quanto você precisa ter guardado para se aposentar?"',
      description: 'Matemática da aposentadoria: regra dos 4%.\nExemplo: quer R$5k/mês → precisa de R$1,5M.\nCálculo reverso: quanto guardar por mês para chegar lá em 20-30 anos.\n"Sim, parece muito. Por isso começa hoje."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-9', 'aposentadoria'],
      assignee_name: 'Luis',
      due_date: '2026-05-07',
    },
    {
      title: '🎬 S9-SEX | Reel — "Previdência privada: vale a pena?" + CTA',
      description: '⚡ Reel de CONVERSÃO semana 9.\nNão é resposta simples — depende do perfil, alíquota IR, portabilidade.\nLuis apresenta quando vale e quando não vale, sem recomendar produto específico.\nCTA: "Quer um plano de aposentadoria real? Link na bio."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'conversão', 'semana-9', 'aposentadoria'],
      assignee_name: 'Luis',
      due_date: '2026-05-09',
    },
    {
      title: '📺 S9 | YouTube — "Aposentadoria: como calcular quanto você precisa guardar"',
      description: 'Tutorial com calculadora ao vivo.\nVariáveis: idade atual, aposentadoria desejada, renda mensal desejada, inflação estimada.\nMostrar cálculo na prática — template para inscritos.\nTítulo SEO: "Quanto preciso guardar para me aposentar — calculadora"',
      priority: 'MEDIUM',
      tags: ['youtube', 'seo', 'semana-9', 'aposentadoria'],
      assignee_name: 'Luis',
      due_date: '2026-05-06',
    },

    // Semana 10 — Resultados 90 dias
    {
      title: '🎬 S10-SEG | Reel — "90 dias de conteúdo — o que mudou para vocês"',
      description: 'Marco de 90 dias de conteúdo.\nLuis compartilha o que ouviu nos comentários e DMs.\n"Recebi [X] mensagens de pessoas que mudaram algo nas finanças."\nEngajamento: "Me conta nos comentários o que mudou pra você."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-10', 'resultados'],
      assignee_name: 'Luis',
      due_date: '2026-05-12',
    },
    {
      title: '🎬 S10-QUA | Reel — "Os dados dos meus clientes no SPFP (números reais)"',
      description: 'Transparência radical — métricas reais anonimizadas.\n"Clientes SPFP em média descobriram [X] reais/mês em gastos não percebidos."\n⚠️ Solicitar permissão dos clientes antes de usar qualquer dado.\nDados reais aumentam credibilidade exponencialmente.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'prova-social', 'semana-10'],
      assignee_name: 'Luis',
      due_date: '2026-05-14',
    },
    {
      title: '🎬 S10-SEX | Reel — "Resultado vs esforço — o que realmente funcionou" + CTA forte',
      description: '⚡ Reel de CONVERSÃO semana 10.\nReflexão: qual conteúdo gerou mais agendamentos?\n"Se você acompanhou até aqui, a consulta gratuita vai ser transformadora."\nCTA com urgência de vagas.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'conversão', 'semana-10'],
      assignee_name: 'Luis',
      due_date: '2026-05-16',
    },
    {
      title: '📺 S10 | YouTube — "O que aprendi em 90 dias criando conteúdo financeiro"',
      description: 'Vídeo de bastidores + resultados.\nO que funcionou, o que não funcionou, feedback da audiência, próximos planos.\nHumanizar o Luis — não é só consultor, é alguém aprendendo junto.\nChama para assinar o canal e agendar consulta.',
      priority: 'MEDIUM',
      tags: ['youtube', 'semana-10', 'bastidores'],
      assignee_name: 'Luis',
      due_date: '2026-05-13',
    },

    // Semana 11 — Depoimentos reais de clientes
    {
      title: '🎬 S11-SEG | Reel — Depoimento cliente 1 ⚠️ pedir autorização antes',
      description: '⚠️ ANTES: pedir autorização formal do cliente por escrito.\nFormato: cliente fala sobre a situação antes e o resultado após.\n30-60s. Pode ser vídeo do próprio cliente ou Luis contando o caso.\nFoco: resultado numérico + transformação emocional.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'prova-social', 'depoimento', 'semana-11'],
      assignee_name: 'Luis',
      due_date: '2026-05-19',
    },
    {
      title: '🎬 S11-QUA | Reel — Depoimento cliente 2 ⚠️ pedir autorização antes',
      description: '⚠️ ANTES: pedir autorização formal do cliente por escrito.\nEscolher caso com perfil diferente do depoimento 1 — diversificar persona.\nSe cliente não autorizar: usar caso anonimizado no estilo case study.\nFoco: conquista de objetivo (reserva, casa, férias).',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'prova-social', 'depoimento', 'semana-11'],
      assignee_name: 'Luis',
      due_date: '2026-05-21',
    },
    {
      title: '🎬 S11-SEX | Reel — Depoimento cliente 3 + CTA forte ⚠️ pedir autorização antes',
      description: '⚡ Reel de CONVERSÃO semana 11.\n⚠️ ANTES: autorização formal do cliente.\nTerceiro case — foco em objeção quebrada (achava caro, achava que já tinha tentado tudo).\nCTA: "Esses são clientes reais. Você pode ser o próximo."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'prova-social', 'conversão', 'semana-11'],
      assignee_name: 'Luis',
      due_date: '2026-05-23',
    },
    {
      title: '📺 S11 | YouTube — "Histórias reais de clientes SPFP (com permissão)"',
      description: 'Vídeo de depoimentos longos — entrevistar 2-3 clientes (com permissão, nome real se possível).\nPerguntas-guia: situação antes, como encontrou SPFP, maior descoberta, resultado numérico, como está hoje.\nMais autêntico = mais conversão.',
      priority: 'MEDIUM',
      tags: ['youtube', 'prova-social', 'semana-11'],
      assignee_name: 'Luis',
      due_date: '2026-05-20',
    },

    // Semana 12 — Lançamento / reforço da oferta
    {
      title: '🎬 S12-SEG | Reel — "Uma coisa nova no SPFP que você precisa ver"',
      description: 'Anunciar novidade REAL (nova feature, oferta, evento).\n⚠️ NÃO inventar novidade — usar algo real ou adiar para quando houver.\nEnquadramento: "Para quem me acompanha desde o começo, essa novidade é pra vocês."',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-12', 'lançamento'],
      assignee_name: 'Luis',
      due_date: '2026-05-26',
    },
    {
      title: '🎬 S12-QUA | Reel — "Para quem acompanha meu conteúdo — algo especial"',
      description: 'Promoção REAL para audiência orgânica (não desconto falso).\nEx: "Para quem agenda pelo link essa semana, incluo [bônus real]"\nA oferta precisa ser real e com quantidade limitada verdadeira.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'semana-12', 'oferta'],
      assignee_name: 'Luis',
      due_date: '2026-05-28',
    },
    {
      title: '🎬 S12-SEX | Reel — "Últimas vagas do mês" + CTA máximo',
      description: '⚡ Reel de CONVERSÃO máxima — encerramento do trimestre.\nUrgência real: quantas vagas restam esse mês?\nCTA múltiplo: link bio + stories + DM direto.\n⚠️ NÃO mentir sobre vagas — escassez falsa destrói confiança.',
      priority: 'MEDIUM',
      tags: ['reel', 'instagram', 'conversão', 'urgência', 'semana-12'],
      assignee_name: 'Luis',
      due_date: '2026-05-30',
    },
    {
      title: '📺 S12 | YouTube — "Novidades SPFP e próximos passos"',
      description: 'Vídeo de encerramento do primeiro trimestre.\nO que vem por aí, roadmap do produto, planos de conteúdo.\nChamar para ação final: assinar, agendar consulta, compartilhar.\nAgradecer a audiência — humanizar a marca.',
      priority: 'MEDIUM',
      tags: ['youtube', 'semana-12', 'lançamento'],
      assignee_name: 'Luis',
      due_date: '2026-05-27',
    },

    // Tarefas recorrentes
    {
      title: '📅 Stories semanais — CTA Calendly (toda sexta, recorrente)',
      description: 'Todo domingo programar para sexta:\nVersão 1: "Tenho [X] vagas abertas essa semana. Link na bio."\nVersão 2: Enquete "Qual te representa mais?" → link Calendly\nVersão 3: Escassez real de horários\nTemplates completos: docs/marketing/CALENDARIO-EDITORIAL-90-DIAS.md',
      priority: 'HIGH',
      tags: ['stories', 'instagram', 'recorrente', 'cta'],
      assignee_name: 'Luis',
    },
    {
      title: '🔄 LinkedIn — Repurpose dos melhores Reels (2x/semana)',
      description: 'Toda semana: escolher o Reel mais performático e adaptar para LinkedIn.\nFormato: post de texto longo (500-800 palavras) com o insight principal.\nPúblico alvo: persona secundária (Autônomo Desorganizado) e profissionais de renda alta.\nPostar Seg + Qui.',
      priority: 'MEDIUM',
      tags: ['linkedin', 'repurpose', 'recorrente'],
      assignee_name: 'Luis',
    },
    {
      title: '🔁 Repurpose Instagram empresa — mesmo conteúdo do pessoal (automático)',
      description: 'Processo: Luis posta Reel no pessoal → após 24h: mesma mídia no perfil empresa → copy adaptada (troca "eu" por "nosso consultor Luis") → tag no Luis no post da empresa → Stories empresa compartilha o post.\nResultado: perfil empresa cresce sem esforço adicional.',
      priority: 'LOW',
      tags: ['instagram-empresa', 'repurpose', 'recorrente'],
      assignee_name: 'Luis',
    },
  ],

  // ============================================================
  // EMAIL MARKETING — Sequências de nurturing e automação
  // Fonte: docs/marketing/SEQUENCIA-EMAIL-NURTURING.md
  // ============================================================
  'Email Marketing': [
    // Setup
    {
      title: '📧 Criar lista "Leads Consulta Gratuita" no MailerLite',
      description: 'No MailerLite: Lists → Create new list → "Leads Consulta Gratuita"\nEssa lista recebe automaticamente quem agenda via Calendly.\nConfigurar campos: Nome, Email, Data da consulta (via webhook).',
      priority: 'URGENT',
      tags: ['email-marketing', 'setup', 'mailerlite'],
      assignee_name: 'Luis',
    },
    {
      title: '📧 Criar lista "Cancelamentos" no MailerLite',
      description: 'No MailerLite: Lists → Create new list → "Cancelamentos"\nQuem cancela no Calendly vai para essa lista (não deletar — reengajar depois).\nEvento "Invitee Canceled" → move para "Cancelamentos".',
      priority: 'HIGH',
      tags: ['email-marketing', 'setup', 'mailerlite'],
      assignee_name: 'Luis',
    },
    {
      title: '⚙️ Configurar automação — tag CONSULTA_REALIZADA',
      description: 'Trigger da sequência pós-consulta (7 emails).\nLuis adiciona essa tag manualmente logo após cada consulta realizada.\nNo MailerLite: Automation → Create → Trigger: "Subscriber tag added" → tag: CONSULTA_REALIZADA → iniciar sequência de 7 emails.',
      priority: 'URGENT',
      tags: ['email-marketing', 'setup', 'automação'],
      assignee_name: 'Luis',
    },
    {
      title: '⚙️ Configurar automação — tag CLIENTE_ATIVO',
      description: 'Trigger da sequência de boas-vindas.\nLuis adiciona essa tag quando pagamento é confirmado.\nNo MailerLite: Automation → Create → Trigger: "Subscriber tag added" → tag: CLIENTE_ATIVO → iniciar Email B1 imediatamente.',
      priority: 'HIGH',
      tags: ['email-marketing', 'setup', 'automação'],
      assignee_name: 'Luis',
    },

    // Sequência pós-consulta (não fechou)
    {
      title: '✉️ Email 1 (D+1) — Resumo personalizado da consulta',
      description: 'Assunto: "Resumo da nossa conversa, [Nome]"\nObjetivo: personalização — mostra que Luis prestou atenção.\n\nEstrutura: "Saí da nossa conversa com 3 pontos sobre a sua situação: [1] [2] [3]"\n"Isso é mais comum do que parece. Não é falta de disciplina, é falta de sistema."\nCTA suave: link para os planos.\n\n⚠️ AÇÃO MANUAL: Luis preenche os 3 pontos em 2 minutos logo após cada consulta.',
      priority: 'URGENT',
      tags: ['email', 'sequência-pos-consulta', 'personalização'],
      assignee_name: 'Luis',
    },
    {
      title: '✉️ Email 2 (D+3) — Case real: "O que aconteceu com Rafael em 3 meses"',
      description: 'Assunto: "O que aconteceu com o [Nome do case] em 3 meses"\nObjetivo: prova social com resultado concreto.\n\nCase "Rafael" (34 anos, TI, R$7.500/mês): R$890/mês em assinaturas esquecidas → R$2.400 guardados em 3 meses.\nMensagem: "Não mudou a renda. Mudou a clareza."\nCTA: link planos SPFP\n\nAdaptar com cases reais dos primeiros clientes quando disponíveis.',
      priority: 'HIGH',
      tags: ['email', 'sequência-pos-consulta', 'prova-social'],
      assignee_name: 'Luis',
    },
    {
      title: '✉️ Email 3 (D+5) — A diferença entre o Finn e qualquer app gratuito',
      description: 'Assunto: "A diferença entre o Finn e qualquer app gratuito"\nObjetivo: quebrar objeção "já usei app e não funcionou".\n\nMobills, Organizze, planilha — só mostram o passado.\nO Finn tem contexto: sabe objetivos, renda, padrões.\n"Diferença entre um aplicativo e um consultor disponível 24h"\n"A consultoria é o complemento. O Finn cuida do dia a dia. Eu cuido da estratégia."',
      priority: 'HIGH',
      tags: ['email', 'sequência-pos-consulta', 'objeção'],
      assignee_name: 'Luis',
    },
    {
      title: '✉️ Email 4 (D+7) — ROI: "R$99 vs R$300-600 descobertos"',
      description: 'Assunto: "Sobre a questão do investimento agora..."\nObjetivo: quebrar objeção "não tenho dinheiro para pagar".\n\nA conta: SPFP R$99,90/mês. Média dos clientes: R$300-600/mês em gastos não percebidos.\n"Não é gasto. É investimento com retorno em 10 dias."\nFinal: "Se tiver dúvidas, pode me responder esse email. Leio tudo."',
      priority: 'HIGH',
      tags: ['email', 'sequência-pos-consulta', 'objeção', 'roi'],
      assignee_name: 'Luis',
    },
    {
      title: '✉️ Email 5 (D+10) — "Tenho [X] vagas abertas esse mês"',
      description: 'Assunto: "Tenho [X] vagas abertas esse mês"\nObjetivo: urgência real — escassez de atenção do Luis, não desconto artificial.\n\n"Atendo número limitado por mês para dar atenção de qualidade."\n"Esse mês tenho [X] vagas" — Luis atualiza o número real antes de enviar.\n\n⚠️ NUNCA mentir sobre vagas — escassez falsa destrói confiança.',
      priority: 'HIGH',
      tags: ['email', 'sequência-pos-consulta', 'urgência'],
      assignee_name: 'Luis',
    },
    {
      title: '✉️ Email 6 (D+14) — "Último contato, [Nome]"',
      description: 'Assunto: "Último contato, [Nome]"\nObjetivo: fechamento ou saída limpa.\n\n"Esse vai ser meu último email por enquanto. Não quero encher sua caixa se o momento não é esse. Completamente ok."\nLinks para retomar quando fizer sentido.\n\nTom: genuíno, sem pressão. Saída limpa preserva relacionamento futuro. Muitos clientes voltam meses depois por causa desse email.',
      priority: 'HIGH',
      tags: ['email', 'sequência-pos-consulta', 'saída-limpa'],
      assignee_name: 'Luis',
    },
    {
      title: '✉️ Email 7 (D+30) — Reengajamento com novidade real',
      description: 'Assunto: "Uma coisa nova no SPFP que você precisa saber"\nObjetivo: reengajar com novidade real — feature, conteúdo ou resultado novo.\n\n"Faz um mês. Queria compartilhar algo novo: [novidade real]."\n⚠️ Só enviar quando houver novidade REAL — não inventar conteúdo.\nSe não houver em D+30, adiar para D+45 quando houver.',
      priority: 'MEDIUM',
      tags: ['email', 'sequência-pos-consulta', 'reengajamento'],
      assignee_name: 'Luis',
    },

    // Boas-vindas (novo cliente)
    {
      title: '✉️ Email B1 — Boas-vindas imediato (novo cliente pagante)',
      description: 'Assunto: "Bem-vindo ao SPFP, [Nome] — por onde começar"\nTrigger: tag CLIENTE_ATIVO após pagamento confirmado.\n\nEstrutura:\n"Você acaba de dar o primeiro passo para ter clareza real sobre seu dinheiro."\nO que fazer agora: 1) Acessar SPFP [link] 2) Configurar contas (5min) 3) Registrar gastos últimos 7 dias\n[Wealth] → agendar primeira sessão de estratégia: [Calendly]\n[Essencial] → dúvidas: responder esse email\n\nTom: caloroso, confiante, acolhedor.',
      priority: 'URGENT',
      tags: ['email', 'boas-vindas', 'onboarding'],
      assignee_name: 'Luis',
    },

    // Newsletter
    {
      title: '📰 Configurar newsletter semanal (toda segunda-feira)',
      description: 'Frequência: toda segunda-feira.\nAssunto: "[Insight da semana] — Luis | SPFP"\n\nEstrutura fixa (previsibilidade = abertura alta):\n1. 1 insight em 3 parágrafos curtos\n2. 1 pergunta reflexiva\n3. 1 CTA leve: "Se isso te tocou, vale conversar." + link Calendly\n\nConfigurar no MailerLite como automação recorrente.\nMeta: taxa de abertura >40%.',
      priority: 'HIGH',
      tags: ['email', 'newsletter', 'recorrente', 'setup'],
      assignee_name: 'Luis',
    },
    {
      title: '⚠️ PENDENTE — Escrever e configurar sequência de 7 emails no MailerLite',
      description: 'Configurar automação completa pós-consulta no MailerLite.\n\nTrigger: tag CONSULTA_REALIZADA (Luis adiciona manualmente após cada consulta)\n\nEmails a escrever:\n- D+1: Resumo personalizado da consulta (Luis preenche 3 pontos manualmente)\n- D+3: Case real "Rafael" — R$890/mês em assinaturas descobertas\n- D+5: Finn vs apps gratuitos (quebrar objeção "já usei app")\n- D+7: ROI — R$99 vs R$300-600 descobertos (quebrar objeção preço)\n- D+10: Vagas abertas — urgência real (não inventar escassez)\n- D+14: Último contato — saída limpa\n- D+30: Reengajamento com novidade real\n\nComo configurar:\n1. MailerLite → Automations → Create automation\n2. Trigger: "Subscriber is assigned a tag" → CONSULTA_REALIZADA\n3. Adicionar cada email com delay correto\n4. Publicar automação\n\nReferência completa: docs/marketing/SEQUENCIA-EMAIL-NURTURING.md',
      priority: 'URGENT',
      tags: ['email', 'pendente', 'nurturing', 'automação'],
      assignee_name: 'Luis',
    },
    {
      title: '✅ Testar e publicar automação completa',
      description: 'Antes de ligar para o público:\n1. Testar sequência pós-consulta com email de teste (Luis → Luis)\n2. Verificar delay de dias (D+1, D+3, D+5, D+7, D+10, D+14, D+30)\n3. Verificar todos os links em todos os emails\n4. Testar integração Calendly → MailerLite (agendar consulta teste)\n5. Publicar automação — status: ACTIVE\n\nMétricas meta: Abertura >40% | Clique >5% | Conversão >15%',
      priority: 'URGENT',
      tags: ['email', 'qa', 'publicação'],
      assignee_name: 'Luis',
    },
  ],

  // ============================================================
  // META ADS — Campanha paga, criativos e escala
  // Fonte: docs/marketing/CAMPANHA-META-ADS-ESTRUTURA.md
  // Gate: 2+ clientes orgânicos OU landing page CR >= 3%
  // ============================================================
  'Meta Ads': [
    // Landing Page
    {
      title: '🖥️ Landing Page — HERO section (headline + CTA + foto Luis)',
      description: 'URL alvo: spfp.com.br/consulta\n\nConteúdo obrigatório:\nHeadline: "Descubra exatamente para onde vai o seu dinheiro"\nSubheadline: "Conversa gratuita de 30 minutos com Luis — consultor financeiro"\nCTA: [Escolher meu horário] → abre Calendly EMBED (não redirect!)\nFoto Luis: rosto, expressão acessível — não formal demais.\n\n⚠️ Instalar Pixel ANTES de publicar.',
      priority: 'URGENT',
      tags: ['landing-page', 'desenvolvimento', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },
    {
      title: '🖥️ Landing Page — Prova Social (3 depoimentos com resultado)',
      description: 'Seção imediatamente abaixo do HERO.\n\n3 depoimentos com resultado concreto:\n1. "Descobri que gastava R$890/mês sem saber. Em 3 meses juntei R$2.400." — Rafael, 34 anos\n2. [segundo depoimento real]\n3. [terceiro depoimento real]\n\n⚠️ Pedir autorização dos clientes antes de publicar.\nSe não tiver depoimentos ainda: usar casos anonimizados com "nome trocado para privacidade".',
      priority: 'URGENT',
      tags: ['landing-page', 'prova-social', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },
    {
      title: '🖥️ Landing Page — "O que acontece na consulta" + Sobre o Luis',
      description: 'Seção O que acontece na consulta — 3 bullets:\n• Mapeamos sua situação financeira atual (sem julgamento)\n• Identificamos onde o dinheiro está indo\n• Você sai com um caminho claro para os próximos 30 dias\n\nSeção Sobre o Luis:\nFoto + bio curta (3-4 linhas) + número de clientes atendidos + anos de experiência.',
      priority: 'HIGH',
      tags: ['landing-page', 'autoridade', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },
    {
      title: '🖥️ Landing Page — CTA Final + Rodapé LGPD',
      description: 'Seção CTA Final:\n"Vagas limitadas essa semana"\n[Escolher meu horário] — botão repetido\n\nRodapé:\nPolítica de privacidade | LGPD: "Seus dados estão seguros. Nunca compartilhamos." | "Pode cancelar quando quiser"\n\nMétricas de validação:\nCR ≥ 3% = aprovada para escalar\nCR < 2% por 7 dias = revisar headline + prova social\nCR < 1% = parar e reescrever',
      priority: 'HIGH',
      tags: ['landing-page', 'cta', 'lgpd', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },

    // Pixel e rastreamento
    {
      title: '📊 Instalar Pixel do Facebook no site SPFP',
      description: 'Pré-requisito para retargeting e otimização por conversão.\n\nPassos:\n1. Meta Business Suite → Events Manager → Criar Pixel\n2. Copiar código base do Pixel\n3. Inserir no <head> de TODAS as páginas do SPFP\n4. Configurar evento "Lead" quando usuário agenda via Calendly\n5. Testar com Meta Pixel Helper (extensão Chrome)\n6. Aguardar 24h para confirmação\n\n⚠️ Instalar ANTES de ligar qualquer anúncio.',
      priority: 'URGENT',
      tags: ['pixel', 'tracking', 'meta-ads', 'técnico'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },

    // Audiências
    {
      title: '👥 Criar audiência Custom — lista de contatos do Luis',
      description: 'Pré-requisito para ADSET B (Lookalike).\n\nPassos:\n1. Exportar contatos do Calendly (CSV)\n2. Exportar contatos do WhatsApp se possível\n3. No Meta: Audiences → Custom Audience → Customer List → Upload CSV\n4. Aguardar 24-48h para enriquecimento\n\nEssa lista vira a base do Lookalike 1-3%.',
      priority: 'HIGH',
      tags: ['audiência', 'meta-ads', 'lookalike'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },
    {
      title: '👥 Criar audiência Lookalike 1-3% da lista de contatos',
      description: 'Pré-requisito: audiência Custom da lista de contatos criada.\n\nNo Meta: Audiences → Create Audience → Lookalike\nSource: lista de contatos do Luis\nLocation: Brasil\nSize: 1% (depois testar 1-3%)\n\nUsada pelo ADSET B.',
      priority: 'HIGH',
      tags: ['audiência', 'meta-ads', 'lookalike'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },
    {
      title: '👥 Criar audiência Retargeting (site + engajamento Instagram)',
      description: 'Pré-requisito: Pixel com pelo menos 100 visitors.\n\nAudiência 1 — Website: visitantes últimos 30 dias (excluir quem já agendou)\nAudiência 2 — Instagram: engajamento últimos 60 dias\nCombinar as duas em ADSET C.',
      priority: 'MEDIUM',
      tags: ['audiência', 'retargeting', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },

    // Criativos
    {
      title: '🎬 Criativo A — Reel adaptado do orgânico',
      description: 'Formato: Vídeo vertical 9:16, 30-60s\nBase: melhor Reel orgânico (mais views/agendamentos)\n\nAdaptações para anúncio:\n- Adicionar legendas (85% assiste sem som)\n- Gancho primeiros 3s: ainda mais forte\n- CTA final: "Clique no botão para agendar uma conversa gratuita"\n\nCopy do anúncio:\n"Você ganha bem mas nunca sobra nada?\nNão é falta de disciplina. É falta de clareza.\nEm 30 minutos identificamos onde seu dinheiro vai.\n👆 Clique em Saiba mais. Sem compromisso. Sem custo."',
      priority: 'HIGH',
      tags: ['criativo', 'video', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },
    {
      title: '🖼️ Criativo B — Imagem estática (foto Luis em ambiente natural)',
      description: 'Formato: 1:1 ou 4:5\nFoto do Luis em ambiente profissional — natural, não estúdio\nHeadline na imagem: "Onde foi parar o seu dinheiro esse mês?"\n\nCopy:\n"Essa é a pergunta que faço para todos os clientes na primeira conversa.\nA maioria não sabe responder. É para isso que estou aqui.\nConsulta gratuita: 30 minutos, sem compromisso."\n\nTestar vs Criativo A nas primeiras 2 semanas.',
      priority: 'HIGH',
      tags: ['criativo', 'imagem', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },
    {
      title: '📱 Criativo C — Carrossel "3 erros financeiros de quem ganha bem"',
      description: 'Formato: Carrossel 4-6 cards (Canva Pro — branding SPFP)\n\nCard 1 (capa): "3 erros financeiros de quem ganha bem (e como resolver)"\nCard 2: Erro 1 — "Não saber quanto ganha líquido" + solução\nCard 3: Erro 2 — "Misturar gasto fixo com variável" + solução\nCard 4: Erro 3 — "Não ter objetivo com prazo" + solução\nCard 5: "Quer resolver os 3 de uma vez? → Conversa gratuita"\nCard 6: Foto Luis + "Consultor Financeiro — SPFP"',
      priority: 'HIGH',
      tags: ['criativo', 'carrossel', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-07',
    },

    // Campanha
    {
      title: '📣 Campanha 1 — "Consulta Gratuita" R$30/dia ⚠️ só após gate',
      description: '⚠️ Gate: 2+ clientes via orgânico OU CR landing ≥ 3%\n\nNome: "SPFP — Consulta Gratuita — Geração de Leads"\nObjetivo: Leads\nBudget: R$30/dia distribuído em 3 ADSETs\n\nCronograma de ativação (semana 5 se gate atingido):\nDia 1: Criar conta Meta Business Suite\nDia 2: Instalar Pixel\nDia 3: Upload audiências\nDia 4: Subir campanha\nDia 5-14: FASE DE APRENDIZADO — NÃO mexer',
      priority: 'HIGH',
      tags: ['campanha', 'meta-ads', 'setup'],
      assignee_name: 'Luis',
      due_date: '2026-04-14',
    },
    {
      title: '📣 ADSET A — Prospecting Amplo (R$15/dia)',
      description: 'Público: Brasil — 28-45 anos\nInteresses: finanças pessoais, controle financeiro, investimentos, planejamento financeiro, independência financeira, Nubank, Rico, XP Investimentos\nPlacement: Instagram Feed + Reels (automático)\nBudget: R$15/dia\nCriativos: testar A e B\nMeta: CPL < R$50',
      priority: 'HIGH',
      tags: ['adset', 'prospecting', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-14',
    },
    {
      title: '📣 ADSET B — Lookalike 1-3% lista de contatos (R$10/dia)',
      description: 'Público: Lookalike 1-3% — Brasil — base: lista de emails do Luis\nBudget: R$10/dia\nCriativo: Criativo A (melhor performance esperada com audiência quente)\n\nPré-requisito: audiência Lookalike criada (mínimo 100 contatos na lista base).',
      priority: 'HIGH',
      tags: ['adset', 'lookalike', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-14',
    },
    {
      title: '📣 ADSET C — Retargeting site + Instagram (R$5/dia)',
      description: 'Público: visitantes do site últimos 30 dias + engajamento Instagram últimos 60 dias\nBudget: R$5/dia\nCriativo: Criativo B (imagem estática — menor fricção para quem já conhece)\n\nEssa audiência é a mais quente e vai converter com menor CPL.',
      priority: 'HIGH',
      tags: ['adset', 'retargeting', 'meta-ads'],
      assignee_name: 'Luis',
      due_date: '2026-04-14',
    },
    {
      title: '⏸️ Fase de aprendizado — NÃO alterar adsets por 14 dias',
      description: '⚠️ REGRA CRÍTICA: após ligar a campanha, NÃO alterar NADA por 14 dias.\nO algoritmo precisa de 50 eventos de otimização por adset para sair do aprendizado.\nQualquer alteração reinicia o aprendizado e desperdiça budget.\n\nPROIBIDO: mudar público, criativo, budget.\nPERMITIDO: monitorar CPL diariamente, registrar na planilha de métricas.',
      priority: 'HIGH',
      tags: ['meta-ads', 'aprendizado', 'regra'],
      assignee_name: 'Luis',
      due_date: '2026-04-28',
    },
    {
      title: '📊 Semana 7 — Análise ADSETs e otimização',
      description: 'Em 2026-05-05 (semana 7 de anúncios):\n\nChecklist:\n- Qual ADSET tem melhor CPL?\n- CTR > 1%? Se não → trocar criativo (fadiga)\n- CPL < R$50 por 3 dias? → escalar +30%\n- CPL > R$100 por 7 dias? → pausar adset\n\nRegra de escala: +30% a cada 72h (NUNCA +50% de uma vez — quebra aprendizado)\nRegistrar recomendação no dashboard semanal.',
      priority: 'MEDIUM',
      tags: ['meta-ads', 'otimização', 'análise'],
      assignee_name: 'Thiago Finch',
      due_date: '2026-05-05',
    },
    {
      title: '🚀 Campanha 2 — Escala dos adsets vencedores (semana 9+)',
      description: 'Ativar após 4 semanas da Campanha 1.\n\nNome: "SPFP — Escala — Vencedores"\nObjetivo: Leads (ou Conversão se Pixel tem eventos suficientes)\nBudget: escalar adsets vencedores da Campanha 1\n\nRegras inegociáveis:\n- CPL < R$50 por 3 dias → +30% budget\n- CPL R$50-100 por 7 dias → manter, testar novo criativo\n- CPL > R$100 por 7 dias → pausar\n- CTR < 1% por 7 dias → trocar criativo\n- CAC > R$400 por 4 semanas → revisar funil inteiro',
      priority: 'MEDIUM',
      tags: ['meta-ads', 'escala', 'campanha-2'],
      assignee_name: 'Thiago Finch',
      due_date: '2026-05-12',
    },
  ],
};

const DEFAULT_BOARDS_BY_SQUAD: Record<string, DefaultBoard[]> = {
  'Marketing': [
    { name: 'Estratégia',         icon: '🗺️', description: 'Planejamento estratégico, ferramentas e ICP' },
    { name: 'Campanhas',          icon: '📣', description: 'Conteúdo ativo — semanas 1 e 2 (execução imediata)' },
    { name: 'Calendário 90 Dias', icon: '📅', description: 'Pauta editorial completa — 12 semanas de conteúdo' },
    { name: 'Email Marketing',    icon: '📧', description: 'Sequências de nurturing e automação MailerLite' },
    { name: 'Meta Ads',           icon: '💰', description: 'Campanha paga — setup, criativos e escala' },
    { name: 'Análise',            icon: '📊', description: 'Métricas, resultados e reviews de performance' },
  ],
  'Vendas': [
    { name: 'Prospecção',  icon: '🔍', description: 'Leads sendo prospectados' },
    { name: 'Pipeline',    icon: '🔄', description: 'Negociações em andamento' },
    { name: 'Propostas',   icon: '📄', description: 'Propostas enviadas aguardando resposta' },
    { name: 'Fechamento',  icon: '🤝', description: 'Em fase de fechamento e assinatura' },
  ],
  'Produtos': [
    { name: 'Discovery',      icon: '🔬', description: 'Pesquisa, entrevistas e validação' },
    { name: 'Backlog',        icon: '📋', description: 'Funcionalidades priorizadas para desenvolvimento' },
    { name: 'Desenvolvimento',icon: '⚡', description: 'Em desenvolvimento ativo' },
    { name: 'QA & Lançamento',icon: '🚀', description: 'Testes e publicação de funcionalidades' },
  ],
  'OPS': [
    { name: 'Mapeamento',    icon: '🗺️', description: 'Mapeamento de processos do fim pro começo' },
    { name: 'Automações',    icon: '🤖', description: 'Integrações N8N, ClickUp e webhooks' },
    { name: 'Documentação',  icon: '📝', description: 'SOPs, playbooks e guias operacionais' },
    { name: 'Quality Check', icon: '✅', description: 'Auditoria e validação de processos' },
  ],
  'Customer Success': [
    { name: 'Onboarding',   icon: '🎉', description: 'Novos clientes em processo de onboarding' },
    { name: 'Health Check', icon: '💚', description: 'Monitoramento de saúde e engajamento' },
    { name: 'Suporte',      icon: '🎧', description: 'Tickets abertos N1/N2/N3' },
    { name: 'Retenção',     icon: '🛡️', description: 'Clientes em risco de churn' },
  ],
  'Admin': [
    { name: 'Financeiro',   icon: '💵', description: 'Contas a pagar/receber e fluxo de caixa' },
    { name: 'Jurídico',     icon: '⚖️', description: 'Contratos, compliance e LGPD' },
    { name: 'RH & People',  icon: '👥', description: 'Time, recrutamento e onboarding interno' },
    { name: 'Ferramentas',  icon: '🔧', description: 'SaaS, acessos e infraestrutura' },
  ],
};

interface CompanyContextValue {
  // Squads
  squads: CompanySquad[];
  isLoading: boolean;
  addSquad: (data: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateSquad: (id: string, data: Partial<CompanySquad>) => Promise<void>;
  archiveSquad: (id: string) => Promise<void>;
  // Boards
  boards: CompanyBoard[];
  boardsLoading: boolean;
  loadBoards: (squadId: string) => Promise<void>;
  addBoard: (data: Omit<CompanyBoard, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateBoard: (id: string, data: Partial<CompanyBoard>) => Promise<void>;
  archiveBoard: (id: string) => Promise<void>;
  // Tasks
  tasks: CompanyTask[];
  tasksLoading: boolean;
  loadTasks: (boardId: string) => Promise<void>;
  addTask: (data: Omit<CompanyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CompanyTask>;
  updateTask: (id: string, data: Partial<CompanyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used inside CompanyProvider');
  return ctx;
};

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [squads, setSquads] = useState<CompanySquad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<CompanyBoard[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [tasks, setTasks] = useState<CompanyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // ---- Squads ----
  const seedDefaultSquads = useCallback(async (userId: string) => {
    const { data: existing } = await supabase
      .from('company_squads')
      .select('id')
      .eq('user_id', userId);

    if (!existing || existing.length === 0) {
      const rows = DEFAULT_SQUADS.map((s) => ({ ...s, user_id: userId }));
      await supabase.from('company_squads').insert(rows);
    }
  }, []);

  const loadSquads = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      await seedDefaultSquads(userId);
      const { data, error } = await supabase
        .from('company_squads')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('sort_order');

      if (error) throw error;
      setSquads(data || []);
    } catch (err) {
      console.error('[CompanyContext] Error loading squads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [seedDefaultSquads]);

  useEffect(() => {
    if (user) {
      void loadSquads(user.id);
    } else {
      setSquads([]);
      setBoards([]);
    }
  }, [user, loadSquads]);

  const addSquad = useCallback(async (data: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('company_squads')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setSquads((prev) => [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order));
  }, [user]);

  const updateSquad = useCallback(async (id: string, data: Partial<CompanySquad>) => {
    const { data: updated, error } = await supabase
      .from('company_squads')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setSquads((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  const archiveSquad = useCallback(async (id: string) => {
    await updateSquad(id, { is_archived: true });
    setSquads((prev) => prev.filter((s) => s.id !== id));
  }, [updateSquad]);

  // ---- Boards ----
  const seedDefaultBoards = useCallback(async (squadId: string, userId: string) => {
    // Descobre o nome do squad para saber quais boards criar
    const { data: squad } = await supabase
      .from('company_squads')
      .select('name')
      .eq('id', squadId)
      .single();

    if (!squad) return;
    const templates = DEFAULT_BOARDS_BY_SQUAD[squad.name];
    if (!templates) return;

    // Busca boards existentes para inserir apenas os que faltam (idempotente)
    const { data: existing } = await supabase
      .from('company_boards')
      .select('name')
      .eq('squad_id', squadId);

    const existingNames = new Set((existing || []).map((b: { name: string }) => b.name));
    const missingTemplates = templates.filter((t) => !existingNames.has(t.name));

    if (missingTemplates.length === 0) return;

    const rows = missingTemplates.map((b) => ({
      squad_id: squadId,
      user_id: userId,
      name: b.name,
      icon: b.icon,
      description: b.description,
      is_archived: false,
      sort_order: templates.indexOf(b),
    }));
    await supabase.from('company_boards').insert(rows);
  }, []);

  const loadBoards = useCallback(async (squadId: string) => {
    if (!squadId) return;
    setBoardsLoading(true);
    try {
      // Sempre tenta adicionar boards faltantes (idempotente — não recria existentes)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await seedDefaultBoards(squadId, authUser.id);
      }

      const { data, error } = await supabase
        .from('company_boards')
        .select('*')
        .eq('squad_id', squadId)
        .eq('is_archived', false)
        .order('sort_order');
      if (error) throw error;

      setBoards(data || []);
    } catch (err) {
      console.error('[CompanyContext] Error loading boards:', err);
    } finally {
      setBoardsLoading(false);
    }
  }, [seedDefaultBoards]);

  const addBoard = useCallback(async (data: Omit<CompanyBoard, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('company_boards')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setBoards((prev) => [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order));
  }, [user]);

  const updateBoard = useCallback(async (id: string, data: Partial<CompanyBoard>) => {
    const { data: updated, error } = await supabase
      .from('company_boards')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setBoards((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }, []);

  const archiveBoard = useCallback(async (id: string) => {
    await updateBoard(id, { is_archived: true });
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }, [updateBoard]);

  // ---- Tasks ----
  const seedDefaultTasks = useCallback(async (boardId: string, userId: string) => {
    // Descobre o nome do board para saber quais tasks criar
    const { data: board } = await supabase
      .from('company_boards')
      .select('name')
      .eq('id', boardId)
      .single();

    if (!board) return;
    const templates = DEFAULT_TASKS_BY_BOARD[board.name];
    if (!templates || templates.length === 0) return;

    const rows = templates.map((t, i) => ({
      board_id: boardId,
      user_id: userId,
      title: t.title,
      description: t.description,
      status: 'TODO' as const,
      priority: t.priority,
      assignee_name: t.assignee_name ?? null,
      assignee_id: null,
      assignee_avatar: null,
      tags: t.tags,
      due_date: t.due_date ?? null,
      sort_order: i,
    }));
    await supabase.from('company_tasks').insert(rows);
  }, []);

  const loadTasks = useCallback(async (boardId: string) => {
    setTasksLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_tasks')
        .select('*')
        .eq('board_id', boardId)
        .order('sort_order');
      if (error) throw error;

      // Se não há tasks, faz seed automático (apenas para boards do squad Marketing)
      if (!data || data.length === 0) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await seedDefaultTasks(boardId, authUser.id);
          const { data: seeded } = await supabase
            .from('company_tasks')
            .select('*')
            .eq('board_id', boardId)
            .order('sort_order');
          setTasks(seeded || []);
          return;
        }
      }

      setTasks(data || []);
    } catch (err) {
      console.error('[CompanyContext] Error loading tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  }, [seedDefaultTasks]);

  const addTask = useCallback(async (data: Omit<CompanyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CompanyTask> => {
    if (!user) throw new Error('Not authenticated');
    const { data: inserted, error } = await supabase
      .from('company_tasks')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setTasks((prev) => [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order));
    return inserted;
  }, [user]);

  const updateTask = useCallback(async (id: string, data: Partial<CompanyTask>) => {
    const { data: updated, error } = await supabase
      .from('company_tasks')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('company_tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <CompanyContext.Provider value={{
      squads, isLoading, addSquad, updateSquad, archiveSquad,
      boards, boardsLoading, loadBoards, addBoard, updateBoard, archiveBoard,
      tasks, tasksLoading, loadTasks, addTask, updateTask, deleteTask,
    }}>
      {children}
    </CompanyContext.Provider>
  );
};
