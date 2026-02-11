# Template: Contrato de Prestação de Serviços

## Metadata
- **id**: service_agreement
- **type**: contract
- **version**: 1.0.0
- **jurisdiction**: Brasil

---

# CONTRATO DE PRESTAÇÃO DE SERVIÇOS

**CONTRATO Nº:** {{contract_number}}
**DATA:** {{contract_date}}

---

## 1. IDENTIFICAÇÃO DAS PARTES

### 1.1. CONTRATANTE

**Nome/Razão Social:** {{client.name}}
**CPF/CNPJ:** {{client.document}}
**Endereço:** {{client.address}}
**E-mail:** {{client.email}}
**Telefone:** {{client.phone}}

### 1.2. CONTRATADO(A)

**Nome/Razão Social:** {{provider.name}}
**CPF/CNPJ:** {{provider.document}}
**Endereço:** {{provider.address}}
**E-mail:** {{provider.email}}
**Telefone:** {{provider.phone}}

---

## 2. OBJETO DO CONTRATO

2.1. O presente contrato tem por objeto a prestação dos seguintes serviços:

{{service_description}}

2.2. Os serviços serão executados de acordo com as especificações detalhadas no **Anexo I** deste contrato.

---

## 3. OBRIGAÇÕES DO CONTRATADO

3.1. Executar os serviços descritos na Cláusula 2 com zelo, diligência e dentro dos prazos acordados.

3.2. Manter sigilo sobre todas as informações confidenciais do CONTRATANTE.

3.3. Comunicar imediatamente qualquer impedimento ou atraso na execução dos serviços.

3.4. Fornecer relatórios de acompanhamento conforme periodicidade definida no Anexo I.

3.5. Utilizar ferramentas e metodologias adequadas para a prestação dos serviços.

---

## 4. OBRIGAÇÕES DO CONTRATANTE

4.1. Efetuar os pagamentos nas datas e condições acordadas.

4.2. Fornecer as informações e materiais necessários para a execução dos serviços.

4.3. Designar um responsável para acompanhamento e aprovação dos trabalhos.

4.4. Comunicar eventuais alterações de escopo com antecedência mínima de {{scope_change_notice_days}} dias.

---

## 5. VALORES E FORMA DE PAGAMENTO

5.1. O valor total dos serviços é de **R$ {{total_value}}** ({{total_value_text}}).

5.2. O pagamento será realizado da seguinte forma:

{{payment_terms}}

5.3. Os pagamentos deverão ser efetuados via:
- [ ] Transferência bancária (Banco: {{bank_name}}, Ag: {{bank_agency}}, CC: {{bank_account}})
- [ ] PIX (Chave: {{pix_key}})
- [ ] Boleto bancário

5.4. Em caso de atraso no pagamento, incidirá multa de **{{late_fee_percentage}}%** e juros de mora de **{{interest_rate}}%** ao mês.

---

## 6. PRAZO E VIGÊNCIA

6.1. O presente contrato terá vigência de **{{duration}}**, iniciando-se em **{{start_date}}** e encerrando-se em **{{end_date}}**.

6.2. {{#if auto_renewal}}O contrato será renovado automaticamente por períodos iguais, salvo manifestação contrária de qualquer das partes com antecedência mínima de {{renewal_notice_days}} dias.{{else}}O contrato não será renovado automaticamente, devendo as partes manifestar interesse em renovação com antecedência mínima de {{renewal_notice_days}} dias.{{/if}}

---

## 7. RESCISÃO

7.1. O presente contrato poderá ser rescindido:

a) Por acordo mútuo entre as partes;

b) Por descumprimento de qualquer cláusula contratual;

c) Por qualquer das partes, mediante aviso prévio de **{{termination_notice_days}}** dias.

7.2. Em caso de rescisão antecipada sem justa causa pelo CONTRATANTE, será devida multa de **{{early_termination_fee_percentage}}%** do valor restante do contrato.

7.3. Em caso de rescisão por descumprimento, a parte inadimplente arcará com perdas e danos.

---

## 8. CONFIDENCIALIDADE

8.1. As partes comprometem-se a manter sigilo sobre todas as informações confidenciais trocadas durante a vigência deste contrato.

8.2. São consideradas informações confidenciais: dados comerciais, financeiros, técnicos, estratégicos, lista de clientes, metodologias e qualquer informação não pública.

8.3. A obrigação de confidencialidade perdurará por **{{confidentiality_period}}** após o término do contrato.

8.4. A violação da confidencialidade sujeitará a parte infratora a multa de **R$ {{confidentiality_penalty}}**, sem prejuízo de indenização por perdas e danos.

---

## 9. PROPRIEDADE INTELECTUAL

9.1. Todos os materiais desenvolvidos durante a prestação dos serviços pertencerão ao **{{ip_owner}}**.

9.2. {{#if ip_belongs_to_client}}O CONTRATADO cede, em caráter irrevogável e irretratável, todos os direitos autorais e de propriedade intelectual sobre os trabalhos desenvolvidos.{{else}}O CONTRATANTE terá direito de uso sobre os materiais desenvolvidos, permanecendo a propriedade intelectual com o CONTRATADO.{{/if}}

---

## 10. PROTEÇÃO DE DADOS (LGPD)

10.1. As partes comprometem-se a cumprir a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

10.2. O tratamento de dados pessoais será realizado apenas para as finalidades necessárias à execução deste contrato.

10.3. O CONTRATADO adotará medidas técnicas e administrativas adequadas para proteger os dados pessoais.

10.4. Em caso de incidente de segurança envolvendo dados pessoais, a parte responsável comunicará a outra em até **72 horas**.

---

## 11. DISPOSIÇÕES GERAIS

11.1. Este contrato não estabelece qualquer vínculo empregatício entre as partes.

11.2. Nenhuma das partes poderá ceder ou transferir este contrato sem prévia autorização escrita da outra.

11.3. A tolerância de qualquer das partes quanto ao descumprimento de cláusula não constituirá renúncia ao direito de exigir seu cumprimento.

11.4. Eventuais modificações a este contrato deverão ser formalizadas por meio de aditivo escrito, assinado por ambas as partes.

---

## 12. FORO

12.1. Fica eleito o foro da Comarca de **{{jurisdiction_city}}** - **{{jurisdiction_state}}** para dirimir quaisquer questões oriundas deste contrato, com renúncia de qualquer outro, por mais privilegiado que seja.

---

E, por estarem justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma.

{{location}}, {{contract_date}}

---

**CONTRATANTE:**

_______________________________
{{client.name}}
{{client.document}}

---

**CONTRATADO(A):**

_______________________________
{{provider.name}}
{{provider.document}}

---

**TESTEMUNHAS:**

1. _______________________________
   Nome: {{witness1.name}}
   CPF: {{witness1.cpf}}

2. _______________________________
   Nome: {{witness2.name}}
   CPF: {{witness2.cpf}}

---

## ANEXO I - ESPECIFICAÇÕES DOS SERVIÇOS

{{service_specifications}}

---

*Contrato gerado pelo Squad Jurídico - SPFP*
