'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CeloUsdData {
  date: string;
  price: number; // USD price per CELO
  celoAmount: number; // Total CELO volume
}

interface CeloUsdChartProps {
  data: CeloUsdData[];
}

export function CeloUsdChart({ data }: CeloUsdChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold dashboard-text-primary">CELO → USD Trend</h3>
        </div>
        <div className="h-80 flex items-center justify-center dashboard-text-muted text-sm">
          <p>No CELO transactions to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold dashboard-text-primary">CELO → USD Trend</h3>
        <span className="text-sm dashboard-text-muted">Based on your CELO transactions</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis
            yAxisId="left"
            stroke="#1d4ed8"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#059669"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value.toFixed(2)} CELO`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              padding: '10px 14px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'price') {
                return [`$${value.toFixed(2)}`, 'USD Price'];
              }
              return [`${value.toFixed(4)} CELO`, 'CELO Volume'];
            }}
          />
          <Legend
            formatter={(value) => (value === 'price' ? 'USD Price' : 'CELO Volume')}
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            yAxisId="left"
          />
          <Line
            type="monotone"
            dataKey="celoAmount"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            yAxisId="right"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


