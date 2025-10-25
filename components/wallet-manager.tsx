'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import WalletConnect from './wallet-connect'

interface Wallet {
  id: string
  address: string
  isPrimary: boolean
  createdAt: string
}

export default function WalletManager() {
  const { user } = useUser()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConnect, setShowConnect] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWallets()
    }
  }, [user])

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallets')
      if (response.ok) {
        const data = await response.json()
        setWallets(data)
      }
    } catch (error) {
      console.error('Error fetching wallets:', error)
    }
  }

  const handleWalletConnected = (address: string, signature: string) => {
    // Refresh wallets list
    fetchWallets()
    setShowConnect(false)
  }

  const setPrimaryWallet = async (walletId: string) => {
    try {
      const response = await fetch(`/api/wallets/${walletId}/primary`, {
        method: 'PUT',
      })

      if (response.ok) {
        // Update local state
        setWallets(wallets.map(wallet => ({
          ...wallet,
          isPrimary: wallet.id === walletId
        })))
      }
    } catch (error) {
      console.error('Error setting primary wallet:', error)
    }
  }

  const removeWallet = async (walletId: string) => {
    if (!confirm('Are you sure you want to remove this wallet?')) return

    try {
      const response = await fetch(`/api/wallets/${walletId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setWallets(wallets.filter(wallet => wallet.id !== walletId))
      }
    } catch (error) {
      console.error('Error removing wallet:', error)
    }
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Wallet Management</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Connect your wallets by signing a message to prove ownership
        </p>
      </div>

      <div className="border-t border-gray-200">
        {/* Connect New Wallet */}
        <div className="px-4 py-5 sm:px-6">
          {!showConnect ? (
            <button
              onClick={() => setShowConnect(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Connect New Wallet
            </button>
          ) : (
            <div className="space-y-4">
              <WalletConnect onWalletConnected={handleWalletConnected} />
              <button
                onClick={() => setShowConnect(false)}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Wallet List */}
        <div className="px-4 py-5 sm:px-6">
          {wallets.length > 0 ? (
            <ul className="space-y-3">
              {wallets.map((wallet) => (
                <li key={wallet.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        wallet.isPrimary ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          wallet.isPrimary ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {wallet.isPrimary ? '★' : '●'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 font-mono">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {wallet.isPrimary ? 'Primary wallet' : 'Secondary wallet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!wallet.isPrimary && (
                      <button
                        onClick={() => setPrimaryWallet(wallet.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => removeWallet(wallet.id)}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No wallets connected yet</p>
              <p className="text-sm text-gray-400 mt-1">Add your first wallet above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
