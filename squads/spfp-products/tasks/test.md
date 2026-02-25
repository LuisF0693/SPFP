---
task-id: test
agent: qa-experience
inputs:
  - name: conteudo-publicado
    description: Conteúdo publicado na plataforma (Hotmart/Teachable) para teste de experiência
outputs:
  - description: Experiência testada do ponto de vista do aluno + problemas de experiência identificados
ferramentas: [Hotmart, Teachable, navegador comum]
---

## O que faz
- Navega o conteúdo completo como se fosse um aluno real (sem atalhos)
- Testa o fluxo de acesso: login → área de membros → primeiro módulo
- Verifica se os vídeos reproduzem corretamente
- Testa downloads de materiais
- Identifica pontos de fricção ou confusão na navegação
- Verifica se a sequência de aulas faz sentido na plataforma
- Testa em dispositivos diferentes se possível (desktop + mobile)

## Não faz
- Resolver bugs técnicos da plataforma (passa para OPS)
- Alterar o conteúdo diretamente
- Pular partes do teste por pressão de prazo

## Ferramentas
- Hotmart / Teachable (plataformas de curso)
- Navegador padrão (teste como aluno)
- Dispositivo mobile (se aplicável)

## Checklist de teste de experiência

**Acesso:**
- [ ] Login funciona normalmente
- [ ] Área de membros carrega corretamente
- [ ] Aluno consegue encontrar o curso facilmente

**Reprodução:**
- [ ] Todos os vídeos reproduzem sem erro
- [ ] Qualidade de vídeo adequada (sem pixelação)
- [ ] Todos os downloads funcionam
- [ ] Links externos funcionam

**Navegação:**
- [ ] Ordem das aulas está correta
- [ ] Aluno sabe o que fazer após cada aula
- [ ] Progresso é marcado corretamente
- [ ] Mobile funciona (responsivo)

**Experiência geral:**
- [ ] Fácil de navegar sem precisar de ajuda
- [ ] Nenhum ponto de fricção óbvio
- [ ] Call-to-action de próxima aula claro
