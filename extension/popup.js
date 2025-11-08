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

function displayCheckoutSummary(checkout) {
    // Display store name
    const storeNameEl = document.getElementById('storeName');
    storeNameEl.textContent = checkout.storeName || 'Unknown Store';

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

