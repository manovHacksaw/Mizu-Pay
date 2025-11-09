// Popup script - displays checkout summary and handles payment

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const checkoutSummary = document.getElementById('checkoutSummary');
    const payButton = document.getElementById('payButton');

    // Get checkout details from storage
    try {
        const result = await chrome.storage.local.get(['currentCheckout']);
        const checkout = result.currentCheckout;

        // Hide loading
        loading.style.display = 'none';

        if (!checkout || !checkout.totalAmount) {
            // No checkout found
            emptyState.style.display = 'block';
            return;
        }

        // Display checkout summary
        displayCheckoutSummary(checkout);
        checkoutSummary.style.display = 'block';

        // Setup pay button
        payButton.addEventListener('click', () => {
            handlePayment(checkout);
        });

    } catch (error) {
        console.error('Error loading checkout:', error);
        loading.style.display = 'none';
        emptyState.style.display = 'block';
    }
});

// Store detection utility (same as in content.js)
function detectStoreFromUrl(url) {
    const STORE_MAP = {
        amazon: "Amazon",
        flipkart: "Flipkart",
        myntra: "Myntra",
        ajio: "Ajio",
        makemytrip: "MakeMyTrip",
        swiggy: "Swiggy",
        zomato: "Zomato",
        jiomart: "JioMart",
        tatacliq: "Tata Cliq"
    };

    try {
        const urlObj = new URL(url);
        let hostname = urlObj.hostname.toLowerCase();
        
        // Remove common prefixes
        hostname = hostname.replace(/^(www\.|m\.|secure\.|checkout\.|payments\.|payment\.|shop\.|store\.|buy\.)/, '');
        
        // Extract main domain
        const parts = hostname.split('.');
        let normalizedDomain = hostname;
        
        if (parts.length > 2) {
            normalizedDomain = parts.slice(1).join('.');
        }
        
        const baseDomain = normalizedDomain.split('.')[0];
        
        // Try direct match
        if (STORE_MAP[baseDomain]) {
            return STORE_MAP[baseDomain];
        }
        
        // Try full normalized domain match
        if (STORE_MAP[normalizedDomain]) {
            return STORE_MAP[normalizedDomain];
        }
        
        // Fallback: Capitalize
        return baseDomain.charAt(0).toUpperCase() + baseDomain.slice(1);
    } catch (e) {
        return 'Unknown Store';
    }
}

// Function to check if a store supports gift cards
function getStoreGiftCardSupport(storeName) {
    const supportedStores = [
        "Amazon",
        "Flipkart",
        "Myntra",
        "MakeMyTrip",
        "Ajio",
        "Tata Cliq"
    ];
    
    return supportedStores.includes(storeName);
}

function displayCheckoutSummary(checkout) {
    // Detect store name from URL if not already set
    let storeName = checkout.storeName;
    if (!storeName || storeName === 'Unknown Store' || storeName.toLowerCase() === 'payments') {
        storeName = detectStoreFromUrl(checkout.url || '');
    }
    
    // Display store name
    const storeNameEl = document.getElementById('storeName');
    storeNameEl.textContent = storeName;

    // Display gift card support status
    const giftCardStatusEl = document.getElementById('giftCardStatus');
    const giftCardStatusTextEl = document.getElementById('giftCardStatusText');
    const supportsGiftCards = getStoreGiftCardSupport(storeName);
    
    if (supportsGiftCards) {
        giftCardStatusEl.style.display = 'flex';
        giftCardStatusTextEl.textContent = '✅ Gift Cards Supported';
        giftCardStatusTextEl.style.color = '#10b981'; // emerald-500
    } else {
        giftCardStatusEl.style.display = 'flex';
        giftCardStatusTextEl.textContent = '⚠️ Gift Card Support Unknown';
        giftCardStatusTextEl.style.color = '#f59e0b'; // amber-500
    }

    // Display total amount
    const totalAmountEl = document.getElementById('totalAmount');
    const amountValueEl = document.getElementById('amountValue');
    const amountCurrencyEl = document.getElementById('amountCurrency');
    const currencyEl = document.getElementById('currency');

    const amount = parseFloat(checkout.totalAmount) || 0;
    const currency = checkout.currency || 'USD';
    
    // Format amount with currency symbol
    const formattedAmount = formatCurrency(amount, currency);
    
    totalAmountEl.textContent = formattedAmount;
    amountValueEl.textContent = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    amountCurrencyEl.textContent = currency;
    currencyEl.textContent = currency;
    
    // Update checkout object with detected store name for payment
    checkout.storeName = storeName;
}

function formatCurrency(amount, currency) {
    const currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹',
        'CAD': '$',
        'AUD': '$',
        'CNY': '¥'
    };

    const symbol = currencySymbols[currency] || currency + ' ';
    return symbol + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

async function handlePayment(checkout) {
    const payButton = document.getElementById('payButton');
    
    // Disable button and show loading
    payButton.disabled = true;
    payButton.textContent = 'Redirecting...';

    try {
        // Build checkout URL with query parameters
        const checkoutUrl = 'http://localhost:3000/checkout?' + new URLSearchParams({
            storeName: checkout.storeName || '',
            amount: checkout.totalAmount || '',
            currency: checkout.currency || '',
            url: checkout.url || '',
            source: 'extension' // Flag to indicate coming from extension
        });
        
        // Open checkout page in new tab
        chrome.tabs.create({ url: checkoutUrl });
        
        // Close popup after a short delay
        setTimeout(() => {
            window.close();
        }, 500);

    } catch (error) {
        console.error('Payment error:', error);
        alert('Error initiating payment: ' + error.message);
        
        payButton.disabled = false;
        payButton.textContent = 'Pay with Mizu Pay';
    }
}

