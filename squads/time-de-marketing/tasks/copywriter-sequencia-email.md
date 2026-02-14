---
task: Sequência de Email
responsavel: "@copywriter"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - objetivo: Objetivo da sequência (vendas, nurturing, onboarding)
  - emails: Número de emails desejados
  - oferta: Produto/serviço sendo promovido
  - gatilho: O que inicia a sequência (lead magnet, compra, etc.)
Saida: |
  - sequencia: Emails completos com subject, preview, corpo
  - calendario: Timing sugerido entre emails
  - automacao: Instruções para configurar
Checklist:
  - "[ ] Definir objetivo da sequência"
  - "[ ] Mapear jornada do lead"
  - "[ ] Criar cada email"
  - "[ ] Definir timing"
  - "[ ] Revisar fluxo completo"
---

# *sequencia-email

Cria sequências de email marketing completas: vendas, nurturing, onboarding, lançamento.

## Uso

```
@copywriter *sequencia-email
# → Modo interativo

@copywriter "Crie uma sequência de 5 emails para vender meu curso"

@copywriter "Crie emails de boas-vindas para novos inscritos"
```

## Tipos de Sequência

| Tipo | Objetivo | Emails | Duração |
|------|----------|--------|---------|
| Welcome | Apresentar e engajar | 3-5 | 1 semana |
| Nurturing | Educar e aquecer | 5-7 | 2-3 semanas |
| Lançamento | Vender produto | 5-10 | 7-14 dias |
| Carrinho abandonado | Recuperar venda | 3 | 3 dias |
| Pós-compra | Fidelizar | 3-5 | 2 semanas |

## Elicitação

```
1. Qual o objetivo da sequência?
   A. Vender um produto/serviço
   B. Nutrir leads (educação)
   C. Boas-vindas/onboarding
   D. Recuperar carrinho abandonado
   E. Pós-compra/fidelização

2. O que dispara a sequência?
   A. Download de material gratuito
   B. Inscrição na lista
   C. Abandono de carrinho
   D. Compra realizada
   E. Outro: [especificar]

3. Quantos emails você quer?
   A. 3 (sequência curta)
   B. 5 (padrão)
   C. 7+ (lançamento completo)

4. Qual a oferta principal?
   (O que você quer que façam no final)

5. Qual a principal objeção do seu público?
   (Por que NÃO comprariam)
```

## Estrutura de Cada Email

```markdown
## Email [N]: [Nome/Objetivo]

**Timing:** [Dia X após gatilho]

**Subject:** [Linha de assunto]
**Preview:** [Texto de preview]

---

[Corpo do email]

---

**CTA:** [Ação desejada]
**Link:** [placeholder para URL]
```

## Output

```markdown
# Sequência: [Nome] - [Objetivo]

## Visão Geral

| # | Email | Timing | Objetivo |
|---|-------|--------|----------|
| 1 | [Nome] | Imediato | [Objetivo] |
| 2 | [Nome] | Dia 2 | [Objetivo] |
| 3 | [Nome] | Dia 4 | [Objetivo] |
| 4 | [Nome] | Dia 6 | [Objetivo] |
| 5 | [Nome] | Dia 7 | [Objetivo] |

---

## Email 1: [Nome]

**Timing:** Imediato após [gatilho]
**Objetivo:** [O que este email deve alcançar]

**Subject:** [Linha de assunto]
**Preview:** [Primeiras palavras visíveis]

---

Olá, [Nome]!

[Corpo do email - 150-300 palavras]

[CTA claro]

[Assinatura]

---

## Email 2: [Nome]
...

## Email 3: [Nome]
...

---

## Instruções de Configuração

### Ferramenta: [Mailchimp/ConvertKit/etc.]

1. Criar automação com gatilho: [especificar]
2. Configurar delays entre emails
3. Adicionar tags para segmentação
4. Testar sequência completa

### Segmentação Sugerida
- Quem clicou no email X → [ação]
- Quem não abriu → [ação]
- Quem comprou → [remover da sequência]
```

## Templates por Objetivo

### Sequência de Lançamento (7 emails)
1. **Antecipação** - Algo grande está chegando
2. **Dor** - O problema que você enfrenta
3. **Solução** - Apresentando [produto]
4. **Prova** - Resultados e depoimentos
5. **Objeções** - FAQ e garantias
6. **Urgência** - Últimas horas
7. **Fechamento** - Última chance

### Sequência Welcome (5 emails)
1. **Boas-vindas** - Entrega do prometido
2. **Sua história** - Quem é você
3. **Quick win** - Valor imediato
4. **Comunidade** - Redes sociais
5. **Próximo passo** - Oferta suave
