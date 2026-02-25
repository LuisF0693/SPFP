---
task-id: publish-content
agent: content-creator
inputs:
  - name: conteudo-aprovado-qa
    description: Conteúdo aprovado pelo QA Experience (Quality Gate 3 = SIM)
outputs:
  - description: Conteúdo publicado na plataforma + acesso testado + pronto para lançamento
ferramentas: [Hotmart, Teachable]
---

## O que faz
- Sobe conteúdo finalizado na plataforma (Hotmart / Teachable)
- Organiza a estrutura do curso (módulos, aulas, ordem)
- Configura thumbnails, títulos e descrições das aulas
- Testa acesso ao conteúdo como aluno
- Confirma que tudo está acessível e na ordem correta
- Avisa o PM que o conteúdo está publicado e pronto para lançamento

## Não faz
- Configurar a plataforma tecnicamente (integrações, pagamentos) — pede OPS
- Publicar sem aprovação do QA
- Publicar a página de vendas (pede COPY do Marketing)

## Ferramentas
- Hotmart (publicação principal)
- Teachable (alternativo)

## Checklist pré-publicação

- [ ] Conteúdo aprovado pelo QA (Quality Gate 3 = SIM)
- [ ] Todos os arquivos enviados para a plataforma
- [ ] Módulos na ordem correta
- [ ] Aulas com títulos claros e descritivos
- [ ] Thumbnails nas aulas (quando aplicável)
- [ ] Materiais de download anexados
- [ ] Acesso testado como aluno (consegui entrar e ver a primeira aula)
- [ ] PM avisado: "conteúdo publicado, pronto para lançamento"

## Próximo passo após publicação

Passa o aviso para PM → PM aciona `launch-coordination` para avisar Marketing e Vendas.
