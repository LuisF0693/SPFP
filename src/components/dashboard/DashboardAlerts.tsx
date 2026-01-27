import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface Alert {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  icon: React.ReactNode;
  link: string;
}

interface DashboardAlertsProps {
  alerts: Alert[];
}

/**
 * Alert cards for budget, atypical spending, and CRM alerts
 * ~95 LOC
 */
export const DashboardAlerts = memo<DashboardAlertsProps>(({ alerts }) => {
  const navigate = useNavigate();

  if (!alerts.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          onClick={() => navigate(alert.link)}
          className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${
            alert.type === 'CRITICAL'
              ? 'bg-red-500/10 border-red-500/20 hover:border-red-500/40'
              : alert.type === 'WARNING'
                ? 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40'
                : 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40'
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              alert.type === 'CRITICAL'
                ? 'bg-red-500/20'
                : alert.type === 'WARNING'
                  ? 'bg-orange-500/20'
                  : 'bg-blue-500/20'
            }`}
          >
            {alert.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4
                className={`text-sm font-bold ${
                  alert.type === 'CRITICAL'
                    ? 'text-red-400'
                    : alert.type === 'WARNING'
                      ? 'text-orange-400'
                      : 'text-blue-400'
                }`}
              >
                {alert.title}
              </h4>
              {alert.type === 'CRITICAL' && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {alert.message}
            </p>
          </div>
          <ArrowUpRight size={16} className="text-gray-600 self-center" />
        </div>
      ))}
    </div>
  );
});

DashboardAlerts.displayName = 'DashboardAlerts';
