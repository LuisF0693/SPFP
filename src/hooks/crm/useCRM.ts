import { useState, useCallback } from 'react'
import { Client, MeetingNote, ClientFile, CRMState } from '@/types/crm.types'
import { crmService } from '@/services/crm/crmService'
import { useAuth } from '@/context/AuthContext'

export function useCRM() {
  const { user } = useAuth()
  const [state, setState] = useState<CRMState>({
    clients: [],
    meetingNotes: [],
    clientFiles: [],
    templates: [],
    isLoading: false
  })

  const loadClients = useCallback(async () => {
    if (!user?.id) return
    setState(s => ({ ...s, isLoading: true }))
    try {
      const clients = await crmService.getClients(user.id)
      setState(s => ({ ...s, clients, isLoading: false }))
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message, isLoading: false }))
    }
  }, [user])

  const createClient = useCallback(async (data: Partial<Client>) => {
    if (!user?.id) return
    try {
      const client = await crmService.createClient(user.id, data)
      setState(s => ({ ...s, clients: [...s.clients, client] }))
      return client
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
      throw error
    }
  }, [user])

  const updateClient = useCallback(async (clientId: string, data: Partial<Client>) => {
    try {
      const updatedClient = await crmService.updateClient(clientId, data)
      setState(s => ({
        ...s,
        clients: s.clients.map(c => c.id === clientId ? updatedClient : c)
      }))
      return updatedClient
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
      throw error
    }
  }, [])

  const deleteClient = useCallback(async (clientId: string) => {
    try {
      await crmService.deleteClient(clientId)
      setState(s => ({
        ...s,
        clients: s.clients.filter(c => c.id !== clientId),
        selectedClientId: s.selectedClientId === clientId ? undefined : s.selectedClientId
      }))
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
      throw error
    }
  }, [])

  const selectClient = useCallback((clientId: string) => {
    setState(s => ({ ...s, selectedClientId: clientId }))
  }, [])

  const loadMeetingNotes = useCallback(async (clientId: string) => {
    try {
      const notes = await crmService.getMeetingNotes(clientId)
      setState(s => ({ ...s, meetingNotes: notes }))
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
    }
  }, [])

  const createMeetingNote = useCallback(async (data: Partial<MeetingNote>) => {
    try {
      const note = await crmService.createMeetingNote(data)
      setState(s => ({ ...s, meetingNotes: [...s.meetingNotes, note] }))
      return note
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
      throw error
    }
  }, [])

  const updateMeetingNote = useCallback(async (noteId: string, data: Partial<MeetingNote>) => {
    try {
      const updatedNote = await crmService.updateMeetingNote(noteId, data)
      setState(s => ({
        ...s,
        meetingNotes: s.meetingNotes.map(n => n.id === noteId ? updatedNote : n)
      }))
      return updatedNote
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
      throw error
    }
  }, [])

  const deleteMeetingNote = useCallback(async (noteId: string) => {
    try {
      await crmService.deleteMeetingNote(noteId)
      setState(s => ({
        ...s,
        meetingNotes: s.meetingNotes.filter(n => n.id !== noteId)
      }))
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
      throw error
    }
  }, [])

  const loadClientFiles = useCallback(async (clientId: string) => {
    try {
      const files = await crmService.getClientFiles(clientId)
      setState(s => ({ ...s, clientFiles: files }))
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
    }
  }, [])

  const uploadFile = useCallback(async (clientId: string, file: File, category: string) => {
    try {
      const clientFile = await crmService.uploadClientFile(clientId, file, category)
      setState(s => ({ ...s, clientFiles: [...s.clientFiles, clientFile] }))
      return clientFile
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
      throw error
    }
  }, [])

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await crmService.deleteClientFile(fileId)
      setState(s => ({
        ...s,
        clientFiles: s.clientFiles.filter(f => f.id !== fileId)
      }))
    } catch (error: any) {
      setState(s => ({ ...s, error: error.message }))
      throw error
    }
  }, [])

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: undefined }))
  }, [])

  return {
    ...state,
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    selectClient,
    loadMeetingNotes,
    createMeetingNote,
    updateMeetingNote,
    deleteMeetingNote,
    loadClientFiles,
    uploadFile,
    deleteFile,
    clearError
  }
}
