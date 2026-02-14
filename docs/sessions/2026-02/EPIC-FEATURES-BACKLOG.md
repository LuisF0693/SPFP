# Backlog de Features - 4 Epicos SPFP

**Criado:** 2026-02-14
**Ultima Atualizacao:** 2026-02-14
**Status:** RASCUNHO - Aguardando PRD formal

---

## EPIC-001: CRM v2

### F001.1 - Modernizacao UI/UX do CRM
**Prioridade:** Alta
**Complexidade:** Media

**Descricao:**
Redesenhar interface do CRM para ser mais moderna, bonita e completa.

**Requisitos:**
- [ ] Novo design system (glassmorphism consistente)
- [ ] Layout responsivo melhorado
- [ ] Animacoes e transicoes suaves
- [ ] Dark mode otimizado
- [ ] Cards de cliente mais informativos
- [ ] Dashboard com metricas visuais

---

### F001.2 - Sistema de Atas (Reuniao + Investimentos)
**Prioridade:** Alta
**Complexidade:** Media

**Descricao:**
Sistema para gerar, personalizar e enviar atas de reuniao e recomendacoes de investimentos para clientes.

**Requisitos:**
- [ ] Template de Ata de Reuniao
- [ ] Template de Ata de Investimentos
- [ ] Editor de atas com preview
- [ ] Botao "Enviar por Email" no perfil do cliente
- [ ] Botao "Enviar por WhatsApp" no perfil do cliente
- [ ] Historico de atas enviadas por cliente
- [ ] Personalizacao de templates

**Templates Referencia:**

```markdown
## Ata de Reuniao
- Data da reuniao
- Data proxima reuniao
- Topicos discutidos (com emojis)
- Pontos pendentes
- Materiais recomendados (Finclass)
- Assinatura

## Ata de Investimentos
- Data
- Nome cliente
- Alocacao por classe (Acoes, FIIs, Internacionais, RF)
- Detalhamento por ativo (ticker, valor, quantidade)
- Resumo total
- Notas e proximos passos
```

**Integracoes:**
- Email: Resend, SendGrid ou Supabase Email
- WhatsApp: Deep link `wa.me/{numero}?text={mensagem}` ou API Business

---

### F001.3 - Aba de Arquivos/Slides
**Prioridade:** Media
**Complexidade:** Media

**Descricao:**
Sistema de gestao de arquivos para usar em reunioes com clientes.

**Requisitos:**
- [ ] Upload de arquivos (PDF, PPT, PNG, JPG)
- [ ] Categorias de arquivos (Investimentos, Planejamento, Educacional)
- [ ] Visualizador de PDF/Slides inline
- [ ] Favoritar arquivos frequentes
- [ ] Busca por nome/categoria
- [ ] Limite de storage por usuario

**Tecnologia:**
- Supabase Storage para armazenamento
- React PDF viewer para visualizacao
- Drag & drop upload

---

## EPIC-002: Corporate HQ (Escritorio Virtual)

### F002.1 - Mapa do Escritorio Virtual
**Prioridade:** Alta
**Complexidade:** Muito Alta

**Descricao:**
Escritorio virtual gamificado estilo OPES Big Brother onde o usuario pode "andar" pelo escritorio e acessar departamentos.

**Requisitos:**
- [ ] Mapa 2D top-down estilo RPG
- [ ] Salas/areas para cada departamento
- [ ] Avatar do usuario que pode se mover
- [ ] Personagens NPC representando agentes IA
- [ ] Interacao ao clicar em departamento
- [ ] Animacoes de personagens

**Departamentos:**
1. **Financeiro** - DRE, fluxo de caixa, contas a pagar/receber
2. **Marketing** - Criativos, calendario, analytics de posts
3. **Operacional** - Tarefas, processos, producao
4. **Comercial** - Pipeline, leads, vendas

**Tecnologia Sugerida:**
- Phaser.js ou Pixi.js para game engine
- Tiled Map Editor para criar mapas
- Sprite sheets para personagens

---

### F002.2 - Pipeline Feed Real-Time
**Prioridade:** Alta
**Complexidade:** Alta

**Descricao:**
Feed lateral mostrando atividades dos agentes em tempo real.

**Requisitos:**
- [ ] Feed scrollavel de atividades
- [ ] Timestamps de cada acao
- [ ] Status do agente (RUNNING, IDLE, WAITING)
- [ ] Tipo de atividade com icone
- [ ] Gates de aprovacao (aprovar/rejeitar)
- [ ] Filtro por departamento

**Formato de Mensagem:**
```
[Agente] HH:MM
Descricao da atividade...
[Status Badge]
```

---

### F002.3 - Dashboards por Departamento
**Prioridade:** Media
**Complexidade:** Media

**Descricao:**
Cada departamento tem seu proprio dashboard com metricas especificas.

**Financeiro:**
- Receita vs Despesa
- Contas a pagar/receber
- Fluxo de caixa projetado
- DRE simplificado

**Marketing:**
- Calendario de posts
- Criativos em producao
- Analytics (engajamento, alcance)
- Status: Rascunho, Aprovado, Postado

**Operacional:**
- Kanban de tarefas
- Processos em andamento
- Produtividade da equipe

**Comercial:**
- Pipeline de vendas
- Leads por estagio
- Taxa de conversao
- Meta vs Realizado

---

### F002.4 - Visualizacao de Agentes IA
**Prioridade:** Alta
**Complexidade:** Alta

**Descricao:**
Ver os agentes IA trabalhando em tempo real quando executam comandos no Claude Code.

**Requisitos:**
- [ ] WebSocket para comunicacao real-time
- [ ] Animacao de agente "trabalhando"
- [ ] Bolha de pensamento/acao
- [ ] Log de acoes executadas
- [ ] Indicador de qual agente esta ativo

---

## EPIC-003: AI Automation (MCP Playwright)

### F003.1 - Integracao MCP Playwright
**Prioridade:** Media
**Complexidade:** Alta

**Descricao:**
Permitir que agentes IA visualizem e interajam com o browser/desktop do usuario.

**Requisitos:**
- [ ] Servico de automacao no backend
- [ ] UI para mostrar screenshot do browser
- [ ] Comandos de automacao (click, type, scroll)
- [ ] Permissoes de acesso
- [ ] Log de acoes automatizadas

**Casos de Uso:**
1. Agente preencher formulario web
2. Agente capturar dados de tela
3. Agente navegar e coletar informacoes
4. Demonstracoes automatizadas

---

## EPIC-004: SPFP Core Fixes

### F004.1 - Bug: Parceiros Nao Salvando
**Prioridade:** Critica
**Complexidade:** Baixa

**Descricao:**
Parceiros criados na aba de parceiros do CRM nao estao sendo salvos.

**Diagnostico Inicial:**
- Codigo do hook `usePartnerships.ts` parece correto
- Possivel problema com tabela Supabase ou RLS

**Acoes:**
- [ ] Verificar se tabela `partners_v2` existe
- [ ] Verificar RLS policies
- [ ] Adicionar feedback de erro ao usuario
- [ ] Testar fluxo completo

---

### F004.2 - Editar Categorias Existentes
**Prioridade:** Media
**Complexidade:** Baixa

**Descricao:**
Adicionar capacidade de editar categorias ja criadas (alem de criar novas).

**Requisitos:**
- [ ] Botao de editar em cada categoria
- [ ] Modal de edicao (nome, cor, icone, grupo)
- [ ] Validacao para nao duplicar nomes
- [ ] Confirmacao antes de salvar

**Componentes Afetados:**
- `CreateCategoryModal.tsx` - Adaptar para modo edit
- Lista de categorias na aba Lancamentos
- `FinanceContext.tsx` - Ja tem `updateCategory()`

---

## Matriz de Dependencias

```
EPIC-004 (Core Fixes)
    |
    v
EPIC-001 (CRM v2)
    |
    +---> EPIC-002 (Corporate HQ) - depende de CRM modernizado
    |
    +---> EPIC-003 (AI Automation) - pode rodar em paralelo
```

**Ordem Recomendada:**
1. EPIC-004 - Resolver bugs primeiro
2. EPIC-001 - Base do CRM atualizada
3. EPIC-003 e EPIC-002 em paralelo

---

## Estimativa de Esforco (Alto Nivel)

| Epico | Stories Estimadas | Sprints (2 semanas) |
|-------|-------------------|---------------------|
| EPIC-004 | 2-3 | 0.5 |
| EPIC-001 | 8-12 | 2-3 |
| EPIC-002 | 15-20 | 4-5 |
| EPIC-003 | 5-7 | 1-2 |

**Total Estimado:** 7-10 sprints (3.5-5 meses)

---

*Backlog criado por Atlas (AIOS Analyst)*
*Aguardando revisao do @po e @pm para priorizacao formal*
