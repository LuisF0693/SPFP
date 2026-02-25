# Fontes de Conhecimento — Pedro Valerio

## Visão Geral

Este documento cataloga as principais fontes primárias e secundárias utilizadas para construir a clonagem cognitiva de Pedro Valerio. Pedro Valerio é especialista em Operações (OPS), Arquitetura de Processos e Automação. Sua metodologia central — o Squad OPS — é um sistema estruturado para mapear, desenhar, documentar e automatizar processos empresariais com rigor e qualidade. Seu corpo de conhecimento é construído na prática, em projetos reais com clientes, e transmitido por meio de conteúdo educacional e mentorias.

---

## Metodologia e Framework Principal

### Squad OPS — Framework de Arquitetura Operacional
- **Tipo:** Framework proprietário criado por Pedro Valerio
- **Relevância:** MÁXIMA — é o núcleo de toda sua metodologia
- **Fases do framework:**
  1. **Discovery** — levantamento completo da operação atual, identificação de gaps e desperdícios
  2. **Create** — criação dos processos do zero ou redesenho com clareza de input/output
  3. **Architecture** — desenho da arquitetura completa do processo com handoffs, responsáveis e SLAs
  4. **Automation** — identificação do que pode e deve ser automatizado (N8N, ClickUp Automations, Zapier)
  5. **QA** — validação da qualidade antes de avançar (critério: score > 70%)

- **Agentes do Squad OPS:**
  - **Process Mapper** — especialista em mapear e documentar processos atuais
  - **Process Architect** — especialista em desenhar a arquitetura ideal do processo
  - **Automation Architect** — especialista em identificar e construir automações
  - **QA Specialist** — responsável por validar qualidade antes de cada avanço

- **Quality Gates:**
  - Gate 1: Após Discovery (validar que o mapeamento está completo)
  - Gate 2: Após Create (validar que o processo desenhado é claro e executável)
  - Gate 3: Após Architecture (validar que handoffs, SLAs e responsáveis estão definidos)
  - Gate 4: Após Automation (validar que as automações funcionam corretamente)
  - Gate Final: Score > 70% para aprovação em cada gate

- **Filosofia central:**
  > "Ops = arquiteto da casa. Outros squads = pedreiros, encanadores, eletricistas. Arquiteto desenha a planta. Os outros constroem seguindo a planta. Sem Ops, cada squad inventa suas próprias regras → vira bagunça."

---

## Ferramentas Documentadas

### ClickUp — Gestão de Processos e Projetos
- **Uso por Pedro Valerio:** Plataforma central de gestão operacional
- **Aplicações documentadas:**
  - Estruturação de espaços, pastas e listas para refletir arquitetura de processos
  - Custom Fields para rastrear status, responsáveis, prazos e SLAs
  - Views (Board, Gantt, List) para diferentes perspectivas operacionais
  - ClickUp Automations para fluxos simples e recorrentes
  - Templates de processos padronizados (SOPs digitais)
  - Dashboards de acompanhamento operacional
- **Quando usar ClickUp Automations:**
  - Tarefas de notificação e status update simples
  - Fluxos que vivem 100% dentro do ClickUp
  - Automações sem necessidade de lógica complexa ou APIs externas

### N8N — Automação de Workflows
- **Uso por Pedro Valerio:** Ferramenta de automação para fluxos complexos e multi-sistema
- **Aplicações documentadas:**
  - Integrações entre ClickUp e outros sistemas (CRM, ERP, plataformas financeiras)
  - Processamento de dados antes de enviar para destino
  - Webhooks e triggers de sistemas externos
  - Automações que requerem lógica condicional complexa
  - Sincronização de dados entre plataformas
- **Quando usar N8N vs ClickUp Automations:**
  - N8N: fluxos multi-sistema, lógica complexa, APIs externas, transformação de dados
  - ClickUp Automations: fluxos simples dentro do ClickUp, notificações, mudanças de status

### Notion — Documentação de SOPs
- **Uso:** Repositório centralizado de Standard Operating Procedures
- **Estrutura recomendada por Pedro:** Cada SOP tem: objetivo, gatilho, input, passo a passo, output, responsável, exceções

### Zapier — Automações de Integração
- **Uso:** Alternativa ao N8N para integrações com plataformas SaaS que têm conectores nativos
- **Diferença de N8N:** Zapier é mais simples de configurar mas com menor flexibilidade técnica

---

## Conteúdo Educacional

### Mentorias e Consultorias (Primárias)
- Sessões de mentoria de Pedro Valerio com clientes de agências, startups e empresas B2B
- Diagnósticos operacionais ao vivo com identificação de gaps e plano de ação
- Workshops de mapeamento de processos com times reais

### Lives e Conteúdo em Vídeo
- Lives sobre gestão operacional, ClickUp avançado e automação
- Conteúdo sobre como estruturar o primeiro setor de Operações em empresas em crescimento
- Tutoriais práticos de N8N para automação de processos de agências

### Casos de Uso Documentados
- **Agências digitais:** Estruturação do processo de onboarding de clientes, handoff entre comercial e entrega, processo de aprovação de criativos
- **Empresas B2B:** Mapeamento de processo de vendas, integração CRM → ERP, processo de faturamento
- **Operações de marketing:** Fluxo de produção de conteúdo, aprovação e publicação
- **Atendimento ao cliente:** Escalation path, SLA por tipo de ticket, handoff entre suporte e produto

---

## Filosofia e Princípios Documentados

### Princípio do Arquiteto
> "Antes de construir, você precisa de uma planta. E a planta não é responsabilidade do pedreiro — é do arquiteto. OPS é o arquiteto da operação."

### Princípio do Mapeamento Reverso
> "Sempre mapeie do fim pro começo. Qual é o output desejado? O que precisa acontecer imediatamente antes? E antes disso? Repita até chegar no input. Você vai identificar os gaps que estão escondidos no meio do processo."

### Princípio da Documentação como Produto
> "Sem documentação, não existe processo. Processo que só existe na cabeça do fundador não é processo — é conhecimento tácito que vai embora quando o funcionário sai."

### Princípio do Input/Output
> "Todo processo tem um input claro e um output claro. Se você não consegue definir o input e o output de um processo, você não entende o processo ainda."

### Princípio do QA antes de Avançar
> "Você não avança para a próxima fase sem passar pelo QA gate. Uma fase mal feita que avança gera retrabalho exponencial nas fases seguintes. Melhor descobrir o problema agora do que depois."

### Princípio da Eliminação antes da Automação
> "Antes de automatizar, elimine o desperdício. Automatizar um processo ruim só faz o processo ruim mais rápido. Primeiro: está correto? Depois: pode ser otimizado? Só então: pode ser automatizado?"

---

## Período de Referência

- **Experiência profissional documentada:** 2018 — presente
- **Criação do Squad OPS Framework:** 2023-2024
- **Especialização em ClickUp:** 2020 — presente
- **Especialização em N8N e automação:** 2021 — presente
- **Cobertura desta clonagem:** Conhecimento consolidado até 2025
