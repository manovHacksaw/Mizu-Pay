    "use client"
    import { useEffect, useState } from 'react'
    import { useParams, useRouter, useSearchParams } from 'next/navigation'
    import { usePrivy, useWallets } from '@privy-io/react-auth'
    import { executePayment, getCusdBalance } from '@/lib/paymentUtils'
    import { createPublicClient, http, formatUnits, defineChain } from 'viem'

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
    const stepLabels = ['Confirm Purchase', 'Select Gift Card', 'Select Wallet', 'Payment']
    
    return (
        <div className="mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step < currentStep
                        ? 'bg-white text-[#0066ff] shadow-md'
                        : step === currentStep
                        ? 'bg-white text-[#0066ff] shadow-lg ring-4 ring-white/30'
                        : 'bg-white/20 text-white/60 border-2 border-white/30'
                    }`}
                >
                    {step < currentStep ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    ) : (
                    step
                    )}
                </div>
                <span className={`text-xs mt-2 font-medium transition-colors ${
                    step <= currentStep
                    ? step < currentStep ? 'text-white' : step === currentStep ? 'text-white' : ''
                    : 'text-white/60'
                }`}>
                    {stepLabels[step - 1]}
                </span>
                </div>
                {step < 4 && (
                <div
                    className={`w-12 h-0.5 mx-1 transition-all duration-500 ${
                    step < currentStep
                        ? 'bg-white'
                        : 'bg-white/30'
                    }`}
                />
                )}
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
    const [isConfirmed, setIsConfirmed] = useState(false)

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
                    setStoreSupported(data.giftCards && data.giftCards.length > 0)
                } else {
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

    const usdAmount = conversionRate ? purchaseDetails.amount * conversionRate.rate : null

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="dashboard-modal-card mb-8 shadow-lg">
            <div className="space-y-6">
            {/* Store with green gift card tag */}
            <div className="pb-6 border-b dashboard-border">
                <span className="text-xs font-medium dashboard-text-secondary uppercase tracking-wide block mb-3">Store</span>
                <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-bold dashboard-text-primary">
                    {purchaseDetails.store}
                </span>
                {isCheckingStore ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : storeSupported ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Gift cards supported
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Not verified
                    </span>
                )}
                </div>
            </div>

            {/* Product Name */}
            <div className="pb-6 border-b dashboard-border">
                <label className="text-xs font-medium dashboard-text-secondary uppercase tracking-wide block mb-3">
                Product Name <span className="text-gray-400 normal-case font-normal">(optional)</span>
                </label>
                <input
                type="text"
                value={productName}
                onChange={(e) => {
                    setProductName(e.target.value)
                    onUpdateDetails({ ...purchaseDetails, productName: e.target.value })
                }}
                placeholder="Enter product name..."
                className="w-full px-4 py-2.5 text-sm rounded-lg border dashboard-border bg-white dark:bg-gray-800 dashboard-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
            </div>
            
            {/* Amount with conversion preview */}
            <div className="pb-6 border-b dashboard-border">
                <span className="text-xs font-medium dashboard-text-secondary uppercase tracking-wide block mb-3">Amount</span>
                <div className="space-y-2">
                <div className="text-3xl font-bold text-[#0066ff]">
                    {purchaseDetails.currency} {purchaseDetails.amount.toFixed(2)}
                </div>
                {isLoadingConversion ? (
                    <div className="text-sm dashboard-text-secondary flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-[#0066ff] rounded-full animate-spin"></div>
                    Loading conversion...
                    </div>
                ) : usdAmount ? (
                    <div className="text-sm dashboard-text-secondary">
                    ≈ ${usdAmount.toFixed(2)} (cUSD)
                    </div>
                ) : purchaseDetails.currency === 'USD' ? (
                    <div className="text-sm dashboard-text-secondary">
                    ${purchaseDetails.amount.toFixed(2)} (cUSD)
                    </div>
                ) : null}
                </div>
            </div>
            
            {/* Currency */}
            <div className="flex justify-between items-center pb-2">
                <span className="text-xs font-medium dashboard-text-secondary uppercase tracking-wide">Currency</span>
                <span className="text-sm font-semibold dashboard-text-primary">
                {purchaseDetails.currency}
                </span>
            </div>
            </div>
        </div>

        {/* Confirmation checkbox */}
        <div className="mb-8">
            <label className="flex items-start gap-3 cursor-pointer group">
            <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 dashboard-border text-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 cursor-pointer transition-all"
            />
            <span className="text-sm dashboard-text-primary leading-relaxed flex-1">
                I confirm that the product details and store support gift cards.
            </span>
            </label>
        </div>

        {/* Warning if store not supported */}
        {storeSupported === false && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Store Not Supported
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                    Gift cards are not currently available for {purchaseDetails.store}. Please try a different store.
                </p>
                </div>
            </div>
            </div>
        )}
        
        <button
            onClick={onContinue}
            disabled={!isConfirmed || storeSupported === false}
            className="w-full py-3.5 px-6 rounded-lg bg-white text-[#0066ff] hover:bg-white/90 disabled:bg-white/50 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
        >
            Continue
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

    useEffect(() => {
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
        
        fetchGiftCards()
    }, [purchaseDetails])

    if (isLoading) {
        return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066ff] mx-auto mb-4"></div>
            <p className="text-sm dashboard-text-secondary">Loading gift card options...</p>
        </div>
        )
    }

    if (error) {
        return (
        <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
        </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold dashboard-text-primary mb-2">
            Select Gift Card Value
            </h2>
            <p className="text-sm dashboard-text-secondary">
            Choose a gift card that covers your purchase amount
            </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {giftCards.map((card, index) => {
            const cardAmount = card.amountMinor / 100
            const isSelected = selectedCard?.id === card.id
            const amountDifference = cardAmount - purchaseDetails.amount
            
            return (
                <button
                key={card.id}
                onClick={() => onSelect(card)}
                className={`p-5 rounded-lg border-2 transition-all duration-200 text-left relative ${
                    isSelected
                    ? 'border-[#0066ff] bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-[#0066ff]/60 dark:hover:border-[#0066ff] hover:shadow-sm'
                }`}
                >
                {isSelected && (
                    <div className="absolute top-3 right-3">
                    <div className="w-5 h-5 rounded-full bg-[#0066ff] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    </div>
                )}
                <div className="mb-3">
                    <div className={`text-2xl font-bold mb-1 ${isSelected ? 'text-[#0066ff] dark:text-[#0066ff]' : 'dashboard-text-primary'}`}>
                    {purchaseDetails.currency} {cardAmount.toFixed(2)}
                    </div>
                    <div className="text-sm dashboard-text-secondary">
                    ≈ cUSD ${card.amountUSD.toFixed(2)}
                    </div>
                </div>
                <div className="space-y-2 text-xs dashboard-text-secondary">
                    <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Valid for {card.validityDays} days</span>
                    </div>
                    {amountDifference > 0 && (
                    <div className="pt-2 border-t dashboard-border">
                        <p className="text-xs text-[#0066ff] dark:text-[#0066ff] font-medium">
                        +{purchaseDetails.currency} {amountDifference.toFixed(2)} leftover balance
                        </p>
                    </div>
                    )}
                </div>
                </button>
            )
            })}
        </div>

        {/* Leftover credit explanation */}
        {selectedCard && (
            <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <p className="text-xs dashboard-text-secondary leading-relaxed mb-2">
                <strong className="font-medium dashboard-text-primary">Note:</strong> Any remaining balance stays on the gift card and can be used later.
            </p>
            {selectedCard.amountMinor / 100 > purchaseDetails.amount && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Gift cards come in fixed denominations. You'll have {purchaseDetails.currency} {((selectedCard.amountMinor / 100) - purchaseDetails.amount).toFixed(2)} leftover balance to use later.
                </p>
            )}
            </div>
        )}
        
        {selectedCard && (
            <button
            onClick={onContinue}
            className="w-full py-3 px-6 rounded-lg bg-white text-[#0066ff] hover:bg-white/90 font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
            Continue
            </button>
        )}
        </div>
    )
    }

    function Step3SelectWallet({ 
    onSelect,
    selectedType,
    onContinue
    }: { 
    onSelect: (type: "embedded" | "external") => void
    selectedType: "embedded" | "external" | null
    onContinue: () => void
    }) {
    const { wallets } = useWallets()
    const [embeddedBalance, setEmbeddedBalance] = useState<string | null>(null)
    const [externalBalance, setExternalBalance] = useState<string | null>(null)
    const [loadingEmbedded, setLoadingEmbedded] = useState(false)
    const [loadingExternal, setLoadingExternal] = useState(false)

    useEffect(() => {
        const fetchBalances = async () => {
            // Find embedded wallet
            const embeddedWallet = wallets?.find(w => 
                w.walletClientType === 'privy' || 
                w.walletClientType === 'embedded' ||
                w.connectorType === 'privy'
            )
            
            // Find external wallet
            const externalWallet = wallets?.find(w => 
                w.walletClientType !== 'privy' && 
                w.walletClientType !== 'embedded' &&
                w.connectorType !== 'privy'
            )

            // Fetch embedded wallet balance
            if (embeddedWallet?.address) {
                setLoadingEmbedded(true)
                try {
                    const balance = await getCusdBalance(embeddedWallet.address)
                    setEmbeddedBalance(parseFloat(balance).toFixed(2))
                } catch (error) {
                    console.error('Error fetching embedded wallet balance:', error)
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
                    console.error('Error fetching external wallet balance:', error)
                    setExternalBalance('0.00')
                } finally {
                    setLoadingExternal(false)
                }
            }
        }

        if (wallets && wallets.length > 0) {
            fetchBalances()
        }
    }, [wallets])

    return (
        <div className="max-w-2xl mx-auto animate-fadeIn">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold dashboard-text-primary mb-2">
            Select Payment Wallet
            </h2>
            <p className="text-sm dashboard-text-secondary">
            Choose how you'd like to pay
            </p>
        </div>
        
        <div className="space-y-4 mb-6">
            {/* Embedded Wallet */}
            <div>
            <div className="mb-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                <strong className="font-medium">Embedded Wallet:</strong> Secured and managed by Privy. Best for beginners.
                </p>
            </div>
            <button
                onClick={() => onSelect("embedded")}
                className={`w-full p-5 rounded-lg border-2 transition-all duration-200 text-left relative ${
                    selectedType === "embedded"
                    ? 'border-[#0066ff] bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-[#0066ff]/60 dark:hover:border-[#0066ff] hover:shadow-sm'
                }`}
            >
                <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    selectedType === "embedded"
                    ? 'bg-[#0066ff]'
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                    <svg className={`w-6 h-6 ${selectedType === "embedded" ? 'text-white' : 'text-[#0066ff] dark:text-[#0066ff]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                    <div className="text-lg font-semibold dashboard-text-primary">
                        Mizu Pay Wallet
                    </div>
                    {loadingEmbedded ? (
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : embeddedBalance !== null ? (
                        <div className="text-sm font-medium text-[#0066ff]">
                            {embeddedBalance} cUSD
                        </div>
                    ) : null}
                    </div>
                    <p className="text-xs dashboard-text-secondary leading-relaxed">
                    Automatically secured and managed for you
                    </p>
                </div>
                {selectedType === "embedded" && (
                    <div className="w-5 h-5 rounded-full bg-[#0066ff] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    </div>
                )}
                </div>
            </button>
            </div>
            
            {/* External Wallet */}
            <div>
            <div className="mb-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <p className="text-xs dashboard-text-secondary leading-relaxed">
                <strong className="font-medium dashboard-text-primary">External Wallet:</strong> Use this if you already manage your crypto.
                </p>
            </div>
            <button
                onClick={() => onSelect("external")}
                className={`w-full p-5 rounded-lg border-2 transition-all duration-200 text-left relative ${
                    selectedType === "external"
                    ? 'border-[#0066ff] bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-[#0066ff]/60 dark:hover:border-[#0066ff] hover:shadow-sm'
                }`}
            >
                <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    selectedType === "external"
                    ? 'bg-[#0066ff]'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                    <svg className={`w-6 h-6 ${selectedType === "external" ? 'text-white' : 'dashboard-text-secondary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                    <div className="text-lg font-semibold dashboard-text-primary">
                        External Wallet
                    </div>
                    {loadingExternal ? (
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ) : externalBalance !== null ? (
                        <div className="text-sm font-medium text-[#0066ff]">
                            {externalBalance} cUSD
                        </div>
                    ) : null}
                    </div>
                    <p className="text-xs dashboard-text-secondary leading-relaxed">
                    Connect your own wallet (MetaMask, WalletConnect, etc.)
                    </p>
                </div>
                {selectedType === "external" && (
                    <div className="w-5 h-5 rounded-full bg-[#0066ff] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    </div>
                )}
                </div>
            </button>
            </div>
        </div>
        
        {selectedType && (
            <button
            onClick={onContinue}
            className="w-full py-3 px-6 rounded-lg bg-white text-[#0066ff] hover:bg-white/90 font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
            >
            Continue to Payment
            </button>
        )}
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
            const { txHash } = await executePayment(
                ethereumProvider,
                sessionId,
                selectedCard.amountUSD,
                (status) => {
                    // Update status as payment progresses
                    setPaymentStatus(status)
                }
            )

            // Call backend API to record payment and assign gift card
            setPaymentStatus('confirming')
            const response = await fetch('/api/payments/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    txHash,
                    amountCrypto: selectedCard.amountUSD, // Already in USD equivalent
                    token: 'cUSD',
                    giftCardId: selectedCard.id, // Assign the selected gift card
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                const errorMessage = errorData.details 
                    ? `${errorData.error}: ${errorData.details}`
                    : errorData.error || 'Failed to record payment in backend'
                console.error('Payment API error:', errorData)
                throw new Error(errorMessage)
            }

            setPaymentStatus('success')
            // Call onPay callback to proceed to success page
            setTimeout(() => {
                onPay()
            }, 1500)
        } catch (error) {
            console.error('Payment error:', error)
            setPaymentStatus('error')
            setPaymentError(error instanceof Error ? error.message : 'Payment failed. Please try again.')
            
            // Mark session as failed in database
            try {
                await fetch('/api/payments/fail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sessionId,
                        error: error instanceof Error ? error.message : 'Payment failed',
                    }),
                })
            } catch (failError) {
                console.error('Failed to mark payment as failed:', failError)
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
                        Redirecting to success page...
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
                    <p className="text-sm dashboard-text-secondary mb-4">
                        {paymentError || 'An error occurred during payment'}
                    </p>
                    <button
                        onClick={() => {
                            setIsProcessing(false)
                            setPaymentStatus('idle')
                            setPaymentError(null)
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
                    <p className="text-sm dashboard-text-secondary">
                        {paymentStatus === 'switching'
                            ? 'Please approve the network switch in your wallet'
                            : paymentStatus === 'approving' 
                            ? `Please approve spending ${selectedCard ? `$${selectedCard.amountUSD.toFixed(2)} cUSD` : 'cUSD'} in your wallet`
                            : paymentStatus === 'paying'
                            ? `Sending payment of ${selectedCard ? `$${selectedCard.amountUSD.toFixed(2)} cUSD` : 'cUSD'}...`
                            : paymentStatus === 'confirming'
                            ? 'Waiting for confirmation...'
                            : 'This usually takes 3-10 seconds.'}
                    </p>
                </>
            )}
        </div>
        )
    }

    const cardAmount = selectedCard ? selectedCard.amountMinor / 100 : 0
    const purchaseAmount = purchaseDetails.amount
    const amountDifference = cardAmount - purchaseAmount

    return (
        <div className="max-w-lg mx-auto animate-fadeIn">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold dashboard-text-primary mb-2">
            Confirm Payment
            </h2>
            <p className="text-sm dashboard-text-secondary">
            Review your payment details before proceeding
            </p>
        </div>
        
        <div className="dashboard-modal-card mb-6 shadow-md">
            <div className="space-y-4">
            {/* Payment Summary */}
            <div className="pb-4 border-b dashboard-border">
                <h3 className="text-sm font-semibold dashboard-text-primary mb-3 uppercase tracking-wide">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="dashboard-text-secondary">Gift Card Amount</span>
                    <span className="font-medium dashboard-text-primary">
                    {purchaseDetails.currency} {cardAmount.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="dashboard-text-secondary">Purchase Amount</span>
                    <span className="font-medium dashboard-text-primary">
                    {purchaseDetails.currency} {purchaseAmount.toFixed(2)}
                    </span>
                </div>
                {amountDifference > 0 && (
                    <div className="flex justify-between text-xs text-[#0066ff] dark:text-[#0066ff]">
                    <span>Leftover Balance</span>
                    <span>+{purchaseDetails.currency} {amountDifference.toFixed(2)}</span>
                    </div>
                )}
                </div>
            </div>

            {/* Conversion Rate */}
            {conversionRate && (
                <div className="pb-4 border-b dashboard-border">
                <div className="flex justify-between items-center text-sm">
                    <span className="dashboard-text-secondary">Conversion Rate</span>
                    <span className="font-medium dashboard-text-primary">
                    1 {purchaseDetails.currency} = ${conversionRate.rate.toFixed(4)} USD
                    </span>
                </div>
                </div>
            )}

            {/* Total Charge */}
            <div className="pb-4 border-b dashboard-border">
                <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium dashboard-text-secondary uppercase tracking-wide">Total Charge</span>
                <div className="text-right">
                    <div className="text-xl font-bold text-[#0066ff] dark:text-[#0066ff]">
                    ${selectedCard ? selectedCard.amountUSD.toFixed(2) : '0.00'}
                    </div>
                    <div className="text-xs dashboard-text-secondary">cUSD</div>
                </div>
                </div>
            </div>
            
            {/* Wallet */}
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium dashboard-text-secondary uppercase tracking-wide">Wallet</span>
                <span className="text-sm font-semibold dashboard-text-primary">
                {selectedWalletType === "embedded" ? "Mizu Pay Wallet" : "External Wallet"}
                </span>
            </div>
            </div>
        </div>

        {/* Payment Info Note */}
        {selectedCard && selectedWalletType === "embedded" && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                            About the approval transaction
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                            You'll see two transactions in your wallet:
                            <br />
                            <strong>1. Approval:</strong> Approve spending <strong>${selectedCard.amountUSD.toFixed(2)} cUSD</strong> (Privy may show this in CELO, but it's actually cUSD)
                            <br />
                            <strong>2. Payment:</strong> Pay <strong>${selectedCard.amountUSD.toFixed(2)} cUSD</strong> for your purchase
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Payment Button */}
        <div className="mb-6">
            <button
                onClick={handlePay}
                disabled={!selectedCard || !selectedWalletType || isProcessing}
                className="w-full py-3 px-6 rounded-lg bg-white text-[#0066ff] hover:bg-white/90 disabled:bg-white/50 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
                Pay Now
            </button>
            {paymentError && paymentStatus === 'idle' && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                    {paymentError}
                </p>
            )}
        </div>
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
    
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails>({
        store: searchParams.get('store') || searchParams.get('storeName') || '',
        amount: parseFloat(searchParams.get('amount') || '0'),
        currency: searchParams.get('currency') || 'INR',
        productName: searchParams.get('productName') || searchParams.get('title') || undefined,
    })
    const [sessionExpired, setSessionExpired] = useState(false)
    const [sessionCreatedAt, setSessionCreatedAt] = useState<Date | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

    // Check session expiration
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch(`/api/sessions/${sessionId}`)
                if (response.ok) {
                    const data = await response.json()
                    setSessionCreatedAt(new Date(data.createdAt))
                    
                    if (data.expired || data.status === 'expired') {
                        setSessionExpired(true)
                        setTimeRemaining(0)
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
                console.error('Error checking session:', error)
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

    return (
        <div className="min-h-screen hero-bg relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10 px-5 py-16">
            <div className="max-w-4xl mx-auto">
            {/* Session Expiration Warning */}
            {sessionExpired ? (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Session Expired
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                        This checkout session has expired. Please start a new checkout.
                    </p>
                    </div>
                </div>
                </div>
            ) : timeRemaining !== null && timeRemaining < 300 ? (
                <div className="mb-6 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Session expires in {formatTimeRemaining(timeRemaining)}. Please complete your purchase soon.
                    </p>
                </div>
                </div>
            ) : null}

            <ProgressIndicator currentStep={checkoutState.step} />
            
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
        </div>
        </div>
    )
    }

