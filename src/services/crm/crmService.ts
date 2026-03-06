import { Client, MeetingNote, ClientFile } from '@/types/crm.types'
import { withErrorRecovery } from '@/services/errorRecovery'

export const crmService = {
  // Clients
  async getClients(userId: string): Promise<Client[]> {
    return withErrorRecovery(
      () => fetch(`/api/crm/clients?userId=${userId}`).then(r => r.json()),
      'Fetch clients',
      { userId }
    )
  },

  async createClient(userId: string, data: Partial<Client>): Promise<Client> {
    return withErrorRecovery(
      () => fetch('/api/crm/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data })
      }).then(r => r.json()),
      'Create client',
      { userId }
    )
  },

  async updateClient(clientId: string, data: Partial<Client>): Promise<Client> {
    return withErrorRecovery(
      () => fetch(`/api/crm/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
      'Update client',
      {}
    )
  },

  async deleteClient(clientId: string): Promise<void> {
    return withErrorRecovery(
      () => fetch(`/api/crm/clients/${clientId}`, {
        method: 'DELETE'
      }).then(r => r.json()),
      'Delete client',
      {}
    )
  },

  // Meeting Notes
  async getMeetingNotes(clientId: string): Promise<MeetingNote[]> {
    return withErrorRecovery(
      () => fetch(`/api/crm/meeting-notes?clientId=${clientId}`).then(r => r.json()),
      'Fetch meeting notes',
      {}
    )
  },

  async createMeetingNote(data: Partial<MeetingNote>): Promise<MeetingNote> {
    return withErrorRecovery(
      () => fetch('/api/crm/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
      'Create meeting note',
      {}
    )
  },

  async updateMeetingNote(noteId: string, data: Partial<MeetingNote>): Promise<MeetingNote> {
    return withErrorRecovery(
      () => fetch(`/api/crm/meeting-notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(r => r.json()),
      'Update meeting note',
      {}
    )
  },

  async deleteMeetingNote(noteId: string): Promise<void> {
    return withErrorRecovery(
      () => fetch(`/api/crm/meeting-notes/${noteId}`, {
        method: 'DELETE'
      }).then(r => r.json()),
      'Delete meeting note',
      {}
    )
  },

  // Files
  async uploadClientFile(clientId: string, file: File, category: string): Promise<ClientFile> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('clientId', clientId)
    formData.append('category', category)

    return withErrorRecovery(
      () => fetch('/api/crm/files', {
        method: 'POST',
        body: formData
      }).then(r => r.json()),
      'Upload file',
      {}
    )
  },

  async getClientFiles(clientId: string): Promise<ClientFile[]> {
    return withErrorRecovery(
      () => fetch(`/api/crm/files?clientId=${clientId}`).then(r => r.json()),
      'Fetch client files',
      {}
    )
  },

  async deleteClientFile(fileId: string): Promise<void> {
    return withErrorRecovery(
      () => fetch(`/api/crm/files/${fileId}`, {
        method: 'DELETE'
      }).then(r => r.json()),
      'Delete file',
      {}
    )
  }
}
