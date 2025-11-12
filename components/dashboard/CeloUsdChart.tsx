'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { formatDateForChart } from '@/lib/dateUtils';

interface CeloUsdChartData {
  date: string;
  price: number;
}

export function CeloUsdChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<'1' | '7' | '30'>('7');
  const [chartData, setChartData] = useState<CeloUsdChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/celo-price-history?days=${selectedPeriod}`);
        const result = await response.json();

        if (result.success && result.data) {
          const formattedData = result.data.map((item: { timestamp: number; price: number; date: Date }) => ({
            date: formatDateForChart(item.date),
            price: item.price,
          }));
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error('Error fetching CELO price history:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [selectedPeriod]);

  return (
    <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold dashboard-text-primary">CELO → USD Trend</h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as '1' | '7' | '30')}
          className="text-sm px-3 py-1.5 dashboard-input-bg dashboard-card-border border rounded-lg dashboard-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">Last 1 Day</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>
      {loading ? (
        <div className="h-80 flex items-center justify-center dashboard-text-muted text-sm">
          <p>Loading price data...</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center dashboard-text-muted text-sm">
          <p>No price data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              tickFormatter={(value) => `$${value.toFixed(3)}`}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}