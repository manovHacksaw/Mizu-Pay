"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'

/**
 * Checkout page - creates a session immediately and redirects to session-based checkout flow
 * When extension is clicked, this page creates a unique session ID with status "pending"
 * and redirects to /checkout/{sessionId}
 */
export default function CheckoutPage() {
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
      router.push('/')
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
  
  // Show loading state with skeleton UI
  return (
    <div className="min-h-screen hero-bg relative overflow-hidden transition-colors duration-300">
      <div className="relative z-10 px-5 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Main Card Skeleton */}
          <div className="dashboard-modal-card mb-6">
            <div className="space-y-6">
              {/* Status Message */}
              <div className="flex items-center gap-3 pb-4 border-b dashboard-border">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Purchase Details Skeleton */}
              <div className="space-y-4">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3"></div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Progress Steps Skeleton */}
              <div className="pt-4 border-t dashboard-border">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-2"></div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Message */}
          <div className="text-center">
            {status === 'error' ? (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  {statusMessages[status]}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {errorMessage || 'An error occurred'}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-3 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Go Home
                </button>
              </div>
            ) : (
              <p className="text-sm dashboard-text-secondary flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {statusMessages[status]}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

