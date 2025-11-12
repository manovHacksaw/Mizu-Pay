'use client';

import Link from 'next/link';
import { Chart } from '@/components/dashboard/Chart';
import { Table } from '@/components/dashboard/Table';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { formatDateForChart } from '@/lib/dateUtils';
import { useCurrencyStore } from '@/lib/currencyStore';
import { formatAmountWithConversion } from '@/lib/currencyUtils';
// Updated imports: Replaced Leaf with PiggyBank
import { TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { createPublicClient, http, formatUnits, defineChain, getContract } from 'viem';
import { erc20Abi } from 'viem';
import { MOCK_CUSD_ADDRESS } from '@/lib/contracts';

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
  const { wallets } = useWallets();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<{ cusd: number; celo: number }>({ cusd: 0, celo: 0 });
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalDeposits: 0,
    totalSpent: 0,
    refiContribution: 0,
  });
  const [activeWalletAddress, setActiveWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { selectedDisplayCurrency } = useCurrencyStore();

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      const embeddedWallet = wallets?.find(
        (w) =>
          w.walletClientType === 'privy' ||
          w.walletClientType === 'embedded' ||
          w.connectorType === 'privy',
      );

      if (!embeddedWallet?.address) {
        setActiveWalletAddress(null);
        setLoadingBalance(false);
        return;
      }

      try {
        setLoadingBalance(true);
        const celoSepolia = defineChain({
          id: 11142220,
          name: 'Celo Sepolia',
          nativeCurrency: {
            decimals: 18,
            name: 'CELO',
            symbol: 'CELO',
          },
          rpcUrls: {
            default: {
              http: ['https://rpc.ankr.com/celo_sepolia'],
            },
          },
          blockExplorers: {
            default: {
              name: 'Celo Sepolia Explorer',
              url: 'https://celo-sepolia.blockscout.com',
            },
          },
          testnet: true,
        });

        const publicClient = createPublicClient({
          chain: celoSepolia,
          transport: http(),
        });

        // Get CELO balance
        const celoBalance = await publicClient.getBalance({
          address: embeddedWallet.address as `0x${string}`,
        });

        // Get cUSD balance
        const contract = getContract({
          address: MOCK_CUSD_ADDRESS,
          abi: erc20Abi,
          client: publicClient,
        });

        const cusdBalance = await contract.read.balanceOf([embeddedWallet.address as `0x${string}`]);

        setWalletBalance({
          celo: parseFloat(formatUnits(celoBalance, 18)),
          cusd: parseFloat(formatUnits(cusdBalance as bigint, 18)),
        });
        setActiveWalletAddress(embeddedWallet.address);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setWalletBalance({ cusd: 0, celo: 0 });
        setActiveWalletAddress(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    if (wallets && wallets.length > 0) {
      fetchWalletBalance();
    }
  }, [wallets]);

  useEffect(() => {
    if (!ready || !authenticated || !user?.email?.address) return;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payments/history?email=${encodeURIComponent(user.email?.address || '')}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404 && errorData.error === 'User not found') {
            setPayments([]);
            setStats({
              totalBalance: 0,
              totalDeposits: 0,
              totalSpent: 0,
              refiContribution: 0,
            });
            return;
          }
          if (response.status !== 404) {
            console.error('Payment history API error:', errorData.error || errorData.details || 'Unknown error');
          }
          return;
        }

        const data = await response.json();

        if (data.success && data.payments) {
          setPayments(data.payments);

          // Calculate total deposits (all payments made)
          const totalDeposits = data.payments
            .filter((p: PaymentData) => p.payment)
            .reduce((sum: number, p: PaymentData) => sum + (p.payment?.amountCrypto || 0), 0);

          // Calculate total spent (fulfilled payments only)
          const totalSpent = data.payments
            .filter((p: PaymentData) => p.status === 'fulfilled' && p.payment)
            .reduce((sum: number, p: PaymentData) => sum + (p.payment?.amountCrypto || 0), 0);

          // ReFi contribution is 0.75% of total spent
          const refiContribution = totalSpent * 0.0075;

          setStats({
            totalBalance: 0, // Will be calculated from wallet balance
            totalDeposits,
            totalSpent,
            refiContribution,
          });
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [ready, authenticated, user?.email?.address]);

  const handleCopyAddress = async () => {
    if (!activeWalletAddress) return;
    try {
      await navigator.clipboard.writeText(activeWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const chartDataMap = new Map<string, { volume: number; transactions: number; date: Date }>();

  payments
    .filter((p) => p.payment)
    .forEach((payment) => {
      const date = new Date(payment.createdAt);
      const dateKey = date.toISOString().split('T')[0];

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
    .slice(-6)
    .map(({ dateKey, ...rest }) => rest);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {(() => {
                const celoToUsdRate = 0.5;
                const totalBalanceUSD = walletBalance.cusd + walletBalance.celo * celoToUsdRate;
                const formattedBalance = formatAmountWithConversion(totalBalanceUSD);
                return (
                  <div className="dashboard-card-bg rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-green-700" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Balance</p>
                      {loadingBalance ? (
                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-gray-900">{formattedBalance.display}</p>
                          {formattedBalance.showUSDEquivalent && (
                            <p className="text-xs text-gray-500 mt-1">{formattedBalance.usdEquivalent}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const formattedSpent = formatAmountWithConversion(stats.totalSpent);
                return (
                  <div className="dashboard-card-bg rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-orange-700" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">{formattedSpent.display}</p>
                      {formattedSpent.showUSDEquivalent && (
                        <p className="text-xs text-gray-500 mt-1">{formattedSpent.usdEquivalent}</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const formattedRefi = formatAmountWithConversion(stats.refiContribution);
                return (
                  <div className="dashboard-card-bg rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <PiggyBank className="w-6 h-6 text-purple-700" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Savings</p>
                      <p className="text-2xl font-bold text-gray-900">{formattedRefi.display}</p>
                      {formattedRefi.showUSDEquivalent && (
                        <p className="text-xs text-gray-500 mt-1">{formattedRefi.usdEquivalent}</p>
                      )}
                      <p className="text-xs text-purple-600 mt-1">Contributed to ReFi</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <Chart title="Payment Volume" data={chartDataArray} />
          )}
        </div>

        <div>
          <div
            className="relative rounded-2xl text-white shadow-xl overflow-hidden h-full"
            style={{ background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)' }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/15 rounded-full -mt-24 -mr-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -mb-20 -ml-10"></div>
            <div className="relative z-10 flex flex-col gap-6 p-8 h-full">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/70">Wallet Overview</p>
                <h3 className="text-2xl font-bold text-white mt-2">Mizu Pay Wallet</h3>
              </div>

              {loadingBalance ? (
                <div className="space-y-3">
                  <div className="h-6 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-6 bg-white/20 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-white/70 uppercase">cUSD Balance</p>
                    <p className="text-xl font-semibold text-white mt-1">{walletBalance.cusd.toFixed(2)} cUSD</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 uppercase">CELO Balance</p>
                    <p className="text-xl font-semibold text-white mt-1">{walletBalance.celo.toFixed(4)} CELO</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs text-white/70 uppercase">Wallet Address</p>
                <p className="text-sm font-mono text-white/90">
                  {activeWalletAddress 
                    ? `${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}`
                    : 'No wallet connected'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <Link
                  href="/dashboard/wallet"
                  className="flex-1 px-4 py-3 bg-white text-blue-600 font-semibold rounded-xl text-center shadow-sm hover:bg-white/90 transition-colors"
                >
                  Deposit
                </Link>
                <button
                  onClick={handleCopyAddress}
                  disabled={!activeWalletAddress}
                  className={`flex-1 px-4 py-3 border border-white/40 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                    activeWalletAddress ? 'hover:bg-white/10' : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest payment activity</p>
          </div>
        </div>
        {loading ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <Table transactions={payments.slice(0, 5)} showPagination={false} />
        )}
      </div>
    </div>
  );
}