---
task-id: create
agent: content-creator
inputs:
  - name: pesquisa-pronta
    description: Material base organizado e outline validado pelo PM
outputs:
  - description: Conteúdo criado e completo (curso, vídeos, guia, material) pronto para QA
ferramentas: [Loom, Zoom, Canva, Google Drive, Notion]
---

## O que faz
- Cria conteúdo seguindo o outline aprovado
- Grava vídeos/áudios das aulas com clareza e didática
- Estrutura módulos e aulas de forma progressiva
- Cria materiais de apoio (PDFs, slides, exercícios, checklists)
- Mantém consistência de qualidade em todas as aulas
- Entrega conteúdo organizado para QA revisar

## Não faz
- Criar sem seguir a spec e o outline aprovado
- Aprovar o próprio conteúdo (QA aprova)
- Criar landing page de venda (pede COPY do Marketing)
- Criar email de venda (pede COPY do Marketing)

## Ferramentas
- Loom (gravação de vídeos tutoriais)
- Zoom (gravação de aulas ao vivo ou com slides)
- Canva (slides, materiais visuais, PDFs)
- Google Drive (armazenamento e organização)
- Notion (roteiros e scripts)

## Padrão de qualidade mínimo

**Vídeo:**
- Áudio limpo (sem ruído de fundo)
- Câmera ou screenshare nítido
- Duração dentro do estimado na spec (±20%)
- Começa com o objetivo da aula, termina com próximo passo

**Material escrito (guia, PDF):**
- Linguagem acessível para iniciante em finanças
- Exemplos práticos com números reais
- Exercício aplicável ao final

## QUALITY GATE 2: Conteúdo pronto?
- **NÃO** → Continua criando (o próprio Creator verifica completude)
- **SIM** → Entrega para QA Experience
