  'use client';

  import Link from 'next/link';
  import { CeloUsdChart } from '@/components/dashboard/CeloUsdChart';
  import { Chart } from '@/components/dashboard/Chart';
  import { Table } from '@/components/dashboard/Table';
  import { usePrivy, useWallets } from '@privy-io/react-auth';
  import { useEffect, useState } from 'react';
  import { formatDateForChart } from '@/lib/dateUtils';
  import { useCurrencyStore } from '@/lib/currencyStore';
  import { formatAmountWithConversion } from '@/lib/currencyUtils';
import { Coins, ArrowDownCircle, Leaf, ArrowRight, Copy } from 'lucide-react';
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
    const [activeWalletAddress, setActiveWalletAddress] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { selectedDisplayCurrency, convertCryptoToUSD, fetchExchangeRates, exchangeRates } = useCurrencyStore();
    const [stats, setStats] = useState({
      totalBalance: 0,
      totalDeposits: 0,
      totalSpent: 0,
      refiContribution: 0,
    });

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

            // Calculate total deposits (all payments made) in USD
            const totalDeposits = data.payments
              .filter((p: PaymentData) => p.payment)
              .reduce((sum: number, p: PaymentData) => sum + (p.amountUSD || 0), 0);

            // Calculate total spent (fulfilled payments only) in USD
            const totalSpent = data.payments
              .filter((p: PaymentData) => p.status === 'fulfilled' && p.payment)
              .reduce((sum: number, p: PaymentData) => sum + (p.amountUSD || 0), 0);

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

    // Fetch exchange rates on mount
    useEffect(() => {
      fetchExchangeRates();
    }, [fetchExchangeRates]);

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

    // Calculate volume chart data
    const volumeMap = new Map<string, { volume: number; transactions: number; date: Date }>();
    
    payments
      .filter((p) => p.payment)
      .forEach((payment) => {
        const date = new Date(payment.createdAt);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!volumeMap.has(dateKey)) {
          volumeMap.set(dateKey, { volume: 0, transactions: 0, date });
        }
        
        const entry = volumeMap.get(dateKey)!;
        entry.volume += payment.amountUSD;
        entry.transactions += 1;
      });

    const volumeChartData = Array.from(volumeMap.values())
      .map((entry) => ({
        date: formatDateForChart(entry.date),
        volume: entry.volume,
        transactions: entry.transactions,
        timestamp: entry.date.getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-30)
      .map(({ timestamp, ...rest }) => rest);

    // Calculate total balance in USD
    const totalBalanceUSD = convertCryptoToUSD(walletBalance.cusd, 'cUSD') + convertCryptoToUSD(walletBalance.celo, 'CELO');
  const balanceFormatted = formatAmountWithConversion(totalBalanceUSD);
    const spentFormatted = formatAmountWithConversion(stats.totalSpent);
    const refiFormatted = formatAmountWithConversion(stats.refiContribution);

    return (
      <div className="space-y-6">
        {/* First Section: Stats Cards and Wallet Card */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Balance Card */}
        <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Coins className="w-8 h-8 dashboard-text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="text-xs font-semibold uppercase tracking-wide dashboard-text-secondary mb-3">Balance</h3>
          {loadingBalance ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <p className="text-2xl font-bold dashboard-text-primary">{balanceFormatted.display}</p>
              {balanceFormatted.showUSDEquivalent && (
                <p className="text-sm dashboard-text-muted mt-1.5">{balanceFormatted.usdEquivalent}</p>
              )}
            </>
          )}
        </div>

        {/* Total Spent Card */}
        <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <ArrowDownCircle className="w-8 h-8 dashboard-text-primary" strokeWidth={2.5} />
                    </div>
          <h3 className="text-xs font-semibold uppercase tracking-wide dashboard-text-secondary mb-3">Total Spent</h3>
          {loading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
            <>
              <p className="text-2xl font-bold dashboard-text-primary">{spentFormatted.display}</p>
              {spentFormatted.showUSDEquivalent && (
                <p className="text-sm dashboard-text-muted mt-1.5">{spentFormatted.usdEquivalent}</p>
              )}
            </>
          )}
                    </div>

        {/* ReFi Contribution Card */}
        <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Leaf className="w-8 h-8 dashboard-text-primary" strokeWidth={2.5} />
                  </div>
          <h3 className="text-xs font-semibold uppercase tracking-wide dashboard-text-secondary mb-3">
            ReFi Contribution
          </h3>
          {loading ? (
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              <p className="text-2xl font-bold dashboard-text-primary">{refiFormatted.display}</p>
              {refiFormatted.showUSDEquivalent && (
                <p className="text-sm dashboard-text-muted mt-1.5">{refiFormatted.usdEquivalent}</p>
              )}
            </>
                    )}
                  </div>

        <div
 className="relative rounded-2xl text-white shadow-xl overflow-hidden lg:col-span-2"
style={{ background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)' }}
>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/15 rounded-full -mt-24 -mr-16"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -mb-20 -ml-10"></div>
        <div className="relative z-10 flex flex-col gap-4 p-6 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Wallet Overview</p>
                </div>

          {loadingBalance ? (
            <div className="space-y-2">
              <div className="h-6 bg-white/20 rounded animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded animate-pulse"></div>
                </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="space-y-2 ">
            <p className="text-xs text-white/70 uppercase">Wallet Address</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-white/90">
                  {activeWalletAddress
                    ? `${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}`
                    : 'No wallet connected'}
                </p>
                <button
                  onClick={handleCopyAddress}
                  disabled={!activeWalletAddress}
                  className={`inline-flex items-center justify-center rounded-full border border-white/30 p-1 transition ${
                    activeWalletAddress ? 'hover:bg-white/15' : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Link
                href="/dashboard/wallet"
                className="ml-auto inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                Deposit
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Section: Charts and Transaction History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Chart */}
          <Chart data={volumeChartData} title="Payment Volume" />

          {/* CELO to USD Trend Chart */}
          <CeloUsdChart />
          </div>

        {/* Transaction History */}
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