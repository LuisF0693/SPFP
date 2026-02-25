# Base de Conhecimento — Lincoln Murphy
## Aplicada ao Contexto SPFP (App de Finanças Pessoais SaaS)

---

## 1. Desired Outcome Framework

### Conceito Fundamental

O Desired Outcome é a pedra angular de toda a filosofia de Customer Success de Lincoln Murphy. A definição formal é:

> **Desired Outcome = Required Outcome + Appropriate Experience**

O erro mais comum de times de CS é focar no que o cliente **pede** (feature X, integração Y) sem entender o que ele **precisa atingir** (o Required Outcome) e como ele **precisa atingir** (o Appropriate Experience).

### Required Outcome (RO)

O Required Outcome é o resultado de negócio ou de vida que o cliente precisa alcançar para que o produto seja bem-sucedido na perspectiva dele. É o "trabalho" que ele contratou o produto para fazer.

**No contexto SPFP**, os Required Outcomes mais comuns dos usuários são:

| Segmento de Usuário | Required Outcome |
|---|---|
| Endividado em recuperação | Sair do vermelho, quitar dívidas, ter saldo positivo |
| Jovem profissional | Construir reserva de emergência, começar a investir |
| Família de classe média | Controlar gastos do mês, não estourar o orçamento |
| Trabalhador autônomo/freelancer | Separar pessoa física de pessoa jurídica, provisionar impostos |
| Pré-aposentadoria | Simular patrimônio futuro, garantir independência financeira |

**Erro fatal**: Perguntar "o que você quer no app?" em vez de "o que você quer alcançar na sua vida financeira?" O primeiro gera lista de features. O segundo gera clareza sobre o Required Outcome.

### Appropriate Experience (AE)

O Appropriate Experience é a forma como o cliente precisa ou quer alcançar esse resultado — considerando suas limitações, preferências, nível de sofisticação e contexto.

**No contexto SPFP**, o Appropriate Experience varia radicalmente por segmento:

| Perfil | Appropriate Experience |
|---|---|
| Usuário ansioso com finanças | Interface não-intimidadora, sem termos técnicos, feedback positivo frequente |
| Usuário analítico | Dados granulares, gráficos detalhados, possibilidade de exportação |
| Usuário ocupado | Processo rápido, categorização automática, insights resumidos |
| Usuário iniciante | Guias passo-a-passo, tutoriais contextuais, templates de orçamento |
| Usuário avançado | Acesso a raw data, integrações, customização total de categorias |

### A Armadilha da Satisfação

Murphy é enfático: **satisfação não é sucesso**. Um usuário pode adorar o design do SPFP, achar o app bonito, dar 5 estrelas — e ainda assim não estar atingindo seu Required Outcome. Esse usuário vai cancelar. O trabalho de CS é garantir que o usuário esteja progredindo em direção ao Required Outcome, não apenas que ele esteja satisfeito com a experiência.

### Fechando o Success Gap

O Success Gap é a distância entre onde o cliente está e onde ele precisa estar para atingir o Desired Outcome. CS tem uma função: **fechar esse gap o mais rápido possível**.

No SPFP, o Success Gap de um usuário novo típico:

```
Onde está: Criou conta, mas não conectou banco, não definiu metas, não categorizou transações
Onde precisa estar: Dashboard completo, metas definidas, orçamento ativo, insights de IA relevantes
Success Gap: Grande — risco alto de churn precoce
Intervenção: Onboarding guiado + notificações contextuais + primeiro insight automático de IA
```

---

## 2. Customer Health Score — Como Estruturar

### Por que Health Score Importa

O Health Score é o instrumento que permite CS ser proativo, não reativo. Sem um health score bem calibrado, CS opera no escuro — esperando o cliente reclamar ou cancelar para agir. Com um health score, o time detecta risco antes que ele se manifeste.

### Dimensões do Health Score para SPFP

Murphy recomenda 5-7 dimensões, ponderadas por impacto em churn. Para o SPFP:

#### Dimensão 1: Engajamento com o Produto (peso: 30%)
Mede frequência e profundidade de uso.

| Indicador | Score Alto | Score Baixo |
|---|---|---|
| Sessões nos últimos 30 dias | >= 8 sessões | < 2 sessões |
| Dias desde último acesso | <= 3 dias | >= 14 dias |
| Tempo médio por sessão | >= 5 min | < 1 min |
| Features utilizadas | >= 4 features | <= 1 feature |

#### Dimensão 2: Adoção de Features Críticas (peso: 25%)
Mede se o usuário usa as features que mais correlacionam com retenção.

Features críticas do SPFP (aquelas que mais predizem retenção de 90 dias):
- Conexão de conta bancária (ou lançamento manual consistente)
- Orçamento mensal ativo e monitorado
- Pelo menos 1 meta financeira definida
- Uso do módulo de Insights de IA
- Categorização consistente de transações

Score: 5 pontos por feature crítica adotada, máximo 25.

#### Dimensão 3: Progresso em Direção ao Desired Outcome (peso: 20%)
Mede se o usuário está atingindo seus objetivos declarados.

| Indicador | Score Alto | Score Baixo |
|---|---|---|
| % de progresso nas metas | >= 10% de avanço | 0% ou regressão |
| Orçamento respeitado no mês | >= 80% das categorias no verde | > 50% no vermelho |
| Saldo médio de contas | Crescendo ou estável | Declinando consistentemente |

#### Dimensão 4: Sentimento e Satisfação (peso: 15%)
Mede NPS e feedbacks qualitativos.

| Indicador | Score Alto | Score Baixo |
|---|---|---|
| NPS | 9-10 (Promotor) | 0-6 (Detrator) |
| CSAT pós-suporte | >= 4/5 | <= 2/5 |
| Review app store | 4-5 estrelas | 1-2 estrelas |
| Responde pesquisas in-app | Sim, frequentemente | Nunca respondeu |

#### Dimensão 5: Indicadores Financeiros/Plano (peso: 10%)
Mede status do plano e saúde financeira da conta.

| Indicador | Score Alto | Score Baixo |
|---|---|---|
| Plano | Premium ativo | Free sem conversão após 60d |
| Pagamentos | Em dia | Falha de pagamento recente |
| Histórico | Nunca falhou | Já fez churn e voltou |

### Thresholds de Intervenção

| Faixa de Score | Status | Ação de CS |
|---|---|---|
| 80-100 | Saudável | Nurture, identificar oportunidade de expansão |
| 60-79 | Em observação | Check-in proativo, conteúdo educativo direcionado |
| 40-59 | Em risco | Intervenção direta: e-mail personalizado, notificação crítica |
| 20-39 | Alto risco | Intervenção urgente, oferta de ajuda, pesquisa de win-back |
| 0-19 | Crítico | Tentativa de salvamento imediata, entender causa raiz |

### Calibração do Health Score

Murphy sempre alerta: health scores precisam ser calibrados com dados reais de churn. O processo:

1. Exportar cohort de usuários que churnearam nos últimos 90 dias
2. Analisar o health score deles 30 dias antes do churn
3. Identificar quais indicadores caíram primeiro (leading indicators)
4. Ajustar pesos das dimensões para que o score prediga churn com 30+ dias de antecedência
5. Recalibrar trimestralmente

---

## 3. Early Warning Signals de Churn

### Filosofia: Churn é o Último Sintoma

Murphy é categórico: quando o usuário cancela, o churn já aconteceu semanas ou meses antes — no momento em que ele parou de usar o produto de forma significativa, quando encontrou atrito sem ajuda, quando não atingiu o Desired Outcome e começou a questionar o valor.

CS que opera no momento do cancelamento já perdeu a batalha. A função do Early Warning System é detectar o sinal de risco **antes** que o usuário conscientize que vai sair.

### Sinais de Alerta por Categoria

#### Sinais Comportamentais (os mais preditivos)

**Nível Vermelho — Risco Alto:**
- Sem acesso ao app por >= 10 dias (usuário ativo que para de acessar)
- Queda de >= 60% em sessões semanais em comparação às 4 semanas anteriores
- Parou de lançar transações após ter rotina estabelecida
- Ignorou 3+ notificações consecutivas do app

**Nível Amarelo — Risco Moderado:**
- Frequência de acesso caiu >= 40% mas ainda acessa semanalmente
- Sessões muito curtas (< 1 min) sem ação significativa
- Acessou apenas 1 feature na última semana (em vez do padrão de múltiplas)
- Não respondeu à pesquisa in-app de NPS

**Nível Verde de Monitoramento:**
- Usuário sempre ativo que perdeu 1 semana de acesso
- Pequena queda de engajamento em período de sazonalidade (ex: festas de fim de ano)

#### Sinais Funcionais (indicam problema com produto ou onboarding)

- Nunca completou o onboarding após 7 dias de cadastro
- Conta criada há > 14 dias, zero metas definidas
- Transações cadastradas mas categorias nunca revisadas (sugere confusão com o sistema)
- Feature utilizada e depois abandonada (usuário tentou e desistiu — indicador de atrito)
- Múltiplos acessos à mesma tela de ajuda (confusão persistente)

#### Sinais de Sentimento

- NPS de 0-6 (detrator) — independente do nível de uso
- Review negativa na App Store
- Ticket de suporte com tom frustrado ou comparação com concorrente
- Cancelamento de notificações push (desconexão intencional)
- Unsubscribe de e-mails do produto

#### Sinais Financeiros (para planos pagos)

- Falha no pagamento mensal (churn involuntário iminente)
- Acesso à página de cancelamento no app
- Downgrade de plano (precursor frequente de churn)
- Solicitação de reembolso

### Playbook de Intervenção por Sinal

**Sinal: 10 dias sem acesso (usuário que tinha rotina)**
```
D+10: E-mail automático "Sentimos sua falta" com 1 insight do período (ex: "Você teria economizado R$X este mês")
D+14: Notificação push personalizada com contexto de meta ("Sua meta de reserva de emergência está em X%")
D+17: E-mail com conteúdo educativo relevante ao perfil do usuário
D+21: Pesquisa curta de 1 pergunta: "O que aconteceu? Posso ajudar?"
```

**Sinal: Nunca completou onboarding após 7 dias**
```
D+3: Notificação: "Complete em 3 minutos e veja seu diagnóstico financeiro"
D+5: E-mail com vídeo curto do First Value Delivery possível
D+7: In-app message com quick-win (ex: "Veja quanto você gastou esta semana — leva 30 segundos")
D+10: Oferta de trial extended se for plano free, ou call de onboarding se premium
```

**Sinal: NPS 0-6 recebido**
```
Imediato: Pesquisa follow-up automática: "O que não funcionou como você esperava?"
Em 24h: E-mail pessoal do CS com "Quero entender o que aconteceu"
Se responder: Tentar call de 15 minutos para entender o problema real
```

---

## 4. Onboarding Framework para SaaS/Software

### Princípio Central: Time to First Value (TTFV)

O único objetivo do onboarding é levar o usuário ao **First Value Delivery** (FVD) o mais rápido possível. Tudo no onboarding que não contribui para isso é ruído.

Para o SPFP, Murphy define o **Financial Clarity Moment** como o FVD primário:

> **Financial Clarity Moment (FCM)**: O usuário vê pela primeira vez seu dashboard financeiro completo — receitas vs. despesas, saldo atual, e um insight acionável sobre seu dinheiro.

Meta: FCM dentro de **10 minutos** da primeira sessão.

### Fases do Onboarding no SPFP

#### Fase 1: Ativação Inicial (primeiros 10 minutos)
**Objetivo**: Chegrar ao Financial Clarity Moment

Passos mínimos necessários:
1. Pergunta inicial: "O que você mais quer resolver hoje?" (define o RO, personaliza a jornada)
2. Cadastrar ou conectar pelo menos 1 conta (bancária ou cartão de crédito)
3. Ver o dashboard preenchido com dados reais
4. Receber o primeiro Insight de IA ("Seus maiores gastos esta semana foram em...")

O que NÃO fazer no onboarding inicial:
- Pedir informações que não são necessárias agora (CPF, foto de perfil, etc.)
- Mostrar todas as features disponíveis (overwhelm)
- Exigir que o usuário categorize manualmente cada transação antes de ver valor

#### Fase 2: Engajamento Profundo (dias 2-14)
**Objetivo**: Adoção das features críticas de retenção

Sequência de ativação progressiva:
- Dia 2: Convite para definir primeira meta financeira
- Dia 4: Introdução ao módulo de orçamento ("Você quer saber se está gastando de acordo com seus objetivos?")
- Dia 7: Primeiro relatório semanal automático enviado por e-mail/notificação
- Dia 10: Convite para explorar Insights de IA com pergunta personalizada
- Dia 14: Check-in de saúde: "Como está indo o controle das suas finanças?"

#### Fase 3: Habituação (dias 15-30)
**Objetivo**: Tornar o SPFP parte da rotina financeira do usuário

- Série de "insights semanais" automáticos via e-mail
- Gamificação leve: "Esta semana você ficou dentro do orçamento em 3 categorias!"
- Conteúdo educativo contextual (ex: se usuário tem meta de reserva, enviar artigo sobre estratégias)
- Primeiro contato sobre plano premium no contexto de uma limitação relevante (não como spam)

#### Fase 4: Onboarding Contínuo (30+ dias)
Murphy insiste que onboarding não termina. Quando o SPFP lança uma nova feature, cada usuário precisa de um "mini-onboarding" para ela. Quando o usuário muda de fase de vida (casa nova, filho, mudança de emprego), o app precisa reconhecer e reposicionar o valor.

### O Que Murphy Nunca Faz no Onboarding

1. **Não bombardeia com tutoriais todos de uma vez** — tutoriais contextuais, no momento certo
2. **Não pede mais informações do que o necessário para entregar valor** — cada campo é justificado
3. **Não deixa o usuário descobrir valor por conta própria** — CS ativamente guia o caminho
4. **Não trata onboarding como um checklist de features** — é um caminho para o Desired Outcome
5. **Não esquece do usuário após os primeiros 7 dias** — o risco de churn aumenta nas semanas 3-6

---

## 5. Expansion Revenue Playbook

### Premissa: Expansion é Consequência de Sucesso, não de Venda

Murphy é claro: tentar fazer upsell de um usuário que ainda não atingiu o First Value Delivery é a forma mais rápida de gerar desconfiança e churn. Expansion revenue saudável acontece quando o usuário já está bem-sucedido e quer ir mais longe.

### Gatilhos de Expansão no SPFP

**Gatilho 1: Usuário Atingiu uma Meta**
```
Situação: Usuário completou meta de reserva de emergência
Momento: Dashboard mostra "Meta atingida!" com celebração
Expansion: "Agora que você tem sua reserva, o próximo passo é começar a investir. Nosso plano Premium inclui análise de investimentos."
Por que funciona: O usuário está no momento de maior satisfação e progresso — naturalmente receptivo ao próximo passo.
```

**Gatilho 2: Usuário Encontrou Limitação do Plano Free**
```
Situação: Usuário free tentou gerar relatório PDF ou usar análise de investimentos
Momento: Feature bloqueada com mensagem clara
Expansion: Mostrar o valor específico da feature para o contexto atual do usuário (não catálogo genérico)
Por que funciona: O usuário já percebeu o valor — o limite é natural e esperado.
```

**Gatilho 3: Insight de IA Cria Contexto de Upgrade**
```
Situação: IA detecta padrão de gastos que premium resolveria melhor
Momento: Insight diz "Percebo que você gasta R$X em Y categoria. Posso criar uma análise detalhada de otimização — disponível no plano Premium."
Por que funciona: O próprio produto demonstra concretamente o valor adicional, não o marketing.
```

**Gatilho 4: Usuário com Alta Atividade e Engajamento**
```
Situação: Health score >= 80, usuário usa 5+ features, acessa diariamente
Momento: Após 30 dias de uso intenso
Expansion: "Você está usando o SPFP como um profissional. Usuários com seu perfil aproveitam ainda mais com o plano Premium."
Por que funciona: Usuário já criou hábito e está claramente extraindo valor.
```

### O Que Nunca Fazer em Expansion

- Oferecer upgrade logo no onboarding (antes do FVD)
- Bloquear funcionalidades essenciais que impedem o Desired Outcome básico
- Mostrar banner genérico de upgrade desconectado do contexto atual do usuário
- Pressionar com urgência artificial ("Oferta expira em 24h") sem contexto de valor

### Modelo de Pricing para Expansion (perspectiva CS)

Murphy defende que o plano free deve ser suficiente para o Desired Outcome básico — caso contrário, o usuário não atinge sucesso e nunca considera pagar. O premium deve oferecer profundidade para quem quer ir além.

Para o SPFP:
- Free: Controle básico, metas simples, insights iniciais → Desired Outcome: clareza financeira básica
- Premium: Análise avançada, investimentos, relatórios, IA avançada → Desired Outcome: crescimento e otimização financeira

---

## 6. Segmentação de Clientes

### Por Que Segmentar em CS

Murphy argumenta que CS sem segmentação é ineficiente. Tratar todos os usuários com a mesma abordagem significa:
- Gastar recursos com usuários de baixo potencial
- Não dar atenção suficiente a usuários de alto valor
- Mensagens genéricas que não ressoam com ninguém

### Dimensões de Segmentação para SPFP

#### Dimensão 1: Nível de Engajamento
- **Power Users**: Acesso diário, todas as features ativas, health score > 80
- **Regular Users**: Acesso 2-4x por semana, features principais ativas, health score 50-79
- **Casual Users**: Acesso semanal ou menos, poucas features, health score 20-49
- **At-Risk Users**: Sem acesso há 7+ dias, health score < 20

#### Dimensão 2: Fase da Jornada Financeira
- **Iniciante**: Nunca organizou finanças, nenhuma reserva, dívidas ativas
- **Em Construção**: Começou a organizar, reserva em progresso, dívidas sendo pagas
- **Estabilizado**: Contas organizadas, reserva construída, começando a investir
- **Avançado**: Patrimônio sendo construído, investimentos diversificados, metas de longo prazo

#### Dimensão 3: Plano
- Free sem conversão (< 30 dias)
- Free há 30+ dias sem conversão (candidato a conversão ou churn)
- Premium recente (< 90 dias)
- Premium veterano (90+ dias)

#### Dimensão 4: Perfil Financeiro
- Assalariado: Renda previsível, gastos variáveis, meta de controle
- Autônomo/Freelancer: Renda variável, necessidade de provisionamento
- Empresário: Separação PJ/PF, fluxo de caixa complexo
- Estudante: Renda baixa, aprendizado inicial, alta sensibilidade a preço

### Matriz de Prioridade de CS por Segmento

| Segmento | Prioridade | Modelo Touch | Foco da Intervenção |
|---|---|---|---|
| Premium + At-Risk | CRÍTICA | Low Touch | Salvamento imediato |
| Premium + Regular | ALTA | Tech Touch | Expansion |
| Free + Power User | ALTA | Tech Touch | Conversão para Premium |
| Free + At-Risk | MÉDIA | Tech Touch | Reativação |
| Free + Casual | BAIXA | Tech Touch | Conteúdo educativo |

---

## 7. Métricas Chave de CS

### NRR — Net Revenue Retention

**Fórmula**: NRR = (MRR início do período + Expansão - Contração - Churn) / MRR início * 100

**O que mede**: A saúde real do negócio de receita recorrente. NRR > 100% significa crescimento orgânico da base existente.

**Benchmarks para SaaS B2C Fintech**:
- < 90%: Problema sistêmico de retenção
- 90-100%: Adequado, mas sem crescimento orgânico
- 100-110%: Saudável — CS está funcionando
- > 110%: Excelente — programa CS de alta performance

**Para o SPFP**: Murphy mira NRR > 105%.

### GRR — Gross Revenue Retention

**Fórmula**: GRR = (MRR início - Contração - Churn) / MRR início * 100 (sem contar expansão)

**O que mede**: Capacidade de manter a receita sem crescimento. GRR é o "piso" do NRR.

**Benchmark SPFP**: > 85%

### Churn Rate

**Tipos**:
- Logo Churn: % de usuários que cancelam
- Revenue Churn: % de receita perdida com cancelamentos
- Net Revenue Churn: Revenue Churn - Expansion (pode ser negativo = bom sinal)

**Para SPFP**:
- Logo Churn aceitável (premium): < 3% ao mês
- Logo Churn preocupante: > 5% ao mês
- Churn involuntário (falhas de pagamento): deve ser < 1.5% e tratado com dunning

### NPS — Net Promoter Score

**Fórmula**: % Promotores (9-10) - % Detratores (0-6)

**Benchmark Fintech B2C**: 40-60 é bom. > 60 é excelente.

**Como usar em CS**:
- Detratores (0-6): Contato imediato para entender o problema
- Neutros (7-8): Oportunidade de converter em promotores com uma intervenção específica
- Promotores (9-10): Convidar para programa de indicação ou beta de novas features

Murphy alerta: NPS é um lagging indicator. Use-o para validar, não para diagnosticar. Early warning signals são leading indicators mais úteis para CS.

### CSAT — Customer Satisfaction Score

**Uso**: Pós-interação de suporte, pós-onboarding, pós-feature launch.

**Escala**: 1-5 (ou 1-10)

**Para SPFP**: Meta de CSAT >= 4.2/5 em interações de suporte.

### TTV — Time to Value

**Fórmula**: Tempo médio desde cadastro até o First Value Delivery

**Para SPFP**: Meta de TTV < 10 minutos para o Financial Clarity Moment.

**Por que importa**: Estudos de retenção em SaaS mostram correlação direta entre TTV e retenção de 30 dias. Usuários que chegam ao FVD em < 5 minutos têm taxa de retenção de 30 dias significativamente superior.

### Activation Rate

**Fórmula**: % de usuários que atingem o FVD dentro de N dias do cadastro

**Para SPFP**:
- Meta: >= 60% de ativação em 7 dias
- < 40% de ativação em 7 dias = problema sistêmico de onboarding

### Expansion Rate

**Fórmula**: % de usuários free que convertem para premium por mês (ou % que fazem upsell)

**Para SPFP**: Meta de 3-5% de conversão mensal da base free ativa.

### Health Score Médio da Base

**Referência**: Medir health score médio por segmento mensalmente e acompanhar a tendência.

Um health score médio crescente indica que o programa CS está funcionando. Em queda, indica problema sistêmico a investigar.

---

## 8. Framework de CS Operations para SPFP

### Estrutura de Playbooks

Murphy estrutura playbooks como procedimentos claros e repetíveis que qualquer membro do time pode executar:

**Playbook 1: Onboarding Success (novos usuários)**
- Trigger: Novo cadastro
- Sequência: 14 dias de comunicação progressiva
- Meta: Financial Clarity Moment em < 10 min; 3 features críticas ativas em 14 dias

**Playbook 2: At-Risk Intervention**
- Trigger: Health score < 40 ou 10 dias sem acesso
- Sequência: E-mail D+0, push D+3, e-mail D+7, pesquisa D+14
- Meta: Reativação de 30%+ dos usuários em risco

**Playbook 3: Expansion Nudge**
- Trigger: Health score > 75 + feature limit encontrada
- Sequência: In-app message contextual, e-mail de caso de uso, oferta temporária
- Meta: Conversão de 15%+ dos usuários abordados

**Playbook 4: Churn Involuntário**
- Trigger: Falha de pagamento
- Sequência: E-mail imediato, SMS D+2, retenção de acesso por 7 dias, dunning final
- Meta: Recuperação de 50%+ de churns involuntários

**Playbook 5: Win-Back**
- Trigger: Usuário que cancelou nos últimos 90 dias
- Sequência: E-mail 30 dias pós-churn com insight de melhoria + oferta de retorno
- Meta: Recuperação de 10-15% de churns voluntários

### Cadência de Reviews

Murphy define a cadência de revisão de métricas CS:

| Frequência | Reunião | Participantes | Foco |
|---|---|---|---|
| Diária | CS Daily Standup | Time CS | Health score alerts, intervenções ativas |
| Semanal | CS Weekly Review | CS + Produto | Ativação, churn da semana, early warnings |
| Mensal | CS Monthly Business Review | CS + CEO + Finance | NRR, expansion, health score trends |
| Trimestral | CS QBR | Board level | Estratégia, benchmarks, metas |
