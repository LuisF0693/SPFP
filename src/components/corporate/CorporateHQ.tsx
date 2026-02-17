import { Map } from './Map';
import { ActivityFeed } from './ActivityFeed';
import { DashboardDrawer } from './dashboards/DashboardDrawer';
import { VirtualOfficeProvider } from '@/context/VirtualOfficeContext';

export function CorporateHQ() {
  return (
    <VirtualOfficeProvider>
      <div className="w-full h-full flex flex-col md:flex-row bg-slate-900 gap-0 p-0">
        {/* Virtual Office Map - 70% desktop, full mobile */}
        <div className="flex-1 flex flex-col min-h-0 md:min-h-screen md:flex-basis-70%">
          <Map />
        </div>

        {/* Activity Feed - 30% desktop, hidden mobile */}
        <div className="hidden md:flex flex-1 flex-col min-h-0 min-h-screen border-l border-slate-700 md:flex-basis-30%">
          <ActivityFeed />
        </div>

        {/* Dashboard Drawer/Modal */}
        <DashboardDrawer />
      </div>
    </VirtualOfficeProvider>
  );
}

export default CorporateHQ;
