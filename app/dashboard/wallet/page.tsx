'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits, defineChain, getContract } from 'viem';
import { erc20Abi } from 'viem';
import { MOCK_CUSD_ADDRESS } from '@/lib/contracts';

export default function WalletPage() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [balances, setBalances] = useState<{ celo: string; cusd: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeWallet = wallets?.[0];

  useEffect(() => {
    if (!activeWallet?.address) return;

    const fetchBalances = async () => {
      setLoading(true);
      try {
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
          address: activeWallet.address as `0x${string}`,
        });

        // Get cUSD balance
        const contract = getContract({
          address: MOCK_CUSD_ADDRESS,
          abi: erc20Abi,
          client: publicClient,
        });

        const cusdBalance = await contract.read.balanceOf([activeWallet.address as `0x${string}`]);

        setBalances({
          celo: parseFloat(formatUnits(celoBalance, 18)).toFixed(4),
          cusd: parseFloat(formatUnits(cusdBalance as bigint, 18)).toFixed(4),
        });
      } catch (error) {
        console.error('Error fetching balances:', error);
        setBalances({ celo: '0.0000', cusd: '0.0000' });
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [activeWallet?.address]);

  const copyAddress = async () => {
    if (!activeWallet?.address) return;
    try {
      await navigator.clipboard.writeText(activeWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dashboard-text-primary">Wallet</h1>
        <p className="text-sm dashboard-text-secondary mt-1">
          Manage your wallet balances and transactions
        </p>
      </div>

      {/* Wallet Address Card */}
      <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium dashboard-text-secondary mb-2">
              Wallet Address
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono dashboard-text-primary">
                {activeWallet?.address
                  ? `${activeWallet.address.slice(0, 6)}...${activeWallet.address.slice(-4)}`
                  : 'No wallet connected'}
              </p>
              {activeWallet?.address && (
                <button
                  onClick={copyAddress}
                  className="p-1.5 rounded-lg dashboard-hover transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 dashboard-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* cUSD Balance */}
        <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium dashboard-text-secondary mb-1">cUSD</p>
              {loading ? (
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold dashboard-text-primary">
                  {balances?.cusd || '0.0000'}
                </h3>
              )}
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* CELO Balance */}
        <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium dashboard-text-secondary mb-1">CELO</p>
              {loading ? (
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold dashboard-text-primary">
                  {balances?.celo || '0.0000'}
                </h3>
              )}
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
        <button className="flex-1 px-6 py-3 dashboard-card-bg dashboard-text-secondary border dashboard-card-border rounded-lg dashboard-hover transition-colors font-medium flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7l-7 7-7-7" />
          </svg>
          Receive
        </button>
        <button
          onClick={copyAddress}
          className="px-6 py-3 dashboard-card-bg dashboard-text-secondary border dashboard-card-border rounded-lg dashboard-hover transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Address
        </button>
      </div>
    </div>
  );
}

