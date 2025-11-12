'use client';

import { useCurrencyStore } from '@/lib/currencyStore';
import { formatAmountWithConversion } from '@/lib/currencyUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  volume: number;
  transactions: number;
}

interface ChartProps {
  title: string;
  data: ChartDataPoint[];
}

export function Chart({ title, data }: ChartProps) {
  const maxVolume = Math.max(...data.map(d => d.volume), 1);
  
  // Calculate total and change
  const totalVolume = data.reduce((sum, d) => sum + d.volume, 0);
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstHalfTotal = firstHalf.reduce((sum, d) => sum + d.volume, 0);
  const secondHalfTotal = secondHalf.reduce((sum, d) => sum + d.volume, 0);
  const change = firstHalfTotal > 0 
    ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal * 100).toFixed(1)
    : '0';
  
  const formattedTotal = formatAmountWithConversion(totalVolume);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-gray-900">
              {formattedTotal.display}
            </p>
            <div className={`flex items-center gap-1 text-sm font-medium ${parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {parseFloat(change) >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{change}%</span>
            </div>
          </div>
          {formattedTotal.showUSDEquivalent && (
            <p className="text-sm text-gray-500 mt-1">
              {formattedTotal.usdEquivalent}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Income
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Expenses
          </button>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium mb-1">No data yet</p>
            <p className="text-sm">Make your first transaction to see the chart</p>
          </div>
        </div>
      ) : (
        <div className="h-64">
          <div className="h-full flex items-end justify-between gap-4">
            {data.map((point, index) => {
              const height = (point.volume / maxVolume) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full relative" style={{ height: '200px' }}>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                        <p className="font-semibold">{formatAmountWithConversion(point.volume).display}</p>
                        <p className="text-gray-300">{point.transactions} transactions</p>
                      </div>
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {point.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>Total Income</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatAmountWithConversion(totalVolume * 0.7).display}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span>Total Expenses</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatAmountWithConversion(totalVolume * 0.3).display}
          </p>
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-1">
            Net Saving
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatAmountWithConversion(totalVolume * 0.4).display}
          </p>
        </div>
      </div>
    </div>
  );
}