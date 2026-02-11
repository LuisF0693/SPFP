# Task: Criar Ideia de Conteúdo

## Metadata
- **id**: create-content-idea
- **agent**: ideation
- **type**: generative
- **elicit**: true

## Objetivo
Gerar uma nova ideia de conteúdo para as redes sociais do SPFP.

## Inputs Necessários

```yaml
inputs:
  - name: platform
    type: enum
    options: [instagram, linkedin, youtube]
    required: true
    prompt: "Para qual plataforma você quer criar conteúdo?"

  - name: format
    type: enum
    options_by_platform:
      instagram: [feed, carousel, stories, reels]
      linkedin: [post, article, carousel]
      youtube: [video, shorts, thumbnail]
    required: true
    prompt: "Qual formato de conteúdo?"

  - name: objective
    type: enum
    options: [awareness, engagement, conversion]
    required: true
    prompt: "Qual o objetivo do conteúdo?"

  - name: topic
    type: string
    required: false
    prompt: "Tem algum tema específico em mente? (opcional)"
```

## Processo

1. **Carregar configuração de voz da marca**
   - Ler `config/brand-voice.yaml`
   - Entender tom, vocabulário e público-alvo

2. **Analisar contexto**
   - Verificar últimos posts na plataforma
   - Identificar gaps de conteúdo
   - Considerar sazonalidade/trends

3. **Gerar ideias**
   - Criar 3 opções de ideia
   - Para cada ideia, incluir:
     - Título/Hook
     - Key points (3-5)
     - CTA sugerido
     - Hashtags relevantes

4. **Apresentar ao usuário**
   - Mostrar as 3 opções
   - Permitir escolha ou refinamento

## Output Esperado

```yaml
output:
  idea:
    title: "string"
    platform: "enum"
    format: "enum"
    objective: "enum"
    hook: "string"  # Primeiras palavras que capturam atenção
    key_points:
      - "string"
      - "string"
      - "string"
    cta: "string"
    hashtags:
      - "string"
    estimated_engagement: "low|medium|high"
    next_step: "write-copy"  # Task seguinte no pipeline
```

## Exemplo de Execução

**Input:**
```yaml
platform: instagram
format: carousel
objective: engagement
topic: fluxo de caixa
```

**Output:**
```yaml
idea:
  title: "5 Sinais de que seu Fluxo de Caixa está em Perigo"
  platform: instagram
  format: carousel
  objective: engagement
  hook: "Você sabe quando seu dinheiro vai acabar?"
  key_points:
    - "Sinal 1: Você não sabe quanto entra e sai todo mês"
    - "Sinal 2: Paga contas no cartão de crédito"
    - "Sinal 3: Não separa conta PJ de PF"
    - "Sinal 4: Surpresas negativas todo mês"
    - "Sinal 5: Não tem reserva de emergência"
  cta: "Salve para revisar seu fluxo 📌"
  hashtags:
    - "#fluxodecaixa"
    - "#empreendedor"
    - "#financas"
    - "#gestaofinanceira"
    - "#spfp"
  estimated_engagement: high
  next_step: write-copy
```

## Critérios de Qualidade

- [ ] Hook captura atenção em 3 segundos
- [ ] Conteúdo é relevante para o público-alvo
- [ ] Usa vocabulário aprovado da marca
- [ ] CTA é claro e acionável
- [ ] Hashtags são relevantes e não genéricas demais
