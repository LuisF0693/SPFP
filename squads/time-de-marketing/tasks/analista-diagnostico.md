---
task: Diagnóstico de Performance
responsavel: "@analista"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - problema: O que está acontecendo (queda, estagnação)
  - periodo: Quando começou
  - contexto: Mudanças recentes
  - metricas: Dados disponíveis
Saida: |
  - diagnostico: Análise do problema
  - causas: Causas prováveis identificadas
  - solucoes: Ações recomendadas
  - prioridades: O que fazer primeiro
Checklist:
  - "[ ] Entender o problema reportado"
  - "[ ] Analisar dados históricos"
  - "[ ] Identificar correlações"
  - "[ ] Levantar hipóteses"
  - "[ ] Propor soluções priorizadas"
---

# *diagnostico

Diagnostica problemas de performance e identifica causas e soluções.

## Uso

```
@analista *diagnostico
# → Modo interativo

@analista "Minhas vendas caíram 40% esse mês, o que pode ser?"

@analista "Meu engajamento despencou de 5% para 1%, diagnóstico"
```

## Problemas Comuns

| Sintoma | Possíveis Causas |
|---------|------------------|
| Queda de alcance | Algoritmo, frequência, horário, formato |
| Queda de engajamento | Conteúdo, audiência mudou, saturação |
| Queda de seguidores | Limpeza de bots, conteúdo desalinhado |
| Queda de vendas | Sazonalidade, oferta, concorrência |
| Baixo CTR em ads | Criativo, copy, público, posicionamento |
| Alta taxa de rejeição | Landing page, promessa vs entrega |

## Elicitação

```
1. Qual o problema que você está enfrentando?
   A. Queda de alcance/impressões
   B. Queda de engajamento
   C. Perda de seguidores
   D. Queda de vendas/conversões
   E. Outro: [descrever]

2. Quando começou?
   A. Essa semana
   B. Há 2-3 semanas
   C. Há 1 mês
   D. Gradualmente nos últimos meses

3. Mudou algo recentemente?
   [ ] Frequência de posts
   [ ] Tipo de conteúdo
   [ ] Horários de postagem
   [ ] Estratégia de hashtags
   [ ] Público-alvo
   [ ] Nada que eu saiba

4. Me passe os números:

   ANTES (período bom):
   - [Métrica principal]: ___
   - [Métrica secundária]: ___

   DEPOIS (período ruim):
   - [Métrica principal]: ___
   - [Métrica secundária]: ___
```

## Framework de Diagnóstico

```
1. SINTOMA → O que está acontecendo?
2. TIMING → Quando começou?
3. CORRELAÇÃO → O que mais mudou?
4. HIPÓTESE → O que pode explicar?
5. TESTE → Como validar?
6. AÇÃO → O que fazer?
```

## Output

```markdown
# Diagnóstico: [Problema]

## Sintoma Reportado

> "[Descrição do problema nas palavras do usuário]"

### Dados Observados

| Métrica | Antes | Depois | Variação |
|---------|-------|--------|----------|
| [Métrica 1] | [X] | [Y] | [−Z%] |
| [Métrica 2] | [X] | [Y] | [−Z%] |

### Timeline

```
[Data 1] ────── [Data 2] ────── [Data 3] ────── [Hoje]
   │               │               │              │
   │               │               │              │
[Normal]      [Início queda]   [Agravou]     [Atual]
                   ↑
            [Evento/Mudança?]
```

---

## Análise

### Correlações Identificadas

1. **[Correlação 1]**
   - Quando [X] aconteceu, [Y] mudou
   - Probabilidade: [Alta/Média/Baixa]

2. **[Correlação 2]**
   - Quando [X] aconteceu, [Y] mudou
   - Probabilidade: [Alta/Média/Baixa]

### Fatores Externos Possíveis

- [ ] Mudança de algoritmo (plataforma)
- [ ] Sazonalidade
- [ ] Ação de concorrente
- [ ] Feriado/evento externo

### Fatores Internos Possíveis

- [ ] Mudança de conteúdo
- [ ] Mudança de frequência
- [ ] Mudança de horário
- [ ] Qualidade do conteúdo
- [ ] Desalinhamento com audiência

---

## Hipóteses

### Hipótese Principal (mais provável)

> **[Descrição da hipótese]**

**Evidências a favor:**
- [Evidência 1]
- [Evidência 2]

**Como testar:**
- [Teste sugerido]

### Hipótese Secundária

> **[Descrição da hipótese]**

**Evidências a favor:**
- [Evidência 1]

**Como testar:**
- [Teste sugerido]

---

## Diagnóstico Final

### Causa Raiz Provável

> **[Explicação clara da causa mais provável]**

### Nível de Certeza
[🟢 Alto | 🟡 Médio | 🔴 Baixo]

### Gravidade
[🔴 Crítico | 🟡 Importante | 🟢 Menor]

---

## Plano de Ação

### Imediato (esta semana)

| Prioridade | Ação | Responsável | Resultado Esperado |
|------------|------|-------------|-------------------|
| 1 | [Ação] | @[agente] | [Resultado] |
| 2 | [Ação] | @[agente] | [Resultado] |

### Curto Prazo (próximas 2 semanas)

| Ação | Responsável | Resultado Esperado |
|------|-------------|-------------------|
| [Ação] | @[agente] | [Resultado] |
| [Ação] | @[agente] | [Resultado] |

### Monitoramento

- **Métrica a acompanhar:** [Métrica]
- **Frequência:** [Diário/Semanal]
- **Meta de recuperação:** [X] em [Y] dias
- **Próxima revisão:** [Data]

---

## Testes Sugeridos

### Teste A/B Recomendado

**Hipótese:** [O que estamos testando]
**Variável:** [O que muda]
**Métrica:** [Como medir sucesso]
**Duração:** [Tempo do teste]

### Quick Wins

1. [Ação rápida de baixo esforço]
2. [Ação rápida de baixo esforço]

---

## Prevenção Futura

Para evitar que isso aconteça novamente:

1. [ ] [Medida preventiva 1]
2. [ ] [Medida preventiva 2]
3. [ ] Monitorar [métrica] semanalmente
```

## Árvore de Decisão Rápida

```
QUEDA DE ALCANCE?
├── Mudou frequência? → Voltar à frequência anterior
├── Mudou formato? → Testar formatos antigos
├── Mudou horário? → Testar horários anteriores
└── Nada mudou? → Provável mudança de algoritmo
    └── Testar: Reels, Lives, Interação

QUEDA DE ENGAJAMENTO?
├── Alcance está bom? → Problema é conteúdo
│   └── Revisar tipos de post que funcionavam
├── Alcance também caiu? → Problema é distribuição
│   └── Ver "Queda de Alcance"
└── Audiência mudou? → Realinhar conteúdo

QUEDA DE VENDAS?
├── Tráfego está bom? → Problema é conversão
│   └── Revisar landing page, oferta, preço
├── Tráfego caiu? → Problema é atração
│   └── Ver "Queda de Alcance"
└── Leads estão bons? → Problema é fechamento
    └── Revisar sequência, objeções, timing
```
