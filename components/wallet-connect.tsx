'use client'

import { useAccount, useSignMessage } from 'wagmi'
import { WalletConnectButton } from '@/components/ui/wallet-connect-button'
import { useState, useEffect } from 'react'
import { SiweMessage } from 'siwe'

interface WalletConnectProps {
  onWalletConnected?: (address: string, signature: string) => void
}

export default function WalletConnect({ onWalletConnected }: WalletConnectProps) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [isSigning, setIsSigning] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  const handleSignIn = async () => {
    if (!address) return

    setIsSigning(true)
    setError('')

    try {
      // Create SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in to Mizu Pay to connect your wallet',
        uri: window.location.origin,
        version: '1',
        chainId: 42220, // Celo mainnet
        nonce: Math.random().toString(36).substring(2, 15),
      })

      const message = siweMessage.prepareMessage()
      console.log('SIWE message:', message)
      
      // Sign the message
      const signature = await signMessageAsync({ message })
      
      // Send to our API to verify and store
      console.log('Sending request to API...')
      const response = await fetch('/api/wallets/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          message,
          signature,
        }),
      })

      console.log('API response status:', response.status)
      
      if (response.ok) {
        const wallet = await response.json()
        console.log('Wallet connected successfully:', wallet)
        onWalletConnected?.(address, signature)
        setError('')
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
        setError(errorData.error || 'Failed to connect wallet')
      }
    } catch (err) {
      console.error('Error signing message:', err)
      setError('Failed to sign message')
    } finally {
      setIsSigning(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please sign in to connect your wallet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-gray-600">
          Connect your wallet and sign a message to prove ownership
        </p>
      </div>

      <div className="flex justify-center">
        <WalletConnectButton />
      </div>

      {isConnected && address && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Connected Wallet:</p>
            <p className="font-mono text-sm text-gray-900">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isSigning}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSigning ? 'Signing Message...' : 'Sign Message & Connect Wallet'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
