---
task-id: optimize-ads
agent: media-buyer
inputs:
  - name: metricas-campanha
    description: Dados de performance das campanhas ativas (últimos 3-7 dias)
outputs:
  - description: Ajustes implementados nas campanhas + registro das mudanças realizadas
ferramentas: [Meta Ads Manager, Google Ads, TikTok Ads Manager, Google Analytics]
---

## O que faz
- Analisa métricas diariamente: ROAS, CPA, CTR, CPM, frequência
- Identifica conjuntos de anúncios abaixo da meta por 3+ dias consecutivos
- Ajusta segmentação de público (expande, restringe, exclui audiências)
- Pausa criativos com CTR < 1% após 1.000+ impressões
- Testa variações de público (uma variável por vez)
- Reduz budget de campanhas não performando
- Documenta todas as otimizações realizadas com justificativa

## Não faz
- Pausar campanha inteira sem consultar Head (apenas conjuntos/anúncios)
- Mudar objetivo da campanha em andamento
- Trocar criativos sem ter novos aprovados pelo COPY

## Ferramentas
- Meta Ads Manager
- Google Ads
- TikTok Ads Manager
- Google Analytics 4

## Regras de otimização

| Situação | Ação |
|----------|------|
| CTR < 0.8% por 3 dias | Pausar criativo |
| CPA > 2x meta por 5 dias | Pausar conjunto |
| ROAS < 1.5x por 7 dias | Revisar público + criativo |
| Frequência > 3.5 | Rotacionar criativos |
| CPM aumentando 50%+ | Ampliar público |

## Cadência de análise
- **Diária**: Checar gastos e resultados em tempo real
- **Semanal**: Otimizações maiores (públicos, orçamentos)
- **Quinzenal**: Auditoria completa das campanhas ativas
