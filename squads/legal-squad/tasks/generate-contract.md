# Task: Gerar Contrato

## Metadata
- **id**: generate-contract
- **agent**: contract-generator
- **type**: generative
- **elicit**: true

## Objetivo
Criar um novo contrato personalizado baseado em template e informações fornecidas.

## Inputs Necessários

```yaml
inputs:
  - name: type
    type: enum
    options:
      - service_agreement  # Prestação de Serviços
      - partnership        # Parceria Comercial
      - nda                # Acordo de Confidencialidade
      - terms_of_service   # Termos de Uso
      - privacy_policy     # Política de Privacidade
    required: true
    prompt: "Qual tipo de contrato você precisa?"

  - name: parties
    type: object
    required: true
    schema:
      provider:
        name: string
        document: string  # CPF ou CNPJ
        address: string
        email: string
        phone: string
      client:
        name: string
        document: string
        address: string
        email: string
        phone: string

  - name: terms
    type: object
    required: true
    schema:
      service_description: string
      total_value: number
      payment_terms: string
      duration: string
      start_date: date
      end_date: date
      auto_renewal: boolean
      confidentiality_period: string
      jurisdiction_city: string
      jurisdiction_state: string
```

## Processo

### 1. Carregar Template
```javascript
const template = await loadTemplate(type);
// service_agreement -> templates/service-agreement.md
// nda -> templates/nda.md
// etc.
```

### 2. Coletar Informações (Wizard)

**Etapa 1: Partes Contratantes**
- Nome/Razão Social
- CPF/CNPJ
- Endereço completo
- E-mail e telefone

**Etapa 2: Objeto do Contrato**
- Descrição detalhada do serviço/acordo
- Especificações técnicas
- Entregáveis esperados

**Etapa 3: Valores e Pagamento**
- Valor total ou por período
- Forma de pagamento
- Condições de reajuste
- Multas por atraso

**Etapa 4: Prazo e Vigência**
- Data de início e término
- Renovação automática?
- Aviso prévio para rescisão

**Etapa 5: Cláusulas Especiais**
- Confidencialidade
- Propriedade intelectual
- Multas rescisórias
- Foro

### 3. Validar Informações
```javascript
const validation = await validateContractData(data);
// Verifica:
// - CPF/CNPJ válidos
// - Datas coerentes
// - Valores formatados
// - Campos obrigatórios preenchidos
```

### 4. Renderizar Contrato
```javascript
const contract = await renderTemplate(template, data);
// Substitui placeholders {{variable}} pelos valores
```

### 5. Verificação LGPD
```javascript
const lgpdCheck = await agents.lgpdChecker.verify(contract);
// Verifica se contrato está em compliance
```

### 6. Revisão do Advogado Geral
```javascript
const review = await agents.generalCounsel.review(contract);
// Aprovado ou Necessita ajustes
```

## Output Esperado

```yaml
output:
  contract:
    id: "uuid"
    type: "service_agreement"
    status: "draft"
    version: 1
    created_at: "timestamp"

    parties:
      provider: {...}
      client: {...}

    terms:
      service: "string"
      value: 5000.00
      duration: "6 meses"
      start_date: "2026-03-01"
      end_date: "2026-08-31"

    document:
      markdown: "string (contrato completo)"
      pdf_url: "https://storage.spfp.app/contracts/..."

    lgpd_check:
      status: "compliant"
      issues: []

    review:
      status: "approved"
      comments: []

    alerts:
      - date: "2026-06-01"
        message: "Contrato vence em 90 dias"
      - date: "2026-07-01"
        message: "Contrato vence em 60 dias"
```

## Fluxo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    WIZARD DE CONTRATO                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [1] Tipo ──► [2] Partes ──► [3] Objeto ──► [4] Valores    │
│                                                             │
│       ──► [5] Prazo ──► [6] Cláusulas ──► [7] Revisão      │
│                                                             │
│                              ▼                              │
│                        [Gerar PDF]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Checklist de Qualidade

- [ ] Todas as partes identificadas corretamente
- [ ] CPF/CNPJ válidos
- [ ] Objeto do contrato claro e específico
- [ ] Valores e pagamentos detalhados
- [ ] Prazos definidos e coerentes
- [ ] Cláusula de confidencialidade presente
- [ ] Cláusula LGPD incluída
- [ ] Foro especificado
- [ ] Espaço para assinaturas
- [ ] Verificação LGPD aprovada
- [ ] Revisão do Advogado Geral concluída

## Exemplo de Uso

```typescript
// Gerar contrato de prestação de serviços
const contract = await LegalSquad.tasks.generateContract({
  type: 'service_agreement',
  parties: {
    provider: {
      name: 'João Silva Consultoria',
      document: '12.345.678/0001-99',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      email: 'joao@consultoria.com',
      phone: '(11) 99999-9999'
    },
    client: {
      name: 'Empresa XYZ Ltda',
      document: '98.765.432/0001-11',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      email: 'contato@xyz.com',
      phone: '(11) 88888-8888'
    }
  },
  terms: {
    service_description: 'Consultoria financeira mensal',
    total_value: 5000,
    payment_terms: 'Mensal, até dia 5 de cada mês',
    duration: '6 meses',
    start_date: '2026-03-01',
    end_date: '2026-08-31',
    auto_renewal: true,
    confidentiality_period: '2 anos',
    jurisdiction_city: 'São Paulo',
    jurisdiction_state: 'SP'
  }
});
```
