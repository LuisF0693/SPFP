# Squad de Marketing Digital - SPFP

Sistema completo de marketing automatizado com agentes IA especializados para empreendedores.

## Visão Geral

O Squad de Marketing Digital é um conjunto de agentes IA que trabalham juntos para criar, aprovar e publicar conteúdo de marketing de forma automatizada.

## Agentes

### Marketing Arm (Operacional)

| Agente | Papel | Responsabilidade |
|--------|-------|------------------|
| 👔 CMO | Chief Marketing Officer | Valida e aprova conteúdo, define estratégia |
| 💡 Ideação | Criador de Ideias | Gera ideias para IG/LinkedIn/YouTube |
| ✍️ Produção | Copywriter | Escreve textos com voz da marca |
| 🎨 Designer | Visual Designer | Cria imagens via AISTUDIO API |
| 📤 Distribuição | Publisher | Publica via Meta API e LinkedIn API |
| 📊 Métricas | Analyst | Analisa performance e otimiza |

### Advisory Board (Estratégico)

| Persona | Especialidade | Source |
|---------|---------------|--------|
| 🧠 Alex Hormozi | Value Equation, Bottleneck Theory, Grand Slam Offers | `.aios-core/agents/alex-hormozi.md` |
| 📝 Eugene Schwartz | Five Levels of Awareness, Breakthrough Advertising, Copy Architecture | `.aios-core/agents/eugene-schwartz.md` |
| 🧘 Naval Ravikant | Filosofia, wealth building, leverage | Inline |
| 🎯 Peter Thiel | Pensamento contrarian, estratégia de monopólio | Inline |
| 🚀 Elon Musk | Visão audaciosa, first principles thinking | Inline |

## Pipeline de Conteúdo

```
[Ideia] → [Produção] → [Design] → [Revisão] → [Aprovado] → [Publicado]
   💡        ✍️          🎨         👔          📤          📊
```

## Formatos de Imagem

| Plataforma | Formato | Dimensões |
|------------|---------|-----------|
| Instagram Feed | Quadrado | 1080x1080 |
| Instagram Portrait | Vertical | 1080x1350 |
| Instagram Stories | Full Screen | 1080x1920 |
| YouTube Thumbnail | Landscape | 1280x720 |
| LinkedIn Post | Quadrado | 1200x1200 |
| LinkedIn Article | Banner | 1200x628 |

## Integrações

- **AISTUDIO API**: Geração de imagens
- **Meta Graph API**: Instagram e Facebook
- **LinkedIn Marketing API**: LinkedIn

## Uso

```typescript
// Ativar o squad
import { MarketingSquad } from './squads/marketing-squad';

// Criar ideia de conteúdo
const idea = await MarketingSquad.agents.ideation.createIdea({
  platform: 'instagram',
  format: 'carousel',
  objective: 'engagement'
});

// Consultar Advisory Board
const advice = await MarketingSquad.agents.hormozi.consult({
  question: 'Como criar uma oferta irresistível para o SPFP?'
});
```

## Configuração

### Brand Voice

Configure a voz da marca em `config/brand-voice.yaml`:

```yaml
brand_voice:
  tone: "profissional mas acessível"
  personality:
    - educativo
    - inspirador
    - prático
  values:
    - transparência
    - simplicidade
    - resultados
  vocabulary:
    use:
      - empreendedor
      - crescimento
      - controle financeiro
    avoid:
      - investidor
      - rico
      - milhonário
```

### Credenciais de Redes Sociais

Configure em `.env`:

```env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
AISTUDIO_API_KEY=your_api_key
```

## Tabelas de Banco de Dados

- `brand_voice` - Configuração de voz da marca
- `social_media_credentials` - Tokens das redes sociais
- `marketing_content` - Posts/conteúdos gerados
- `content_metrics` - Métricas de engajamento
- `marketing_pipeline_history` - Histórico do pipeline

---

*Squad criado por Craft (Squad Creator) - AIOS*
