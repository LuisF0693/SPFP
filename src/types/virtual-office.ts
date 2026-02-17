/**
 * Virtual Office Types
 * Data structures para o escritório virtual (EPIC-004)
 */

export interface VirtualRoom {
  id: string;
  name: string;
  department: 'estrategia' | 'ideacao' | 'producao' | 'design' | 'financeiro' | 'marketing' | 'operacional' | 'comercial';
  x: number; // Grid position X (tile)
  y: number; // Grid position Y (tile)
  width: number; // Tiles
  height: number; // Tiles
  backgroundColor: string; // Hex color
  departmentColor: string; // Department color
  icon: string; // Emoji or icon identifier
  npc?: {
    name: string;
    role: string;
    animKey: string;
    spriteKey: string;
    x: number; // Position in room
    y: number;
  };
  isActive: boolean;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  department: VirtualRoom['department'];
  x: number; // World position
  y: number;
  spriteKey: string;
  animKey: string;
  currentAnimation: 'idle' | 'walk-left' | 'walk-right' | 'walk-down' | 'walk-up';
}

export interface ActivityFeedItem {
  id: string;
  department: VirtualRoom['department'];
  agent_name: string;
  agent_role: string;
  description: string;
  status: 'running' | 'idle' | 'waiting' | 'completed' | 'error';
  requires_approval: boolean;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface SalesLead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  source?: string;
  notes?: string;
  next_action_date?: string;
  created_at: string;
  position: number;
}

export interface MarketingPost {
  id: string;
  title: string;
  description: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'other';
  status: 'draft' | 'pending' | 'approved' | 'posted' | 'rejected';
  scheduled_date: string;
  posted_date?: string;
  image_url?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface OperationalTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  due_date?: string;
  completed_at?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialData {
  balance: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    expense: number;
  }>;
  accountsPayable: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate: string;
  }>;
  accountsReceivable: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate: string;
  }>;
}

export interface VirtualOfficeState {
  selectedRoom?: VirtualRoom;
  rooms: VirtualRoom[];
  npcs: NPC[];
  activities: ActivityFeedItem[];
  leads: SalesLead[];
  posts: MarketingPost[];
  tasks: OperationalTask[];
  financial: FinancialData;
  loading: boolean;
  error?: string;
}
