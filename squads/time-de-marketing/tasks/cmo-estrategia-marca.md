---
task: Estratégia de Marca
responsavel: "@cmo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - negocio: Descrição do negócio/produto/serviço
  - publico_atual: Quem são os clientes atuais (opcional)
  - concorrentes: Principais concorrentes (opcional)
  - diferencial: O que torna único (opcional)
Saida: |
  - posicionamento: Declaração de posicionamento
  - publico_alvo: Persona detalhada
  - proposta_valor: Proposta de valor única
  - mensagens_chave: 3-5 mensagens principais
  - tom_voz: Diretrizes de comunicação
Checklist:
  - "[ ] Entender o negócio e contexto"
  - "[ ] Analisar público-alvo"
  - "[ ] Identificar diferenciais"
  - "[ ] Definir posicionamento"
  - "[ ] Criar proposta de valor"
  - "[ ] Definir tom de voz"
---

# *estrategia-marca

Define a estratégia de marca completa: posicionamento, público-alvo, proposta de valor e tom de voz.

## Uso

```
@cmo *estrategia-marca
# → Modo interativo completo

@cmo "Defina a estratégia de marca para minha consultoria financeira"
# → Executa com contexto fornecido
```

## Elicitação

```
1. Qual é o seu negócio/produto/serviço?
   (Descreva em 2-3 frases)

2. Quem são seus clientes ideais?
   A. Pessoas físicas (B2C)
   B. Empresas pequenas (B2B PME)
   C. Empresas médias/grandes (B2B Enterprise)
   D. Misto

3. Qual problema principal você resolve?
   (A dor que seu cliente sente)

4. O que te diferencia dos concorrentes?
   (Pode ser mais de um)

5. Como você quer ser percebido?
   A. Especialista técnico
   B. Parceiro acessível
   C. Premium/exclusivo
   D. Inovador/disruptivo
```

## Output

```markdown
# Estratégia de Marca: [Nome do Negócio]

## Posicionamento
"Para [público-alvo] que [problema/necessidade],
[nome] é o [categoria] que [benefício único]
porque [razão para acreditar]."

## Público-Alvo

### Persona Principal
- **Nome:** [Nome fictício]
- **Perfil:** [Demográfico]
- **Dores:** [3 principais problemas]
- **Desejos:** [3 principais objetivos]
- **Objeções:** [Por que não compraria]

## Proposta de Valor
[Frase única que resume o valor entregue]

## Mensagens-Chave
1. [Mensagem principal]
2. [Mensagem secundária]
3. [Prova social/credibilidade]

## Tom de Voz
- **Personalidade:** [adjetivos]
- **Fala como:** [referência]
- **Evita:** [o que não fazer]
- **Exemplos:**
  - ✅ "[frase no tom certo]"
  - ❌ "[frase no tom errado]"
```

## Próximos Passos

Após definir a estratégia:
1. `@cmo *briefing-campanha` - Criar briefing para campanhas
2. `@copywriter *capturar-dna` - Capturar DNA de escrita
3. `@designer *brand-guide` - Documentar identidade visual
