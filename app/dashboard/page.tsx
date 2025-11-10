'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { Chart } from '@/components/dashboard/Chart';
import { Table } from '@/components/dashboard/Table';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { formatDateForChart } from '@/lib/dateUtils';
import { useCurrencyStore } from '@/lib/currencyStore';
import { formatAmountWithConversion } from '@/lib/currencyUtils';

interface PaymentData {
  sessionId: string;
  store: string;
  amountUSD: number;
  status: 'pending' | 'processing' | 'paid' | 'email_failed' | 'fulfilled' | 'expired' | 'failed';
  createdAt: string;
  expiresAt: string | null;
  payment: {
    txHash: string | null;
    amountCrypto: number;
    token: string;
    status: 'pending' | 'confirming' | 'succeeded' | 'email_failed' | 'failed';
    createdAt: string;
  } | null;
  giftCard: {
    store: string;
    currency: string;
    amountUSD: number;
  } | null;
  wallet: {
    address: string;
    type: string;
  } | null;
}

export default function DashboardPage() {
  const { user, ready, authenticated } = usePrivy();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    emailFailedTransactions: 0,
  });
  const { selectedDisplayCurrency } = useCurrencyStore();

  useEffect(() => {
    if (!ready || !authenticated || !user?.email?.address) return;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        // Use email to find user since database users are identified by email
        const response = await fetch(`/api/payments/history?email=${encodeURIComponent(user.email.address)}`);
        const data = await response.json();

        if (!response.ok) {
          console.error('Payment history API error:', data);
          return;
        }

        if (data.success && data.payments) {
          console.log('Fetched payments:', data.payments.length);
          setPayments(data.payments);

          // Calculate stats
          const totalBalance = data.payments.reduce(
            (sum: number, p: PaymentData) => sum + (p.payment ? p.amountUSD : 0),
            0
          );
          const totalTransactions = data.payments.length;
          const successfulTransactions = data.payments.filter(
            (p: PaymentData) => p.status === 'paid' || p.status === 'fulfilled'
          ).length;
          const pendingTransactions = data.payments.filter(
            (p: PaymentData) => p.status === 'pending' || p.status === 'processing' || (p.payment && p.payment.status === 'confirming')
          ).length;
          const emailFailedTransactions = data.payments.filter(
            (p: PaymentData) => p.status === 'email_failed' || (p.payment && p.payment.status === 'email_failed')
          ).length;

          setStats({
            totalBalance,
            totalTransactions,
            successfulTransactions,
            pendingTransactions,
            emailFailedTransactions,
          });
        } else {
          console.log('No payments found or API returned:', data);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [ready, authenticated, user?.email?.address]);

  // Calculate chart data from payments - group by date
  const chartDataMap = new Map<string, { volume: number; transactions: number; date: Date }>();
  
  payments
    .filter((p) => p.payment)
    .forEach((payment) => {
      const date = new Date(payment.createdAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!chartDataMap.has(dateKey)) {
        chartDataMap.set(dateKey, { volume: 0, transactions: 0, date });
      }
      
      const entry = chartDataMap.get(dateKey)!;
      entry.volume += payment.amountUSD;
      entry.transactions += 1;
    });

  const chartDataArray = Array.from(chartDataMap.entries())
    .map(([dateKey, data]) => ({
      dateKey,
      date: formatDateForChart(data.date),
      volume: data.volume,
      transactions: data.transactions,
    }))
    .sort((a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime())
    .slice(-6) // Last 6 data points
    .map(({ dateKey, ...rest }) => rest); // Remove dateKey from final output

  // Calculate percentage changes (comparing last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentPayments = payments.filter(
    (p) => new Date(p.createdAt) >= sevenDaysAgo
  );
  const previousPayments = payments.filter(
    (p) => {
      const date = new Date(p.createdAt);
      return date >= fourteenDaysAgo && date < sevenDaysAgo;
    }
  );

  const recentTotal = recentPayments.reduce((sum, p) => sum + p.amountUSD, 0);
  const previousTotal = previousPayments.reduce((sum, p) => sum + p.amountUSD, 0);
  const balanceChange = previousTotal > 0 
    ? ((recentTotal - previousTotal) / previousTotal * 100).toFixed(1)
    : '0';

  const recentTransactions = recentPayments.length;
  const previousTransactions = previousPayments.length;
  const transactionChange = previousTransactions > 0
    ? ((recentTransactions - previousTransactions) / previousTransactions * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dashboard-text-primary">Dashboard</h1>
        <p className="text-sm dashboard-text-secondary mt-1">
          Welcome back! Here's an overview of your account.
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm"
            >
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(() => {
            const formattedBalance = formatAmountWithConversion(stats.totalBalance);
            return (
              <StatsCard
                title="Total Balance"
                value={formattedBalance.display}
                subtitle={formattedBalance.showUSDEquivalent ? formattedBalance.usdEquivalent : undefined}
                change={{
                  value: `${balanceChange}%`,
                  isPositive: parseFloat(balanceChange) >= 0,
                }}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            );
          })()}
          <StatsCard
            title="Total Transactions"
            value={stats.totalTransactions.toLocaleString()}
            change={{
              value: `${transactionChange}%`,
              isPositive: parseFloat(transactionChange) >= 0,
            }}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
          />
          <StatsCard
            title="Successful Payments"
            value={stats.successfulTransactions.toLocaleString()}
            subtitle={`${stats.totalTransactions > 0 ? ((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1) : 0}% success rate`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <StatsCard
            title="Pending Payments"
            value={stats.pendingTransactions.toLocaleString()}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          {stats.emailFailedTransactions > 0 && (
            <StatsCard
              title="Email Failed"
              value={stats.emailFailedTransactions.toLocaleString()}
              subtitle="Requires attention"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
            />
          )}
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
          <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ) : (
        <Chart title="Payment Volume" data={chartDataArray} />
      )}

      {/* Recent Transactions */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold dashboard-text-primary">
            Recent Transactions
          </h2>
          <p className="text-sm dashboard-text-secondary mt-1">
            Your latest payment activity
          </p>
        </div>
        {loading ? (
          <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ) : (
          <Table transactions={payments.slice(0, 5)} showPagination={false} />
        )}
      </div>
    </div>
  );
}
