---
task: Briefing de Campanha
responsavel: "@cmo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - objetivo: Objetivo da campanha (vendas, leads, awareness)
  - produto: Produto/serviço a promover
  - periodo: Duração da campanha
  - budget: Orçamento disponível (opcional)
  - canais: Canais pretendidos (opcional)
Saida: |
  - briefing: Documento completo para o time
  - kpis: Métricas de sucesso
  - cronograma: Timeline da campanha
Checklist:
  - "[ ] Definir objetivo SMART"
  - "[ ] Identificar público da campanha"
  - "[ ] Definir mensagem central"
  - "[ ] Estabelecer KPIs"
  - "[ ] Criar cronograma"
  - "[ ] Distribuir para @copywriter e @designer"
---

# *briefing-campanha

Cria briefing completo para campanhas de marketing, pronto para execução pelo time.

## Uso

```
@cmo *briefing-campanha
# → Modo interativo

@cmo "Crie briefing para lançamento do meu curso de finanças"
```

## Elicitação

```
1. Qual o objetivo principal?
   A. Vendas diretas
   B. Geração de leads
   C. Awareness/alcance
   D. Engajamento

2. O que está promovendo?
   (Produto, serviço, evento, conteúdo)

3. Qual o período da campanha?
   A. Flash (1-3 dias)
   B. Curta (1-2 semanas)
   C. Média (1 mês)
   D. Contínua

4. Qual orçamento para anúncios?
   A. R$0 (orgânico apenas)
   B. R$100-500
   C. R$500-1000
   D. R$1000+

5. Quais canais pretende usar?
   (múltipla escolha)
   [ ] Instagram
   [ ] TikTok
   [ ] YouTube
   [ ] LinkedIn
   [ ] Email
   [ ] WhatsApp
```

## Output

```markdown
# Briefing: [Nome da Campanha]

## Visão Geral
- **Campanha:** [Nome]
- **Período:** [Data início] a [Data fim]
- **Objetivo:** [Objetivo SMART]
- **Budget:** R$[valor]

## Público-Alvo
- **Quem:** [Descrição]
- **Dor principal:** [Problema que resolve]
- **Momento:** [Quando está pronto para comprar]

## Mensagem Central
> "[Frase principal da campanha]"

### Mensagens de Apoio
1. [Hook/gancho de atenção]
2. [Benefício principal]
3. [Prova/credibilidade]
4. [CTA]

## Canais e Formatos

| Canal | Formato | Frequência |
|-------|---------|------------|
| Instagram | Carrossel, Stories, Reels | [X]/semana |
| Email | Sequência de [N] emails | [Datas] |

## KPIs

| Métrica | Meta |
|---------|------|
| [Métrica 1] | [Valor] |
| [Métrica 2] | [Valor] |
| [Conversão final] | [Valor] |

## Cronograma

| Fase | Período | Responsável | Entregável |
|------|---------|-------------|------------|
| Preparação | [Datas] | @designer, @copywriter | Criativos |
| Aquecimento | [Datas] | @cmo | Conteúdo orgânico |
| Lançamento | [Datas] | Todos | Campanha ativa |
| Análise | [Data] | @analista | Relatório |

## Entregáveis Necessários

### Para @copywriter
- [ ] Copy principal (landing/vendas)
- [ ] [N] posts para Instagram
- [ ] Sequência de [N] emails
- [ ] Scripts para Stories

### Para @designer
- [ ] [N] carrosséis
- [ ] [N] posts estáticos
- [ ] Capas de Stories/Destaques
- [ ] Thumbnail (se vídeo)

## Referências
- [Links de inspiração]
- [Campanhas anteriores que funcionaram]
```

## Distribuição

Após criar o briefing:
1. Enviar para `@copywriter` criar textos
2. Enviar para `@designer` criar visuais
3. Agendar review com `@analista` para definir tracking
