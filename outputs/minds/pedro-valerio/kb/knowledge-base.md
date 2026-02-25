# Base de Conhecimento — Pedro Valerio
## OPS, Arquitetura de Processos, ClickUp e Automação

---

## 1. Squad OPS Framework — Visão Completa

### O que é o Squad OPS

O Squad OPS é a metodologia de Pedro Valerio para transformar operações caóticas em sistemas documentados, escaláveis e parcialmente automatizados. É um framework de 5 fases com Quality Gates entre cada fase — garantindo que cada etapa está sólida antes de avançar.

O framework assume que operação sem arquitetura é caos organizado: as pessoas conseguem entregar porque conhecem os processos de cabeça, mas qualquer crescimento, qualquer nova contratação ou qualquer saída de funcionário expõe a fragilidade do sistema.

### As 5 Fases em Detalhe

#### Fase 1: Discovery

**Objetivo:** Mapear o que realmente existe, não o que o gestor acredita que existe.

**O que o Process Mapper faz:**
- Entrevista os executores reais dos processos (não só os gestores)
- Documenta o fluxo atual com todos os desvios informais
- Identifica knowledge holders — pessoas cujo conhecimento não está documentado
- Mapeia ferramentas usadas em cada etapa
- Identifica pontos de falha recorrentes
- Calcula o custo de retrabalho (quanto tempo é gasto corrigindo problemas?)

**Perguntas centrais do Discovery:**
- "Como você faz X na prática? Me mostra fazendo."
- "O que acontece quando dá errado? Quem você aciona?"
- "Existe alguém que sabe fazer isso que mais ninguém sabe?"
- "Onde isso está documentado? Posso ver?"
- "Com que frequência isso precisa ser refeito? Por quê?"

**Entregável:** Mapa da operação atual + Inventário de gaps + Lista de knowledge holders + Estimativa de custo de retrabalho

**Quality Gate 1:**
- [ ] Todos os processos críticos foram mapeados (não apenas os óbvios)
- [ ] Gaps foram quantificados (não apenas listados)
- [ ] Knowledge holders identificados e seus riscos documentados
- [ ] Validado com pelo menos 2 executores diferentes por processo
- Score mínimo para avançar: 70%

---

#### Fase 2: Create

**Objetivo:** Redesenhar cada processo com clareza total de input, output, responsável e critério de qualidade.

**O que o Process Architect faz:**
- Para cada processo identificado no Discovery: define input e output claros
- Elimina etapas desnecessárias (princípio: se não contribui para o output, remove)
- Define responsável único para cada etapa (nunca "o time" — sempre uma pessoa)
- Estabelece critério de qualidade: como saber se a etapa foi bem executada?
- Rascunha o SOP em formato auto-executável

**Estrutura padrão de um SOP:**
```
TÍTULO: [Nome do Processo]
VERSÃO: 1.0
DATA: [Data]
RESPONSÁVEL: [Nome completo e cargo]

OBJETIVO:
[Em uma frase: qual problema esse processo resolve?]

GATILHO:
[O que aciona esse processo? Quem aciona? Como?]

INPUT:
[O que precisa estar disponível para iniciar? Em qual formato? De onde vem?]

PASSO A PASSO:
Passo 1: [Ação] — Responsável: [Nome] — SLA: [Prazo] — Ferramenta: [Nome]
  Critério de qualidade: [Como saber se está correto?]
Passo 2: [Ação] — Responsável: [Nome] — SLA: [Prazo] — Ferramenta: [Nome]
  Critério de qualidade: [Como saber se está correto?]
[...]

OUTPUT:
[O que é entregue ao final? Para quem? Em qual formato? Em qual prazo?]

EXCEÇÕES:
[O que fazer quando X não está disponível? Quando Y atrasa?]

ESCALATION PATH:
- Nível 1 (até [prazo]): [Ação] — Responsável: [Nome]
- Nível 2 (até [prazo]): [Ação] — Responsável: [Nome]
- Nível 3 (crítico): [Ação] — Responsável: [Nome]

MÉTRICAS DE SUCESSO:
[Como medir se esse processo está funcionando bem?]
```

**Quality Gate 2:**
- [ ] Todos os processos têm input e output claros e não ambíguos
- [ ] Cada etapa tem responsável único (nunca "o time")
- [ ] Critérios de qualidade são objetivos (não "fazer bem", mas "verificar X e Y")
- [ ] SOPs estão em formato auto-executável (testado com alguém que nunca fez antes)
- Score mínimo para avançar: 70%

---

#### Fase 3: Architecture

**Objetivo:** Conectar os processos individuais em uma arquitetura operacional coerente — com handoffs claros, SLAs definidos entre squads e escalation paths documentados.

**O que o Process Architect faz na fase de Architecture:**
- Mapeia os handoffs entre processos: onde o output de um processo é input de outro?
- Define SLAs entre squads: quanto tempo o Squad A tem para passar para o Squad B?
- Cria fluxograma da operação completa (visão macro)
- Identifica dependências críticas: qual processo bloqueia qual?
- Define protocolo de escalation global (não só por processo, mas para a operação como um todo)
- Documenta a arquitetura de ferramentas: qual ferramenta para qual tipo de processo?

**Diagrama típico de arquitetura de handoffs:**
```
[Marketing] → output: Lead qualificado
    ↓ handoff — SLA: imediato (webhook/automação)
[Comercial] → output: Proposta enviada / Contrato assinado
    ↓ handoff — SLA: até 1 hora útil após assinatura
[Onboarding] → output: Cliente ativo e onboardado
    ↓ handoff — SLA: em até 2 dias úteis
[Entrega/CS] → output: Entregável conforme acordado
    ↓ handoff — SLA: contínuo, prazos por projeto
[Suporte] → responde exceções em qualquer etapa
```

**Quality Gate 3:**
- [ ] Todos os handoffs entre squads estão documentados com SLAs
- [ ] Fluxograma macro revisado por representantes de cada squad
- [ ] Escalation paths globais documentados e comunicados
- [ ] Dependências críticas identificadas com plano de contingência
- Score mínimo para avançar: 70%

---

#### Fase 4: Automation

**Objetivo:** Automatizar o que é repetível, reduzindo carga manual sem comprometer qualidade.

**O que o Automation Architect faz:**
- Percorre os processos arquitetados e identifica candidatos à automação
- Aplica o filtro: eliminar → otimizar → automatizar
- Decide ferramenta por processo: ClickUp Automations, N8N ou ambos
- Constrói as automações em ambiente de staging (nunca vai direto para produção)
- Documenta cada automação: trigger, lógica, output esperado, como testar
- Define monitoramento: como saber se a automação quebrou?

**Critérios para automatizar:**
- O processo é repetível (mesmo input → mesmo output, sempre)?
- O volume justifica o investimento em automação?
- A automação pode ser mantida pela equipe sem programação avançada?
- O que acontece quando a automação falha? O processo de fallback está documentado?

**Documentação padrão de automação:**
```
NOME DA AUTOMAÇÃO: [Nome descritivo]
FERRAMENTA: [ClickUp / N8N / Zapier]
VERSÃO: 1.0

TRIGGER: [O que aciona a automação?]
CONDIÇÕES: [Quais critérios devem ser verdadeiros?]
LÓGICA: [O que acontece passo a passo?]
OUTPUT: [O que é criado/modificado/notificado?]

COMO TESTAR: [Sequência de passos para validar o funcionamento]
COMO MONITORAR: [Como saber se a automação está funcionando ou quebrou?]

FALLBACK: [O que fazer manualmente se a automação falhar?]
RESPONSÁVEL TÉCNICO: [Quem manter essa automação?]
```

**Quality Gate 4:**
- [ ] Cada automação testada em staging com casos de borda
- [ ] Documentação de cada automação está completa
- [ ] Fallback manual documentado para cada automação crítica
- [ ] Monitoramento configurado (alert quando automação falha)
- Score mínimo para avançar: 70%

---

#### Fase 5: QA

**Objetivo:** Validar que o que foi construído funciona de verdade — não confiar na palavra de quem construiu.

**O que o QA Specialist faz:**
- Executa cada SOP seguindo a documentação (sem ajuda de quem escreveu)
- Testa cada automação com casos reais e casos de borda
- Verifica handoffs entre squads com testadores de múltiplas equipes
- Valida escalation paths: simula situações de exceção
- Calcula score de cada processo e automação
- Gera relatório de QA com aprovados, reprovados e ajustes necessários

**Score de QA por processo:**
| Critério | Peso | Pontuação máxima |
|---------|------|-----------------|
| SOP é auto-executável (testado com usuário sem treinamento) | 30% | 30 pontos |
| Input e output estão claros e corretos | 20% | 20 pontos |
| Responsáveis e SLAs definidos | 20% | 20 pontos |
| Exceções e escalation path funcionam | 15% | 15 pontos |
| Automações funcionam sem falhas | 15% | 15 pontos |
| **TOTAL** | **100%** | **100 pontos** |

**Decisão do QA:**
- Score ≥ 70: APROVADO — pode ir para produção
- Score 50-69: CONDICIONAL — correções menores antes de produção
- Score < 50: REPROVADO — volta para a fase de origem com feedback detalhado

---

## 2. Arquitetura de Processos — Princípios Avançados

### Como Estruturar SOPs para Diferentes Contextos

#### SOPs Operacionais (processos de rotina)
- Alta frequência, baixa variação
- Foco em velocidade de execução e consistência
- Exemplo: processo de publicação de post nas redes sociais, processo de emissão de NF

#### SOPs de Projeto (processos únicos mas recorrentes)
- Baixa frequência, alta complexidade
- Foco em clareza de fases e decisões
- Exemplo: processo de onboarding de novo cliente, lançamento de produto

#### SOPs de Exceção (escalation e crise)
- Raramente acionados, alta criticidade quando acionados
- Foco em velocidade de resposta e escalation correto
- Exemplo: processo de crash de sistema, processo de reclamação grave de cliente

### Hierarquia de Processos

```
MACRO PROCESSO (Visão estratégica da operação)
  └── PROCESSO (Sequência de etapas para um resultado específico)
        └── SUB-PROCESSO (Parte de um processo que pode ser delegada independentemente)
              └── TAREFA (Ação individual executada por uma pessoa)
                    └── MICRO-TAREFA (Passo específico dentro de uma tarefa)
```

**Regra de ouro:** Documente no nível que resolve o problema. Para processos simples, o nível de Tarefa é suficiente. Para processos complexos, documente até Sub-Processo e referencie outros SOPs para os detalhes.

### Design de Handoffs

O handoff é o ponto mais crítico de qualquer processo. É onde a informação tem maior risco de se perder, de ser mal interpretada ou de simplesmente não acontecer.

**Checklist de handoff bem projetado:**
- [ ] É claro quem passa para quem (sender e receiver definidos)
- [ ] O que é passado está em formato padronizado
- [ ] Existe um canal definido para o handoff (não depende de quem está online)
- [ ] Existe confirmação de recebimento (o receiver confirma que recebeu)
- [ ] Existe SLA para o receiver iniciar após receber
- [ ] Existe escalation se o receiver não confirmar no prazo

---

## 3. ClickUp — Arquitetura Operacional Avançada

### Estrutura de Espaços e Hierarquia

A estrutura do ClickUp deve refletir a arquitetura da empresa, não a estrutura de times.

**Hierarquia recomendada:**
```
WORKSPACE (toda a empresa)
  └── SPACE (área ou squad: Marketing, Vendas, Produto, Operações)
        └── FOLDER (linha de trabalho ou tipo de projeto)
              └── LIST (projeto específico ou processo recorrente)
                    └── TASK (entrega individual)
                          └── SUBTASK (etapa da entrega)
```

**Anti-padrões a evitar:**
- Criar um espaço por pessoa (o ClickUp fica fragmentado, sem visibilidade)
- Usar somente uma lista para toda a empresa (perde granularidade)
- Criar estruturas que só quem criou entende (falta de onboarding documentation)

### Custom Fields Essenciais por Tipo de Lista

**Para listas de processos recorrentes:**
- Status personalizado alinhado com o fluxo real do processo
- Campo "Responsável" (quem está fazendo agora)
- Campo "Revieweur" (quem valida antes de fechar)
- Campo "SLA" (data limite calculada automaticamente a partir de criação)
- Campo "Input recebido?" (checkbox — só move para próxima etapa quando checked)

**Para listas de projetos:**
- Status por fase do projeto
- Campo "Cliente"
- Campo "Valor do projeto"
- Campo "Data de entrega contratual"
- Campo "Status do cliente" (satisfeito / neutro / em risco)
- Campo "Fase atual" (dropdown com as fases do processo de entrega)

**Para listas de suporte/atendimento:**
- Status: Novo / Em análise / Aguardando cliente / Resolvido / Escalado
- Campo "Prioridade" (Crítico / Alto / Médio / Baixo)
- Campo "Tipo" (categoria do problema)
- Campo "SLA vence em" (calculado automaticamente)
- Campo "Escalado para" (quem está com o caso agora)

### Views para Diferentes Perspectivas

**Board View:** Para acompanhar fluxo de trabalho (Kanban). Use quando precisa ver o que está em cada etapa do processo.

**List View:** Para revisão detalhada e filtragem. Use quando precisa ver campos específicos de múltiplas tarefas ao mesmo tempo.

**Gantt View:** Para planejamento de projetos com dependências temporais. Use quando precisa visualizar cronograma e sobreposições.

**Calendar View:** Para processos com datas críticas (lançamentos, entregas, reuniões).

**Dashboard:** Para acompanhamento de KPIs operacionais. Use para monitorar saúde geral da operação.

### ClickUp Automations — Casos de Uso

**Automações de status:**
```
TRIGGER: Status muda para "Concluído"
AÇÃO: Notifica o Revieweur por email/comentário
      Muda status para "Aguardando Review"
      Adiciona data de conclusão
```

**Automações de SLA:**
```
TRIGGER: Tarefa criada
AÇÃO: Define due date automaticamente (hoje + X dias úteis)
      Atribui ao responsável padrão da lista
```

**Automações de escalation:**
```
TRIGGER: Due date passa sem mudar status
AÇÃO: Muda prioridade para "Crítico"
      Notifica o gestor da lista
      Adiciona tag "Atrasado"
```

**Automações de handoff:**
```
TRIGGER: Status muda para "Pronto para handoff"
AÇÃO: Cria tarefa espelhada na lista do próximo squad
      Vincula tarefa original como dependência
      Notifica responsável do próximo squad
```

---

## 4. N8N — Automação de Workflows Multi-Sistema

### Quando N8N é a Escolha Certa

N8N é o orquestrador de integrações. Ele conecta sistemas que não foram feitos para conversar entre si.

**Casos de uso ideais para N8N:**

1. **Lead criado no CRM → tarefa no ClickUp**
   - Trigger: Webhook do CRM (HubSpot, Pipedrive, etc.)
   - Lógica: Extrai campos do lead, mapeia para campos do ClickUp
   - Ação: Cria tarefa na lista "Leads para qualificar" com todos os campos preenchidos

2. **Contrato assinado → kick-off automático**
   - Trigger: Evento de assinatura no DocuSign/PandaDoc
   - Lógica: Identifica o cliente e o tipo de serviço contratado
   - Ação: Cria projeto no ClickUp com template correto, envia email de boas-vindas, notifica time no Slack

3. **Formulário preenchido → processo iniciado**
   - Trigger: Submissão no Typeform/JotForm
   - Lógica: Processa respostas, valida campos obrigatórios
   - Ação: Cria tarefa no ClickUp, envia confirmação para o respondente, notifica responsável

4. **NF emitida → atualização no CRM**
   - Trigger: Webhook do sistema de NF
   - Lógica: Identifica cliente, valor, data
   - Ação: Atualiza campo no CRM, cria registro financeiro, notifica CS

### Boas Práticas de N8N

**Nomenclatura de nodes:**
- Seja descritivo: "Busca lead no HubSpot" é melhor que "HTTP Request 1"
- Use prefixos por tipo: "GET: ", "SET: ", "FILTER: ", "SEND: "

**Tratamento de erros:**
- Sempre adicione um node de tratamento de erro nos fluxos críticos
- Configure notificação por email/Slack quando um workflow falha
- Documente o fallback manual para cada workflow crítico

**Versionamento:**
- Mantenha versão anterior antes de alterar workflow em produção
- Use ambiente de staging para testar antes de ativar em produção
- Documente as mudanças no histórico do workflow

**Monitoramento:**
- Configure alerts para workflows que falham mais de X vezes por dia
- Revise logs semanalmente nos primeiros 30 dias de um novo workflow
- Calcule taxa de sucesso por workflow (meta: >98% de execuções bem-sucedidas)

### Arquitetura de Automações N8N por Contexto

**Para agências:**
```
[Novo briefing recebido]
  ↓ N8N cria tarefa no ClickUp (lista: Projetos Ativos)
  ↓ N8N notifica PM no Slack com link da tarefa
  ↓ PM faz kick-off no ClickUp
  ↓ ClickUp Automation: quando status muda para "Em produção", notifica equipe criativa
  ↓ ClickUp Automation: quando status muda para "Pronto para aprovação", notifica cliente
  ↓ Aprovação recebida → N8N notifica publicação/entrega final
```

**Para empresas B2B (processo comercial):**
```
[Lead qualificado no CRM]
  ↓ N8N cria tarefa "Proposta" no ClickUp (lista: Comercial)
  ↓ Proposta enviada → N8N registra no CRM + adiciona follow-up automático em 3 dias
  ↓ Contrato assinado → N8N cria projeto de onboarding no ClickUp
  ↓ N8N envia kit de boas-vindas por email
  ↓ ClickUp Automation: onboarding tasks atribuídas automaticamente
```

---

## 5. SLAs e Escalation Paths — Como Definir e Implementar

### Definindo SLAs que Fazem Sentido

SLA não é o prazo que a empresa gostaria de cumprir. É o prazo máximo aceitável dentro do qual o cliente/solicitante pode contar.

**Critérios para definir um SLA:**
1. **Urgência para o cliente/solicitante:** Quanto tempo de espera causa dano real?
2. **Capacidade operacional real:** O time consegue cumprir consistentemente?
3. **Benchmarks do setor:** O que é padrão no seu mercado?
4. **Custo de não cumprimento:** Qual é a consequência de SLA não atendido?

**Níveis de SLA típicos por contexto:**

| Tipo | SLA Típico | Quando usar |
|------|-----------|------------|
| Crítico (sistema down, bloqueante) | 2-4 horas | Problemas que impedem operação |
| Alto (impacto significativo) | 1 dia útil | Problemas que degradam operação |
| Médio (funciona com workaround) | 3 dias úteis | Melhorias e problemas não urgentes |
| Baixo (nice to have) | 1 semana | Solicitações de baixa prioridade |

### Escalation Path — Estrutura Completa

Todo processo crítico precisa de um escalation path documentado. Quando algo sai do fluxo normal, a equipe não deve improvisar.

**Template de escalation path:**
```
PROCESSO: [Nome do processo]
RESPONSÁVEL PRIMÁRIO: [Nome + contato]

NÍVEL 1 — Tempo de resposta: até [X horas/minutos]
  Acionar quando: [critério objetivo]
  Quem acionar: [Nome + cargo + contato]
  O que informar: [campos obrigatórios na comunicação de escalation]
  Canal: [Slack / WhatsApp / Email / Telefone]

NÍVEL 2 — Tempo de resposta: até [X horas/minutos]
  Acionar quando: [Nível 1 não respondeu em X minutos OU critério Y]
  Quem acionar: [Nome + cargo + contato]
  O que informar: [resumo da situação + o que já foi tentado]
  Canal: [canal de maior urgência — geralmente WhatsApp ou ligação]

NÍVEL 3 — CRÍTICO
  Acionar quando: [impacto de negócio crítico ou X horas sem resolução]
  Quem acionar: [Liderança sênior]
  O que informar: [impacto de negócio + timeline + solicitação específica]
  Canal: [ligação direta]
```

### Como Monitorar Cumprimento de SLA

**No ClickUp:**
- Use o campo de due date calculado automaticamente (hoje + SLA em dias úteis)
- Configure automação: quando due date passa sem mudança de status → muda prioridade para crítico
- Crie dashboard com "tarefas com SLA vencido" para review diário do gestor

**KPIs de SLA:**
- % de tarefas resolvidas dentro do SLA (meta: >90%)
- Tempo médio de resolução por tipo de solicitação
- % de tarefas que escalaram para Nível 2 ou 3
- Causas raiz de SLAs não cumpridos (revisão mensal)

---

## 6. Quality Gates — Implementação Prática

### Por que Quality Gates são Não-Negociáveis

Um processo mal feito que avança gera retrabalho exponencial. O custo de corrigir na Fase 2 é 3x o custo de corrigir na Fase 1. O custo de corrigir na Fase 4 é 10x. O custo de corrigir em produção é incalculável.

Quality Gates existem para identificar o problema na fase mais barata de corrigi-lo.

### Critério de 70%

O critério de aprovação é score ≥ 70%, não 100%. Por quê?

**100% cria paralisia de perfeição:** Times ficam presos em revisões infinitas tentando alcançar perfeição que, na prática, só se revela com uso real.

**70% garante fundação sólida:** Um processo com 70% de score tem todos os elementos críticos funcionando. Os 30% restantes são melhorias que serão identificadas com dados de uso real.

**Iteração pós-produção é esperada:** Nenhum processo chega perfeito na primeira versão. O objetivo do Quality Gate é garantir que está "bom o suficiente para aprender" — não "perfeito antes de qualquer aprendizado".

### Como Calcular o Score

**Score do processo = média ponderada de 5 critérios:**

| Critério | Peso | Avaliação |
|---------|------|-----------|
| SOP auto-executável | 30% | 0-10: quão facilmente alguém novo consegue executar? |
| Input e output claros | 20% | 0-10: quão claramente definidos estão? |
| Accountability definida | 20% | 0-10: cada etapa tem responsável único? |
| Exceções e escalation | 15% | 0-10: situações não-padrão estão cobertas? |
| Automações funcionam | 15% | 0-10: automações testadas e documentadas? |

**Exemplo de cálculo:**
```
SOP auto-executável: 8/10 × 30% = 2.4
Input/output claros: 9/10 × 20% = 1.8
Accountability:      7/10 × 20% = 1.4
Exceções:            6/10 × 15% = 0.9
Automações:          8/10 × 15% = 1.2
TOTAL: 7.7 / 10 = 77% → APROVADO (>70%)
```

---

## 7. Diagnóstico Operacional — Como Identificar os Gaps

### As 5 Perguntas do Diagnóstico

Quando Pedro Valerio chega em uma nova empresa para diagnóstico, as primeiras 5 perguntas são:

1. **"Me mostra o processo de onboarding de um novo cliente, do zero ao cliente ativo."**
   → Revela: handoffs, responsáveis, documentação, nível de improviso

2. **"O que acontece quando um colaborador-chave fica de férias ou sai da empresa?"**
   → Revela: dependência de conhecimento tácito, resiliência operacional

3. **"Como vocês sabem que um processo foi executado corretamente?"**
   → Revela: critérios de qualidade, ausência de QA, métricas operacionais

4. **"Qual o processo que mais gera retrabalho? Por quê?"**
   → Revela: raízes de ineficiência, onde documentação está mais deficiente

5. **"Onde estão documentados os processos da empresa?"**
   → Revela: cultura de documentação, centralização vs. silos de informação

### Sinais de Alerta Operacional

| Sinal | O que revela |
|-------|-------------|
| "Pergunta pro Fulano — só ele sabe" | Knowledge tácito não documentado |
| "Depende do projeto" sem critério | Falta de padronização |
| Retrabalho recorrente no mesmo ponto | Gap de documentação ou handoff |
| Onboarding de novo funcionário > 30 dias | SOPs inexistentes ou inadequados |
| Fundador no WhatsApp com operacional | Falta de escalation path |
| "A gente faz no olho" | Ausência de processo documentado |
| Cada pessoa faz diferente | Falta de SOP padronizado |
| Reunião para resolver o que era previsível | Falta de protocolo de exceções |

### Como Priorizar os Gaps

Nem todo gap precisa ser resolvido ao mesmo tempo. Pedro usa a seguinte matriz de priorização:

**Eixo 1: Impacto no negócio** (1-5)
- 5: Processo bloqueante — empresa não funciona sem ele
- 4: Processo crítico — afeta diretamente clientes ou receita
- 3: Processo importante — afeta produtividade significativamente
- 2: Processo relevante — tem impacto mas não é urgente
- 1: Processo auxiliar — pode funcionar informalmente por mais tempo

**Eixo 2: Frequência** (1-5)
- 5: Diário
- 4: Semanal
- 3: Quinzenal
- 2: Mensal
- 1: Ocasional

**Prioridade = Impacto × Frequência**
- 20-25: Prioridade máxima — resolver imediatamente
- 12-19: Alta prioridade — resolver neste ciclo
- 6-11: Média prioridade — planejar para próximo ciclo
- 1-5: Baixa prioridade — registrar e endereçar quando possível

---

## 8. Aplicação no Contexto SPFP

### Processos Críticos Identificados no SPFP

#### Processo 1: Onboarding de Novo Usuário no SaaS

**Input:** Usuário cria conta no SPFP
**Output:** Usuário ativo — completou setup, lançou primeiras transações, visualizou dashboard
**Gap provável:** Sem fluxo documentado de ativação, sem critério claro do que é "usuário ativo"

**SOP Sketch:**
1. Trigger: usuário completa cadastro
2. Email de boas-vindas + próximos passos (N8N automação)
3. Onboarding in-app guiado (produto)
4. Critério de ativação: completou X ações em Y dias (definir o que é ativação)
5. Se não ativou em 3 dias: email de ativação com dica prática (N8N automação)
6. Se não ativou em 7 dias: verificar se há blockers de UX (análise manual semanal)

#### Processo 2: Suporte ao Cliente

**Input:** Usuário abre ticket ou envia dúvida
**Output:** Dúvida resolvida ou problema corrigido dentro do SLA
**Gap provável:** Sem categorização de tickets, sem SLA definido por tipo, sem escalation path técnico documentado

**SLA recomendado:**
- Bug crítico (sistema não funciona): 4 horas
- Bug moderado (funciona mas com erro): 1 dia útil
- Dúvida de uso: 1 dia útil
- Sugestão de melhoria: 1 semana (confirmação de recebimento)

#### Processo 3: Deploy de Nova Feature

**Input:** Feature aprovada para produção
**Output:** Feature em produção, testada, comunicada para usuários afetados
**Gap provável:** Processo técnico pode existir mas comunicação ao usuário final pode não estar documentada

**SOP Sketch:**
1. Checklist técnico de deploy (responsabilidade: dev)
2. Smoke test pós-deploy (responsabilidade: QA)
3. Atualização de changelog (responsabilidade: produto)
4. Comunicação para usuários afetados se mudança é visível (responsabilidade: marketing ou produto)
5. Monitoramento de erros nas primeiras 24h (responsabilidade: dev)
6. Escalation se erro crítico: devs acionados imediatamente, rollback se necessário

#### Processo 4: Geração de Insights de AI

**Input:** Dados financeiros do usuário
**Output:** Insights personalizados e relevantes entregues no momento certo
**Gap provável:** Sem documentação de quando e como insights são gerados, sem critério de qualidade do insight, sem processo de feedback do usuário

**Arquitetura sugerida:**
1. Trigger: usuário tem dados suficientes para gerar insight (definir critério mínimo)
2. N8N ou backend: chama Gemini API com contexto do usuário
3. Critério de qualidade: insight tem que ser acionável (não só descritivo)
4. Fallback: se Gemini falha, fila para retry em X minutos (está implementado em retryService.ts)
5. Feedback do usuário: "esse insight foi útil?" → alimenta melhoria contínua

#### Processo 5: Produção de Conteúdo (Infoprodutos)

**Input:** Pauta aprovada
**Output:** Conteúdo publicado ou curso disponível para alunos
**Gap provável:** Cada produção sendo feita de forma diferente, sem template de qualidade, sem processo de aprovação documentado

**SOP de Produção de Conteúdo:**
1. Briefing preenchido (responsável: estratégia) — inclui: objetivo, público, formato, canal, CTA
2. Produção do rascunho (responsável: criação) — SLA: X dias úteis
3. Review interno (responsável: gestor de conteúdo) — critério: alinhado com briefing?
4. Ajuste de rascunho se necessário
5. Aprovação final (responsável: [definir]) — SLA: 1 dia útil após recebimento
6. Agendamento/publicação (responsável: operações)
7. Monitoramento de performance (primeiras 48h): views, engajamento, conversões
