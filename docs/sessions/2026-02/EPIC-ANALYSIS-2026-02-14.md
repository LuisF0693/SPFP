# Analise de Requisitos - 4 Epicos SPFP

**Data:** 2026-02-14
**Analista:** Atlas (AIOS Analyst Agent)
**Orquestrador:** Orion (AIOS Master)
**Status:** EM PROGRESSO - Pausado para retomada

---

## Resumo Executivo

O usuario solicitou criacao de documentacao (PRD + Stories) para 4 epicos antes de implementacao.

### Epicos Identificados

| ID | Nome | Features | Complexidade |
|----|------|----------|--------------|
| EPIC-001 | CRM v2 | Modernizacao UI, Atas Reuniao/Investimentos, Aba Arquivos | Alta |
| EPIC-002 | Corporate HQ | Escritorio Virtual Gamificado (estilo OPES Big Brother) | Muito Alta |
| EPIC-003 | AI Automation | MCP Playwright integracao | Alta |
| EPIC-004 | SPFP Core Fixes | Bug parceiros nao salvando, Editar categorias | Baixa |

---

## EPIC-004: SPFP Core Fixes - ANALISE COMPLETA

### Bug: Parceiros Nao Salvando

**Arquivo:** `src/hooks/usePartnerships.ts`

**Diagnostico:** O codigo ESTA correto! O hook:
1. Faz update otimista no state local (linha 96-102)
2. Salva em localStorage (linha 99-102)
3. Insere no Supabase se autenticado (linha 105-121)

**Possiveis Causas do Bug:**
1. **Tabela Supabase nao existe** - Verificar se migration `20250210_partnerships.sql` foi executada
2. **RLS Policy bloqueando** - User pode nao ter permissao de INSERT
3. **Erro silencioso** - Erro no Supabase sendo logado mas nao exibido ao usuario
4. **Usuario nao autenticado** - Salvando como 'local' em vez do user.id real

**Tabelas Supabase Necessarias:**
- `partners_v2` - Perfil dos parceiros
- `partnership_clients` - Clientes das parcerias

**Acoes Recomendadas:**
1. **VERIFICADO**: Migration `20250210_partnerships.sql` existe com tabelas corretas
2. **POSSIVEL CAUSA**: Migration pode nao ter sido executada no Supabase
3. **POSSIVEL CAUSA**: Trigger `update_updated_at_column()` pode nao existir (migration depende dele)
4. Adicionar toast/feedback de erro ao usuario
5. Testar com console aberto para ver erros

**Verificacao Necessaria no Supabase Dashboard:**
- Tabela `partners_v2` existe?
- Tabela `partnership_clients` existe?
- Function `update_updated_at_column()` existe?

### Feature: Editar Categorias

**Arquivos Relevantes:**
- `src/components/CreateCategoryModal.tsx` - Apenas criacao
- `src/context/FinanceContext.tsx` - Tem `updateCategory()` (linha 594-596)
- `src/types.ts` - Interface Category

**Estado Atual:**
- `addCategory()` - Implementado
- `updateCategory()` - Implementado no context
- `deleteCategory()` - Implementado
- **UI de edicao** - NAO EXISTE

**Necessario Implementar:**
1. Modal de edicao (ou reusar CreateCategoryModal com modo edit)
2. Botao de editar em cada categoria na lista
3. Icone de lapis/edit ao lado de cada categoria

---

## EPIC-001: CRM v2 - ANALISE PARCIAL

### Componentes CRM Atuais

| Arquivo | Funcao |
|---------|--------|
| `AdminCRM.tsx` | Dashboard principal, lista clientes, health score, impersonation |
| `partnerships/PartnershipsPage.tsx` | Gestao de parceiros e clientes de parceria |
| `partnerships/PartnerForm.tsx` | Formulario criar/editar parceiro |
| `partnerships/PartnerCard.tsx` | Card de exibicao do parceiro |
| `partnerships/ClientForm.tsx` | Formulario cliente de parceria |
| `partnerships/ClientTable.tsx` | Tabela com filtros/ordenacao |

### Feature: Atas de Reuniao/Investimentos

**Exemplos fornecidos pelo usuario:**

#### Ata de Reuniao (Template)
```
Ata da reuniao - {cliente} - {data}
Proxima: {data_proxima} as {hora}

[Topicos discutidos com emojis]

Pontos pendentes:
- Item 1
- Item 2

Finclass pendentes:
- Curso 1
- Curso 2

Qualquer duvida, sigo a disposicao!
```

#### Ata de Investimentos (Template)
```
ATA DE RECOMENDACAO DE INVESTIMENTOS
Data: {data}
Cliente: {nome}

Alocacao Recomendada:
- Acoes: {lista ativos}
- FIIs: {lista fundos}
- Internacionais: {lista ETFs}
- Renda Fixa: {lista RF}

Resumo Total:
- Acoes: R$ X
- FIIs: R$ X
- Total Geral: R$ X

Mensagem: {texto personalizado}
```

**Requisitos:**
1. Botao no perfil do cliente para gerar ata
2. Envio por Email (integrar com API de email)
3. Envio por WhatsApp (deep link ou API WhatsApp Business)
4. Templates editaveis
5. Historico de atas enviadas

### Feature: Aba de Arquivos/Slides

**Requisitos:**
1. Upload de arquivos (PDF, PPT, imagens)
2. Organizacao por categoria (Investimentos, Planejamento, etc)
3. Visualizador de slides na reuniao
4. Supabase Storage para armazenamento

---

## EPIC-002: Corporate HQ - ANALISE INICIAL

### Referencia Visual: OPES Big Brother

Baseado na imagem fornecida, o sistema deve ter:

**Layout Escritorio Virtual:**
- Grid de salas/departamentos (tipo RPG top-down)
- Personagens pixel art representando agentes
- Movimento dos agentes em tempo real
- Areas: Estrategia, Ideacao, Producao, Design, Distribuicao, Metricas

**Departamentos Solicitados:**
1. **Financeiro** - Metricas financeiras da empresa
2. **Marketing** - Criativos, posts, analytics
3. **Operacional** - Processos, tarefas, producao
4. **Comercial** - Vendas, leads, pipeline

**Pipeline Feed (lado direito):**
- Feed em tempo real de atividades
- Status dos agentes (RUNNING, IDLE)
- Mensagens do tipo chat
- Gates de aprovacao

**Tecnologias Sugeridas:**
- Canvas/Pixi.js para renderizacao do mapa
- WebSocket para atualizacoes real-time
- Phaser.js como alternativa para game engine

---

## EPIC-003: AI Automation (MCP Playwright)

### Contexto

O usuario quer que os agentes IA possam:
1. Visualizar o browser do usuario
2. Interagir com elementos na tela
3. Automatizar tarefas no desktop

### MCP Playwright Disponivel

Conforme `.claude/rules/mcp-usage.md`:
- playwright MCP ja esta configurado
- Funcoes: browser automation, screenshots, web testing

**Ferramentas Playwright Disponiveis:**
- `mcp__playwright__browser_navigate` - Navegar para URL
- `mcp__playwright__browser_screenshot` - Capturar tela
- `mcp__playwright__browser_click` - Clicar em elementos
- `mcp__playwright__browser_fill` - Preencher campos
- `mcp__playwright__browser_select` - Selecionar opcoes

### Integracao Necessaria

1. Criar servico de automacao no SPFP
2. Conectar com agentes do Corporate HQ
3. Adicionar UI para mostrar acoes em tempo real
4. Permissoes e controle de acesso

---

## Proximos Passos (Retomar Sessao)

### Squad a Acionar

| # | Agente | Tarefa | Status |
|---|--------|--------|--------|
| 1 | @analyst (Atlas) | Analise requisitos | 60% COMPLETO |
| 2 | @po (Sophie) | Visao produto, priorizacao | PENDENTE |
| 3 | @pm (Morgan) | PRDs detalhados | PENDENTE |
| 4 | @architect (Aria) | Arquitetura tecnica | PENDENTE |
| 5 | @ux-design-expert (Luna) | Wireframes, design | PENDENTE |
| 6 | @data-engineer (Nova) | Modelagem dados | PENDENTE |
| 7 | @sm (Max) | Stories e tasks | PENDENTE |

### Tarefas Pendentes Analyst

1. [ ] Verificar se tabelas Supabase `partners_v2` existem
2. [ ] Analisar `AdminCRM.tsx` para entender estrutura atual
3. [ ] Pesquisar bibliotecas para escritorio virtual (Phaser, Pixi)
4. [ ] Documentar APIs necessarias (Email, WhatsApp)
5. [ ] Mapear componentes existentes de categorias

### Arquivos para Criar

| Documento | Template | Responsavel |
|-----------|----------|-------------|
| `docs/prd/EPIC-001-CRM-v2.md` | prd-tmpl.yaml | @pm |
| `docs/prd/EPIC-002-Corporate-HQ.md` | prd-tmpl.yaml | @pm |
| `docs/prd/EPIC-003-AI-Automation.md` | prd-tmpl.yaml | @pm |
| `docs/prd/EPIC-004-Core-Fixes.md` | prd-tmpl.yaml | @pm |
| `docs/stories/` | story-tmpl.yaml | @sm |

---

## Codigo Relevante Analisado

### usePartnerships.ts (Completo)

```typescript
// Localizacao: src/hooks/usePartnerships.ts
// Linhas: 370
// Funcoes: addPartner, updatePartner, deletePartner, addClient, updateClient, deleteClient
// Storage: localStorage + Supabase
// Keys: spfp_partners_v2_{userId}, spfp_partnership_clients_{userId}
```

### FinanceContext.tsx (Parcial)

```typescript
// Localizacao: src/context/FinanceContext.tsx
// GlobalState inclui: partners, categories
// Funcoes: addCategory, updateCategory, deleteCategory
// Problemas: Categories nao tem soft-delete (falta deletedAt no tipo)
```

---

## Notas da Sessao

- Usuario quer APENAS documentacao primeiro, implementacao depois
- Referencia visual importante: OPES Big Brother (imagem anexada)
- Templates de atas baseados em uso real do Grao (assessoria financeira)
- Prioridade: Bug dos parceiros e UX do CRM antes de features novas

---

*Documento gerado por Atlas (AIOS Analyst) - Sessao 2026-02-14*
*Para retomar: Carregar este documento e continuar de onde parou*
