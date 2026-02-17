import { OfficeMap } from './OfficeMap';
import { DepartmentModal } from './DepartmentModal';
import { CorporateProvider } from './CorporateContext';

export function CorporateHQ() {
  return (
    <CorporateProvider>
      <div className="w-full h-full flex flex-col bg-slate-900">
        <OfficeMap />
        <DepartmentModal />
      </div>
    </CorporateProvider>
  );
}

export default CorporateHQ;
