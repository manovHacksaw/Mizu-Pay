'use client';

import { useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { MOCK_CUSD_ADDRESS, MIZU_PAY_CONTRACT } from '@/lib/contracts';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  tokenSymbol: string;
  type: 'deposit' | 'payment' | 'withdrawal';
  blockNumber: string;
}

interface TransactionHistoryProps {
  walletAddress: string;
  refreshTrigger?: number; // Optional trigger to refresh transactions
}

const BLOCKSCOUT_API_BASE = 'https://celo-sepolia.blockscout.com/api';

export function TransactionHistory({ walletAddress, refreshTrigger }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const walletAddressLower = walletAddress.toLowerCase();
        const mizuPayContractLower = MIZU_PAY_CONTRACT.toLowerCase();
        const allTransactions: Transaction[] = [];

        // Fetch native CELO transactions (both incoming and outgoing)
        try {
          const celoResponse = await fetch(
            `${BLOCKSCOUT_API_BASE}?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`
          );
          const celoData = await celoResponse.json();

          if (celoData.status === '1' && celoData.result && Array.isArray(celoData.result)) {
            celoData.result.forEach((tx: any) => {
              // Skip contract creation transactions (no 'to' address)
              if (!tx.to) return;
              
              // Skip zero-value transactions (but allow them if they're deposits)
              // Zero-value might be contract interactions, but we want to show actual transfers
              const value = BigInt(tx.value || '0');
              if (value === 0n) return;

              const isDeposit = tx.to.toLowerCase() === walletAddressLower;
              const isOutgoing = tx.from.toLowerCase() === walletAddressLower;
              
              if (isDeposit) {
                // CELO deposit - incoming to wallet
                allTransactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value,
                  timestamp: tx.timeStamp,
                  tokenSymbol: 'CELO',
                  type: 'deposit',
                  blockNumber: tx.blockNumber,
                });
              } else if (isOutgoing) {
                // Check if it's a payment to Mizu Pay contract or a withdrawal
                const isPayment = tx.to.toLowerCase() === mizuPayContractLower;
                allTransactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value,
                  timestamp: tx.timeStamp,
                  tokenSymbol: 'CELO',
                  type: isPayment ? 'payment' : 'withdrawal',
                  blockNumber: tx.blockNumber,
                });
              }
            });
          }
        } catch (err) {
          console.error('Error fetching CELO transactions:', err);
        }

        // Fetch cUSD token transfers
        try {
          const tokenResponse = await fetch(
            `${BLOCKSCOUT_API_BASE}?module=account&action=tokentx&contractaddress=${MOCK_CUSD_ADDRESS}&address=${walletAddress}&page=1&offset=50&sort=desc`
          );
          const tokenData = await tokenResponse.json();

          if (tokenData.status === '1' && tokenData.result) {
            tokenData.result.forEach((tx: any) => {
              const isDeposit = tx.to.toLowerCase() === walletAddressLower;
              const isOutgoing = tx.from.toLowerCase() === walletAddressLower;

              if (isDeposit) {
                allTransactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value,
                  timestamp: tx.timeStamp,
                  tokenSymbol: 'cUSD',
                  type: 'deposit',
                  blockNumber: tx.blockNumber,
                });
              } else if (isOutgoing) {
                // Check if it's a payment to Mizu Pay contract or a withdrawal
                const isPayment = tx.to.toLowerCase() === mizuPayContractLower;
                allTransactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: tx.value,
                  timestamp: tx.timeStamp,
                  tokenSymbol: 'cUSD',
                  type: isPayment ? 'payment' : 'withdrawal',
                  blockNumber: tx.blockNumber,
                });
              }
            });
          }
        } catch (err) {
          console.error('Error fetching token transactions:', err);
        }

        // Sort by timestamp (newest first) and limit to 20
        allTransactions.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
        setTransactions(allTransactions.slice(0, 20));
      } catch (err) {
        setError('Failed to fetch transaction history');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [walletAddress, refreshTrigger]);

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (value: string, decimals: number = 18) => {
    const amount = parseFloat(formatUnits(BigInt(value), decimals));
    return amount.toFixed(4);
  };

  if (loading) {
    return (
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <h2 className="text-lg font-semibold dashboard-text-primary mb-4">Transaction History</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <h2 className="text-lg font-semibold dashboard-text-primary mb-4">Transaction History</h2>
        <p className="text-sm dashboard-text-secondary">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
      <h2 className="text-lg font-semibold dashboard-text-primary mb-4">Transaction History</h2>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm dashboard-text-secondary">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <a
              key={tx.hash}
              href={`https://celo-sepolia.blockscout.com/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 transition-all group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Transaction Type Icon - More Subtle */}
                <div className="flex-shrink-0">
                  {tx.type === 'deposit' ? (
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 5v14m7-7l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  ) : tx.type === 'payment' ? (
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-sm font-medium ${
                        tx.type === 'deposit'
                          ? 'text-green-700'
                          : tx.type === 'payment'
                          ? 'text-blue-700'
                          : 'text-red-700'
                      }`}
                    >
                      {tx.type === 'deposit' ? 'Deposit' : tx.type === 'payment' ? 'Payment' : 'Withdrawal'}
                    </span>
                    <span className="text-xs text-gray-500 px-2 py-0.5 rounded bg-gray-100 font-medium">
                      {tx.tokenSymbol}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {tx.type === 'deposit'
                      ? `From: ${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`
                      : tx.type === 'payment'
                      ? `Payment to Mizu Pay`
                      : `To: ${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(tx.timestamp)}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0 ml-4 flex items-center gap-2">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        tx.type === 'deposit'
                          ? 'text-green-700'
                          : tx.type === 'payment'
                          ? 'text-blue-700'
                          : 'text-red-700'
                      }`}
                    >
                      {tx.type === 'deposit' ? '+' : '-'}
                      {formatAmount(tx.value)} {tx.tokenSymbol}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

