'use client';

import { useEffect, useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatUnits, parseUnits, defineChain, getContract, createWalletClient, custom } from 'viem';
import { erc20Abi } from 'viem';
import { MOCK_CUSD_ADDRESS } from '@/lib/contracts';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  balances: { celo: string; cusd: string } | null;
}

export function SendModal({ isOpen, onClose, walletAddress, balances }: SendModalProps) {
  const { wallets } = useWallets();
  const [token, setToken] = useState<'cusd' | 'celo'>('cusd');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRecipientAddress('');
      setAmount('');
      setError(null);
      setSuccess(false);
      setTxHash(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMaxClick = () => {
    if (token === 'cusd' && balances?.cusd) {
      setAmount(balances.cusd);
    } else if (token === 'celo' && balances?.celo) {
      setAmount(balances.celo);
    }
  };

  const validateForm = (): boolean => {
    if (!recipientAddress) {
      setError('Please enter a recipient address');
      return false;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      setError('Invalid Ethereum address format');
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    const balance = token === 'cusd' ? parseFloat(balances?.cusd || '0') : parseFloat(balances?.celo || '0');
    if (parseFloat(amount) > balance) {
      setError(`Insufficient balance. Available: ${balance.toFixed(4)} ${token.toUpperCase()}`);
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Get embedded wallet
      const embeddedWallet = wallets?.find(w => 
        w.walletClientType === 'privy' || 
        w.walletClientType === 'embedded' ||
        w.connectorType === 'privy'
      );

      if (!embeddedWallet) {
        throw new Error('Wallet not found');
      }

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

      const ethereumProvider = await embeddedWallet.getEthereumProvider();
      const accounts = await ethereumProvider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No account found');
      }

      const account = accounts[0] as `0x${string}`;
      const publicClient = createPublicClient({
        chain: celoSepolia,
        transport: http(),
      });

      const walletClient = createWalletClient({
        chain: celoSepolia,
        transport: custom(ethereumProvider),
        account: account,
      });

      const amountWei = parseUnits(amount, 18);

      if (token === 'cusd') {
        // Send cUSD (ERC20 token)
        const contract = getContract({
          address: MOCK_CUSD_ADDRESS,
          abi: erc20Abi,
          client: {
            public: publicClient,
            wallet: walletClient,
          },
        });

        const txHash = await contract.write.transfer([recipientAddress as `0x${string}`, amountWei]);
        setTxHash(txHash);
        
        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        
        if (receipt.status !== 'success') {
          throw new Error('Transaction failed');
        }
      } else {
        // Send CELO (native token)
        const txHash = await walletClient.sendTransaction({
          to: recipientAddress as `0x${string}`,
          value: amountWei,
        });
        setTxHash(txHash);
        
        // Wait for confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        
        if (receipt.status !== 'success') {
          throw new Error('Transaction failed');
        }
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  const currentBalance = token === 'cusd' ? balances?.cusd || '0.0000' : balances?.celo || '0.0000';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header with gradient background */}
        <div 
          className="px-8 py-6"
          style={{
            background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
          }}
        >
          <div className="flex items-start justify-between">
          <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
              Send {token.toUpperCase()}
            </h2>
              <p className="text-sm text-white/90">
              Send funds to another wallet address
            </p>
          </div>
          <button
            onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close modal"
          >
            <svg
                className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
        {success ? (
          /* Success State */
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    Transaction successful!
                  </p>
                  {txHash && (
                    <a
                      href={`https://celo-sepolia.blockscout.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 hover:underline font-medium"
                    >
                      View on explorer →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Send Form */
          <div className="space-y-6">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Token
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setToken('cusd')}
                  className={`flex-1 px-5 py-3 rounded-xl border-2 transition-all font-medium ${
                    token === 'cusd'
                      ? 'border-blue-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                  }`}
                  style={token === 'cusd' ? {
                    background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                  } : {}}
                >
                  cUSD
                </button>
                <button
                  onClick={() => setToken('celo')}
                  className={`flex-1 px-5 py-3 rounded-xl border-2 transition-all font-medium ${
                    token === 'celo'
                      ? 'border-blue-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                  }`}
                  style={token === 'celo' ? {
                    background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                  } : {}}
                >
                  CELO
                </button>
              </div>
            </div>

            {/* Balance Display */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Available Balance</span>
                <span className="text-sm font-semibold text-gray-900">
                  {currentBalance} {token.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={loading}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amount
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={loading}
                />
                <button
                  onClick={handleMaxClick}
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Max
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex gap-3">
          {success ? (
            <button
              onClick={onClose}
              className="w-full px-5 py-3 rounded-xl font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
              }}
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={handleSend}
                disabled={loading || !recipientAddress || !amount}
                className="flex-1 px-5 py-3 rounded-xl font-semibold text-white transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: loading || !recipientAddress || !amount 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-5 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
          </div>
      </div>
    </div>
  );
}

