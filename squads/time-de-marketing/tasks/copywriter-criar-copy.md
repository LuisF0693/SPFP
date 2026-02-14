---
task: Criar Copy
responsavel: "@copywriter"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - tipo: Tipo de copy (post, landing, email, ad, bio)
  - objetivo: O que a copy deve alcançar
  - contexto: Produto/serviço/oferta
  - tom: Tom de voz (se já definido)
  - referencias: Exemplos de estilo (opcional)
Saida: |
  - copy: Texto final formatado
  - variacoes: 2-3 variações (se aplicável)
  - notas: Sugestões de uso
Checklist:
  - "[ ] Entender objetivo da copy"
  - "[ ] Verificar DNA/tom de voz"
  - "[ ] Criar headline/hook"
  - "[ ] Desenvolver corpo"
  - "[ ] Adicionar CTA"
  - "[ ] Revisar clareza e persuasão"
---

# *criar-copy

Cria textos persuasivos para qualquer formato: posts, landing pages, emails, anúncios, bios.

## Uso

```
@copywriter *criar-copy
# → Modo interativo

@copywriter "Escreva uma copy de vendas para meu curso de produtividade"

@copywriter "Crie 3 variações de headline para meu anúncio"
```

## Tipos de Copy

| Tipo | Estrutura | Extensão |
|------|-----------|----------|
| Post Instagram | Hook + Corpo + CTA + Hashtags | 150-300 palavras |
| Landing Page | Headline + Problema + Solução + Prova + CTA | 500-1500 palavras |
| Email | Subject + Preview + Corpo + CTA | 200-400 palavras |
| Anúncio | Hook + Benefício + CTA | 50-125 caracteres |
| Bio | Quem + Para quem + Resultado + CTA | 150 caracteres |

## Elicitação

```
1. Que tipo de copy você precisa?
   A. Post para redes sociais
   B. Landing page / página de vendas
   C. Email marketing
   D. Anúncio (Meta, Google)
   E. Bio / descrição de perfil

2. Qual o objetivo?
   A. Vender produto/serviço
   B. Capturar leads
   C. Educar/informar
   D. Engajar audiência

3. O que está promovendo?
   (Descreva o produto/serviço/conteúdo)

4. Qual a principal dor do seu público?
   (O problema que você resolve)

5. Qual o principal benefício/transformação?
   (O resultado que você entrega)
```

## Frameworks Utilizados

### AIDA (Clássico)
- **A**tenção: Hook que para o scroll
- **I**nteresse: Por que isso importa
- **D**esejo: Benefícios e transformação
- **A**ção: CTA claro

### PAS (Problema-Agitação-Solução)
- **P**roblema: Identifique a dor
- **A**gitação: Amplifique as consequências
- **S**olução: Apresente a saída

### BAB (Antes-Depois-Ponte)
- **B**efore: Situação atual (dor)
- **A**fter: Situação desejada
- **B**ridge: Como chegar lá (sua oferta)

## Output

```markdown
# Copy: [Tipo] - [Objetivo]

## Versão Principal

### Headline
[Headline principal]

### Corpo
[Texto completo]

### CTA
[Call to action]

---

## Variação A (mais direto)
[Versão alternativa]

## Variação B (mais emocional)
[Versão alternativa]

---

## Notas de Uso
- **Melhor para:** [contexto ideal]
- **Tom:** [descrição do tom]
- **Combina com:** [tipo de visual]
```

## Checklist de Qualidade

- [ ] Hook captura atenção em 3 segundos?
- [ ] Benefícios > Features?
- [ ] Linguagem do público-alvo?
- [ ] Um CTA claro e específico?
- [ ] Sem jargões desnecessários?
- [ ] Prova social incluída (se possível)?
