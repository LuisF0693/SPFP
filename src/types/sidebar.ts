/**
 * Sidebar UI State Type Definitions
 * FASE 1: STY-051 (Sidebar Context & State Management)
 *
 * Defines types for sidebar expanded/collapsed state and animations
 */

/**
 * Sidebar section types
 */
export type SidebarSection = 'BUDGET' | 'ACCOUNTS' | 'TRANSACTIONS' | 'INSTALLMENTS';

/**
 * Sidebar state: tracks expand/collapse of main sidebar and sections
 */
export interface SidebarState {
  isExpanded: boolean;
  expandedSections: Record<SidebarSection, boolean>;
  hoveredItem?: string;
  lastUpdated: number;
  deviceWidth?: number;
}

/**
 * Context type for SidebarContext hook
 */
export interface SidebarContextType {
  sidebarState: SidebarState;
  isExpanded: boolean;
  expandedSections: Record<SidebarSection, boolean>;
  hoveredItem?: string;

  toggleSidebar(): void;
  setSidebarExpanded(expanded: boolean): void;
  toggleSection(section: SidebarSection): void;
  setSectionExpanded(section: SidebarSection, expanded: boolean): void;
  setHoveredItem(itemId: string | undefined): void;

  saveSidebarState(): void;
  loadSidebarState(): void;

  getIsMobile(): boolean;
  getIsTablet(): boolean;
  getIsDesktop(): boolean;
}

/**
 * Props for SidebarProvider component
 */
export interface SidebarProviderProps {
  children: React.ReactNode;
  persistToLocalStorage?: boolean;
  defaultExpandedSections?: Record<SidebarSection, boolean>;
}

/**
 * Default sidebar state stored in localStorage
 */
export interface SidebarStateStorage {
  isExpanded: boolean;
  expandedSections: Record<SidebarSection, boolean>;
  lastUpdated: number;
}

/**
 * Animation configuration for section expansion
 */
export interface SectionAnimationConfig {
  duration: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

export const DEFAULT_ANIMATION_CONFIG: SectionAnimationConfig = {
  duration: 300,
  easing: 'ease-in-out'
};
