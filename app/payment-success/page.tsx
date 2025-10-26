'use client'

import { useUser } from '@clerk/nextjs'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'

interface GiftCard {
  id: string
  name: string
  amount: number
  currency: string
  provider: string
  code: string
  pin?: string
}

interface PaymentData {
  id: string
  sessionId: string
  amount: number
  token: string
  status: string
  store?: string
  brand?: string
  txHash?: string
  giftCard?: GiftCard
}

export default function PaymentSuccessPage() {
  const { user, isLoaded } = useUser()
  const { address } = useAccount()
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const sessionId = searchParams.get('sessionId')
    if (sessionId) {
      fetchPaymentData(sessionId)
    } else {
      setError('No session ID provided')
      setIsLoading(false)
    }
  }, [searchParams])

  const fetchPaymentData = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payments?sessionId=${sessionId}`)
      const data = await response.json()
      
      if (data.success && data.payment) {
        setPaymentData(data.payment)
      } else {
        setError('Payment not found')
      }
    } catch (err) {
      console.error('Error fetching payment data:', err)
      setError('Failed to load payment data')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-2xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
            <p className="text-white/70">Please wait while we fetch your payment details</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
        
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
            <p className="text-white/70 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
      
      {/* Header */}
      <motion.div 
        className="flex justify-center w-full py-6 px-4 fixed top-0 left-0 right-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-4 rounded-2xl w-full max-w-7xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-white">✓</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Payment Successful</h1>
              <p className="text-xs text-white/70">Your gift card is ready</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-white font-medium text-sm">{user?.firstName || 'User'}</div>
              <div className="text-xs text-white/70">{user?.emailAddresses[0]?.emailAddress}</div>
            </div>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Header */}
        <div className="text-center mb-12">
          <motion.div
            className="inline-flex items-center space-x-2 bg-green-600/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Payment Completed Successfully</span>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            🎉 Your Gift Card is Ready!
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Your payment has been processed and your gift card is ready to use.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gift Card Details */}
          {paymentData.giftCard && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full p-8 overflow-hidden rounded-2xl bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 shadow-2xl">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">🎁</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-white">Your Gift Card</h2>
                    </div>
                    <div className="flex items-center bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                      <span className="mr-2">✅</span>
                      <span>Ready to Use</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <h3 className="text-lg font-semibold text-white mb-4">Gift Card Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/70">Name:</span>
                          <span className="text-white font-semibold">{paymentData.giftCard.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Value:</span>
                          <span className="text-white font-semibold">{paymentData.giftCard.amount} {paymentData.giftCard.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Provider:</span>
                          <span className="text-white font-semibold capitalize">{paymentData.giftCard.provider}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-900/30 rounded-xl p-6 border border-yellow-500/30">
                      <h4 className="text-lg font-semibold text-yellow-300 mb-4">🔑 Gift Card Code</h4>
                      <div className="bg-white/10 rounded-lg p-4 border border-white/20 text-center">
                        <div className="font-mono text-xl font-bold text-white tracking-wider mb-2">
                          {paymentData.giftCard.code}
                        </div>
                        <Button
                          onClick={() => copyToClipboard(paymentData.giftCard!.code)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                        >
                          Copy Code
                        </Button>
                      </div>
                      {paymentData.giftCard.pin && (
                        <div className="mt-4">
                          <h5 className="text-sm font-semibold text-yellow-300 mb-2">🔐 PIN</h5>
                          <div className="bg-white/10 rounded-lg p-4 border border-white/20 text-center">
                            <div className="font-mono text-lg font-bold text-white tracking-wider mb-2">
                              {paymentData.giftCard.pin}
                            </div>
                            <Button
                              onClick={() => copyToClipboard(paymentData.giftCard!.pin!)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                            >
                              Copy PIN
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payment Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="h-full p-8 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-white">📋</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">Payment Summary</h3>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-white/70 mb-1">Amount Paid</p>
                    <p className="text-white font-mono text-xl">
                      {paymentData.amount} {paymentData.token}
                    </p>
                  </div>
                  
                  {paymentData.store && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-white/70 mb-1">Store</p>
                      <p className="text-white">{paymentData.store}</p>
                    </div>
                  )}
                  
                  {paymentData.brand && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-white/70 mb-1">Product</p>
                      <p className="text-white">{paymentData.brand}</p>
                    </div>
                  )}
                  
                  {paymentData.txHash && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-white/70 mb-1">Transaction Hash</p>
                      <p className="text-white font-mono text-xs break-all">{paymentData.txHash}</p>
                    </div>
                  )}
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-sm text-white/70 mb-1">Session ID</p>
                    <p className="text-white font-mono text-xs">{paymentData.sessionId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-8 rounded-2xl bg-blue-900/30 border border-blue-500/30 shadow-2xl">
            <CardContent className="p-0">
              <h3 className="text-xl font-semibold text-white mb-4">How to Use Your Gift Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-blue-300 mb-3">Step 1: Visit the Store</h4>
                  <p className="text-white/70">
                    Go to {paymentData.giftCard?.provider === 'amazon' ? 'Amazon.com' : 
                    paymentData.giftCard?.provider === 'flipkart' ? 'Flipkart.com' : 
                    paymentData.giftCard?.provider || 'the store website'}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-300 mb-3">Step 2: Add Items</h4>
                  <p className="text-white/70">
                    Browse and add items to your cart up to the gift card value
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-300 mb-3">Step 3: Checkout</h4>
                  <p className="text-white/70">
                    At checkout, enter your gift card code{paymentData.giftCard?.pin ? ' and PIN' : ''}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-300 mb-3">Step 4: Complete Purchase</h4>
                  <p className="text-white/70">
                    Complete your purchase and enjoy your items!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => window.location.href = '/transactions'}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold"
            >
              View All Transactions
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
