---
task: Criar Carrossel
responsavel: "@designer"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - tema: Assunto do carrossel
  - objetivo: Educar, vender, engajar
  - slides: Número de slides (5-10)
  - texto: Texto pronto ou briefing (opcional)
  - estilo: Referências visuais (opcional)
Saida: |
  - estrutura: Estrutura completa do carrossel
  - textos_slide: Texto para cada slide
  - diretrizes_visuais: Como produzir
Checklist:
  - "[ ] Definir hook da capa"
  - "[ ] Estruturar conteúdo por slide"
  - "[ ] Garantir progressão lógica"
  - "[ ] Criar CTA final"
  - "[ ] Definir diretrizes visuais"
---

# *criar-carrossel

Cria estrutura completa de carrosséis para Instagram/LinkedIn: capa, conteúdo e CTA.

## Uso

```
@designer *criar-carrossel
# → Modo interativo

@designer "Crie um carrossel sobre 5 erros de finanças pessoais"

@designer "Carrossel de vendas para meu curso, 8 slides"
```

## Tipos de Carrossel

| Tipo | Objetivo | Slides | Estrutura |
|------|----------|--------|-----------|
| Educativo | Ensinar algo | 7-10 | Capa + Conteúdo + CTA |
| Lista | Dicas/erros/passos | 7-10 | Capa + 1 item/slide + CTA |
| Storytelling | Conectar emoção | 8-10 | Capa + História + CTA |
| Vendas | Converter | 8-10 | Capa + Problema + Solução + Prova + CTA |
| Comparativo | Antes/depois | 5-7 | Capa + Comparações + CTA |

## Elicitação

```
1. Qual o tema do carrossel?
   (Assunto principal)

2. Qual o objetivo?
   A. Educar/informar
   B. Vender produto/serviço
   C. Gerar engajamento
   D. Capturar leads

3. Quantos slides?
   A. 5-6 (curto e direto)
   B. 7-8 (padrão)
   C. 9-10 (conteúdo denso)

4. Qual o formato?
   A. Lista de dicas/erros
   B. Passo a passo
   C. Storytelling
   D. Problema → Solução

5. Tem o texto pronto ou precisa criar?
   A. Texto pronto (só estruturar)
   B. Preciso que crie o texto
```

## Estrutura Padrão

```
SLIDE 1 - CAPA
├── Hook visual (gancho)
├── Título chamativo
└── Elemento de curiosidade (swipe)

SLIDES 2-7 - CONTEÚDO
├── Um ponto por slide
├── Texto curto (max 30 palavras)
├── Hierarquia visual clara
└── Progressão lógica

SLIDE 8 - CTA
├── Resumo ou reforço
├── Call to action claro
└── @ do perfil
```

## Output

```markdown
# Carrossel: [Título]

## Informações Gerais
- **Tema:** [tema]
- **Objetivo:** [objetivo]
- **Formato:** 1080x1350px (4:5)
- **Slides:** [número]

---

## Slide 1 - CAPA

**Tipo:** Hook visual

**Texto Principal:**
> [Título chamativo - max 8 palavras]

**Subtítulo:**
> [Complemento - max 10 palavras]

**Elemento visual:**
- [Descrição do que mostrar]

**Indicador de swipe:** ✓

---

## Slide 2 - [Título]

**Texto:**
> [Conteúdo - max 30 palavras]

**Visual:**
- [Descrição]

---

## Slide 3 - [Título]
...

## Slide [N] - CTA

**Texto:**
> [Chamada para ação]

**Elementos:**
- CTA principal
- @ do perfil
- [Ícone ou seta]

---

## Diretrizes Visuais

### Cores
- Fundo: [cor]
- Texto: [cor]
- Destaque: [cor]

### Tipografia
- Títulos: [fonte, tamanho]
- Corpo: [fonte, tamanho]

### Elementos
- Ícones: [estilo]
- Fotos: [tratamento]
- Formas: [estilo]

### Consistência
- Manter [elemento] em todos os slides
- Posição do título: [local]
- Margem: [medida]

---

## Checklist de Produção

- [ ] Exportar em 1080x1350px
- [ ] Verificar legibilidade mobile
- [ ] Testar contraste de cores
- [ ] Adicionar texto alt (acessibilidade)
- [ ] Salvar em alta qualidade
```

## Templates de Capa

### Lista/Dicas
> "X [coisas] que [resultado]"
> "Pare de [erro] agora"
> "O guia definitivo de [tema]"

### Storytelling
> "Como eu [conquista] em [tempo]"
> "A verdade sobre [tema]"
> "Ninguém te conta isso sobre [tema]"

### Vendas
> "[Resultado] sem [objeção]"
> "Você está [perdendo/fazendo errado]"
> "O método [nome] para [resultado]"

## Ferramentas Recomendadas

- **Canva**: Templates prontos, fácil edição
- **Figma**: Mais controle, componentes
- **Adobe Express**: Alternativa ao Canva
