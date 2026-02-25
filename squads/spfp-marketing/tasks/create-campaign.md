---
task-id: create-campaign
agent: media-buyer
inputs:
  - name: briefing
    description: Objetivo da campanha, produto/oferta, público-alvo, prazo
  - name: budget
    description: Budget aprovado pelo Head de Marketing
outputs:
  - description: Campanha configurada e ativa nas plataformas definidas
ferramentas: [Meta Ads Manager, Google Ads, TikTok Ads Manager, Pixel]
---

## O que faz
- Cria estrutura de campanha (campanha > conjunto > anúncio)
- Configura objetivo correto (conversão, leads, tráfego, awareness)
- Configura pixel e eventos de conversão (cadastro, compra, trial)
- Define segmentação de público inicial (interesse, comportamento, lookalike)
- Define budget diário e período da campanha
- Sobe criativos recebidos do COPY na estrutura criada
- Ativa campanha e monitora primeiras 24h

## Não faz
- Criar artes e criativos (recebe do COPY)
- Escrever copy dos anúncios (recebe do COPY)
- Aprovar budget acima do definido pelo Head (escala para aprovação)

## Ferramentas
- Meta Ads Manager
- Google Ads
- TikTok Ads Manager
- Meta Events Manager (Pixel)
- Google Tag Manager

## Estrutura padrão de campanha (Meta Ads)

```
Campanha: [Objetivo] - SPFP - [Data]
  ├── Conjunto A: Interesse - Finanças Pessoais (R$ X/dia)
  │   ├── Anúncio 1: [Criativo A]
  │   └── Anúncio 2: [Criativo B]
  └── Conjunto B: Lookalike 1% - Clientes (R$ X/dia)
      ├── Anúncio 1: [Criativo A]
      └── Anúncio 2: [Criativo B]
```

## Checklist pré-ativação
- [ ] Pixel instalado e disparando corretamente
- [ ] Evento de conversão configurado
- [ ] Budget total dentro do aprovado
- [ ] Criativos aprovados pelo Head
- [ ] UTMs configurados para Analytics
