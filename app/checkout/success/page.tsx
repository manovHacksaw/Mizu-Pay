"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { useCurrencyStore } from '@/lib/currencyStore'

interface PaymentData {
  txHash: string | null
  amountCrypto: number
  token: string
  status: 'pending' | 'confirming' | 'succeeded' | 'email_failed' | 'failed'
  createdAt: string
}

interface SessionData {
  sessionId: string
  status: 'pending' | 'processing' | 'paid' | 'email_failed' | 'fulfilled' | 'expired' | 'failed'
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

      
      <div className="relative z-10 px-5 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="dashboard-modal-card text-center">
            {/* Status Icon */}
            <div className="mb-6 flex justify-center">
              {sessionData?.status === 'fulfilled' ? (
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : sessionData?.status === 'email_failed' ? (
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-semibold dashboard-text-primary mb-2">
              {sessionData?.status === 'fulfilled' 
                ? 'Payment Successful!' 
                : sessionData?.status === 'email_failed'
                ? 'Payment Verified, Email Failed'
                : 'Payment Processing...'}
            </h1>
            <p className="text-sm dashboard-text-secondary mb-6">
              {sessionData?.status === 'fulfilled'
                ? 'Your payment has been verified and your gift card has been sent to your email!'
                : sessionData?.status === 'email_failed'
                ? 'Your payment was verified, but we couldn\'t send the email. Please contact support to receive your gift card.'
                : 'Your payment session has been created. We\'re processing your transaction on the blockchain.'}
            </p>
            
            {loading ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm dashboard-text-secondary">Loading payment details...</p>
              </div>
            ) : sessionData ? (
              <div className="mb-6 space-y-4 text-left">
                {/* Session ID */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs dashboard-text-secondary mb-1">Session ID</p>
                  <p className="text-sm font-mono dashboard-text-primary break-all">{sessionData.sessionId}</p>
                </div>

                {/* Payment Details */}
                {sessionData.payment && (
                  <>
                    {/* Transaction Hash */}
                    {sessionData.payment.txHash && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs dashboard-text-secondary mb-1">Transaction Hash</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono dashboard-text-primary break-all flex-1">
                            {sessionData.payment.txHash}
                          </p>
                          <a
                            href={getExplorerUrl(sessionData.payment.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs whitespace-nowrap"
                          >
                            View on Explorer
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Payment Amount */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs dashboard-text-secondary mb-1">Payment Amount</p>
                      <p className="text-sm font-semibold dashboard-text-primary">
                        {formatAmount(sessionData.payment.amountCrypto, 'USD')} {sessionData.payment.token}
                      </p>
                      <p className="text-xs dashboard-text-secondary mt-1">
                        {formatAmount(sessionData.amountUSD, 'USD')} USD
                      </p>
                    </div>

                    {/* Payment Status */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs dashboard-text-secondary mb-1">Payment Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          sessionData.payment.status === 'succeeded' 
                            ? 'bg-green-100 text-green-700'
                            : sessionData.payment.status === 'email_failed'
                            ? 'bg-orange-100 text-orange-700'
                            : sessionData.payment.status === 'confirming'
                            ? 'bg-blue-100 text-blue-700'
                            : sessionData.payment.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {sessionData.payment.status === 'succeeded' && '✓ '}
                          {sessionData.payment.status === 'email_failed' && '✉ '}
                          {sessionData.payment.status === 'confirming' && '⏳ '}
                          {sessionData.payment.status === 'failed' && '✗ '}
                          {sessionData.payment.status === 'succeeded' ? 'Succeeded' 
                            : sessionData.payment.status === 'email_failed' ? 'Email Failed'
                            : sessionData.payment.status === 'confirming' ? 'Confirming'
                            : sessionData.payment.status === 'failed' ? 'Failed'
                            : sessionData.payment.status}
                        </span>
                      </div>
                    </div>

                    {/* Payment Date */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs dashboard-text-secondary mb-1">Payment Date</p>
                      <p className="text-sm dashboard-text-primary">
                        {formatDate(sessionData.payment.createdAt)}
                      </p>
                    </div>
                  </>
                )}

                {/* Store Information */}
                {sessionData.store && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs dashboard-text-secondary mb-1">Store</p>
                    <p className="text-sm font-semibold dashboard-text-primary">{sessionData.store}</p>
                  </div>
                )}

                {/* Gift Card Information */}
                {sessionData.giftCard && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs dashboard-text-secondary mb-1">Gift Card</p>
                    <p className="text-sm font-semibold dashboard-text-primary">
                      {formatAmount(sessionData.giftCard.amountUSD, 'USD')} {sessionData.giftCard.currency}
                    </p>
                  </div>
                )}

                {/* Wallet Address */}
                {sessionData.wallet && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs dashboard-text-secondary mb-1">Wallet Address</p>
                    <p className="text-sm font-mono dashboard-text-primary break-all">
                      {sessionData.wallet.address}
                    </p>
                  </div>
                )}
              </div>
            ) : sessionId ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
            
            {sessionData?.status === 'email_failed' && (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-semibold text-orange-800 mb-2">
                  ⚠️ Email Delivery Failed
                </p>
                <p className="text-xs text-orange-700 mb-3">
                  Your payment was successfully verified, but we couldn't send the gift card to your email. 
                  Please contact our support team to receive your gift card details.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={`mailto:payments.mizu@gmail.com?subject=Gift Card Request - Session ${sessionData.sessionId}&body=Hello,%0D%0A%0D%0AI need help retrieving my gift card for session: ${sessionData.sessionId}%0D%0A%0D%0AThank you!`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Contact Support
                  </a>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
                  >
                    Retry Check
                  </button>
                </div>
              </div>
            )}
            
            {sessionData?.status === 'fulfilled' && (
              <div className="mt-6 pt-6 border-t dashboard-border">
                <p className="text-xs dashboard-text-secondary">
                  ✓ Your payment has been verified and your gift card has been sent to your email. 
                  Please check your inbox (and spam folder) for the gift card details.
                </p>
              </div>
            )}
            
            {sessionData?.status !== 'fulfilled' && sessionData?.status !== 'email_failed' && (
              <div className="mt-6 pt-6 border-t dashboard-border">
                <p className="text-xs dashboard-text-secondary">
                  Your payment is being verified on the blockchain. You'll receive an email notification once the gift card is ready.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

