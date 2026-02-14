---
task: Capturar DNA de Escrita
responsavel: "@copywriter"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - amostras: Textos anteriores do usuário (posts, emails, etc.)
  - referencias: Pessoas/marcas que admira (opcional)
  - anti_referencias: O que NÃO quer parecer (opcional)
Saida: |
  - dna_escrita: Documento com DNA completo
  - guia_estilo: Diretrizes práticas
  - exemplos: Frases de referência
Checklist:
  - "[ ] Coletar amostras de texto"
  - "[ ] Analisar padrões de voz"
  - "[ ] Identificar tom predominante"
  - "[ ] Mapear vocabulário frequente"
  - "[ ] Documentar estilo"
  - "[ ] Criar guia de referência"
---

# *capturar-dna

Analisa textos existentes e captura o DNA de escrita único do usuário para replicar em todas as peças.

## Uso

```
@copywriter *capturar-dna
# → Modo interativo (pede amostras)

@copywriter "Analise meus últimos 10 posts e capture meu DNA de escrita"
```

## Por Que Isso Importa

Seu público segue VOCÊ, não um robô genérico. O DNA de escrita garante que todo conteúdo soe autêntico e consistente, mesmo quando criado com IA.

## Elicitação

```
1. Compartilhe 5-10 textos seus que você gosta
   (Posts, emails, legendas, qualquer coisa escrita por você)

2. Tem alguém cujo estilo você admira?
   (Criadores, marcas, autores)

3. O que você NÃO quer parecer?
   (Estilos que não combinam com você)

4. Como você descreveria seu jeito de falar?
   A. Direto e sem rodeios
   B. Acolhedor e empático
   C. Técnico e preciso
   D. Descontraído e bem-humorado
   E. Inspirador e motivacional
```

## Elementos Analisados

### 1. Voz
- Formal vs Informal
- Primeira pessoa (eu) vs Segunda (você) vs Terceira
- Singular vs Plural (nós)

### 2. Tom
- Sério vs Descontraído
- Técnico vs Acessível
- Inspirador vs Prático
- Provocativo vs Conciliador

### 3. Estilo
- Frases curtas vs longas
- Parágrafos densos vs espaçados
- Uso de listas e bullets
- Storytelling vs direto ao ponto

### 4. Vocabulário
- Palavras frequentes
- Expressões características
- Gírias ou termos técnicos
- Palavras a evitar

### 5. Recursos
- Uso de emojis
- Perguntas retóricas
- Metáforas recorrentes
- Humor e ironia

## Output

```markdown
# DNA de Escrita: [Nome]

## Resumo
[2-3 frases descrevendo a essência do estilo]

## Voz
- **Pessoa:** [primeira/segunda/terceira]
- **Formalidade:** [1-10, onde 10 = muito formal]
- **Proximidade:** [distante/próximo/íntimo]

## Tom
- **Predominante:** [adjetivo principal]
- **Secundário:** [adjetivo secundário]
- **Evitar:** [tons que não combinam]

## Estilo
- **Frases:** [curtas/médias/longas]
- **Estrutura:** [bullets/parágrafos/misto]
- **Abordagem:** [storytelling/direto/misto]

## Vocabulário

### Palavras-Chave (usar frequentemente)
- [palavra 1]
- [palavra 2]
- [palavra 3]

### Expressões Características
- "[expressão 1]"
- "[expressão 2]"

### Evitar
- [palavra/expressão a evitar]
- [clichês específicos]

## Recursos de Estilo
- **Emojis:** [não usa / poucos / moderado / muitos]
- **Perguntas:** [frequência]
- **Humor:** [tipo e frequência]

## Exemplos de Referência

### ✅ Soa como você:
> "[frase exemplo no tom certo]"

> "[outra frase exemplo]"

### ❌ NÃO soa como você:
> "[frase que não combina]"

## Checklist de Validação

Antes de publicar, o texto:
- [ ] Usa vocabulário do DNA?
- [ ] Mantém o tom definido?
- [ ] Parece escrito por mim?
- [ ] Evita palavras proibidas?
```

## Aplicação

Este DNA será usado em:
- `@copywriter *criar-copy` - Todas as copies
- `@designer` - Briefings de texto para visuais
- `@cmo` - Comunicações estratégicas
