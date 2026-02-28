# MMOS Mind Mapper — Knowledge Base

## O que é o DNA Mental

O DNA Mental é um framework de 8 layers para mapear a arquitetura cognitiva de uma pessoa.
Desenvolvido para criar clones conversacionais autênticos, ele captura não apenas o que a pessoa sabe,
mas como ela pensa, decide, comunica e existe no mundo.

A metáfora do DNA é intencional: assim como o DNA biológico contém todas as instruções para construir um organismo,
o DNA Mental contém todas as instruções para construir uma simulação autêntica da mente de uma pessoa.

---

## Por que 8 layers?

Cada layer captura uma dimensão diferente da cognição:

- **Layers 1-3** (superficiais): O que a pessoa sabe, como se expressa, o que faz
- **Layers 4-6** (intermediários): Por que decide assim, o que acredita, como vê o mundo
- **Layers 7-8** (profundos): Quem é de verdade, quais tensões a definem

A fidelidade de um clone é proporcional à profundidade dos layers mapeados.
Um clone baseado apenas nos layers 1-3 soa genérico. Um clone com os 8 layers soa como a pessoa.

---

## Fontes Primárias vs. Secundárias

**Primárias** (preferir sempre):
- Palavras da própria pessoa: livros, blog, palestras, entrevistas dadas por ela
- Alta confiabilidade: captura voz, valores, raciocínio direto

**Secundárias** (usar como complemento):
- Descrições externas: biografias, perfis, análises
- Úteis para contexto histórico, mas não capturam a voz autêntica

---

## Como Identificar Paradoxos Produtivos (Layer 8)

Paradoxos produtivos são tensões que, ao invés de se cancelarem, se reforçam.
São a assinatura mais única de uma pessoa.

Como encontrar:
1. Liste todas as aparentes contradições nas fontes
2. Teste se são realmente contraditórias ou se há uma síntese superior
3. Se houver síntese → é um paradoxo produtivo
4. Se for contradição real → é inconsistência (não incluir como Layer 8)

Exemplo (Seth Godin):
- "Acredita que marketing honesto pode transformar o mundo" +
- "O mercado de massa está morto — só os nichos importam"
- Síntese: Marketing transformador só funciona em pequena escala, dirigido a pessoas específicas.
- Este é um paradoxo produtivo, não uma contradição.

---

## Chunking Strategy para Knowledge Base

O RAG pipeline do clone-deploy usa:
- chunk_size=800 tokens
- chunk_overlap=100 tokens
- Separators: `["\n## ", "\n### ", "\n\n", "\n", ". "]`

Implicações para o KB:
- Use `##` como boundary natural de conceitos
- Cada seção ## deve ser autocontida
- 150-600 palavras por seção é o ideal
- Evitar seções muito longas (serão cortadas no meio)
- Evitar seções muito curtas (perdem contexto)

---

## Critérios de Qualidade para System Prompt

Um bom system prompt para clone cognitivo deve:

1. **Soar como a pessoa** (não descrever a pessoa)
   - Errado: "Seth Godin é um pensador que acredita..."
   - Certo: "Acredito que o marketing de interrupção está morto..."

2. **Usar vocabulário característico**
   - Capturar termos que a pessoa usa com frequência e significado específico

3. **Incluir restrições comportamentais**
   - O que o clone NÃO diria é tão importante quanto o que ele diz

4. **Ser longo o suficiente** (2000+ tokens)
   - Prompts curtos produzem clones genéricos
   - 3000-5000 tokens é o sweet spot

5. **Capturar os paradoxos**
   - Os paradoxos produtivos (Layer 8) são o que tornam o clone memorável
