# Base de Conhecimento — Thiago Finch
## Frameworks, Metodologias e Modelos Mentais para Marketing de Performance

*MMOS Knowledge Base — Fase 4: Knowledge Building*
*Data: 2026-02-24*

---

## 1. Frameworks de Marketing de Performance

### 1.1 Framework ROI First (Pilar Central)

Thiago nunca começa uma campanha sem fechar a equação financeira. O processo:

```
CPA Máximo = (Ticket Médio × Margem Líquida) × (1 + LTV Multiplier)

Exemplo para SPFP:
- Plano mensal: R$49/mês
- Margem líquida: 70%
- Duração média de assinatura: 8 meses
- LTV = R$49 × 8 = R$392
- LTV com margem = R$392 × 0.70 = R$274
- CPA Máximo = R$274 (mas nunca gastar todo o LTV em aquisição)
- CPA Target = R$274 × 30-40% = R$82-110
```

**Regra de ouro**: CAC nunca deve superar 1/3 do LTV em negócios de assinatura. Acima disso, a empresa destrói caixa para crescer.

### 1.2 Funil Triplo de Investimento

#### Estrutura de Alocação de Budget

| Camada | % Budget | Objetivo | Métricas |
|--------|----------|----------|----------|
| Topo (Frio) | 20-30% | Criar consciência | CPM, Reach, Views |
| Meio (Morno) | 30-40% | Nutrição e consideração | CTR, Custo por Visita, Tempo no Site |
| Fundo (Quente) | 30-40% | Conversão | CPA, ROAS, Taxa de Conversão |

**Erro mais comum**: Alocar 90% no fundo do funil e depois reclamar que não tem escala. Sem topo de funil, o fundo seca em 30-60 dias.

**Exceção**: Quando o orçamento é muito pequeno (< R$3.000/mês), focar 100% no fundo para validar a conversão antes de escalar para outros momentos do funil.

### 1.3 Diagnóstico de Campanha em 5 Pontos

Quando uma campanha não performa, Thiago percorre este checklist NESSA ORDEM. A ordem importa porque o problema anterior invalida qualquer solução no problema posterior.

#### Ponto 1: Oferta
- O valor percebido supera claramente o preço?
- A transformação prometida é crível e desejável?
- A garantia elimina o risco de compra?
- Há urgência ou escassez real?

**Teste**: Mostre a oferta para 10 pessoas do ICP. Se 7 de 10 não ficarem animadas, o problema é a oferta. Nenhuma copy vai salvar uma oferta fraca.

#### Ponto 2: Público
- O segmento realmente tem o problema que o produto resolve?
- O poder aquisitivo é compatível com o ticket?
- O interesse declarado (no Meta, por exemplo) realmente indica intenção de compra?
- O tamanho do público suporta o budget alocado?

**Regra**: Público errado + copy boa = desperdício. Público certo + copy razoável = resultado.

#### Ponto 3: Criativo
- Para o scroll nos primeiros 2-3 segundos?
- Comunica claramente o que é o produto/serviço?
- Tem elemento de prova social ou credibilidade?
- A qualidade de produção é adequada ao canal?

**Benchmark Meta Ads**: CTR (link) acima de 1% é bom. Acima de 2% é ótimo. Abaixo de 0.5% = trocar criativo.

#### Ponto 4: Copy
- O headline endereça uma dor real do ICP?
- O corpo explica benefícios, não só features?
- O CTA é claro e diz exatamente o que fazer?
- A copy é coerente com o que o criativo prometeu?

**Estrutura de copy que Thiago usa:**
```
HEADLINE: [Dor ou transformação em 1 linha]
CORPO:
  - Confirmar que entende a dor
  - Apresentar a solução
  - Prova social (número, depoimento, resultado)
  - Oferta com valor percebido alto
  - Garantia que elimina risco
CTA: [Ação específica + urgência]
```

#### Ponto 5: Página de Destino
- A headline da página continua o que o anúncio prometeu?
- O tempo de carregamento está abaixo de 3 segundos?
- O formulário ou botão está acima da dobra?
- Os elementos de confiança estão presentes (SSL, reviews, CNPJ)?
- A taxa de conversão está acima de 2% para tráfego frio?

---

## 2. Como Thiago Estrutura Campanhas

### 2.1 Estrutura de Conta Meta Ads

```
CONTA
└── CAMPANHA (objetivo: conversão / leads)
    └── CONJUNTO DE ANÚNCIOS A (público frio - interesses)
    │   ├── Anúncio 1 (vídeo - angulo dor)
    │   ├── Anúncio 2 (imagem - angulo transformação)
    │   └── Anúncio 3 (carrossel - angulo social proof)
    └── CONJUNTO DE ANÚNCIOS B (lookalike compradores)
        ├── Anúncio 1 (mesmo do A - para testar público)
        └── Anúncio 2 (oferta diferente - para testar oferta)
```

**Regra de nomenclatura** (que Thiago exige do time):
```
[CAMPANHA]: [PRODUTO]-[OBJETIVO]-[DATA]-[VERSÃO]
[ADSET]: [PUBLICO]-[FAIXA_ETARIA]-[GEO]
[AD]: [FORMATO]-[ANGULO]-[VARIANTE]

Exemplo: SPFP-LEAD-FEV26-V1 / INTERESSE_FINANCAS-25-45-BR / VIDEO-DOR-A
```

### 2.2 Orçamento e Ritmo de Testes

**Fase 1 — Validação (Semana 1-2)**
- Budget: R$50-100/dia por conjunto de anúncios
- Objetivo: Encontrar CPL/CPA dentro da meta
- Decisão em: 72h após sair do aprendizado (50+ eventos de otimização)

**Fase 2 — Otimização (Semana 3-4)**
- Matar adsets com CPL > 150% do target
- Duplicar adsets com CPL < 80% do target
- Testar novas variantes de criativo nos adsets vencedores

**Fase 3 — Escala (Mês 2+)**
- Aumentar budget dos vencedores +20-30% a cada 72h
- Introduzir novas campanhas para públicos não testados
- Começar a construir lookalike de compradores

### 2.3 Gestão de Criativos

Thiago tem um sistema de "criativo de desempenho" com ciclo de vida claro:

```
TESTE (7-14 dias) → VENCEDOR (30-60 dias rodando) → FADIGA (CTR caindo) → ARQUIVO
```

**Sinais de fadiga de criativo:**
- CTR (link) caiu 30% vs. semana 1
- Frequência acima de 3.5 (Meta Ads)
- CPA subindo mesmo com budget estável

**Quando renovar criativo:**
- Mínimo 1 novo criativo testado por semana em escala
- Ter sempre 3-5 criativos rodando para não depender de um só

---

## 3. Como Thiago Pensa Sobre ROI e Escala

### 3.1 A Equação de Escala Sustentável

Para Thiago, escala só é sustentável quando:

```
LTV / CAC >= 3x

Se LTV = R$392 e CAC = R$120 → LTV/CAC = 3.27 ✓
Se LTV = R$392 e CAC = R$250 → LTV/CAC = 1.57 ✗ (destruindo valor)
```

**Período de recuperação de CAC (Payback Period)**:
```
Payback = CAC / MRR por usuário
Exemplo: CAC R$120 / R$49 por mês = 2.4 meses para recuperar investimento
```
Payback abaixo de 6 meses é excelente para SaaS. Acima de 12 meses começa a preocupar o caixa.

### 3.2 Alavancas de Escala em Ordem de Eficiência

1. **Expandir públicos nos canais comprovados** (menor risco, maior retorno)
2. **Aumentar budget nos canais comprovados** (escala gradual)
3. **Adicionar novos criativos/ângulos nos canais comprovados** (renovação sem risco)
4. **Testar novos canais com budget marginal** (10-15% do total)
5. **Expandir para novos segmentos do ICP** (novo risco, nova oportunidade)

### 3.3 Quando NÃO Escalar

Thiago é disciplinado sobre quando parar de escalar:

- CPA está acima do target por 3+ dias consecutivos
- Frequência do anúncio está muito alta (audiência esgotada)
- LTV/CAC está caindo (usuários adquiridos na escala são piores)
- Operação não consegue absorver o volume (suporte sobrecarregado)

---

## 4. Abordagem por Canal

### 4.1 Meta Ads (Facebook + Instagram)

**Filosofia**: O maior inventário de audiência do Brasil. Onde a maioria dos consumidores está.

**Estrutura ideal para SPFP:**

| Tipo de Campanha | Objetivo | Público | Budget % |
|-----------------|---------|---------|----------|
| Prospecting | Leads | Interesse em finanças, 28-45 anos | 30% |
| Lookalike | Leads | LLA 1-2% de usuários ativos | 25% |
| Retargeting Morno | Conversão | Visitantes 30-60 dias | 25% |
| Retargeting Quente | Conversão | Visitantes 7 dias + carrinho | 20% |

**Pixel e Eventos Obrigatórios para SPFP:**
```
- PageView (toda visita)
- Lead (cadastro de e-mail)
- CompleteRegistration (criou conta)
- Subscribe (assinou plano pago)
- CustomEvent: "DashboardOpened" (ativação)
- CustomEvent: "TransactionAdded" (engajamento)
```

**Copy Frameworks que funcionam para produto financeiro:**

*Framework PAS (Problem-Agitation-Solution):*
```
PROBLEMA: "Você sabe quanto gastou no mês passado?"
AGITAÇÃO: "A maioria das pessoas descobre só quando o cartão recusa."
SOLUÇÃO: "Com o SPFP, cada gasto é registrado em tempo real."
```

*Framework AIDA (Attention-Interest-Desire-Action):*
```
ATENÇÃO: "Como economizei R$800/mês sem mudar meu estilo de vida"
INTERESSE: "Não cortei nada. Só comecei a ver onde o dinheiro ia."
DESEJO: "Imagina ter clareza total das suas finanças em 5 minutos por dia"
AÇÃO: "Teste grátis por 14 dias. Sem cartão."
```

### 4.2 Google Ads

**Filosofia**: Capturar demanda existente. Quem busca já sabe que precisa.

**Estrutura de campanhas para SPFP:**

```
CAMPANHA 1 — Search (alta intenção)
├── Grupo: "app controle financeiro"
│   └── KWs: app controle financeiro, aplicativo controle gastos, melhor app finanças
├── Grupo: "planilha financeira"
│   └── KWs: planilha controle financeiro, planilha gastos pessoais
└── Grupo: "planejamento financeiro pessoal"
    └── KWs: como fazer planejamento financeiro, organizar finanças pessoais

CAMPANHA 2 — YouTube (awareness + retargeting)
├── Ads curtos (6s): Awareness para visitantes de concorrentes
└── Ads longos (30-60s): Nurturing de quem visitou o site

CAMPANHA 3 — Display (retargeting)
└── Segmento: Visitantes site últimos 30 dias que não converteram
```

**Match types que Thiago usa:**
- Phrase match e exact match para search (evita tráfego irrelevante)
- Nunca broad match sem qualificadores (desperdiça budget)
- Negative keywords obrigatórias: "grátis para sempre", "crack", "pirata", "download"

**Extensões obrigatórias:**
- Sitelinks: Funcionalidades, Preço, Depoimentos, Blog
- Callout: "Segurança bancária", "Suporte 7 dias", "Grátis por 14 dias"
- Structured snippets: "Recursos: Dashboard, Metas, Relatórios, Investimentos"

### 4.3 TikTok Ads

**Filosofia**: Canal de descoberta. Não é intenção, é interrupção qualificada. Criativo é tudo.

**Quando usar para SPFP:**
- Se ICP inclui 22-35 anos
- Quando CPL do Meta começa a subir (diversificação)
- Para atingir público que não está no Instagram

**O que funciona no TikTok:**
```
- Vídeos que parecem orgânicos (não parecem propaganda)
- Hook nos primeiros 2-3 segundos (senão o usuário passa)
- Transformação visual clara (antes/depois do controle financeiro)
- Narrador em primeira pessoa falando direto para câmera
- Texto na tela com pontos principais (muitos assistem sem som)
- CTA no final: "Link na bio / Testar grátis"
```

**O que NÃO funciona no TikTok:**
- Vídeos muito produzidos (parecem comercial, get skipped)
- Informação demais em muito pouco tempo
- CTA muito cedo (antes de criar valor)
- Música corporativa

---

## 5. Como Thiago Analisa Métricas

### 5.1 Dashboard Prioritário (o que olhar primeiro)

```
Nível 1 — Saúde Geral (olhar todo dia):
├── CAC do período (custo para adquirir 1 usuário pagante)
├── MRR novo (quanto de receita nova gerou hoje/semana)
└── Churn da semana (quantos cancelaram)

Nível 2 — Performance de Canal (olhar a cada 2-3 dias):
├── CPL por canal (Meta, Google, TikTok)
├── Taxa de conversão Lead→Pagante por canal
└── ROAS quando aplicável (se houver venda direta)

Nível 3 — Otimização de Campanha (olhar todo dia):
├── CTR por conjunto de anúncios
├── CPA por adset
├── Frequência (Meta)
└── Quality Score (Google)

Nível 4 — Análise Profunda (olhar semanalmente):
├── LTV por cohort de aquisição
├── Payback period por canal
├── NPS / Satisfação do usuário
└── Feature adoption (quais funcionalidades mais usadas)
```

### 5.2 Métricas de Vaidade que Thiago Ignora

- **Alcance e impressões** sem correlação com conversão
- **Likes e engajamento** em posts quando o objetivo é conversão
- **Cliques** sem qualificação de destino (bounce rate alto = clique sem valor)
- **CPL** sem saber a taxa de conversão lead→venda (CPL baixo com conversão baixa = pior negócio)
- **Seguidores** (o seguidor não paga boleto, o comprador sim)

### 5.3 Como Fazer Relatório Semanal

Thiago exige relatórios semanais neste formato:

```
RELATÓRIO SEMANAL — SEMANA X
Data: [período]

NÚMEROS DA SEMANA:
- Gasto total: R$X
- Leads gerados: X
- CPL: R$X
- Novos assinantes: X
- CAC: R$X
- MRR adicionado: R$X

DESTAQUE POSITIVO:
[O que funcionou e por quê]

DESTAQUE NEGATIVO:
[O que não funcionou e hipótese do porquê]

AÇÕES PARA PRÓXIMA SEMANA:
1. [Ação específica]
2. [Ação específica]
3. [Ação específica]

TESTES EM ANDAMENTO:
- Teste A: [descrição] — resultado esperado em [data]
- Teste B: [descrição] — resultado esperado em [data]
```

### 5.4 Análise de Cohort — A Métrica que Thiago Mais Valoriza

Para SaaS, Thiago obceca com análise de cohort:

```
Cohort = grupo de usuários que entraram no mesmo período

Exemplo para SPFP:
Cohort Janeiro 2026: 100 usuários
├── Mês 1: 100 ativos (100%)
├── Mês 2: 78 ativos (78%) → churn 22%
├── Mês 3: 65 ativos (65%) → churn adicional 17%
├── Mês 4: 60 ativos (60%) → começa a estabilizar
└── Mês 6: 58 ativos (58%) → curva de retenção "salva"

Interpretação: Se a curva de retenção estabiliza acima de 50%, o produto tem um core de usuários leais.
Ação: Entender o que fizeram nos primeiros 30 dias os que ficaram vs. os que saíram.
```

---

## 6. Copywriting — A Filosofia de Thiago

### 6.1 Os Níveis de Consciência do Consumidor (Eugene Schwartz aplicado)

| Nível | Estado do Consumidor | Copy Ideal |
|-------|---------------------|-----------|
| 5 | Não sabe que tem problema | Educação + identificação do problema |
| 4 | Sabe que tem problema, não sabe que existe solução | Revelar que existe solução |
| 3 | Sabe que existe solução, não conhece sua solução | Apresentar sua solução |
| 2 | Conhece sua solução, não está convicto | Comparação, prova social, garantia |
| 1 | Pronto para comprar | Oferta clara + CTA direto |

**Para SPFP**: A maioria do público está entre nível 4 e 3. Muitos sabem que precisam organizar finanças mas não conhecem o app. A copy deve revelar o problema de forma vívida e apresentar a solução com prova.

### 6.2 Gatilhos de Conversão para Produto Financeiro

- **Autoridade**: "Usado por mais de X usuários no Brasil"
- **Prova social**: "Maria economizou R$X nos primeiros 60 dias"
- **Urgência**: "Oferta de lançamento válida até [data]"
- **Escassez**: "Apenas X vagas no plano anual com desconto"
- **Segurança**: "Seus dados protegidos com criptografia bancária"
- **Reciprocidade**: "14 dias grátis. Sem cartão. Sem risco."
- **Compromisso**: "Comece preenchendo só seu objetivo financeiro principal"

---

*Base de Conhecimento — Thiago Finch*
*MMOS Mind Mapper — Fase 4 de 5 concluída*
