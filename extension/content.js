// Mizu Pay Content Script
// This script runs on every webpage and detects checkout pages

console.log("Mizu Pay Extension: Content script loaded on", window.location.href);

// Step 1: Function to detect if current page is a checkout page
function isCheckoutPage() {
    const url = window.location.href.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    
    // Check URL patterns for checkout pages
    const checkoutPatterns = [
        '/checkout',
        '/cart',
        '/payment',
        '/billing',
        '/order',
        '/confirm',
        '/review'
    ];
    
    // Check if URL contains checkout-related keywords
    const hasCheckoutUrl = checkoutPatterns.some(pattern => 
        pathname.includes(pattern)
    );
    
    // Check for common checkout page elements in the DOM
    const checkoutSelectors = [
        'form[action*="checkout"]',
        'input[name*="payment"]',
        'button[type="submit"][id*="checkout"]',
        '.checkout',
        '#checkout',
        '[data-testid*="checkout"]'
    ];
    
    const hasCheckoutElements = checkoutSelectors.some(selector => {
        try {
            return document.querySelector(selector) !== null;
        } catch (e) {
            return false;
        }
    });
    
    // Return true if either URL pattern OR DOM elements match
    return hasCheckoutUrl || hasCheckoutElements;
}

// Step 2: Function to detect if page supports gift cards
function hasGiftCardSupport() {
    // Check for gift card input fields by name attribute
    const giftCardInputs = [
        'input[name*="gift"]',
        'input[name*="giftcard"]',
        'input[name*="gift-card"]',
        'input[name*="giftcertificate"]',
        'input[name*="voucher"]',
        'input[name*="promo"]',
        'input[id*="gift"]',
        'input[id*="giftcard"]',
        'input[placeholder*="gift"]',
        'input[placeholder*="voucher"]',
        'input[placeholder*="promo"]'
    ];
    
    // Check if any gift card input fields exist
    const hasGiftCardInputs = giftCardInputs.some(selector => {
        try {
            return document.querySelector(selector) !== null;
        } catch (e) {
            return false;
        }
    });
    
    // Check for gift card related text in the page
    // Expanded keywords to catch more patterns (including Myntra's "Have a Gift Card?")
    const giftCardKeywords = [
        'gift card',
        'giftcard',
        'gift-card',
        'gift certificate',
        'gift voucher',
        'promo code',
        'promocode',
        'voucher code',
        'redeem gift card',
        'have a gift card',
        'apply gift card',
        'gift card code',
        'enter gift card',
        'use gift card',
        'gift voucher',
        'coupon code',
        'discount code',
        'apply coupon',
        'apply voucher'
    ];
    
    // Get all text content from the page (lowercase for comparison)
    const pageText = document.body.innerText.toLowerCase();
    const pageHTML = document.body.innerHTML.toLowerCase();
    
    // Check if any gift card keywords appear in the page text
    const hasGiftCardText = giftCardKeywords.some(keyword => 
        pageText.includes(keyword) || pageHTML.includes(keyword)
    );
    
    // Check for gift card related buttons/links with more comprehensive selectors
    const giftCardSelectors = [
        'button[id*="gift"]',
        'button[id*="giftcard"]',
        'button[id*="voucher"]',
        'button[id*="promo"]',
        'button[id*="coupon"]',
        'a[href*="gift"]',
        'a[href*="voucher"]',
        'a[href*="promo"]',
        'a[href*="coupon"]',
        '.gift-card',
        '.giftcard',
        '.gift-card-button',
        '#gift-card',
        '#giftcard',
        '[data-testid*="gift"]',
        '[data-testid*="voucher"]',
        '[aria-label*="gift"]',
        '[aria-label*="voucher"]',
        '[title*="gift"]',
        '[title*="voucher"]'
    ];
    
    const hasGiftCardElements = giftCardSelectors.some(selector => {
        try {
            return document.querySelector(selector) !== null;
        } catch (e) {
            return false;
        }
    });
    
    // Check for buttons/clickable elements that contain gift card text
    // This catches cases like "APPLY GIFT CARD" button on Myntra
    let hasGiftCardButtons = false;
    try {
        const buttons = document.querySelectorAll('button, a, [role="button"], [onclick], .btn, [class*="button"]');
        for (const button of buttons) {
            const buttonText = (button.textContent || button.innerText || '').toLowerCase();
            const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
            const title = (button.getAttribute('title') || '').toLowerCase();
            const combinedText = buttonText + ' ' + ariaLabel + ' ' + title;
            
            // Check if button text contains gift card related keywords
            if (giftCardKeywords.some(keyword => combinedText.includes(keyword))) {
                hasGiftCardButtons = true;
                break;
            }
        }
    } catch (e) {
        // Ignore errors
    }
    
    // Return true if any indicator of gift card support is found
    return hasGiftCardInputs || hasGiftCardText || hasGiftCardElements || hasGiftCardButtons;
}

// Store detection utility function
function detectStore() {
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

    // Get hostname and normalize it
    let hostname = window.location.hostname.toLowerCase();
    
    // Remove common prefixes: www., m., secure., checkout., payments., etc.
    hostname = hostname.replace(/^(www\.|m\.|secure\.|checkout\.|payments\.|payment\.|shop\.|store\.|buy\.)/, '');
    
    // Extract main domain (e.g., "payments.makemytrip.com" -> "makemytrip")
    // Split by dots and take the domain parts (usually last 2 parts, but handle subdomains)
    const parts = hostname.split('.');
    let normalizedDomain = hostname;
    
    // If we have subdomains, extract the main domain
    // e.g., "payments.makemytrip.com" -> "makemytrip.com" -> "makemytrip"
    if (parts.length > 2) {
        // Remove the first part (subdomain) and join the rest
        normalizedDomain = parts.slice(1).join('.');
    }
    
    // Extract base domain name (without TLD)
    const baseDomain = normalizedDomain.split('.')[0];
    
    // Try direct match in STORE_MAP
    if (STORE_MAP[baseDomain]) {
        return STORE_MAP[baseDomain];
    }
    
    // Try full normalized domain match
    if (STORE_MAP[normalizedDomain]) {
        return STORE_MAP[normalizedDomain];
    }
    
    // Try inference from document.title
    const title = document.title.toLowerCase();
    for (const [key, value] of Object.entries(STORE_MAP)) {
        if (title.includes(key)) {
            return value;
        }
    }
    
    // Fallback: Capitalize the cleaned hostname
    return baseDomain.charAt(0).toUpperCase() + baseDomain.slice(1);
}

// Function to check if a store supports gift cards
function getStoreGiftCardSupport(storeName) {
    // Known stores that support gift cards (from our database)
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

// Function to extract checkout details from the page
function extractCheckoutDetails() {
    const details = {
        storeName: null,
        url: window.location.href,
        totalAmount: null,
        currency: null
    };
    
    // Use the new detectStore() function
    details.storeName = detectStore();
    
    // Extract Total Amount - More comprehensive detection
    // Helper function to extract number from text
    const extractNumber = (text) => {
        if (!text) return null;
        // Match currency symbols followed by numbers, or numbers with decimals
        // Handles: $99.99, €100,50, £1,234.56, 99.99, etc.
        const patterns = [
            /[\$€£¥₹₽₦₵]\s*([\d,]+\.?\d*)/,  // Currency symbol before
            /([\d,]+\.?\d*)\s*[\$€£¥₹₽₦₵]/,  // Currency symbol after
            /([\d,]+\.\d{2})/,                // Decimal with 2 places
            /([\d,]+\.\d{1,2})/,             // Decimal with 1-2 places
            /([\d,]+)/                        // Any number with commas
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const num = match[1].replace(/,/g, '');
                const parsed = parseFloat(num);
                // Only accept reasonable amounts (0.01 to 10000000)
                if (!isNaN(parsed) && parsed >= 0.01 && parsed <= 10000000) {
                    return num;
                }
            }
        }
        return null;
    };
    
    // Strategy 1: Look for data attributes and value attributes
    // Prioritize "total" attributes over "price" attributes
    const dataValueSelectors = [
        '[data-total]',
        '[data-total-price]',
        '[data-total-amount]',
        '[data-order-total]',
        '[data-grand-total]',
        '[data-price-total]',
        '[itemprop="totalPrice"]',
        '[data-price]',
        '[data-amount]',
        '[data-value]',
        '[itemprop="price"]'
    ];
    
    // Helper to check if element is a total (not subtotal)
    const isTotalContext = (element) => {
        const text = (element.textContent || element.innerText || '').toLowerCase();
        const parentText = (element.parentElement?.textContent || '').toLowerCase();
        const combinedText = text + ' ' + parentText;
        
        // Exclude subtotals
        if (combinedText.includes('subtotal') || 
            combinedText.includes('price (') || 
            combinedText.includes('items)')) {
            return false;
        }
        // Include totals
        return combinedText.includes('total amount') ||
               combinedText.includes('grand total') ||
               combinedText.includes('order total') ||
               combinedText.includes('final total') ||
               combinedText.includes('pay ');
    };
    
    const totalCandidates = [];
    
    for (const selector of dataValueSelectors) {
        try {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                // Check data attributes first
                const dataValue = element.getAttribute('data-total') ||
                                element.getAttribute('data-total-price') ||
                                element.getAttribute('data-total-amount') ||
                                element.getAttribute('data-order-total') ||
                                element.getAttribute('data-grand-total') ||
                                element.getAttribute('data-price') ||
                                element.getAttribute('data-amount') ||
                                element.getAttribute('data-value') ||
                                element.getAttribute('content') ||
                                element.getAttribute('value');
                
                if (dataValue) {
                    const num = extractNumber(dataValue);
                    if (num) {
                        const isTotal = isTotalContext(element);
                        totalCandidates.push({
                            amount: num,
                            value: parseFloat(num),
                            isTotal: isTotal,
                            priority: selector.includes('total') ? 1 : 2
                        });
                    }
                }
                
                // Check text content
                const text = element.textContent || element.innerText || '';
                const num = extractNumber(text);
                if (num) {
                    const isTotal = isTotalContext(element);
                    totalCandidates.push({
                        amount: num,
                        value: parseFloat(num),
                        isTotal: isTotal,
                        priority: selector.includes('total') ? 1 : 2
                    });
                }
            }
        } catch (e) {
            continue;
        }
    }
    
    // Sort: prioritize totals, then by priority (total attributes first), then by amount (largest)
    if (totalCandidates.length > 0) {
        totalCandidates.sort((a, b) => {
            if (a.isTotal && !b.isTotal) return -1;
            if (!a.isTotal && b.isTotal) return 1;
            if (a.priority !== b.priority) return a.priority - b.priority;
            return b.value - a.value;
        });
        
        const bestCandidate = totalCandidates.find(c => c.isTotal) || totalCandidates[0];
        details.totalAmount = bestCandidate.amount;
    }
    
    // Strategy 2: Look for common class/id selectors
    // Prioritize "Total Amount" over subtotals
    if (!details.totalAmount) {
        const classIdSelectors = [
            '.total',
            '.total-price',
            '.order-total',
            '.checkout-total',
            '.grand-total',
            '.price-total',
            '.final-total',
            '.amount-total',
            '#total',
            '#total-price',
            '#order-total',
            '#checkout-total',
            '#grand-total',
            '[class*="total"]',
            '[id*="total"]',
            '[class*="price"]',
            '[class*="amount"]',
            '[data-testid*="total"]',
            '[data-testid*="price"]'
        ];
        
        // Helper to check if text indicates a total (not subtotal)
        const isTotalElement = (text) => {
            const lowerText = text.toLowerCase();
            // Exclude subtotals and item prices
            if (lowerText.includes('subtotal') || 
                lowerText.includes('price (') || 
                lowerText.includes('items)') ||
                lowerText.includes('item price') ||
                lowerText.includes('product price')) {
                return false;
            }
            // Include totals, grand totals, final amounts
            return lowerText.includes('total') || 
                   lowerText.includes('grand') ||
                   lowerText.includes('final amount') ||
                   lowerText.includes('pay ') ||
                   lowerText.includes('amount due');
        };
        
        // Collect all amounts with their context
        const amountCandidates = [];
        
        for (const selector of classIdSelectors) {
            try {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    const text = element.textContent || element.innerText || '';
                    const num = extractNumber(text);
                    if (num) {
                        const isTotal = isTotalElement(text);
                        const parentText = element.parentElement?.textContent?.toLowerCase() || '';
                        const isParentTotal = isTotalElement(parentText);
                        
                        amountCandidates.push({
                            amount: num,
                            value: parseFloat(num),
                            isTotal: isTotal || isParentTotal,
                            text: text.substring(0, 100),
                            element: element
                        });
                    }
                }
            } catch (e) {
                continue;
            }
        }
        
        // Sort candidates: prioritize totals, then by amount (largest first)
        amountCandidates.sort((a, b) => {
            if (a.isTotal && !b.isTotal) return -1;
            if (!a.isTotal && b.isTotal) return 1;
            // If both are totals or both are not, prefer larger amount
            return b.value - a.value;
        });
        
        // Take the first candidate (best match)
        if (amountCandidates.length > 0) {
            // Prefer total elements, but if we only have non-totals, take the largest
            const bestCandidate = amountCandidates.find(c => c.isTotal) || amountCandidates[0];
            details.totalAmount = bestCandidate.amount;
            console.log('Selected amount from:', bestCandidate.text.substring(0, 50));
        }
    }
    
    // Strategy 3: Look for structured data (JSON-LD)
    if (!details.totalAmount) {
        try {
            const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of jsonLdScripts) {
                try {
                    const data = JSON.parse(script.textContent);
                    const findPrice = (obj) => {
                        if (typeof obj !== 'object' || obj === null) return null;
                        if (obj.price) {
                            const price = extractNumber(String(obj.price));
                            if (price) return price;
                        }
                        if (obj.totalPrice) {
                            const price = extractNumber(String(obj.totalPrice));
                            if (price) return price;
                        }
                        for (const key in obj) {
                            const result = findPrice(obj[key]);
                            if (result) return result;
                        }
                        return null;
                    };
                    const price = findPrice(data);
                    if (price) {
                        details.totalAmount = price;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
        } catch (e) {
            // Ignore JSON-LD errors
        }
    }
    
    // Strategy 4: Comprehensive text search with improved patterns
    // Prioritize "Total Amount" over subtotals
    if (!details.totalAmount) {
        const pageText = document.body.innerText || document.body.textContent || '';
        
        // More comprehensive regex patterns - prioritize "Total Amount" first
        const textPatterns = [
            // First, look specifically for "Total Amount" (highest priority)
            /total\s+amount[:\s]*[\$€£¥₹₽₦₵]?\s*([\d,]+\.?\d*)/i,
            /total\s+amount[:\s]*([\d,]+\.?\d*)/i,
            
            // Then look for other total indicators (excluding subtotals)
            /(?:grand\s*total|order\s*total|final\s*amount|pay\s*amount|amount\s*due)[:\s]*[\$€£¥₹₽₦₵]?\s*([\d,]+\.?\d*)/i,
            /[\$€£¥₹₽₦₵]\s*([\d,]+\.?\d*)\s*(?:total|due|pay)(?!\s*subtotal)/i,
            /(?:you\s*owe|pay\s*now|total\s*payable)[:\s]*[\$€£¥₹₽₦₵]?\s*([\d,]+\.?\d*)/i,
            
            // Pattern that gets total after subtotal (captures the total, not subtotal)
            /(?:subtotal|price\s*\([^)]*\)|items)[:\s]*[\$€£¥₹₽₦₵]?\s*[\d,]+\.?\d*[^\d]*total\s*(?:amount)?[:\s]*[\$€£¥₹₽₦₵]?\s*([\d,]+\.?\d*)/i,
            
            // Standard currency format (lowest priority)
            /[\$€£¥₹₽₦₵]\s*([\d]{1,3}(?:[,]\d{3})*(?:\.\d{2})?)/,
        ];
        
        // Collect all matches with context
        const textMatches = [];
        
        for (const pattern of textPatterns) {
            const matches = pageText.matchAll(new RegExp(pattern.source, 'gi'));
            for (const match of matches) {
                // If pattern has multiple groups, prefer the last one (usually total)
                const amountStr = match[match.length - 1] || match[1];
                if (amountStr) {
                    const num = amountStr.replace(/,/g, '');
                    const parsed = parseFloat(num);
                    if (!isNaN(parsed) && parsed >= 0.01) {
                        // Get context around the match
                        const matchIndex = match.index;
                        const contextStart = Math.max(0, matchIndex - 50);
                        const contextEnd = Math.min(pageText.length, matchIndex + match[0].length + 50);
                        const context = pageText.substring(contextStart, contextEnd).toLowerCase();
                        
                        // Check if this is a total (not subtotal)
                        const isTotal = context.includes('total amount') ||
                                       context.includes('grand total') ||
                                       context.includes('order total') ||
                                       context.includes('final total') ||
                                       context.includes('pay ') ||
                                       (!context.includes('subtotal') && 
                                        !context.includes('price (') && 
                                        !context.includes('items)'));
                        
                        textMatches.push({
                            amount: num,
                            value: parsed,
                            isTotal: isTotal,
                            priority: context.includes('total amount') ? 1 : 
                                     context.includes('grand total') ? 2 : 
                                     context.includes('total') ? 3 : 4
                        });
                    }
                }
            }
        }
        
        // Sort matches: prioritize totals, then by priority, then by amount (largest)
        if (textMatches.length > 0) {
            textMatches.sort((a, b) => {
                if (a.isTotal && !b.isTotal) return -1;
                if (!a.isTotal && b.isTotal) return 1;
                if (a.priority !== b.priority) return a.priority - b.priority;
                return b.value - a.value;
            });
            
            // Prefer total matches, but if none, take the largest
            const bestMatch = textMatches.find(m => m.isTotal) || textMatches[0];
            details.totalAmount = bestMatch.amount;
        }
    }
    
    // Strategy 5: Look for input fields with price values
    if (!details.totalAmount) {
        const priceInputs = document.querySelectorAll('input[type="hidden"][value*="."], input[name*="total"], input[name*="amount"], input[name*="price"]');
        for (const input of priceInputs) {
            const value = input.value || input.getAttribute('value') || '';
            const num = extractNumber(value);
            if (num) {
                details.totalAmount = num;
                break;
            }
        }
    }
    
    // Strategy 6: Find all numbers on page and take the largest reasonable one (last resort)
    if (!details.totalAmount) {
        const pageText = document.body.innerText || '';
        const allNumbers = pageText.match(/[\$€£¥₹₽₦₵]?\s*([\d,]+\.?\d{2})/g);
        if (allNumbers && allNumbers.length > 0) {
            const amounts = allNumbers
                .map(match => {
                    const num = extractNumber(match);
                    return num ? parseFloat(num) : null;
                })
                .filter(num => num !== null && num >= 1 && num <= 100000); // Reasonable range
            
            if (amounts.length > 0) {
                // Take the largest amount (likely the total)
                const maxAmount = Math.max(...amounts);
                details.totalAmount = maxAmount.toFixed(2);
            }
        }
    }
    
    // Debug logging
    if (details.totalAmount) {
        console.log('✅ Total amount detected:', details.totalAmount);
    } else {
        console.warn('⚠️ Total amount not detected. Debug info:');
        console.log('Page text sample:', (document.body.innerText || '').substring(0, 500));
        console.log('All price-like elements:', Array.from(document.querySelectorAll('[class*="price"], [class*="total"], [id*="price"], [id*="total"]')).map(el => ({
            selector: el.tagName + (el.className ? '.' + el.className : '') + (el.id ? '#' + el.id : ''),
            text: (el.textContent || '').substring(0, 100)
        })));
    }
    
    // Extract Currency
    // Look for currency symbols or currency codes
    const currencySymbols = {
        '$': 'USD',
        '€': 'EUR',
        '£': 'GBP',
        '¥': 'JPY',
        '₹': 'INR',
        '₽': 'RUB',
        '₦': 'NGN',
        '₵': 'GHS'
    };
    
    // Look for currency in meta tags
    const currencyMetaSelectors = [
        'meta[property="product:price:currency"]',
        'meta[name="currency"]',
        '[data-currency]',
        '[itemprop="priceCurrency"]'
    ];
    
    for (const selector of currencyMetaSelectors) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                details.currency = element.getAttribute('content') || 
                                  element.getAttribute('data-currency') ||
                                  element.textContent?.trim().toUpperCase();
                if (details.currency && details.currency.length <= 4) break;
            }
        } catch (e) {
            continue;
        }
    }
    
    // If not found, detect from price display
    if (!details.currency) {
        const pageText = document.body.innerText || '';
        // Look for currency symbols
        for (const [symbol, code] of Object.entries(currencySymbols)) {
            if (pageText.includes(symbol)) {
                details.currency = code;
                break;
            }
        }
        
        // Look for currency codes (USD, EUR, etc.)
        if (!details.currency) {
            const currencyCodePattern = /\b(USD|EUR|GBP|JPY|INR|CAD|AUD|CHF|CNY|NZD|SEK|NOK|DKK|SGD|HKD|MXN|BRL|ZAR|RUB|TRY|KRW|PLN)\b/i;
            const match = pageText.match(currencyCodePattern);
            if (match) {
                details.currency = match[1].toUpperCase();
            }
        }
    }
    
    // Default currency if not found
    if (!details.currency) {
        details.currency = 'USD'; // Default fallback
    }
    
    return details;
}

// Step 3: Function to inject the "Pay With Mizu Pay" button
function injectMizuPayButton() {
    // Check if button already exists (avoid duplicates)
    if (document.getElementById('mizu-pay-button')) {
        return; // Button already exists
    }
    
    // Create the button element
    const button = document.createElement('div');
    button.id = 'mizu-pay-button';
    button.textContent = 'Pay With Mizu Pay';
    
    // Style the button (positioned in bottom-right corner)
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
    `;
    
    // Add hover effect
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#0056b3';
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#007bff';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
    
    // Add click handler - sends message to background.js
    button.addEventListener('click', () => {
        console.log('Pay With Mizu Pay clicked!');
        
        // Check if extension runtime is available
        if (!chrome.runtime || !chrome.runtime.sendMessage) {
            console.error('Chrome runtime not available');
            return;
        }
        
        // Extract checkout details from the page
        const checkoutDetails = extractCheckoutDetails();
        console.log('Extracted checkout details:', checkoutDetails);
        
        // Send message to background.js with all checkout details
        chrome.runtime.sendMessage({
            type: 'MIZU_PAY_CLICKED',
            data: {
                ...checkoutDetails,
                timestamp: new Date().toISOString()
            }
        }, (response) => {
            // Handle response from background.js
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError.message || chrome.runtime.lastError);
            } else if (response) {
                console.log('Response from background:', response);
            }
        });
    });
    
    // Inject the button into the page
    document.body.appendChild(button);
    console.log("✅ Mizu Pay button injected!");
}

// Main logic: Check conditions and inject button if both are met
if (isCheckoutPage()) {
    console.log("✅ Checkout page detected!");
    
    // Enhanced gift card detection with debug info
    const giftCardSupport = hasGiftCardSupport();
    
    if (giftCardSupport) {
        console.log("✅ Gift card support detected!");
        // Inject the button when both conditions are met
        injectMizuPayButton();
    } else {
        console.log("❌ No gift card support found");
        // Debug: Check what we found
        const pageText = document.body.innerText.toLowerCase();
        const giftCardKeywords = ['gift card', 'giftcard', 'have a gift card', 'apply gift card', 'voucher', 'promo code'];
        const foundKeywords = giftCardKeywords.filter(keyword => pageText.includes(keyword));
        if (foundKeywords.length > 0) {
            console.log("⚠️ Found gift card keywords but detection failed:", foundKeywords);
        }
    }
} else {
    console.log("❌ Not a checkout page");
}
