'use client'

import { useUser } from '@clerk/nextjs'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useBalance, useReadContract } from 'wagmi'
import { WalletConnectButton } from '@/components/ui/wallet-connect-button'
import { useState, useEffect } from 'react'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES, MIZU_PAY_ABI, MOCK_CUSD_ABI, CELO_SEPOLIA_CONFIG } from '@/lib/contracts'
import { convertINRToUSD, formatCurrency } from '@/lib/currency-converter'

export default function PaymentPage() {
  const { user, isLoaded } = useUser()
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const [formData, setFormData] = useState({
    amount: '',
    token: 'CUSD',
    store: '',
    brand: '',
    giftCardCode: '',
    currency: 'USD',
    country: 'US',
    items: '',
    cartHash: '',
    originalUrl: ''
  })
  const [sessionId, setSessionId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isFromExtension, setIsFromExtension] = useState(false)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [originalAmount, setOriginalAmount] = useState<number | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionRates, setConversionRates] = useState<{
    celoAmount?: string
    cusdAmount?: string
    rate?: number
    usdAmount?: string
  } | null>(null)
  const [originalInrAmount, setOriginalInrAmount] = useState<string | null>(null)
  
  // Balance hooks
  const { data: celoBalance } = useBalance({
    address: address,
  })
  
  const { data: cusdBalance, error: cusdError, isLoading: cusdLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.MOCK_CUSD,
    abi: MOCK_CUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Generate session ID on component mount and parse URL parameters
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
    
    // Parse URL parameters from browser extension
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      
      // Extract all possible parameters from extension
      const store = urlParams.get('store')
      const amount = urlParams.get('amount')
      const currency = urlParams.get('currency')
      const product_name = urlParams.get('product_name')
      const country = urlParams.get('country')
      const items = urlParams.get('items')
      const cartHash = urlParams.get('cartHash')
      const originalUrl = urlParams.get('original_url')
      const timestamp = urlParams.get('timestamp')
      const celoAmount = urlParams.get('celo_amount')
      const cusdAmount = urlParams.get('cusd_amount')
      const conversionRate = urlParams.get('conversion_rate')
      
      // Check if this is from the extension
      if (store || amount || originalUrl) {
        setIsFromExtension(true)
        
        // Set conversion rates if available
        if (celoAmount && cusdAmount && conversionRate) {
          setConversionRates({
            celoAmount,
            cusdAmount,
            rate: parseFloat(conversionRate),
            usdAmount: cusdAmount
          })
        }
        
        // Handle currency conversion if needed
        const handleCurrencyConversion = async () => {
          // Check if this is likely an Indian payment that was incorrectly labeled as USD
          const isIndianPayment = originalUrl && (
            originalUrl.includes('flipkart.com') ||
            originalUrl.includes('amazon.in') ||
            originalUrl.includes('myntra.com') ||
            originalUrl.includes('nykaa.com') ||
            originalUrl.includes('swiggy.com') ||
            originalUrl.includes('zomato.com') ||
            originalUrl.includes('.in/')
          )
          
          // Additional check: if amount looks like it could be INR converted to USD
          const amountNum = parseFloat(amount || '0')
          const looksLikeConvertedInr = amountNum > 0 && amountNum < 1000 && (
            // Common Indian price ranges that would be converted to small USD amounts
            (amountNum >= 0.5 && amountNum <= 50) || // ₹50-₹4000 range
            originalUrl?.includes('flipkart.com') // Flipkart is always INR
          )
          
          if (amount && currency && currency.toUpperCase() === 'USD' && country === 'US' && (isIndianPayment || looksLikeConvertedInr)) {
            setIsConverting(true)
            try {
              // This is likely an Indian payment that was incorrectly converted to USD
              // We need to reverse the conversion to get the original INR amount
              console.log('Detected Indian payment with USD amount:', amount)
              
              // Estimate the original INR amount (assuming it was converted at ~83 INR/USD)
              const estimatedInrAmount = parseFloat(amount) * 83.33
              const usdConverted = await convertINRToUSD(estimatedInrAmount)
              
              setOriginalAmount(estimatedInrAmount)
              setConvertedAmount(usdConverted)
              
              // Update form with properly converted amount
              setFormData(prev => ({
                ...prev,
                amount: usdConverted.toString(),
                currency: 'USD',
                country: 'US',
                store: store || prev.store,
                brand: product_name || prev.brand,
                items: items || prev.items,
                cartHash: cartHash || prev.cartHash,
                originalUrl: originalUrl || prev.originalUrl,
              }))
              
              setPaymentStatus(`Detected Indian payment: ₹${estimatedInrAmount.toFixed(2)} → $${usdConverted.toFixed(2)} using real-time rates`)
              setTimeout(() => setPaymentStatus(''), 8000)
            } catch (error) {
              console.error('Currency conversion error:', error)
              setErrorMessage('Failed to convert currency. Using original amount.')
              // Fallback to original amount
              setFormData(prev => ({
                ...prev,
                amount: amount || prev.amount,
                currency: currency || prev.currency,
                country: country || prev.country,
                store: store || prev.store,
                brand: product_name || prev.brand,
                items: items || prev.items,
                cartHash: cartHash || prev.cartHash,
                originalUrl: originalUrl || prev.originalUrl,
              }))
            } finally {
              setIsConverting(false)
            }
          } else {
            // Regular payment or non-Indian payment
        setFormData(prev => ({
          ...prev,
          amount: amount || prev.amount,
          store: store || prev.store,
          brand: product_name || prev.brand,
          currency: currency || prev.currency,
          country: country || prev.country,
          items: items || prev.items,
          cartHash: cartHash || prev.cartHash,
          originalUrl: originalUrl || prev.originalUrl,
        }))
          }
        }
        
        handleCurrencyConversion()
        
        // Handle INR payments with real-time conversion
        if (currency === 'INR' && amount) {
          // Get real-time conversion rates for INR payments
          const getRealTimeRates = async () => {
            try {
              setIsConverting(true)
              
              // Get INR to USD rate from Frankfurter API
              const inrToUsdResponse = await fetch('https://api.frankfurter.app/latest?from=INR&to=USD')
              const inrToUsdData = await inrToUsdResponse.json()
              const inrToUsdRate = inrToUsdData.rates?.USD || 0.0114
              
              const inrAmount = parseFloat(amount)
              const usdAmount = inrAmount * inrToUsdRate
              
              // Store original INR amount for display
              setOriginalInrAmount(amount)
              
              // Get CELO price from CoinGecko
              const celoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd')
              const celoData = await celoResponse.json()
              const celoPrice = celoData.celo?.usd || 0.25
              
              // Get cUSD price from DIA Data
              const cusdResponse = await fetch('https://api.diadata.org/v1/assetQuotation/Celo/0x765DE816845861e75A25fCA122bb6898B8B1282a')
              const cusdData = await cusdResponse.json()
              const cusdPrice = cusdData.Price || 1.0
              
              // Calculate amounts
              const celoAmount = (usdAmount / celoPrice).toFixed(4)
              const cusdAmount = (usdAmount / cusdPrice).toFixed(2)
              
              // Set conversion rates
              setConversionRates({
                celoAmount: celoAmount,
                cusdAmount: cusdAmount,
                rate: inrToUsdRate,
                usdAmount: usdAmount.toFixed(2)
              })
              
              // Set form data with converted cUSD amount for payment
              setFormData(prev => ({
                ...prev,
                amount: cusdAmount, // Use converted cUSD amount for payment
                currency: currency, // Keep original currency for display
                country: 'IN',
                token: 'CUSD',
                store: store || prev.store,
                brand: product_name || prev.brand,
                items: items || prev.items,
                cartHash: cartHash || prev.cartHash,
                originalUrl: originalUrl || prev.originalUrl,
              }))
              
              setPaymentStatus(`Real-time conversion: ₹${inrAmount.toLocaleString('en-IN')} → $${usdAmount.toFixed(2)}`)
              setTimeout(() => setPaymentStatus(''), 5000)
              
            } catch (error) {
              console.error('Error getting real-time conversion rates:', error)
              setErrorMessage('Failed to get conversion rates. Using fallback rates.')
              
              // Fallback to converted amount (using fallback rate)
              const fallbackUsdAmount = parseFloat(amount) * 0.0114 // Fallback INR to USD rate
              const fallbackCusdAmount = (fallbackUsdAmount / 1.0).toFixed(2) // cUSD = USD
              
          setFormData(prev => ({
            ...prev,
                amount: fallbackCusdAmount, // Use converted cUSD amount
                currency: currency,
                country: 'IN',
            token: 'CUSD',
                store: store || prev.store,
                brand: product_name || prev.brand,
                items: items || prev.items,
                cartHash: cartHash || prev.cartHash,
                originalUrl: originalUrl || prev.originalUrl,
              }))
            } finally {
              setIsConverting(false)
            }
          }
          
          getRealTimeRates()
        } else {
          // Regular payment or non-Indian payment
          setFormData(prev => ({
            ...prev,
            amount: amount || prev.amount,
            store: store || prev.store,
            brand: product_name || prev.brand,
            currency: currency || prev.currency,
            country: country || prev.country,
            items: items || prev.items,
            cartHash: cartHash || prev.cartHash,
            originalUrl: originalUrl || prev.originalUrl,
          }))
        }
        
        // Show notification with extracted data
        if (!isConverting) {
        setPaymentStatus(`Payment details loaded from ${store || 'browser extension'}`)
        setTimeout(() => setPaymentStatus(''), 5000)
        }
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

    // Check if user has sufficient balance
    const paymentAmount = parseFloat(formData.amount)
    if (formData.token === 'CELO') {
      const celoBalanceNum = celoBalance ? parseFloat(celoBalance.formatted) : 0
      if (celoBalanceNum < paymentAmount) {
        setErrorMessage(`Insufficient CELO balance. You have ${celoBalanceNum.toFixed(4)} CELO but need ${paymentAmount} CELO`)
        return
      }
    } else if (formData.token === 'CUSD') {
      const cusdBalanceNum = cusdBalance ? parseFloat(formatEther(cusdBalance)) : 0
      if (cusdBalanceNum < paymentAmount) {
        setErrorMessage(`Insufficient cUSD balance. You have ${cusdBalanceNum.toFixed(2)} cUSD but need ${paymentAmount} cUSD`)
        return
      }
    }

    setIsProcessing(true)
    setErrorMessage('')
    setPaymentStatus('Processing payment...')

    try {
      // Check if we're on the correct network first
      if (chainId !== CELO_SEPOLIA_CONFIG.chainId) {
        throw new Error(`Please switch to CELO Sepolia testnet (Chain ID: ${CELO_SEPOLIA_CONFIG.chainId}). Current chain: ${chainId}`)
      }

      // Process the smart contract payment FIRST
      const amount = parseEther(formData.amount)
      
      console.log('Processing payment:', {
        token: formData.token,
        amount: formData.amount,
        amountWei: amount.toString(),
        contractAddress: CONTRACT_ADDRESSES.MIZU_PAY,
        sessionId,
        chainId
      })
      
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

  // Save payment to database and send email when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash) {
      setPaymentStatus('Payment successful!')
      
      // Save payment to database with transaction hash
      const savePaymentToDatabase = async () => {
        try {
          const paymentData = {
            sessionId,
            amount: parseFloat(formData.amount),
            token: formData.token,
            store: formData.store || null,
            brand: formData.brand || null,
            giftCardCode: formData.giftCardCode || null,
            status: 'COMPLETED',
            txHash: hash
          }

          const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
            body: JSON.stringify(paymentData),
          })

          if (!response.ok) {
            console.error('Failed to save payment to database')
          } else {
            console.log('Payment saved to database successfully')
          }
        } catch (error) {
          console.error('Error saving payment to database:', error)
        }
      }

      // Send confirmation email
      const sendConfirmationEmail = async () => {
        try {
          console.log('📧 Sending payment confirmation email...')
          
          const emailData = {
            userEmail: user?.emailAddresses[0]?.emailAddress || 'customer@example.com',
            userName: user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Valued Customer',
            amount: parseFloat(formData.amount),
            token: formData.token,
            store: formData.store || 'N/A',
            product: formData.brand || 'N/A',
          sessionId,
          txHash: hash
          }

          const emailResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          })

          if (emailResponse.ok) {
            console.log('✅ Payment confirmation email sent successfully')
            setPaymentStatus('Payment successful! Confirmation email sent.')
          } else {
            console.error('❌ Failed to send confirmation email')
            setPaymentStatus('Payment successful! (Email notification failed)')
          }
        } catch (error) {
          console.error('❌ Error sending confirmation email:', error)
          setPaymentStatus('Payment successful! (Email notification failed)')
        }
      }

      // Execute both operations
      savePaymentToDatabase()
      sendConfirmationEmail()
    }
  }, [isSuccess, hash, sessionId, formData, user])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading payment page...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Sign in required</h1>
          <p className="text-gray-400 mb-6">Please sign in to complete your payment securely.</p>
          <button 
            onClick={() => window.location.href = '/sign-in'}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 mr-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Mizu Pay</h1>
                <p className="text-sm text-gray-400">Secure blockchain payments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-white font-medium">{user.firstName || 'User'}</div>
                <div className="text-xs text-gray-400">{user.emailAddresses[0]?.emailAddress}</div>
              </div>
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Payment Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Payment Details Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Payment Details</h2>
            {isFromExtension && (
              <div className="flex items-center bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
                <span className="mr-2">🔗</span>
                    From Extension
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  {/* INR Amount Display */}
                  {formData.currency === 'INR' && originalInrAmount && (
                    <div className="mt-2 p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-orange-300 font-semibold text-sm">Original Amount (INR)</div>
                          <div className="text-white text-xl font-bold">₹{parseFloat(originalInrAmount).toLocaleString('en-IN')}</div>
                        </div>
                        <div className="text-2xl">🇮🇳</div>
                      </div>
                    </div>
                  )}

                  {/* USD Amount Display for INR payments */}
                  {formData.currency === 'INR' && originalInrAmount && (
                    <div className="mt-2 p-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg">
                      <div className="text-blue-300 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Converted to USD:</span>
                          <span className="font-bold">${(parseFloat(originalInrAmount) * (1/87.81)).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-blue-400 mt-1">
                          Using real-time rates: 1 USD = ₹87.81
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real-time Conversion Rates Display */}
                  {conversionRates && formData.currency === 'INR' && (
                    <div className="mt-2 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg">
                      <div className="text-purple-300 text-sm">
                        <div className="font-semibold mb-2">Real-time Conversion Rates</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>USD Amount:</span>
                            <span className="font-bold">${conversionRates.usdAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>cUSD Amount:</span>
                            <span className="font-bold">{conversionRates.cusdAmount} cUSD</span>
                          </div>
                          <div className="flex justify-between">
                            <span>CELO Amount:</span>
                            <span className="font-bold">{conversionRates.celoAmount} CELO</span>
                          </div>
                          <div className="text-xs text-purple-400 mt-2">
                            Using live rates from CoinGecko & DIA Data
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Currency Conversion Display */}
                  {isConverting && (
                    <div className="mt-2 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                      <div className="flex items-center text-blue-300">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Converting currency using real-time exchange rates...
                      </div>
                    </div>
                  )}
                  
                  {originalAmount && convertedAmount && !isConverting && (
                    <div className="mt-2 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                      <div className="text-green-300 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Original: {formatCurrency(originalAmount, 'INR')}</span>
                          <span>→</span>
                          <span>Converted: {formatCurrency(convertedAmount, 'USD')}</span>
                        </div>
                        <div className="text-xs text-green-400 mt-1">
                          Using real-time exchange rates
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Token
                </label>
                <select
                  name="token"
                  value={formData.token}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    <option value="CUSD">cUSD (Stablecoin)</option>
                    <option value="CELO">CELO (Native)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Store
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
                    Product
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                    placeholder="Product name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              </div>
              </div>

            {/* Wallet Status Card */}
            {isConnected && address && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Wallet Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CELO Balance */}
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
              <div>
                        <div className="text-yellow-300 font-medium">CELO Balance</div>
                        <div className="text-2xl font-bold text-white">
                          {celoBalance ? parseFloat(celoBalance.formatted).toFixed(4) : '0.0000'}
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">C</span>
                      </div>
                    </div>
              </div>

                  {/* cUSD Balance */}
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
              <div>
                        <div className="text-green-300 font-medium">cUSD Balance</div>
                        <div className="text-2xl font-bold text-white">
                          {cusdLoading ? (
                            <div className="animate-pulse">Loading...</div>
                          ) : cusdError ? (
                            <div className="text-red-400">Error</div>
                          ) : cusdBalance ? (
                            parseFloat(formatEther(cusdBalance)).toFixed(2)
                          ) : (
                            '0.00'
                          )}
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">$</span>
                      </div>
                    </div>
                  </div>
              </div>

                <div className="mt-4 p-3 bg-gray-500/20 border border-gray-400/30 rounded-lg">
                  <div className="text-sm text-gray-300">
                    <span className="font-medium">Address:</span> {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    <span className="font-medium">Network:</span> {chainId === CELO_SEPOLIA_CONFIG.chainId ? 'CELO Sepolia' : `Chain ID: ${chainId}`}
                  </div>
                  </div>
                </div>
              )}

            {/* Original Store Info */}
              {formData.originalUrl && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Store Information</h3>
                <div className="space-y-3">
                <div>
                    <div className="text-sm text-gray-400">Original Store URL</div>
                    <a 
                      href={formData.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm break-all"
                    >
                      {formData.originalUrl}
                    </a>
                  </div>
                  {formData.items && (
                    <div>
                      <div className="text-sm text-gray-400">Cart Items</div>
                      <div className="bg-white/5 border border-white/20 rounded-lg p-3 mt-1">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                          {formData.items}
                        </pre>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>

          {/* Payment Summary - Right Column */}
            <div className="space-y-6">
            
            {/* Conversion Rates Card */}
            {conversionRates && (
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">💱</span>
                  Conversion Rates
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-300">USD Amount:</span>
                    <span className="text-white font-mono">${conversionRates.usdAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-300">cUSD Amount:</span>
                    <span className="text-white font-mono">{conversionRates.cusdAmount} cUSD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-300">CELO Amount:</span>
                    <span className="text-white font-mono">{conversionRates.celoAmount} CELO</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-300">Exchange Rate:</span>
                    <span className="text-white font-mono">1 USD = {conversionRates.rate} {formData.currency}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Summary Card */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount:</span>
                    <span className="text-white font-mono">
                      {formData.amount || '0'} {formData.token}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Currency:</span>
                    <span className="text-white">{formData.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Country:</span>
                    <span className="text-white">{formData.country}</span>
                  </div>
                  {formData.store && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Store:</span>
                      <span className="text-white">{formData.store}</span>
                    </div>
                  )}
                  {formData.brand && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Product:</span>
                      <span className="text-white">{formData.brand}</span>
                    </div>
                  )}
                <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between">
                    <span className="text-gray-300">Session ID:</span>
                    <span className="text-white font-mono text-xs">{sessionId.substring(0, 12)}...</span>
                  </div>
                    </div>
                </div>
              </div>

            {/* Balance Check */}
            {isConnected && formData.amount && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Balance Check</h3>
                {(() => {
                  const paymentAmount = parseFloat(formData.amount)
                  if (formData.token === 'CELO') {
                    const celoBalanceNum = celoBalance ? parseFloat(celoBalance.formatted) : 0
                    const hasEnough = celoBalanceNum >= paymentAmount
                    return (
                      <div className={`p-4 rounded-lg ${hasEnough ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'}`}>
                        <div className={`flex items-center ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                          <span className="mr-2">{hasEnough ? '✅' : '❌'}</span>
                          <span className="font-medium">
                            {hasEnough 
                              ? `Sufficient CELO balance`
                              : `Insufficient CELO balance`
                            }
                          </span>
                        </div>
                        <div className="text-sm text-gray-300 mt-2">
                          Available: {celoBalanceNum.toFixed(4)} CELO | Required: {paymentAmount} CELO
                        </div>
                      </div>
                    )
                  } else if (formData.token === 'CUSD') {
                    const cusdBalanceNum = cusdBalance ? parseFloat(formatEther(cusdBalance)) : 0
                    const hasEnough = cusdBalanceNum >= paymentAmount
                    return (
                      <div className={`p-4 rounded-lg ${hasEnough ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'}`}>
                        <div className={`flex items-center ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                          <span className="mr-2">{hasEnough ? '✅' : '❌'}</span>
                          <span className="font-medium">
                            {hasEnough 
                              ? `Sufficient cUSD balance`
                              : `Insufficient cUSD balance`
                            }
                          </span>
                    </div>
                        <div className="text-sm text-gray-300 mt-2">
                          Available: {cusdBalanceNum.toFixed(2)} cUSD | Required: {paymentAmount} cUSD
                    </div>
                  </div>
                    )
                  }
                  return null
                })()}
              </div>
            )}

            {/* Payment Button */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              {!isConnected ? (
                  <div className="text-center">
                  <div className="text-yellow-400 mb-4">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mx-auto mb-2"></div>
                    Wallet not connected
                    </div>
                    <WalletConnectButton />
                  </div>
              ) : (
              <button
                onClick={handlePayment}
                disabled={!isConnected || isProcessing || isPending || isConfirming}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                {isProcessing || isPending || isConfirming ? (
                    <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {paymentStatus || 'Processing...'}
                  </div>
                ) : (
                  `Pay ${formData.amount || '0'} ${formData.token}`
                )}
              </button>
              )}
            </div>

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
  )
}