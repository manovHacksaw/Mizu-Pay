'use client'

import { useUser } from '@clerk/nextjs'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES, MIZU_PAY_ABI, MOCK_CUSD_ABI } from '@/lib/contracts'

export default function PaymentPage() {
  const { user, isLoaded } = useUser()
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const [formData, setFormData] = useState({
    amount: '',
    token: 'CUSD',
    store: '',
    brand: '',
    giftCardCode: ''
  })
  const [sessionId, setSessionId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isFromExtension, setIsFromExtension] = useState(false)

  // Generate session ID on component mount and parse URL parameters
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    
    // Parse URL parameters from browser extension
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const store = urlParams.get('store')
      const amount = urlParams.get('amount')
      const country = urlParams.get('country')
      const description = urlParams.get('description')
      const source = urlParams.get('source')
      
      if (source === 'browser-extension' && (store || amount)) {
        setIsFromExtension(true)
        setFormData(prev => ({
          ...prev,
          amount: amount || prev.amount,
          store: store || prev.store,
          brand: description || prev.brand,
        }))
        
        // Show a notification that data was pre-filled from extension
        setPaymentStatus('Payment details loaded from browser extension')
        setTimeout(() => setPaymentStatus(''), 3000)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePayment = async () => {
    if (!isConnected || !address) {
      setErrorMessage('Please connect your wallet first')
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMessage('Please enter a valid amount')
      return
    }

    setIsProcessing(true)
    setErrorMessage('')
    setPaymentStatus('Processing payment...')

    try {
      // First, save payment to database
      const paymentData = {
        sessionId,
        amount: parseFloat(formData.amount),
        token: formData.token,
        store: formData.store || null,
        brand: formData.brand || null,
        giftCardCode: formData.giftCardCode || null,
        status: 'PENDING'
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error('Failed to save payment to database')
      }

      const savedPayment = await response.json()
      console.log('Payment saved to database:', savedPayment)

      // Now process the smart contract payment
      const amount = parseEther(formData.amount)
      
      if (formData.token === 'CUSD') {
        // For CUSD payments, we need to approve and then call payWithCUSD
        setPaymentStatus('Approving CUSD transfer...')
        
        // First approve the contract to spend CUSD
        await writeContract({
          address: CONTRACT_ADDRESSES.MOCK_CUSD,
          abi: MOCK_CUSD_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.MIZU_PAY, amount],
        })
        
        // Wait a bit for approval to be mined
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setPaymentStatus('Processing CUSD payment...')
        
        // Then call payWithCUSD
        await writeContract({
          address: CONTRACT_ADDRESSES.MIZU_PAY,
          abi: MIZU_PAY_ABI,
          functionName: 'payWithCUSD',
          args: [amount, sessionId],
        })
      } else {
        // For CELO payments, send CELO directly
        setPaymentStatus('Processing CELO payment...')
        
        await writeContract({
          address: CONTRACT_ADDRESSES.MIZU_PAY,
          abi: MIZU_PAY_ABI,
          functionName: 'payWithCELO',
          args: [sessionId],
          value: amount,
        })
      }

    } catch (err: any) {
      console.error('Payment error:', err)
      setErrorMessage(err.message || 'Payment failed')
      setPaymentStatus('')
    } finally {
      setIsProcessing(false)
    }
  }

  // Update payment status when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash) {
      setPaymentStatus('Payment successful!')
      
      // Update payment status in database
      fetch('/api/payments/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          status: 'COMPLETED',
          txHash: hash
        }),
      }).catch(console.error)
    }
  }, [isSuccess, hash, sessionId])

  if (!isLoaded) {
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
          <p className="text-gray-400">You need to be signed in to make payments.</p>
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
              <h1 className="text-2xl font-bold text-white">Mizu Pay - Make Payment</h1>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Payment Details</h2>
            {isFromExtension && (
              <div className="flex items-center bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
                <span className="mr-2">🔗</span>
                From Browser Extension
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token
                </label>
                <select
                  name="token"
                  value={formData.token}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="CUSD">CUSD</option>
                  <option value="CELO">CELO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Store (Optional)
                </label>
                <input
                  type="text"
                  name="store"
                  value={formData.store}
                  onChange={handleInputChange}
                  placeholder="Store name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Brand name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gift Card Code (Optional)
                </label>
                <input
                  type="text"
                  name="giftCardCode"
                  value={formData.giftCardCode}
                  onChange={handleInputChange}
                  placeholder="Gift card code"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount:</span>
                    <span className="text-white font-mono">
                      {formData.amount || '0'} {formData.token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Token:</span>
                    <span className="text-white">{formData.token}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Session ID:</span>
                    <span className="text-white font-mono text-sm">{sessionId}</span>
                  </div>
                  {formData.store && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Store:</span>
                      <span className="text-white">{formData.store}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet Connection Status */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Wallet Status</h3>
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Connected
                    </div>
                    <div className="text-sm text-gray-300 font-mono">
                      {address}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center text-yellow-400 mb-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      Not Connected
                    </div>
                    <ConnectButton />
                  </div>
                )}
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={!isConnected || isProcessing || isPending || isConfirming}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200"
              >
                {isProcessing || isPending || isConfirming ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {paymentStatus || 'Processing...'}
                  </div>
                ) : (
                  `Pay ${formData.amount || '0'} ${formData.token}`
                )}
              </button>

              {/* Status Messages */}
              {paymentStatus && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-400 text-sm">{paymentStatus}</p>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">Transaction failed: {error.message}</p>
                </div>
              )}

              {isSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-green-400 text-sm">Payment completed successfully!</p>
                  <p className="text-green-300 text-xs font-mono mt-1">Tx: {hash}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
