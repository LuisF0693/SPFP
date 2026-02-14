---
task: Análise Competitiva
responsavel: "@cmo"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - concorrentes: Lista de 3-5 concorrentes
  - aspectos: Aspectos a analisar (opcional)
  - fontes: Perfis/sites dos concorrentes (opcional)
Saida: |
  - analise: Matriz comparativa
  - oportunidades: Gaps e oportunidades
  - diferenciais: Como se diferenciar
  - acoes: Ações recomendadas
Checklist:
  - "[ ] Identificar concorrentes diretos"
  - "[ ] Analisar posicionamento de cada um"
  - "[ ] Mapear pontos fortes e fracos"
  - "[ ] Identificar oportunidades"
  - "[ ] Definir diferenciação"
---

# *analise-competitiva

Analisa concorrentes e identifica oportunidades de diferenciação.

## Uso

```
@cmo *analise-competitiva
# → Modo interativo

@cmo "Analise meus concorrentes: @fulano, @ciclano, @beltrano"
```

## Elicitação

```
1. Quem são seus principais concorrentes?
   (Liste 3-5 perfis/empresas)

2. O que eles fazem bem?
   (Na sua percepção)

3. O que você faz melhor que eles?
   (Seu diferencial)

4. O que te incomoda neles?
   (Oportunidades para você)
```

## Aspectos Analisados

- **Posicionamento:** Como se apresentam
- **Conteúdo:** Tipo, frequência, qualidade
- **Engajamento:** Interação com audiência
- **Oferta:** Produtos, preços, promoções
- **Visual:** Identidade, qualidade
- **Comunicação:** Tom, mensagens, CTAs

## Output

```markdown
# Análise Competitiva: [Seu Negócio]

## Concorrentes Analisados
1. [Concorrente A] - [breve descrição]
2. [Concorrente B] - [breve descrição]
3. [Concorrente C] - [breve descrição]

## Matriz Comparativa

| Aspecto | Você | Conc. A | Conc. B | Conc. C |
|---------|------|---------|---------|---------|
| Posicionamento | ? | [nota] | [nota] | [nota] |
| Conteúdo | ? | [nota] | [nota] | [nota] |
| Engajamento | ? | [nota] | [nota] | [nota] |
| Visual | ? | [nota] | [nota] | [nota] |
| Preço | ? | [nota] | [nota] | [nota] |

(Escala: 1-5, onde 5 = excelente)

## Análise por Concorrente

### [Concorrente A]
- **Pontos fortes:** [lista]
- **Pontos fracos:** [lista]
- **O que copiar:** [ideias]
- **O que evitar:** [erros]

### [Concorrente B]
...

## Oportunidades Identificadas

### Gaps no Mercado
1. [Gap 1] - Nenhum concorrente faz X
2. [Gap 2] - Todos fazem Y mal
3. [Gap 3] - Público Z não é atendido

### Sua Diferenciação

> "[Declaração de diferenciação]"

**Por que você é diferente:**
1. [Diferencial 1]
2. [Diferencial 2]
3. [Diferencial 3]

## Ações Recomendadas

| Prioridade | Ação | Impacto |
|------------|------|---------|
| Alta | [Ação 1] | [Resultado esperado] |
| Alta | [Ação 2] | [Resultado esperado] |
| Média | [Ação 3] | [Resultado esperado] |

## Monitoramento

Revisar análise a cada [3 meses].
Acompanhar: [métricas dos concorrentes]
```

## Próximos Passos

1. `@cmo *estrategia-marca` - Refinar posicionamento
2. `@copywriter *criar-copy` - Criar mensagens diferenciadas
3. `@analista *relatorio-semanal` - Monitorar evolução
