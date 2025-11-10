        "use client"
        import { useEffect, useState } from 'react'
        import { useParams, useRouter, useSearchParams } from 'next/navigation'
        import { usePrivy, useWallets } from '@privy-io/react-auth'
        import { executePayment, getCusdBalance } from '@/lib/paymentUtils'
        import { createPublicClient, http, formatUnits, defineChain, createWalletClient, custom } from 'viem'
        import { Clock, CheckCircle, AlertCircle, Wallet, CreditCard, Gift } from 'lucide-react'
        import { useCurrencyStore } from '@/lib/currencyStore'
        import { formatAmountWithConversion } from '@/lib/currencyUtils'

        interface GiftCard {
        id: string
        amountMinor: number
        amountUSD: number
        validityDays: number
        }

        interface CheckoutState {
        step: 1 | 2 | 3 | 4
        selectedGiftCard: GiftCard | null
        selectedWalletType: "embedded" | "external" | null
        }

        interface PurchaseDetails {
        store: string
        amount: number
        currency: string
        productName?: string
        }

        // Step Components
        function ProgressIndicator({ currentStep }: { currentStep: number }) {
        const steps = [
            { step: 1, label: 'Confirm', icon: CheckCircle },
            { step: 2, label: 'Gift Card', icon: Gift },
            { step: 3, label: 'Wallet', icon: Wallet },
            { step: 4, label: 'Payment', icon: CreditCard },
        ]
        
        return (
            <div className="mb-8">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 -z-10" />
                <div
                    className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 -z-10"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
                {steps.map(({ step, label, icon: Icon }) => (
                <div key={step} className="flex flex-col items-center z-10">
                    <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            step < currentStep
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-100'
                                : step === currentStep
                                ? 'bg-white text-blue-600 shadow-xl scale-110 ring-4 ring-blue-100'
                                : 'bg-white text-gray-400 shadow border-2 border-gray-200'
                        }`}
                    >
                        {step < currentStep ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <Icon className="w-5 h-5" />
                        )}
                    </div>
                    <span
                        className={`mt-2 text-xs font-semibold transition-colors ${
                            step <= currentStep ? 'text-gray-900' : 'text-gray-400'
                        }`}
                    >
                        {label}
                    </span>
                </div>
                ))}
            </div>
            </div>
        )
        }

        function Step1ConfirmPurchase({ 
        purchaseDetails, 
        onContinue,
        onUpdateDetails
        }: { 
        purchaseDetails: PurchaseDetails
        onContinue: () => void
        onUpdateDetails: (details: PurchaseDetails) => void
        }) {
        const [productName, setProductName] = useState(purchaseDetails.productName || '')
        const [conversionRate, setConversionRate] = useState<{ rate: number; from: string; to: string } | null>(null)
        const [isLoadingConversion, setIsLoadingConversion] = useState(false)
        const [storeSupported, setStoreSupported] = useState<boolean | null>(null)
        const [isCheckingStore, setIsCheckingStore] = useState(true)
        const { selectedDisplayCurrency } = useCurrencyStore()

        useEffect(() => {
            // Fetch conversion rate
            const fetchConversion = async () => {
                if (purchaseDetails.currency === 'USD') return
                
                setIsLoadingConversion(true)
                try {
                    const response = await fetch(`/api/conversion?from=${purchaseDetails.currency}&to=USD`)
                    if (response.ok) {
                        const data = await response.json()
                        setConversionRate(data)
                    }
                } catch (error) {
                    console.error('Error fetching conversion:', error)
                } finally {
                    setIsLoadingConversion(false)
                }
            }

            // Check if store supports gift cards
            const checkStoreSupport = async () => {
                setIsCheckingStore(true)
                try {
                    const response = await fetch(
                        `/api/gift-cards/options?store=${encodeURIComponent(purchaseDetails.store)}&currency=${encodeURIComponent(purchaseDetails.currency)}&amount=${purchaseDetails.amount}`
                    )
                    if (response.ok) {
                        const data = await response.json()
                        // Store is supported if response is OK (even if giftCards array is empty)
                        // Empty array means store is supported but no cards match the amount
                        setStoreSupported(true)
                    } else if (response.status === 404) {
                        // 404 means store doesn't exist in our database
                        setStoreSupported(false)
                    } else {
                        // Other errors - assume not supported
                        setStoreSupported(false)
                    }
                } catch (error) {
                    setStoreSupported(false)
                } finally {
                    setIsCheckingStore(false)
                }
            }

            fetchConversion()
            checkStoreSupport()
        }, [purchaseDetails])

        // Calculate USD equivalent for display
        const usdAmount = conversionRate 
            ? purchaseDetails.amount * conversionRate.rate 
            : (purchaseDetails.currency === 'USD' ? purchaseDetails.amount : null)
        
        // Format the original amount in its original currency
        // Always use the amount from purchaseDetails (which comes from URL params)
        const { formatAmount } = useCurrencyStore()
        const originalAmount = purchaseDetails.amount // Use original amount directly
        const originalAmountFormatted = formatAmount(
            originalAmount, 
            purchaseDetails.currency as 'USD' | 'INR'
        )
        
        // Format USD equivalent if available
        const usdEquivalentFormatted = usdAmount ? formatAmount(usdAmount, 'USD') : null
        

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Purchase Details</h2>
                <p className="text-sm text-gray-600">Review your order before proceeding</p>
            </div>
            <div className="space-y-4">
                {/* Store */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Store
                </label>
                <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">{purchaseDetails.store}</p>
                    {isCheckingStore ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    ) : storeSupported !== false ? (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md">
                        Verified
                    </span>
                    ) : null}
                </div>
                </div>

                {/* Product */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Product
                </label>
                <input
                    type="text"
                    value={productName}
                    onChange={(e) => {
                    setProductName(e.target.value)
                    onUpdateDetails({ ...purchaseDetails, productName: e.target.value })
                    }}
                    placeholder="Enter product name (optional)..."
                    className="w-full text-lg font-bold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-400"
                />
                </div>

                {/* Amount */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-2">
                    Amount
                </label>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-blue-700">
                    {originalAmountFormatted}
                    </p>
                    {usdEquivalentFormatted && (
                    <p className="text-sm text-blue-600">{usdEquivalentFormatted}</p>
                    )}
                </div>
                </div>
            </div>

            {/* Warning if store not supported */}
            {storeSupported === false && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-red-800 mb-1">
                        Store Not Supported
                    </p>
                    <p className="text-xs text-red-700">
                        Gift cards are not currently available for {purchaseDetails.store}. Please try a different store.
                    </p>
                    </div>
                </div>
                </div>
            )}
            
            <button
                onClick={onContinue}
                disabled={storeSupported === false}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Continue to Gift Card Selection
            </button>
            </div>
        )
        }

        function Step2SelectGiftCard({ 
        purchaseDetails,
        onSelect,
        selectedCard,
        onContinue
        }: { 
        purchaseDetails: PurchaseDetails
        onSelect: (card: GiftCard) => void
        selectedCard: GiftCard | null
        onContinue: () => void
        }) {
        const [giftCards, setGiftCards] = useState<GiftCard[]>([])
        const [isLoading, setIsLoading] = useState(true)
        const [error, setError] = useState<string | null>(null)
        const [conversionRate, setConversionRate] = useState<{ rate: number } | null>(null)
        const { exchangeRates, formatAmount, fetchExchangeRates } = useCurrencyStore()

        useEffect(() => {
            // Fetch exchange rates for CELO conversion
            fetchExchangeRates()
            
            // Fetch conversion rate for purchase currency to USD
            const fetchConversion = async () => {
                if (purchaseDetails.currency === 'USD') {
                    setConversionRate({ rate: 1 })
                    return
                }
                try {
                    const response = await fetch(`/api/conversion?from=${purchaseDetails.currency}&to=USD`)
                    if (response.ok) {
                        const data = await response.json()
                        setConversionRate(data)
                    }
                } catch (error) {
                    console.error('Error fetching conversion:', error)
                }
            }
            
            const fetchGiftCards = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await fetch(
                `/api/gift-cards/options?store=${encodeURIComponent(purchaseDetails.store)}&currency=${encodeURIComponent(purchaseDetails.currency)}&amount=${purchaseDetails.amount}`
                )
                
                if (!response.ok) {
                throw new Error('Failed to fetch gift cards')
                }
                
                const data = await response.json()
                setGiftCards(data.giftCards || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load gift cards')
            } finally {
                setIsLoading(false)
            }
            }
            
            fetchConversion()
            fetchGiftCards()
        }, [purchaseDetails, fetchExchangeRates])

        if (isLoading) {
            return (
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Loading gift card options...</p>
            </div>
            )
        }

        if (error) {
            return (
            <div className="text-center">
                <p className="text-sm text-red-600 mb-4">{error}</p>
            </div>
            )
        }

        // Calculate purchase amount in USD
        const purchaseAmountUSD = conversionRate 
            ? purchaseDetails.amount * conversionRate.rate 
            : (purchaseDetails.currency === 'USD' ? purchaseDetails.amount : 0)
        
        // Calculate extra payment when a card is selected
        const extraPaymentUSD = selectedCard ? selectedCard.amountUSD - purchaseAmountUSD : 0
        const extraPaymentCUSD = extraPaymentUSD // cUSD is pegged to USD
        
        // Convert extra payment to CELO
        const extraPaymentCELO = exchangeRates && exchangeRates.celo.usd > 0 
            ? extraPaymentUSD / exchangeRates.celo.usd 
            : 0

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Gift Card</h2>
                <p className="text-sm text-gray-600">Choose a card that covers your purchase</p>
            </div>

            {/* Extra Payment Display */}
            {selectedCard && extraPaymentUSD > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">Extra Amount You're Paying:</p>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-yellow-700">cUSD:</span>
                            <span className="font-semibold text-yellow-900">{formatAmount(extraPaymentCUSD, 'USD')} cUSD</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-yellow-700">USD:</span>
                            <span className="font-semibold text-yellow-900">{formatAmount(extraPaymentUSD, 'USD')}</span>
                        </div>
                        {extraPaymentCELO > 0 && (
                            <div className="flex justify-between">
                                <span className="text-yellow-700">CELO:</span>
                                <span className="font-semibold text-yellow-900">{extraPaymentCELO.toFixed(4)} CELO</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {giftCards.map((card) => {
                const cardAmount = card.amountMinor / 100
                const isSelected = selectedCard?.id === card.id
                const formattedCard = formatAmountWithConversion(card.amountUSD)
                
                return (
                    <button
                    key={card.id}
                    onClick={() => onSelect(card)}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                    }`}
                    >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                        <p className="text-2xl font-bold text-gray-900">
                            {formattedCard.display}
                        </p>
                        {formattedCard.showUSDEquivalent && (
                            <p className="text-sm text-gray-600">{formattedCard.usdEquivalent}</p>
                        )}
                        </div>
                        {isSelected && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                        )}
                    </div>
                    <p className="text-xs text-gray-500">Valid for {card.validityDays} days</p>
                    </button>
                )
                })}
            </div>

            <button
                onClick={onContinue}
                disabled={!selectedCard}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Continue to Wallet Selection
            </button>
            </div>
        )
        }

        function Step3SelectWallet({ 
        onSelect,
        selectedType,
        onContinue,
        sessionId
        }: { 
        onSelect: (type: "embedded" | "external") => void
        selectedType: "embedded" | "external" | null
        onContinue: () => void
        sessionId: string
        }) {
        const { wallets } = useWallets()
        const { user } = usePrivy()
        const [embeddedBalance, setEmbeddedBalance] = useState<string | null>(null)
        const [externalBalance, setExternalBalance] = useState<string | null>(null)
        const [loadingEmbedded, setLoadingEmbedded] = useState(false)
        const [loadingExternal, setLoadingExternal] = useState(false)
        const [signingWallet, setSigningWallet] = useState<"embedded" | "external" | null>(null)
        const [walletSigned, setWalletSigned] = useState<"embedded" | "external" | null>(null)
        const [signError, setSignError] = useState<string | null>(null)

        // Get wallet addresses
        const embeddedWallet = wallets?.find(w => 
            w.walletClientType === 'privy' || 
            w.walletClientType === 'embedded' ||
            w.connectorType === 'privy'
        )
        
        const externalWallet = wallets?.find(w => 
            w.walletClientType !== 'privy' && 
            w.walletClientType !== 'embedded' &&
            w.connectorType !== 'privy'
        )

        useEffect(() => {
            const fetchBalances = async () => {
                // Fetch embedded wallet balance
                if (embeddedWallet?.address) {
                    setLoadingEmbedded(true)
                    try {
                        const balance = await getCusdBalance(embeddedWallet.address)
                        setEmbeddedBalance(parseFloat(balance).toFixed(2))
                    } catch (error) {
                        setEmbeddedBalance('0.00')
                    } finally {
                        setLoadingEmbedded(false)
                    }
                }

                // Fetch external wallet balance
                if (externalWallet?.address) {
                    setLoadingExternal(true)
                    try {
                        const balance = await getCusdBalance(externalWallet.address)
                        setExternalBalance(parseFloat(balance).toFixed(2))
                    } catch (error) {
                        setExternalBalance('0.00')
                    } finally {
                        setLoadingExternal(false)
                    }
                }
            }

            if (wallets && wallets.length > 0) {
                fetchBalances()
            }
        }, [wallets, embeddedWallet?.address, externalWallet?.address])

        // Handle wallet selection with signature
        const handleWalletSelect = async (type: "embedded" | "external") => {
            setSignError(null)
            
            // Get the wallet address based on type
            const wallet = type === "embedded" ? embeddedWallet : externalWallet
            
            if (!wallet?.address) {
                setSignError(`No ${type} wallet found. Please connect a wallet.`)
                return
            }

            // Check if already signed
            if (walletSigned === type) {
                onSelect(type)
                return
            }

            setSigningWallet(type)

            try {
                // Create message to sign
                const message = `I authorize Mizu Pay to use this wallet (${wallet.address}) for payment session ${sessionId}. This is a gasless signature and does not cost any fees.`
                
                // Get the wallet's Ethereum provider
                const ethereumProvider = await wallet.getEthereumProvider()
                
                // Get account address from provider
                const accounts = await ethereumProvider.request({ method: 'eth_accounts' })
                if (!accounts || accounts.length === 0) {
                    throw new Error('No account found. Please connect your wallet.')
                }
                const account = accounts[0] as `0x${string}`
                
                // Create wallet client using viem
                const celoSepolia = defineChain({
                    id: 11142220,
                    name: 'Celo Sepolia',
                    nativeCurrency: {
                        decimals: 18,
                        name: 'CELO',
                        symbol: 'CELO',
                    },
                    rpcUrls: {
                        default: {
                            http: ['https://rpc.ankr.com/celo_sepolia'],
                        },
                    },
                    blockExplorers: {
                        default: {
                            name: 'Celo Sepolia Explorer',
                            url: 'https://celo-sepolia.blockscout.com',
                        },
                    },
                    testnet: true,
                })
                
                const walletClient = createWalletClient({
                    chain: celoSepolia,
                    transport: custom(ethereumProvider),
                    account,
                })
                
                // Sign message using viem's signMessage
                const signature = await walletClient.signMessage({
                    account,
                    message,
                })

                // Update active wallet via API
                const response = await fetch(`/api/sessions/${sessionId}/wallet`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress: wallet.address,
                        signature,
                        message,
                    }),
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to update wallet')
                }

                // Success - mark as signed and update selection
                setWalletSigned(type)
                onSelect(type)
                console.log('Wallet signed and updated:', {
                    type,
                    walletAddress: wallet.address,
                    sessionId,
                })
            } catch (error) {
                console.error('Error signing wallet:', error)
                setSignError(error instanceof Error ? error.message : 'Failed to sign wallet')
            } finally {
                setSigningWallet(null)
            }
        }

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Wallet</h2>
                <p className="text-sm text-gray-600">Choose your payment method</p>
            </div>

            {signError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{signError}</p>
                </div>
            )}

            <div className="space-y-4">
                {[
                { type: 'embedded' as const, label: 'Mizu Pay Wallet', desc: 'Secured by Privy', wallet: embeddedWallet, balance: embeddedBalance, loading: loadingEmbedded },
                { type: 'external' as const, label: 'External Wallet', desc: 'MetaMask, WalletConnect, etc.', wallet: externalWallet, balance: externalBalance, loading: loadingExternal },
                ].map((walletOption) => {
                    const isSelected = selectedType === walletOption.type
                    const isSigning = signingWallet === walletOption.type
                    const isSigned = walletSigned === walletOption.type
                    const hasWallet = !!walletOption.wallet?.address

                    return (
                    <button
                        key={walletOption.type}
                        onClick={() => handleWalletSelect(walletOption.type)}
                        disabled={!hasWallet || isSigning}
                        className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                            isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        } ${!hasWallet || isSigning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-blue-600' : 'bg-gray-100'
                        }`}>
                            {isSigning ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            ) : (
                                <Wallet className={`w-6 h-6 ${
                                    isSelected ? 'text-white' : 'text-gray-600'
                                }`} />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">{walletOption.label}</p>
                            <p className="text-sm text-gray-600">{walletOption.desc}</p>
                            {walletOption.wallet?.address && (
                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                    {walletOption.wallet.address.slice(0, 6)}...{walletOption.wallet.address.slice(-4)}
                                </p>
                            )}
                            {walletOption.balance !== null && (
                                <p className="text-xs text-gray-600 mt-1">
                                    Balance: {walletOption.balance} cUSD
                                </p>
                            )}
                            {walletOption.loading && (
                                <p className="text-xs text-gray-400 mt-1">Loading balance...</p>
                            )}
                        </div>
                        {isSigning && (
                            <div className="text-sm text-blue-600">Signing...</div>
                        )}
                        {isSigned && !isSigning && (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        )}
                        {isSelected && !isSigned && !isSigning && (
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                        )}
                        </div>
                    </button>
                    )
                })}
            </div>

            <button
                onClick={onContinue}
                disabled={!selectedType || !walletSigned || signingWallet !== null}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {signingWallet ? 'Signing Wallet...' : walletSigned ? 'Continue to Payment' : 'Please sign wallet to continue'}
            </button>
            </div>
        )
        }

        function Step4ExecutePayment({ 
        purchaseDetails,
        selectedCard,
        selectedWalletType,
        onPay,
        sessionId
        }: { 
        purchaseDetails: PurchaseDetails
        selectedCard: GiftCard | null
        selectedWalletType: "embedded" | "external" | null
        onPay: () => void
        sessionId: string
        }) {
        const [isProcessing, setIsProcessing] = useState(false)
        const [conversionRate, setConversionRate] = useState<{ rate: number } | null>(null)
        const [paymentError, setPaymentError] = useState<string | null>(null)
        const [paymentStatus, setPaymentStatus] = useState<'idle' | 'switching' | 'approving' | 'paying' | 'confirming' | 'success' | 'error'>('idle')
        const [verificationProgress, setVerificationProgress] = useState<{
            confirmations: number
            requiredConfirmations: number
            message: string
            status: string
            lastUpdate?: number
            verificationSteps?: {
                transactionFound: boolean
                transactionIncluded: boolean
                contractVerified: boolean
                walletVerified: boolean
                sessionIdVerified: boolean
                amountVerified: boolean
                confirmationsComplete: boolean
            }
            stepMessages?: Record<string, string>
        } | null>(null)
        const [txHash, setTxHash] = useState<string | null>(null)
        const { wallets } = useWallets()

        useEffect(() => {
            // Fetch conversion rate for display
            const fetchConversion = async () => {
                if (purchaseDetails.currency === 'USD') return
                try {
                    const response = await fetch(`/api/conversion?from=${purchaseDetails.currency}&to=USD`)
                    if (response.ok) {
                        const data = await response.json()
                        setConversionRate(data)
                    }
                } catch (error) {
                    console.error('Error fetching conversion:', error)
                }
            }
            fetchConversion()
        }, [purchaseDetails])


        const handlePay = async () => {
            if (!selectedCard || !selectedWalletType) {
                setPaymentError('Please select a gift card and wallet')
                return
            }

            setIsProcessing(true)
            setPaymentError(null)
            setPaymentStatus('switching')

            try {
                // Verify gift card is still available before proceeding
                const cardCheckResponse = await fetch(`/api/gift-cards/options?store=${encodeURIComponent(purchaseDetails.store)}&currency=${encodeURIComponent(purchaseDetails.currency)}&amount=${purchaseDetails.amount}`)
                if (cardCheckResponse.ok) {
                    const cardData = await cardCheckResponse.json()
                    const cardStillAvailable = cardData.giftCards?.some((card: GiftCard) => card.id === selectedCard.id)
                    if (!cardStillAvailable) {
                        throw new Error('Selected gift card is no longer available. Please select another card.')
                    }
                }

                // Find the appropriate wallet
                const wallet = selectedWalletType === "embedded" 
                    ? wallets.find(w => w.walletClientType === 'privy' || w.walletClientType === 'embedded' || w.connectorType === 'privy')
                    : wallets.find(w => w.walletClientType !== 'privy' && w.walletClientType !== 'embedded')

                if (!wallet) {
                    throw new Error('Wallet not found')
                }

                // Get Ethereum provider
                const ethereumProvider = await wallet.getEthereumProvider()
                
                // Execute payment with status callbacks
                // This function handles: chain switching -> approval (if needed) -> payment
                const { txHash: paymentTxHash } = await executePayment(
                    ethereumProvider,
                    sessionId,
                    selectedCard.amountUSD,
                    (status) => {
                        // Update status as payment progresses
                        setPaymentStatus(status)
                    }
                )

                // Store txHash for progress polling
                setTxHash(paymentTxHash)
                setPaymentStatus('confirming')

                // Get wallet address for verification
                const walletAddress = wallet.address

                // Poll for verification progress
                const pollVerificationProgress = async (): Promise<void> => {
                    const maxAttempts = 300 // 10 minutes max (300 * 2 seconds)
                    let attempts = 0

                    const poll = async (): Promise<void> => {
                        try {
                            // Build query params with verification details
                            const params = new URLSearchParams({
                                txHash: paymentTxHash,
                                sessionId: sessionId,
                                expectedWalletAddress: walletAddress,
                                expectedAmountCrypto: selectedCard.amountUSD.toString(),
                            })
                            
                            const progressResponse = await fetch(`/api/payments/verify-progress?${params.toString()}`)
                            
                            if (!progressResponse.ok) {
                                const errorText = await progressResponse.text().catch(() => 'Unknown error')
                                // Continue polling on API errors (might be temporary)
                                attempts++
                                if (attempts >= maxAttempts) {
                                    throw new Error('Verification timeout. Your transaction is being processed. If any amount was deducted, it will be automatically refunded to your wallet within 24 hours.')
                                }
                                setTimeout(poll, 2000)
                                return
                            }

                            const progressData = await progressResponse.json()
                            
                            // Confirmation progress: details
                            console.log('Confirmation progress:', {
                                txHash: paymentTxHash,
                                confirmations: progressData.confirmations,
                                requiredConfirmations: progressData.requiredConfirmations,
                                status: progressData.status,
                                confirmed: progressData.confirmed,
                                verificationSteps: progressData.verificationSteps,
                            })
                            
                            // Always update state, even if values are the same (forces re-render)
                            // Include timestamp to ensure React detects the change
                            setVerificationProgress({
                                confirmations: progressData.confirmations || 0,
                                requiredConfirmations: progressData.requiredConfirmations || 5,
                                message: progressData.message || 'Checking...',
                                status: progressData.status || 'pending',
                                verificationSteps: progressData.verificationSteps,
                                stepMessages: progressData.stepMessages,
                                lastUpdate: Date.now(), // Force re-render
                            })

                            // If transaction failed on-chain
                            if (progressData.status === 'failed') {
                                throw new Error('Transaction failed on-chain. Any deducted amount will be automatically refunded to your wallet.')
                            }

                            // If confirmed, proceed to create payment record
                            if (progressData.confirmed) {
                                // Call backend API to record payment and assign gift card
                                const response = await fetch('/api/payments/create', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        sessionId,
                                        txHash: paymentTxHash,
                                        amountCrypto: selectedCard.amountUSD,
                                        token: 'cUSD',
                                        giftCardId: selectedCard.id,
                                    }),
                                })

                                if (!response.ok) {
                                    const errorData = await response.json()
                                    const errorMessage = errorData.details 
                                        ? `${errorData.error}: ${errorData.details}`
                                        : errorData.error || 'Failed to record payment in backend'
                                    
                                    // Mark session as failed if payment recording fails
                                    try {
                                        await fetch('/api/payments/fail', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                sessionId,
                                                error: errorMessage
                                            })
                                        })
                                    } catch (failError) {
                                    }
                                    
                                    throw new Error(errorMessage)
                                }

                                const paymentData = await response.json()
                                
                                // Check if email was sent successfully
                                if (paymentData.session?.status === 'fulfilled') {
                                    // Email sent successfully
                                    setPaymentStatus('success')
                                    setTimeout(() => {
                                        onPay()
                                    }, 1500)
                                } else if (paymentData.session?.status === 'email_failed') {
                                    // Email failed - show error but allow redirect
                                    setPaymentStatus('email_failed')
                                    setTimeout(() => {
                                        onPay()
                                    }, 2000)
                                } else {
                                    // Payment confirmed but email still processing
                                    // Poll for email status
                                    setPaymentStatus('sending_email')
                                    
                                    // Poll for email completion
                                    const pollEmailStatus = async (): Promise<void> => {
                                        const maxEmailAttempts = 30 // 1 minute max (30 * 2 seconds)
                                        let emailAttempts = 0
                                        
                                        const pollEmail = async (): Promise<void> => {
                                            try {
                                                const sessionResponse = await fetch(`/api/sessions/${sessionId}`)
                                                if (sessionResponse.ok) {
                                                    const sessionData = await sessionResponse.json()
                                                    
                                                    if (sessionData.status === 'fulfilled') {
                                                        // Email sent successfully
                                                        setPaymentStatus('success')
                                                        setTimeout(() => {
                                                            onPay()
                                                        }, 1500)
                                                        return
                                                    } else if (sessionData.status === 'email_failed') {
                                                        // Email failed
                                                        setPaymentStatus('email_failed')
                                                        setTimeout(() => {
                                                            onPay()
                                                        }, 2000)
                                                        return
                                                    }
                                                }
                                                
                                                // Continue polling
                                                emailAttempts++
                                                if (emailAttempts >= maxEmailAttempts) {
                                                    // Timeout - redirect anyway
                                                    setPaymentStatus('email_timeout')
                                                    setTimeout(() => {
                                                        onPay()
                                                    }, 2000)
                                                    return
                                                }
                                                
                                                setTimeout(pollEmail, 2000)
                                            } catch (error) {
                                                // Error polling - redirect anyway
                                                setPaymentStatus('email_timeout')
                                                setTimeout(() => {
                                                    onPay()
                                                }, 2000)
                                            }
                                        }
                                        
                                        setTimeout(pollEmail, 2000)
                                    }
                                    
                                    pollEmailStatus()
                                }
                                return
                            }

                            // Continue polling if not confirmed yet
                            attempts++
                            if (attempts >= maxAttempts) {
                                throw new Error('Verification timeout. Your transaction is being processed. If any amount was deducted, it will be automatically refunded to your wallet within 24 hours.')
                            }

                            // Poll again after 2 seconds
                            setTimeout(poll, 2000)
                        } catch (error) {
                            // Only throw fatal errors (timeout, confirmed failure)
                            // For other errors, continue polling
                            if (error instanceof Error && (
                                error.message.includes('timeout') ||
                                error.message.includes('failed on-chain') ||
                                attempts >= maxAttempts
                            )) {
                                throw error
                            }
                            // For other errors, continue polling
                            attempts++
                            if (attempts < maxAttempts) {
                                setTimeout(poll, 2000)
                            } else {
                                throw new Error('Verification timeout. Your transaction is being processed. If any amount was deducted, it will be automatically refunded to your wallet within 24 hours.')
                            }
                        }
                    }

                    // Start polling
                    await poll()
                }

                // Start polling for verification progress
                await pollVerificationProgress()
            } catch (error) {
                setPaymentStatus('error')
                const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.'
                
                // Check if error mentions refund
                const includesRefund = errorMessage.toLowerCase().includes('refund')
                const finalErrorMessage = includesRefund 
                    ? errorMessage 
                    : `${errorMessage}\n\n💡 If any amount was deducted from your wallet, it will be automatically refunded within 24 hours.`
                
                setPaymentError(finalErrorMessage)
                
                // Mark session as failed in database
                try {
                    await fetch('/api/payments/fail', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sessionId,
                            error: errorMessage,
                        }),
                    })
                } catch (failError) {
                }
                
                setIsProcessing(false)
            }
        }

        if (isProcessing || paymentStatus !== 'idle') {
            const statusMessages: Record<string, string> = {
                idle: 'Ready to pay',
                switching: 'Switching to Celo Sepolia network...',
                approving: 'Approving cUSD spending...',
                paying: 'Processing payment...',
                confirming: 'Confirming transaction...',
                success: 'Payment successful!',
                error: 'Payment failed',
            }

            return (
            <div className="max-w-md mx-auto text-center animate-fadeIn">
                {paymentStatus === 'success' ? (
                    <>
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-3">
                            Payment Successful!
                        </h2>
                        <p className="text-sm dashboard-text-secondary">
                            Gift card sent to your email. Redirecting...
                        </p>
                    </>
                ) : paymentStatus === 'sending_email' ? (
                    <>
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-lg font-semibold mb-2">Payment Verified!</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Your payment has been confirmed. We're now sending your gift card to your email...
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Sending email...</span>
                        </div>
                    </>
                ) : paymentStatus === 'email_failed' ? (
                    <>
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-lg font-semibold mb-2 text-orange-600 dark:text-orange-400">Payment Verified, Email Failed</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Your payment was successfully verified, but we couldn't send the email. Please contact support to receive your gift card.
                        </p>
                        <div className="mt-4">
                            <a
                                href={`mailto:payments.mizu@gmail.com?subject=Gift Card Request - Session ${sessionId}&body=Hello,%0D%0A%0D%0AI need help retrieving my gift card for session: ${sessionId}%0D%0A%0D%0AThank you!`}
                                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>
                    </>
                ) : paymentStatus === 'email_timeout' ? (
                    <>
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-lg font-semibold mb-2">Payment Verified</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Your payment has been confirmed. We're checking the email status. You'll be redirected to see the final status.
                        </p>
                    </>
                ) : paymentStatus === 'error' ? (
                    <>
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">
                            Payment Failed
                        </h2>
                        <p className="text-sm dashboard-text-secondary mb-4 whitespace-pre-line">
                            {paymentError || 'An error occurred during payment'}
                        </p>
                        <button
                            onClick={() => {
                                setIsProcessing(false)
                                setPaymentStatus('idle')
                                setPaymentError(null)
                                setVerificationProgress(null)
                                setTxHash(null)
                            }}
                            className="px-4 py-2 bg-white text-[#0066ff] hover:bg-white/90 rounded-lg transition-colors shadow-lg"
                        >
                            Try Again
                        </button>
                    </>
                ) : (
                    <>
                        <div className="relative mb-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 dark:border-white/20 border-t-white mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold dashboard-text-primary mb-3">
                            {statusMessages[paymentStatus] || 'Processing Payment'}
                        </h2>
                        {/* Show amount being paid */}
                        {selectedCard && (paymentStatus === 'approving' || paymentStatus === 'paying' || paymentStatus === 'confirming') && (
                            <div className="mb-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                <p className="text-xs dashboard-text-secondary mb-1">Amount to pay:</p>
                                <p className="text-xl font-bold text-white">
                                    ${selectedCard.amountUSD.toFixed(2)} cUSD
                                </p>
                            </div>
                        )}
                        
                        {/* Show verification progress */}
                        {paymentStatus === 'confirming' && verificationProgress && (
                            <div className="mb-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 space-y-4">
                                {/* Verification Steps */}
                                {verificationProgress.verificationSteps && verificationProgress.stepMessages && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-white mb-2">Verification Progress:</p>
                                        <div className="space-y-1.5">
                                            {/* Transaction Found */}
                                            {verificationProgress.stepMessages.transactionFound && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={verificationProgress.verificationSteps.transactionFound ? "text-green-400" : "text-yellow-400"}>
                                                        {verificationProgress.verificationSteps.transactionFound ? "✓" : "○"}
                                                    </span>
                                                    <span className="dashboard-text-secondary">
                                                        {verificationProgress.stepMessages.transactionFound}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Transaction Included */}
                                            {verificationProgress.stepMessages.transactionIncluded && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={verificationProgress.verificationSteps.transactionIncluded ? "text-green-400" : "text-yellow-400"}>
                                                        {verificationProgress.verificationSteps.transactionIncluded ? "✓" : "○"}
                                                    </span>
                                                    <span className="dashboard-text-secondary">
                                                        {verificationProgress.stepMessages.transactionIncluded}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Contract Verified */}
                                            {verificationProgress.stepMessages.contractVerified && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={verificationProgress.verificationSteps.contractVerified ? "text-green-400" : "text-yellow-400"}>
                                                        {verificationProgress.verificationSteps.contractVerified ? "✓" : "○"}
                                                    </span>
                                                    <span className="dashboard-text-secondary">
                                                        {verificationProgress.stepMessages.contractVerified}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Wallet Verified */}
                                            {verificationProgress.stepMessages.walletVerified && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={verificationProgress.verificationSteps.walletVerified ? "text-green-400" : "text-yellow-400"}>
                                                        {verificationProgress.verificationSteps.walletVerified ? "✓" : "○"}
                                                    </span>
                                                    <span className="dashboard-text-secondary">
                                                        {verificationProgress.stepMessages.walletVerified}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Session ID Verified */}
                                            {verificationProgress.stepMessages.sessionIdVerified && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={verificationProgress.verificationSteps.sessionIdVerified ? "text-green-400" : "text-yellow-400"}>
                                                        {verificationProgress.verificationSteps.sessionIdVerified ? "✓" : "○"}
                                                    </span>
                                                    <span className="dashboard-text-secondary">
                                                        {verificationProgress.stepMessages.sessionIdVerified}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Amount Verified */}
                                            {verificationProgress.stepMessages.amountVerified && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={verificationProgress.verificationSteps.amountVerified ? "text-green-400" : "text-yellow-400"}>
                                                        {verificationProgress.verificationSteps.amountVerified ? "✓" : "○"}
                                                    </span>
                                                    <span className="dashboard-text-secondary">
                                                        {verificationProgress.stepMessages.amountVerified}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Block Confirmations */}
                                <div className="pt-2 border-t border-white/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm dashboard-text-secondary">Block Confirmations:</p>
                                        <p className="text-sm font-semibold text-white">
                                            {verificationProgress.confirmations} / {verificationProgress.requiredConfirmations}
                                        </p>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                            style={{ 
                                                width: `${Math.min((verificationProgress.confirmations / verificationProgress.requiredConfirmations) * 100, 100)}%` 
                                            }}
                                        />
                                    </div>
                                    {verificationProgress.stepMessages?.confirmationsComplete && (
                                        <p className="text-xs dashboard-text-secondary">
                                            {verificationProgress.stepMessages.confirmationsComplete}
                                        </p>
                                    )}
                                </div>
                                
                                {txHash && (
                                    <a
                                        href={`https://celo-sepolia.blockscout.com/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:underline mt-2 inline-block"
                                    >
                                        View on Explorer →
                                    </a>
                                )}
                            </div>
                        )}
                        
                        <p className="text-sm dashboard-text-secondary">
                            {paymentStatus === 'switching'
                                ? 'Please approve the network switch in your wallet'
                                : paymentStatus === 'approving' 
                                ? `Please approve spending ${selectedCard ? `$${selectedCard.amountUSD.toFixed(2)} cUSD` : 'cUSD'} in your wallet`
                                : paymentStatus === 'paying'
                                ? `Sending payment of ${selectedCard ? `$${selectedCard.amountUSD.toFixed(2)} cUSD` : 'cUSD'}...`
                                : paymentStatus === 'confirming'
                                ? verificationProgress 
                                    ? `Verifying transaction... (${verificationProgress.confirmations}/${verificationProgress.requiredConfirmations} confirmations)`
                                    : 'Waiting for transaction to be included in a block...'
                                : 'This usually takes 3-10 seconds.'}
                        </p>
                    </>
                )}
            </div>
            )
        }

        const formattedGiftCard = selectedCard ? formatAmountWithConversion(selectedCard.amountUSD) : null
        const purchaseUSD = conversionRate ? purchaseDetails.amount * conversionRate.rate : (purchaseDetails.currency === 'USD' ? purchaseDetails.amount : purchaseDetails.amount)
        const formattedPurchase = formatAmountWithConversion(purchaseUSD)
        
        // Get formatAmount function for USD and cUSD formatting
        const { formatAmount } = useCurrencyStore.getState()
        const totalChargeUSD = selectedCard ? selectedCard.amountUSD : 0
        const formattedTotalUSD = formatAmount(totalChargeUSD, 'USD')
        // Format cUSD (since cUSD is pegged to USD, use the same value)
        const formattedTotalCUSD = `$${totalChargeUSD.toFixed(2)} cUSD`

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
                <p className="text-sm text-gray-600">Review and complete your purchase</p>
            </div>

            <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                    <span className="text-sm text-gray-600">Gift Card Value</span>
                    <div className="text-right">
                        <span className="font-bold text-gray-900 block">
                            {formattedGiftCard ? formattedGiftCard.display : '$0.00'}
                        </span>
                        {formattedGiftCard && formattedGiftCard.usdEquivalent && (
                            <span className="text-xs text-gray-500">
                                {formattedGiftCard.usdEquivalent} USD
                            </span>
                        )}
                    </div>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-300">
                    <span className="text-sm text-gray-600">Purchase Amount</span>
                    <div className="text-right">
                        <span className="font-bold text-gray-900 block">
                            {formattedPurchase.display}
                        </span>
                        {formattedPurchase.usdEquivalent && (
                            <span className="text-xs text-gray-500">
                                {formattedPurchase.usdEquivalent} USD
                            </span>
                        )}
                    </div>
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total Charge</span>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600 block">
                            {formattedTotalCUSD}
                        </span>
                        <span className="text-sm text-gray-500">
                            {formattedTotalUSD} USD
                        </span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You'll need to approve two transactions in your wallet.
                </p>
                </div>
            </div>

            <button
                onClick={handlePay}
                disabled={!selectedCard || !selectedWalletType || isProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
            </div>
        )
        }

        export default function CheckoutSessionPage() {
        const params = useParams()
        const router = useRouter()
        const searchParams = useSearchParams()
        const { ready, authenticated } = usePrivy()
        const { wallets } = useWallets()
        
        const sessionId = params.sessionId as string
        
        const [checkoutState, setCheckoutState] = useState<CheckoutState>({
            step: 1,
            selectedGiftCard: null,
            selectedWalletType: null,
        })
        
        // Get amount from URL params - this is the source of truth
        const urlAmount = searchParams.get('amount')
        const urlCurrency = searchParams.get('currency') || 'INR'
        const urlStore = searchParams.get('store') || searchParams.get('storeName') || ''
        
        const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails>({
            store: urlStore,
            amount: parseFloat(urlAmount || '0'),
            currency: urlCurrency,
            productName: searchParams.get('productName') || searchParams.get('title') || undefined,
        })
        
        // Debug: Log the amount to verify it's correct
        const [sessionExpired, setSessionExpired] = useState(false)
        const [sessionCreatedAt, setSessionCreatedAt] = useState<Date | null>(null)
        const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

        // Check session expiration and status
        useEffect(() => {
            const checkSession = async () => {
                try {
                    const response = await fetch(`/api/sessions/${sessionId}`)
                    if (response.ok) {
                        const data = await response.json()
                        setSessionCreatedAt(new Date(data.createdAt))
                        
                        // If session is failed or expired, mark as expired and show message
                        if (data.status === 'failed' || data.status === 'expired' || data.expired) {
                            setSessionExpired(true)
                            setTimeRemaining(0)
                            
                            // If failed, show message that user needs to create a new session
                            if (data.status === 'failed') {
                                // Redirect to create new session after a delay
                                setTimeout(() => {
                                    const params = new URLSearchParams(window.location.search)
                                    const store = params.get('store') || ''
                                    const amount = params.get('amount') || ''
                                    const currency = params.get('currency') || 'USD'
                                    const url = params.get('url') || ''
                                    
                                    const redirectParams = new URLSearchParams({
                                        store,
                                        amount,
                                        currency,
                                        ...(url ? { url } : {})
                                    })
                                    
                                    window.location.href = `/checkout?${redirectParams.toString()}`
                                }, 3000)
                            }
                        } else {
                            // Calculate time remaining using expiresAt if available, otherwise fallback to createdAt + 10 minutes
                            const expiryTime = data.expiresAt 
                                ? new Date(data.expiresAt)
                                : new Date(new Date(data.createdAt).getTime() + 10 * 60 * 1000) // 10 minutes fallback
                            const remaining = Math.max(0, expiryTime.getTime() - Date.now())
                            setTimeRemaining(Math.floor(remaining / 1000)) // in seconds
                        }
                    }
                } catch (error) {
                }
            }

            if (sessionId) {
                checkSession()
                // Check every 30 seconds
                const interval = setInterval(checkSession, 30000)
                return () => clearInterval(interval)
            }
        }, [sessionId])

        // Update time remaining countdown
        useEffect(() => {
            if (timeRemaining === null || timeRemaining <= 0 || sessionExpired) return

            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev === null || prev <= 1) {
                        setSessionExpired(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }, [timeRemaining, sessionExpired])

        // Redirect to login if not authenticated
        useEffect(() => {
            if (ready && !authenticated) {
            const returnUrl = `/checkout/${sessionId}?${searchParams.toString()}`
            router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
            }
        }, [ready, authenticated, router, sessionId, searchParams])

        const handleStep1Continue = () => {
            if (sessionExpired) {
                alert('This session has expired. Please start a new checkout.')
                return
            }
            setCheckoutState(prev => ({ ...prev, step: 2 }))
        }

        const handleStep2Select = (card: GiftCard) => {
            if (sessionExpired) {
                alert('This session has expired. Please start a new checkout.')
                return
            }
            setCheckoutState(prev => ({ ...prev, selectedGiftCard: card }))
        }

        const handleStep2Continue = () => {
            if (sessionExpired) {
                alert('This session has expired. Please start a new checkout.')
                return
            }
            if (checkoutState.selectedGiftCard) {
            setCheckoutState(prev => ({ ...prev, step: 3 }))
            }
        }

        const handleStep3Select = (type: "embedded" | "external") => {
            if (sessionExpired) {
                alert('This session has expired. Please start a new checkout.')
                return
            }
            setCheckoutState(prev => ({ ...prev, selectedWalletType: type }))
        }

        const handleStep3Continue = () => {
            if (sessionExpired) {
                alert('This session has expired. Please start a new checkout.')
                return
            }
            if (checkoutState.selectedWalletType) {
            setCheckoutState(prev => ({ ...prev, step: 4 }))
            }
        }

        const handleStep4Pay = async () => {
            if (sessionExpired) {
                alert('This session has expired. Please start a new checkout.')
                return
            }
            
            // Payment is handled in Step4ExecutePayment component
            // This function is called after successful payment to redirect
            router.push(`/checkout/success?sessionId=${sessionId}`)
        }

        if (!ready || !authenticated) {
            return (
            <div className="min-h-screen hero-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
            )
        }

        // Format time remaining
        const formatTimeRemaining = (seconds: number) => {
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${mins}:${secs.toString().padStart(2, '0')}`
        }

        const getTimerColor = () => {
            if (!timeRemaining) return 'text-gray-600'
            if (timeRemaining > 300) return 'text-emerald-600'
            if (timeRemaining > 120) return 'text-amber-600'
            return 'text-red-600'
        }

        const getTimerBgColor = () => {
            if (!timeRemaining) return 'bg-gray-50 border-gray-200'
            if (timeRemaining > 300) return 'bg-emerald-50 border-emerald-200'
            if (timeRemaining > 120) return 'bg-amber-50 border-amber-200'
            return 'bg-red-50 border-red-200'
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Sticky Header */}
                <div className="mb-8 sticky top-0 z-50 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Secure Checkout</h1>
                        <p className="text-xs text-gray-500">Session ID: {sessionId.slice(0, 8)}...</p>
                    </div>
                    </div>
                    {timeRemaining !== null && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${getTimerBgColor()} transition-all duration-300`}>
                        <Clock className={`w-5 h-5 ${getTimerColor()} ${timeRemaining < 60 ? 'animate-pulse' : ''}`} />
                        <div className="text-right">
                        <div className={`text-xl font-bold ${getTimerColor()} tabular-nums`}>
                            {formatTimeRemaining(timeRemaining)}
                        </div>
                        <div className="text-xs text-gray-600">Time remaining</div>
                        </div>
                    </div>
                    )}
                </div>
                {sessionExpired && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-red-800">
                        Session expired. Please start a new checkout.
                    </p>
                    </div>
                )}
                {!sessionExpired && timeRemaining !== null && timeRemaining < 120 && (
                    <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-amber-800">
                        Hurry! Only {Math.floor(timeRemaining / 60)} minute{Math.floor(timeRemaining / 60) !== 1 ? 's' : ''} remaining to complete your purchase.
                    </p>
                    </div>
                )}
                </div>

                <ProgressIndicator currentStep={checkoutState.step} />
                
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                {checkoutState.step === 1 && (
                    <Step1ConfirmPurchase
                    purchaseDetails={purchaseDetails}
                    onContinue={handleStep1Continue}
                    onUpdateDetails={setPurchaseDetails}
                    />
                )}
                
                {checkoutState.step === 2 && (
                    <Step2SelectGiftCard
                    purchaseDetails={purchaseDetails}
                    onSelect={handleStep2Select}
                    selectedCard={checkoutState.selectedGiftCard}
                    onContinue={handleStep2Continue}
                    />
                )}
                
                {checkoutState.step === 3 && (
                    <Step3SelectWallet
                    onSelect={handleStep3Select}
                    selectedType={checkoutState.selectedWalletType}
                    onContinue={handleStep3Continue}
                    sessionId={sessionId}
                    />
                )}
                
                {checkoutState.step === 4 && (
                    <Step4ExecutePayment
                    purchaseDetails={purchaseDetails}
                    selectedCard={checkoutState.selectedGiftCard}
                    selectedWalletType={checkoutState.selectedWalletType}
                    onPay={handleStep4Pay}
                    sessionId={sessionId}
                    />
                )}
                </div>

                <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                    🔒 Secured by blockchain technology • All transactions are encrypted
                </p>
                </div>
            </div>
            </div>
        )
        }

