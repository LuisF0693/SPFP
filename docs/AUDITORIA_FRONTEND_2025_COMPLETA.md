# Auditoria Frontend 2025 - Análise e Plano de Ação

## 1. Resumo Executivo

- **Estado Geral:** O projeto utiliza uma stack moderna (Vite, React 19, TypeScript) com excelente configuração de base (type safety estrito, testes, alias de path).
- **Stack Mismatch:** O projeto **NÃO é Next.js**, mas sim **Vite**. As recomendações serão ajustadas para este ecossistema.
- **Tailwind:** Utiliza **Tailwind v3**, não v4. A configuração é básica e não emprega tokens de forma hierárquica.
- **#1 Issue Crítica:** A implementação do Dark Mode via overrides globais com `!important` em `index.html` é um anti-pattern severo. Isso compromete a manutenibilidade, escalabilidade e a filosofia do Tailwind CSS.
- **#2 Issue Crítica:** Ausência de ferramentas essenciais de DX e qualidade, como `prettier-plugin-tailwindcss`, `eslint-plugin-tailwindcss` e `eslint-plugin-jsx-a11y`.
- **#3 Issue Crítica:** Ausência de uma biblioteca de componentes base como `shadcn/ui` (ou similar) e utilitários de classes como `tailwind-merge`. Isso leva a inconsistências e duplicação.
- **Top 3 Quick Wins:**
    1. Instalar e configurar `prettier-plugin-tailwindcss` para padronizar a ordem das classes.
    2. Instalar e configurar `eslint-plugin-tailwindcss` e `eslint-plugin-jsx-a11y` para detectar erros em tempo de desenvolvimento.
    3. Remover gradualmente os overrides de CSS com `!important`, substituindo por classes de dark mode do Tailwind em componentes específicos.
- **Recomendação Geral:** **Refatorar**. O projeto tem uma base sólida, mas requer uma refatoração focada na implementação do tema (remoção de overrides), na formalização do Design System (tokens e componentes) e na melhoria do tooling de DX para garantir escalabilidade e qualidade a longo prazo.

## 2. Mapa do Projeto (Descoberta)

- **Stack Detectada:**
    - **Framework:** Vite (`^6.2.0`)
    - **UI Library:** React (`^19.2.1`)
    - **Linguagem:** TypeScript (`~5.8.2`)
    - **CSS Framework:** Tailwind CSS (`^3.4.18`)
    - **Gerenciador de Pacotes:** npm (inferido pela `package-lock.json`)
    - **State Management:** Zustand (`^5.0.11`)
    - **Roteamento:** React Router (`^7.11.0`)
    - **Testes E2E:** Playwright (`^1.50.0`)
    - **Testes Unitários:** Vitest (`^4.0.18`)
    - **Linting:** ESLint (`^9.13.0`) com config plana (`eslint.config.js`)
    - **Monorepo:** Não é um monorepo (mas contém subprojetos aninhados como `aios-core-main`).

- **Estrutura de Pastas:**
    - `src/`: Código fonte da aplicação.
    - `api/`: Lógica de backend/serverless (incluindo `supabase.ts`).
    - `docs/`: Documentação do projeto.
    - `public/`: Assets públicos.
    - `tests/`: Testes (embora a configuração do Vitest aponte para `src/**/*.test.ts`).
    - **Não encontrado:** `app/`, `pages/`, `lib/` (no root), `components/ui`.

- **Arquivos de Configuração Críticos:**
    - **Root do Projeto:** `package.json` (encontrado)
    - **Bundler:** `vite.config.ts` (encontrado)
    - **TypeScript:** `tsconfig.json` (encontrado, modo `strict` em nível máximo)
    - **Tailwind:** `tailwind.config.js`, `postcss.config.js` (encontrados)
    - **Linting:** `eslint.config.js` (encontrado)
    - **CSS Entry Point:** `index.html` -> `index.css` & `src/index.tsx` (encontrado)
    - **Não encontrado:** `next.config.js`, `components.json` (shadcn), `.prettierrc` (config de Prettier não localizada, pode estar no `package.json` ou ausente).

- **Padrões Identificados:**
    - **Componentes:** Baseados em funções React com props tipadas.
    - **Utilitários de Classe:** **Não encontrado** `cn()`, `clsx`, ou `tailwind-merge`. As classes são concatenadas manualmente.
    - **Variants de Componentes:** **Não encontrado** `cva` ou `tailwind-variants`.
    - **Dark Mode:** Implementado via `darkMode: 'class'` no `tailwind.config.js` e um script em `index.html` para prevenir FOUC. **Contudo**, a aplicação real é feita com **overrides globais de CSS com `!important`**, o que é um anti-pattern crítico.
    - **Tokens:** Definidos no `theme.extend` do `tailwind.config.js`. Existem duas paletas (`SPFP` e `STITCH`), indicando uma tentativa de Design System, mas é uma estrutura plana e não hierárquica (Global → Semantic → Component).
    - **Acessibilidade:** Presença de `skip-link` em `index.html` é um bom sinal.

- **Hotspots Mapeados:**
    - **`index.html`:** O bloco `<style>` com `!important` é o hotspot mais crítico, pois impacta todo o sistema de design.
    - **`vite.config.ts`:** A configuração de `manualChunks` é muito granular e pode ser um ponto de falha ou complexidade em futuras atualizações de dependências.
    - **Ausência de `tailwind-merge`:** Qualquer componente que aceite `className` como prop está propenso a conflitos de classes do Tailwind (ex: `p-2` e `p-4` aplicados ao mesmo tempo).
    - **`ThemeToggle.tsx` (exemplo fornecido):** Mostra a lógica de troca de tema customizada que não utiliza as variantes `dark:` do Tailwind, mas sim estado e classes condicionais.

## 3. Estado do Tailwind e Tema

- **Versão Detectada:** **v3** (`"tailwindcss": "^3.4.18"` em `package.json`). As recomendações de v4 (como `@theme`) não são aplicáveis diretamente. A migração é uma possibilidade a ser avaliada.
- **Localização da Configuração:** `tailwind.config.js`.
- **Sistema de Tokens Atual:**
    - **Tipo:** Flat, definido no `theme.extend` do `tailwind.config.js`.
    - **Hierarquia:** Nenhuma. Tokens são de "camada 1" (primitivos, como hex codes) e "camada 2" (semânticos, como `stitch.primary`), mas misturados e sem uma estrutura formal de 3 camadas (DTCG).
    - **OKLCH:** **Não encontrado**. Cores são definidas em `hex` e `rgba`.
- **Dark Mode Implementation:**
    - **Mecanismo:** `darkMode: 'class'` está habilitado.
    - **Problema Crítico:** A implementação real depende de um grande bloco de CSS com `html.dark .bg-white { background-color: #0f172a !important; }` em `index.html`. Isso "inverte" as classes do tema claro para o escuro de forma forçada, quebrando a manutenibilidade e a previsibilidade.
- **Recomendação de Migração (v4):**
    - **Viabilidade:** Média. O projeto não usa Sass/Less, o que facilita.
    - **Bloqueadores:** A dependência massiva dos overrides com `!important` precisa ser resolvida **antes** de qualquer migração. Migrar para a v4 com essa estrutura quebraria o tema completamente. O passo 1 é refatorar o dark mode para usar as variantes `dark:` do Tailwind.

## 4. Diagnóstico por Categoria

#### 4.1 Arquitetura/Componentização (React/Vite)

**Estado Atual:** Arquitetura baseada em componentes funcionais em Vite, com forte tipagem, mas sem um sistema de componentização padronizado.

**Issues Encontrados:**
| # | Issue | Severidade | Evidência | Impacto |
|---|---|---|---|---|
| 1 | Ausência de Componentes Base (Primitives) | Alta | Não há `components/ui` ou similar; ausência de `shadcn/ui` ou outra lib de componentes "unowned". | Duplicação de código, inconsistência visual, dificuldade em aplicar mudanças globais de estilo/acessibilidade. |
| 2 | Sem Utilitário de Merge de Classes | Alta | Ausência de `tailwind-merge` no `package.json`; classes concatenadas com ` `` `. | Conflitos de estilo imprevisíveis em componentes que recebem `className`, quebrando o design de forma silenciosa. |
| 3 | Prop Drilling Potencial | Média | Ausência de uma estratégia clara de composição vs. contexto (inferido pela complexidade do app). | Re-renders desnecessários e acoplamento entre componentes distantes na árvore. |

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|---|---|---|---|
| 1 | Adotar `tailwind-merge` | Baixo | Baixo | `package.json`, todos componentes com `className` |
| 2 | Criar diretório `src/components/ui` | Médio | Baixo | Nova estrutura de pastas |
| 3 | Iniciar a criação de componentes base (primitives) | Médio | Baixo | `src/components/ui/button.tsx`, `card.tsx`, etc. |

**Snippet de Solução (tailwind-merge):**
```typescript
// Antes (vulnerável a conflitos)
function Button({ className, ...props }) {
  return <button className={`px-4 py-2 bg-blue-500 ${className}`} {...props} />;
}
// Depois (com tailwind-merge)
import { twMerge } from 'tailwind-merge';
function Button({ className, ...props }) {
  const finalClassName = twMerge('px-4 py-2 bg-blue-500', className);
  return <button className={finalClassName} {...props} />;
}
// MELHOR AINDA: Usar um utilitário `cn` como o shadcn
// utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

#### 4.2 Tailwind CSS (padrões, conflitos, variants)

**Estado Atual:** Tailwind v3 está funcional, mas sua eficácia é minada por um anti-pattern crítico de theming e pela ausência de tooling de suporte.

**Issues Encontrados:**
| # | Issue | Severidade | Evidência | Impacto |
|---|---|---|---|---|
| 1 | **CSS Overrides com `!important` para Dark Mode** | **Crítica** | `index.html`, bloco `<style>` | Quebra a filosofia utility-first, causa guerras de especificidade, impede o uso correto das variantes `dark:`, e torna a manutenção do tema um pesadelo. |
| 2 | Ausência de Ordenação de Classes | Baixa | `package.json` (falta de `prettier-plugin-tailwindcss`), `eslint.config.js` (falta de `eslint-plugin-tailwindcss`) | Inconsistência na leitura dos componentes, dificuldade em identificar rapidamente as classes aplicadas, e classes duplicadas ou conflitantes são mais difíceis de ver. |
| 3 | Potencial para Conflito de Classes | Média | Mesma evidência do #2. | Classes como `w-1/2 w-full` podem ser aplicadas sem erro, onde a última na "cascata" do CSS vence, mas a intenção do desenvolvedor é perdida e pode causar bugs visuais. |
| 4 | Uso de Valores Arbitrários | Baixa | (Inferido) Sem um sistema de tokens forte, é provável que valores arbitrários (`mt-[47px]`) sejam usados, dificultando a consistência. | Dívida técnica no design system; dificuldade em manter um espaçamento/tamanho rítmico e consistente. |

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|---|---|---|---|
| 1 | **Remover o bloco `<style>` de override em `index.html`** | Alto | Médio | `index.html`, todos os componentes visuais |
| 2 | Refatorar componentes para usar a variante `dark:` | (Contido no #1) | Médio | `*.tsx` |
| 3 | Instalar e configurar `prettier-plugin-tailwindcss` | Baixo | Baixo | `package.json`, `.prettierrc` (novo) |
| 4 | Instalar e configurar `eslint-plugin-tailwindcss` | Baixo | Baixo | `package.json`, `eslint.config.js` |

**Snippet de Solução (Refatoração do Dark Mode):**
```html
<!-- EM index.html -->
<!-- REMOVER ESTE BLOCO INTEIRO -->
<style>
  html.dark .bg-white {
    background-color: #0f172a !important; 
    /* ... e todas as outras regras com !important */
  }
</style>
```
```tsx
// Em um componente, ex: Card.tsx
// ANTES (dependia do override global)
function Card({ children }) {
  return <div className="bg-white p-4 rounded-lg">{children}</div>;
}
// DEPOIS (usando a variante dark: do Tailwind)
function Card({ children }) {
  return <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">{children}</div>;
}
```

---
#### 4.3 Tokenização/Design Tokens (3 camadas, OKLCH)

**Estado Atual:** O projeto possui tokens de cor customizados, mas estão em uma estrutura plana dentro do `tailwind.config.js`, misturando conceitos.

**Issues Encontrados:**
| # | Issue | Severidade | Evidência | Impacto |
|---|---|---|---|---|
| 1 | Estrutura de Tokens Plana | Média | `tailwind.config.js` | Dificulta a troca de temas, acopla componentes a valores primitivos e não escala. Não há distinção clara entre tokens globais, semânticos e de componente. |
| 2 | Cores não usam formato moderno (OKLCH) | Baixa | `tailwind.config.js` (cores em `hex`) | Perda de oportunidade para cores mais vibrantes (P3 gamut), melhor previsibilidade de contraste para acessibilidade e manipulação de cores mais intuitiva. |
| 3 | Coexistência de duas paletas (`SPFP` e `STITCH`) | Baixa | `tailwind.config.js` | Sugere uma migração ou falta de consolidação de um único Design System, o que pode gerar confusão sobre qual paleta usar. |

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|---|---|---|---|
| 1 | Reestruturar `tailwind.config.js` para usar variáveis CSS | Médio | Baixo | `tailwind.config.js`, `index.css` |
| 2 | Adotar a hierarquia de 3 camadas (conceitualmente) | Médio | Baixo | `tailwind.config.js`, `index.css` |
| 3 | Planejar migração gradual para OKLCH no futuro | Baixo | Baixo | Documentação do projeto |

**Snippet de Solução (Tokens com CSS Variables):**
```css
/* EM index.css */
@layer base {
  :root {
    /* Layer 1: Global/Primitive Tokens (ex: a paleta 'stitch') */
    --color-blue-500: 19 91 236; /* Usando valores RGB para opacidade */
    --color-gray-900: 17 23 35;
    
    /* Layer 2: Semantic Tokens (light theme) */
    --color-primary: var(--color-blue-500);
    --color-background: 246 246 248; /* bg-light */
    --color-surface: 255 255 255; /* surface-light */
    --color-text-primary: 17 20 24; /* text-primary-light */
  }
  .dark {
    /* Layer 2: Semantic Tokens (dark theme) */
    --color-background: 16 22 34; /* bg-dark */
    --color-surface: 26 34 51; /* surface-dark */
    --color-text-primary: 255 255 255; /* text-primary-dark */
  }
}
```
```javascript
// EM tailwind.config.js
// Agora, o config do Tailwind apenas referencia as variáveis
// ...
theme: {
  extend: {
    colors: {
      'background': 'rgb(var(--color-background) / <alpha-value>)',
      'surface': 'rgb(var(--color-surface) / <alpha-value>)',
      'primary': 'rgb(var(--color-primary) / <alpha-value>)',
      'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
    }
  }
}
```

---
#### 4.4 shadcn/ui + Radix

**Estado Atual:** **Não instalado.** O projeto não utiliza `shadcn/ui` nem possui uma pasta `components/ui`.

**Issues Encontrados:**
| # | Issue | Severidade | Evidência | Impacto |
|---|---|---|---|---|
| 1 | Ausência de uma base de componentes "unowned" | Alta | `package.json`, estrutura de pastas | O projeto precisa construir todos os componentes do zero, incluindo toda a complexa lógica de acessibilidade e interatividade que o Radix UI (base do shadcn) já resolve. |

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|---|---|---|---|
| 1 | **Instalar e configurar shadcn/ui** | Médio | Baixo | `package.json`, `vite.config.ts`, novo `components.json`, nova pasta `src/components/ui` |
| 2 | Substituir gradualmente componentes customizados por suas variantes de `shadcn/ui` | Alto | Médio | Todos os arquivos que usam componentes de UI customizados. |

**Justificativa:** Adotar `shadcn/ui` resolveria de uma só vez vários issues:
- **Componentização:** Fornece uma base sólida de componentes (`Button`, `Card`, `Input`, etc).
- **Acessibilidade:** Herda a excelência do Radix UI em acessibilidade.
- **DX:** Integra-se perfeitamente com Tailwind e fornece um CLI para adicionar componentes.
- **Padrões:** Traz consigo `tailwind-merge` e `clsx` (via o utilitário `cn`), resolvendo o problema de conflito de classes.

---
#### 4.5 Performance (render, bundle, vitals)

**Estado Atual:** O projeto demonstra preocupação com performance, com otimizações manuais de bundle. React 19 abre novas possibilidades.

**Issues Encontrados:**
| # | Issue | Severidade | Evidência | Impacto |
|---|---|---|---|---|
| 1 | `manualChunks` pode ser frágil | Baixa | `vite.config.ts` | Configurações muito granulares de chunks podem quebrar ou se tornar sub-ótimas quando dependências são atualizadas. |
| 2 | Presença de bibliotecas gráficas pesadas | Média | `package.json` (`phaser`, `pixi.js`) | Se não forem carregadas sob demanda (lazy loading), podem impactar drasticamente o LCP e o bundle size inicial para usuários que não interagem com essas features. |

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|---|---|---|---|
| 1 | Revisar periodicamente a estratégia de `manualChunks` | Baixo | Baixo | `vite.config.ts` |
| 2 | Auditar o carregamento de `phaser` e `pixi.js` | Médio | Baixo | Componentes que importam estas libs. |
| 3 | Garantir que `React.lazy` e `Suspense` são usados para carregar as bibliotecas gráficas e outras features pesadas sob demanda. | Médio | Baixo | `App.tsx` (ou onde o roteamento é definido) |

---
#### 4.6 Acessibilidade e UX (WCAG 2.2, APCA)

**Estado Atual:** Sinais positivos iniciais (`skip-link`), mas falta automação e verificação para garantir a conformidade.

**Issues Encontrados:**
| # | Issue | Severidade | Evidência | Impacto |
|---|---|---|---|---|
| 1 | Ausência de linting para acessibilidade | Alta | `eslint.config.js` não contém `eslint-plugin-jsx-a11y`. | Problemas comuns de acessibilidade (ex: `img` sem `alt`, `aria-props` inválidos, elementos não-interativos com eventos de clique) não são detectados automaticamente. |
| 2 | Sem garantia de contraste de cores | Média | `tailwind.config.js` (cores customizadas) | As cores definidas no tema não foram validadas para os rácios de contraste mínimos da WCAG (4.5:1 para texto normal). |

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|---|---|---|---|
| 1 | Instalar e configurar `eslint-plugin-jsx-a11y` | Baixo | Baixo | `package.json`, `eslint.config.js` |
| 2 | Auditar a paleta de cores customizada com uma ferramenta de contraste (ex: oklch.com) | Baixo | Baixo | Documentação |
| 3 | Adotar `focus-visible` em todos os componentes interativos para substituir `outline: none` | Médio | Baixo | Componentes de UI |

---
#### 4.7 Tooling/DX/CI

**Estado Atual:** Base sólida com Vite/Vitest/ESLint, mas com lacunas críticas para um fluxo de trabalho profissional de frontend.

**Issues Encontrados:**
| # | Issue | Severidade | Evidência | Impacto |
|---|---|---|---|---|
| 1 | Ferramentas de Qualidade Tailwind ausentes | Alta | `package.json`, `eslint.config.js` | Ausência de `prettier-plugin-tailwindcss` e `eslint-plugin-tailwindcss`. |
| 2 | Ausência de Git Hooks | Alta | Ausência de `husky` e `lint-staged` no `package.json` | Código com erros de lint ou formatação pode ser comitado no repositório, sujando o histórico e exigindo correções posteriores. |
| 3 | Nenhum `.prettierrc` encontrado | Baixa | Estrutura de arquivos | A formatação pode ser inconsistente entre desenvolvedores se não houver um arquivo de configuração compartilhado. |

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|---|---|---|---|
| 1 | Implementar Prettier + plugin Tailwind | Baixo | Baixo | `package.json`, `.prettierrc` (novo) |
| 2 | Implementar Husky e lint-staged para pre-commit hooks | Baixo | Baixo | `package.json`, `.husky/`, `.lintstagedrc` |
| 3 | Adicionar os plugins de linting faltantes (jsx-a11y, tailwindcss) | Baixo | Baixo | `package.json`, `eslint.config.js` |

---
#### 4.8 Configuração IA (.cursorrules)

**Estado Atual:** **Não encontrado.** O repositório não possui um arquivo `.cursorrules`.

**Recomendações:**
| # | Ação | Esforço | Risco | Arquivos |
|---|---|---|---|---|
| 1 | Criar um arquivo `.cursorrules` na raiz do projeto | Baixo | Baixo | `.cursorrules` (novo) |

---

## 5. Matriz de Priorização

| # | Item | Impacto | Esforço | Risco | Categoria |
|---|---|---|---|---|---|
| 1 | **Remover Overrides de CSS com `!important`** | **Alto** | **Alto** | Médio | Tailwind |
| 2 | **Adotar `shadcn/ui` e `tailwind-merge`** | **Alto** | Médio | Baixo | Arquitetura |
| 3 | Instalar Tooling de Lint/Format (`jsx-a11y`, `tailwindcss`, prettier-plugin) | **Alto** | Baixo | Baixo | Tooling/DX |
| 4 | Implementar Git Hooks (Husky + lint-staged) | **Alto** | Baixo | Baixo | Tooling/DX |
| 5 | Estruturar tokens com Variáveis CSS | Médio | Médio | Baixo | Tokenização |
| 6 | Auditar carregamento de libs pesadas (`phaser`, `pixi.js`) | Médio | Médio | Baixo | Performance |
| 7 | Criar `.cursorrules` | Baixo | Baixo | Baixo | Config IA |

---

## 6. Plano de Ação Incremental

#### Quick Wins (Esta Semana)
- [ ] **Tooling Básico:** Instalar `prettier`, `prettier-plugin-tailwindcss`, `eslint-plugin-tailwindcss`, `eslint-plugin-jsx-a11y`.
- [ ] **Git Hooks:** Instalar e configurar `husky` com `lint-staged` para rodar lint e format em pre-commit.
- [ ] **`tailwind-merge`:** Adicionar `tailwind-merge` e `clsx`, e criar o utilitário `cn`. Começar a usá-lo em novos componentes.
- [ ] **`.cursorrules`:** Criar a primeira versão do arquivo `.cursorrules`.

#### Short Term (1-2 Sprints)
- [ ] **Fim dos `!important`:** Iniciar a refatoração do Dark Mode. Priorizar os componentes mais críticos (layout, cards, inputs) para usar as variantes `dark:`.
- [ ] **Adotar `shadcn/ui`:** Instalar `shadcn/ui` e começar a substituir componentes simples (como `Button`, `Input`) para validar o processo.
- [ ] **Estruturar Tokens:** Refatorar a configuração do `tailwind.config.js` e `index.css` para usar o padrão de Variáveis CSS para tokens.

#### Medium Term (1-2 Meses)
- [ ] **Refatoração Completa do Tema:** Garantir que 100% dos componentes usam as variantes `dark:` e que o bloco `<style>` em `index.html` foi completamente eliminado.
- [ ] **Consolidar Componentes:** Ter todos os componentes de UI base (`Card`, `Dialog`, `Form`, etc.) migrados para a implementação via `shadcn/ui`.
- [ ] **Auditoria de Acessibilidade:** Com o `jsx-a11y` rodando, zerar todos os warnings e erros de acessibilidade no projeto.

#### Long Term (Roadmap)
- [ ] **Migrar para Tailwind v4:** Uma vez que o projeto esteja totalmente baseado em variantes e tokens, planejar a migração para a v4 para aproveitar os ganhos de performance e features.
- [ ] **Migrar para OKLCH:** Planejar a migração das cores para o espaço de cores OKLCH.

---

## 7. Convenções Propostas do Projeto

```markdown
## Convenções de Código

### Componentes
- Componentes de UI vivem em `src/components/ui` e são baseados em `shadcn/ui`.
- Componentes devem ser "burros" e receber estado via props. Lógica de negócio vive em hooks ou componentes de container.
- Sempre usar o utilitário `cn()` para aplicar classes, garantindo a funcionalidade do `tailwind-merge`.
- `forwardRef` deve ser usado em todos os componentes que encapsulam um elemento do DOM.

### Tailwind
- As classes devem ser ordenadas automaticamente pelo `prettier-plugin-tailwindcss`.
- NUNCA usar a diretiva `@apply` para componentes. Criar um componente React.
- Usar a diretiva `@layer` com parcimônia, apenas para integrações de terceiros ou estilos de base.
- NUNCA usar `!important`. Se precisar, reveja a especificidade ou a lógica do componente.

### Tokens
- **NUNCA** usar valores hardcoded (cores, espaçamentos) nas classes.
- **SEMPRE** usar tokens do `tailwind.config.js`.
- **PRIORIZAR** o uso de tokens semânticos (ex: `bg-background`, `text-primary`) em vez de primitivos (ex: `bg-slate-800`).

### Acessibilidade
- `focus-visible` é obrigatório para todos os elementos interativos.
- Todos os inputs de formulário devem ter uma `<label>` associada.
- Todos os botões com ícones devem ter um texto alternativo para screen readers via `<span className="sr-only">`.
```

---

## 8. Template .cursorrules Recomendado

```
// .cursorrules
// Este arquivo guia a IA para gerar código que segue os padrões do nosso projeto.

// Regras de Geração de Código para SPFP

@rule: "Stack Principal"
@context: "Toda a geração de código"
A nossa stack é React 19 com Vite, TypeScript, e Tailwind CSS. NÃO use padrões de Next.js (como `getStaticProps` ou o App Router).

@rule: "Componentes com shadcn/ui e cva"
@context: "Ao criar ou modificar componentes React"
Use os componentes de `src/components/ui` como base. Eles são baseados em shadcn/ui.
Use `cva` (class-variance-authority) para criar variantes de estilo para os componentes.
Sempre use o utilitário `cn()` para aplicar classes, que já inclui `tailwind-merge`.

Exemplo de um novo botão:
`import { Button } from '@/components/ui/button';`
`<Button variant="destructive" size="sm">Deletar</Button>`

@rule: "Estilização com Tailwind CSS"
@context: "Ao estilizar componentes"
- Use as variantes `dark:` para o dark mode. Não crie CSS customizado para temas.
- Use os tokens de cor semânticos (ex: `bg-background`, `text-primary`, `border-border`) sempre que possível.
- A ordem das classes é gerenciada pelo Prettier, não se preocupe em ordenar manualmente.
- Não use valores arbitrários (ex: `top-[123px]`). Se um valor é necessário, adicione-o como um token em `tailwind.config.js`.

@rule: "Acessibilidade é Obrigatória"
@context: "Ao criar componentes interativos"
- Use `focus-visible:` para estilos de foco.
- Inputs devem ter `<label>`.
- Imagens devem ter `alt`.
- Botões de ícone devem ter texto via `<span className="sr-only">`.

@rule: "State Management com Zustand"
@context: "Ao lidar com estado global"
Use o nosso store Zustand (`src/store/`). Não introduza outros gerenciadores de estado. Crie um novo "slice" no store para novas features.

```

---

## 9. Checklist de Qualidade para Novas Features

Este checklist deve ser um template para Pull Requests.

```markdown
## Checklist PR

### Componentes
- [ ] API consistente (variants/sizes/states) via `cva`.
- [ ] TypeScript props bem tipadas e exportadas.
- [ ] Sem duplicação de lógica; hooks reutilizáveis foram extraídos.
- [ ] Usa o utilitário `cn()` para todas as classes.

### Tokens
- [ ] Sem hardcode de cor/spacing/typo (valores mágicos).
- [ ] Usando tokens semânticos (`bg-background`) em vez de primitivos (`bg-white`).

### Tailwind
- [ ] Classes ordenadas (verificado pelo pre-commit hook).
- [ ] Sem conflitos (ex: `p-2 p-4`) - verificado pelo `eslint-plugin-tailwindcss`.
- [ ] Usa `dark:` para variantes de dark mode.

### Acessibilidade
- [ ] `focus-visible` presente nos elementos interativos.
- [ ] Labels em inputs (`<label htmlFor>`).
- [ ] `sr-only` em botões de ícone.
- [ ] Keyboard navigation testada (Tab, Shift+Tab, Enter, Space).
- [ ] Verificado com o `eslint-plugin-jsx-a11y`.

### UX States
- [ ] Loading state implementado.
- [ ] Empty state (para listas ou dados vazios) implementado.
- [ ] Error state (com mensagem para o usuário) implementado.
- [ ] Success feedback (opcional, se aplicável) presente.

### Performance
- [ ] Keys estáveis e únicas em listas (`item.id`, não `index`).
- [ ] Memoization (`useMemo`, `useCallback`) aplicada corretamente onde há cálculos ou funções caras.
- [ ] Sem `useEffect` desnecessário (estado derivado é calculado diretamente no render).

### Evidência
- [ ] Testado em light/dark mode.
- [ ] Testado em viewport mobile e desktop.
- [ ] (Se houver) Teste de regressão visual passou.
```
