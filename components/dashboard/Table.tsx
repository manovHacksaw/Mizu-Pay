'use client';

import { formatDateForTable } from '@/lib/dateUtils';
import { useCurrencyStore } from '@/lib/currencyStore';
import { formatAmountWithConversion } from '@/lib/currencyUtils';

interface Transaction {
  sessionId: string;
  store: string;
  amountUSD: number;
  status: 'pending' | 'paid' | 'fulfilled' | 'expired' | 'failed';
  createdAt: string;
  payment: {
    txHash: string | null;
    amountCrypto: number;
    token: string;
    status: string;
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

interface TableProps {
  transactions?: Transaction[];
  showPagination?: boolean;
}

export function Table({ transactions = [], showPagination = true }: TableProps) {
  const { selectedDisplayCurrency, convertUSDToUserCurrency, formatAmount } = useCurrencyStore();

  // Calculate extra paid amount and percentage
  const calculateExtraPaid = (transaction: Transaction) => {
    if (!transaction.payment) {
      return null; // No payment made yet
    }

    const purchaseAmount = transaction.amountUSD;
    const paidAmount = transaction.payment.amountCrypto; // Already in USD equivalent
    const difference = paidAmount - purchaseAmount;
    const percentage = purchaseAmount > 0 ? (difference / purchaseAmount) * 100 : 0;

    return {
      absolute: difference,
      percentage: percentage,
    };
  };

  // Format extra paid display
  const formatExtraPaid = (transaction: Transaction) => {
    const extraPaid = calculateExtraPaid(transaction);
    
    if (extraPaid === null) {
      return { text: '—', isMuted: false }; // No payment yet
    }

    const { absolute, percentage } = extraPaid;
    
    if (Math.abs(absolute) < 0.01) {
      // Zero or very small difference
      return {
        text: `$0.00 (0%)`,
        isMuted: true,
      };
    }

    // Convert difference to display currency
    const displayDifference = convertUSDToUserCurrency(Math.abs(absolute));
    const formattedDifference = formatAmount(displayDifference, selectedDisplayCurrency);
    const sign = absolute > 0 ? '+' : '';
    
    return {
      text: `${sign}${formattedDifference} (${sign}${percentage.toFixed(1)}%)`,
      isMuted: false,
    };
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      fulfilled: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      expired: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
      failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };

    const statusLabels: Record<string, string> = {
      paid: 'Paid',
      fulfilled: 'Fulfilled',
      pending: 'Pending',
      expired: 'Expired',
      failed: 'Failed',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {(status === 'paid' || status === 'fulfilled') && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {status === 'pending' && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {(status === 'expired' || status === 'failed') && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {statusLabels[status] || status}
      </span>
    );
  };

  if (transactions.length === 0) {
    return (
      <div className="dashboard-card-bg rounded-xl border dashboard-card-border shadow-sm">
        <div className="px-6 py-4 border-b dashboard-card-border">
          <h3 className="text-lg font-semibold dashboard-text-primary">
            Transaction Overview
          </h3>
        </div>
        <div className="p-12 text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 dashboard-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm dashboard-text-secondary">No transactions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card-bg rounded-xl border dashboard-card-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b dashboard-card-border">
        <h3 className="text-lg font-semibold dashboard-text-primary">
          Transaction Overview
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="dashboard-input-bg">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium dashboard-text-muted uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dashboard-text-muted uppercase tracking-wider">
                Purchase
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dashboard-text-muted uppercase tracking-wider">
                Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dashboard-text-muted uppercase tracking-wider">
                Extra Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dashboard-text-muted uppercase tracking-wider">
                Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dashboard-text-muted uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dashboard-text-muted uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium dashboard-text-muted uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="dashboard-card-bg divide-y dashboard-card-border">
            {transactions.map((transaction) => (
              <tr
                key={transaction.sessionId}
                className="dashboard-hover transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const formatted = formatAmountWithConversion(transaction.amountUSD);
                    return (
                      <>
                        <div className="text-sm font-medium dashboard-text-primary">
                          {formatted.display}
                        </div>
                        {formatted.showUSDEquivalent && (
                          <div className="text-xs dashboard-text-muted mt-0.5">
                            {formatted.usdEquivalent}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.payment ? (
                    <>
                      {(() => {
                        const formatted = formatAmountWithConversion(transaction.payment.amountCrypto);
                        return (
                          <>
                            <div className="text-sm font-medium dashboard-text-primary">
                              {formatted.display}
                            </div>
                            {formatted.showUSDEquivalent && (
                              <div className="text-xs dashboard-text-muted mt-0.5">
                                ≈ {formatted.usdEquivalent}
                              </div>
                            )}
                            <div className="text-xs dashboard-text-secondary mt-0.5">
                              {transaction.payment.amountCrypto.toFixed(4)} {transaction.payment.token}
                            </div>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <span className="text-sm dashboard-text-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const extraPaid = formatExtraPaid(transaction);
                    return (
                      <span
                        className={`text-sm ${
                          extraPaid.isMuted
                            ? 'dashboard-text-muted opacity-60'
                            : 'dashboard-text-secondary'
                        }`}
                      >
                        {extraPaid.text}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm dashboard-text-primary">{transaction.store}</div>
                  {transaction.giftCard && (
                    <div className="text-xs dashboard-text-secondary">
                      Gift Card: {transaction.giftCard.currency}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.payment?.txHash ? (
                    <a
                      href={`https://celo-sepolia.blockscout.com/tx/${transaction.payment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono"
                    >
                      {transaction.payment.txHash.slice(0, 8)}...{transaction.payment.txHash.slice(-6)}
                    </a>
                  ) : (
                    <span className="text-xs dashboard-text-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm dashboard-text-secondary">
                  {formatDateForTable(transaction.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(transaction.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showPagination && (
        <div className="px-6 py-4 border-t dashboard-card-border flex items-center justify-between">
          <div className="text-sm dashboard-text-secondary">
            Showing {transactions.length} result{transactions.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 text-sm font-medium dashboard-text-secondary dashboard-card-bg border dashboard-card-border rounded-lg dashboard-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Previous
            </button>
            <button
              className="px-4 py-2 text-sm font-medium dashboard-text-secondary dashboard-card-bg border dashboard-card-border rounded-lg dashboard-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={transactions.length < 10}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
