/**
 * VirtualOfficeContext
 * Global state para o escritório virtual (salas, seleção, etc)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VirtualRoom, VirtualOfficeState, ActivityFeedItem, SalesLead, MarketingPost, OperationalTask, FinancialData } from '@/types/virtual-office';

const MOCK_ROOMS: VirtualRoom[] = [
  {
    id: 'estrategia',
    name: 'Estratégia',
    department: 'estrategia',
    x: 0,
    y: 0,
    width: 8,
    height: 6,
    backgroundColor: '#4C1D95',
    departmentColor: '#6366F1',
    icon: '🎯',
    isActive: false,
  },
  {
    id: 'ideacao',
    name: 'Ideação',
    department: 'ideacao',
    x: 8,
    y: 0,
    width: 8,
    height: 6,
    backgroundColor: '#831843',
    departmentColor: '#EC4899',
    icon: '💡',
    isActive: false,
  },
  {
    id: 'producao',
    name: 'Produção',
    department: 'producao',
    x: 0,
    y: 6,
    width: 8,
    height: 6,
    backgroundColor: '#0C4A6E',
    departmentColor: '#06B6D4',
    icon: '🏭',
    isActive: false,
  },
  {
    id: 'design',
    name: 'Design',
    department: 'design',
    x: 8,
    y: 6,
    width: 8,
    height: 6,
    backgroundColor: '#7C2D12',
    departmentColor: '#F97316',
    icon: '🎨',
    isActive: false,
  },
];

interface VirtualOfficeContextType {
  // Room management
  rooms: VirtualRoom[];
  selectedRoom: VirtualRoom | null;
  hoveredRoom: VirtualRoom | null;
  selectRoom: (roomId: string) => void;
  deselectRoom: () => void;
  setHoveredRoom: (roomId: string | null) => void;

  // Modal state
  isModalOpen: boolean;
  openModal: (roomId: string) => void;
  closeModal: () => void;

  // Data
  activities: ActivityFeedItem[];
  leads: SalesLead[];
  posts: MarketingPost[];
  tasks: OperationalTask[];
  financial: FinancialData;

  // Loading
  loading: boolean;
  error?: string;
}

const VirtualOfficeContext = createContext<VirtualOfficeContextType | undefined>(undefined);

export function VirtualOfficeProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<VirtualRoom[]>(MOCK_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<VirtualRoom | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<VirtualRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data
  const [activities] = useState<ActivityFeedItem[]>([]);
  const [leads] = useState<SalesLead[]>([]);
  const [posts] = useState<MarketingPost[]>([]);
  const [tasks] = useState<OperationalTask[]>([]);
  const [financial] = useState<FinancialData>({
    balance: 45230,
    monthlyRevenue: [],
    accountsPayable: [],
    accountsReceivable: [],
  });

  // Persist selected room to localStorage
  useEffect(() => {
    if (selectedRoom) {
      localStorage.setItem('vo_selectedRoom', selectedRoom.id);
    }
  }, [selectedRoom]);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vo_selectedRoom');
    if (saved) {
      const room = rooms.find((r) => r.id === saved);
      if (room) {
        selectRoom(saved);
      }
    }
  }, []);

  const selectRoom = useCallback((roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      // Deselect previous
      setRooms((prev) =>
        prev.map((r) => ({
          ...r,
          isActive: r.id === roomId,
        }))
      );
      setSelectedRoom(room);
    }
  }, [rooms]);

  const deselectRoom = useCallback(() => {
    setRooms((prev) => prev.map((r) => ({ ...r, isActive: false })));
    setSelectedRoom(null);
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback((roomId: string) => {
    selectRoom(roomId);
    setIsModalOpen(true);
  }, [selectRoom]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleHoveredRoomChange = useCallback((roomId: string | null) => {
    if (roomId) {
      const room = rooms.find((r) => r.id === roomId);
      setHoveredRoom(room || null);
    } else {
      setHoveredRoom(null);
    }
  }, [rooms]);

  const value: VirtualOfficeContextType = {
    rooms,
    selectedRoom,
    hoveredRoom,
    selectRoom,
    deselectRoom,
    setHoveredRoom: handleHoveredRoomChange,
    isModalOpen,
    openModal,
    closeModal,
    activities,
    leads,
    posts,
    tasks,
    financial,
    loading,
  };

  return <VirtualOfficeContext.Provider value={value}>{children}</VirtualOfficeContext.Provider>;
}

export function useVirtualOffice(): VirtualOfficeContextType {
  const context = useContext(VirtualOfficeContext);
  if (!context) {
    throw new Error('useVirtualOffice must be used within VirtualOfficeProvider');
  }
  return context;
}
