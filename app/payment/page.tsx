'use client'

import { useUser } from '@clerk/nextjs'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useBalance, useReadContract } from 'wagmi'
import WalletConnect from '@/components/wallet-connect'
import { useState, useEffect } from 'react'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESSES, MIZU_PAY_ABI, MOCK_CUSD_ABI, CELO_SEPOLIA_CONFIG } from '@/lib/contracts'
import { convertINRToUSD, formatCurrency } from '@/lib/currency-converter'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SessionTimer } from '@/components/ui/session-timer'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  PaymentDetailsSkeleton, 
  WalletStatusSkeleton, 
  PaymentSummarySkeleton, 
  ConversionRatesSkeleton,
  PaymentButtonSkeleton 
} from '@/components/ui/payment-skeletons'

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
 const [isPageLoading, setIsPageLoading] = useState(true)
 const [sessionExpired, setSessionExpired] = useState(false)
 const [availableGiftCards, setAvailableGiftCards] = useState<any[]>([])
 const [selectedGiftCard, setSelectedGiftCard] = useState<any>(null)
 const [isLoadingGiftCards, setIsLoadingGiftCards] = useState(false)
 const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
 
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
  
  // Initialize page loading
  setIsPageLoading(true)
 
 // Validate session and check if coming from extension
 const validateSession = async () => {
   try {
     // Check if this is from the extension by looking for specific parameters
     const urlParams = new URLSearchParams(window.location.search)
     const fromExtension = urlParams.get('from_extension') === 'true' || 
                          urlParams.get('store') || 
                          urlParams.get('amount') || 
                          urlParams.get('original_url')
     
     if (!fromExtension) {
       setErrorMessage('Access denied. This page can only be accessed from the Mizu Pay browser extension.')
       setIsPageLoading(false)
       return
     }
     
     // Create session in database
     const sessionResponse = await fetch('/api/sessions', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
         expiresInMinutes: 10
       })
     })
     
     if (sessionResponse.ok) {
       const sessionData = await sessionResponse.json()
       setSessionId(sessionData.session.sessionId)
     }
     
   } catch (error) {
     console.error('Session validation error:', error)
     setErrorMessage('Failed to validate session. Please try again.')
   }
 }
 
 validateSession()
  
  // Simulate initial loading time
  const loadingTimer = setTimeout(() => {
    setIsPageLoading(false)
  }, 1500)
 
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
 
 return () => clearTimeout(loadingTimer)
 }, [])

 // Fetch gift cards when form data changes
 useEffect(() => {
   console.log('Form data changed:', { 
     store: formData.store, 
     amount: formData.amount, 
     currency: formData.currency,
     hasStore: !!formData.store,
     hasAmount: !!formData.amount,
     amountValue: parseFloat(formData.amount || '0')
   })
   
   if (formData.store && formData.amount && parseFloat(formData.amount) > 0) {
     fetchAvailableGiftCards()
   }
 }, [formData.store, formData.amount, formData.currency])

 // Auto-fetch gift cards when page loads with URL parameters
 useEffect(() => {
   if (formData.store && formData.amount && parseFloat(formData.amount) > 0 && availableGiftCards.length === 0 && !isLoadingGiftCards) {
     console.log('Auto-fetching gift cards on page load...')
     fetchAvailableGiftCards()
   }
 }, [formData.store, formData.amount, formData.currency, availableGiftCards.length, isLoadingGiftCards])

 // Handle session expiration
 const handleSessionExpire = () => {
  setSessionExpired(true)
  setErrorMessage('Session expired. Please refresh the page to start a new payment session.')
 }

 // Fetch available gift cards
 const fetchAvailableGiftCards = async () => {
   if (!formData.store || !formData.amount) return
   
   setIsLoadingGiftCards(true)
   try {
     // Extract store name from URL or use the store field directly
     let storeName = formData.store
     if (formData.originalUrl) {
       const url = new URL(formData.originalUrl)
       const hostname = url.hostname.toLowerCase()
       if (hostname.includes('amazon')) storeName = 'amazon'
       else if (hostname.includes('flipkart')) storeName = 'flipkart'
       else if (hostname.includes('myntra')) storeName = 'myntra'
       else if (hostname.includes('nykaa')) storeName = 'nykaa'
     }
     
     console.log('Fetching gift cards for:', { 
       store: formData.store, 
       storeName, 
       amount: formData.amount, 
       currency: formData.currency 
     })
     
     // Try the main API first, then fallback to minimal API
     let response = await fetch(`/api/gift-cards?amount=${formData.amount}&provider=${storeName}&currency=${formData.currency}`)
     
     // If main API fails, try minimal API
     if (!response.ok) {
       console.log('Main API failed, trying minimal API...')
       response = await fetch(`/api/minimal-gift-cards?amount=${formData.amount}&provider=${storeName}&currency=${formData.currency}`)
     }
     
     if (!response.ok) {
       console.error('API response not ok:', response.status, response.statusText)
       throw new Error(`API request failed: ${response.status} ${response.statusText}`)
     }
     
     const data = await response.json()
     console.log('Gift card API response:', data)
     
     if (data.success && data.giftCard) {
       setAvailableGiftCards([data.giftCard])
       setSelectedGiftCard(data.giftCard)
     } else if (data.success && data.availableAmounts) {
       const cards = data.availableAmounts.slice(0, 3)
       setAvailableGiftCards(cards)
       if (cards.length > 0) {
         setSelectedGiftCard(cards[0])
       }
     } else {
       // If no exact match, try to get any available gift cards with a small amount
       let fallbackResponse = await fetch(`/api/gift-cards?amount=1&currency=${formData.currency}`)
       
       // If main fallback API fails, try minimal API
       if (!fallbackResponse.ok) {
         console.log('Main fallback API failed, trying minimal API...')
         fallbackResponse = await fetch(`/api/minimal-gift-cards?amount=1&currency=${formData.currency}`)
       }
       
       if (!fallbackResponse.ok) {
         console.error('Fallback API response not ok:', fallbackResponse.status, fallbackResponse.statusText)
         throw new Error(`Fallback API request failed: ${fallbackResponse.status} ${fallbackResponse.statusText}`)
       }
       
       const fallbackData = await fallbackResponse.json()
       console.log('Fallback gift card response:', fallbackData)
       
       if (fallbackData.success && fallbackData.availableAmounts) {
         const cards = fallbackData.availableAmounts.slice(0, 3)
         setAvailableGiftCards(cards)
         if (cards.length > 0) {
           setSelectedGiftCard(cards[0])
         }
       }
     }
   } catch (error) {
     console.error('Error fetching gift cards:', error)
     
     // Fallback: Show a message that gift cards will be selected automatically
     const fallbackGiftCard = {
       id: 'auto-select',
       name: `${formData.store || 'Store'} Gift Card (Auto-Selected)`,
       amount: parseFloat(formData.amount || '0'),
       currency: formData.currency || 'USD',
       provider: formData.store || 'store'
     }
     
     setAvailableGiftCards([fallbackGiftCard])
     setSelectedGiftCard(fallbackGiftCard)
   } finally {
     setIsLoadingGiftCards(false)
   }
 }

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

 if (!selectedGiftCard) {
 setErrorMessage('Please select a gift card first')
 return
 }

 // Use gift card amount for payment, not original purchase amount
 const paymentAmount = selectedGiftCard.amount
 // Convert gift card amount to CUSD/CELO based on currency
 let tokenAmount = paymentAmount
 let tokenType = formData.token

 // If gift card is in INR, convert to USD equivalent for CUSD payment
 if (selectedGiftCard.currency === 'INR') {
   // Simple conversion: 1 USD = 83 INR (you can make this dynamic)
   tokenAmount = paymentAmount / 83
   tokenType = 'CUSD' // Always use CUSD for INR gift cards
 }

 if (tokenType === 'CELO') {
 const celoBalanceNum = celoBalance ? parseFloat(celoBalance.formatted) : 0
   if (celoBalanceNum < tokenAmount) {
     setErrorMessage(`Insufficient CELO balance. You have ${celoBalanceNum.toFixed(4)} CELO but need ${tokenAmount.toFixed(4)} CELO`)
 return
 }
 } else if (tokenType === 'CUSD') {
 const cusdBalanceNum = cusdBalance ? parseFloat(formatEther(cusdBalance)) : 0
   if (cusdBalanceNum < tokenAmount) {
     setErrorMessage(`Insufficient cUSD balance. You have ${cusdBalanceNum.toFixed(2)} cUSD but need ${tokenAmount.toFixed(2)} cUSD`)
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
 const amount = parseEther(tokenAmount.toString())
 
 console.log('Processing payment:', {
 token: tokenType,
 originalAmount: formData.amount,
 giftCardAmount: selectedGiftCard.amount,
 giftCardCurrency: selectedGiftCard.currency,
 convertedAmount: tokenAmount,
 amountWei: amount.toString(),
 contractAddress: CONTRACT_ADDRESSES.MIZU_PAY,
 sessionId,
 chainId
 })
 
 if (tokenType === 'CUSD') {
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
 } else if (tokenType === 'CELO') {
 // For CELO payments, send CELO directly
 setPaymentStatus('Processing CELO payment...')
 
 await writeContract({
 address: CONTRACT_ADDRESSES.MIZU_PAY,
 abi: MIZU_PAY_ABI,
 functionName: 'payWithCELO',
 args: [sessionId],
 value: amount,
 })
 } else {
 throw new Error(`Unsupported token type: ${tokenType}`)
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
   setIsVerifyingPayment(true)
   setPaymentStatus('Payment successful! Verifying transaction...')
 
   // Verify payment and process gift card
   const verifyPaymentAndProcessGiftCard = async () => {
 try {
       // First, save payment to database
 const paymentData = {
 sessionId,
 amount: parseFloat(formData.amount),
 token: formData.token,
 store: formData.store || null,
 brand: formData.brand || null,
 giftCardCode: formData.giftCardCode || null,
 status: 'PENDING',
 txHash: hash,
 // Note: userId will be set by the API based on authenticated user
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
         return
       }

       const paymentResult = await response.json()
       console.log('Payment saved to database successfully')

       // Send first email - payment confirmation
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
 } else {
 console.error('❌ Failed to send confirmation email')
 }
 } catch (error) {
 console.error('❌ Error sending confirmation email:', error)
         }
       }

       // Send confirmation email immediately
       await sendConfirmationEmail()

       // Verification UI is already shown above
       
       // Wait a bit for blockchain confirmation, then verify and process gift card
       setTimeout(async () => {
         try {
           setPaymentStatus('Verifying transaction and processing gift card...')
           
           // Verify payment using Envio indexer
           const verifyResponse = await fetch('/api/payments/verify-envio', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({
               txHash: hash,
               walletAddress: address,
               amount: parseFloat(formData.amount),
               token: formData.token
             }),
           })

           if (verifyResponse.ok) {
             const verifyResult = await verifyResponse.json()
             console.log('✅ Payment verified by Envio indexer:', verifyResult)
             
             if (verifyResult.verified && verifyResult.payment) {
               // Payment verified by indexer, now process gift card
               try {
                 const giftCardResponse = await fetch('/api/payments/verify', {
                   method: 'POST',
                   headers: {
                     'Content-Type': 'application/json',
                   },
                   body: JSON.stringify({
                     sessionId,
                     txHash: hash,
                     walletAddress: address,
                     amount: parseFloat(formData.amount),
                     token: formData.token
                   })
                 })
               
               if (giftCardResponse.ok) {
                 const giftCardResult = await giftCardResponse.json()
                 console.log('🎁 Gift card processed:', giftCardResult)
                 
                 if (giftCardResult.giftCard) {
                   // Send second email with gift card details
                   const sendGiftCardEmail = async () => {
                     try {
                       console.log('🎁 Sending gift card details email...')
                       
                       const giftCardEmailData = {
                         userEmail: user?.emailAddresses[0]?.emailAddress || 'customer@example.com',
                         userName: user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Valued Customer',
                         giftCardName: giftCardResult.giftCard.name,
                         giftCardAmount: giftCardResult.giftCard.amount,
                         giftCardCurrency: giftCardResult.giftCard.currency,
                         giftCardProvider: giftCardResult.giftCard.provider,
                         giftCardCode: giftCardResult.giftCard.code,
                         giftCardPin: giftCardResult.giftCard.pin,
                         paymentAmount: parseFloat(formData.amount),
                         paymentToken: formData.token,
                         txHash: hash
                       }

                 const giftCardEmailResponse = await fetch('/api/send-gift-card-email', {
                   method: 'POST',
                   headers: {
                     'Content-Type': 'application/json',
                   },
                   body: JSON.stringify(giftCardEmailData),
                 })

                 if (giftCardEmailResponse.ok) {
                   console.log('✅ Gift card details email sent successfully')
                   setIsVerifyingPayment(false)
                   setPaymentStatus('Payment successful! Gift card details sent to your email.')
                   
                   // Redirect to success page after a delay
                   setTimeout(() => {
                     window.location.href = `/payment-success?sessionId=${sessionId}`
                   }, 3000)
                 } else {
                   try {
                     const errorData = await giftCardEmailResponse.json()
                     console.error('❌ Failed to send gift card email:', errorData)
                   } catch (jsonError) {
                     console.error('❌ Failed to parse email response as JSON:', jsonError)
                     console.error('❌ Response status:', giftCardEmailResponse.status)
                     console.error('❌ Response text:', await giftCardEmailResponse.text())
                   }
                   setIsVerifyingPayment(false)
                   setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
                 }
               } catch (error) {
                 console.error('❌ Error sending gift card email:', error)
                 setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
               }
             }

             await sendGiftCardEmail()
                 } else {
                   console.error('❌ No gift card in response')
                   setIsVerifyingPayment(false)
                   setPaymentStatus('Payment verified but no gift card found. Please contact support.')
                 }
               } else {
                 console.error('❌ Gift card processing failed')
                 setIsVerifyingPayment(false)
                 setPaymentStatus('Payment verified but gift card processing failed. Please contact support.')
               }
               } catch (giftCardError) {
                 console.error('❌ Error in gift card processing:', giftCardError)
                 setIsVerifyingPayment(false)
                 setPaymentStatus('Payment verified but gift card processing failed. Please contact support.')
               }
             } else {
               console.error('❌ Payment not verified by Envio indexer')
               setIsVerifyingPayment(false)
               setPaymentStatus('Payment not verified by blockchain. Please contact support.')
             }
           } else {
             const errorData = await verifyResponse.json()
             console.error('❌ Envio indexer verification failed:', errorData)
             setIsVerifyingPayment(false)
             
             // Try to process gift card anyway since payment was successful
             try {
               const giftCardResponse = await fetch('/api/payments/verify', {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({
                   sessionId,
                   txHash: hash,
                   walletAddress: address,
                   amount: parseFloat(formData.amount),
                   token: formData.token
                 })
               })
               
               if (giftCardResponse.ok) {
                 const giftCardResult = await giftCardResponse.json()
                 console.log('🎁 Gift card processed despite indexer failure:', giftCardResult)
                 
                 if (giftCardResult.giftCard) {
                   setPaymentStatus('Payment successful! Gift card details sent to your email.')
                   
                   // Send gift card email
                   const sendGiftCardEmail = async () => {
                     try {
                       const giftCardEmailData = {
                         userEmail: user?.emailAddresses[0]?.emailAddress || 'customer@example.com',
                         userName: user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Valued Customer',
                         giftCardName: giftCardResult.giftCard.name,
                         giftCardAmount: giftCardResult.giftCard.amount,
                         giftCardCurrency: giftCardResult.giftCard.currency,
                         giftCardProvider: giftCardResult.giftCard.provider,
                         giftCardCode: giftCardResult.giftCard.code,
                         giftCardPin: giftCardResult.giftCard.pin,
                         paymentAmount: parseFloat(formData.amount),
                         paymentToken: formData.token,
                         txHash: hash
                       }

                       const giftCardEmailResponse = await fetch('/api/send-gift-card-email', {
                         method: 'POST',
                         headers: {
                           'Content-Type': 'application/json',
                         },
                         body: JSON.stringify(giftCardEmailData),
                       })

                       if (giftCardEmailResponse.ok) {
                         console.log('✅ Gift card details email sent successfully')
                         setTimeout(() => {
                           window.location.href = `/payment-success?sessionId=${sessionId}`
                         }, 3000)
                       } else {
                         try {
                           const errorData = await giftCardEmailResponse.json()
                           console.error('❌ Failed to send gift card email:', errorData)
                         } catch (jsonError) {
                           console.error('❌ Failed to parse email response as JSON:', jsonError)
                           console.error('❌ Response status:', giftCardEmailResponse.status)
                           console.error('❌ Response text:', await giftCardEmailResponse.text())
                         }
                         setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
                       }
                     } catch (error) {
                       console.error('❌ Error sending gift card email:', error)
                       setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
                     }
                   }

                   await sendGiftCardEmail()
                 } else {
                   console.error('❌ No gift card in response')
                   setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
                 }
               } else {
                 const errorData = await giftCardResponse.json()
                 console.error('❌ Gift card processing failed:', errorData)
                 setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
               }
             } catch (error) {
               console.error('❌ Error processing gift card:', error)
               setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
             }
           }
         } catch (error) {
           console.error('❌ Error verifying payment:', error)
           setIsVerifyingPayment(false)
           setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
         }
       }, 5000) // Wait 5 seconds for blockchain confirmation

     } catch (error) {
       console.error('Error processing payment:', error)
       setPaymentStatus('Payment successful! Please wait 2-3 minutes for your gift card details to arrive via email.')
     }
   }

   verifyPaymentAndProcessGiftCard()
 }
}, [isSuccess, hash, sessionId, formData, user, address])

 // Loading state
 if (!isLoaded || isPageLoading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
 
 {/* Header Skeleton */}
 <div className="flex justify-center w-full py-6 px-4 fixed top-0 left-0 right-0 z-40">
  <div className="flex items-center justify-between px-6 py-3 rounded-full w-full max-w-7xl relative z-10">
   <div className="flex items-center">
    <Skeleton className="h-8 w-32 bg-white/10" />
   </div>
   <div className="flex items-center gap-4">
    <Skeleton className="h-8 w-24 bg-white/10" />
    <Skeleton className="h-10 w-32 bg-white/10 rounded-full" />
   </div>
  </div>
 </div>

 {/* Main Content Skeleton */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 relative z-10">
  <div className="text-left mb-12">
   <Skeleton className="h-12 w-80 bg-white/10 mb-4" />
   <Skeleton className="h-6 w-96 bg-white/10" />
  </div>
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
   <div className="lg:col-span-2 space-y-6">
    <PaymentDetailsSkeleton />
    <WalletStatusSkeleton />
   </div>
   <div className="space-y-6">
    <ConversionRatesSkeleton />
    <PaymentSummarySkeleton />
    <PaymentButtonSkeleton />
   </div>
  </div>
 </div>
 </div>
 )
 }

 if (!user) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
 
 <div className="flex items-center justify-center min-h-screen relative z-10">
  <motion.div 
   className="text-center max-w-md mx-auto px-6"
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.5 }}
  >
   <div className="mb-8">
    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
     <span className="text-2xl font-bold text-white">M</span>
    </div>
    <h1 className="text-3xl font-bold text-white mb-2">Authentication Required</h1>
    <p className="text-white/70">Please sign in to complete your secure payment session.</p>
   </div>
   
   <Button 
    onClick={() => window.location.href = '/sign-in'}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
   >
    Sign In to Continue
   </Button>
  </motion.div>
 </div>
 </div>
 )
 }

 // Animation variants for Framer Motion
 const containerVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: {
 staggerChildren: 0.1,
 },
 },
 };

 const itemVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
 };

 const hoverTransition = { type: "spring" as const, stiffness: 300, damping: 15 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
 {/* Professional Background */}
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
 
 {/* Session Expired Overlay */}
 {sessionExpired && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
   <motion.div 
    className="bg-slate-800 border border-red-500/30 rounded-2xl p-8 max-w-md mx-4 text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
   >
    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
     <span className="text-2xl">⏰</span>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Session Expired</h2>
    <p className="text-white/70 mb-6">Your payment session has expired. Please refresh to start a new session.</p>
    <Button 
     onClick={() => window.location.reload()}
     className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
     Start New Session
    </Button>
   </motion.div>
  </div>
 )}

 {/* Payment Verification UI */}
 {isVerifyingPayment && (
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
   >
     <motion.div
       className="bg-slate-800 border border-purple-500/30 rounded-2xl p-8 max-w-md mx-4 text-center"
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.3 }}
     >
       <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
       </div>
       
       <h3 className="text-2xl font-semibold text-white mb-4">Verifying Payment</h3>
       
       <div className="space-y-4">
         <p className="text-white/70 text-lg">
           Your payment is being verified on the blockchain. This process typically takes 2-3 minutes.
         </p>
         
         <div className="bg-white/5 rounded-lg p-4 border border-white/10">
           <div className="flex items-center justify-between mb-2">
             <span className="text-white/70 text-sm">Transaction Hash:</span>
             <span className="text-white font-mono text-xs">{hash?.slice(0, 8)}...{hash?.slice(-8)}</span>
           </div>
           <div className="flex items-center justify-between">
             <span className="text-white/70 text-sm">Amount:</span>
             <span className="text-white font-semibold">{selectedGiftCard?.amount} {selectedGiftCard?.currency}</span>
           </div>
         </div>
         
         <div className="flex items-center justify-center space-x-2 text-purple-400">
           <div className="animate-pulse">●</div>
           <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</div>
           <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</div>
         </div>
         
         <p className="text-white/50 text-sm">
           Please keep this page open. You'll be redirected automatically once verification is complete.
         </p>
       </div>
     </motion.div>
   </motion.div>
 )}

 {/* Professional Header */}
 <motion.div 
  className="flex justify-center w-full py-6 px-4 fixed top-0 left-0 right-0 z-40"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
 >
 <div className="flex items-center justify-between px-6 py-4 rounded-2xl w-full max-w-7xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
  <div className="flex items-center space-x-4">
   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
    <span className="text-lg font-bold text-white">M</span>
   </div>
   <div>
    <h1 className="text-lg font-semibold text-white">Mizu Pay</h1>
    <p className="text-xs text-white/70">Secure Payment Session</p>
   </div>
  </div>

  <div className="flex items-center space-x-6">
   <SessionTimer 
    duration={10} 
    onExpire={handleSessionExpire}
    className="hidden sm:flex"
   />
   
   <div className="flex items-center space-x-4">
    <div className="text-right hidden sm:block">
     <div className="text-white font-medium text-sm">{user.firstName || 'User'}</div>
     <div className="text-xs text-white/70">{user.emailAddresses[0]?.emailAddress}</div>
    </div>
    <WalletConnect />
   </div>
  </div>
 </div>
 </motion.div>

 {/* Professional Welcome Section */}
 <motion.div 
  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 relative z-10"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
 >
 <div className="text-center mb-12">
  <motion.div
   className="inline-flex items-center space-x-2 bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6"
   initial={{ opacity: 0, scale: 0.9 }}
   animate={{ opacity: 1, scale: 1 }}
   transition={{ duration: 0.5, delay: 0.2 }}
  >
   <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
   <span>Secure Payment Session Active</span>
  </motion.div>
  
  <h1 className="text-4xl font-bold text-white mb-4">
   Complete Your Payment
  </h1>
  <p className="text-lg text-white/70 max-w-2xl mx-auto">
   Process your secure blockchain payment using CUSD or CELO tokens with real-time conversion rates.
  </p>
 </div>
 </motion.div>

 {/* Professional Main Content */}
 <motion.div 
  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
 >
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Payment Form - Left Column */}
 <div className="lg:col-span-2 space-y-6">
 
 {/* Professional Payment Details Card */}
 <motion.div 
  variants={itemVariants}
  whileHover={{ scale: 1.02, y: -2 }}
  transition={hoverTransition}
 >
 <Card className="h-full p-8 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
   <span className="text-sm font-bold text-white">💳</span>
  </div>
  <h2 className="text-2xl font-semibold text-white">Payment Details</h2>
 </div>
 {isFromExtension && (
  <div className="flex items-center bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium">
   <span className="mr-2">🔗</span>
   From Extension
  </div>
 )}
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-semibold text-white mb-3">
  Payment Amount
 </label>
 <div className="relative">
  <input
   type="number"
   name="amount"
   value={formData.amount}
   onChange={handleInputChange}
   placeholder="0.00"
   step="0.01"
   min="0"
   className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-lg font-medium"
  />
  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 text-sm font-medium">
   {formData.token}
  </div>
 </div>
 
 {/* INR Amount Display */}
 {formData.currency === 'INR' && originalInrAmount && (
 <div className="mt-2 p-4 bg-orange-900/30 border border-orange-500/30 rounded-lg">
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
 <div className="mt-2 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
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
 {conversionRates && (
 <div className="mt-2 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
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
 <div className="mt-2 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
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
 <div className="mt-2 p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
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
 <label className="block text-sm font-semibold text-white mb-3">
  Payment Token
 </label>
 <select
  name="token"
  value={formData.token}
  onChange={handleInputChange}
  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-lg font-medium"
 >
  <option value="CUSD">cUSD (Stablecoin)</option>
  <option value="CELO">CELO (Native)</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-semibold text-white mb-3">
  Store Name
 </label>
 <input
  type="text"
  name="store"
  value={formData.store}
  onChange={handleInputChange}
  placeholder="Enter store name"
  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-lg font-medium"
 />
 </div>

 <div>
 <label className="block text-sm font-semibold text-white mb-3">
  Product Name
 </label>
 <input
  type="text"
  name="brand"
  value={formData.brand}
  onChange={handleInputChange}
  placeholder="Enter product name"
  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 text-lg font-medium"
 />
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>

 {/* Professional Wallet Status Card */}
 {isConnected && address && (
 <motion.div 
  variants={itemVariants}
  whileHover={{ scale: 1.02, y: -2 }}
  transition={hoverTransition}
 >
 <Card className="h-full p-8 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
   <span className="text-sm font-bold text-white">💰</span>
  </div>
  <h3 className="text-2xl font-semibold text-white">Wallet Status</h3>
 </div>
 <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
  <span>Connected</span>
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* CELO Balance */}
 <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
 <div className="flex items-center justify-between">
 <div>
 <div className="text-white/70 text-sm font-medium mb-2">CELO Balance</div>
 <div className="text-3xl font-bold text-white">
 {celoBalance ? parseFloat(celoBalance.formatted).toFixed(4) : '0.0000'}
 </div>
 <div className="text-xs text-white/50 mt-1">Native Token</div>
 </div>
 <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
 <span className="text-lg font-bold text-white">C</span>
 </div>
 </div>
 </div>

 {/* cUSD Balance */}
 <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
 <div className="flex items-center justify-between">
 <div>
 <div className="text-white/70 text-sm font-medium mb-2">cUSD Balance</div>
 <div className="text-3xl font-bold text-white">
 {cusdLoading ? (
 <div className="animate-pulse text-lg">Loading...</div>
 ) : cusdError ? (
 <div className="text-red-400 text-lg">Error</div>
 ) : cusdBalance ? (
 parseFloat(formatEther(cusdBalance)).toFixed(2)
 ) : (
 '0.00'
 )}
 </div>
 <div className="text-xs text-white/50 mt-1">Stablecoin</div>
 </div>
 <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
 <span className="text-lg font-bold text-white">$</span>
 </div>
 </div>
 </div>
 </div>

 <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-white/70">Wallet Address</span>
 <span className="text-sm font-mono text-white">{address.slice(0, 6)}...{address.slice(-4)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-white/70">Network</span>
 <span className="text-sm text-white">
 {chainId === CELO_SEPOLIA_CONFIG.chainId ? 'CELO Sepolia' : `Chain ID: ${chainId}`}
 </span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 )}

 {/* Original Store Info */}
 {formData.originalUrl && (
 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.03, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="h-full p-6 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-semibold text-white">Store Information</h3>
 </div>
 <div className="space-y-4">
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Original Store URL</p>
 <a 
 href={formData.originalUrl} 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-white hover:text-white/70 text-sm break-all"
 >
 {formData.originalUrl}
 </a>
 </div>
 {formData.items && (
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-2">Cart Items</p>
 <pre className="text-sm text-white whitespace-pre-wrap">
 {formData.items}
 </pre>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </motion.div>
 )}
 </div>

 {/* Payment Summary - Right Column */}
 <div className="space-y-6">
 
 {/* Conversion Rates Card */}
 {conversionRates && (
 <motion.div 
 variants={itemVariants}
 whileHover={{ scale: 1.03, y: -5 }}
 transition={hoverTransition}
 >
 <Card className="h-full p-6 overflow-hidden rounded-2xl bg-purple-900/30 border border-purple-500/30 shadow-2xl hover:bg-purple-900/40 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-semibold text-white">Conversion Rates</h3>
 <span className="text-2xl">💱</span>
 </div>
 <div className="space-y-4">
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">USD Amount</p>
 <p className="text-white font-mono">${conversionRates.usdAmount}</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">cUSD Amount</p>
 <p className="text-white font-mono">{conversionRates.cusdAmount} cUSD</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">CELO Amount</p>
 <p className="text-white font-mono">{conversionRates.celoAmount} CELO</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Exchange Rate</p>
 <p className="text-white font-mono">1 USD = {conversionRates.rate} {formData.currency}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 )}

 {/* Professional Payment Summary Card */}
 <motion.div 
  variants={itemVariants}
  whileHover={{ scale: 1.02, y: -2 }}
  transition={hoverTransition}
 >
 <Card className="h-full p-8 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 <div className="flex items-center justify-between mb-8">
 <div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
   <span className="text-sm font-bold text-white">📋</span>
  </div>
  <h3 className="text-2xl font-semibold text-white">Payment Summary</h3>
 </div>
 </div>
 <div className="space-y-4">
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Gift Card Amount</p>
 <p className="text-white font-mono">
 {selectedGiftCard ? `${selectedGiftCard.amount} ${selectedGiftCard.currency}` : 'No gift card selected'}
 </p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Original Purchase</p>
 <p className="text-white font-mono">
 {formData.amount || '0'} {formData.currency}
 </p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Currency</p>
 <p className="text-white">{formData.currency}</p>
 </div>
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Country</p>
 <p className="text-white">{formData.country}</p>
 </div>
 {formData.store && (
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Store</p>
 <p className="text-white">{formData.store}</p>
 </div>
 )}
 {formData.brand && (
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Product</p>
 <p className="text-white">{formData.brand}</p>
 </div>
 )}
 <div className="bg-white/5 rounded-lg p-4 border border-white/10">
 <p className="text-sm text-white/70 mb-1">Session ID</p>
 <p className="text-white font-mono text-xs">{sessionId.substring(0, 12)}...</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </motion.div>


 {/* Gift Card Selection */}
 {(availableGiftCards.length > 0 || isLoadingGiftCards || (formData.store && formData.amount)) && (
 <motion.div 
   variants={itemVariants}
   whileHover={{ scale: 1.02, y: -2 }}
   transition={hoverTransition}
 >
 <Card className="h-full p-8 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 shadow-2xl">
   <CardContent className="p-0">
     <div className="flex items-center justify-between mb-8">
       <div className="flex items-center space-x-3">
         <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
           <span className="text-sm font-bold text-white">🎁</span>
         </div>
         <h3 className="text-2xl font-semibold text-white">Available Gift Cards</h3>
       </div>
       {isLoadingGiftCards && (
         <div className="flex items-center space-x-2 text-purple-400">
           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
           <span className="text-sm">Loading...</span>
         </div>
       )}
     </div>
     
     <div className="space-y-4">
       <p className="text-white/70 text-sm">
         {formData.store && formData.amount ? (
           `Gift cards for your ${formData.store} purchase of ${formData.amount} ${formData.currency}:`
         ) : (
           'Choose your preferred gift card. You\'ll receive the nearest greater value card.'
         )}
       </p>
       
       <div className="flex items-center justify-between mb-4">
         <div className="text-white/70 text-sm">
           {isLoadingGiftCards ? (
             <div className="flex items-center space-x-2">
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
               <span>Loading gift cards...</span>
             </div>
           ) : (
             `Available Gift Cards: ${availableGiftCards.length}`
           )}
         </div>
         <button
           onClick={fetchAvailableGiftCards}
           disabled={isLoadingGiftCards}
           className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors"
         >
           {isLoadingGiftCards ? 'Loading...' : 'Refresh'}
         </button>
       </div>
       
       {availableGiftCards.length === 0 && !isLoadingGiftCards ? (
         <div className="text-center py-8">
           <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl">⚠️</span>
           </div>
           <h4 className="text-white font-semibold mb-2">No Gift Cards Available</h4>
           <p className="text-white/70 text-sm">
             No gift cards are currently available for this store and amount. Please try a different amount or contact support.
           </p>
         </div>
       ) : availableGiftCards.length > 0 && availableGiftCards[0].id === 'auto-select' ? (
         <div className="text-center py-8">
           <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl">🎁</span>
           </div>
           <h4 className="text-white font-semibold mb-2">Gift Card Auto-Selected</h4>
           <p className="text-white/70 text-sm">
             A suitable gift card will be automatically selected for you after payment confirmation.
           </p>
         </div>
       ) : (
         <div className="space-y-4">
           <div className="relative">
             <label className="block text-white font-semibold mb-2">
               Select Gift Card
             </label>
             <select
               value={selectedGiftCard?.id || ''}
               onChange={(e) => {
                 const selectedId = e.target.value
                 const selected = availableGiftCards.find(card => card.id === selectedId)
                 setSelectedGiftCard(selected || null)
               }}
               className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
             >
               <option value="" disabled className="bg-gray-800 text-white">
                 Choose a gift card...
               </option>
               {availableGiftCards.map((giftCard, index) => (
                 <option 
                   key={index} 
                   value={giftCard.id}
                   className="bg-gray-800 text-white"
                 >
                   {giftCard.name} - {giftCard.amount} {giftCard.currency} ({giftCard.provider})
                   {giftCard.amount > parseFloat(formData.amount || '0') && 
                     ` (+${giftCard.amount - parseFloat(formData.amount || '0')} bonus)`
                   }
                 </option>
               ))}
             </select>
           </div>
         </div>
       )}
       
       {selectedGiftCard && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-500/30"
         >
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                 <span className="text-sm font-bold text-white">🎁</span>
               </div>
               <div>
                 <h4 className="text-white font-semibold">{selectedGiftCard.name}</h4>
                 <p className="text-white/70 text-sm">{selectedGiftCard.provider} • {selectedGiftCard.currency}</p>
               </div>
             </div>
             <div className="text-right">
               <p className="text-white font-bold text-lg">{selectedGiftCard.amount} {selectedGiftCard.currency}</p>
               {selectedGiftCard.amount > parseFloat(formData.amount || '0') && (
                 <p className="text-green-400 text-sm">
                   +{selectedGiftCard.amount - parseFloat(formData.amount || '0')} bonus value
                 </p>
               )}
               <p className="text-white/70 text-xs">You'll receive this card</p>
             </div>
           </div>
         </motion.div>
       )}
     </div>
   </CardContent>
 </Card>
 </motion.div>
 )}

 {/* Professional Payment Button */}
 <motion.div 
  variants={itemVariants}
  whileHover={{ scale: 1.02, y: -2 }}
  transition={hoverTransition}
 >
 <Card className="h-full p-8 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500">
 <CardContent className="p-0">
 {!isConnected ? (
 <div className="text-center">
 <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
  <span className="text-2xl">🔌</span>
 </div>
 <h3 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h3>
 <p className="text-white/70 mb-6">Connect your wallet to proceed with the payment</p>
 <WalletConnect />
 </div>
 ) : (
 <div className="space-y-6">
 <div className="text-center">
 <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
  <span className="text-2xl">💳</span>
 </div>
 <h3 className="text-xl font-semibold text-white mb-2">Ready to Pay</h3>
 <p className="text-white/70">Complete your secure blockchain payment</p>
 </div>
 
 <Button
  onClick={handlePayment}
   disabled={!isConnected || isProcessing || isPending || isConfirming || sessionExpired || !selectedGiftCard}
  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50"
 >
 {isProcessing || isPending || isConfirming ? (
 <div className="flex items-center justify-center">
 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
 {paymentStatus || 'Processing...'}
 </div>
 ) : sessionExpired ? (
 'Session Expired'
 ) : !selectedGiftCard ? (
   'Select a Gift Card First'
 ) : (
 <div className="flex items-center justify-center">
 {formData.token === 'CUSD' ? (
 <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center mr-3">
 <span className="text-sm font-bold text-white">$</span>
 </div>
 ) : (
 <div className="w-6 h-6 bg-yellow-600 rounded-lg flex items-center justify-center mr-3">
 <span className="text-sm font-bold text-white">C</span>
 </div>
 )}
   Pay {selectedGiftCard.amount} {selectedGiftCard.currency} → Get {selectedGiftCard.name}
 </div>
 )}
 </Button>
 </div>
 )}
 </CardContent>
 </Card>
 </motion.div>

 {/* Professional Status Messages */}
 {paymentStatus && (
 <motion.div 
  variants={itemVariants}
  className="bg-green-900/30 border border-green-500/30 rounded-xl p-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
 >
 <div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
   <span className="text-sm">✓</span>
  </div>
  <p className="text-green-400 font-medium">{paymentStatus}</p>
 </div>
 </motion.div>
 )}

 {errorMessage && (
 <motion.div 
  variants={itemVariants}
  className="bg-red-900/30 border border-red-500/30 rounded-xl p-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
 >
 <div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
   <span className="text-sm">⚠</span>
  </div>
  <p className="text-red-400 font-medium">{errorMessage}</p>
 </div>
 </motion.div>
 )}

 {error && (
 <motion.div 
  variants={itemVariants}
  className="bg-red-900/30 border border-red-500/30 rounded-xl p-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
 >
 <div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
   <span className="text-sm">⚠</span>
  </div>
  <div>
   <p className="text-red-400 font-medium">Transaction failed</p>
   <p className="text-red-300 text-sm mt-1">{error.message}</p>
  </div>
 </div>
 </motion.div>
 )}

 {isSuccess && (
 <motion.div 
  variants={itemVariants}
  className="bg-green-900/30 border border-green-500/30 rounded-xl p-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
 >
 <div className="flex items-center space-x-3">
  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
   <span className="text-sm">✓</span>
  </div>
  <div>
   <p className="text-green-400 font-medium">Payment completed successfully!</p>
   <p className="text-green-300 text-sm font-mono mt-1">Tx: {hash}</p>
  </div>
 </div>
 </motion.div>
 )}
 </div>
 </div>
 </motion.div>
 </div>
 )
}