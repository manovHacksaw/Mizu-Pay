// CELO Checkout Helper - Content Script
console.log('CELO Extension: Content script loaded on', window.location.href);

// Blacklist of domains where we don't want to show the popup
const blacklistedDomains = [
    'chatgpt.com', 'openai.com', 'claude.ai', 'anthropic.com',
    'bard.google.com', 'gemini.google.com', 'bing.com', 'google.com',
    'youtube.com', 'facebook.com', 'twitter.com', 'x.com',
    'instagram.com', 'linkedin.com', 'reddit.com', 'github.com',
    'stackoverflow.com', 'wikipedia.org', 'news.ycombinator.com'
];

// Checkout detection keywords
const checkoutKeywords = [
    'checkout', 'cart', 'payment', 'place order', 'pay now', 
    'billing', 'order summary', 'complete purchase', 'buy now'
];

const payButtonKeywords = [
    'pay', 'pay now', 'place order', 'complete purchase', 
    'checkout', 'confirm', 'buy now', 'purchase'
];

// Currency detection patterns
const currencyPatterns = {
    'USD': /\$[\d,]+\.?\d*/g,
    'EUR': /€[\d,]+\.?\d*/g,
    'GBP': /£[\d,]+\.?\d*/g,
    'INR': /₹[\d,]+\.?\d*/g,
    'JPY': /¥[\d,]+\.?\d*/g,
    'CAD': /C\$[\d,]+\.?\d*/g,
    'AUD': /A\$[\d,]+\.?\d*/g
};

// Country detection from common patterns
const countryPatterns = {
    'US': ['united states', 'usa', 'america', 'us$', 'dollar'],
    'IN': ['india', 'indian', 'inr', 'rupee', '₹'],
    'GB': ['united kingdom', 'uk', 'britain', 'pound', '£'],
    'EU': ['europe', 'euro', '€', 'european'],
    'CA': ['canada', 'canadian', 'cad', 'c$'],
    'AU': ['australia', 'australian', 'aud', 'a$'],
    'JP': ['japan', 'japanese', 'yen', '¥']
};

function isBlacklisted() {
    const currentDomain = window.location.hostname.toLowerCase();
    return blacklistedDomains.some(domain => 
        currentDomain === domain || currentDomain.endsWith('.' + domain)
    );
}

function textOf(node) {
    return node && node.textContent ? node.textContent.toLowerCase().trim() : '';
}

// Extract amount and currency from text
function extractAmountAndCurrency(text) {
    const amounts = [];
    
    // Try each currency pattern
    for (const [currency, pattern] of Object.entries(currencyPatterns)) {
        const matches = text.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const amount = parseFloat(match.replace(/[^\d.,]/g, ''));
                if (amount > 0) {
                    amounts.push({ amount, currency, original: match });
                }
            });
        }
    }
    
    // If no currency symbols found, look for numbers that might be amounts
    if (amounts.length === 0) {
        const numberMatches = text.match(/\b\d+[.,]\d{2}\b/g);
        if (numberMatches) {
            numberMatches.forEach(match => {
                const amount = parseFloat(match.replace(',', ''));
                if (amount > 0) {
                    amounts.push({ amount, currency: 'USD', original: match });
                }
            });
        }
    }
    
    return amounts;
}

// Detect country from page content
function detectCountry() {
    const pageText = document.body.textContent.toLowerCase();
    
    for (const [country, patterns] of Object.entries(countryPatterns)) {
        if (patterns.some(pattern => pageText.includes(pattern))) {
            return country;
        }
    }
    
    return 'US'; // Default to US
}

// Extract store name
function extractStoreName() {
    // Try to get store name from various sources
    const title = document.title;
    const metaTitle = document.querySelector('meta[property="og:title"]')?.content;
    const metaSiteName = document.querySelector('meta[property="og:site_name"]')?.content;
    
    // Extract from title (remove common suffixes)
    let storeName = metaSiteName || metaTitle || title;
    storeName = storeName.replace(/\s*-\s*(checkout|cart|payment|order).*$/i, '');
    storeName = storeName.replace(/\s*-\s*.*$/i, ''); // Remove everything after last dash
    
    return storeName || 'Online Store';
}

// Extract product description
function extractProductDescription() {
    const selectors = [
        'h1', 'h2', '.product-title', '.product-name', 
        '.item-name', '.cart-item', '.order-item'
    ];
    
    const descriptions = [];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 3 && text.length < 100) {
                descriptions.push(text);
            }
        });
    });
    
    return descriptions.slice(0, 3).join(', ') || 'Shopping Cart';
}

// URL check for checkout keywords
function urlCheck() {
    const url = location.href.toLowerCase();
    const foundKeywords = checkoutKeywords.filter(k => url.includes(k));
    console.log('CELO URL Check:', {
        url: location.href,
        foundKeywords,
        passed: foundKeywords.length > 0
    });
    return foundKeywords.length > 0;
}

// Page text check for checkout indicators
function pageTextCheck() {
    console.log('CELO Page Text Check: Starting...');
    
    // Check headings and meta tags
    const selectors = ['meta', 'h1', 'h2', 'h3'];
    for (const sel of selectors) {
        const nodes = document.querySelectorAll(sel);
        for (const n of nodes) {
            const t = textOf(n);
            if (t) {
                const foundKeywords = checkoutKeywords.filter(k => t.includes(k));
                if (foundKeywords.length > 0) {
                    console.log('CELO Page Text Check: Found match in', sel, {
                        text: t.substring(0, 100),
                        keywords: foundKeywords
                    });
                    return true;
                }
            }
        }
    }
    
    // Check forms for payment-related fields
    const forms = document.querySelectorAll('form');
    for (const f of forms) {
        const formText = textOf(f);
        if (formText) {
            const foundKeywords = checkoutKeywords.filter(k => formText.includes(k));
            if (foundKeywords.length > 0) {
                console.log('CELO Page Text Check: Found form with keywords', {
                    keywords: foundKeywords,
                    formText: formText.substring(0, 100)
                });
                return true;
            }
        }
        
        const inputs = f.querySelectorAll('input, select');
        for (const i of inputs) {
            const name = (i.name || i.id || i.placeholder || '').toLowerCase();
            if (/card|cc|billing|cvv|expiry|zip|address|payment/.test(name)) {
                console.log('CELO Page Text Check: Found payment input', {
                    name: name,
                    element: i.tagName,
                    type: i.type
                });
                return true;
            }
        }
    }
    
    console.log('CELO Page Text Check: No matches found');
    return false;
}

// Check for payment buttons
function payButtonCheck() {
    console.log('CELO Pay Button Check: Starting...');
    const candidates = Array.from(document.querySelectorAll('button, input[type=submit], a'));
    
    const foundButtons = [];
    for (const el of candidates) {
        const t = textOf(el);
        if (t) {
            const foundKeywords = payButtonKeywords.filter(k => t.includes(k));
            if (foundKeywords.length > 0) {
                foundButtons.push({
                    text: t,
                    keywords: foundKeywords,
                    tagName: el.tagName,
                    type: el.type
                });
                console.log('CELO Pay Button Check: Found payment button', {
                    text: t,
                    keywords: foundKeywords,
                    element: el.tagName
                });
            }
        }
    }
    
    console.log('CELO Pay Button Check:', {
        totalCandidates: candidates.length,
        foundButtons: foundButtons.length,
        buttons: foundButtons,
        passed: foundButtons.length > 0
    });
    
    return foundButtons.length > 0;
}

// Extract checkout data
function extractCheckoutData() {
    const storeName = extractStoreName();
    const country = detectCountry();
    const description = extractProductDescription();
    
    // Find amounts on the page
    const pageText = document.body.textContent;
    const amounts = extractAmountAndCurrency(pageText);
    
    // Get the highest amount (likely the total)
    const totalAmount = amounts.length > 0 ? 
        amounts.reduce((max, current) => current.amount > max.amount ? current : max) : 
        { amount: 0, currency: 'USD' };
    
    console.log('CELO Checkout Data:', {
        storeName,
        country,
        description,
        amounts,
        totalAmount
    });
    
    return {
        storeName,
        amount: totalAmount.amount,
        currency: totalAmount.currency,
        country,
        description,
        returnUrl: window.location.href,
        timestamp: Date.now()
    };
}

// Inject CELO checkout popup
function injectPopup() {
    if (document.getElementById('celo-checkout-popup')) {
        console.log('CELO: Popup already exists');
        return;
    }
    
    const checkoutData = extractCheckoutData();
    
    console.log('CELO: Injecting popup with data:', checkoutData);
    
    const div = document.createElement('div');
    div.id = 'celo-checkout-popup';
    div.style.position = 'fixed';
    div.style.right = '18px';
    div.style.bottom = '18px';
    div.style.zIndex = '2147483647';
    div.style.background = '#fff';
    div.style.padding = '16px';
    div.style.borderRadius = '12px';
    div.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
    div.style.border = '1px solid #e0e0e0';
    div.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    div.style.maxWidth = '300px';
    
    const amountText = checkoutData.amount > 0 ? 
        `${checkoutData.currency} ${checkoutData.amount.toFixed(2)}` : 
        'Amount detected';
    
    div.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #35D07F 0%, #2ECC71 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">
          C
        </div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px; color: #333;">Pay with CELO</div>
          <div style="font-size: 12px; color: #666;">${amountText}</div>
        </div>
      </div>
      <div style="font-size: 11px; color: #888; margin-bottom: 12px;">
        Store: ${checkoutData.storeName}<br>
        Country: ${checkoutData.country}
      </div>
      <button id="celo-pay-btn" style="width: 100%; padding: 10px 16px; border-radius: 8px; border: none; background: linear-gradient(135deg, #35D07F 0%, #2ECC71 100%); color: white; cursor: pointer; font-weight: 600; font-size: 14px;">
        Pay with CELO
      </button>
    `;
    
    document.body.appendChild(div);
    
    // Add click handler
    document.getElementById('celo-pay-btn').addEventListener('click', () => {
        console.log('CELO: Pay button clicked');
        
        // Build redirect URL with checkout data
        const params = new URLSearchParams({
            store: checkoutData.storeName,
            amount: checkoutData.amount.toString(),
            currency: checkoutData.currency,
            country: checkoutData.country,
            description: checkoutData.description,
            returnUrl: checkoutData.returnUrl,
            source: 'browser-extension',
            timestamp: checkoutData.timestamp.toString()
        });
        
        const redirectUrl = `http://localhost:3000/payment?${params.toString()}`;
        console.log('CELO: Redirecting to:', redirectUrl);
        
        // Open in new tab
        window.open(redirectUrl, '_blank');
        
        // Update button to show success
        const btn = document.getElementById('celo-pay-btn');
        btn.textContent = 'Opening CELO Pay...';
        btn.style.background = '#28a745';
        btn.disabled = true;
    });
}

// Main evaluation function
function evaluate() {
    // Check if domain is blacklisted
    if (isBlacklisted()) {
        console.log('CELO: Domain is blacklisted, skipping evaluation');
        return;
    }
    
    const urlScore = urlCheck() ? 1 : 0;
    const textScore = pageTextCheck() ? 1 : 0;
    const buttonScore = payButtonCheck() ? 1 : 0;
    const totalScore = urlScore + textScore + buttonScore;
    
    console.log('CELO Extension Debug:', {
        url: location.href,
        urlScore,
        textScore,
        buttonScore,
        totalScore,
        shouldShow: totalScore >= 2
    });
    
    if (totalScore >= 2) {
        console.log('CELO: Showing popup');
        injectPopup();
    }
}

// DOM observer for SPAs
const observer = new MutationObserver((mutations) => {
    console.log('CELO: DOM changed, re-evaluating...', mutations.length, 'mutations');
    
    // Remove existing popup if it exists
    const existingPopup = document.getElementById('celo-checkout-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Re-evaluate
    setTimeout(evaluate, 500);
});

observer.observe(document.documentElement || document.body, { 
    childList: true, 
    subtree: true 
});

// Initial check
console.log('CELO: Starting initial evaluation in 1 second...');
setTimeout(() => {
    console.log('CELO: Running initial evaluation');
    evaluate();
}, 1000);

// Periodic check (fallback)
console.log('CELO: Setting up periodic evaluation every 3 seconds');
setInterval(() => {
    console.log('CELO: Running periodic evaluation');
    evaluate();
}, 3000);
