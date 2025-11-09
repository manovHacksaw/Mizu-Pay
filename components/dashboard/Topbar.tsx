'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits, defineChain, getContract } from 'viem';
import { erc20Abi } from 'viem';
import { MOCK_CUSD_ADDRESS } from '@/lib/contracts';

interface TopbarProps {
  onLogout?: () => void;
}

export function Topbar({ onLogout }: TopbarProps) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [walletBalance, setWalletBalance] = useState<{ celo: string; cusd: string } | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Get the first wallet or embedded wallet
  const activeWallet = wallets?.[0];

  useEffect(() => {
    if (!activeWallet?.address) return;

    const fetchBalance = async () => {
      setLoadingBalance(true);
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

        setWalletBalance({
          celo: parseFloat(formatUnits(celoBalance, 18)).toFixed(4),
          cusd: parseFloat(formatUnits(cusdBalance as bigint, 18)).toFixed(4),
        });
      } catch (error) {
        console.error('Error fetching balance:', error);
        setWalletBalance({ celo: '0.0000', cusd: '0.0000' });
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [activeWallet?.address]);

  const totalBalance = walletBalance
    ? (parseFloat(walletBalance.celo) + parseFloat(walletBalance.cusd)).toFixed(2)
    : '0.00';

  return (
    <header className="fixed top-0 left-64 right-0 h-16 dashboard-sidebar-bg border-b dashboard-sidebar-border z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 dashboard-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 dashboard-input-bg dashboard-card-border border rounded-lg text-sm dashboard-text-primary placeholder-dashboard-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Wallet Balance & Profile */}
        <div className="flex items-center gap-4">
          {/* Wallet Balance */}
          <div className="flex items-center gap-2 px-4 py-2 dashboard-input-bg rounded-lg">
            <svg
              className="w-4 h-4 dashboard-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div className="text-right">
              <div className="text-xs dashboard-text-muted">Balance</div>
              {loadingBalance ? (
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <div className="text-sm font-semibold dashboard-text-primary">
                  ${totalBalance}
                </div>
              )}
            </div>
          </div>

          {/* Profile Avatar */}
          <div className="relative group">
            <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
              {user?.email?.address?.[0]?.toUpperCase() || 'U'}
            </button>
            {onLogout && (
              <div className="absolute right-0 mt-2 w-48 dashboard-card-bg rounded-lg shadow-lg border dashboard-card-border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-sm dashboard-text-secondary dashboard-hover rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

