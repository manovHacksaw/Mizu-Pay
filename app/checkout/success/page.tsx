"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { useCurrencyStore } from '@/lib/currencyStore'

interface PaymentData {
  txHash: string | null
  amountCrypto: number
  token: string
  status: string
  createdAt: string
}

interface SessionData {
  sessionId: string
  status: string
  store: string
  amountUSD: number
  createdAt: string
  expiresAt: string | null
  payment: PaymentData | null
  giftCard: {
    store: string
    currency: string
    amountUSD: number
  } | null
  wallet: {
    address: string
    type: string
  } | null
}

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const { formatAmount } = useCurrencyStore()

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    const fetchSessionData = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setSessionData(data)
        }
      } catch (error) {
        console.error('Error fetching session data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [sessionId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getExplorerUrl = (txHash: string) => {
    return `https://celo-sepolia.blockscout.com/tx/${txHash}`
  }
  
  return (
    <div className="min-h-screen page-bg relative overflow-hidden transition-colors duration-300">
      <Navbar />
      
      <div className="relative z-10 px-5 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="dashboard-modal-card text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-semibold dashboard-text-primary mb-2">Payment Initiated!</h1>
            <p className="text-sm dashboard-text-secondary mb-6">
              Your payment session has been created. We're processing your transaction on the blockchain.
            </p>
            
            {loading ? (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm dashboard-text-secondary">Loading payment details...</p>
              </div>
            ) : sessionData ? (
              <div className="mb-6 space-y-4 text-left">
                {/* Session ID */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs dashboard-text-secondary mb-1">Session ID</p>
                  <p className="text-sm font-mono dashboard-text-primary break-all">{sessionData.sessionId}</p>
                </div>

                {/* Payment Details */}
                {sessionData.payment && (
                  <>
                    {/* Transaction Hash */}
                    {sessionData.payment.txHash && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-xs dashboard-text-secondary mb-1">Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono dashboard-text-primary break-all flex-1">
                            {sessionData.payment.txHash}
                          </p>
                          <a
                            href={getExplorerUrl(sessionData.payment.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs whitespace-nowrap"
                          >
                            View on Explorer
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Payment Amount */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-xs dashboard-text-secondary mb-1">Payment Amount</p>
                      <p className="text-sm font-semibold dashboard-text-primary">
                        {formatAmount(sessionData.payment.amountCrypto, 'USD')} {sessionData.payment.token}
                      </p>
                      <p className="text-xs dashboard-text-secondary mt-1">
                        {formatAmount(sessionData.amountUSD, 'USD')} USD
                      </p>
                    </div>

                    {/* Payment Status */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-xs dashboard-text-secondary mb-1">Payment Status</p>
                      <p className="text-sm font-semibold dashboard-text-primary capitalize">
                        {sessionData.payment.status}
                      </p>
                    </div>

                    {/* Payment Date */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-xs dashboard-text-secondary mb-1">Payment Date</p>
                      <p className="text-sm dashboard-text-primary">
                        {formatDate(sessionData.payment.createdAt)}
                      </p>
                    </div>
                  </>
                )}

                {/* Store Information */}
                {sessionData.store && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs dashboard-text-secondary mb-1">Store</p>
                    <p className="text-sm font-semibold dashboard-text-primary">{sessionData.store}</p>
                  </div>
                )}

                {/* Gift Card Information */}
                {sessionData.giftCard && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs dashboard-text-secondary mb-1">Gift Card</p>
                    <p className="text-sm font-semibold dashboard-text-primary">
                      {formatAmount(sessionData.giftCard.amountUSD, 'USD')} {sessionData.giftCard.currency}
                    </p>
                  </div>
                )}

                {/* Wallet Address */}
                {sessionData.wallet && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs dashboard-text-secondary mb-1">Wallet Address</p>
                    <p className="text-sm font-mono dashboard-text-primary break-all">
                      {sessionData.wallet.address}
                    </p>
                  </div>
                )}
              </div>
            ) : sessionId ? (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs dashboard-text-secondary mb-1">Session ID</p>
                <p className="text-sm font-mono dashboard-text-primary break-all">{sessionId}</p>
              </div>
            ) : null}
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="dashboard-modal-btn-primary w-full"
              >
                View Dashboard
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="dashboard-modal-btn-secondary w-full"
              >
                Back to Home
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t dashboard-border">
              <p className="text-xs dashboard-text-secondary">
                Your payment is being verified on the blockchain. You'll receive an email notification once the gift card is ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

