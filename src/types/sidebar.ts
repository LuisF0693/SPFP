/**
 * Sidebar State Types
 * Defines the structure for expandable sidebar sections
 */

export type SidebarSection = 'budget' | 'investments' | 'retirement' | 'patrimony';

export interface SidebarState {
  budget: boolean;
  investments: boolean;
  retirement: boolean;
  patrimony: boolean;
  isDrawerOpen: boolean; // Mobile drawer state
}

export interface SidebarContextType {
  state: SidebarState;
  toggleSection: (section: SidebarSection) => void;
  expandSection: (section: SidebarSection) => void;
  collapseSection: (section: SidebarSection) => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  resetToDefaults: () => void;
  setAllSections: (expanded: boolean) => void;
}

export const DEFAULT_SIDEBAR_STATE: SidebarState = {
  budget: true,
  investments: true,
  retirement: true,
  patrimony: true,
  isDrawerOpen: false
};
