"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Navbar } from '@/components/layout/Navbar'
import { Waves } from '@/components/decorative/Waves'
import { Watermark } from '@/components/decorative/Watermark'
import { LightStreaks } from '@/components/decorative/LightStreaks'

export default function Dashboard() {
  const router = useRouter()
  const { ready, authenticated, user, logout, connectWallet, createWallet } = usePrivy()
  const { wallets } = useWallets()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [showWalletChoice, setShowWalletChoice] = useState(true)
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null)


  

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

  // Close modal when wallets are detected
  useEffect(() => {
    if (hasWallets && showWalletChoice) {
      setShowWalletChoice(false)
    }
  }, [hasWallets, showWalletChoice])

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

  if (!ready) {
    return (
      <div className="min-h-screen hero-bg relative overflow-hidden text-primary transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen hero-bg relative overflow-hidden text-primary transition-colors duration-300">
      <LightStreaks />
      <Waves />
      <Watermark />
      <Navbar />
      
      {/* Wallet Choice Modal */}
      {showWalletChoice && !hasWallets && authenticated && ready && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/10 border border-white/20 p-8 rounded-2xl w-full max-w-md space-y-6 text-center mx-4">
            <h2 className="text-2xl font-semibold text-primary">Choose How You Want to Pay</h2>

            <div className="space-y-4">
              {/* Option 1: Create embedded wallet */}
              <button
                onClick={handleCreateEmbeddedWallet}
                disabled={isCreating}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-primary px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Creating Wallet...</span>
                  </>
                ) : (
                  <span>Create Mizu Pay Wallet (Recommended)</span>
                )}
              </button>

              <p className="text-xs text-secondary leading-relaxed">
                No setup needed. Safe and secure. Best for users who are new to crypto or just want to pay quickly.
              </p>

              {/* Option 2: Connect external wallet */}
              <button
                onClick={handleConnectExistingWallet}
                disabled={isConnecting}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-primary px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>I Already Have a Crypto Wallet</span>
                )}
              </button>

              <p className="text-xs text-secondary leading-relaxed">
                Connect MetaMask, Coinbase Wallet, or WalletConnect compatible wallets.
              </p>
            </div>

            <button
              onClick={() => setShowWalletChoice(false)}
              className="text-sm text-secondary underline mt-4 hover:text-primary transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
      
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-5 py-20">
        <div className="w-full max-w-2xl">
          {/* Success Card */}
          <div className="backdrop-blur-md bg-white/10 dark:bg-gray-800/30 border border-white/30 dark:border-gray-700/40 rounded-2xl p-8 md:p-10 shadow-2xl">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg 
                  className="w-12 h-12 text-green-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                You're Logged In! 🎉
              </h1>
              <p className="text-secondary text-sm md:text-base">
            Welcome to Mizu Pay. You're all set to start making purchases with crypto.
              </p>
            </div>

            {/* User Info */}
            {user && (
              <div className="mb-8 p-6 rounded-lg bg-white/5 dark:bg-gray-700/20 border border-white/10 dark:border-gray-600/20">
                <h2 className="text-lg font-semibold text-primary mb-4">Account Information</h2>
                <div className="space-y-3">
                  {user.email && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <div>
                        <p className="text-xs text-secondary">Email</p>
                        <p className="text-sm font-medium text-primary">{user.email.address}</p>
                      </div>
                    </div>
                  )}
                  {embeddedWallet && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-xs text-secondary mb-1">Embedded Wallet Address</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-base font-semibold text-primary font-mono break-all">
                            {embeddedWallet.address}
                          </p>
                          <button
                            onClick={() => copyToClipboard(embeddedWallet.address)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                            title="Copy address"
                          >
                            {copiedAddress ? (
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selected Wallet Display */}
            {selectedWalletAddress && hasWallets && (
              <div className="mb-6 p-6 rounded-lg bg-blue-500/10 border border-blue-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-primary">Active Payment Wallet</h2>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/30 text-blue-300 font-medium">Active</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary mb-1">
                      {selectedWalletAddress === embeddedWallet?.address ? 'Mizu Pay Wallet' : 
                       externalWallets.find(w => w.address === selectedWalletAddress)?.walletClientType === 'metamask' ? 'MetaMask' :
                       externalWallets.find(w => w.address === selectedWalletAddress)?.walletClientType === 'coinbase_wallet' ? 'Coinbase Wallet' :
                       externalWallets.find(w => w.address === selectedWalletAddress)?.walletClientType === 'wallet_connect' ? 'WalletConnect' :
                       'External Wallet'}
                    </p>
                    <p className="text-base font-mono text-primary break-all">
                      {selectedWalletAddress}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedWalletAddress)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                    title="Copy address"
                  >
                    {copiedAddress ? (
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Wallet Section */}
            <div className="mb-8 p-6 rounded-lg bg-white/5 dark:bg-gray-700/20 border border-white/10 dark:border-gray-600/20">
              <h2 className="text-lg font-semibold text-primary mb-4">Select Payment Wallet</h2>
              
              {hasWallets ? (
                <div className="space-y-3">
                  {/* Embedded Wallet */}
                  {embeddedWallet && (
                    <div
                      onClick={() => handleSelectWallet(embeddedWallet)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelectWallet(embeddedWallet)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`w-full p-4 rounded-lg border transition-all text-left cursor-pointer ${
                        selectedWalletAddress === embeddedWallet.address
                          ? 'bg-blue-500/20 border-blue-500/40 shadow-lg'
                          : 'bg-white/5 dark:bg-gray-700/10 border-white/10 dark:border-gray-600/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-sm font-medium text-primary">Mizu Pay Wallet</span>
                        </div>
                        {selectedWalletAddress === embeddedWallet.address ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-300 font-medium">Selected</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-secondary">Click to select</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-secondary font-mono break-all flex-1">
                          {embeddedWallet.address}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(embeddedWallet.address)
                          }}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
                          title="Copy address"
                        >
                          {copiedAddress ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* External Wallets */}
                  {externalWallets.map((wallet, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectWallet(wallet)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelectWallet(wallet)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`w-full p-4 rounded-lg border transition-all text-left cursor-pointer ${
                        selectedWalletAddress === wallet.address
                          ? 'bg-blue-500/20 border-blue-500/40 shadow-lg'
                          : 'bg-white/5 dark:bg-gray-700/10 border-white/10 dark:border-gray-600/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                          <span className="text-sm font-medium text-primary">
                            {wallet.walletClientType === 'metamask' ? 'MetaMask' : 
                             wallet.walletClientType === 'coinbase_wallet' ? 'Coinbase Wallet' :
                             wallet.walletClientType === 'wallet_connect' ? 'WalletConnect' :
                             'External Wallet'}
                          </span>
                        </div>
                        {selectedWalletAddress === wallet.address ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/30 text-blue-300 font-medium">Selected</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-secondary">Click to select</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-secondary font-mono break-all flex-1">
                          {wallet.address}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(wallet.address)
                          }}
                          className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0"
                          title="Copy address"
                        >
                          {copiedAddress ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Create Embedded Wallet Button - Always visible if user doesn't have one */}
                  {!embeddedWallet && (
                    <button
                      onClick={handleCreateEmbeddedWallet}
                      disabled={isCreating || !createWallet}
                      className="w-full p-4 rounded-lg border-2 border-dashed border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <span className="text-sm font-medium text-primary">Create Mizu Pay Wallet</span>
                        </div>
                        {isCreating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-secondary mt-1">
                        {isCreating ? 'Creating your wallet...' : 'No setup needed. Safe and secure.'}
                      </p>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg 
                      className="w-8 h-8 text-blue-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                      />
                    </svg>
                  </div>
                  <p className="text-secondary text-sm mb-4">No wallet connected</p>
                  <button
                    onClick={handleCreateEmbeddedWallet}
                    disabled={isCreating || !createWallet}
                    className="btn-primary px-6 py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-4"
                  >
                    {isCreating ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Creating Wallet...
                      </span>
                    ) : (
                      'Create Mizu Pay Wallet'
                    )}
                  </button>
                </div>
              )}

              {/* Wallet Actions */}
              <div className="mt-6 space-y-3">
                {!embeddedWallet && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-secondary mb-2">
                      💡 Embedded wallets are created automatically when you log in. If you don't see one, try logging out and back in.
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="btn-primary w-full px-6 py-3 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Connect External Wallet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button 
                onClick={() => router.push('/')}
                className="btn-primary w-full px-6 py-3.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl"
              >
                Go to Homepage
              </button>
              <button 
                onClick={handleLogout}
                className="btn-secondary w-full px-6 py-3.5 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 border"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

