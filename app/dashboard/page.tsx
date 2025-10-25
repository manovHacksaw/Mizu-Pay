'use client'

import { useUser } from '@clerk/nextjs'
import { useAccount, useSignMessage } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'

function DashboardContent() {
  const { user, isLoaded } = useUser()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [isSigning, setIsSigning] = useState(false)
  const [signature, setSignature] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [savedWallets, setSavedWallets] = useState<any[]>([])
  const [loadingWallets, setLoadingWallets] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && mounted) {
      fetchSavedWallets()
    }
  }, [user, mounted])

  const fetchSavedWallets = async () => {
    try {
      setLoadingWallets(true)
      const response = await fetch('/api/wallets')
      if (response.ok) {
        const data = await response.json()
        setSavedWallets(data.wallets || [])
        console.log('Saved wallets:', data.wallets)
      } else {
        console.error('Failed to fetch wallets')
      }
    } catch (error) {
      console.error('Error fetching wallets:', error)
    } finally {
      setLoadingWallets(false)
    }
  }

  const handleSignMessage = async () => {
    if (!address || !signMessageAsync) return

    setIsSigning(true)
    setError('')

    try {
      const message = `Welcome to Mizu Pay! Please sign this message to verify wallet ownership.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`
      
      const sig = await signMessageAsync({ message })
      setSignature(sig)
      
      // Save wallet to database after successful signing
      await saveWalletToDatabase(address, sig)
    } catch (err: any) {
      console.error('Signing error:', err)
      
      // Handle specific error cases
      if (err?.message?.includes('getChainId')) {
        setError('Wallet connection issue. Please try reconnecting your wallet.')
      } else if (err?.message?.includes('User rejected')) {
        setError('Message signing was cancelled.')
      } else {
        setError('Failed to sign message. Please try again.')
      }
    } finally {
      setIsSigning(false)
    }
  }

  const saveWalletToDatabase = async (walletAddress: string, signature: string) => {
    try {
      console.log('Saving wallet to database:', { address: walletAddress, signature })
      
      const response = await fetch('/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: walletAddress,
          signature: signature,
        }),
      })

      const data = await response.json()
      console.log('Wallet save response:', data)

      if (!response.ok) {
        console.error('Failed to save wallet:', data)
        setError('Failed to save wallet to database')
      } else {
        console.log('Wallet saved successfully:', data)
        // Refresh the wallets list
        fetchSavedWallets()
      }
    } catch (error) {
      console.error('Error saving wallet:', error)
      setError('Failed to save wallet to database')
    }
  }

  if (!isLoaded || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Please sign in</h1>
          <p className="text-gray-400">You need to be signed in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 mr-4">
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="url(#paint0_linear)" />
                  <text x="16" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial">
                    M
                  </text>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00D4FF" />
                      <stop offset="1" stopColor="#0099CC" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Mizu Pay Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white">
                Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Connection Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Wallet Connection</h2>
            <div className="space-y-4">
              {isConnected ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-sm text-gray-300 mb-1">Connected Wallet</p>
                    <p className="text-white font-mono text-sm">{address}</p>
                  </div>
                  
                  <button
                    onClick={handleSignMessage}
                    disabled={isSigning}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    {isSigning ? 'Signing...' : 'Sign Message to Verify Ownership'}
                  </button>

                  {signature && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <p className="text-green-400 text-sm mb-2">Message signed successfully!</p>
                      <p className="text-green-300 font-mono text-xs break-all">{signature}</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 mb-4">Connect your wallet to get started</p>
                  <ConnectButton />
                </div>
              )}
            </div>
          </div>

          {/* Saved Wallets Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Saved Wallets</h2>
            {loadingWallets ? (
              <div className="text-center text-gray-400">Loading wallets...</div>
            ) : savedWallets.length > 0 ? (
              <div className="space-y-3">
                {savedWallets.map((wallet, index) => (
                  <div key={wallet.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-mono text-sm">{wallet.address}</p>
                        <p className="text-gray-400 text-xs">
                          {wallet.isPrimary ? 'Primary Wallet' : 'Secondary Wallet'} • 
                          Added {new Date(wallet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {wallet.isPrimary && (
                        <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full text-xs">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <p>No wallets saved yet</p>
                <p className="text-sm mt-1">Connect and sign a message to save your wallet</p>
              </div>
            )}
          </div>

          {/* User Info Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-1">Name</p>
                <p className="text-white">{user.fullName || 'Not provided'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-1">Email</p>
                <p className="text-white">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-1">User ID</p>
                <p className="text-white font-mono text-sm">{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Payments</h3>
            <p className="text-3xl font-bold text-cyan-400">0</p>
            <p className="text-gray-400 text-sm">All time</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Connected Wallets</h3>
            <p className="text-3xl font-bold text-cyan-400">{isConnected ? '1' : '0'}</p>
            <p className="text-gray-400 text-sm">Active wallets</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">ReFi Impact</h3>
            <p className="text-3xl font-bold text-cyan-400">$0</p>
            <p className="text-gray-400 text-sm">Contributed</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return <DashboardContent />
}
