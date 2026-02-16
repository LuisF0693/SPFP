# CRM Module - Quick Start Guide

Guia rápido para desenvolvedores que vão trabalhar com o módulo CRM de SPFP.

## Setup Rápido (5 minutos)

### 1. Entender a Estrutura
```
src/
├── components/crm/    - Componentes React
├── services/crm/      - Chamadas à API
├── hooks/crm/         - State management
└── types/crm.types.ts - TypeScript interfaces
```

### 2. Conhecer os Principais Arquivos
- **`useCRM()`** - Hook com todo o state: `const { clients, createClient, ... } = useCRM()`
- **`crmService`** - Service com CRUD: `await crmService.getClients(userId)`
- **`CRMDashboard`** - Componente raiz
- **`crm.types.ts`** - Todas as interfaces TypeScript

### 3. Primeiros Passos
1. Ler `/docs/development/EPIC-001-IMPLEMENTATION-PLAN.md`
2. Ler tipos em `/src/types/crm.types.ts`
3. Explorar componentes em `/src/components/crm/`

---

## Estrutura de Dados

### Client
```typescript
{
  id: string
  userId: string
  name: string
  email: string
  phone: string
  CPF?: string
  healthScore: number // 0-100
  patrimony: number
  profile: 'conservative' | 'moderate' | 'aggressive'
  notes?: string
  createdAt: Date
  updatedAt: Date
  lastMeetingDate?: Date
}
```

### MeetingNote
```typescript
{
  id: string
  clientId: string
  userId: string
  title: string
  content: string
  topics: string[]
  actionItems: string[]
  materials: string[]
  nextMeetingDate?: Date
  sentVia?: 'email' | 'whatsapp' | 'none'
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### ClientFile
```typescript
{
  id: string
  clientId: string
  userId: string
  name: string
  fileSize: number
  fileType: string
  category: 'document' | 'report' | 'investment' | 'personal' | 'other'
  uploadedAt: Date
  url: string
}
```

---

## Usando o Hook useCRM

### Carregar Clientes
```typescript
const { clients, loadClients } = useCRM()

useEffect(() => {
  loadClients() // Carrega na montagem do componente
}, [loadClients])
```

### Criar Cliente
```typescript
const { createClient } = useCRM()

const handleCreateClient = async () => {
  const newClient = await createClient({
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999',
    patrimony: 100000,
    profile: 'moderate'
  })
}
```

### Atualizar Cliente
```typescript
const { updateClient } = useCRM()

await updateClient(clientId, {
  healthScore: 85,
  notes: 'Cliente em bom estado'
})
```

### Deletar Cliente
```typescript
const { deleteClient } = useCRM()

await deleteClient(clientId)
```

### Gerenciar Atas
```typescript
const {
  createMeetingNote,
  updateMeetingNote,
  deleteMeetingNote
} = useCRM()

// Criar
await createMeetingNote({
  clientId,
  userId,
  title: 'Reunião de Planejamento',
  content: '...',
  topics: ['Investimentos', 'Aposentadoria'],
  actionItems: ['Enviar documentos']
})

// Atualizar
await updateMeetingNote(noteId, { content: 'Novo conteúdo' })

// Deletar
await deleteMeetingNote(noteId)
```

### Gerenciar Arquivos
```typescript
const { uploadFile, deleteFile } = useCRM()

// Upload
const file = new File(['content'], 'documento.pdf')
await uploadFile(clientId, file, 'document')

// Delete
await deleteFile(fileId)
```

---

## Adicionando Nova Feature

### Exemplo: Adicionar campo "Setor" ao Cliente

#### 1. Atualizar Type
```typescript
// src/types/crm.types.ts
export interface Client {
  // ... existing fields
  sector?: string // ADD THIS
}
```

#### 2. Atualizar Form
```typescript
// src/components/crm/NewClientModal.tsx
const [formData, setFormData] = useState({
  // ... existing fields
  sector: '' // ADD THIS
})

// Add input field
<input
  type="text"
  placeholder="Setor da empresa"
  value={formData.sector}
  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
  className="..."
/>
```

#### 3. Passar para Service
```typescript
// No handleSubmit
await createClient({
  ...formData,
  sector: formData.sector // ADD THIS
})
```

#### 4. Exibir em Profile
```typescript
// src/components/crm/ClientProfile.tsx
{client.sector && (
  <p className="text-gray-300">
    Setor: <span className="font-medium">{client.sector}</span>
  </p>
)}
```

---

## Padrões do Projeto

### Error Recovery (Importante!)
Sempre usar `withErrorRecovery()` em operações async:

```typescript
const result = await withErrorRecovery(
  () => myApiCall(),
  'Descrição da ação',
  { userId: user?.id, metadata: {} }
)
```

### TypeScript Types
Sempre adicionar tipos às props de componentes:

```typescript
interface ClientListProps {
  clients: Client[]
  selectedId?: string
  onSelect: (clientId: string) => void
}

export function ClientList({ clients, selectedId, onSelect }: ClientListProps) {
  // ...
}
```

### Styling
Usar TailwindCSS com padrão glassmorphism:

```tsx
className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-lg p-6"
```

### State Management
Usar o hook `useCRM()` para tudo relacionado a CRM:

```typescript
const { clients, createClient, error, isLoading } = useCRM()
```

---

## Testes

### Rodando Testes
```bash
npm run test                # Run all tests
npm run test:ui             # Run with UI
npm run test crm            # Run only CRM tests
```

### Escrevendo Teste
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('MeuComponente', () => {
  it('deve renderizar', () => {
    render(<MeuComponente />)
    expect(screen.getByText(/texto/i)).toBeInTheDocument()
  })
})
```

---

## Problemas Comuns

### "useAuth is undefined"
Certifique-se que o componente está dentro de `<AuthProvider>` ou `<Layout>`:
```tsx
// Em App.tsx
<AuthProvider>
  <Layout mode="crm">
    <CRMDashboard />
  </Layout>
</AuthProvider>
```

### "Cliente não está sendo salvo"
Verificar:
1. API endpoint está correto? (mock em `/api/crm/*`)
2. Error recovery está capturando erro? (check `error` no hook)
3. `createClient()` foi aguardado? (usar `await`)

### "Type 'string' não é assignável a 'Client'"
Verificar se todos os campos obrigatórios de `Client` estão sendo criados:
- `id`, `userId`, `healthScore`, `patrimony`, `createdAt`, `updatedAt`

---

## Próximas Features (Roadmap)

1. **Integração com Supabase** - Substituir endpoints mock por queries
2. **Real-time Sync** - Listeners para atualizações live
3. **Relatórios** - PDF/CSV de dados de clientes
4. **Templates** - CRUD de templates de atas
5. **Notificações** - Alertas para ações em atraso
6. **Métricas** - Dashboard de health score

---

## Referências Rápidas

| Arquivo | Responsabilidade |
|---------|-------------------|
| `crm.types.ts` | Todas as interfaces |
| `crmService.ts` | Operações CRUD |
| `useCRM.ts` | State + hooks |
| `CRMDashboard.tsx` | Layout principal |
| `ClientList.tsx` | Lista com busca |
| `ClientProfile.tsx` | Detalhes do cliente |
| `MeetingNotes.tsx` | Atas de reunião |
| `ClientFiles.tsx` | Upload/download |
| `NewClientModal.tsx` | Form de criação |

---

## Dúvidas?

Consulte:
1. `/docs/development/EPIC-001-IMPLEMENTATION-PLAN.md` - Documentação completa
2. `/src/types/crm.types.ts` - Tipos definidos
3. `/src/hooks/crm/useCRM.ts` - Função completa do hook

---

**Última atualização:** 2026-02-16
**Status:** Pronto para desenvolvimento
