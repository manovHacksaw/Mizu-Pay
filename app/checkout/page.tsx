"use client"
import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'

/**
 * Checkout page - creates a session immediately and redirects to session-based checkout flow
 * When extension is clicked, this page creates a unique session ID with status "pending"
 * and redirects to /checkout/{sessionId}
 */
function CheckoutPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  const [status, setStatus] = useState<'initializing' | 'authenticating' | 'creating' | 'redirecting' | 'error'>('initializing')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const sessionCreatedRef = useRef(false) // Prevent duplicate session creation
  const isCreatingRef = useRef(false) // Track if session creation is in progress
  const walletCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Track wallet check timeout
  
  // Query params from extension
  const storeNameParam = searchParams.get('storeName')
  const amountParam = searchParams.get('amount')
  const currencyParam = searchParams.get('currency')
  const merchantUrl = searchParams.get('url') || ''
  const sourceParam = searchParams.get('source')
  
  // Check if we have required params
  const hasRequiredParams = storeNameParam && amountParam && currencyParam
  
  // Create session and redirect
  useEffect(() => {
    // Prevent duplicate session creation
    if (sessionCreatedRef.current || isCreatingRef.current) {
      return
    }

    if (!ready) {
      setStatus('initializing')
      return
    }
    
    // If not authenticated, redirect to login first
    if (!authenticated) {
      setStatus('authenticating')
      const returnUrl = `/checkout?${searchParams.toString()}`
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }
    
    // If we don't have required params, redirect to home
    if (!hasRequiredParams) {
      router.push('/dashboard')
      return
    }

    // Wait for wallets to be available
    // Privy creates embedded wallets automatically, but they might not be loaded immediately
    if (!wallets || wallets.length === 0) {
      setStatus('creating')
      
      // Clear any existing timeout
      if (walletCheckTimeoutRef.current) {
        clearTimeout(walletCheckTimeoutRef.current)
      }
      
      // Set a timeout to show error if wallets don't load within 5 seconds
      walletCheckTimeoutRef.current = setTimeout(() => {
        if (!wallets || wallets.length === 0) {
          setStatus('error')
          setErrorMessage('No wallet found. Please ensure your wallet is connected. If you just logged in, please wait a moment and refresh the page.')
          isCreatingRef.current = false
        }
      }, 5000) // Wait 5 seconds for wallets to load
      
      // Return early - the effect will re-run when wallets are loaded
      return () => {
        if (walletCheckTimeoutRef.current) {
          clearTimeout(walletCheckTimeoutRef.current)
        }
      }
    }
    
    // Clear timeout if wallets are now available
    if (walletCheckTimeoutRef.current) {
      clearTimeout(walletCheckTimeoutRef.current)
      walletCheckTimeoutRef.current = null
    }

    // Create session immediately
    const createSession = async () => {
      // Double-check to prevent race conditions
      if (sessionCreatedRef.current || isCreatingRef.current) {
        return
      }

      isCreatingRef.current = true
      try {
        setStatus('creating')

        // Get wallet address (prefer embedded wallet, otherwise use first available)
        const embeddedWallet = wallets?.find(w => 
          w.walletClientType === 'privy' || 
          w.walletClientType === 'embedded' ||
          w.connectorType === 'privy'
        )
        const walletToUse = embeddedWallet || wallets?.[0]
        
        if (!walletToUse?.address) {
          setStatus('error')
          setErrorMessage('No wallet found. Please connect a wallet first.')
          isCreatingRef.current = false
          return
        }

        // Get conversion rate if currency is not USD
        let amountUSD: number | undefined = undefined
        const currency = currencyParam?.toUpperCase() || 'USD'
        
        if (currency !== 'USD') {
          try {
            const conversionResponse = await fetch(`/api/conversion?from=${currency}&to=USD`)
            if (conversionResponse.ok) {
              const conversionData = await conversionResponse.json()
              amountUSD = parseFloat(amountParam || '0') * conversionData.rate
            }
          } catch (error) {
            console.warn('Failed to fetch conversion rate:', error)
            // Continue without conversion - API will handle it
          }
        } else {
          amountUSD = parseFloat(amountParam || '0')
        }

        // Create session
        const sessionResponse = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            store: storeNameParam,
            amount: amountParam,
            currency: currency,
            amountUSD: amountUSD,
            walletAddress: walletToUse.address,
            email: user?.email?.address || null,
            userId: null, // Will be determined by API
            privyUserId: user?.id || null,
          }),
        })

        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.json()
          throw new Error(errorData.error || 'Failed to create session')
        }

        const sessionData = await sessionResponse.json()
        const sessionId = sessionData.sessionId

        // Mark session as created to prevent duplicates
        sessionCreatedRef.current = true

        // Redirect to session-based checkout
        setStatus('redirecting')
        const redirectParams = new URLSearchParams({
          store: storeNameParam || '',
          amount: amountParam || '',
          currency: currency,
          ...(merchantUrl ? { url: merchantUrl } : {}),
        })
        router.replace(`/checkout/${sessionId}?${redirectParams.toString()}`)
      } catch (error) {
        console.error('Error creating session:', error)
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Failed to create checkout session')
        // Reset creating flag on error so user can retry
        isCreatingRef.current = false
      }
    }

    createSession()
  }, [ready, authenticated, hasRequiredParams, storeNameParam, amountParam, currencyParam, merchantUrl, router, searchParams, wallets, user?.id])
  
  const statusMessages = {
    initializing: 'Initializing checkout...',
    authenticating: 'Checking authentication...',
    creating: 'Creating payment session...',
    redirecting: 'Redirecting to checkout...',
    error: 'Error',
  }
  
  // Show loading state with professional session creation UI
  return (
    <div className="min-h-screen hero-bg relative overflow-hidden transition-colors duration-300">
      <div className="relative z-10 px-5 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Main Card */}
          <div className="dashboard-modal-card mb-6">
            <div className="text-center py-12">
              {/* Animated Shield/Padlock Icon */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  {/* Rotating ring animation */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" style={{ animationDuration: '2s' }}></div>
                </div>
              </div>
              
              {/* Main Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Creating a secure session...
              </h2>
              
              {/* Subtext */}
              <p className="text-sm text-gray-600 mb-6">
                We're verifying the store and initializing your checkout securely.
              </p>
              
              {/* Status Message */}
              {status === 'error' ? (
                <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    {statusMessages[status]}
                  </p>
                  <p className="text-xs text-red-700 mb-3">
                    {errorMessage || 'An error occurred'}
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Go Home
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{statusMessages[status]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-bg relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10 px-5 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="dashboard-modal-card mb-6">
              <div className="text-center py-12">
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" style={{ animationDuration: '2s' }}></div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Creating a secure session...
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  We're verifying the store and initializing your checkout securely.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  )
}

