# Base de Conhecimento — Marty Cagan
## Frameworks, Modelos e Princípios Aplicados à SPFP

---

## 1. Product Discovery Framework

### O que é Product Discovery

Product Discovery é o processo de responder a quatro perguntas antes de investir em construção:

1. **O cliente vai querer isso?** (Value Risk)
2. **O cliente consegue usar?** (Usability Risk)
3. **Nossa engenharia consegue construir?** (Feasibility Risk)
4. **Funciona para o nosso negócio?** (Business Viability Risk)

Discovery é o trabalho que evita o erro mais caro do produto: construir a coisa errada. Na média da indústria, entre 2/3 e 3/4 de todas as features construídas não geram o impacto esperado. Discovery existe para identificar quais features *não* construir antes de gastar meses construindo.

### As Técnicas Fundamentais de Discovery

#### Opportunity Assessment
Antes de entrar em discovery de solução, o PM deve articular claramente:
- **Qual é o problema exato que estamos tentando resolver?**
- **Para quem?** (segmento específico, não "todos os usuários")
- **Por que agora?** (o que mudou que torna isso urgente)
- **Como saberemos que resolvemos?** (métrica de sucesso)
- **Qual é o risco se não resolvermos?**

#### Customer Interviews (Entrevistas de Descoberta)
A técnica mais poderosa e mais negligenciada. Regras fundamentais:

- **Frequência:** No mínimo 2-3 entrevistas por semana para o PM. Não é projeto — é rotina.
- **Foco:** Comportamento passado, não preferências futuras. "Me conta como você faz X hoje" é mais valioso do que "você compraria um produto que faz X?"
- **Estrutura:** Jobs to be Done — qual trabalho o usuário está tentando fazer? Qual é a situação que aciona esse trabalho? Quais são os critérios de sucesso para o usuário?
- **Armadilha:** Nunca pergunte ao usuário o que ele quer. Pergunte sobre o problema. A solução é trabalho do time de produto.

**Aplicação no SPFP:**

Para o SaaS:
- "Como você acompanha suas finanças hoje?" (antes do SPFP)
- "Me conta sobre a última vez que você sentiu que perdeu controle dos gastos"
- "O que você fez quando percebeu que não ia conseguir atingir um objetivo financeiro?"
- "Me conta o que você faz quando abre o SPFP — do início ao fim"

Para os infoprodutos:
- "O que te levou a buscar um curso de finanças pessoais?"
- "Qual era o problema específico que você queria resolver?"
- "O que você tentou antes? Por que não funcionou?"
- "Como a sua situação financeira mudou depois de [evento X]?"

#### Prototype Testing

O objetivo do protótipo não é impressionar — é aprender. Um protótipo deve ser a representação mais simples possível que valida ou invalida a hipótese de valor.

**Tipos de protótipo por fidelidade:**
- **Storyboard/Papel:** Para testar se o conceito faz sentido (1-2 dias)
- **Wireframe navegável:** Para testar fluxo e usabilidade (3-7 dias)
- **Protótipo de alta fidelidade:** Para testar desejo e percepção de valor (1-2 semanas)
- **Spike técnico:** Para testar viabilidade de engenharia (1-2 sprints)

**Regra de ouro:** Nunca entregue ao usuário uma solução para avaliação. Coloque o usuário diante do protótipo e observe. Silêncio é dado. Hesitação é dado. Confusão é dado.

#### Demand Testing

Antes de construir, há formas de testar demanda real:
- **Fake door test:** Botão ou CTA para feature que não existe, medindo cliques
- **Concierge MVP:** Entregar o valor manualmente antes de automatizar
- **Landing page test:** Página descrevendo o produto antes de existir, medindo conversões

#### Data Analysis e Telemetria de Produto

Discovery não é só qualitativo. Os dados quantitativos do produto revelam:
- Onde usuários abandonam (friction points)
- Quais features são usadas vs. ignoradas
- Qual comportamento prediz retenção
- Quando ocorre o churn (e o que aconteceu antes)

**Métricas de discovery para o SPFP SaaS:**
- Taxa de ativação por cohort de aquisição
- Tempo até o primeiro "aha moment" (lançamento de primeiras transações, primeiro budget criado, primeiro objetivo definido)
- Retenção D7, D14, D30, D90
- Frequência de uso semanal (DAU/WAU/MAU)
- Feature adoption rates por segmento

---

## 2. Empowered Teams vs Feature Teams

### O Diagnóstico

A pergunta mais importante para qualquer liderança de produto: **seu time recebe features para construir ou problemas para resolver?**

Se a resposta for "features para construir", você tem um feature team. E feature teams não inovam — eles executam. A inovação real vem da liberdade e da responsabilidade de descobrir a melhor solução para um problema real.

### Estrutura do Empowered Team

**Composição mínima:**
- Product Manager (1)
- Product Designer (1)
- Engineers (2-6, dependendo da complexidade)

**Cada membro é responsável por um risco:**
- PM: Value Risk (o cliente quer?) + Business Viability Risk (funciona para o negócio?)
- Designer: Usability Risk (o cliente consegue usar?)
- Tech Lead: Feasibility Risk (conseguimos construir?)

**Autonomia e Accountability:**
- Time recebe um outcome desejado (objetivo + métrica)
- Time tem autonomia para descobrir como atingir esse outcome
- Time é accountable pelos resultados, não pela entrega de features

### Evidências de que você tem um Feature Team (red flags)

- PM gasta mais de 30% do tempo escrevendo user stories
- Engenheiros não participam de entrevistas com usuários
- Designers recebem spec antes de pesquisar
- Stakeholders determinam o roadmap trimestral
- Sucesso é medido por features entregues e story points
- O time não sabe qual métrica de negócio está tentando mover
- Não há discovery — só delivery

### Aplicação para SPFP

Para o SaaS, o time ideal é organizado por **etapa da jornada do usuário**, não por funcionalidade:

- **Time de Ativação e Onboarding:** Responsável por levar o usuário ao aha moment (métrica: taxa de ativação)
- **Time de Retenção e Engajamento:** Responsável por hábitos de uso (métrica: D30 retention, WAU)
- **Time de Monetização:** Responsável por conversão e expansão (métrica: conversion rate, ARPU)

Para os infoprodutos, o time pensa em termos de **estágio da jornada do aluno:**
- Atração (topo de funil)
- Conversão (decisão de compra)
- Entrega e Transformação (durante o curso)
- Expansão (próximo produto, upgrade, comunidade)

---

## 3. Roadmap Baseado em Outcomes

### Por que roadmaps de features falham

Um roadmap de features (lista de funcionalidades com datas) falha por três razões estruturais:

1. **Pressupõe que sabemos a solução antes de fazer discovery.** Na prática, não sabemos. E quando construímos baseados em suposições não validadas, a taxa de sucesso é baixa.

2. **Cria compromisso público com outputs, não outcomes.** Stakeholders lembram das datas e das features prometidas. Se a feature foi entregue, o roadmap foi cumprido — mesmo que não gerou nenhum valor.

3. **Destrói a capacidade de adaptação.** Quando o time descobre durante discovery que a hipótese estava errada, não pode mudar de direção sem "quebrar" o roadmap.

### Como construir um roadmap de outcomes

Um roadmap de outcomes comunica:
- **Qual problema** estamos priorizando em cada trimestre
- **Por que esse problema** (vinculado à estratégia)
- **Como mediremos o sucesso** (KPI específico com meta)
- **Nível de confiança** (alta confiança = hipótese validada; baixa = experimento)

**Template de item de roadmap:**

```
Problema: [Usuários abandonam o produto após os primeiros 7 dias]
Oportunidade: [Se resolvermos, aumentamos D30 retention em 15%]
Hipótese de solução: [Onboarding guiado com metas personalizadas]
Validação necessária: [Testar 3 variações com 50 usuários cada]
Confiança atual: Média (hipótese baseada em entrevistas, não testada)
KPI de sucesso: D30 retention de X% para Y%
```

### Aplicação para SPFP SaaS — Exemplo de Roadmap Q1

**Tema do trimestre:** Tornar o SPFP indispensável nos primeiros 30 dias

| Mês | Problema Prioritário | Hipótese | KPI Alvo |
|-----|---------------------|---------|---------|
| Jan | Alto abandono no onboarding | Usuários não entendem o valor no setup inicial | Ativação de X% para Y% |
| Fev | Baixa frequência de retorno semanal | Não há gatilho de hábito que traga o usuário de volta | WAU de X para Y |
| Mar | Churn após primeira falha de objetivo | Usuário desiste quando não atinge meta | D30 retention de X% para Y% |

### Aplicação para Infoprodutos — Exemplo de Roadmap

**Tema do trimestre:** Aumentar taxa de transformação comprovada dos alunos

| Mês | Problema Prioritário | Hipótese | KPI Alvo |
|-----|---------------------|---------|---------|
| Jan | Taxa de conclusão baixa | Módulos muito longos, falta de aplicação prática | Conclusão de X% para Y% |
| Fev | Alunos não aplicam o conteúdo | Falta de exercícios práticos e accountability | Aplicação de X% para Y% |
| Mar | Baixa renovação/upgrade | Aluno não vê próximo passo natural após o curso | LTV de R$ X para R$ Y |

---

## 4. OKRs para Produto

### A Estrutura Correta

**Objective:** Qualitativo, inspiracional, memorável, time-boxed (quarter)
**Key Results:** 3-5 por Objective, mensuráveis, outcomes (não outputs), ambiciosos mas atingíveis

**Regra fundamental:** Se o KR pode ser marcado como "done" sem impacto mensurável no comportamento do usuário, é um output — não é um KR.

### Exemplos errados vs. certos

| Errado (output) | Certo (outcome) |
|----------------|----------------|
| Lançar feature de budget | Aumentar % de usuários que criam pelo menos 1 budget de X% para Y% |
| Publicar 3 novos cursos | Aumentar receita média por aluno de R$ X para R$ Y |
| Redesenhar onboarding | Reduzir time-to-activation de X dias para Y dias |
| Implementar notificações | Aumentar DAU/WAU de X para Y |

### OKRs para SPFP — Exemplo Completo

**Para o SaaS:**

**Objective 1:** Tornar o SPFP o sistema nervoso central da vida financeira do usuário
- KR1: Aumentar D30 retention de X% para Y%
- KR2: Aumentar frequência de uso semanal média de X sessões para Y sessões
- KR3: Aumentar % de usuários com pelo menos 1 objetivo financeiro ativo de X% para Y%

**Objective 2:** Provar que os usuários atingem objetivos financeiros com o SPFP
- KR1: % de usuários que atingiram pelo menos 1 objetivo financeiro no quarter de X% para Y%
- KR2: NPS de usuários ativos (>4 sessões/semana) de X para Y
- KR3: Reduzir taxa de churn voluntário de X% para Y%

**Para os Infoprodutos:**

**Objective 1:** Ser a referência em transformação financeira para o público brasileiro
- KR1: Taxa de conclusão dos cursos de X% para Y%
- KR2: % de alunos que aplicaram o conteúdo (medido por survey 30 dias após conclusão) de X% para Y%
- KR3: NPS dos cursos de X para Y

---

## 5. Customer Interviews e Continuous Discovery

### Por que Discovery é Contínuo, não Periódico

O erro mais comum: fazer research como projeto ("vamos fazer pesquisa com usuários antes de planejar o roadmap anual"). Isso é discovery periódico — e é insuficiente.

Continuous Discovery significa que o time faz alguma atividade de discovery toda semana, sem exceção:
- No mínimo 1 entrevista com usuário por semana
- Revisão semanal de dados de comportamento
- Revisão de feedback de suporte e reviews

Esse ritmo garante que o time nunca fica mais de 7 dias sem novo aprendizado sobre o cliente.

### Estrutura de uma Boa Entrevista de Discovery

**Duração:** 30-45 minutos

**Estrutura:**
1. **Abertura (5 min):** Contexto, permissão, objetivo ("Não estamos testando você, estamos aprendendo sobre suas experiências")
2. **Contexto do usuário (10 min):** Quem é essa pessoa, qual é a situação de vida dela, quais são suas metas financeiras
3. **Comportamento atual (15 min):** Como ela faz X hoje? Me conta a última vez que... O que aconteceu quando...
4. **Descoberta de problemas (10 min):** O que é mais frustrante? O que você tentou que não funcionou? Se tivesse uma varinha mágica...
5. **Encerramento (5 min):** O que não perguntei e deveria ter perguntado?

**Perguntas a NUNCA fazer:**
- "Você usaria um produto que faz X?" (hipotético, sem valor)
- "Você gostaria de [feature]?" (leading, confirma o que você já quer ouvir)
- "Por que você não usa nossa feature Y?" (defensivo, não produtivo)

**Perguntas poderosas:**
- "Me conta a última vez que você [comportamento relevante]"
- "O que aconteceu depois?"
- "Por que isso era importante para você?"
- "O que você tentou antes?"
- "O que te impediu de [ação desejada]?"

### Opportunity Solution Tree

Teresa Torres (colaboradora do SVPG) sistematizou o framework de Opportunity Solution Tree:

1. **Desired Outcome** (topo): o outcome de negócio que o time quer atingir
2. **Opportunities** (nível 2): problemas e necessidades dos usuários que, se resolvidos, contribuem para o outcome
3. **Solutions** (nível 3): hipóteses de como resolver cada opportunity
4. **Experiments** (nível 4): como validar cada solução antes de construir

Esse framework evita o erro de pular direto de outcome para solução sem passar pela oportunidade.

---

## 6. Métricas de Produto

### Framework de Métricas para SaaS

**Pirâmide de métricas:**

```
North Star Metric (1 métrica)
       ↑
Input Metrics (3-5 métricas)
       ↑
Health Metrics (guardrails)
```

**North Star Metric:** A métrica que melhor captura o valor que o produto entrega ao usuário e que prediz crescimento de longo prazo.

Para o SPFP SaaS, candidatos a North Star:
- **Usuários com controle financeiro ativo** (definido por: criou budget + acompanhou por 4 semanas consecutivas)
- **Objetivos financeiros atingidos por mês**
- **DAU com pelo menos 1 ação financeira** (lançou transação, revisou budget, etc.)

**Input Metrics** (o que o time pode influenciar diretamente):
- Taxa de ativação (setup completo → aha moment)
- Frequência de retorno semanal
- Feature adoption (% de usuários usando budgets, goals, investments)
- Tempo na plataforma por sessão
- NPS por segmento

**Health Metrics** (guardrails — alertam se estamos piorando algo):
- Churn rate mensal
- Tempo de carregamento / erros
- Taxa de suporte / tickets abertos
- Revenue per user

### Métricas do Funil de Aquisição → Retenção

```
Aquisição → Ativação → Retenção → Receita → Indicação
```

**Para SaaS:**
- **Aquisição:** Custo por lead, custo por signup
- **Ativação:** % que completa setup, time-to-first-value
- **Retenção:** D7, D14, D30, D90 retention; churn mensal
- **Receita:** Conversion free-to-paid, ARPU, LTV, MRR
- **Indicação:** Viral coefficient, NPS, reviews

**Para Infoprodutos:**
- **Aquisição:** Custo por lead, custo por venda
- **Ativação:** % que começa o curso, tempo até primeiro módulo concluído
- **Engajamento:** Taxa de conclusão, % que aplica o conteúdo
- **Receita:** Ticket médio, LTV (considerando próximos produtos)
- **Indicação:** Taxa de recomendação, NPS, depoimentos

### Métricas de Produto vs. Métricas de Marketing

Erro comum: confundir métricas de produto com métricas de marketing.

**Métricas de Marketing:**
- Impressões, cliques, CTR
- Leads gerados
- Custo de aquisição
- Taxa de conversão de página de vendas

**Métricas de Produto:**
- Ativação (usuário atingiu o valor)
- Retenção (usuário voltou)
- Engajamento (usuário usa o produto com profundidade)
- Outcome (usuário atingiu o objetivo desejado)

As métricas de marketing dizem se as pessoas chegam. As métricas de produto dizem se ficam e se transformam.

---

## 7. Priorização de Features e Iniciativas

### O Framework RICE

**Reach × Impact × Confidence / Effort**

- **Reach:** Quantos usuários são afetados por período?
- **Impact:** Qual o impacto por usuário? (escala 1-5)
- **Confidence:** Quão confiantes estamos no impacto? (% baseada em evidências)
- **Effort:** Quanto tempo de engenharia em person-months?

**Limitação do RICE:** É uma ferramenta de discussão, não de decisão automatizada. O número final importa menos do que a conversa que a análise força.

### Priorização por Jobs to be Done

Antes de priorizar features, priorize os Jobs. Quais trabalhos os usuários precisam fazer? Quais desses trabalhos são mais frequentes, mais importantes e onde o produto está mais aquém?

**Jobs do usuário do SPFP SaaS:**
1. Entender onde meu dinheiro vai (tracking de gastos)
2. Não gastar mais do que posso (controle de budget)
3. Guardar para algo específico (objetivos financeiros)
4. Entender se estou no caminho certo (insights e dashboards)
5. Tomar decisões financeiras importantes (investimentos, grandes compras)
6. Organizar dívidas e financiamentos (gestão de passivos)

Priorize features que desbloqueiam ou melhoram os Jobs mais importantes e mais mal servidos.

### Como Dizer Não para Stakeholders

Dizer não para features é uma das habilidades mais importantes do PM. Mas o "não" deve ser fundamentado:

1. **Conecte à estratégia:** "Nossa prioridade esse quarter é retenção. Essa feature não tem impacto direto na retenção — por isso não está no topo da lista agora."

2. **Peça evidências:** "Qual é a evidência de que os usuários precisam disso? Temos dados de uso que sugerem que esse é um problema frequente?"

3. **Proponha discovery antes:** "Antes de comprometer engenharia com isso, que tal fazermos 5 entrevistas com usuários para entender se esse é realmente o problema?"

4. **Mostre o custo de oportunidade:** "Se colocarmos engenharia nisso agora, vamos atrasar [iniciativa Y] que tem impacto direto na nossa métrica de retenção. Como você pesa esse trade-off?"

---

## 8. Infoprodutos vs. Software: Diferenças e Como Lidar com Ambos

### As Diferenças Fundamentais

| Dimensão | SaaS (SPFP) | Infoproduto (Cursos) |
|----------|------------|---------------------|
| Entrega de valor | Contínua (o produto funciona todo dia) | Concentrada (durante o curso) |
| Métrica primária | Retenção, DAU, NPS | Conclusão, aplicação, transformação |
| Ciclo de iteração | Contínuo (releases frequentes) | Periódico (nova turma, nova versão) |
| Feedback do usuário | Dados de comportamento + suporte | Survey, NPS, depoimentos |
| Discovery | Entrevistas + testes de protótipo + dados | Entrevistas + análise de conclusão |
| Churn | Usuário cancela a assinatura | Aluno abandona o curso |
| "Produto novo" | Feature set, nova versão | Novo curso, módulo adicional |

### Como o SaaS e o Infoproduto se Potencializam

A vantagem competitiva da SPFP está na sinergia entre os dois produtos. Isso é raro e poderoso — e precisa ser explorado estrategicamente.

**Fluxo natural do cliente:**

```
Problema financeiro (dívida, falta de controle, objetivo não atingido)
        ↓
Descobre infoproduto (curso de finanças)
        ↓
Aprende os conceitos e quer aplicar
        ↓
Descobre o SPFP SaaS como ferramenta de aplicação
        ↓
Usa o SaaS diariamente para implementar o que aprendeu
        ↓
Quer aprender mais → próximo infoproduto
```

Esse ciclo é o que diferencia a SPFP de uma fintech comum (só SaaS) ou de uma plataforma de cursos comum (só infoproduto). A combinação cria uma jornada completa de transformação financeira.

**Oportunidades de integração:**
- Alunos do curso ganham acesso gratuito/com desconto ao SaaS
- O SaaS recomenda o infoproduto quando o usuário encontra um problema que o curso resolve
- Templates e metodologias do curso são aplicáveis diretamente no SaaS
- Dados do SaaS alimentam exercícios práticos do curso (com consentimento)

### Discovery para Infoprodutos

O processo de discovery para infoprodutos é análogo ao de software, mas com adaptações:

**Protótipos:** Em vez de protótipos de interface, o protótipo de um infoproduto é um workshop piloto, uma aula experimental, ou um módulo beta com um grupo pequeno de alunos.

**Testes de demanda:** Landing pages, webinars gratuitos como "demand test", pré-vendas antes de produzir o curso completo.

**Métricas de discovery:**
- Engajamento em conteúdo gratuito (blog, YouTube, emails) como proxy de interesse
- Taxa de conversão de webinar → compra como validação de demanda
- Net Promoter Score de turmas piloto antes de escalar

**Entrevistas com alunos após o curso:**
- "Qual foi a maior mudança que o curso gerou na sua situação financeira?"
- "O que você aplicou imediatamente? O que ficou só na teoria?"
- "O que você queria que o curso tivesse abordado mas não abordou?"
- "O que te impediu de aplicar algum conteúdo?"

---

## 9. Product-Market Fit e Quando Escalar

### O que é PMF de Verdade

Product-Market Fit não é uma métrica — é uma percepção. É quando você sente que o produto está sendo "puxado" pelo mercado, não "empurrado" pela empresa.

Sinais de PMF:
- Usuários ficam frustrados quando o produto fica indisponível
- Crescimento orgânico significativo (boca a boca, referrals)
- Retenção alta nas cohorts de usuários mais engajados
- Suporte fica sobrecarregado com o volume de usuários
- Investidores começam a aparecer sem você ir atrás

Sinais de que PMF ainda não foi atingido:
- Growth depende exclusivamente de paid acquisition
- Churn é alto mesmo entre usuários que acharam o produto útil
- Usuários precisam ser convencidos de que precisam do produto
- Feedback é positivo mas uso é inconsistente

### Quando Escalar

A regra de Cagan: **nunca escale antes de PMF**. Escalar antes de PMF é a maneira mais eficiente de escalar problemas.

O momento certo de escalar é quando você tem cohorts de retenção estáveis e crescentes, NPS forte (acima de 40-50), e crescimento orgânico mensurável.

Para o SPFP, as perguntas de PMF:
- Qual % dos usuários que chegaram ao aha moment ainda estão ativos em 90 dias?
- Qual % do crescimento vem de indicação orgânica?
- Se a gente desligar o produto por uma semana, quantos usuários reclamariam ativamente?

---

## 10. Como Priorizar Quando Você Tem Dois Produtos

### O Desafio da Dupla Priorização

Ter dois produtos (SaaS + infoprodutos) cria um desafio específico de alocação de recursos: onde investir o tempo limitado do time?

**Framework de decisão:**

1. **Qual produto está mais longe do PMF?** Esse merece prioridade de discovery e iteração.

2. **Qual produto tem maior alavancagem para o outro?** Se um produto forte alimenta o outro naturalmente, priorize o que tem maior efeito multiplicador.

3. **Qual produto tem maior margem de melhoria com menor esforço?** Oportunidades de quick wins importantes para liberar recursos para o próximo ciclo.

4. **Qual é a estratégia de longo prazo?** O SaaS cria barreiras de saída (dados, histórico, hábito). Os infoprodutos criam autoridade e funil de aquisição. Ambos são estratégicos — mas podem ter momentos de prioridade diferente.

### Modelo de Portfólio de Produto

Pense nos dois produtos como um portfólio com papéis diferentes:

- **Infoprodutos:** Marketing + Aquisição + Monetização pontual (alto LTV no momento da venda)
- **SaaS:** Retenção + Monetização recorrente + Dados + Plataforma de expansão (LTV crescente ao longo do tempo)

A estratégia ideal é que os infoprodutos alimentem o SaaS com usuários já educados e motivados, e o SaaS reforce a credibilidade e necessidade dos infoprodutos.
