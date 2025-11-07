"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, http, formatUnits, defineChain, getContract } from 'viem'
import { Navbar } from '@/components/layout/Navbar'
import { erc20Abi } from 'viem'

// MOCK_CUSD token address on Celo Sepolia testnet
const MOCK_CUSD = '0x61d11C622Bd98A71aD9361833379A2066Ad29CCa' as `0x${string}`

interface WalletBalance {
  celo: string
  cusd: string
}

interface WalletCardProps {
  wallet: any
  walletName: string
  isSelected: boolean
  onSelect: () => void
  balance?: WalletBalance
  isLoadingBalance: boolean
  onCopyAddress: () => void
  copiedAddress: boolean
}

function WalletCard({ wallet, walletName, isSelected, onSelect, balance, isLoadingBalance, onCopyAddress, copiedAddress }: WalletCardProps) {
  const shortenedAddress = wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : ''
  
  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
        isSelected 
          ? 'border-blue-500/40 bg-blue-500/5' 
          : 'border-neutral-300/20 hover:bg-blue-500/5'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium dashboard-text-primary">{walletName}</span>
            {isSelected && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">Active</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs dashboard-text-secondary font-mono">{shortenedAddress}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCopyAddress()
              }}
              className="p-1 rounded hover:opacity-70 transition-opacity shrink-0 dashboard-text-secondary"
              title="Copy address"
            >
              {copiedAddress ? (
                <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 dashboard-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Balances */}
      <div className="pt-3 border-t dashboard-border space-y-2">
        <div>
          <p className="text-xs dashboard-text-secondary mb-1">CELO Balance</p>
          {isLoadingBalance ? (
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-sm font-medium dashboard-text-primary">{balance?.celo || '0.0000'}</p>
          )}
        </div>
        <div>
          <p className="text-xs dashboard-text-secondary mb-1">cUSD Balance</p>
          {isLoadingBalance ? (
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-sm font-medium dashboard-text-primary">{balance?.cusd || '0.0000'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const { ready, authenticated, user, logout, connectWallet, createWallet } = usePrivy()
  const { wallets } = useWallets()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [showWalletChoice, setShowWalletChoice] = useState(false)
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null)
  const [walletBalances, setWalletBalances] = useState<Record<string, WalletBalance>>({})
  const [loadingBalances, setLoadingBalances] = useState<Record<string, boolean>>({})
  

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCreateEmbeddedWallet = async () => {
    if (!createWallet) {
      console.error('createWallet is not available')
      return
    }
    setIsCreating(true)
    try {
      await createWallet()
      setShowWalletChoice(false)
    } catch (error) {
      console.error('Error creating embedded wallet:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleConnectExistingWallet = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
      setShowWalletChoice(false)
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // Check if user has any wallets
 // Check if user has any wallets
const hasWallets = wallets && wallets.length > 0

// Try multiple ways to find embedded wallet
const embeddedWallet = wallets?.find(w => 
  w.walletClientType === 'privy' || 
  w.walletClientType === 'embedded' ||
  w.connectorType === 'privy'
) || (user?.wallet ? { address: user.wallet.address, walletClientType: 'privy' } : null)

const externalWallets = wallets?.filter(w => 
  w.walletClientType !== 'privy' && 
  w.walletClientType !== 'embedded' &&
  w.connectorType !== 'privy'
) || []


  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login')
    }
  }, [ready, authenticated, router])

  // Show wallet choice modal only if no embedded wallet exists
  useEffect(() => {
    if (ready && authenticated) {
      // Check if embedded wallet exists
      const hasEmbeddedWallet = wallets?.some(w => 
        w.walletClientType === 'privy' || 
        w.walletClientType === 'embedded' ||
        w.connectorType === 'privy'
      ) || (user?.wallet ? true : false)
      
      // Only show modal if no embedded wallet exists
      if (!hasEmbeddedWallet) {
        setShowWalletChoice(true)
      } else {
        setShowWalletChoice(false)
      }
    }
  }, [ready, authenticated, wallets?.length, user?.wallet?.address])

  // Set default selected wallet when wallets are available
  useEffect(() => {
    if (hasWallets && !selectedWalletAddress) {
      // Prefer embedded wallet, otherwise use first available wallet
      const defaultWallet = embeddedWallet || wallets?.[0]
      if (defaultWallet) {
        setSelectedWalletAddress(defaultWallet.address)
      }
    }
  }, [hasWallets, embeddedWallet, wallets, selectedWalletAddress])

  const handleSelectWallet = (wallet: any) => {
    setSelectedWalletAddress(wallet.address)
  }

  // Fetch wallet balances (fresh, not cached)
  const fetchWalletBalance = async (wallet: any) => {
    if (!wallet || !wallet.address) return

    setLoadingBalances(prev => ({ ...prev, [wallet.address]: true }))
    
    try {
      // Define Celo Sepolia testnet chain
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
      })

      // Create public client for Celo Sepolia
      const publicClient = createPublicClient({
        chain: celoSepolia,
        transport: http()
      })

      // Get CELO native balance
      let celoBalance = '0'
      try {
        const balance = await publicClient.getBalance({
          address: wallet.address as `0x${string}`
        })
        celoBalance = formatUnits(balance, 18)
      } catch (error) {
        console.error('Error fetching CELO balance:', error)
      }

      // Get cUSD ERC20 token balance
      let cusdBalance = '0'
      try {
        const contract = getContract({
          address: MOCK_CUSD,
          abi: erc20Abi,
          client: publicClient,
        })
        
        const balance = await contract.read.balanceOf([wallet.address as `0x${string}`])
        cusdBalance = formatUnits(balance as bigint, 18)
      } catch (error) {
        console.error('Error fetching cUSD balance:', error)
      }

      const formattedCelo = parseFloat(celoBalance).toFixed(4)
      const formattedCusd = parseFloat(cusdBalance).toFixed(4)

      setWalletBalances(prev => ({
        ...prev,
        [wallet.address]: {
          celo: formattedCelo,
          cusd: formattedCusd
        }
      }))
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      setWalletBalances(prev => ({
        ...prev,
        [wallet.address]: {
          celo: '0.0000',
          cusd: '0.0000'
        }
      }))
    } finally {
      setLoadingBalances(prev => ({ ...prev, [wallet.address]: false }))
    }
  }

  // Fetch balances for all wallets when they're available (fresh fetch)
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      wallets.forEach(wallet => {
        if (wallet.address) {
          fetchWalletBalance(wallet)
        }
      })
    }
  }, [wallets])

  if (!ready) {
    return (
      <div className="min-h-screen page-bg relative overflow-hidden transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="dashboard-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen page-bg relative overflow-hidden transition-colors duration-300">
      <Navbar showLogout={true} onLogout={handleLogout} />
      
      {/* Wallet Choice Modal - Shown for all authenticated users */}
      {showWalletChoice && authenticated && ready && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="dashboard-modal-card max-w-md w-full space-y-6">
            <div>
              <h2 className="text-2xl font-semibold dashboard-text-primary">
                Choose how you want to pay
              </h2>
            </div>

            <div className="space-y-4">
              {/* Option 1: Create embedded wallet */}
              <div className="space-y-2">
                <button
                  onClick={handleCreateEmbeddedWallet}
                  disabled={isCreating || isConnecting}
                  className="dashboard-modal-btn-primary w-full"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      Creating...
                    </span>
                  ) : (
                    'Use Mizu Pay Wallet (Recommended)'
                  )}
                </button>
                <p className="text-xs dashboard-text-secondary leading-relaxed">
                  Secure in-app wallet protected by Privy. No setup needed. Best for users new to crypto.
                </p>
              </div>

              {/* Divider */}
              <div className="dashboard-modal-divider">
                <div className="dashboard-modal-divider-line"></div>
                <span className="dashboard-modal-divider-text">Or</span>
                <div className="dashboard-modal-divider-line"></div>
              </div>

              {/* Option 2: Connect external wallet */}
              <div className="space-y-2">
                <button
                  onClick={handleConnectExistingWallet}
                  disabled={isConnecting || isCreating}
                  className="dashboard-modal-btn-secondary w-full"
                >
                  {isConnecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin text-blue-900 rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      Connecting...
                    </span>
                  ) : (
                    'Connect Your Existing Wallet'
                  )}
                </button>
                <p className="text-xs dashboard-text-secondary leading-relaxed">
                  Use MetaMask, Coinbase Wallet, or WalletConnect if you already have a crypto wallet.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative z-10 px-5 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold dashboard-text-primary mb-2">Dashboard</h1>
            {user?.email && (
              <p className="text-sm dashboard-text-secondary">{user.email.address}</p>
            )}
          </div>

          {/* Wallet Selection Section */}
          {hasWallets && (
            <div className="space-y-4">
              {/* Mizu Pay Wallet Section */}
              {embeddedWallet && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium dashboard-text-primary mb-2">
                      Mizu Pay Wallet (Recommended)
                    </h2>
                    <p className="text-sm dashboard-text-secondary">
                      Embedded wallet generated and secured through Privy. Ideal for users new to crypto or those who want a seamless checkout.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WalletCard
                      wallet={embeddedWallet}
                      walletName="Mizu Pay Wallet"
                      isSelected={selectedWalletAddress === embeddedWallet.address}
                      onSelect={() => handleSelectWallet(embeddedWallet)}
                      balance={walletBalances[embeddedWallet.address]}
                      isLoadingBalance={loadingBalances[embeddedWallet.address]}
                      onCopyAddress={() => copyToClipboard(embeddedWallet.address)}
                      copiedAddress={copiedAddress}
                    />
                  </div>
                </div>
              )}

              {/* External Wallets Section */}
              {externalWallets.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-medium dashboard-text-primary mb-2">
                      External Wallet
                    </h2>
                    <p className="text-sm dashboard-text-secondary">
                      A self-custodied wallet you already control. Use this if you manage your own crypto or want to transact manually.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {externalWallets.map((wallet, index) => {
                      const walletName = wallet.walletClientType === 'metamask' ? 'MetaMask' : 
                                       wallet.walletClientType === 'coinbase_wallet' ? 'Coinbase Wallet' :
                                       wallet.walletClientType === 'wallet_connect' ? 'WalletConnect' :
                                       'External Wallet'
                      return (
                        <WalletCard
                          key={index}
                          wallet={wallet}
                          walletName={walletName}
                          isSelected={selectedWalletAddress === wallet.address}
                          onSelect={() => handleSelectWallet(wallet)}
                          balance={walletBalances[wallet.address]}
                          isLoadingBalance={loadingBalances[wallet.address]}
                          onCopyAddress={() => copyToClipboard(wallet.address)}
                          copiedAddress={copiedAddress}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

