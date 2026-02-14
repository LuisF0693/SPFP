---
task: Criar Thumbnail
responsavel: "@designer"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - titulo: Título do vídeo/conteúdo
  - plataforma: YouTube, Reels, TikTok
  - estilo: Referências visuais (opcional)
  - foto: Se vai usar foto do rosto
Saida: |
  - conceito: Conceito da thumbnail
  - elementos: Lista de elementos visuais
  - texto: Texto para a thumb
  - diretrizes: Como produzir
Checklist:
  - "[ ] Definir conceito visual"
  - "[ ] Criar texto curto e impactante"
  - "[ ] Definir expressão/emoção"
  - "[ ] Especificar elementos gráficos"
  - "[ ] Garantir legibilidade em tamanho pequeno"
---

# *criar-thumbnail

Cria conceitos de thumbnails para YouTube, Reels e TikTok que geram cliques.

## Uso

```
@designer *criar-thumbnail
# → Modo interativo

@designer "Crie thumbnail para meu vídeo sobre investimentos para iniciantes"

@designer "Thumb para Reels: 3 hábitos matinais"
```

## Dimensões por Plataforma

| Plataforma | Dimensão | Proporção |
|------------|----------|-----------|
| YouTube | 1280x720px | 16:9 |
| YouTube Shorts | 1080x1920px | 9:16 |
| Reels/TikTok | 1080x1920px | 9:16 |
| LinkedIn | 1200x628px | 1.91:1 |

## Elicitação

```
1. Para qual plataforma?
   A. YouTube (horizontal)
   B. YouTube Shorts (vertical)
   C. Reels/TikTok
   D. LinkedIn

2. Qual o título/tema do conteúdo?
   (Sobre o que é o vídeo)

3. Vai usar foto do seu rosto?
   A. Sim, com expressão
   B. Não, só gráficos/texto
   C. Sim, mas pequena

4. Qual emoção quer transmitir?
   A. Surpresa/choque
   B. Curiosidade
   C. Urgência
   D. Empolgação
   E. Seriedade

5. Tem referências de thumbnails que gosta?
   (Links ou descrições)
```

## Elementos de Alta Conversão

### 1. Rosto com Expressão
- Olhos arregalados = Surpresa
- Boca aberta = Choque
- Sorriso = Positivo
- Sobrancelhas franzidas = Seriedade

### 2. Texto Curto
- Máximo 4-5 palavras
- Fonte grande e legível
- Contraste com fundo
- Complementa, não repete título

### 3. Elementos Gráficos
- Setas apontando
- Círculos de destaque
- Emojis estratégicos
- Ícones de atenção

### 4. Cores
- Alto contraste
- Cores vibrantes (amarelo, vermelho, azul)
- Fundo simples ou desfocado
- Consistência com marca

## Output

```markdown
# Thumbnail: [Título do Conteúdo]

## Informações
- **Plataforma:** [plataforma]
- **Dimensão:** [dimensão]
- **Tipo:** [com rosto / gráfica]

---

## Conceito Visual

### Descrição
[Descrição geral do conceito em 2-3 frases]

### Layout
```
┌─────────────────────────────┐
│  [TEXTO]        [ELEMENTO]  │
│                             │
│      [FOTO/IMAGEM]          │
│                             │
│  [DESTAQUE]    [ÍCONE]      │
└─────────────────────────────┘
```

---

## Elementos

### Texto Principal
> "[Texto - max 4 palavras]"
- Posição: [local]
- Fonte: [estilo] - Bold
- Cor: [cor]
- Tamanho: [grande/médio]

### Foto/Imagem
- **Tipo:** [rosto/objeto/ilustração]
- **Expressão:** [emoção]
- **Posição:** [local]
- **Tratamento:** [cor/filtro]

### Elementos Gráficos
1. [Elemento 1] - [posição]
2. [Elemento 2] - [posição]
3. [Elemento 3] - [posição]

### Fundo
- **Tipo:** [sólido/gradiente/imagem]
- **Cor:** [cor]
- **Efeito:** [blur/overlay/nenhum]

---

## Variações

### Versão A (Principal)
[Descrição]

### Versão B (Alternativa)
[Descrição com diferença]

---

## Diretrizes de Produção

### Cores
- Principal: [hex]
- Secundária: [hex]
- Texto: [hex]

### Fontes
- Título: [fonte] Bold
- Secundário: [fonte]

### Checklist
- [ ] Legível em miniatura (mobile)
- [ ] Contraste adequado
- [ ] Sem texto cortado nas bordas
- [ ] Coerente com a marca
- [ ] Diferente de thumbs anteriores

---

## Teste de Miniatura

Visualizar em:
- [ ] 120x90px (YouTube search)
- [ ] 168x94px (YouTube home)
- [ ] Tela de celular
```

## Fórmulas de Texto

### Curiosidade
- "O que ninguém conta"
- "A verdade sobre..."
- "Por que [X] não funciona"

### Resultado
- "[Número] em [tempo]"
- "Como eu consegui..."
- "O segredo para..."

### Urgência
- "Pare de [erro]"
- "Antes que seja tarde"
- "Você precisa saber"

### Lista
- "[N] coisas que..."
- "Os [N] erros de..."
- "[N] passos para..."
