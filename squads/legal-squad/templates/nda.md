# Template: Acordo de Confidencialidade (NDA)

## Metadata
- **id**: nda
- **type**: contract
- **version**: 1.0.0
- **jurisdiction**: Brasil

---

# ACORDO DE CONFIDENCIALIDADE
## (Non-Disclosure Agreement - NDA)

**ACORDO Nº:** {{agreement_number}}
**DATA:** {{agreement_date}}

---

## PARTES

### PARTE DIVULGADORA

**Nome/Razão Social:** {{discloser.name}}
**CPF/CNPJ:** {{discloser.document}}
**Endereço:** {{discloser.address}}
**Representante:** {{discloser.representative}}

### PARTE RECEPTORA

**Nome/Razão Social:** {{recipient.name}}
**CPF/CNPJ:** {{recipient.document}}
**Endereço:** {{recipient.address}}
**Representante:** {{recipient.representative}}

---

## CONSIDERANDOS

CONSIDERANDO que as Partes desejam {{#if mutual}}trocar{{else}}a PARTE DIVULGADORA deseja divulgar{{/if}} informações confidenciais para fins de {{purpose}};

CONSIDERANDO a necessidade de proteger tais informações contra uso ou divulgação não autorizados;

CONSIDERANDO o interesse mútuo das Partes em estabelecer os termos e condições para proteção das informações confidenciais;

AS PARTES ACORDAM O SEGUINTE:

---

## 1. DEFINIÇÕES

1.1. **"Informações Confidenciais"** significa toda e qualquer informação, de natureza técnica, comercial, financeira, jurídica, ou de qualquer outra natureza, divulgada por uma Parte à outra, seja de forma oral, escrita, eletrônica ou por qualquer outro meio, incluindo, mas não se limitando a:

a) Planos de negócios, estratégias comerciais e marketing;
b) Dados financeiros, projeções e análises;
c) Lista de clientes, fornecedores e parceiros;
d) Tecnologias, metodologias, processos e know-how;
e) Segredos comerciais e industriais;
f) Dados pessoais de clientes e colaboradores;
g) Códigos fonte, algoritmos e sistemas;
h) Qualquer informação marcada como "Confidencial" ou similar.

1.2. **"Representantes"** significa os administradores, diretores, empregados, consultores, assessores jurídicos, contábeis e financeiros das Partes.

---

## 2. OBRIGAÇÕES DE CONFIDENCIALIDADE

2.1. A PARTE RECEPTORA compromete-se a:

a) Manter em sigilo todas as Informações Confidenciais recebidas;

b) Utilizar as Informações Confidenciais exclusivamente para {{purpose}};

c) Não divulgar as Informações Confidenciais a terceiros sem autorização prévia e por escrito da PARTE DIVULGADORA;

d) Limitar o acesso às Informações Confidenciais apenas aos Representantes que necessitem conhecê-las;

e) Garantir que seus Representantes cumpram as obrigações de confidencialidade aqui estabelecidas;

f) Aplicar às Informações Confidenciais o mesmo grau de proteção que aplica às suas próprias informações confidenciais, não inferior a um padrão razoável de cuidado;

g) Notificar imediatamente a PARTE DIVULGADORA sobre qualquer uso ou divulgação não autorizados.

---

## 3. EXCEÇÕES

3.1. As obrigações de confidencialidade não se aplicam a informações que:

a) Sejam ou tornem-se públicas sem culpa da PARTE RECEPTORA;

b) Estejam em posse legítima da PARTE RECEPTORA antes da divulgação;

c) Sejam recebidas legalmente de terceiros sem restrições de confidencialidade;

d) Sejam desenvolvidas independentemente pela PARTE RECEPTORA sem uso das Informações Confidenciais;

e) Devam ser divulgadas por força de lei, regulamento ou ordem judicial, desde que a PARTE RECEPTORA notifique previamente a PARTE DIVULGADORA.

---

## 4. PROPRIEDADE DAS INFORMAÇÕES

4.1. Todas as Informações Confidenciais permanecerão de propriedade exclusiva da PARTE DIVULGADORA.

4.2. Este Acordo não confere à PARTE RECEPTORA qualquer licença ou direito sobre as Informações Confidenciais, além do uso autorizado para {{purpose}}.

4.3. A PARTE RECEPTORA não adquirirá, por força deste Acordo, qualquer direito de propriedade intelectual sobre as Informações Confidenciais.

---

## 5. DEVOLUÇÃO E DESTRUIÇÃO

5.1. Mediante solicitação da PARTE DIVULGADORA ou ao término deste Acordo, a PARTE RECEPTORA deverá, a critério da PARTE DIVULGADORA:

a) Devolver todas as Informações Confidenciais e quaisquer cópias; ou

b) Destruir todas as Informações Confidenciais e quaisquer cópias, certificando tal destruição por escrito.

5.2. A obrigação de devolução/destruição não se aplica a cópias de segurança mantidas em sistemas automatizados de backup, desde que tais cópias permaneçam sujeitas às obrigações de confidencialidade.

---

## 6. PRAZO

6.1. Este Acordo entrará em vigor na data de sua assinatura e permanecerá vigente por **{{duration}}**.

6.2. As obrigações de confidencialidade permanecerão em vigor por **{{confidentiality_period}}** após o término deste Acordo.

---

## 7. PENALIDADES

7.1. A violação das obrigações de confidencialidade sujeitará a PARTE RECEPTORA ao pagamento de multa no valor de **R$ {{penalty_value}}** ({{penalty_value_text}}), sem prejuízo da indenização por perdas e danos.

7.2. A PARTE DIVULGADORA poderá buscar medidas judiciais urgentes (tutela de urgência) para impedir ou cessar a divulgação indevida, sem necessidade de comprovação de prejuízo.

---

## 8. PROTEÇÃO DE DADOS (LGPD)

8.1. Na hipótese de as Informações Confidenciais incluírem dados pessoais, as Partes comprometem-se a cumprir a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

8.2. Os dados pessoais serão tratados exclusivamente para as finalidades previstas neste Acordo, pelo prazo estritamente necessário.

8.3. As Partes adotarão medidas técnicas e administrativas adequadas para proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas.

---

## 9. DISPOSIÇÕES GERAIS

9.1. Este Acordo não estabelece qualquer forma de sociedade, parceria ou representação entre as Partes.

9.2. Este Acordo constitui o entendimento integral entre as Partes sobre o assunto, substituindo quaisquer acordos anteriores.

9.3. A tolerância de qualquer das Partes quanto ao descumprimento de cláusula não constituirá renúncia ao direito de exigir seu cumprimento.

9.4. Se qualquer disposição deste Acordo for considerada inválida, as demais permanecerão em pleno vigor.

9.5. {{#if mutual}}Este Acordo é de natureza bilateral, aplicando-se igualmente a ambas as Partes como DIVULGADORA e RECEPTORA.{{else}}Este Acordo é de natureza unilateral, com a {{discloser.name}} atuando exclusivamente como PARTE DIVULGADORA.{{/if}}

---

## 10. FORO

10.1. As Partes elegem o foro da Comarca de **{{jurisdiction_city}}** - **{{jurisdiction_state}}** para dirimir quaisquer questões decorrentes deste Acordo, com renúncia a qualquer outro, por mais privilegiado que seja.

---

E, por estarem de acordo, as Partes assinam o presente instrumento.

{{location}}, {{agreement_date}}

---

**PARTE DIVULGADORA:**

_______________________________
{{discloser.name}}
{{discloser.representative}}

---

**PARTE RECEPTORA:**

_______________________________
{{recipient.name}}
{{recipient.representative}}

---

**TESTEMUNHAS:**

1. _______________________________
   Nome: {{witness1.name}}
   CPF: {{witness1.cpf}}

2. _______________________________
   Nome: {{witness2.name}}
   CPF: {{witness2.cpf}}

---

*Contrato gerado pelo Squad Jurídico - SPFP*
