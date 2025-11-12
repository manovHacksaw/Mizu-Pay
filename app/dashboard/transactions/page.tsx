'use client';

import { Table } from '@/components/dashboard/Table';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { formatDateForTable } from '@/lib/dateUtils';

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

export default function TransactionsPage() {
  const { user, ready, authenticated } = usePrivy();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!ready || !authenticated || !user?.email?.address) return;

    const email = user.email.address; // Store email to ensure type narrowing
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // Use email to find user since database users are identified by email
        const response = await fetch(`/api/payments/history?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (data.success && data.payments) {
          setPayments(data.payments);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [ready, authenticated, user?.email?.address]);

  const filteredPayments =
    statusFilter === 'all'
      ? payments
      : payments.filter((p) => p.status === statusFilter);

  const exportToCSV = () => {
    const headers = ['Date', 'Store', 'Purchase (USD)', 'Paid (USD)', 'Extra Paid', 'Status', 'Transaction Hash', 'Token', 'Amount (Crypto)'];
    const rows = filteredPayments.map((p) => {
      const purchaseAmount = p.amountUSD;
      const paidAmount = p.payment?.amountCrypto || 0;
      const extraPaid = p.payment ? paidAmount - purchaseAmount : 0;
      const extraPaidPercentage = purchaseAmount > 0 ? ((extraPaid / purchaseAmount) * 100) : 0;
      const extraPaidText = p.payment 
        ? (Math.abs(extraPaid) < 0.01 
            ? '$0.00 (0%)' 
            : `${extraPaid > 0 ? '+' : ''}$${Math.abs(extraPaid).toFixed(2)} (${extraPaid > 0 ? '+' : ''}${extraPaidPercentage.toFixed(1)}%)`)
        : '—';

      return [
        formatDateForTable(p.createdAt),
        p.store,
        purchaseAmount.toString(),
        p.payment ? paidAmount.toString() : '—',
        extraPaidText,
        p.status,
        p.payment?.txHash || '',
        p.payment?.token || '',
        p.payment?.amountCrypto.toString() || '',
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dashboard-text-primary">Transactions</h1>
        <p className="text-sm dashboard-text-secondary mt-1">
          View and manage all your transactions
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 dashboard-card-bg dashboard-card-border border rounded-lg text-sm dashboard-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredPayments.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ) : (
        <Table transactions={filteredPayments} showPagination={true} />
      )}
    </div>
  );
}
