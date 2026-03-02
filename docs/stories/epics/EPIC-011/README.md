# EPIC-011 — Marketing Hub

## Objetivo
Criar um hub de marketing dentro do CRM Empresa onde agentes IA criam e armazenam conteúdo, e o SPFP publica automaticamente via Meta Business API e YouTube Data API. Vídeos são salvos em pasta local e uploadados pela plataforma.

## Fluxo de Publicação

```
Agente de Marketing cria conteúdo (texto, imagem, vídeo)
    ↓
Salva no Supabase Storage + cria task "Pronto para publicar"
    ↓
Card aparece na fila de publicação do Marketing Hub
    ↓
Usuário aprova (ou auto-aprovação configurável)
    ↓
SPFP chama:
  ├── Meta Business API → publica no Instagram/Facebook
  └── YouTube Data API → faz upload do vídeo
    ↓
Status atualizado → "Publicado" com link e métricas
```

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 11.1 | Content Workspace (criar, salvar, organizar conteúdos) | Pending | Alta |
| 11.2 | Fila de publicação + content calendar | Pending | Alta |
| 11.3 | Meta Business API (posts, stories, reels) | Pending | Alta |
| 11.4 | YouTube Data API (upload de vídeos) | Pending | Média |

## Dependências
- EPIC-009 concluído (CRM Empresa Core)
- EPIC-010 concluído (Agentes no CRM)
- Supabase Storage — armazenamento de mídia
- Meta Business API credentials (Facebook App)
- YouTube Data API v3 credentials (Google Cloud Console)
- Squads de Marketing do SPFP (@spfp-marketing, @spfp-marketing:agents:media-buyer, etc.)

## Resultado Esperado
- Content workspace onde agentes salvam posts, legendas, imagens e vídeos
- Calendar visual com conteúdos agendados por data e plataforma
- Publicação direta no Instagram/Facebook via Meta Business API
- Upload de vídeos no YouTube via YouTube Data API
- Métricas básicas pós-publicação (likes, views) no card do conteúdo
