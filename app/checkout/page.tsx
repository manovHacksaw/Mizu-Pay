"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, http, formatUnits, defineChain, getContract } from 'viem'
import { erc20Abi } from 'viem'
import { Navbar } from '@/components/layout/Navbar'
import { syncUserToDatabase, extractWalletData } from '@/lib/syncUser'

// MOCK_CUSD token address on Celo Sepolia testnet
const MOCK_CUSD = '0x61d11C622Bd98A71aD9361833379A2066Ad29CCa' as `0x${string}`

interface GiftCardOption {
  id: string
  amountMinor: number
  amountUSD: number
  validityDays: number
}

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
}

function WalletCard({ wallet, walletName, isSelected, onSelect, balance, isLoadingBalance }: WalletCardProps) {
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
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">Selected</span>
            )}
          </div>
          <p className="text-xs dashboard-text-secondary font-mono">{shortenedAddress}</p>
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

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  
  // Query params from extension
  const storeNameParam = searchParams.get('storeName')
  const amountParam = searchParams.get('amount')
  const currencyParam = searchParams.get('currency')
  const merchantUrl = searchParams.get('url') || ''
  
  // Check if we have required params
  const hasRequiredParams = storeNameParam && amountParam && currencyParam
  
  // State
  const [giftCardOptions, setGiftCardOptions] = useState<GiftCardOption[]>([])
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCardOption | null>(null)
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null)
  const [walletBalances, setWalletBalances] = useState<Record<string, WalletBalance>>({})
  const [loadingBalances, setLoadingBalances] = useState<Record<string, boolean>>({})
  const [isLoadingGiftCards, setIsLoadingGiftCards] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // For testing/demo: allow manual entry if params missing
  const [demoMode, setDemoMode] = useState(!hasRequiredParams)
  const [demoStoreName, setDemoStoreName] = useState(storeNameParam || 'Amazon')
  const [demoAmount, setDemoAmount] = useState(amountParam || '5.00')
  const [demoCurrency, setDemoCurrency] = useState(currencyParam || 'INR')
  
  // Use demo values or actual params
  const storeName = storeNameParam || demoStoreName
  const amount = amountParam || demoAmount
  const currency = currencyParam || demoCurrency
  
  // Check authentication
  useEffect(() => {
    if (ready && !authenticated) {
      // Redirect to login with return URL
      const returnUrl = `/checkout?${searchParams.toString()}`
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
    }
  }, [ready, authenticated, router, searchParams])
  
  // Fetch gift card options
  useEffect(() => {
    if (!ready || !authenticated) return
    if (!hasRequiredParams && !demoMode) return // Don't fetch if no params and not in demo mode
    
    const fetchGiftCards = async () => {
      setIsLoadingGiftCards(true)
      setError(null)
      
      try {
        // API expects amount in dollars (it will convert to minor units internally)
        const amountValue = parseFloat(amount) || 0
        
        if (amountValue <= 0) {
          throw new Error('Invalid amount. Please enter a valid amount.')
        }
        
        const response = await fetch(
          `/api/gift-cards/options?store=${encodeURIComponent(storeName)}&currency=${encodeURIComponent(currency)}&amount=${amountValue}`
        )
        
        if (!response.ok) {
          // Try to get error message from response
          let errorMessage = 'Failed to fetch gift card options'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            // If response is not JSON, use status text
            errorMessage = `Failed to fetch gift card options: ${response.statusText || response.status}`
          }
          throw new Error(errorMessage)
        }
        
        const data = await response.json()
        
        if (data.giftCards && data.giftCards.length > 0) {
          setGiftCardOptions(data.giftCards)
          // Auto-select the first (smallest matching) gift card
          setSelectedGiftCard(data.giftCards[0])
        } else {
          setError('No matching gift cards available for this purchase')
        }
      } catch (err: any) {
        console.error('Error fetching gift cards:', err)
        setError(err.message || 'Failed to load gift card options')
      } finally {
        setIsLoadingGiftCards(false)
      }
    }
    
    fetchGiftCards()
  }, [ready, authenticated, storeName, currency, amount, hasRequiredParams, demoMode])
  
  // Set default wallet when wallets are available
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWalletAddress) {
      // Prefer embedded wallet, otherwise use first available wallet
      const embeddedWallet = wallets.find(w => 
        w.walletClientType === 'privy' || 
        w.walletClientType === 'embedded' ||
        w.connectorType === 'privy'
      ) || wallets[0]
      
      if (embeddedWallet) {
        setSelectedWalletAddress(embeddedWallet.address)
        
        // Sync default wallet selection
        if (user?.id) {
          syncUserToDatabase({
            privyUserId: user.id,
            email: user.email?.address || null,
            wallets: extractWalletData(wallets),
            activeWalletAddress: embeddedWallet.address,
          })
        }
      }
    }
  }, [wallets, selectedWalletAddress, user?.id, user?.email?.address])
  
  // Sync user and wallets to database on checkout page load
  useEffect(() => {
    if (!ready || !authenticated || !user?.id) return

    const syncUser = async () => {
      try {
        const walletData = wallets ? extractWalletData(wallets) : []
        await syncUserToDatabase({
          privyUserId: user.id,
          email: user.email?.address || null,
          wallets: walletData,
          activeWalletAddress: selectedWalletAddress,
        })
      } catch (error) {
        console.error('Error syncing user on checkout:', error)
      }
    }

    syncUser()
  }, [ready, authenticated, user?.id, user?.email?.address, wallets?.length, selectedWalletAddress])
  
  // Fetch wallet balances
  useEffect(() => {
    if (!wallets || wallets.length === 0) return
    
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
    
    wallets.forEach(wallet => {
      if (wallet.address) {
        fetchWalletBalance(wallet)
      }
    })
  }, [wallets])
  
  const handleSelectWallet = async (wallet: any) => {
    setSelectedWalletAddress(wallet.address)
    
    // Sync active wallet selection to database
    if (user?.id && wallet.address) {
      await syncUserToDatabase({
        privyUserId: user.id,
        email: user.email?.address || null,
        wallets: wallets ? extractWalletData(wallets) : [],
        activeWalletAddress: wallet.address,
      })
    }
  }
  
  const handlePay = async () => {
    if (!selectedGiftCard || !selectedWalletAddress) {
      setError('Please select a wallet and gift card')
      return
    }
    
    setIsCreatingSession(true)
    setError(null)
    
    try {
      // Create payment session
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          giftCardId: selectedGiftCard.id,
          walletAddress: selectedWalletAddress,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment session')
      }
      
      const data = await response.json()
      
      // TODO: Initiate blockchain payment transaction
      // For now, redirect to a success page or show success message
      router.push(`/checkout/success?sessionId=${data.sessionId}`)
      
    } catch (err: any) {
      console.error('Error creating session:', err)
      setError(err.message || 'Failed to process payment')
    } finally {
      setIsCreatingSession(false)
    }
  }
  
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
  
  const hasWallets = wallets && wallets.length > 0
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
  
  const originalAmount = parseFloat(amount) || 0
  const finalAmount = selectedGiftCard ? selectedGiftCard.amountUSD : originalAmount
  const amountDifference = finalAmount - originalAmount
  
  return (
    <div className="min-h-screen page-bg relative overflow-hidden transition-colors duration-300">
      <Navbar />
      
      <div className="relative z-10 px-5 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold dashboard-text-primary mb-2">Complete Your Purchase</h1>
            <p className="text-sm dashboard-text-secondary">Pay securely with crypto</p>
          </div>
          
          {/* Demo Mode Notice */}
          {demoMode && !hasRequiredParams && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Demo Mode - No checkout parameters detected
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                    Enter checkout details manually or use the browser extension to initiate a payment.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={demoStoreName}
                        onChange={(e) => setDemoStoreName(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="e.g., Amazon"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={demoAmount}
                        onChange={(e) => setDemoAmount(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="5.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Currency
                      </label>
                      <select
                        value={demoCurrency}
                        onChange={(e) => setDemoCurrency(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      // Validate inputs
                      const amountValue = parseFloat(demoAmount) || 0
                      if (amountValue <= 0) {
                        setError('Please enter a valid amount')
                        return
                      }
                      if (!demoStoreName.trim()) {
                        setError('Please enter a store name')
                        return
                      }
                      
                      setDemoMode(false)
                      setError(null)
                      setIsLoadingGiftCards(true)
                      
                      // Trigger fetch by updating the effect dependencies
                      // The useEffect will run because demoMode changed
                      try {
                        const response = await fetch(
                          `/api/gift-cards/options?store=${encodeURIComponent(demoStoreName)}&currency=${encodeURIComponent(demoCurrency)}&amount=${amountValue}`
                        )
                        
                        if (!response.ok) {
                          let errorMessage = 'Failed to fetch gift card options'
                          try {
                            const errorData = await response.json()
                            errorMessage = errorData.error || errorMessage
                          } catch {
                            errorMessage = `Failed to fetch gift card options: ${response.statusText || response.status}`
                          }
                          throw new Error(errorMessage)
                        }
                        
                        const data = await response.json()
                        
                        if (data.giftCards && data.giftCards.length > 0) {
                          setGiftCardOptions(data.giftCards)
                          setSelectedGiftCard(data.giftCards[0])
                        } else {
                          setError('No matching gift cards available for this purchase')
                        }
                      } catch (err: any) {
                        console.error('Error fetching gift cards:', err)
                        setError(err.message || 'Failed to load gift card options')
                        setDemoMode(true) // Re-enable demo mode on error
                      } finally {
                        setIsLoadingGiftCards(false)
                      }
                    }}
                    className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Load Gift Cards
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Checkout Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <div className="dashboard-modal-card">
                <h2 className="text-lg font-semibold dashboard-text-primary mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm dashboard-text-secondary">Store</span>
                    <span className="text-sm font-medium dashboard-text-primary">{storeName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm dashboard-text-secondary">Original Amount</span>
                    <span className="text-sm font-medium dashboard-text-primary">
                      {currency} {originalAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  {isLoadingGiftCards ? (
                    <div className="py-4">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ) : selectedGiftCard ? (
                    <>
                      {amountDifference > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t dashboard-border">
                          <span className="text-sm dashboard-text-secondary">Gift Card Adjustment</span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            +{currency} {amountDifference.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-2 border-t dashboard-border">
                        <span className="text-base font-semibold dashboard-text-primary">Final Amount</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {currency} {finalAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs dashboard-text-secondary">
                          {amountDifference > 0 
                            ? `You'll pay ${currency} ${amountDifference.toFixed(2)} more to match the nearest gift card value. The extra amount will be available as gift card balance.`
                            : 'Gift card value matches your order amount exactly.'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="py-4">
                      <p className="text-sm dashboard-text-secondary">No gift cards available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Wallet Selection */}
              {hasWallets && (
                <div className="dashboard-modal-card">
                  <h2 className="text-lg font-semibold dashboard-text-primary mb-4">Select Payment Method</h2>
                  
                  <div className="space-y-4">
                    {/* Embedded Wallet */}
                    {embeddedWallet && (
                      <div>
                        <h3 className="text-sm font-medium dashboard-text-secondary mb-2">Mizu Pay Wallet</h3>
                        <WalletCard
                          wallet={embeddedWallet}
                          walletName="Mizu Pay Wallet"
                          isSelected={selectedWalletAddress === embeddedWallet.address}
                          onSelect={() => handleSelectWallet(embeddedWallet)}
                          balance={walletBalances[embeddedWallet.address]}
                          isLoadingBalance={loadingBalances[embeddedWallet.address]}
                        />
                      </div>
                    )}
                    
                    {/* External Wallets */}
                    {externalWallets.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium dashboard-text-secondary mb-2">External Wallets</h3>
                        <div className="space-y-3">
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
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {!hasWallets && (
                <div className="dashboard-modal-card">
                  <p className="text-sm dashboard-text-secondary mb-4">
                    No wallets available. Please connect a wallet first.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="dashboard-modal-btn-primary"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
            
            {/* Right Column: Payment Summary & Action */}
            <div className="lg:col-span-1">
              <div className="dashboard-modal-card sticky top-4">
                <h2 className="text-lg font-semibold dashboard-text-primary mb-4">Payment Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm dashboard-text-secondary">Subtotal</span>
                    <span className="text-sm dashboard-text-primary">{currency} {originalAmount.toFixed(2)}</span>
                  </div>
                  
                  {selectedGiftCard && amountDifference > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm dashboard-text-secondary">Gift Card Adjustment</span>
                      <span className="text-sm dashboard-text-primary">+{currency} {amountDifference.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t dashboard-border">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold dashboard-text-primary">Total</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {currency} {finalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handlePay}
                  disabled={!selectedGiftCard || !selectedWalletAddress || isCreatingSession || isLoadingGiftCards}
                  className="dashboard-modal-btn-primary w-full"
                >
                  {isCreatingSession ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      Processing...
                    </span>
                  ) : (
                    'Pay Now'
                  )}
                </button>
                
                {merchantUrl && (
                  <button
                    onClick={() => window.open(merchantUrl, '_blank')}
                    className="dashboard-modal-btn-secondary w-full mt-3"
                  >
                    Back to Store
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

