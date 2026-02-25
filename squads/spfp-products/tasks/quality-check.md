---
task-id: quality-check
agent: qa-experience
inputs:
  - name: conteudo-criado
    description: Conteúdo entregue pelo Content Creator para revisão
outputs:
  - description: Conteúdo validado OU lista de ajustes necessários para o Creator
ferramentas: [Notion (checklist de spec), Hotmart/Teachable (preview)]
---

## O que faz
- Lê a spec original do PM antes de revisar qualquer coisa
- Verifica item por item dos critérios de aceite da spec
- Revisa conteúdo antes de publicar (completude, coerência, qualidade)
- Valida que cada módulo e aula entrega o que prometeu
- Confirma que o conteúdo resolve o problema declarado na spec
- Documenta cada problema encontrado com clareza (crítico / importante / sugestão)
- Aprova ou devolve para Content Creator com feedback específico

## Não faz
- Criar o conteúdo (Content Creator cria)
- Corrigir diretamente sem avisar o Creator
- Aprovar algo que não atende a spec para "não atrasar"

## Ferramentas
- Notion (spec original + checklist de QA)
- Hotmart / Teachable (preview do conteúdo na plataforma)

## Checklist de Quality Check

**Completude:**
- [ ] Todos os módulos e aulas da spec foram criados
- [ ] Materiais de apoio prometidos existem
- [ ] Exercícios práticos incluídos

**Qualidade do conteúdo:**
- [ ] Linguagem adequada para o público-alvo
- [ ] Exemplos práticos e aplicáveis
- [ ] Progressão lógica entre aulas
- [ ] Cada aula tem objetivo claro

**Técnico:**
- [ ] Áudio dos vídeos está bom (sem ruído, volume adequado)
- [ ] Vídeos dentro da duração esperada (±20%)
- [ ] Nenhum link quebrado

**Alinhamento com spec:**
- [ ] Cada critério de aceite da spec foi atendido

## QUALITY GATE 3 — Decisão de QA:
- **Aprovado** → Vai para publicação
- **Volta para Creator** → Lista de ajustes específicos entregue
