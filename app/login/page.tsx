"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLoginWithEmail, usePrivy } from '@privy-io/react-auth'
import { Navbar } from '@/components/layout/Navbar'
import { Waves } from '@/components/decorative/Waves'
import { Watermark } from '@/components/decorative/Watermark'
import { LightStreaks } from '@/components/decorative/LightStreaks'

export default function LoginWithEmail() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { sendCode, loginWithCode } = useLoginWithEmail()
  const { ready, authenticated } = usePrivy()

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard')
    }
  }, [ready, authenticated, router])

  const handleSendCode = async () => {
    if (!email) return
    setIsLoading(true)
    try {
      await sendCode({ email })
      setCodeSent(true)
    } catch (error) {
      console.error('Error sending code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!code) return
    setIsLoading(true)
    try {
      await loginWithCode({ code })
      // Redirect will happen automatically via useEffect when authenticated becomes true
    } catch (error) {
      console.error('Error logging in:', error)
      setIsLoading(false)
    }
  }

  if (ready && authenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen hero-bg relative overflow-hidden text-primary transition-colors duration-300">
      <LightStreaks />
      <Waves />
      <Watermark />
      <Navbar />
      
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-5 py-20">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="backdrop-blur-md bg-white/10 dark:bg-gray-800/30 border border-white/30 dark:border-gray-700/40 rounded-2xl p-8 md:p-10 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                Welcome Back
              </h1>
              <p className="text-secondary text-sm md:text-base">
                {codeSent 
                  ? 'Enter the verification code sent to your email' 
                  : 'Sign in to your account to continue'}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {!codeSent ? (
                <>
                  {/* Email Input */}
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 dark:bg-gray-700/30 border border-white/20 dark:border-gray-600/30 text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                    />
                  </div>

                  {/* Send Code Button */}
                  <button
                    onClick={handleSendCode}
                    disabled={!email || isLoading}
                    className="btn-primary w-full px-6 py-3.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </>
              ) : (
                <>
                  {/* Code Input */}
                  <div>
                    <label 
                      htmlFor="code" 
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 dark:bg-gray-700/30 border border-white/20 dark:border-gray-600/30 text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                      maxLength={6}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      autoFocus
                    />
                  </div>

                  {/* Login Button */}
                  <button
                    onClick={handleLogin}
                    disabled={!code || isLoading}
                    className="btn-primary w-full px-6 py-3.5 rounded-lg text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                  </button>

                  {/* Back to Email */}
                  <button
                    onClick={() => {
                      setCodeSent(false)
                      setCode('')
                    }}
                    className="btn-secondary w-full px-6 py-3.5 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 border"
                  >
                    Use Different Email
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 dark:border-gray-700/30">
              <p className="text-center text-xs text-secondary">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}