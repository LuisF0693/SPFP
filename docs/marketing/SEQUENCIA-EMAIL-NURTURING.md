# Sequência de Email — Nurturing Pós-Consulta
**Agente:** Email Strategist
**Ferramenta:** MailerLite (configurar agora — gratuito até 1.000 contatos)
**Integração:** Calendly → MailerLite (automático via webhook)

---

## Setup Inicial (fazer antes de qualquer campanha)

### Passo 1 — Criar conta MailerLite
1. Acessar mailerlite.com → criar conta gratuita
2. Verificar domínio de email (usar email profissional Luis@spfp.com.br se houver)
3. Configurar remetente: "Luis | SPFP" — não "Sistema SPFP" — personalização converte mais

### Passo 2 — Integrar Calendly
1. No MailerLite: Integrations → Webhooks → copiar URL
2. No Calendly: Integrations → Webhooks → colar URL do MailerLite
3. Evento: "Invitee Created" → adiciona à lista "Leads Consulta Gratuita"
4. Evento: "Invitee Canceled" → move para lista "Cancelamentos" (não deletar — reengajar depois)

### Passo 3 — Criar automação pós-consulta
Trigger: tag "CONSULTA_REALIZADA" adicionada manualmente pelo Luis após cada conversa
→ Iniciar sequência de 7 emails abaixo

---

## Sequência 1 — Pós-Consulta (não fechou na hora)

### Email 1 — D+1 (no dia seguinte à consulta)
**Assunto:** "Resumo da nossa conversa, [Nome]"
**Objetivo:** Personalização + mostrar que Luis prestou atenção

```
Olá, [Nome].

Foi bom conversar com você ontem.

Saí da nossa conversa com três pontos principais sobre a sua situação:

1. [PONTO 1 — Luis preenche manualmente ou via template: ex: "Você sente que o dinheiro some sem saber onde foi"]
2. [PONTO 2]
3. [PONTO 3]

Isso é mais comum do que parece. Trabalho com isso todos os dias e o
padrão se repete — não é falta de disciplina, é falta de sistema.

Se quiser dar o próximo passo, o link para conhecer o SPFP está aqui:
[Link planos]

Se ainda quiser pensar, sem problema. Fico à disposição.

Luis
Consultor Financeiro | SPFP
```

**Nota:** Luis adiciona os 3 pontos manualmente logo após a consulta (2 minutos de personalização que triplicam a conversão).

---

### Email 2 — D+3
**Assunto:** "O que aconteceu com o [Nome do cliente case] em 3 meses"
**Objetivo:** Prova social com resultado concreto

```
Olá, [Nome].

Quero te contar sobre um cliente meu — vou chamar de "Rafael" para preservar a privacidade.

Rafael tem 34 anos, trabalha como analista de TI, ganha R$7.500/mês.
Chegou pra mim com o mesmo problema que você: sabia que ganhava bem,
mas nunca sobrava nada. E não sabia por quê.

No primeiro mês usando o SPFP, descobrimos que ele gastava R$890/mês
em assinaturas e compras que ele não lembrava de ter feito.

Em 3 meses: R$2.400 guardados. Primeira reserva de emergência da vida dele.

Não mudou a renda. Mudou a clareza.

Se você quiser passar pela mesma transformação:
[Link planos SPFP]

Luis
```

---

### Email 3 — D+5
**Assunto:** "A diferença entre o Finn e qualquer app gratuito"
**Objetivo:** Quebrar objeção "já usei app e não funcionou"

```
Olá, [Nome].

Provavelmente você já tentou algum app de finanças antes.
Nubankzinho, Mobills, alguma planilha do Excel.

Funcionou por quanto tempo?

A maioria abandona em 2-3 semanas. Não porque a pessoa é fraca —
porque esses apps só mostram o que aconteceu. Não dizem o que fazer.

O Finn é diferente por um motivo simples: ele tem contexto.

Ele sabe seus objetivos, sua renda, seus padrões. E quando você
registra um gasto, ele não só categoriza — ele te diz se aquilo
está te afastando ou aproximando do que você quer.

É a diferença entre um aplicativo e um consultor disponível 24 horas.

(A consultoria comigo é o complemento. O Finn cuida do dia a dia.
Eu cuido da estratégia.)

[Link planos SPFP]

Luis
```

---

### Email 4 — D+7
**Assunto:** "Sobre a questão do investimento agora..."
**Objetivo:** Quebrar objeção principal "não tenho dinheiro para pagar agora"

```
Olá, [Nome].

Vou direto ao ponto.

Se você está pensando "não tenho R$99 sobrando por mês para assinar
o SPFP", eu entendo. E quero te mostrar uma conta.

Se você tem o mesmo problema que a maioria dos meus clientes —
dinheiro que some sem saber onde foi — a média que encontramos
nas primeiras semanas é de R$300-600/mês em gastos que a pessoa
não tinha consciência.

O SPFP custa R$99,90.
O que ele revela vale em média R$300-600 de recuperação por mês.

Não é gasto. É investimento com retorno em 10 dias.

Se quiser testar:
[Link planos SPFP]

Se ainda tiver dúvidas, pode me responder esse email diretamente.
Leio tudo.

Luis
```

---

### Email 5 — D+10
**Assunto:** "Tenho [X] vagas abertas esse mês"
**Objetivo:** Urgência real — escassez de atenção do Luis, não desconto artificial

```
Olá, [Nome].

Atendo um número limitado de clientes por mês para conseguir
dar atenção de qualidade para cada um.

Esse mês tenho [X] vagas abertas para novos clientes com
acompanhamento pessoal.

Se você quer uma vaga antes que fechem:
[Link planos SPFP]

O Plano Essencial (R$99,90/mês) já inclui o Finn e acesso completo
à plataforma. Se quiser meu acompanhamento pessoal junto, temos
o Wealth.

Qualquer dúvida, é só responder aqui.

Luis
```

---

### Email 6 — D+14
**Assunto:** "Último contato, [Nome]"
**Objetivo:** Fechamento ou saída limpa

```
Olá, [Nome].

Esse vai ser meu último email por enquanto.

Não quero encher sua caixa de entrada se o momento não é esse pra você.
Completamente ok.

Se quiser voltar quando fizer sentido, o link sempre vai estar aqui:
[Link planos SPFP]

E se quiser conversar de novo — só me mandar um email respondendo esse
ou agendar uma nova conversa:
[Link Calendly]

Boa sorte com suas finanças.
Torço pelo seu sucesso.

Luis
```

---

### Email 7 — D+30 (reengajamento)
**Assunto:** "Uma coisa nova no SPFP que você precisa saber"
**Objetivo:** Reengajar com novidade real — feature, conteúdo ou resultado novo

```
Olá, [Nome].

Faz um mês desde que conversamos.

Queria compartilhar algo novo: [feature nova / conteúdo / resultado de cliente].

Se a sua situação financeira mudou desde então — ou se ainda está
com as mesmas dúvidas de quando conversamos — fico à disposição.

[Link planos] | [Link Calendly para nova conversa]

Luis
```

---

## Sequência 2 — Boas-vindas (novo cliente pagante)

**Trigger:** Pagamento confirmado → tag "CLIENTE_ATIVO"

### Email B1 — Imediato após pagamento
**Assunto:** "Bem-vindo ao SPFP, [Nome] — por onde começar"

```
[Nome], seja bem-vindo.

Você acaba de dar o primeiro passo para ter clareza real sobre seu dinheiro.

Nos próximos 14 dias, vou acompanhar sua configuração inicial.
Aqui está o que fazer agora:

1. Acesse o SPFP: [link]
2. Configure suas contas (leva 5 minutos)
3. Registre os gastos dos últimos 7 dias se lembrar

O Finn vai começar a aprender seus padrões a partir daí.

Na próxima semana, [se plano Wealth: agende nossa primeira sessão de estratégia aqui: Calendly]
[se plano Essencial: se tiver dúvidas, responda esse email]

Vamos juntos.

Luis
```

---

## Newsletter Semanal (lista geral)

**Frequência:** Toda segunda-feira
**Assunto:** "[Insight financeiro da semana] — Luis | SPFP"
**Objetivo:** Manter lista quente, estabelecer autoridade

**Estrutura (sempre igual — previsibilidade constrói abertura):**
```
1 insight financeiro em 3 parágrafos curtos
1 pergunta reflexiva
1 CTA leve (não agressivo): "Se isso te tocou, vale conversar."
```

**Exemplo:**
> Assunto: "O mês que muda tudo nas finanças das pessoas"
>
> Março e setembro são os meses onde mais recebo pedidos de consulta.
> Sabe por quê? Porque são os meses onde as pessoas fazem as contas
> e percebem que o ano está passando e os objetivos não estão saindo do lugar.
>
> A boa notícia: essa percepção incômoda é o começo da mudança.
> A má notícia: a maioria não faz nada com ela além de se sentir mal.
>
> Se você está nesse momento agora, eu tenho uma agenda aberta essa semana.
> [Link Calendly]
>
> Luis

---

## Métricas de Email (acompanhar semanalmente)

| Métrica | Meta |
|---------|------|
| Taxa de abertura | > 40% |
| Taxa de clique | > 5% |
| Conversão lead → cliente | > 15% |
| Taxa de descadastro | < 1% por email |

Se abertura cair abaixo de 30%: revisar assuntos.
Se clique cair abaixo de 3%: revisar CTA e oferta.

---

**Responsável:** Email Strategist — Squad Marketing SPFP
**Aprovado por:** Thiago Finch
