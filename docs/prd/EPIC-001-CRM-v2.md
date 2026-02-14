# PRD: EPIC-001 - CRM v2

**Product Manager:** Morgan (AIOS PM Agent)
**Versao:** 1.0
**Data:** 2026-02-14
**Prioridade:** ALTA
**Sprint Estimado:** 2-4 (4-8 semanas)

---

## 1. Objetivo

Transformar o CRM atual em uma central de relacionamento inteligente que automatiza a comunicacao com clientes atraves de atas profissionais, organiza materiais de reuniao e oferece uma experiencia visual moderna e completa.

### Problemas a Resolver

1. **Comunicacao Manual:** Planejadores gastam muito tempo escrevendo atas de reuniao manualmente
2. **Materiais Desorganizados:** Slides e documentos de reuniao espalhados em pastas locais
3. **UI Datada:** Interface do CRM precisa de modernizacao para competir no mercado
4. **Falta de Historico:** Nao ha registro centralizado de comunicacoes enviadas

---

## 2. Escopo

### 2.1 Incluso (In Scope)

| ID | Item | Tipo |
|----|------|------|
| F001.1 | Modernizacao UI/UX do CRM | Redesign |
| F001.2 | Sistema de Atas de Reuniao | Feature |
| F001.3 | Sistema de Atas de Investimentos | Feature |
| F001.4 | Envio por Email | Integracao |
| F001.5 | Envio por WhatsApp | Integracao |
| F001.6 | Templates Editaveis | Feature |
| F001.7 | Aba de Arquivos/Slides | Feature |
| F001.8 | Historico de Atas Enviadas | Feature |

### 2.2 Excluso (Out of Scope)

- Integracao com calendarios externos (Google Calendar, Outlook)
- Assinatura digital de documentos
- Video chamadas integradas
- CRM para multiplos usuarios/equipe (fase futura)
- Automacao de follow-up

---

## 3. Requisitos Funcionais

### RF-001: Modernizacao UI/UX do CRM

**Descricao:** Redesenhar a interface do AdminCRM para uma experiencia mais moderna, limpa e profissional.

**Criterios de Aceitacao:**
- [ ] AC-001.1: Design system consistente com glassmorphism
- [ ] AC-001.2: Cards de cliente com mais informacoes visiveis
- [ ] AC-001.3: Animacoes e transicoes suaves (framer-motion ou CSS)
- [ ] AC-001.4: Dark mode otimizado com bom contraste
- [ ] AC-001.5: Layout responsivo para tablet e mobile
- [ ] AC-001.6: Skeleton loading durante carregamento
- [ ] AC-001.7: Empty states com ilustracoes

**Melhorias Especificas:**
```
Atual                          Novo
--------------------------     --------------------------
Cards basicos                  Cards expandiveis com acoes
Health score numerico          Health score visual (gauge)
Lista simples                  Grid com filtros avancados
Busca basica                   Busca com autocomplete
```

---

### RF-002: Sistema de Atas de Reuniao

**Descricao:** Permitir criacao, personalizacao e envio de atas de reuniao para clientes.

**Criterios de Aceitacao:**
- [ ] AC-002.1: Botao "Nova Ata de Reuniao" no perfil do cliente
- [ ] AC-002.2: Formulario com campos: data reuniao, data proxima, topicos, pendencias
- [ ] AC-002.3: Editor rich-text para topicos (suporte a emojis)
- [ ] AC-002.4: Lista de Finclass/materiais recomendados
- [ ] AC-002.5: Preview da ata antes de enviar
- [ ] AC-002.6: Salvar como rascunho
- [ ] AC-002.7: Template padrao configuravel

**Template Padrao:**
```
Ata da reuniao - {cliente} - {data}

📅 Proxima: {data_proxima} as {hora}

{topicos_com_emojis}

📌 Pontos pendentes:
{lista_pendencias}

📚 Materiais recomendados:
{lista_materiais}

Qualquer duvida, estou por aqui! 👊📈
```

---

### RF-003: Sistema de Atas de Investimentos

**Descricao:** Permitir criacao de recomendacoes de investimentos formatadas profissionalmente.

**Criterios de Aceitacao:**
- [ ] AC-003.1: Botao "Nova Ata de Investimentos" no perfil do cliente
- [ ] AC-003.2: Campos: data, cliente, objetivo/perfil
- [ ] AC-003.3: Secao por classe de ativo (Acoes, FIIs, Internacional, RF, Cripto)
- [ ] AC-003.4: Linha por ativo: ticker, nome, valor, quantidade
- [ ] AC-003.5: Calculo automatico de totais por classe
- [ ] AC-003.6: Calculo automatico de percentuais
- [ ] AC-003.7: Resumo consolidado no final
- [ ] AC-003.8: Campo de notas/proximos passos
- [ ] AC-003.9: Preview formatado antes de enviar

**Template Padrao:**
```
📑 ATA DE RECOMENDACAO DE INVESTIMENTOS
📅 Data: {data}
👤 Cliente: {nome}

💼 Alocacao Recomendada

🔹 Acoes
{lista_acoes}

🏢 FIIs
{lista_fiis}

🌍 Internacionais
{lista_internacionais}

💵 Renda Fixa
{lista_rf}

📊 Resumo Total
- Acoes: R$ {total_acoes} ({pct_acoes}%)
- FIIs: R$ {total_fiis} ({pct_fiis}%)
- Internacionais: R$ {total_inter} ({pct_inter}%)
- Renda Fixa: R$ {total_rf} ({pct_rf}%)

✅ Total Geral: R$ {total_geral}

📝 Notas: {notas}

✉️ Qualquer duvida, pode me chamar.
```

---

### RF-004: Envio por Email

**Descricao:** Permitir envio de atas diretamente para o email do cliente.

**Criterios de Aceitacao:**
- [ ] AC-004.1: Botao "Enviar por Email" na tela de preview
- [ ] AC-004.2: Email do cliente pre-populado (editavel)
- [ ] AC-004.3: Assunto personalizavel
- [ ] AC-004.4: Corpo do email = ata formatada em HTML
- [ ] AC-004.5: Confirmacao antes de enviar
- [ ] AC-004.6: Feedback de sucesso/erro
- [ ] AC-004.7: Registro no historico de envios

**Integracao Sugerida:**
- Opcao 1: Resend API (simples, bom free tier)
- Opcao 2: SendGrid (robusto, mais complexo)
- Opcao 3: Supabase Edge Functions + SMTP

---

### RF-005: Envio por WhatsApp

**Descricao:** Permitir envio de atas via WhatsApp do cliente.

**Criterios de Aceitacao:**
- [ ] AC-005.1: Botao "Enviar por WhatsApp" na tela de preview
- [ ] AC-005.2: Telefone do cliente pre-populado (editavel)
- [ ] AC-005.3: Ata formatada para texto plano (WhatsApp)
- [ ] AC-005.4: Abre WhatsApp Web/App com mensagem pre-preenchida
- [ ] AC-005.5: Registro no historico de envios
- [ ] AC-005.6: Suporte a numeros BR e internacionais

**Implementacao:**
```javascript
// Deep link para WhatsApp
const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(ataText)}`;
window.open(whatsappUrl, '_blank');
```

---

### RF-006: Templates Editaveis

**Descricao:** Permitir que usuarios personalizem os templates padrao de atas.

**Criterios de Aceitacao:**
- [ ] AC-006.1: Tela de configuracao de templates
- [ ] AC-006.2: Editor para template de Ata de Reuniao
- [ ] AC-006.3: Editor para template de Ata de Investimentos
- [ ] AC-006.4: Variaveis disponiveis listadas ({cliente}, {data}, etc)
- [ ] AC-006.5: Preview em tempo real
- [ ] AC-006.6: Restaurar template padrao
- [ ] AC-006.7: Templates salvos por usuario

---

### RF-007: Aba de Arquivos/Slides

**Descricao:** Sistema de gestao de arquivos para materiais de reuniao.

**Criterios de Aceitacao:**
- [ ] AC-007.1: Nova aba "Arquivos" no menu do CRM
- [ ] AC-007.2: Upload via drag & drop ou botao
- [ ] AC-007.3: Tipos suportados: PDF, PPT, PPTX, PNG, JPG, JPEG
- [ ] AC-007.4: Limite de tamanho: 10MB por arquivo
- [ ] AC-007.5: Categorias: Investimentos, Planejamento, Educacional, Outros
- [ ] AC-007.6: Visualizador inline para PDF
- [ ] AC-007.7: Favoritar arquivos frequentes
- [ ] AC-007.8: Busca por nome
- [ ] AC-007.9: Ordenar por data, nome, categoria
- [ ] AC-007.10: Excluir arquivo com confirmacao

**Estrutura Supabase Storage:**
```
bucket: spfp-files
├── {user_id}/
│   ├── investimentos/
│   │   ├── apresentacao-carteira.pdf
│   │   └── ...
│   ├── planejamento/
│   ├── educacional/
│   └── outros/
```

---

### RF-008: Historico de Atas Enviadas

**Descricao:** Manter registro de todas as atas enviadas por cliente.

**Criterios de Aceitacao:**
- [ ] AC-008.1: Aba "Historico" no perfil do cliente
- [ ] AC-008.2: Lista de atas enviadas com data, tipo, canal
- [ ] AC-008.3: Visualizar ata enviada
- [ ] AC-008.4: Reenviar ata existente
- [ ] AC-008.5: Filtrar por tipo (Reuniao/Investimentos)
- [ ] AC-008.6: Filtrar por canal (Email/WhatsApp)
- [ ] AC-008.7: Ordenar por data (mais recente primeiro)

**Modelo de Dados:**
```typescript
interface AtaEnviada {
  id: string;
  user_id: string;
  client_id: string;
  type: 'reuniao' | 'investimentos';
  channel: 'email' | 'whatsapp';
  content: string;
  recipient: string; // email ou telefone
  sent_at: string;
  created_at: string;
}
```

---

## 4. Requisitos Nao-Funcionais

### RNF-001: Performance
- Upload de arquivos com progress bar
- Compressao de imagens antes do upload
- Lazy loading de arquivos na lista
- Cache de arquivos frequentes

### RNF-002: Seguranca
- Arquivos acessiveis apenas pelo dono (RLS)
- Validacao de tipo de arquivo no backend
- Sanitizacao de nomes de arquivo
- HTTPS para todas as transferencias

### RNF-003: Usabilidade
- Fluxo de criacao de ata em menos de 5 cliques
- Atalhos de teclado para acoes frequentes
- Autosave de rascunhos a cada 30 segundos
- Confirmacao antes de descartar alteracoes

### RNF-004: Limites
- Storage por usuario: 500MB (free tier)
- Emails por mes: 100 (free tier)
- Atas salvas por cliente: ilimitado

---

## 5. Wireframes

### 5.1 Perfil do Cliente (Novo)

```
+------------------------------------------------------------------+
| < Voltar                                    [Editar] [Mais ▼]    |
+------------------------------------------------------------------+
|                                                                  |
|  [Avatar]  Joao Silva                              Health: 85    |
|            joao@email.com | (11) 99999-9999        [=========]   |
|                                                                  |
+------------------------------------------------------------------+
|  [Resumo]  [Atas]  [Arquivos]  [Timeline]                       |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------+  +------------------+                      |
|  | 📝 Nova Ata de   |  | 📊 Nova Ata de   |                      |
|  |    Reuniao       |  |    Investimentos |                      |
|  +------------------+  +------------------+                      |
|                                                                  |
|  Historico de Atas                                [Filtrar ▼]   |
|  +------------------------------------------------------------+ |
|  | 📝 Ata de Reuniao      | 14/02/2026 | Email    | [Ver] [↻] | |
|  | 📊 Ata Investimentos   | 10/02/2026 | WhatsApp | [Ver] [↻] | |
|  | 📝 Ata de Reuniao      | 01/02/2026 | Email    | [Ver] [↻] | |
|  +------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 5.2 Editor de Ata de Reuniao

```
+------------------------------------------------------------------+
| Nova Ata de Reuniao                                    [X]       |
+------------------------------------------------------------------+
|                                                                  |
|  Cliente: Joao Silva                                             |
|                                                                  |
|  Data da Reuniao:     [14/02/2026]                              |
|  Proxima Reuniao:     [28/02/2026] as [10:00]                   |
|                                                                  |
|  Topicos Discutidos:                                            |
|  +------------------------------------------------------------+ |
|  | 🚀 Iniciamos o onboarding e coletamos objetivos            | |
|  | 🏠 Projeto: compra de imovel em 5 anos                     | |
|  | 👴 Aposentadoria aos 60 anos                               | |
|  +------------------------------------------------------------+ |
|  [+ Adicionar topico]                                           |
|                                                                  |
|  Pontos Pendentes:                                              |
|  +------------------------------------------------------------+ |
|  | [ ] Fazer portabilidade para Rico                          | |
|  | [ ] Enviar documentos                                      | |
|  +------------------------------------------------------------+ |
|  [+ Adicionar pendencia]                                        |
|                                                                  |
|  Materiais Recomendados:                                        |
|  +------------------------------------------------------------+ |
|  | Finclass - O Guia do Planejamento Financeiro               | |
|  +------------------------------------------------------------+ |
|  [+ Adicionar material]                                         |
|                                                                  |
|  [Salvar Rascunho]    [Preview]    [Enviar ▼]                   |
|                                                                  |
+------------------------------------------------------------------+
```

### 5.3 Aba de Arquivos

```
+------------------------------------------------------------------+
| Arquivos                           [Upload] [+ Nova Pasta]       |
+------------------------------------------------------------------+
| Buscar: [________________________]    Categoria: [Todas ▼]       |
+------------------------------------------------------------------+
|                                                                  |
|  ⭐ Favoritos                                                    |
|  +------------------------------------------------------------+ |
|  | 📄 Apresentacao-Investimentos-2026.pdf    | 2.3MB | [···]  | |
|  | 📄 Guia-Planejamento-Financeiro.pdf       | 1.1MB | [···]  | |
|  +------------------------------------------------------------+ |
|                                                                  |
|  📁 Investimentos (5 arquivos)                                  |
|  +------------------------------------------------------------+ |
|  | 📄 Carteira-Recomendada-Fev.pdf           | 856KB | [···]  | |
|  | 📄 Analise-FIIs-2026.pdf                  | 1.2MB | [···]  | |
|  +------------------------------------------------------------+ |
|                                                                  |
|  📁 Planejamento (3 arquivos)                                   |
|  📁 Educacional (8 arquivos)                                    |
|                                                                  |
+------------------------------------------------------------------+
| Storage usado: 45MB de 500MB                    [Gerenciar]      |
+------------------------------------------------------------------+
```

---

## 6. Dependencias

### 6.1 Dependencias Tecnicas

| Dependencia | Tipo | Status | Acao |
|-------------|------|--------|------|
| Supabase Storage | Infraestrutura | Disponivel | Criar bucket |
| API de Email | Servico Externo | A escolher | Configurar Resend |
| react-pdf | Biblioteca | A instalar | npm install |
| framer-motion | Biblioteca | A instalar | npm install |
| EPIC-004 | Prerequisito | Em andamento | Concluir primeiro |

### 6.2 Modelo de Dados (Novas Tabelas)

```sql
-- Tabela de atas enviadas
CREATE TABLE sent_atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID, -- Referencia opcional ao cliente
  client_name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('reuniao', 'investimentos')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  content TEXT NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de templates customizados
CREATE TABLE custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('reuniao', 'investimentos')),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de arquivos (metadata)
CREATE TABLE user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 7. Riscos

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Limite de emails excedido | Media | Medio | Alertar usuario, upgrade path |
| WhatsApp bloqueia deep links | Baixa | Alto | Fallback para copiar texto |
| Storage cheio rapidamente | Media | Medio | Quotas claras, compressao |
| Complexidade do editor de atas | Media | Medio | MVP simplificado primeiro |

---

## 8. Metricas de Sucesso

| Metrica | Baseline | Target | Prazo |
|---------|----------|--------|-------|
| Atas enviadas/mes | 0 | 50+ | 1 mes |
| Tempo para criar ata | N/A | < 5 min | 1 mes |
| Arquivos uploadados | 0 | 100+ | 2 meses |
| NPS do CRM | N/A | 8+ | 3 meses |
| Usuarios ativos no CRM | N/A | 80% | 1 mes |

---

## 9. Fases de Entrega

### Fase 2.1: UI Modernizada (Sprint 2)
- Redesign visual do AdminCRM
- Cards de cliente melhorados
- Responsividade

### Fase 2.2: Sistema de Atas (Sprint 3)
- Ata de Reuniao completa
- Ata de Investimentos completa
- Preview e salvamento

### Fase 2.3: Envio e Arquivos (Sprint 4)
- Integracao Email
- Integracao WhatsApp
- Aba de Arquivos
- Historico

---

## 10. User Stories Principais

### US-101: Criar Ata de Reuniao
**Como** planejador financeiro
**Quero** criar uma ata de reuniao formatada
**Para que** meu cliente tenha um registro profissional do que discutimos

### US-102: Enviar Ata por WhatsApp
**Como** planejador financeiro
**Quero** enviar a ata diretamente pelo WhatsApp
**Para que** o cliente receba no canal que ele mais usa

### US-103: Organizar Materiais
**Como** planejador financeiro
**Quero** ter meus slides e documentos organizados
**Para que** eu encontre rapidamente durante reunioes

### US-104: Ver Historico de Comunicacoes
**Como** planejador financeiro
**Quero** ver todas as atas que enviei para um cliente
**Para que** eu tenha contexto das conversas anteriores

---

*PRD criado por Morgan (AIOS PM) - 2026-02-14*
