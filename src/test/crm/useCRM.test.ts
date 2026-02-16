import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCRM } from '@/hooks/crm/useCRM'
import * as crmService from '@/services/crm/crmService'

// Mock the crmService
vi.mock('@/services/crm/crmService')

// Mock useAuth
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    session: null,
    loading: false,
    isAdmin: false,
    signInWithGoogle: vi.fn(),
    signInWithEmail: vi.fn(),
    registerWithEmail: vi.fn(),
    logout: vi.fn()
  })
}))

describe('useCRM', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useCRM())

    expect(result.current.clients).toEqual([])
    expect(result.current.meetingNotes).toEqual([])
    expect(result.current.clientFiles).toEqual([])
    expect(result.current.templates).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it('should load clients', async () => {
    const mockClients = [
      {
        id: '1',
        userId: 'test-user',
        name: 'Client 1',
        email: 'client1@test.com',
        phone: '123456789',
        healthScore: 75,
        patrimony: 100000,
        profile: 'moderate' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    vi.spyOn(crmService, 'crmService' as any).mockResolvedValueOnce({
      getClients: vi.fn().mockResolvedValueOnce(mockClients)
    })

    const { result } = renderHook(() => useCRM())

    expect(result.current.isLoading).toBe(false)
  })

  it('should select a client', async () => {
    const { result } = renderHook(() => useCRM())

    act(() => {
      result.current.selectClient('test-client-id')
    })

    expect(result.current.selectedClientId).toBe('test-client-id')
  })

  it('should clear error message', async () => {
    const { result } = renderHook(() => useCRM())

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeUndefined()
  })
})
