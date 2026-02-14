---
task: Brand Guide
responsavel: "@designer"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - marca: Nome da marca
  - referencias: Cores, fontes, estilo atual (se existir)
  - personalidade: Adjetivos que descrevem a marca
  - publico: Quem é o público-alvo
Saida: |
  - brand_guide: Documento completo de identidade visual
  - paleta: Códigos de cores
  - tipografia: Fontes definidas
  - exemplos: Aplicações de exemplo
Checklist:
  - "[ ] Definir personalidade visual"
  - "[ ] Criar paleta de cores"
  - "[ ] Definir tipografia"
  - "[ ] Estabelecer elementos gráficos"
  - "[ ] Criar exemplos de aplicação"
  - "[ ] Documentar uso correto/incorreto"
---

# *brand-guide

Documenta a identidade visual da marca em um guia prático e reutilizável.

## Uso

```
@designer *brand-guide
# → Modo interativo

@designer "Crie um brand guide para minha marca de consultoria"

@designer "Documente minha identidade visual atual"
```

## Elicitação

```
1. Qual o nome da marca?

2. Se a marca fosse uma pessoa, seria:
   A. Séria e profissional
   B. Amigável e acessível
   C. Ousada e inovadora
   D. Elegante e sofisticada
   E. Divertida e descontraída

3. Quais cores você já usa ou gostaria de usar?
   (Pode ser descrição: "azul escuro", "tons terrosos")

4. Tem referências visuais que admira?
   (Marcas, perfis, estilos)

5. O que sua marca NÃO deve parecer?
   (O que evitar)
```

## Output

```markdown
# Brand Guide: [Nome da Marca]

## Visão Geral

### Essência da Marca
[2-3 frases sobre a essência visual da marca]

### Personalidade Visual
- **Adjetivos:** [3-5 adjetivos]
- **Tom:** [descrição do tom visual]
- **Referências:** [marcas/estilos similares]

---

## Paleta de Cores

### Cores Principais

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| [Nome] | #XXXXXX | rgb(X,X,X) | Primária (CTAs, destaques) |
| [Nome] | #XXXXXX | rgb(X,X,X) | Secundária (fundos, apoio) |

### Cores Neutras

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| [Nome] | #XXXXXX | rgb(X,X,X) | Textos |
| [Nome] | #XXXXXX | rgb(X,X,X) | Fundos claros |
| [Nome] | #XXXXXX | rgb(X,X,X) | Fundos escuros |

### Cores de Apoio (opcional)

| Cor | Hex | Uso |
|-----|-----|-----|
| [Nome] | #XXXXXX | Alertas/Sucesso |
| [Nome] | #XXXXXX | Destaques especiais |

### Uso de Cores

```
Fundo claro + Texto escuro = ✅
Fundo escuro + Texto claro = ✅
Cor primária em CTAs = ✅
Mais de 3 cores por peça = ❌
```

---

## Tipografia

### Fonte Principal (Títulos)
- **Nome:** [Fonte]
- **Pesos:** Bold, Medium
- **Uso:** Headlines, títulos, destaques
- **Onde encontrar:** [Google Fonts / Adobe / etc]

### Fonte Secundária (Corpo)
- **Nome:** [Fonte]
- **Pesos:** Regular, Medium
- **Uso:** Textos longos, descrições
- **Onde encontrar:** [link]

### Hierarquia

| Elemento | Fonte | Peso | Tamanho |
|----------|-------|------|---------|
| H1 (Título principal) | [Fonte] | Bold | 32-48px |
| H2 (Subtítulo) | [Fonte] | Medium | 24-32px |
| Corpo | [Fonte] | Regular | 16-18px |
| Caption | [Fonte] | Regular | 12-14px |

---

## Elementos Gráficos

### Estilo de Ícones
- **Tipo:** [Line / Filled / Duo-tone]
- **Espessura:** [Thin / Regular / Bold]
- **Cantos:** [Arredondados / Retos]
- **Fonte:** [Feather / Phosphor / etc]

### Formas
- **Cantos:** [Raio em px para arredondamento]
- **Sombras:** [Sim/Não - especificações]
- **Bordas:** [Espessura e cor]

### Estilo Fotográfico
- **Tratamento:** [Cores vibrantes / Dessaturado / Natural]
- **Filtros:** [Se usar, qual]
- **Composição:** [Clean / Dinâmico / Lifestyle]

---

## Aplicações

### Post para Feed (1080x1080)
```
┌─────────────────────────────┐
│ [Logo ou @ - canto]         │
│                             │
│     [Área de conteúdo]      │
│                             │
│ [CTA - cor primária]        │
└─────────────────────────────┘
```

### Story (1080x1920)
```
┌───────────────┐
│ [Topo livre]  │
│               │
│ [Conteúdo]    │
│               │
│ [CTA/Swipe]   │
└───────────────┘
```

### Carrossel
- Capa: [estrutura]
- Slides: [estrutura]
- CTA final: [estrutura]

---

## Uso Correto e Incorreto

### ✅ Fazer
- Manter consistência de cores
- Usar hierarquia tipográfica
- Respeitar espaçamentos
- Priorizar legibilidade

### ❌ Evitar
- Cores fora da paleta
- Fontes não aprovadas
- Elementos muito poluídos
- Baixo contraste

---

## Assets e Templates

### Onde Encontrar
- **Canva:** [link do workspace]
- **Figma:** [link do projeto]
- **Google Drive:** [link da pasta]

### Templates Disponíveis
- [ ] Post feed quadrado
- [ ] Post feed vertical
- [ ] Story
- [ ] Carrossel
- [ ] Thumbnail
- [ ] Capa de destaque

---

## Checklist de Validação

Antes de publicar qualquer peça:
- [ ] Cores da paleta aprovada?
- [ ] Fontes corretas?
- [ ] Hierarquia visual clara?
- [ ] Legível em mobile?
- [ ] Coerente com outras peças?
```

## Aplicação

Este Brand Guide será usado por:
- `@designer` - Todas as produções visuais
- `@copywriter` - Referência de tom visual para textos
- `@cmo` - Briefings e aprovações
