# ClickUp Architecture — SPFP Empresa
**Arquiteto:** Pedro Valerio (OPS Architect)
**Data:** 2026-03-10
**Status:** Pronto para implementação

> "A ferramenta deve refletir o processo — não o processo se adaptar à ferramenta."

---

## TASK 1: design-architecture

### Hierarquia no ClickUp

```
WORKSPACE: Synkra / SPFP
└── SPACE: 🏢 SPFP Empresa
    ├── 📁 Marketing
    ├── 📁 Vendas
    ├── 📁 CS (Customer Success)
    ├── 📁 Produto
    ├── 📁 OPS
    └── 📁 Admin
```

---

### 📁 FOLDER: Marketing

**Responsável do folder:** Head de Marketing (Thiago Finch)

| Lista | Propósito | Status Flow |
|-------|-----------|-------------|
| 🗓️ Calendário Editorial | Planejamento de conteúdo 90 dias | `IDEIA → BRIEFING → PRODUÇÃO → REVISÃO → APROVADO → PUBLICADO` |
| 📢 Tráfego Pago | Campanhas Meta Ads / Google Ads / TikTok | `PLANEJANDO → CRIANDO → EM_REVISÃO → ATIVA → PAUSADA → ENCERRADA` |
| 📧 Email Marketing | Sequências, campanhas, automações | `RASCUNHO → REVISÃO → APROVADO → AGENDADO → ENVIADO` |
| 🔍 Research & Intel | Concorrentes, tendências, swipe file | `COLETANDO → ANALISANDO → DOCUMENTADO` |
| 📊 Performance | Relatórios semanais e mensais | `A_GERAR → GERANDO → REVISÃO → PUBLICADO` |

**Campos personalizados da pasta Marketing:**
- `Canal` (Dropdown): Instagram / YouTube / Email / Meta Ads / Google Ads / TikTok / LinkedIn
- `Data de Publicação` (Date)
- `Aprovador` (Person)
- `Status de Aprovação` (Dropdown): Pendente / Aprovado / Reprovado
- `Formato` (Dropdown): Carrossel / Reels / Story / Post / Email / Vídeo / Blog
- `Prioridade` (Dropdown): Baixa / Média / Alta / Crítica

---

### 📁 FOLDER: Vendas

**Responsável do folder:** Head de Vendas (Alex Hormozi)

| Lista | Propósito | Status Flow |
|-------|-----------|-------------|
| 🎯 Pipeline SDR | Leads entrando e sendo qualificados | `LEAD → PRIMEIRO_CONTATO → QUALIFICANDO → SQL → PASSADO_CLOSER → PERDIDO` |
| 💰 Pipeline Closer | SQLs sendo trabalhados até fechamento | `DISCOVERY → PROPOSTA → NEGOCIAÇÃO → FECHADO_GANHO → FECHADO_PERDIDO` |
| 📈 Análise & Forecast | Relatórios e previsões comerciais | `A_GERAR → EM_ANÁLISE → REVISÃO → PUBLICADO` |

**Campos personalizados:**
- `Nome do Lead` (Text)
- `Plano de Interesse` (Dropdown): Free / Basic / Premium
- `Fonte do Lead` (Dropdown): Orgânico / Pago / Indicação / Parceria / Evento
- `Valor MRR` (Currency)
- `Próxima Ação` (Text)
- `Data Próxima Ação` (Date)
- `Motivo de Perda` (Dropdown): Preço / Concorrente / Sem interesse / Timing / Produto

---

### 📁 FOLDER: CS (Customer Success)

**Responsável do folder:** Head de CS (Lincoln Murphy)

| Lista | Propósito | Status Flow |
|-------|-----------|-------------|
| 🚀 Onboarding | Novos clientes — do fechamento ao "first value" | `NOVO → CONTATO_INICIAL → SETUP → FIRST_VALUE → ATIVO` |
| 🎫 Suporte | Tickets de dúvida, bug, reclamação | `ABERTO → TRIAGEM → EM_ATENDIMENTO → AGUARDANDO_CLIENTE → RESOLVIDO → FECHADO` |
| 💚 Retenção & Health | Clientes em risco de churn | `MONITORANDO → ALERTA → INTERVENÇÃO → REATIVADO → CHURNED` |
| 📣 NPS & Feedback | Coleta e análise de NPS | `COLETANDO → ANALISANDO → AÇÃO → FECHADO` |

**Campos personalizados:**
- `Plano do Cliente` (Dropdown): Free / Basic / Premium
- `Health Score` (Dropdown): 🟢 Verde / 🟡 Amarelo / 🔴 Vermelho
- `NPS` (Number): 0–10
- `Motivo do Ticket` (Dropdown): Bug / Dúvida / Melhoria / Reclamação / Acesso
- `Severidade` (Dropdown): Baixa / Média / Alta / Crítica
- `SLA` (Date)
- `Dias como Cliente` (Number)

---

### 📁 FOLDER: Produto

**Responsável do folder:** Head de Produto (Marty Cagan)

| Lista | Propósito | Status Flow |
|-------|-----------|-------------|
| 🔭 Discovery | Pesquisa de usuário e validação de hipóteses | `HIPÓTESE → PESQUISANDO → VALIDANDO → APROVADO → DESCARTADO` |
| 📋 Backlog | Features priorizadas aguardando sprint | `NOVO → REFINADO → PRIORIZADO → PRONTO_PARA_SPRINT` |
| 🏃 Sprint Ativo | Trabalho da sprint atual | `TODO → IN_PROGRESS → IN_REVIEW → DONE` |
| 🐛 Bugs | Bugs reportados e sendo corrigidos | `NOVO → TRIAGEM → IN_PROGRESS → IN_REVIEW → RESOLVIDO → FECHADO` |
| 🎓 Infoprodutos | Cursos e conteúdo educacional | `IDEIA → PLANEJANDO → PRODUÇÃO → REVISÃO → PUBLICADO` |

**Campos personalizados:**
- `Tipo` (Dropdown): Feature / Bug / Melhoria / Spike / Conteúdo
- `Complexidade` (Dropdown): P (1–2d) / M (3–5d) / G (1–2s) / GG (+2s)
- `Story Points` (Number)
- `Impacto no Usuário` (Dropdown): Baixo / Médio / Alto / Crítico
- `Produto` (Dropdown): SPFP SaaS / Infoproduto
- `Sprint` (Text)

---

### 📁 FOLDER: OPS

**Responsável do folder:** Head de OPS (Pedro Valerio)

| Lista | Propósito | Status Flow |
|-------|-----------|-------------|
| 🗺️ Mapeamento de Processos | Discovery e mapeamento de processos existentes | `IDENTIFICADO → MAPEANDO → REVISÃO → APROVADO → DOCUMENTADO` |
| 🏗️ Arquitetura de Processos | Design de processos novos ou redesenhados | `RASCUNHO → REVISÃO → QA_GATE → APROVADO` |
| ⚙️ Automações | Implementação de automações N8N / ClickUp | `BACKLOG → ESPECIFICANDO → DESENVOLVENDO → TESTANDO → ATIVO → PAUSADO` |
| ✅ QA de Processos | Validação de processos com score ≥ 70% | `AGUARDANDO_QA → EM_REVIEW → APROVADO → REPROVADO` |
| 📚 SOPs | Repositório de SOPs documentados | `RASCUNHO → REVISÃO → PUBLICADO → DESATUALIZADO` |

**Campos personalizados:**
- `Fase do Squad OPS` (Dropdown): Discovery / Create / Architecture / Automation / QA
- `Score QA` (Number): 0–100
- `Ferramenta de Automação` (Dropdown): ClickUp Automations / N8N / Manual
- `Processo Relacionado` (Text)
- `SLA` (Date)

---

### 📁 FOLDER: Admin

**Responsável do folder:** Head de Admin (Sheryl Sandberg)

| Lista | Propósito | Status Flow |
|-------|-----------|-------------|
| 💵 Financeiro | Contas a pagar/receber, DRE, fluxo de caixa | `PENDENTE → EM_PROCESSAMENTO → CONCLUÍDO → VENCIDO` |
| ⚖️ Jurídico & Compliance | Contratos, LGPD, compliance | `NOVO → ANÁLISE → EM_NEGOCIAÇÃO → ASSINADO → ARQUIVADO` |
| 👥 RH & People | Recrutamento, onboarding interno, people | `ABERTO → TRIAGEM → ENTREVISTANDO → OFERTADO → CONTRATADO → ARQUIVADO` |
| 🔧 Facilities & SaaS | Acessos, ferramentas, fornecedores | `SOLICITADO → EM_PROCESSO → CONCLUÍDO` |

**Campos personalizados:**
- `Valor` (Currency)
- `Vencimento` (Date)
- `Fornecedor/Empresa` (Text)
- `Categoria` (Dropdown): Receita / Despesa Fixa / Despesa Variável / Investimento
- `Status de Pagamento` (Dropdown): Pendente / Pago / Vencido / Cancelado

---

### Views Obrigatórias por Folder

Cada folder deve ter as seguintes views configuradas:

| View | Tipo | Para quem |
|------|------|-----------|
| `Kanban do Squad` | Board | Executor do squad |
| `Lista por Prioridade` | List | Head do squad |
| `Calendário` | Calendar | Head do squad |
| `Minha Semana` | List filtrado por `Assignee = eu` + `Due date = esta semana` | Cada executor |
| `SLA em Risco` | List filtrado por `Due date < hoje + 2 dias` + `Status ≠ DONE` | Head do squad |

---

## TASK 2: design-executors

### Matriz de Responsabilidades SPFP

> "Quando dois são responsáveis, ninguém é responsável."

**Regra de ouro:** cada task tem UM único accountable (quem responde se der errado), podendo ter múltiplos executors (quem faz).

#### Executores por Squad

| Squad | Head (Accountable) | Executores |
|-------|-------------------|------------|
| Marketing | Head de Marketing | Media Buyer, Content Manager, Email Strategist, Social Media Manager, Research Analyst |
| Vendas | Head de Vendas | SDR, Closer, Analista de Vendas |
| CS | Head de CS | Onboarding Specialist, Agente de Suporte, CS Retenção |
| Produto | Head de Produto | Product Manager, Content Creator (infoprodutos), QA Experience |
| OPS | Head de OPS | Process Mapper, Automation Architect, QA de Processos |
| Admin | Head de Admin | Financeiro, Jurídico, RH/People, Facilities |

#### Handoffs entre Squads (Onde o output de um vira input de outro)

```
Marketing → Vendas
  Output: Lead qualificado (MQL)
  Input: Lead para SDR trabalhar (qualificação → SQL)
  SLA handoff: SDR deve fazer primeiro contato em até 24h após receber MQL

Vendas → CS
  Output: Cliente fechado (contrato assinado)
  Input: Novo cliente para onboarding
  SLA handoff: Onboarding Specialist deve contatar em até 2h após fechamento

CS → Produto
  Output: Feedback de cliente (bug, sugestão, padrão de dor)
  Input: Item no backlog de produto
  SLA handoff: Product Manager deve triagem em até 48h

Produto → OPS
  Output: Feature/processo aprovado para deploy
  Input: Checklist de deploy + SOP de operação
  SLA handoff: OPS garante processo documentado antes do deploy

OPS → Todos
  Output: SOP aprovado (score QA ≥ 70%)
  Input: Processo a ser operado pelo squad
  SLA handoff: Publicação do SOP no ClickUp antes do processo entrar em produção
```

#### Escalation Paths

| Situação | Escala para | SLA de Resposta |
|----------|------------|-----------------|
| Bug crítico em produção | Head de Produto + Head de OPS | 30 min |
| Suporte N2 sem resolução | Head de CS | 4h |
| Campanha sem entrega (Meta/Google) | Head de Marketing | 2h |
| Deal acima de R$ 5.000 emperrado | Head de Vendas | 24h |
| Falha de automação crítica | Head de OPS + Automation Architect | 1h |
| Processo sem SOP em área crítica | Head de OPS | 48h |
| Questão jurídica urgente | Head de Admin + Jurídico | 24h |

---

## TASK 3: create-task-defs

### Definições de Tasks Críticas

> Formato: Input → Output → Executor → SLA → Critério de Aceite → Veto Condition → Exemplo de Done

---

#### MARKETING — Conteúdo

**Task: Criar Peça de Conteúdo**
```
Input:    Briefing aprovado na lista Calendário Editorial (campos obrigatórios preenchidos:
          tema, formato, canal, data de publicação, objetivo, referências)
Output:   Arquivo publicado ou agendado na plataforma correta, com link registrado na task
Executor: Content Manager (executa) / Head de Marketing (aprova)
SLA:      Entrega de rascunho: D-5 da data de publicação
          Revisão: D-3
          Aprovação final: D-2
          Agendamento: D-1
Critério: Formato correto para o canal, CTA presente, link de aprovação registrado,
          status movido para APROVADO antes de publicar
Veto:     Sem briefing completo → task não entra em PRODUÇÃO
          Sem aprovação do Head → task não vai para PUBLICADO
Exemplo:  Carrossel Instagram "5 erros financeiros" — rascunho entregue em D-5,
          revisado em D-3, aprovado em D-2, agendado no Creator Studio em D-1,
          publicado na data com link registrado na task.
```

---

**Task: Ativar Campanha de Tráfego Pago**
```
Input:    Brief de campanha aprovado (objetivo, orçamento diário, público, creative aprovado,
          UTMs definidas, pixel configurado)
Output:   Campanha ativa com relatório D+3 (CPL, CTR, conversões)
Executor: Media Buyer (executa) / Head de Marketing (aprova orçamento)
SLA:      Setup e ativação: até 24h após aprovação do brief
          Primeiro relatório: D+3 da ativação
Critério: Pixel disparando corretamente, UTM rastreando, criativo no formato certo,
          orçamento configurado, link de aprovação do Head registrado
Veto:     Sem pixel configurado → campanha não ativa
          Sem UTM → campanha não ativa (perde rastreamento)
Exemplo:  Campanha Lead Magnet "Planilha Financeira" — setup em 18h, pixel validado no
          Meta Events Manager, UTM registrada, ativa D+0, relatório entregue D+3
          com CPL de R$ 8,40 e 47 leads.
```

---

#### VENDAS — Pipeline

**Task: Qualificar Lead (SDR)**
```
Input:    Lead chegando do Marketing (MQL) — nome, email, telefone, fonte
Output:   SQL documentado com: cargo, empresa (se B2B), dor principal identificada,
          plano de interesse, disponibilidade confirmada para discovery call
Executor: SDR
SLA:      Primeiro contato: até 24h após receber MQL
          Qualificação completa: até 5 dias úteis do primeiro contato
Critério: 4 campos obrigatórios preenchidos (cargo/contexto, dor, plano, disponibilidade)
          Status movido para SQL, task atribuída ao Closer
Veto:     Lead sem telefone ou email válido → registrar como PERDIDO com motivo
          Lead que não atende em 3 tentativas → PERDIDO (sem urgência)
Exemplo:  Lead "João Silva" chegou via Instagram Ads. Primeiro contato em 6h via WhatsApp.
          Em 3 dias: confirmou dor (não sabe quanto gasta por categoria), interesse no plano
          Premium, agendou discovery para quinta. Status → SQL, passado para Closer.
```

---

**Task: Discovery Call (Closer)**
```
Input:    SQL com todos os campos preenchidos pelo SDR, discovery agendado
Output:   Proposta enviada OU deal marcado como PERDIDO com motivo documentado
Executor: Closer
SLA:      Discovery realizado na data agendada
          Proposta enviada em até 24h após discovery
Critério: Notas da call preenchidas (dores, objeções, budget, prazo de decisão),
          próximo passo claro agendado, proposta personalizada (não genérica)
Veto:     Discovery sem notas → não avança para PROPOSTA
          Proposta enviada sem personalização → não avança
Exemplo:  Call com João Silva (45min). Dor principal: não sabe onde vai o salário. Budget:
          até R$ 50/mês. Prazo: quer resolver "agora". Proposta Premium enviada em 18h
          com ROI calculado e case de usuário similar. Status → NEGOCIAÇÃO.
```

---

#### CS — Suporte

**Task: Resolver Ticket de Suporte**
```
Input:    Ticket aberto pelo cliente (canal: app, email, WhatsApp) com descrição do problema
Output:   Problema resolvido e confirmado pelo cliente, ticket fechado
Executor: Agente de Suporte (N1) → Head de CS (N2) → Head de Produto (N3/Bug crítico)
SLA:      N1 (Dúvida): 4h úteis
          N2 (Bug moderado): 24h úteis
          N3 (Bug crítico/dado sensível): 2h corridas
Critério: Cliente confirmou resolução, causa raiz documentada na task,
          se for bug: issue criado no backlog de produto com link
Veto:     Ticket não fecha sem confirmação do cliente
          Bug crítico não fecha sem postmortem registrado
Exemplo:  Cliente reportou "gráfico de transações não carrega". Triagem: bug N2.
          Reproduzido em 1h, causa identificada (filtro de data quebrado),
          workaround enviado ao cliente em 3h, issue criado no backlog, cliente
          confirmou que o workaround funciona, ticket fechado em D+1.
```

---

#### PRODUTO — Sprint

**Task: Desenvolver Feature (Sprint)**
```
Input:    Story refinada e priorizada no backlog com: descrição completa, critérios de aceite,
          mockup/wireframe (se UI), story points estimados
Output:   Feature em produção, funcionando, testada e comunicada (se visível ao usuário)
Executor: Dev (implementa) / QA Experience (valida) / Head de Produto (aceita)
SLA:      Desenvolvimento: conforme story points da sprint
          Code review: até 24h após PR aberto
          QA: até 24h após deploy em staging
          Comunicação ao usuário: até 48h após deploy em produção
Critério: Todos os critérios de aceite da story atendidos, testes passando,
          sem regressão em funcionalidades existentes, documentação atualizada se necessário
Veto:     Story sem critérios de aceite → não entra em desenvolvimento
          Testes falhando → não vai para produção
          Bug crítico em staging → bloqueado até resolução
Exemplo:  Story "Gráfico de gastos por categoria com drill-down" — 5 pontos.
          Dev entregou em 3 dias, PR revisado em 20h, QA validou em 18h (2 ajustes menores),
          deploy em produção, comunicado via in-app message para usuários Premium.
```

---

#### OPS — Processos

**Task: Documentar SOP**
```
Input:    Processo mapeado e aprovado pelo Process Mapper (fluxograma + gaps identificados)
Output:   SOP publicado no ClickUp (lista SOPs), passado no QA Gate com score ≥ 70%,
          time notificado e treinado
Executor: Architect (OPS) — escreve o SOP; QA (OPS) — valida score
SLA:      Rascunho do SOP: até 5 dias úteis do fluxograma aprovado
          QA Gate: até 3 dias úteis do rascunho
Critério: SOP auto-executável (qualquer pessoa do time consegue seguir sem perguntar),
          input/output/responsável/SLA/escalation documentados, score QA ≥ 70%
Veto:     SOP sem responsável definido → reprovado no QA Gate
          SOP sem escalation path → reprovado no QA Gate
          Score < 70% → volta para revisão com feedback específico
Exemplo:  SOP "Onboarding de Novo Cliente" — rascunho entregue em D+4, QA Gate em D+7
          (score 78/100), duas correções no escalation path, aprovado em D+9,
          publicado e time de CS treinado em D+11.
```

---

## Configuração de Automações Nativas (ClickUp Automations)

Estas são simples o suficiente para rodar dentro do ClickUp sem N8N:

| Trigger | Ação | Folder |
|---------|------|--------|
| Status → PUBLICADO | Notificar Head de Marketing no Slack | Marketing |
| Status → SQL | Atribuir task para Closer, notificar | Vendas |
| Status → FECHADO_GANHO | Criar task de Onboarding no CS com dados do cliente | Vendas → CS |
| Status → IN_REVIEW | Notificar aprovador definido no campo `Aprovador` | Produto |
| Due Date < hoje e Status ≠ DONE | Notificar assignee + Head do squad | Todos |
| Status → NOVO (Suporte) | Atribuir para Agente de Suporte disponível | CS |
| Score QA < 70 | Mover para status REPROVADO + comentário automático | OPS |

> **Automações com integração externa (N8N):** ver lista separada com @automation-architect

---

## Checklist de Implementação

Sequência obrigatória — não pular etapa, não executar em paralelo:

- [ ] 1. Criar Space "SPFP Empresa" no workspace
- [ ] 2. Criar os 6 folders (Marketing, Vendas, CS, Produto, OPS, Admin)
- [ ] 3. Criar as listas dentro de cada folder conforme arquitetura acima
- [ ] 4. Configurar status flows por lista
- [ ] 5. Configurar campos personalizados por folder
- [ ] 6. Criar templates de tasks para os processos críticos
- [ ] 7. Configurar views obrigatórias em cada folder
- [ ] 8. Configurar automações nativas listadas acima
- [ ] 9. Convidar membros do time e atribuir roles
- [ ] 10. Importar tasks existentes do Marketing (82 tasks dos 3 boards antigos)
- [ ] 11. QA Gate: testar fluxo completo de uma task em cada squad
- [ ] 12. Treinamento do time com os SOPs de uso do ClickUp

---

*Arquitetura gerada por Pedro Valerio (OPS Architect) — SPFP Squad OPS*
*Score de confiança da planta: 87/100 — ajustes pós-uso real são esperados e bem-vindos.*
