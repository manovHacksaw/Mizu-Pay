'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits, defineChain, getContract } from 'viem';
import { erc20Abi } from 'viem';
import { MOCK_CUSD_ADDRESS } from '@/lib/contracts';
import { ReceiveModal } from '@/components/modals/ReceiveModal';
import { SendWalletInfoModal } from '@/components/modals/SendWalletInfoModal';
import { SendModal } from '@/components/modals/SendModal';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';
import { syncUserToDatabase, extractWalletData } from '@/lib/syncUser';
import { useCurrencyStore } from '@/lib/currencyStore';

export default function WalletPage() {
  const { user, createWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { convertCryptoToUSD, fetchExchangeRates } = useCurrencyStore();
  const [balances, setBalances] = useState<{ celo: string; cusd: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isSendInfoModalOpen, setIsSendInfoModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [transactionRefreshTrigger, setTransactionRefreshTrigger] = useState(0);
  const [checkingWallet, setCheckingWallet] = useState(true);
  const [walletSynced, setWalletSynced] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);

  // Only show Mizu Pay (embedded) wallets, not external wallets
  // Note: Only one embedded wallet per user is allowed in the database
  const embeddedWallets = wallets?.filter(w => 
    w.walletClientType === 'privy' || 
    w.walletClientType === 'embedded' ||
    w.connectorType === 'privy'
  ) || [];

  // Use the first embedded wallet (should be the only one)
  const activeWallet = embeddedWallets[0];

  // Check for wallet and sync to database immediately if it exists
  useEffect(() => {
    if (!walletsReady || !user?.id) {
      if (walletsReady && !user?.id) {
        setCheckingWallet(false);
      }
      return;
    }

    const checkAndSyncWallet = async () => {
      // First, check immediately if wallet exists (user might already have one from Privy)
      const embeddedWallet = wallets?.find(w => 
        w.walletClientType === 'privy' || 
        w.walletClientType === 'embedded' ||
        w.connectorType === 'privy'
      );

      if (embeddedWallet?.address) {
        // Wallet exists - sync to database immediately
        if (!walletSynced) {
          try {
            const walletData = extractWalletData(wallets || []);
            await syncUserToDatabase({
              privyUserId: user.id,
              email: user.email?.address || null,
              wallets: walletData,
              activeWalletAddress: embeddedWallet.address,
            });
            setWalletSynced(true);
          } catch (error) {
            console.error('Error syncing wallet to database:', error);
          }
        }
        setCheckingWallet(false);
        setCreatingWallet(false);
        return;
      }

      // No wallet found - wait a bit for Privy to potentially create it (configured to create on login)
      if (checkingWallet) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Re-check after waiting
        const recheckWallet = wallets?.find(w => 
          w.walletClientType === 'privy' || 
          w.walletClientType === 'embedded' ||
          w.connectorType === 'privy'
        );
        
        if (recheckWallet?.address) {
          // Wallet was created - sync it
          try {
            const walletData = extractWalletData(wallets || []);
            await syncUserToDatabase({
              privyUserId: user.id,
              email: user.email?.address || null,
              wallets: walletData,
              activeWalletAddress: recheckWallet.address,
            });
            setWalletSynced(true);
            setCheckingWallet(false);
            setCreatingWallet(false);
          } catch (error) {
            console.error('Error syncing wallet to database:', error);
            setCheckingWallet(false);
          }
        } else {
          // Still no wallet - show create prompt
          setCheckingWallet(false);
        }
      } else {
        setCheckingWallet(false);
      }
    };

    checkAndSyncWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletsReady, user?.id, wallets]);

  // Handle wallet creation
  const handleCreateWallet = async () => {
    if (!createWallet) {
      console.error('createWallet function not available');
      return;
    }

    setCreatingWallet(true);
    try {
      await createWallet();
      // Wait a moment for wallet to be created and appear in wallets list
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if wallet was created
      const newEmbeddedWallet = wallets?.find(w => 
        w.walletClientType === 'privy' || 
        w.walletClientType === 'embedded' ||
        w.connectorType === 'privy'
      );

      if (newEmbeddedWallet?.address && user?.id) {
        // Sync the newly created wallet to database
        try {
          const walletData = extractWalletData(wallets || []);
          await syncUserToDatabase({
            privyUserId: user.id,
            email: user.email?.address || null,
            wallets: walletData,
            activeWalletAddress: newEmbeddedWallet.address,
          });
          setWalletSynced(true);
        } catch (error) {
          console.error('Error syncing newly created wallet to database:', error);
        }
      }
      
      // Force re-check by resetting state
      setWalletSynced(false);
      setCheckingWallet(true);
    } catch (error) {
      console.error('Error creating wallet:', error);
      setCreatingWallet(false);
    }
  };

  const fetchBalances = async () => {
    if (!activeWallet?.address) return;
    
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

  // Fetch exchange rates on mount
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  useEffect(() => {
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

  // Show message if no embedded wallet found
  if (!activeWallet) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold dashboard-text-primary">Mizu Pay Wallet</h1>
          <p className="text-sm dashboard-text-secondary mt-1">
            Manage your Mizu Pay wallet balances and transactions
          </p>
        </div>
        <div className="dashboard-card-bg rounded-xl p-6 border dashboard-card-border shadow-sm">
          <div className="text-center py-8">
            {checkingWallet ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-sm dashboard-text-secondary mb-2">
                  Creating your Mizu Pay wallet...
                </p>
                <p className="text-xs dashboard-text-secondary">
                  This may take a few moments. Please wait.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold dashboard-text-primary mb-2">
                  Create Your Mizu Pay Wallet
                </h3>
                <p className="text-sm dashboard-text-secondary mb-6 max-w-md mx-auto">
                  You need a Mizu Pay embedded wallet to manage your balances and make payments. 
                  Click the button below to create your wallet now.
                </p>
                <button
                  onClick={handleCreateWallet}
                  disabled={creatingWallet || !createWallet}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {creatingWallet ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Wallet...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Wallet
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold dashboard-text-primary">Mizu Pay Wallet</h1>
        <p className="text-sm dashboard-text-secondary mt-1">
          Manage your Mizu Pay wallet balances and transactions
        </p>
      </div>

      {/* Wallet Credit Card */}
      {activeWallet?.address && (
        <div 
          className="relative rounded-2xl p-8 text-white shadow-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
            minHeight: '220px',
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          {/* Card Content */}
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
           
            
            {/* Middle Section - Balance */}
            <div className="mb-8">
              {loading ? (
                <div className="h-10 w-48 bg-white/20 rounded-lg animate-pulse"></div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-4xl font-bold mb-1">
                      {(() => {
                        const cusd = parseFloat(balances?.cusd || '0');
                        return cusd.toFixed(2);
                      })()}
                    </h2>
                    <p className="text-lg text-white/90 font-medium">cUSD Balance</p>
                    <p className="text-sm text-white/70 mt-1">
                      ≈ ${(() => {
                        const cusd = parseFloat(balances?.cusd || '0');
                        const usdValue = convertCryptoToUSD(cusd, 'cUSD');
                        return usdValue.toFixed(2);
                      })()} USD
                    </p>
                  </div>
          <div>
                    <p className="text-sm text-white/70 uppercase tracking-wider mb-1">CELO Balance</p>
                    <p className="text-2xl font-semibold text-white mb-1">
                      {(() => {
                        const celo = parseFloat(balances?.celo || '0');
                        return celo.toFixed(4);
                      })()}{' '}
                      CELO
                    </p>
                    <p className="text-sm text-white/70">
                      ≈ ${(() => {
                        const celo = parseFloat(balances?.celo || '0');
                        const usdValue = convertCryptoToUSD(celo, 'CELO');
                        return usdValue.toFixed(2);
                      })()} USD
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section - Wallet Address */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-white/70 uppercase tracking-wider font-medium">Wallet Address</p>
                <button
                  onClick={copyAddress}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                  title="Copy address"
                >
                  {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-base font-mono tracking-wider text-white/90 break-all">
                {activeWallet.address || 'No wallet connected'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Copy Success Toast */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            <span className="text-sm font-medium">Address copied to clipboard</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSendInfoModalOpen(true)}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
        <button
          onClick={() => setIsReceiveModalOpen(true)}
          className="flex-1 px-6 py-3 dashboard-card-bg dashboard-text-secondary border dashboard-card-border rounded-lg dashboard-hover transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7l-7 7-7-7" />
          </svg>
          Receive
        </button>
        <button
          onClick={copyAddress}
          className="px-6 py-3 dashboard-card-bg dashboard-text-secondary border dashboard-card-border rounded-lg dashboard-hover transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Address
        </button>
      </div>

      {/* Transaction History */}
      {activeWallet?.address && (
        <TransactionHistory 
          walletAddress={activeWallet.address}
          refreshTrigger={transactionRefreshTrigger}
        />
      )}

      {/* Receive Modal */}
      {activeWallet?.address && (
        <ReceiveModal
          isOpen={isReceiveModalOpen}
          onClose={() => setIsReceiveModalOpen(false)}
          walletAddress={activeWallet.address}
        />
      )}

      {/* Send Info Modal */}
      <SendWalletInfoModal
        isOpen={isSendInfoModalOpen}
        onClose={() => setIsSendInfoModalOpen(false)}
        onContinue={() => {
          setIsSendInfoModalOpen(false);
          setIsSendModalOpen(true);
        }}
      />

      {/* Send Modal */}
      {activeWallet?.address && (
        <SendModal
          isOpen={isSendModalOpen}
          onClose={() => {
            setIsSendModalOpen(false);
            // Refresh balances and transaction history after closing (in case a transaction was successful)
            fetchBalances();
            setTransactionRefreshTrigger(prev => prev + 1);
          }}
          walletAddress={activeWallet.address}
          balances={balances}
        />
      )}
    </div>
  );
}

