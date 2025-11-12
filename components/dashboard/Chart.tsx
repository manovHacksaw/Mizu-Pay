'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
  volume: number;
  transactions: number;
}

interface ChartProps {
  data: ChartData[];
  title?: string;
}

export function Chart({ data, title = 'Monthly Volume' }: ChartProps) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold dashboard-text-primary">{title}</h3>
        </div>
        <div className="h-80 flex items-center justify-center dashboard-text-muted">
          <p>No payment data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold dashboard-text-primary">{title}</h3>
        <select className="text-sm px-3 py-1.5 dashboard-input-bg dashboard-card-border border rounded-lg dashboard-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            wrapperStyle={{
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'volume') {
                return [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Volume'];
              }
              return [value, 'Transactions'];
            }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="transactions"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm dashboard-text-secondary">Volume</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm dashboard-text-secondary">Transactions</span>
        </div>
      </div>
    </div>
  );
}
