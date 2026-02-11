# Squad Jurídico - SPFP

Departamento de IA para gestão de contratos, compliance LGPD e aspectos legais.

## Visão Geral

O Squad Jurídico automatiza a criação e gestão de contratos, garantindo compliance legal e proteção do empreendedor.

## Agentes

| Agente | Papel | Responsabilidade |
|--------|-------|------------------|
| 👨‍⚖️ Advogado Geral | General Counsel | Supervisiona contratos e compliance |
| 📝 Gerador de Contratos | Contract Generator | Cria contratos personalizados |
| 🔒 Verificador LGPD | Compliance Checker | Analisa compliance com LGPD |
| 🔔 Gestor de Alertas | Alert Manager | Monitora vencimentos e renovações |

## Tipos de Contrato

### Templates Disponíveis

1. **Contrato de Prestação de Serviços**
   - Para freelancers e consultores
   - Inclui escopo, pagamento, prazos

2. **Contrato de Parceria**
   - Para acordos comerciais
   - Divisão de responsabilidades e lucros

3. **NDA (Acordo de Confidencialidade)**
   - Proteção de informações sensíveis
   - Multas por descumprimento

4. **Termos de Uso**
   - Para plataformas digitais
   - Direitos e obrigações dos usuários

5. **Política de Privacidade**
   - Compliance LGPD
   - Tratamento de dados pessoais

## Workflow de Criação

```
[Rascunho] → [Revisão] → [Verificação LGPD] → [Alertas] → [Finalizado]
    📝          👨‍⚖️           🔒               🔔          ✅
```

## Checklist LGPD

O Verificador LGPD analisa:

- ✅ Base Legal (Art. 7)
- ✅ Princípios (Art. 6)
- ✅ Direitos do Titular (Art. 18)
- ✅ Segurança (Art. 46)

### Resultado da Verificação

| Status | Significado |
|--------|-------------|
| ✅ Conforme | Atende aos requisitos |
| ⚠️ Atenção | Requer ajustes menores |
| ❌ Não conforme | Precisa correção urgente |

## Alertas de Vencimento

| Antecedência | Severidade | Ação |
|--------------|------------|------|
| 90 dias | 🟢 Baixa | Notificação inicial |
| 60 dias | 🟡 Média | Iniciar renegociação |
| 30 dias | 🟠 Alta | Ação urgente |
| 7 dias | 🔴 Crítica | Ação imediata |

## Uso

```typescript
// Ativar o squad
import { LegalSquad } from './squads/legal-squad';

// Gerar contrato
const contract = await LegalSquad.agents.contractGenerator.generate({
  type: 'service_agreement',
  parties: {
    provider: { name: 'João Silva', cpf: '123.456.789-00' },
    client: { name: 'Empresa XYZ', cnpj: '12.345.678/0001-00' }
  },
  terms: {
    service: 'Consultoria financeira',
    value: 5000,
    duration: '6 meses'
  }
});

// Verificar LGPD
const lgpdResult = await LegalSquad.agents.lgpdChecker.verify(contract);

// Configurar alertas
await LegalSquad.agents.alertManager.setup({
  contractId: contract.id,
  expirationDate: contract.endDate
});
```

## Estrutura de Contrato

```
1. IDENTIFICAÇÃO DAS PARTES
   - Dados completos do contratante
   - Dados completos do contratado

2. OBJETO DO CONTRATO
   - Descrição detalhada do serviço/parceria

3. OBRIGAÇÕES DAS PARTES
   - Obrigações do contratante
   - Obrigações do contratado

4. VALORES E FORMA DE PAGAMENTO
   - Valor total ou por período
   - Forma e prazo de pagamento
   - Multas por atraso

5. PRAZO E VIGÊNCIA
   - Data de início e término
   - Condições de renovação

6. RESCISÃO
   - Motivos para rescisão
   - Aviso prévio necessário
   - Multas rescisórias

7. CONFIDENCIALIDADE
   - Informações protegidas
   - Período de confidencialidade

8. PROTEÇÃO DE DADOS (LGPD)
   - Tratamento de dados pessoais
   - Direitos do titular

9. DISPOSIÇÕES GERAIS
   - Modificações e aditivos
   - Notificações

10. FORO DE ELEIÇÃO
    - Cidade/Estado para disputas
```

## Tabelas de Banco de Dados

- `contract_templates` - Templates de contratos
- `contracts` - Contratos gerados
- `contract_alerts` - Alertas de vencimento
- `lgpd_audit_logs` - Logs de auditoria LGPD

## Status de Contrato

| Status | Descrição |
|--------|-----------|
| `draft` | Rascunho em edição |
| `pending_signature` | Aguardando assinatura |
| `active` | Em vigor |
| `expired` | Vencido |
| `terminated` | Rescindido |
| `renewed` | Renovado |

## Disclaimer

⚠️ **IMPORTANTE**: Este squad fornece orientação e automação para gestão de contratos, mas **não substitui consultoria jurídica profissional**. Para contratos de alto valor ou complexidade, sempre consulte um advogado licenciado.

---

*Squad criado por Craft (Squad Creator) - AIOS*
