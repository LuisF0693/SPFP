# STY-089: Dashboard Marketing

**Epic:** EPIC-002 - Corporate HQ
**PRD:** EPIC-002-Corporate-HQ.md
**Priority:** P1 ALTA
**Effort:** 8h
**Status:** PENDING

---

## Descrição

Implementar dashboard com gestão de conteúdo de marketing, incluindo calendário de posts, lista de criativos com status, métricas de engajamento (se integrado), e fluxo de criação/aprovação de posts.

## User Story

**Como** empresário usuário do SPFP,
**Quero** gerenciar meu conteúdo de marketing em um dashboard visual,
**Para que** eu organize e aprova posts de forma eficiente.

---

## Layout do Dashboard

```
+------------------------------------------------------------------+
| MARKETING                                            [X] Fechar  |
+------------------------------------------------------------------+
| [+ Novo Post]                                      Filtro: [Todos]|
+------------------------------------------------------------------+
|  Calendário de Posts (Mês Atual)                                  |
|  [Dom] [Seg] [Ter] [Qua] [Qui] [Sex] [Sáb]                        |
|         [📝]       [✅]           [📤]        [⏳]                |
+------------------------------------------------------------------+
|                                                                  |
|  Criativos                         Status      Plataforma  Ações |
|  ──────────────────────────────────────────────────────────────  |
|  Post Instagram #1                 ✅ Aprovado   Instagram   [Editar]|
|  Promoção LinkedIn                 ⏳ Pendente   LinkedIn    [Editar]|
|  Tutorial TikTok                   📝 Rascunho   TikTok      [Editar]|
|  Behind the Scenes                 📤 Postado    Instagram   [Ver]  |
+------------------------------------------------------------------+
|                                                                  |
|  Métricas de Engajamento (se integrado)                          |
|  ❤️ 1.2k Likes   💬 89 Comments   🔄 45 Shares   👁️ 5.4k Reach  |
+------------------------------------------------------------------+
```

---

## Acceptance Criteria

- [ ] **AC-004.1:** Modal/Drawer abre ao clicar em "Marketing" no mapa
- [ ] **AC-004.2:** Calendário de posts do mês atual com indicadores visuais
- [ ] **AC-004.3:** Lista de criativos com status: Rascunho, Pendente, Aprovado, Postado, Rejeitado
- [ ] **AC-004.4:** Métricas de engajamento (likes, comments, shares, reach) - placeholder se não integrado
- [ ] **AC-004.5:** Criar novo post (título, descrição, data, plataforma)
- [ ] **AC-004.6:** Upload de imagem do criativo (Supabase Storage)
- [ ] **AC-004.7:** Aprovar/Rejeitar posts pendentes com um clique

---

## Status de Posts

| Status | Cor | Ícone | Descrição |
|--------|-----|-------|-----------|
| Rascunho | Cinza | 📝 | Em criação |
| Aguardando Aprovação | Amarelo | ⏳ | Pronto para revisão |
| Aprovado | Verde | ✅ | Aprovado, aguardando postagem |
| Postado | Azul | 📤 | Publicado na plataforma |
| Rejeitado | Vermelho | ❌ | Não aprovado |

---

## Technical Implementation

### Modelo de Dados
```typescript
interface MarketingPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'other';
  status: 'draft' | 'pending' | 'approved' | 'posted' | 'rejected';
  scheduled_date?: string;
  posted_date?: string;
  image_url?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  created_at: string;
  updated_at: string;
}

type PostStatus = 'draft' | 'pending' | 'approved' | 'posted' | 'rejected';
type Platform = 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'other';

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: string }> = {
  instagram: { label: 'Instagram', color: '#E4405F', icon: '📷' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', icon: '💼' },
  tiktok: { label: 'TikTok', color: '#000000', icon: '🎵' },
  youtube: { label: 'YouTube', color: '#FF0000', icon: '▶️' },
  other: { label: 'Outro', color: '#6B7280', icon: '📄' }
};
```

### Estrutura de Arquivos
```
src/components/corporate/dashboards/
├── MarketingDashboard.tsx
├── PostCalendar.tsx
├── PostList.tsx
├── PostCard.tsx
├── CreatePostModal.tsx
└── EngagementMetrics.tsx
```

---

## Tasks

- [ ] 1. Criar componente `MarketingDashboard.tsx` com layout
- [ ] 2. Criar componente `PostCalendar.tsx` com grid mensal
- [ ] 3. Criar componente `PostList.tsx` com lista de criativos
- [ ] 4. Criar componente `PostCard.tsx` com ações
- [ ] 5. Criar componente `CreatePostModal.tsx` para novo post
- [ ] 6. Criar componente `EngagementMetrics.tsx`
- [ ] 7. Implementar upload de imagem (Supabase Storage)
- [ ] 8. Implementar ações Aprovar/Rejeitar
- [ ] 9. Criar tabela `marketing_posts` no Supabase
- [ ] 10. Implementar RLS para marketing_posts
- [ ] 11. Integrar com DepartmentModal
- [ ] 12. Testar fluxo completo de criação de post

---

## Dependencies

- **Bloqueado por:** STY-086 (Mapa do Escritório)
- **Bloqueia:** Nenhum

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Abrir dashboard | Clicar em "Marketing" | Modal abre com calendário |
| 2 | Ver calendário | Verificar mês atual | Posts em suas datas |
| 3 | Criar post | Clicar "+ Novo Post", preencher | Post criado como rascunho |
| 4 | Upload imagem | Selecionar arquivo | Imagem salva e exibida |
| 5 | Aprovar post | Clicar "Aprovar" em pendente | Status muda para aprovado |
| 6 | Rejeitar post | Clicar "Rejeitar" | Status muda para rejeitado |
| 7 | Editar post | Clicar "Editar" | Modal abre com dados |
| 8 | Métricas | Verificar seção | Placeholders ou dados reais |
| 9 | Filtro plataforma | Selecionar "Instagram" | Só posts Instagram |

---

## Database Schema

```sql
CREATE TABLE marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  scheduled_date DATE,
  posted_date TIMESTAMPTZ,
  image_url VARCHAR(500),
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE marketing_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own posts"
  ON marketing_posts FOR ALL
  USING (auth.uid() = user_id);
```

---

## Definition of Done

- [ ] Código implementado e revisado
- [ ] Todos os 7 ACs passando
- [ ] Calendário funcional
- [ ] Upload de imagem funcionando
- [ ] Fluxo de aprovação funcionando
- [ ] Persistência no Supabase
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/corporate/dashboards/MarketingDashboard.tsx
- src/components/corporate/dashboards/PostCalendar.tsx
- src/components/corporate/dashboards/PostList.tsx
- src/components/corporate/dashboards/PostCard.tsx
- src/components/corporate/dashboards/CreatePostModal.tsx
- src/components/corporate/dashboards/EngagementMetrics.tsx

Modified:
- src/components/corporate/DepartmentModal.tsx
```

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** EPIC-002 Sprint 7 (Feed e Kanban)