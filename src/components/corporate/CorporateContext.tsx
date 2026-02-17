import { createContext, useContext, useState, ReactNode } from 'react';
import { Department } from '@/types/corporate';

interface CorporateContextValue {
  selectedDepartment: Department | null;
  setSelectedDepartment: (dept: Department | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const CorporateContext = createContext<CorporateContextValue | null>(null);

export function CorporateProvider({ children }: { children: ReactNode }) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <CorporateContext.Provider
      value={{
        selectedDepartment,
        setSelectedDepartment,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </CorporateContext.Provider>
  );
}

export function useCorporate() {
  const context = useContext(CorporateContext);
  if (!context) {
    throw new Error('useCorporate must be used within CorporateProvider');
  }
  return context;
}
