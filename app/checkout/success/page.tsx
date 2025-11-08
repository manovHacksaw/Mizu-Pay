"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')
  
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
            
            {sessionId && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs dashboard-text-secondary mb-1">Session ID</p>
                <p className="text-sm font-mono dashboard-text-primary break-all">{sessionId}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="dashboard-modal-btn-primary w-full"
              >
                View Dashboard
              </button>
              
              <button
                onClick={() => router.push('/')}
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

