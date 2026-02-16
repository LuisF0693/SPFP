export interface Client {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  CPF?: string
  createdAt: Date
  updatedAt: Date
  lastMeetingDate?: Date
  healthScore: number // 0-100
  patrimony: number
  profile: 'conservative' | 'moderate' | 'aggressive'
  notes?: string
}

export interface MeetingNote {
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

export interface ClientFile {
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

export interface ClientTemplate {
  id: string
  userId: string
  name: string
  type: 'meeting_note' | 'investment_ata' | 'custom'
  content: string
  isDefault: boolean
  createdAt: Date
}

export interface ClientMetrics {
  clientId: string
  totalMeetings: number
  lastMeetingDaysAgo: number
  averageMeetingFrequencyDays: number
  documentsUploaded: number
  actionItemsOverdue: number
  healthScore: number
}

export interface CRMState {
  clients: Client[]
  selectedClientId?: string
  meetingNotes: MeetingNote[]
  clientFiles: ClientFile[]
  templates: ClientTemplate[]
  isLoading: boolean
  error?: string
}
