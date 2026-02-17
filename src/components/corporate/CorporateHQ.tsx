import { OfficeMap } from './OfficeMap';
import { DepartmentModal } from './DepartmentModal';
import { ActivityFeed } from './ActivityFeed';
import { CorporateProvider } from './CorporateContext';

export function CorporateHQ() {
  return (
    <CorporateProvider>
      <div className="w-full h-full flex flex-col md:flex-row bg-slate-900 gap-4 p-4">
        {/* OfficeMap - 50% */}
        <div className="flex-1 flex flex-col min-h-0">
          <OfficeMap />
        </div>

        {/* ActivityFeed - 50% */}
        <div className="flex-1 flex flex-col min-h-0">
          <ActivityFeed />
        </div>

        {/* Department Modal */}
        <DepartmentModal />
      </div>
    </CorporateProvider>
  );
}

export default CorporateHQ;
