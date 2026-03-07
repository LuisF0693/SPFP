# Estrutura de Campanha Meta Ads — SPFP
**Agente:** Media Buyer
**Status:** PRONTA — aguardando gate orgânico para ativar
**Gate:** 2+ clientes fechados via orgânico OU landing page CR ≥ 3%

---

## Equação Financeira (norte de tudo)

```
Plano Essencial: R$99,90/mês → LTV R$1.998 → CAC máximo R$666
Plano Wealth:   R$349,90/mês → LTV R$6.998 → CAC máximo R$2.333

CPL alvo (custo por lead — consulta agendada): R$30-50
Taxa de fechamento alvo: 30%
CAC resultante: R$100-167

Conclusão: há gordura SIGNIFICATIVA. Podemos pagar até R$666 por cliente
e ainda ser rentáveis. Meta: ficar abaixo de R$300.
```

---

## Estrutura de Conta Meta Ads

```
CONTA: SPFP — Luis
│
├── CAMPANHA 1: "Consulta Gratuita — Geração de Leads"
│   Objetivo: Leads
│   Budget: R$30/dia (fase de aprendizado)
│   │
│   ├── ADSET A: Prospecting Amplo
│   │   Público: Brasil — 28-45 anos — interesses:
│   │   [finanças pessoais, controle financeiro, investimentos,
│   │    planejamento financeiro, independência financeira,
│   │    Nubank, Rico, XP Investimentos]
│   │   Placement: Instagram Feed + Reels (automático)
│   │   Budget: R$15/dia
│   │
│   ├── ADSET B: Lookalike da lista de contatos do Luis
│   │   Público: Lookalike 1-3% — Brasil — base: lista de emails
│   │   (exportar contatos do Calendly e WhatsApp para criar audiência)
│   │   Budget: R$10/dia
│   │
│   └── ADSET C: Retargeting
│       Público: Visitantes do site últimos 30 dias + engajamento
│       Instagram últimos 60 dias
│       Budget: R$5/dia
│
└── CAMPANHA 2: "Escala — Vencedores" (ativar após 4 semanas)
    Objetivo: Leads (ou Conversão se pixel configurado)
    Budget: escalar adsets vencedores da Campanha 1
```

---

## Criativos — 3 Versões para Teste Inicial

### Criativo A — Reel Adaptado do Orgânico
**Formato:** Vídeo vertical 9:16, 30-60s
**Gancho (primeiros 3s):** "Você sabe exatamente quanto gastou esse mês?"
**Corpo:** Luis fala direto — sem texto na tela — linguagem de consultor
**CTA final:** "Clique no botão para agendar uma conversa gratuita comigo"
**Copy do anúncio:**
```
Você ganha bem mas nunca sobra nada no fim do mês?

Isso não é falta de disciplina. É falta de clareza.

Em 30 minutos de conversa gratuita, identificamos exatamente
onde o seu dinheiro está indo — e como mudar isso.

👆 Clique em "Saiba mais" para escolher um horário.
Sem compromisso. Sem custo.
```

### Criativo B — Imagem Estática
**Formato:** 1:1 ou 4:5
**Visual:** Foto do Luis em ambiente profissional (não estúdio — natural)
**Headline na imagem:** "Onde foi parar o seu dinheiro esse mês?"
**Copy do anúncio:**
```
Essa é a pergunta que faço para todos os meus clientes na primeira conversa.

A maioria não sabe responder. E tudo bem — é para isso que eu estou aqui.

Consulta diagnóstica gratuita: 30 minutos, sem compromisso.
Você me conta sua situação, eu te mostro o que fazer.

[Link Calendly]
```

### Criativo C — Carrossel "3 erros"
**Formato:** Carrossel 4-6 cards
```
Card 1 (capa): "3 erros financeiros de quem ganha bem (e como resolver)"
Card 2: Erro 1 — "Não saber exatamente quanto ganha líquido" + solução
Card 3: Erro 2 — "Misturar gasto fixo com variável sem categoria" + solução
Card 4: Erro 3 — "Não ter objetivo financeiro definido com prazo" + solução
Card 5: "Quer resolver os 3 de uma vez? → Conversa gratuita comigo"
Card 6: [Foto Luis + nome + "Consultor Financeiro — SPFP"]
```

---

## Landing Page — Briefing para Desenvolvimento

**URL sugerida:** spfp.com.br/consulta (ou subdomínio Calendly personalizado)

**Estrutura obrigatória (ordem exata):**

```
[HERO — acima da dobra]
Headline: "Descubra exatamente para onde vai o seu dinheiro"
Subheadline: "Conversa gratuita de 30 minutos com Luis — consultor financeiro
              com [X] anos de experiência e [X] clientes atendidos"
CTA: [Escolher meu horário] → abre Calendly embed
Foto do Luis (rosto, expressão acessível — não formal demais)

[PROVA SOCIAL — logo abaixo]
3 depoimentos curtos com resultado concreto:
"Descobri que gastava R$890/mês sem saber. Em 3 meses juntei R$2.400." — Rafael, 34 anos

[O QUE ACONTECE NA CONSULTA]
3 bullets simples:
• Mapeamos sua situação financeira atual (sem julgamento)
• Identificamos onde o dinheiro está indo
• Você sai com um caminho claro para os próximos 30 dias

[SOBRE O LUIS — autoridade]
Foto + bio curta (3-4 linhas) + número de clientes atendidos

[CTA FINAL]
"Vagas limitadas essa semana"
[Escolher meu horário]

[RODAPÉ]
Segurança: LGPD, sem spam, pode cancelar quando quiser
```

**Métricas de validação:**
- CR ≥ 3% = landing aprovada para escalar
- CR < 2% por 7 dias = revisar headline e prova social
- CR < 1% = parar e reescrever

---

## Regras de Escala (não negociáveis)

| Condição | Ação |
|----------|------|
| CPL < R$50 por 3 dias | Aumentar budget 30% |
| CPL R$50-100 por 7 dias | Manter — testar novo criativo |
| CPL > R$100 por 7 dias | Pausar adset — problema de público ou criativo |
| CTR < 1% por 7 dias | Trocar criativo — está morrendo de fadiga |
| CAC > R$400 por 4 semanas | Revisar funil inteiro antes de escalar |

**Escala máxima por movimento:** +30% a cada 72h
**Nunca:** aumentar mais de 50% de uma vez — quebra o aprendizado do algoritmo

---

## Cronograma de Ativação

```
AGORA (semanas 1-4):
→ Estrutura criada, criativos prontos, landing briefada
→ Aguardando gate orgânico

SEMANA 5 (se gate atingido):
Dia 1: Criar conta Meta Business Suite
Dia 2: Instalar Pixel no site SPFP
Dia 3: Upload audiências (contatos Luis + visitantes site)
Dia 4: Subir campanha 1 — R$30/dia — todos os adsets
Dia 5-14: Fase de aprendizado — NÃO mexer nos adsets

SEMANA 7:
→ Análise de dados — qual adset tem melhor CPL?
→ Pausar adsets com CPL > R$100
→ Aumentar budget nos vencedores

SEMANA 9+:
→ Escalar vencedores 30% a cada 72h
→ Testar novos criativos semanalmente
```

---

## Dashboard Semanal — Media Buyer

Enviar para Thiago Finch toda segunda-feira:

```
SEMANA [X] — [DATA]

INVESTIMENTO:
├── Gasto total: R$X
├── CPL médio: R$X
└── Melhor adset: [nome] (CPL: R$X)

LEADS:
├── Total de agendamentos: X
├── Realizados: X
└── Taxa de comparecimento: X%

CONVERSÃO:
├── Consultas → clientes: X (X%)
└── CAC da semana: R$X

CRIATIVOS:
├── CTR médio: X%
├── Melhor criativo: [nome] (CTR: X%)
└── Em teste essa semana: [descrição]

AÇÃO RECOMENDADA: [manter / escalar / trocar criativo / pausar]
```

---

**Responsável:** Media Buyer — Squad Marketing SPFP
**Aprovado por:** Thiago Finch
