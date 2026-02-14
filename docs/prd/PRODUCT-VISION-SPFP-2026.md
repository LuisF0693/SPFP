# SPFP Product Vision 2026

**Product Owner:** Sophie (AIOS PO Agent)
**Data:** 2026-02-14
**Versao:** 1.0

---

## Visao Geral do Produto

### Missao
Transformar o SPFP de uma ferramenta de planejamento financeiro pessoal em uma **plataforma completa de gestao para planejadores financeiros**, com CRM inteligente, automacao por IA e experiencia gamificada para gestao empresarial.

### Visao 2026
> "Ser a plataforma mais inovadora para planejadores financeiros independentes, combinando gestao de clientes, automacao inteligente e uma experiencia visual unica que transforma o trabalho diario em algo engajador e produtivo."

### Proposta de Valor

| Stakeholder | Valor Entregue |
|-------------|----------------|
| **Planejador Financeiro** | CRM completo, atas automatizadas, arquivos organizados |
| **Clientes do Planejador** | Comunicacao profissional, transparencia, acompanhamento |
| **Empresa do Planejador** | Visao 360 dos departamentos, metricas em tempo real |

---

## Epicos Estrategicos

### EPIC-001: CRM v2 - Cliente no Centro
**Visao:** Transformar o CRM atual em uma central de relacionamento inteligente que automatiza a comunicacao e organiza materiais de reuniao.

**Valor de Negocio:**
- Reducao de 70% no tempo de preparo de reunioes
- Comunicacao padronizada e profissional com clientes
- Historico completo de interacoes e documentos

**Usuarios Impactados:** Planejadores financeiros e seus clientes

---

### EPIC-002: Corporate HQ - Escritorio do Futuro
**Visao:** Criar uma experiencia gamificada de gestao empresarial onde o usuario "caminha" por um escritorio virtual e visualiza seus departamentos e agentes IA trabalhando em tempo real.

**Valor de Negocio:**
- Visao unificada de todos os departamentos da empresa
- Engajamento atraves de gamificacao
- Monitoramento em tempo real de agentes IA

**Usuarios Impactados:** Empreendedores solo, pequenas empresas

**Diferencial Competitivo:** Nenhuma ferramenta de gestao oferece essa experiencia visual gamificada combinada com visualizacao de agentes IA.

---

### EPIC-003: AI Automation - IA que Age
**Visao:** Permitir que agentes IA visualizem e interajam com o browser do usuario, automatizando tarefas repetitivas e coletando informacoes.

**Valor de Negocio:**
- Automacao de tarefas manuais repetitivas
- Coleta automatizada de dados
- Demonstracoes e tutoriais automatizados

**Usuarios Impactados:** Usuarios avancados que querem automacao

---

### EPIC-004: Core Fixes - Fundacao Solida
**Visao:** Corrigir problemas existentes e melhorar funcionalidades basicas para garantir uma experiencia estavel.

**Valor de Negocio:**
- Confiabilidade do sistema
- Satisfacao do usuario existente
- Base solida para novas features

**Usuarios Impactados:** Todos os usuarios atuais

---

## Priorizacao MoSCoW

### MUST HAVE (Obrigatorio)

| ID | Feature | Epico | Justificativa |
|----|---------|-------|---------------|
| M1 | Bug fix parceiros | EPIC-004 | Sistema quebrado impede uso |
| M2 | Editar categorias | EPIC-004 | Funcionalidade basica esperada |
| M3 | Sistema de Atas | EPIC-001 | Core business do planejador |
| M4 | Envio WhatsApp/Email | EPIC-001 | Canal principal de comunicacao |

### SHOULD HAVE (Importante)

| ID | Feature | Epico | Justificativa |
|----|---------|-------|---------------|
| S1 | Modernizacao UI CRM | EPIC-001 | UX competitiva no mercado |
| S2 | Aba de Arquivos | EPIC-001 | Produtividade em reunioes |
| S3 | Templates editaveis | EPIC-001 | Personalizacao profissional |

### COULD HAVE (Desejavel)

| ID | Feature | Epico | Justificativa |
|----|---------|-------|---------------|
| C1 | Escritorio Virtual Base | EPIC-002 | Diferencial inovador |
| C2 | Pipeline Feed | EPIC-002 | Visibilidade de processos |
| C3 | Dashboards Departamentos | EPIC-002 | Metricas consolidadas |

### WON'T HAVE (Nao agora)

| ID | Feature | Epico | Justificativa |
|----|---------|-------|---------------|
| W1 | MCP Playwright completo | EPIC-003 | Complexidade alta, valor incerto |
| W2 | Visualizacao agentes IA | EPIC-002 | Depende de integracao Claude Code |
| W3 | Movimento avatar | EPIC-002 | Nice-to-have, nao essencial |

---

## Metricas de Sucesso (KPIs)

### EPIC-004: Core Fixes
| Metrica | Baseline | Target | Prazo |
|---------|----------|--------|-------|
| Bug parceiros resolvido | Quebrado | 100% funcional | 1 semana |
| Categorias editaveis | 0% | 100% usuarios | 1 semana |
| Erros reportados | N/A | 0 criticos | Continuo |

### EPIC-001: CRM v2
| Metrica | Baseline | Target | Prazo |
|---------|----------|--------|-------|
| Atas enviadas/mes | 0 | 50+ | 1 mes apos lancamento |
| Tempo preparo reuniao | 30 min | 10 min | 2 meses |
| NPS do CRM | N/A | 8+ | 3 meses |
| Arquivos uploadados | 0 | 100+ | 2 meses |

### EPIC-002: Corporate HQ
| Metrica | Baseline | Target | Prazo |
|---------|----------|--------|-------|
| Usuarios ativos diarios | N/A | 70% | 1 mes |
| Tempo na plataforma | N/A | +40% | 2 meses |
| Departamentos configurados | 0 | 4/usuario | 1 mes |

### EPIC-003: AI Automation
| Metrica | Baseline | Target | Prazo |
|---------|----------|--------|-------|
| Automacoes executadas | 0 | 10/semana | 1 mes |
| Tarefas automatizadas | 0 | 5 tipos | 2 meses |

---

## Riscos e Mitigacoes

### Risco Alto

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Escritorio Virtual muito complexo | Alta | Alto | MVP simplificado, iterar |
| Integracao WhatsApp bloqueada | Media | Alto | Usar deep links primeiro |
| Performance com Phaser.js | Media | Medio | Testar cedo, fallback para HTML |

### Risco Medio

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Supabase Storage limites | Media | Medio | Implementar quotas |
| Curva aprendizado usuarios | Media | Medio | Onboarding guiado |

### Risco Baixo

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Migration Supabase falhar | Baixa | Alto | Backup + rollback plan |

---

## Dependencias Tecnicas

```
[EPIC-004] Core Fixes
    |
    | (prerequisito)
    v
[EPIC-001] CRM v2
    |
    +---> [EPIC-002] Corporate HQ (pode iniciar MVP em paralelo)
    |
    +---> [EPIC-003] AI Automation (independente)
```

### Dependencias Externas

| Dependencia | Epico | Criticidade | Status |
|-------------|-------|-------------|--------|
| Supabase Storage | EPIC-001 | Alta | Disponivel |
| API Email (Resend/SendGrid) | EPIC-001 | Alta | A configurar |
| WhatsApp Deep Links | EPIC-001 | Media | Disponivel |
| Phaser.js / Pixi.js | EPIC-002 | Alta | A avaliar |
| MCP Playwright | EPIC-003 | Media | Configurado |
| WebSocket (Supabase Realtime) | EPIC-002 | Alta | Disponivel |

---

## Roadmap Recomendado

### Fase 1: Fundacao (Sprint 1)
**Foco:** EPIC-004 completo
- [x] Diagnosticar bug parceiros
- [ ] Executar migration Supabase
- [ ] Implementar UI editar categorias
- [ ] Testes e validacao

**Entrega:** Sistema estavel, funcionalidades basicas corrigidas

### Fase 2: CRM Inteligente (Sprints 2-4)
**Foco:** EPIC-001 completo
- [ ] Redesign UI/UX do CRM
- [ ] Sistema de Atas (templates, editor, preview)
- [ ] Integracao Email + WhatsApp
- [ ] Aba de Arquivos com Supabase Storage
- [ ] Historico de comunicacoes

**Entrega:** CRM profissional completo

### Fase 3: Escritorio Virtual MVP (Sprints 5-7)
**Foco:** EPIC-002 MVP
- [ ] Mapa estatico do escritorio (4 departamentos)
- [ ] Clique para acessar dashboard do departamento
- [ ] Pipeline Feed basico
- [ ] Metricas por departamento

**Entrega:** Experiencia gamificada inicial

### Fase 4: Evolucao (Sprints 8-10)
**Foco:** EPIC-002 completo + EPIC-003 inicial
- [ ] Animacoes e movimento
- [ ] Agentes IA visuais
- [ ] Integracao MCP Playwright basica
- [ ] Refinamentos baseados em feedback

**Entrega:** Plataforma diferenciada completa

---

## Decisoes Estrategicas

### D1: Ordem de Implementacao
**Decisao:** EPIC-004 → EPIC-001 → EPIC-002 → EPIC-003
**Racional:** Corrigir base antes de adicionar complexidade

### D2: MVP do Escritorio Virtual
**Decisao:** Comecar com mapa estatico + clique, sem movimento de avatar
**Racional:** Reduzir complexidade inicial, validar conceito

### D3: WhatsApp Integration
**Decisao:** Deep links primeiro, API Business depois
**Racional:** Menor fricção para começar, escalar conforme necessidade

### D4: AI Automation Scope
**Decisao:** Postergar EPIC-003 para Fase 4
**Racional:** Valor menos claro, complexidade alta, foco no core primeiro

---

## Aprovacoes Necessarias

| Item | Aprovador | Status | Data |
|------|-----------|--------|------|
| Visao do Produto | Usuario/Stakeholder | ✅ APROVADO | 2026-02-14 |
| Priorizacao MoSCoW | Usuario/Stakeholder | ✅ APROVADO | 2026-02-14 |
| Roadmap | Usuario/Stakeholder | ✅ APROVADO | 2026-02-14 |
| Decisoes Estrategicas | Usuario/Stakeholder | ✅ APROVADO | 2026-02-14 |

---

## Proximos Passos

1. **Aprovacao do Usuario** - Validar visao e priorizacao
2. **@pm (Morgan)** - Criar PRDs detalhados por epico
3. **@architect (Aria)** - Definir arquitetura tecnica
4. **@ux-design-expert (Luna)** - Wireframes do escritorio virtual
5. **@sm (Max)** - Quebrar em user stories

---

*Documento criado por Sophie (AIOS Product Owner) - 2026-02-14*
*Versao 1.0 - Aguardando aprovacao*
