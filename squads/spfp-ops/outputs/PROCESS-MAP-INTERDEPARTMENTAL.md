# MAPEAMENTO DE PROCESSOS INTERDEPARTAMENTAIS — SPFP
**Documento**: Process Map v1.0
**Produzido por**: Process Mapper (Pedro Valerio Clone) — Squad OPS
**Data**: 2026-02-25
**Destino**: Automation Architect + Architect para configuração N8N

---

> **Metodologia**: Mapeado do fim pro começo. Cada fluxo começa no resultado desejado e trabalha para trás ate o trigger inicial. Foco em handoffs reais entre squads e nos pontos onde o processo para esperando algo ou alguem.

---

## INDICE

1. [Lead → Cliente](#fluxo-1-lead--cliente)
2. [Criação de Conteúdo](#fluxo-2-criação-de-conteúdo)
3. [Onboarding de Cliente](#fluxo-3-onboarding-de-cliente)
4. [Lançamento de Produto/Infoproduto](#fluxo-4-lançamento-de-produtoinfoproduto)
5. [Financeiro Mensal](#fluxo-5-financeiro-mensal)
6. [Contratação de Pessoa](#fluxo-6-contratação-de-pessoa)
7. [Automação de Processo](#fluxo-7-automação-de-processo)
8. [Mapa de Handoffs Globais](#mapa-de-handoffs-globais)
9. [Gaps Críticos Consolidados](#gaps-críticos-consolidados)

---

## FLUXO 1: Lead → Cliente

**Squads envolvidos**: Marketing → Vendas → CS
**APIs chave**: Meta Graph API, RD Station/ActiveCampaign, WhatsApp Business API, CRM (HubSpot/Pipedrive), Calendly, Stripe/Hotmart

### Resultado Esperado (Ponto Final)
> Cliente ativo no SPFP: conta criada, pelo menos 5 transações lançadas, app aberto em 2+ dias na semana 1, pagamento confirmado.

---

### Etapas em Ordem Reversa

#### ETAPA 8 — Ativação confirmada
- **Resultado**: Cliente marcado como "ativado" no CRM
- **Responsável**: CS — Onboarding Specialist
- **API/Ferramenta**: CRM + Intercom/Zendesk
- **Trigger de saida**: Handoff automatico para CS Retencao (webhook CRM → N8N)
- **Gap**: Nao ha criterio automatico de ativacao integrado ao produto. Alguem precisa verificar manualmente se o cliente cumpriu os 4 criterios de ativacao.

#### ETAPA 7 — Pagamento confirmado + acesso liberado
- **Resultado**: Pagamento processado, conta criada, boas-vindas enviadas
- **Responsável**: Vendas (Closer) → CS (Onboarding Specialist)
- **API/Ferramenta**: Stripe → Webhook N8N → Intercom/Email → CRM atualizado
- **Trigger de saida**: Webhook Stripe `charge.succeeded` dispara N8N → notifica Onboarding Specialist
- **Gap**: Se Stripe webhook falhar silenciosamente, cliente paga mas nao recebe acesso. Precisa de fallback de verificacao manual com alerta.

#### ETAPA 6 — Deal fechado
- **Resultado**: Proposta aceita, contrato assinado (se aplicavel), link de pagamento enviado
- **Responsável**: Vendas — Closer
- **API/Ferramenta**: DocuSign/PandaDoc (contrato) + Stripe (link de pagamento) + CRM (status Deal → Won)
- **Trigger de saida**: Closer atualiza CRM para "Won" → N8N detecta mudanca de status → notifica CS
- **Gap**: Closer pode esquecer de atualizar CRM. Automacao depende de disciplina manual no campo de status.

#### ETAPA 5 — Negociacao / Proposta
- **Resultado**: Proposta enviada com preco, condicoes e link de pagamento
- **Responsável**: Vendas — Closer
- **API/Ferramenta**: CRM + Email/WhatsApp Business API + Stripe (link de pagamento pre-configurado)
- **Trigger de saida**: Proposta enviada → Follow-up automatico em 24h se nao houver resposta (N8N)
- **Gap**: Nao ha template de proposta automatizado vinculado ao CRM. Closer cria proposta manualmente toda vez.

#### ETAPA 4 — Discovery Call realizada
- **Resultado**: Closer entende problema do cliente, valida fit, define proximo passo
- **Responsável**: Vendas — Closer
- **API/Ferramenta**: Zoom/Google Meet + CRM (notas) + Calendly (agendamento)
- **Trigger de saida**: Closer registra call no CRM → muda status para "Proposta" → N8N envia proposta template
- **Gap**: Nao ha gravacao automatica integrada ao CRM. Closer depende de memoria ou notas manuais.

#### ETAPA 3 — Primeiro contato + agendamento da Discovery Call
- **Resultado**: Discovery Call agendada no Calendly, confirmada por WhatsApp e email
- **Responsável**: Vendas — SDR
- **API/Ferramenta**: WhatsApp Business API (Z-API/Evolution) + Email + Calendly API + CRM
- **Trigger de saida**: Lead agenda via Calendly → webhook Calendly → N8N atualiza CRM + envia confirmacao WhatsApp + material pre-call
- **Gap**: Sequencia de contato (Dia 0 email → Dia 1 WhatsApp → Dia 2 ligacao) precisa ser orquestrada pelo N8N. Hoje e manual.

#### ETAPA 2 — Lead qualificado (SQL) entregue para SDR
- **Resultado**: Lead pontuado (score 0-100), classificado como quente/morno/frio, informacoes no CRM
- **Responsável**: Vendas — SDR
- **API/Ferramenta**: CRM + RD Station/ActiveCampaign (dados de engajamento) + Sheets (scoring manual ou formula)
- **Trigger de saida**: Score calculado → se >=60, SDR recebe notificacao no Slack/WhatsApp; se <60, volta para nurture no RD Station
- **Gap**: Scoring e feito manualmente pelo SDR. Precisa de regras automatizadas no N8N usando dados do CRM + RD Station (paginas visitadas, emails abertos, downloads).

#### ETAPA 1 — Lead capturado (MQL)
- **Resultado**: Lead com nome, email, telefone e fonte cadastrado no CRM
- **Responsável**: Marketing — Research Analyst + Media Buyer
- **API/Ferramenta**: Meta Graph API (anuncios) + Landing Page → RD Station/ActiveCampaign → CRM (sync via N8N ou integracao nativa)
- **Trigger de saida**: Lead preenche formulario → webhook RD Station → N8N → CRM criado → SDR notificado se score inicial alto
- **Gap**: Nao ha sincronizacao automatica confirmada entre RD Station e CRM. Lead pode ficar preso no RD Station sem chegar para o SDR.

---

### Fluxo Resumido

```
Meta Ads / Google Ads / Organico
        |
        v (formulario/landing)
   RD Station/ActiveCampaign (nurture)
        |
        v (MQL — criteria atingidos)
   CRM criado (Lead)
        |
        v (notificacao N8N → Slack/WhatsApp)
   SDR — Lead Scoring (0-100)
        |
        +--- Score < 60 → volta para nurture (RD Station tag: "requalificar")
        |
        +--- Score >= 60 → Sequencia de contato
              |
              v (Calendly agendado)
        Closer — Discovery Call (Zoom/Meet)
              |
              v (call feita, CRM atualizado)
        Closer — Proposta enviada (Stripe link)
              |
              v (proposta aceita, DocuSign)
        Closer — Deal Won (CRM)
              |
              v (webhook CRM → N8N)
        Stripe — Pagamento confirmado
              |
              v (webhook Stripe → N8N)
        CS — Onboarding Specialist (Welcome)
              |
              v (ativacao confirmada)
        CS — Retencao assume
```

---

### Quality Gate — Fluxo 1 esta pronto quando:

- [ ] Lead de Meta Ads chega no CRM em < 5 minutos automaticamente
- [ ] SDR recebe notificacao instantanea para leads score >= 60
- [ ] Sequencia de contato (email D0 → WhatsApp D1 → followup D3 → breakup D7) roda automaticamente no N8N
- [ ] Confirmacao de Calendly dispara material pre-call automaticamente
- [ ] Webhook Stripe → CRM → notificacao CS funciona em < 2 minutos
- [ ] Cliente recebe boas-vindas em < 30 minutos apos pagamento
- [ ] Score de lead e calculado automaticamente por regras no N8N (nao manualmente pelo SDR)

---

## FLUXO 2: Criação de Conteúdo

**Squad envolvido**: Marketing (interno)
**APIs chave**: Canva API, Meta Graph API, Google Drive API, RD Station

### Resultado Esperado (Ponto Final)
> Conteudo publicado nas plataformas corretas nos horarios ideais, com performance registrada para retroalimentar a proxima criacao.

---

### Etapas em Ordem Reversa

#### ETAPA 6 — Performance registrada e retroalimentada
- **Resultado**: Metricas de alcance, engajamento e conversao registradas no dashboard semanal
- **Responsável**: Marketing — Research Analyst
- **API/Ferramenta**: Meta Graph API (insights) + Google Analytics → Sheets/Notion
- **Trigger de saida**: Todo domingo, N8N puxa metricas da semana → popula dashboard → Research Analyst analisa e prepara briefing da proxima semana
- **Gap**: Nao ha loop automatico de "o que performou bem esta semana → repetir o formato". Aprendizado fica na cabeca do analista.

#### ETAPA 5 — Publicacao agendada e executada
- **Resultado**: Post publicado no Instagram/Facebook/Email nos horarios planejados
- **Responsável**: Marketing — Social Media Manager + Email Strategist
- **API/Ferramenta**: Meta Graph API (posts agendados) + RD Station (email disparado) + Buffer/Later (opcional)
- **Trigger de saida**: Horario agendado → publicacao automatica → notificacao Slack para social media manager confirmar
- **Gap**: Aprovacao de conteudo ainda precisa de confirmacao manual do Head de Marketing antes do agendamento.

#### ETAPA 4 — Aprovacao do conteudo (QG interno)
- **Resultado**: Conteudo aprovado pelo Head de Marketing (Thiago Finch)
- **Responsável**: Marketing — Marketing Chief
- **API/Ferramenta**: Notion (review) ou Slack (aprovacao por emoji/mensagem)
- **Trigger de saida**: Head aprova → Social Media Manager agenda publicacao → Email Strategist agenda disparo
- **Gap**: Nao ha fluxo de aprovacao estruturado. Head pode demorar dias para ver o conteudo se nao for notificado ativamente.

#### ETAPA 3 — Criacao do conteudo
- **Resultado**: Arte + copy finalizados, prontos para aprovacao
- **Responsável**: Marketing — Content Manager (copy) + Canva (arte)
- **API/Ferramenta**: Canva API (templates) + Google Drive (arquivos finais) + Notion (copy e contexto)
- **Trigger de saida**: Content Manager marca tarefa como "pronto para revisao" no ClickUp → N8N notifica Head de Marketing
- **Gap**: Templates de Canva para cada formato (carrossel, story, feed) precisam ser criados e padronizados antes da automacao. Hoje cada peca e criada do zero.

#### ETAPA 2 — Briefing aprovado
- **Resultado**: Briefing com tema, angulo de copy, formato, CTA e metrica de sucesso definidos
- **Responsável**: Marketing — Research Analyst → Marketing Chief (aprovacao)
- **API/Ferramenta**: Notion (template de briefing) + ClickUp (tarefa criada)
- **Trigger de saida**: Briefing aprovado pelo Chief → ClickUp task criada para Content Manager com prazo
- **Gap**: Nao ha template padrao de briefing. Cada briefing e escrito de forma diferente, causando retrabalho na criacao.

#### ETAPA 1 — Demanda identificada
- **Resultado**: Necessidade de conteudo identificada (calendario editorial, campanha ativa, lancamento)
- **Responsável**: Marketing — Marketing Chief
- **API/Ferramenta**: Notion (calendario editorial) + ClickUp (backlog de conteudo)
- **Trigger de saida**: Calendario editorial define pauta da semana → Research Analyst prepara briefing
- **Gap**: Calendario editorial nao existe de forma estruturada. Conteudo e criado de forma reativa.

---

### Fluxo Resumido

```
Calendario Editorial (Notion)
        |
        v (segunda-feira, revisao semanal)
   Research Analyst — briefing semanal
        |
        v (briefing aprovado por Head)
   ClickUp task → Content Manager
        |
        v (arte + copy prontos)
   Canva API (arte) + Notion (copy)
        |
        v (tarefa marcada como "pronto")
   Head de Marketing — aprovacao
        |
        v (aprovado)
   Social Media Manager — agendamento (Meta Graph API)
   Email Strategist — agendamento (RD Station)
        |
        v (publicado)
   Research Analyst — coleta metricas (Meta Graph API)
        |
        v (domingo, loop fechado)
   Retroalimentacao → proximo briefing
```

---

### Quality Gate — Fluxo 2 esta pronto quando:

- [ ] Calendario editorial do mes existe no Notion com pautas pre-definidas
- [ ] Template de briefing padronizado no Notion
- [ ] Templates de arte no Canva para cada formato (feed 1:1, carrossel, story, reels thumbnail)
- [ ] Fluxo de aprovacao no Slack: tag do Head + resposta de aprovacao em < 24h
- [ ] Publicacao agendada automaticamente via Meta Graph API (sem post manual)
- [ ] Dashboard de performance atualizado automaticamente todo domingo pelo N8N

---

## FLUXO 3: Onboarding de Cliente

**Squad envolvido**: CS
**APIs chave**: WhatsApp Business API, Intercom/Zendesk, CRM, Stripe

### Resultado Esperado (Ponto Final)
> Cliente ativado (4 criterios cumpridos), contexto documentado, handoff feito para CS Retencao com briefing completo do cliente.

---

### Etapas em Ordem Reversa

#### ETAPA 5 — Handoff para CS Retencao
- **Resultado**: CS Retencao recebe briefing do cliente (contexto, primeiras vitorias, perfil financeiro, expectativas)
- **Responsável**: CS — Onboarding Specialist
- **API/Ferramenta**: CRM (registro de contexto) + Notion (briefing de handoff) + Slack (notificacao para CS Retencao)
- **Trigger de saida**: Dia 7 apos pagamento → N8N verifica se criterios de ativacao foram cumpridos → se sim, cria briefing automatico e notifica CS Retencao
- **Gap**: Briefing de handoff e criado manualmente. Nao ha template estruturado que puxe dados do CRM automaticamente.

#### ETAPA 4 — Primeira vitoria documentada
- **Resultado**: Cliente viu o dashboard funcionando com dados reais proprios (1 conta + 5 transacoes + 2+ sessoes)
- **Responsável**: CS — Onboarding Specialist
- **API/Ferramenta**: SPFP produto (dados de uso) + Intercom (acompanhamento) + WhatsApp (incentivo)
- **Trigger de saida**: Produto detecta ativacao → evento enviado para CRM/Intercom → Onboarding Specialist recebe alerta
- **Gap**: SPFP precisa emitir eventos de produto (account_created, transaction_added, session_opened) para o Intercom/CRM. Hoje nao existe esse rastreamento automatico confirmado.

#### ETAPA 3 — Setup guiado da conta
- **Resultado**: Cliente configurou conta bancaria e lancou primeiras transacoes
- **Responsável**: CS — Onboarding Specialist
- **API/Ferramenta**: Email (Loom tutorial) + WhatsApp Business API (mensagens de incentivo) + SPFP produto
- **Trigger de saida**: Dia 1 apos welcome → sequencia de mensagens educativas automaticas (N8N)
- **Gap**: Sequencia de mensagens D1, D3, D5 precisa ser criada e configurada no N8N. Hoje o onboarding e feito manualmente por cada especialista.

#### ETAPA 2 — Boas-vindas enviadas
- **Resultado**: Cliente recebe email de boas-vindas + WhatsApp com proximos passos em < 30 min apos pagamento
- **Responsável**: CS — Onboarding Specialist
- **API/Ferramenta**: Email automatico (RD Station ou Intercom) + WhatsApp Business API (Z-API/Evolution)
- **Trigger de saida**: Webhook Stripe `charge.succeeded` → N8N → envia email boas-vindas + WhatsApp D0
- **Gap**: Template de boas-vindas precisa ser criado. Mensagem do WhatsApp precisa ser pre-aprovada pela Meta para uso com WhatsApp Business API.

#### ETAPA 1 — Cliente fechado entregue por Vendas
- **Resultado**: CRM atualizado com status "Won", dados do cliente completos, pagamento confirmado
- **Responsável**: Vendas — Closer
- **API/Ferramenta**: CRM + Stripe
- **Trigger de saida**: CRM status → "Won" + Stripe `charge.succeeded` = dois gatilhos confirmam o inicio do onboarding
- **Gap**: Se CRM for atualizado mas Stripe nao confirmar (chargeback, falha), o onboarding nao pode comecar. Precisa de logica AND no N8N.

---

### Fluxo Resumido

```
Stripe charge.succeeded (webhook)
   AND CRM status = "Won"
        |
        v (N8N — dupla confirmacao)
   Email boas-vindas + WhatsApp D0
        |
        v (Dia 1)
   Loom tutorial configuracao conta
   WhatsApp: "Como esta indo?"
        |
        v (Dia 3-5)
   WhatsApp: incentivo primeira vitoria
   Verificacao automatica: conta criada? transacoes lancadas?
        |
        v (Dia 7)
   Verificacao de ativacao (4 criterios)
        |
        +--- Nao ativado → alerta Onboarding Specialist para intervencao manual
        |
        +--- Ativado → Briefing gerado → Handoff para CS Retencao
```

---

### Quality Gate — Fluxo 3 esta pronto quando:

- [ ] Webhook Stripe → N8N → email + WhatsApp em < 30 minutos
- [ ] Template de WhatsApp aprovado pela Meta (mensagem de boas-vindas)
- [ ] Sequencia D0→D1→D3→D5→D7 configurada no N8N com mensagens prontas
- [ ] SPFP emite eventos de produto para Intercom/CRM (account_created, transaction_added, session_opened)
- [ ] Criterios de ativacao verificados automaticamente no Dia 7
- [ ] Alerta automatico para Onboarding Specialist se cliente nao ativou no Dia 7
- [ ] Template de briefing de handoff preenche automaticamente com dados do CRM

---

## FLUXO 4: Lançamento de Produto/Infoproduto

**Squads envolvidos**: Products → Marketing → Vendas
**APIs chave**: Hotmart/Eduzz, Meta Graph API, RD Station, WhatsApp Business API, Canva API, Stripe

### Resultado Esperado (Ponto Final)
> Produto no ar, primeira venda realizada, metricas de lancamento registradas (receita D1, D3, D7), feedback inicial coletado.

---

### Etapas em Ordem Reversa

#### ETAPA 8 — Feedback loop pos-lancamento
- **Resultado**: Relatorio de lancamento: vendas, CAC, conversao da lista, NPS inicial, aprendizados
- **Responsável**: Products — Product Manager + Marketing — Research Analyst
- **API/Ferramenta**: Hotmart/Eduzz (vendas) + Meta Ads Manager (CAC) + RD Station (conversao email) + Typeform (NPS)
- **Trigger de saida**: D7 pos-lancamento → N8N puxa dados automaticamente → PM gera relatorio de lancamento
- **Gap**: Dados ficam em silos (Hotmart, Meta, RD Station). Nao ha consolidacao automatica. Relatorio hoje seria manual.

#### ETAPA 7 — Periodo de lancamento ativo
- **Resultado**: Campanhas rodando, lista aquecida convertendo, suporte ativo
- **Responsável**: Marketing — Media Buyer + Email Strategist + CS — Suporte
- **API/Ferramenta**: Meta Graph API + RD Station (sequencia de emails) + WhatsApp Business API + Hotmart/Eduzz (checkout)
- **Trigger de saida**: Data de lancamento (calendario) → N8N ativa campanhas + dispara sequencia de emails + ativa chatbot WhatsApp de suporte
- **Gap**: "Ativar campanha" no dia certo exige sincronia manual entre Media Buyer e quem opera o Meta Ads. Nao ha automacao de ativacao de campanha por data.

#### ETAPA 6 — Pre-lancamento / aquecimento da lista
- **Resultado**: Lista segmentada aquecida, expectativa criada, leads pre-cadastrados no checkout
- **Responsável**: Marketing — Email Strategist + Content Manager
- **API/Ferramenta**: RD Station (sequencia de aquecimento) + Meta Graph API (trafego organico + pago) + Landing page (pre-cadastro)
- **Trigger de saida**: 7-14 dias antes do lancamento → sequencia de emails de aquecimento ativa no RD Station
- **Gap**: Lista de leads precisa estar segmentada por interesse no produto especifico. RD Station precisa de tags corretas por produto/interesse para nao disparar para toda a base.

#### ETAPA 5 — Aprovacao final de todos os materiais
- **Resultado**: Checkout configurado, emails aprovados, anuncios aprovados, pagina de vendas aprovada
- **Responsável**: Products — QA Experience + Marketing — Marketing Chief
- **API/Ferramenta**: Hotmart/Eduzz (checkout teste) + Meta Ads (anuncio em revisao) + RD Station (email teste)
- **Trigger de saida**: QA Experience marca checklist de lancamento como completo → PM autoriza inicio do pre-lancamento
- **Gap**: Nao ha checklist formal de lancamento definido. O que "esta pronto para lancar" depende da percepcao subjetiva de cada agente.

#### ETAPA 4 — Configuracao tecnica do lancamento
- **Resultado**: Checkout criado, pagina de vendas no ar (modo privado), emails configurados, anuncios criados
- **Responsável**: Products — Content Creator + Marketing — Media Buyer + Email Strategist
- **API/Ferramenta**: Hotmart/Eduzz (produto criado + checkout) + Canva API (artes) + RD Station (automacao de email) + Meta Ads Manager
- **Trigger de saida**: Briefing de lancamento aprovado (PM) → tasks criadas no ClickUp para cada agente com prazo
- **Gap**: Tarefas paralelas (checkout, emails, anuncios, artes) sem dependencias claras. Alguem pode terminar e outro ainda nao comecar, travando o lancamento.

#### ETAPA 3 — Briefing de lancamento aprovado
- **Resultado**: Documento com: nome do produto, preco, oferta, ICP, data de lancamento, metas de venda, canais
- **Responsável**: Products — Product Manager
- **API/Ferramenta**: Notion (documento de briefing) + ClickUp (epic de lancamento criado)
- **Trigger de saida**: PM aprova briefing → distribui para Marketing e Vendas → tasks criadas no ClickUp
- **Gap**: Marketing e Vendas precisam receber o briefing ao mesmo tempo para comecar preparacao em paralelo. Hoje e sequencial (PM → Marketing → Vendas).

#### ETAPA 2 — Validacao do produto
- **Resultado**: Produto validado (pre-vendas ou pesquisa) antes de producao completa
- **Responsável**: Products — Product Manager
- **API/Ferramenta**: Typeform (pesquisa de interesse) + Notion (analise de dados) + Calendly (calls de validacao)
- **Trigger de saida**: Validacao confirma demanda → PM aprova desenvolvimento completo do produto
- **Gap**: Etapa frequentemente pulada por pressao de prazo. Produto lancado sem validacao real.

#### ETAPA 1 — Oportunidade de produto identificada
- **Resultado**: Ideia de produto documentada com: problema que resolve, ICP, diferencial, hipotese de receita
- **Responsável**: Products — Product Manager
- **API/Ferramenta**: Notion (framework de discovery) + Dados do CRM (feedback de clientes) + Dados de CS (reclamacoes recorrentes)
- **Trigger de saida**: Oportunidade aprovada pelo Products Chief → entra no roadmap
- **Gap**: Feedback de CS sobre necessidades de clientes nao chega sistematicamente para o PM. E conversa informal, nao dados estruturados.

---

### Fluxo Resumido

```
Feedback de CS + dados de produto
        |
        v (PM identifica oportunidade)
   Discovery + validacao (Typeform/calls)
        |
        v (validado)
   Briefing de lancamento (Notion)
        |
        v (aprovado por Products Chief)
   Distribuicao paralela: Marketing + Vendas
   |                           |
   v                           v
Canva (artes)          Hotmart/Eduzz (checkout)
RD Station (emails)    Pagina de vendas
Meta Ads (anuncios)    Treinamento SDR/Closer
   |                           |
   v                           v
         QA Experience — checklist de lancamento
                    |
                    v (aprovado)
         Pre-lancamento: aquecimento de lista (RD Station)
                    |
                    v (data D-0)
         Lancamento: Meta Ads + Email + WhatsApp
                    |
                    v (D7)
         Relatorio de lancamento (PM + Research Analyst)
```

---

### Quality Gate — Fluxo 4 esta pronto quando:

- [ ] Template de briefing de lancamento existe no Notion com todos os campos obrigatorios
- [ ] Checklist formal de lancamento criado e validado pelo QA Experience
- [ ] Hotmart/Eduzz configurados e integrados com Stripe ou propria plataforma de pagamento
- [ ] Templates de email de lancamento criados no RD Station (aquecimento + abertura + fechamento + urgencia)
- [ ] Processo de validacao pre-lancamento documentado e seguido obrigatoriamente
- [ ] Tags de segmentacao no RD Station funcionando por produto/interesse
- [ ] Relatorio automatico de lancamento gerado pelo N8N no D7

---

## FLUXO 5: Financeiro Mensal

**Squad envolvido**: Admin — Financeiro
**APIs chave**: Conta Azul/Omie, Stripe, Banco (extrato digital), Google Drive API

### Resultado Esperado (Ponto Final)
> DRE mensal aprovado pelo CEO com: receita total, custos diretos, margem bruta, despesas operacionais, EBITDA, burn rate e runway. Pagamentos do mes em dia. Caixa projetado para proximo mes.

---

### Etapas em Ordem Reversa

#### ETAPA 7 — DRE entregue ao CEO e aprovado
- **Resultado**: CEO recebe relatorio financeiro no 1o dia util do mes seguinte
- **Responsável**: Admin — Financeiro
- **API/Ferramenta**: Conta Azul/Omie (DRE gerado) + Google Drive (PDF compartilhado) + Slack (notificacao CEO)
- **Trigger de saida**: Dia 1 do mes → N8N verifica se DRE foi gerado → envia para CEO via Slack/email
- **Gap**: Conta Azul/Omie precisam ter todas as lancamentos do mes anterior concluidos antes de gerar DRE. Data de corte precisa ser definida (ultimo dia util do mes anterior).

#### ETAPA 6 — Conciliacao bancaria completa
- **Resultado**: Todos os recebimentos e pagamentos do mes conciliados com extrato bancario
- **Responsável**: Admin — Financeiro
- **API/Ferramenta**: Conta Azul/Omie (conciliacao) + Banco extrato digital (OFX/CSV)
- **Trigger de saida**: Ultimo dia util do mes → Financeiro baixa extrato → concilia lancamentos no Conta Azul/Omie
- **Gap**: Extrato bancario precisa ser baixado manualmente (OFX). Bancos com API aberta (Inter, Nubank PJ) podem automatizar isso.

#### ETAPA 5 — Inadimplencia monitorada e acoes tomadas
- **Resultado**: Clientes com pagamento vencido > 30 dias identificados, cobrados, ou encaminhados para CS
- **Responsável**: Admin — Financeiro
- **API/Ferramenta**: Stripe (status de pagamentos) + Conta Azul/Omie (contas a receber) + CRM (contato com cliente)
- **Trigger de saida**: Stripe detecta falha de pagamento → N8N → alerta Financeiro + dispara email automatico de cobranca
- **Gap**: Stripe falha no pagamento recorrente (cartao vencido, limite) e nao ha dunning automatico configurado. Cliente inadimplente fica ativo no produto sem pagamento.

#### ETAPA 4 — Projecao de caixa do mes seguinte
- **Resultado**: Projecao de entradas (MRR projetado) e saidas (contas a pagar) para o mes seguinte com alertas de risco
- **Responsável**: Admin — Financeiro
- **API/Ferramenta**: Conta Azul/Omie + Stripe (MRR projetado) + Sheets
- **Trigger de saida**: Semana 3 do mes → Financeiro gera projecao → se runway < 60 dias, alerta Head Admin; se < 30 dias, alerta CEO
- **Gap**: Projecao de MRR depende de saber o churn esperado. Esse dado precisa vir do CS (clientes em risco de cancelamento).

#### ETAPA 3 — Pagamentos do mes executados
- **Resultado**: Todos os fornecedores, salarios e obrigacoes do mes pagos no prazo
- **Responsável**: Admin — Financeiro
- **API/Ferramenta**: Conta Azul/Omie (contas a pagar) + Banco (transferencias)
- **Trigger de saida**: Calendário de vencimentos → 3 dias antes, N8N alerta Financeiro → Financeiro processa pagamento apos aprovacao do Head Admin
- **Gap**: Aprovacao de pagamentos nao tem fluxo digital. Head Admin aprova verbalmente ou por mensagem. Precisa de registro formal (Slack com confirmacao ou aprovacao no Conta Azul).

#### ETAPA 2 — Receitas do mes conciliadas
- **Resultado**: Todos os recebimentos do mes cadastrados no Conta Azul/Omie (assinaturas Stripe + vendas Hotmart)
- **Responsável**: Admin — Financeiro
- **API/Ferramenta**: Stripe (webhook receitas) + Hotmart/Eduzz (relatorio de vendas) + Conta Azul/Omie
- **Trigger de saida**: Diario → N8N sincroniza Stripe com Conta Azul automaticamente
- **Gap**: Hotmart nao tem integracao nativa com Conta Azul. Lancamentos de vendas de infoprodutos sao manuais.

#### ETAPA 1 — Demandas de pagamento recebidas dos squads
- **Resultado**: Todos os squads enviaram pedidos de pagamento com nota/comprovante no mes
- **Responsável**: Qualquer squad → Admin Financeiro
- **API/Ferramenta**: ClickUp (task de solicitacao de pagamento) + Google Drive (anexo da nota fiscal)
- **Trigger de saida**: Squad cria task no ClickUp com tag "pagamento" + anexa NF → Financeiro recebe notificacao
- **Gap**: Nao ha formulario padrao de solicitacao de pagamento. Squads enviam pedidos por Slack, email e WhatsApp de forma desestruturada.

---

### Fluxo Resumido

```
Dia 1 do mes:
   Calendário de vencimentos atualizado no Conta Azul
   Stripe → sincronizacao automatica de receitas (N8N)
        |
Semana 1-3:
   Squads enviam pedidos de pagamento (ClickUp form)
   Contas a pagar processadas (Head aprova → Financeiro executa)
   Inadimplencia monitorada (Stripe webhooks)
        |
Semana 3:
   Projecao de caixa do mes seguinte
   Alertas de risco enviados se necessario
        |
Ultimo dia util:
   Extrato bancario baixado
   Conciliacao bancaria completa no Conta Azul/Omie
        |
Dia 1 do mes seguinte:
   DRE gerado e enviado para CEO
```

---

### Quality Gate — Fluxo 5 esta pronto quando:

- [ ] Stripe webhook → Conta Azul/Omie sincronizando receitas diariamente via N8N
- [ ] Dunning automatico configurado no Stripe (retry de cobranca em D+1, D+3, D+7)
- [ ] Formulario padrao de solicitacao de pagamento no ClickUp (campo: valor, fornecedor, vencimento, NF anexa)
- [ ] Alertas automaticos de caixa: < 60 dias runway → Head Admin; < 30 dias → CEO
- [ ] DRE gerado automaticamente pelo Conta Azul/Omie no 1o dia util
- [ ] Calendario de vencimentos do mes publicado no ClickUp na primeira semana

---

## FLUXO 6: Contratação de Pessoa

**Squad envolvido**: Admin — RH/People + squad solicitante
**APIs chave**: Gupy, LinkedIn, DocuSign/PandaDoc, Google Drive API, Google Admin

### Resultado Esperado (Ponto Final)
> Colaborador integrado: acesso a todos os sistemas configurado, apresentacao cultural feita, primeira semana completa, NPS de onboarding registrado no D30.

---

### Etapas em Ordem Reversa

#### ETAPA 9 — NPS de onboarding coletado (D30)
- **Resultado**: Colaborador responde pesquisa de onboarding, feedback documentado
- **Responsável**: Admin — RH/People
- **API/Ferramenta**: Typeform (pesquisa NPS) → Sheets/Notion (resultado registrado)
- **Trigger de saida**: D30 apos contratacao → N8N dispara Typeform automaticamente → resultado chega para RH
- **Gap**: Sem automacao de disparo, o D30 e esquecido. Hoje depende de lembrar manualmente.

#### ETAPA 8 — Onboarding interno completo (Semana 1)
- **Resultado**: Colaborador com todos os acessos, conhece a cultura, teve reuniao com CEO e Head do squad
- **Responsável**: Admin — RH/People + Head do squad
- **API/Ferramenta**: Google Admin (email) + Slack (convite) + ClickUp (workspace) + 1Password (senhas)
- **Trigger de saida**: Contratacao assinada → RH cria checklist de onboarding no ClickUp → tasks para cada area (Google Admin, Slack, ClickUp, senhas)
- **Gap**: Provisao de acesso e manual e pode demorar dias. Novo colaborador pode entrar sem ter acesso as ferramentas do dia 1.

#### ETAPA 7 — Contrato assinado + documentacao trabalhista coletada
- **Resultado**: Contrato de trabalho assinado digitalmente, documentos do colaborador coletados
- **Responsável**: Admin — RH/People
- **API/Ferramenta**: DocuSign/PandaDoc (contrato digital) + Google Drive (documentos)
- **Trigger de saida**: Proposta aceita verbalmente → RH envia contrato via DocuSign → colaborador assina → RH confirma e avanca para onboarding
- **Gap**: Template de contrato de trabalho precisa ser padronizado e configurado no DocuSign com campos automaticos (nome, cargo, salario, inicio).

#### ETAPA 6 — Proposta formalizada e aceita
- **Resultado**: Candidato recebe proposta formal com cargo, salario, beneficios e data de inicio
- **Responsável**: Admin — RH/People
- **API/Ferramenta**: Email + Notion (template de proposta)
- **Trigger de saida**: Head + CEO aprovam candidato → RH envia proposta em < 24h
- **Gap**: Prazo de aprovacao entre Head + CEO pode ser longo (agenda cheia). Candidato bom pode ser perdido para concorrente.

#### ETAPA 5 — Decisao de contratacao (Head + CEO)
- **Resultado**: Candidato aprovado ou reprovado com justificativa
- **Responsável**: Squad Head + CEO
- **API/Ferramenta**: Notion (avaliacao das entrevistas) + Slack (decisao comunicada)
- **Trigger de saida**: Entrevista tecnica concluida → RH pede decisao em 24h → Head + CEO decidem
- **Gap**: Decisao sem prazo definido causa candidatos parados em espera por dias. Meta: decisao em < 48h apos ultima entrevista.

#### ETAPA 4 — Entrevistas realizadas
- **Resultado**: Entrevista 1 (RH — cultura) e Entrevista 2 (Squad — tecnica) realizadas
- **Responsável**: RH/People (E1) + Squad Head (E2)
- **API/Ferramenta**: Calendly (agendamento) + Zoom/Google Meet (entrevista) + Notion (scorecard de avaliacao)
- **Trigger de saida**: Candidato aprovado na triagem → Calendly enviado automaticamente para E1 (N8N)
- **Gap**: Nao ha scorecard padrao de avaliacao. Cada entrevistador avalia com criterios proprios.

#### ETAPA 3 — Triagem inicial feita pelo RH
- **Resultado**: Candidatos que passam no filtro basico (fit cultural + requisitos minimos) identificados
- **Responsável**: Admin — RH/People
- **API/Ferramenta**: Gupy (candidaturas centralizadas) + Notion (criterios de triagem)
- **Trigger de saida**: Candidato se inscreve no Gupy → RH faz triagem em < 48h → aprovados recebem Calendly para E1
- **Gap**: Criterios de triagem nao estao documentados. RH usa percepcao propria, sem rubrica definida pela vaga.

#### ETAPA 2 — Vaga publicada
- **Resultado**: Vaga no ar no Gupy e LinkedIn com descricao clara e requisitos definidos
- **Responsável**: Admin — RH/People
- **API/Ferramenta**: Gupy (ATS) + LinkedIn (publicacao de vaga)
- **Trigger de saida**: Job description aprovado pelo Head → RH publica no Gupy + LinkedIn em < 24h
- **Gap**: Nao ha template de job description padrao por funcao. Cada vaga e escrita do zero.

#### ETAPA 1 — Demanda de contratacao
- **Resultado**: Squad solicita nova contratacao com: funcao, senioridade, responsabilidades, budget aprovado
- **Responsável**: Head do squad solicitante
- **API/Ferramenta**: ClickUp (task de abertura de vaga) + Notion (template de job description)
- **Trigger de saida**: Head preenche template de job description → submete para CEO aprovar budget → RH recebe aprovacao para publicar
- **Gap**: Budget de novas contratacoes raramente esta pre-aprovado. Abre vaga → espera aprovacao de budget → demora semanas. Processo ideal: budget anual aprovado por squad.

---

### Fluxo Resumido

```
Head do squad preenche job description (Notion template)
        |
        v (CEO aprova budget)
   RH publica vaga (Gupy + LinkedIn)
        |
        v (candidaturas chegam no Gupy)
   RH triagem inicial (< 48h)
        |
        v (aprovados na triagem)
   Calendly enviado para E1 (N8N automatico)
        |
        v (E1 — cultura com RH)
   Aprovado → Calendly E2 enviado para Head do squad
        |
        v (E2 — entrevista tecnica com Squad)
   Head + CEO decidem (< 48h)
        |
        v (aprovado)
   RH envia proposta (< 24h)
        |
        v (aceita)
   DocuSign — contrato enviado
        |
        v (assinado)
   Checklist onboarding criado no ClickUp
   Google Admin + Slack + ClickUp + 1Password configurados
        |
        v (Dia 1 do colaborador)
   Onboarding interno (semana 1)
        |
        v (D30)
   Typeform NPS disparado automaticamente
```

---

### Quality Gate — Fluxo 6 esta pronto quando:

- [ ] Template de job description padrao por tipo de funcao no Notion
- [ ] Gupy configurado e integrado com LinkedIn para publicacao automatica
- [ ] Criterios de triagem documentados por vaga (rubrica de aprovacao)
- [ ] Scorecard de entrevista padronizado no Notion
- [ ] DocuSign configurado com template de contrato (campos automaticos por cargo)
- [ ] Checklist de onboarding no ClickUp com tasks para Google Admin, Slack, ClickUp, 1Password
- [ ] N8N dispara Typeform NPS no D30 automaticamente
- [ ] SLA definido: triagem < 48h, decisao < 48h, proposta < 24h, total do processo < 21 dias

---

## FLUXO 7: Automação de Processo

**Squad envolvido**: OPS (Process Mapper → Architect → Automation Architect → QA)
**APIs chave**: N8N, ClickUp API, Slack API, Google Drive API

### Resultado Esperado (Ponto Final)
> Processo automatizado rodando em producao sem intervencao manual, com monitoramento ativo e plano de rollback documentado.

---

### Etapas em Ordem Reversa

#### ETAPA 8 — Monitoramento em producao
- **Resultado**: Workflow N8N monitorado com alertas de falha, logs acessiveis, rollback testado
- **Responsável**: OPS — QA
- **API/Ferramenta**: N8N (execucoes + logs) + Slack (alertas de erro via webhook N8N)
- **Trigger de saida**: Alertas de erro N8N → Slack channel #ops-alertas → QA investiga e aciona Automation Architect se necessario
- **Gap**: N8N nao tem alertas nativos sofisticados. Precisa de webhook de erro configurado em cada workflow para notificar Slack.

#### ETAPA 7 — Deploy em producao aprovado (QG4)
- **Resultado**: Workflow aprovado pelo QA em staging → promovido para producao
- **Responsável**: OPS — QA → Automation Architect
- **API/Ferramenta**: N8N (import/export de workflow JSON) + ClickUp (task fechada)
- **Trigger de saida**: QA assina checklist de QG4 → Automation Architect exporta JSON do staging → importa em producao → ativa workflow
- **Gap**: N8N nao tem ambiente staging separado por padrao. Requer instancias N8N distintas (producao vs. staging) ou workflow versionado manualmente.

#### ETAPA 6 — Testes em staging (QG3)
- **Resultado**: Workflow testado com dados reais em ambiente de teste, todos os caminhos (sucesso + erro) validados
- **Responsável**: OPS — QA
- **API/Ferramenta**: N8N staging + APIs em modo sandbox (Stripe test mode, etc.)
- **Trigger de saida**: Automation Architect entrega workflow em staging → QA executa checklist de teste → PASS ou FAIL com feedback especifico
- **Gap**: APIs externas podem nao ter ambiente sandbox (ex: WhatsApp Business em producao). Testes precisam de estrategia de mock para esses casos.

#### ETAPA 5 — Workflow N8N construido (QG2)
- **Resultado**: Workflow funcional no N8N com todos os nos conectados, credenciais configuradas, tratamento de erro implementado
- **Responsável**: OPS — Automation Architect
- **API/Ferramenta**: N8N (nodes: Webhook, HTTP Request, If, Set, Switch) + credenciais das APIs envolvidas
- **Trigger de saida**: Workflow entregue para QA com documentacao de: trigger, fluxo principal, fluxo de erro, variaveis
- **Gap**: Credenciais de APIs precisam ser gerenciadas centralmente (N8N Credentials). Nao guardar tokens direto nos workflows.

#### ETAPA 4 — Arquitetura do workflow definida (QG1)
- **Resultado**: Diagrama do workflow com: trigger, nos, decisoes, APIs, tratamento de erros, SLAs
- **Responsável**: OPS — Architect
- **API/Ferramenta**: Miro (diagrama) + Notion (documentacao tecnica)
- **Trigger de saida**: Arquitetura aprovada pelo OPS Chief → Automation Architect comeca a construir no N8N
- **Gap**: Sem aprovacao formal da arquitetura, Automation Architect pode construir algo que nao reflete o processo real mapeado.

#### ETAPA 3 — Processo documentado e validado pelos stakeholders
- **Resultado**: Documento de processo atual + fluxo novo desenhado, validado pelo squad responsavel
- **Responsável**: OPS — Process Mapper
- **API/Ferramenta**: Notion (documento) + Miro (fluxograma) + Loom (gravacao do processo)
- **Trigger de saida**: Squad responsavel valida o mapeamento → Process Mapper assina entrega → passa para Architect
- **Gap**: Validacao pelos stakeholders pode demorar se nao houver prazo definido. Define: 48h para feedback, sem feedback = aprovado.

#### ETAPA 2 — Discovery do processo
- **Resultado**: Processo atual compreendido em todas as etapas, handoffs, ferramentas, excecoes e gargalos
- **Responsável**: OPS — Process Mapper
- **API/Ferramenta**: Loom (gravacao do processo sendo executado) + Notion (notas de discovery)
- **Trigger de saida**: Process Mapper conclui discovery e documenta processo atual completo
- **Gap**: Squads resistem a mostrar o processo "real" (o bagunçado) e mostram o processo "ideal" (que nao existe). Precisa insistir em ver o processo sendo feito ao vivo.

#### ETAPA 1 — Demanda de automacao recebida
- **Resultado**: Pedido de automacao com: processo a automatizar, problema que resolve, squad solicitante, urgencia
- **Responsável**: Qualquer squad → OPS Chief
- **API/Ferramenta**: ClickUp (task de pedido de automacao) + template de solicitacao
- **Trigger de saida**: Squad preenche template de solicitacao → OPS Chief prioriza → Process Mapper inicia discovery
- **Gap**: Demandas de automacao chegam ad hoc por Slack/verbal. Nao ha fila priorizada de demandas de automacao.

---

### Fluxo Resumido

```
Squad preenche template de solicitacao (ClickUp)
        |
        v (OPS Chief prioriza)
   Process Mapper — discovery (Loom + Notion)
        |
        v (processo documentado + validado)
   QG1: Architect define arquitetura (Miro + Notion)
        |
        v (arquitetura aprovada — QG1 >= 70%)
   Automation Architect — build no N8N
        |
        v (workflow entregue para QA — QG2 >= 70%)
   QG3: QA testa em staging (todos os caminhos)
        |
        v (aprovado — QG3 >= 70%)
   Deploy em producao (Automation Architect)
        |
        v (QG4 — aprovacao final >= 70%)
   Monitoramento ativo: alertas Slack via N8N webhook
```

---

### Quality Gate — Fluxo 7 esta pronto quando:

- [ ] Template de solicitacao de automacao criado no ClickUp
- [ ] Fila de demandas priorizada e visivel para todos os squads
- [ ] Template de documentacao de processo padronizado no Notion
- [ ] N8N staging separado do N8N producao (instancias distintas ou namespaces)
- [ ] Alertas de erro configurados em todos os workflows de producao (webhook → Slack #ops-alertas)
- [ ] Checklist de QA para workflows N8N criado (cobrindo: todos os caminhos, tratamento de erro, SLA, rollback)
- [ ] Credenciais de APIs centralizadas no N8N Credentials (nunca hardcoded nos nodes)

---

## MAPA DE HANDOFFS GLOBAIS

Pontos onde um squad entrega para outro. Cada handoff e um risco de quebra.

```
MARKETING
   |
   |--[MQL entregue via CRM]--> VENDAS (SDR)
   |--[Briefing de lancamento recebido de]--> PRODUCTS (PM)
   |--[Relatorio de lancamento entrega para]--> PRODUCTS (PM)

VENDAS
   |--[Cliente fechado (CRM Won + Stripe)]--> CS (Onboarding Specialist)
   |--[Lead frio (score < 60) volta para]--> MARKETING (nurture)

CS
   |--[Cliente ativado + briefing de contexto]--> CS RETENCAO
   |--[Feedback de clientes (necessidades)]--> PRODUCTS (PM) [GAP: hoje nao estruturado]
   |--[Inadimplencia > 30 dias escalona para]--> ADMIN FINANCEIRO

PRODUCTS
   |--[Briefing de lancamento entrega para]--> MARKETING + VENDAS
   |--[Produto publicado (Hotmart/Eduzz)]--> CS (para suporte)

ADMIN FINANCEIRO
   |--[DRE mensal entrega para]--> CEO
   |--[Budget aprovado por squad entrega para]--> Todos os squads
   |--[Alerta de caixa critico entrega para]--> CEO + Admin Chief

ADMIN RH
   |--[Colaborador integrado entrega para]--> Squad solicitante
   |--[Pedido de vaga recebe de]--> Qualquer squad Head

OPS
   |--[Processo documentado entrega para]--> Architect → Automation Architect
   |--[Automacao em producao entrega para]--> Squad que solicitou
   |--[Demanda recebe de]--> Qualquer squad
```

### Handoffs de Alto Risco (onde o processo mais trava hoje)

| Handoff | Risco | Solucao |
|---------|-------|---------|
| RD Station → CRM | Lead nao chega para SDR | Webhook ou integracao nativa confirmada |
| Stripe → CS (boas-vindas) | Cliente paga, nao recebe acesso | Webhook Stripe → N8N → CS (< 30 min) |
| Vendas → CS (cliente fechado) | CS nao sabe que cliente foi fechado | CRM status "Won" → N8N notifica CS |
| CS → Products (feedback) | Necessidades de clientes nao viram produto | Canal estruturado: tag no CRM + report mensal |
| Squads → Admin Financeiro (pagamentos) | Pedidos informais por Slack | Formulario padrao no ClickUp obrigatorio |
| RH → Squads (colaborador integrado) | Acesso nao configurado no D1 | Checklist automatizado no ClickUp |

---

## GAPS CRÍTICOS CONSOLIDADOS

Ordenados por impacto no negocio (maior impacto primeiro).

### GAP-01 — Dunning automatico no Stripe nao configurado
**Impacto**: Churn involuntario (cliente que quer continuar mas cartao falhou)
**Processo afetado**: Fluxo 1, Fluxo 5
**Solucao**: Ativar Smart Retries no Stripe + configurar emails de dunning automaticos
**Responsavel para resolver**: Admin Financeiro + OPS Automation Architect
**Urgencia**: CRITICA

### GAP-02 — Sem sincronizacao RD Station → CRM
**Impacto**: MQLs ficam presos no email marketing e nao chegam para o SDR
**Processo afetado**: Fluxo 1
**Solucao**: Webhook nativo RD Station → Pipedrive/HubSpot ou N8N como middleware
**Responsavel para resolver**: OPS Automation Architect
**Urgencia**: CRITICA

### GAP-03 — SPFP nao emite eventos de produto para CRM/Intercom
**Impacto**: CS nao sabe quais clientes estao usando o produto de verdade (ativacao invisivel)
**Processo afetado**: Fluxo 3
**Solucao**: Instrumentar SPFP com eventos: account_created, transaction_added, session_opened → Intercom via SDK
**Responsavel para resolver**: OPS Architect + Dev
**Urgencia**: CRITICA

### GAP-04 — Feedback de CS nao chega estruturado para Products
**Impacto**: Produto construido sem input real dos clientes atuais
**Processo afetado**: Fluxo 4
**Solucao**: Tag padrao no CRM para feedback de produto + report mensal CS → PM
**Responsavel para resolver**: CS Chief + Products Chief + OPS Process Mapper
**Urgencia**: ALTA

### GAP-05 — Pedidos de pagamento chegam de forma desestruturada
**Impacto**: Financeiro perde pedidos, pagamentos atrasam, fornecedores insatisfeitos
**Processo afetado**: Fluxo 5
**Solucao**: Formulario obrigatorio no ClickUp com campos: valor, fornecedor, vencimento, NF
**Responsavel para resolver**: OPS + Admin Chief
**Urgencia**: ALTA

### GAP-06 — Lead scoring e manual no SDR
**Impacto**: SDR perde tempo em leads frios, leads quentes chegam tarde
**Processo afetado**: Fluxo 1
**Solucao**: Regras automaticas de scoring no N8N usando dados de CRM + RD Station
**Responsavel para resolver**: OPS Automation Architect + Vendas SDR
**Urgencia**: ALTA

### GAP-07 — Sequencia de contato do SDR e manual
**Impacto**: Contato irregular, leads esfriando sem follow-up consistente
**Processo afetado**: Fluxo 1
**Solucao**: Sequencia D0→D1→D2→D3→D7 configurada no N8N (email + WhatsApp)
**Responsavel para resolver**: OPS Automation Architect + Vendas Chief
**Urgencia**: ALTA

### GAP-08 — Onboarding de cliente e manual (sem automacao)
**Impacto**: Qualidade do onboarding depende do especialista de plantao, nao do processo
**Processo afetado**: Fluxo 3
**Solucao**: Sequencia D0→D1→D3→D5→D7 no N8N com WhatsApp + email + verificacao de ativacao
**Responsavel para resolver**: OPS Automation Architect + CS Chief
**Urgencia**: ALTA

### GAP-09 — Calendario editorial de conteudo nao existe
**Impacto**: Conteudo reativo, sem consistencia, sem planejamento de campanha
**Processo afetado**: Fluxo 2
**Solucao**: Calendario editorial mensal no Notion, criado toda ultima semana do mes anterior
**Responsavel para resolver**: Marketing Chief
**Urgencia**: MEDIA

### GAP-10 — Templates de arte no Canva nao padronizados
**Impacto**: Toda peca criada do zero, tempo desperdicado, inconsistencia visual
**Processo afetado**: Fluxo 2, Fluxo 4
**Solucao**: Kit de templates Canva: feed 1:1, carrossel (10 slides), story, reels thumbnail, email header
**Responsavel para resolver**: Marketing — Content Manager + Canva API
**Urgencia**: MEDIA

### GAP-11 — N8N nao tem ambiente staging
**Impacto**: Testes feitos em producao, risco de disparo de emails/WhatsApp para clientes reais
**Processo afetado**: Fluxo 7
**Solucao**: Instancia N8N staging separada (Docker ou n8n.cloud second instance)
**Responsavel para resolver**: OPS Automation Architect
**Urgencia**: MEDIA

### GAP-12 — Provisao de acesso para novo colaborador e manual e lenta
**Impacto**: Colaborador entra sem acesso, primeiros dias improdutivos, experiencia ruim
**Processo afetado**: Fluxo 6
**Solucao**: Checklist automatizado no ClickUp com tasks para Google Admin, Slack, ClickUp, 1Password
**Responsavel para resolver**: Admin RH + OPS
**Urgencia**: MEDIA

---

## PROXIMOS PASSOS RECOMENDADOS

### Sprint 1 — Gaps Criticos (Semana 1-2)
1. **GAP-01**: Ativar dunning no Stripe (< 1h de configuracao)
2. **GAP-02**: Configurar webhook RD Station → CRM via N8N
3. **GAP-05**: Criar formulario de solicitacao de pagamento no ClickUp

### Sprint 2 — Automacoes de Receita (Semana 3-4)
4. **GAP-07**: Configurar sequencia de contato SDR no N8N (email + WhatsApp)
5. **GAP-06**: Implementar lead scoring automatico no N8N
6. **GAP-08**: Configurar sequencia de onboarding de cliente no N8N

### Sprint 3 — Visibilidade e Instrumentacao (Semana 5-6)
7. **GAP-03**: Instrumentar SPFP com eventos de produto → Intercom
8. **GAP-04**: Criar canal estruturado de feedback CS → Products

### Sprint 4 — Qualidade e Consistencia (Semana 7-8)
9. **GAP-09**: Criar calendario editorial e processo de planejamento de conteudo
10. **GAP-10**: Criar kit de templates Canva padronizados
11. **GAP-11**: Configurar N8N staging
12. **GAP-12**: Automatizar checklist de onboarding interno (ClickUp)

---

*Documento gerado por: Process Mapper — Squad OPS SPFP*
*Clone cognitivo: Pedro Valerio*
*Metodologia: Mapeamento reverso (fim → começo)*
*Proxima acao: Automation Architect recebe este documento para priorizar configuracao do N8N*
