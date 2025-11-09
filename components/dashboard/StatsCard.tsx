'use client';

interface StatsCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  subtitle?: string;
}

export function StatsCard({ title, value, change, icon, subtitle }: StatsCardProps) {
  return (
    <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium dashboard-text-secondary mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold dashboard-text-primary">{value}</h3>
            {change && (
              <span
                className={`text-sm font-medium flex items-center gap-1 ${
                  change.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {change.isPositive ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 17l5-5m0 0l-5-5m5 5H6"
                    />
                  </svg>
                )}
                {change.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs dashboard-text-muted mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

