// Mizu Pay Content Script
// This script runs on every webpage and detects checkout pages

console.log("Mizu Pay Extension: Content script loaded on", window.location.href);

const GIFT_CARD_INPUT_SELECTORS = [
    'input[name*=\"gift\"]',
    'input[name*=\"giftcard\"]',
    'input[name*=\"gift-card\"]',
    'input[name*=\"giftcertificate\"]',
    'input[name*=\"voucher\"]',
    'input[name*=\"promo\"]',
    'input[id*=\"gift\"]',
    'input[id*=\"giftcard\"]',
    'input[placeholder*=\"gift\"]',
    'input[placeholder*=\"voucher\"]',
    'input[placeholder*=\"promo\"]'
];

const GIFT_CARD_KEYWORDS = [
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

const GIFT_CARD_ELEMENT_SELECTORS = [
    'button[id*=\"gift\"]',
    'button[id*=\"giftcard\"]',
    'button[id*=\"voucher\"]',
    'button[id*=\"promo\"]',
    'button[id*=\"coupon\"]',
    'a[href*=\"gift\"]',
    'a[href*=\"voucher\"]',
    'a[href*=\"promo\"]',
    'a[href*=\"coupon\"]',
    '.gift-card',
    '.giftcard',
    '.gift-card-button',
    '#gift-card',
    '#giftcard',
    '[data-testid*=\"gift\"]',
    '[data-testid*=\"voucher\"]',
    '[aria-label*=\"gift\"]',
    '[aria-label*=\"voucher\"]',
    '[title*=\"gift\"]',
    '[title*=\"voucher\"]'
];

let pointerOverlay = null;
let pointerHighlightTarget = null;
let pointerScrollHandler = null;
let pointerResizeHandler = null;
let pointerObserver = null;

// Step 1: Function to detect if current page is a checkout page
function isCheckoutPage() {
    const pathname = window.location.pathname.toLowerCase();
    
    const checkoutPatterns = [
        '/checkout',
        '/cart',
        '/payment',
        '/billing',
        '/order',
        '/confirm',
        '/review'
    ];
    
    const hasCheckoutUrl = checkoutPatterns.some(pattern => 
        pathname.includes(pattern)
    );
    
    const checkoutSelectors = [
        'form[action*=\"checkout\"]',
        'input[name*=\"payment\"]',
        'button[type=\"submit\"][id*=\"checkout\"]',
        '.checkout',
        '#checkout',
        '[data-testid*=\"checkout\"]'
    ];
    
    const hasCheckoutElements = checkoutSelectors.some(selector => {
        try {
            return document.querySelector(selector) !== null;
        } catch (e) {
            return false;
        }
    });
    
    return hasCheckoutUrl || hasCheckoutElements;
}

function hasGiftCardSupport() {
    // Check for gift card input fields (these are specific to payment)
    const hasGiftCardInputs = GIFT_CARD_INPUT_SELECTORS.some(selector => {
        try {
            return document.querySelector(selector) !== null;
        } catch (e) {
            return false;
        }
    });
    
    const pageText = document.body.innerText.toLowerCase();
    const pageHTML = document.body.innerHTML.toLowerCase();
    
    // Exclude general gift features
    const excludePatterns = [
        'this item is a gift',
        'gift message',
        'gift wrap',
        'gift options',
        'choose gift',
        'gift recipient',
        'gift bag',
        'gift box',
        'add gift',
        'save gift',
        'gift receipt',
        'gift note'
    ];
    
    // Only check for "gift card" specifically, not just "gift"
    const giftCardSpecificTerms = [
        'gift card',
        'giftcard',
        'gift-card',
        'gift certificate',
        'gift voucher',
        'redeem gift card',
        'apply gift card',
        'use gift card',
        'enter gift card',
        'gift card code',
        'gift card balance',
        'have a gift card',
        'have an gift card'
    ];
    
    // Check for gift card text (must contain "gift card" specifically)
    const hasGiftCardText = giftCardSpecificTerms.some(term => 
        pageText.includes(term) || pageHTML.includes(term)
    );
    
    // Check for gift card specific elements
    const hasGiftCardElements = GIFT_CARD_ELEMENT_SELECTORS.some(selector => {
        try {
            return document.querySelector(selector) !== null;
        } catch (e) {
            return false;
        }
    });
    
    // Check buttons for gift card payment options (not general gift features)
    let hasGiftCardButtons = false;
    try {
        const buttons = document.querySelectorAll('button, a, [role=\"button\"], [onclick], .btn, [class*=\"button\"]');
        for (const button of buttons) {
            const buttonText = (button.textContent || button.innerText || '').toLowerCase();
            const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
            const title = (button.getAttribute('title') || '').toLowerCase();
            const combinedText = buttonText + ' ' + ariaLabel + ' ' + title;
            
            // Skip if it's a general gift feature
            if (excludePatterns.some(pattern => combinedText.includes(pattern))) {
                continue;
            }
            
            // Only match if it contains "gift card" specifically
            if (giftCardSpecificTerms.some(term => combinedText.includes(term))) {
                hasGiftCardButtons = true;
                break;
            }
        }
    } catch (e) {
        // ignore
    }
    
    return hasGiftCardInputs || hasGiftCardText || hasGiftCardElements || hasGiftCardButtons;
}

function isElementVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none';
}

function findGiftCardElement() {
    // First, try specific selectors for gift card inputs
    for (const selector of GIFT_CARD_INPUT_SELECTORS) {
        try {
            const el = document.querySelector(selector);
            if (el && isElementVisible(el)) {
                return el;
            }
        } catch (e) {
            continue;
        }
    }
    
    // Then try gift card specific element selectors
    for (const selector of GIFT_CARD_ELEMENT_SELECTORS) {
        try {
            const el = document.querySelector(selector);
            if (el && isElementVisible(el)) {
                return el;
            }
        } catch (e) {
            continue;
        }
    }
    
    // Exclude patterns that indicate non-gift-card elements
    const excludePatterns = [
        'place order',
        'order now',
        'pay now',
        'checkout',
        'proceed to',
        'complete payment',
        'confirm order',
        'buy now',
        'add to cart',
        'upi',
        'credit card',
        'debit card',
        'net banking',
        'cash on delivery',
        'cod',
        'emi',
        'this item is a gift',
        'gift message',
        'gift wrap',
        'gift options',
        'choose gift',
        'gift recipient',
        'gift bag',
        'gift box',
        'add gift',
        'save gift',
        'gift receipt',
        'gift note'
    ];
    
    // Search for gift card elements with more specific matching
    try {
        const candidates = document.querySelectorAll('button, a, [role=\"button\"], label, [class*=\"option\"], [class*=\"payment\"], [class*=\"gift\"], [class*=\"voucher\"], div[class*=\"payment\"], li, div[class*=\"card\"]');
        const giftCardCandidates = [];
        
        for (const candidate of candidates) {
            const text = (candidate.textContent || candidate.innerText || '').toLowerCase().trim();
            const ariaLabel = (candidate.getAttribute('aria-label') || '').toLowerCase();
            const title = (candidate.getAttribute('title') || '').toLowerCase();
            const combinedText = text + ' ' + ariaLabel + ' ' + title;
            
            // Skip if it matches exclude patterns
            if (excludePatterns.some(pattern => combinedText.includes(pattern))) {
                continue;
            }
            
            // Skip if text is too long (likely not a gift card option button)
            if (text.length > 100) {
                continue;
            }
            
            // STRICT: Only match if it contains "gift card" or "giftcard" (not just "gift")
            const hasGiftCard = combinedText.includes('gift card') || 
                               combinedText.includes('giftcard') ||
                               combinedText.includes('gift-card') ||
                               combinedText.includes('gift certificate') ||
                               combinedText.includes('gift voucher');
            
            // Also check for payment-related gift card terms
            const hasPaymentGiftCard = combinedText.includes('redeem gift') ||
                                      combinedText.includes('apply gift') ||
                                      combinedText.includes('use gift card') ||
                                      combinedText.includes('enter gift card') ||
                                      combinedText.includes('gift card code') ||
                                      combinedText.includes('gift card balance');
            
            // Must have "gift card" specifically, not just "gift"
            if (hasGiftCard || hasPaymentGiftCard) {
                // Prioritize elements with "gift card" or "have a gift card" in text
                const hasExactMatch = combinedText.includes('gift card') || 
                                     combinedText.includes('have a gift card') ||
                                     combinedText.includes('giftcard');
                
                // Higher priority for question format like "Have a Gift Card?"
                const hasQuestionFormat = (combinedText.includes('have a') || combinedText.includes('have an')) && 
                                         hasGiftCard && 
                                         combinedText.includes('?');
                
                // Check if it's in a payment context (not gift options/wrapping)
                const isPaymentContext = combinedText.includes('payment') ||
                                        combinedText.includes('checkout') ||
                                        combinedText.includes('pay') ||
                                        candidate.closest('[class*="payment"], [class*="checkout"], [class*="pay"]') !== null;
                
                if (isElementVisible(candidate)) {
                    giftCardCandidates.push({
                        element: candidate,
                        priority: hasQuestionFormat ? 0 : (hasExactMatch ? 1 : (isPaymentContext ? 2 : 3)),
                        text: text
                    });
                }
            }
        }
        
        // Sort by priority (exact matches first) and return the best match
        if (giftCardCandidates.length > 0) {
            giftCardCandidates.sort((a, b) => a.priority - b.priority);
            console.log('🎁 Found gift card candidates:', giftCardCandidates.map(c => ({ text: c.text.substring(0, 50), priority: c.priority })));
            return giftCardCandidates[0].element;
        }
    } catch (e) {
        console.error('Error finding gift card element:', e);
    }
    
    return null;
}

function getHighlightTarget(element) {
    if (!element) return null;
    const clickableAncestor = element.closest('button, a, [role=\"button\"], .card, .payment-option, li, ._2nQ18'); // include ecommerce common classes
    if (clickableAncestor && isElementVisible(clickableAncestor)) {
        return clickableAncestor;
    }
    
    if (['INPUT', 'SELECT', 'LABEL'].includes(element.tagName)) {
        const label = element.closest('label');
        if (label && isElementVisible(label)) {
            return label;
        }
        if (element.parentElement && isElementVisible(element.parentElement)) {
            return element.parentElement;
        }
    }
    
    return element;
}

function removeGiftCardPointer() {
    if (pointerHighlightTarget) {
        pointerHighlightTarget.classList.remove('mizu-highlight-giftcard');
    }
    pointerHighlightTarget = null;
    
    if (pointerOverlay && pointerOverlay.parentElement) {
        pointerOverlay.parentElement.removeChild(pointerOverlay);
    }
    pointerOverlay = null;
    
    // Remove animated cursor
    const animatedCursor = document.getElementById('mizu-animated-cursor');
    if (animatedCursor && animatedCursor.parentElement) {
        animatedCursor.parentElement.removeChild(animatedCursor);
    }
    
    // Cancel animation frame
    if (window.mizuCursorAnimationFrame) {
        cancelAnimationFrame(window.mizuCursorAnimationFrame);
        window.mizuCursorAnimationFrame = null;
    }
    
    // Clear hover interval
    if (window.mizuCursorHoverInterval) {
        clearInterval(window.mizuCursorHoverInterval);
        window.mizuCursorHoverInterval = null;
    }
    
    if (pointerScrollHandler) {
        window.removeEventListener('scroll', pointerScrollHandler);
        pointerScrollHandler = null;
    }
    
    if (pointerResizeHandler) {
        window.removeEventListener('resize', pointerResizeHandler);
        pointerResizeHandler = null;
    }
    
    if (pointerObserver) {
        pointerObserver.disconnect();
        pointerObserver = null;
    }
}

function showGiftCardPointer(element) {
    const highlightTarget = getHighlightTarget(element);
    if (!highlightTarget) return;
    
    removeGiftCardPointer();
    pointerHighlightTarget = highlightTarget;
    
    // Create animated cursor element
    const animatedCursor = document.createElement('div');
    animatedCursor.id = 'mizu-animated-cursor';
    animatedCursor.style.cssText = `
        position: fixed !important;
        width: 24px !important;
        height: 24px !important;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        transform: translate(-50%, -50%) !important;
        will-change: left, top, transform !important;
    `;
    animatedCursor.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" fill="#0f5ff2" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
    `;
    document.body.appendChild(animatedCursor);
    
    // Get target position
    const getTargetPosition = () => {
        const rect = highlightTarget.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    };
    
    // Start position (top-right of viewport)
    const startX = window.innerWidth - 100;
    const startY = 100;
    
    // Set initial position
    animatedCursor.style.left = `${startX}px`;
    animatedCursor.style.top = `${startY}px`;
    animatedCursor.style.transition = 'none';
    
    // Animate cursor to gift card element
    setTimeout(() => {
        const targetPos = getTargetPosition();
        animatedCursor.style.transition = 'left 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        animatedCursor.style.left = `${targetPos.x}px`;
        animatedCursor.style.top = `${targetPos.y}px`;
        
        // After cursor reaches target, highlight and show tooltip
        setTimeout(() => {
            highlightTarget.classList.add('mizu-highlight-giftcard');
            
            // Create tooltip/pill (without finger icon)
            pointerOverlay = document.createElement('div');
            pointerOverlay.className = 'mizu-pointer-container';
            pointerOverlay.innerHTML = `
                <div class="mizu-pointer-content">
                    <div class="mizu-pointer-pill">Click here to use Gift Card with Mizu Pay</div>
                </div>
            `;
            pointerOverlay.style.pointerEvents = 'none';
            document.body.appendChild(pointerOverlay);
            
            // Position tooltip
            const updateTooltipPosition = () => {
                if (!pointerOverlay || !pointerHighlightTarget) return;
                const rect = pointerHighlightTarget.getBoundingClientRect();
                const top = window.scrollY + rect.top - 12;
                let left = window.scrollX + rect.right + 16;
                
                pointerOverlay.style.top = `${top}px`;
                pointerOverlay.style.left = `${left}px`;
                pointerOverlay.classList.remove('mizu-pointer-left');
                
                if (pointerOverlay.offsetWidth && left + pointerOverlay.offsetWidth > window.scrollX + window.innerWidth - 16) {
                    left = window.scrollX + rect.left - pointerOverlay.offsetWidth - 16;
                    pointerOverlay.style.left = `${left}px`;
                    pointerOverlay.classList.add('mizu-pointer-left');
                }
            };
            
            // Continuous position update function using requestAnimationFrame
            let animationFrameId = null;
            const updateCursorPosition = () => {
                if (!animatedCursor || !pointerHighlightTarget) {
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                        animationFrameId = null;
                    }
                    return;
                }
                
                // Check if element still exists in DOM
                if (!document.body.contains(highlightTarget)) {
                    removeGiftCardPointer();
                    return;
                }
                
                const rect = highlightTarget.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) {
                    // Element is not visible, try again
                    animationFrameId = requestAnimationFrame(updateCursorPosition);
                    return;
                }
                
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                // Update cursor position smoothly (no transition during animation frame loop)
                animatedCursor.style.transition = 'none';
                animatedCursor.style.left = `${x}px`;
                animatedCursor.style.top = `${y}px`;
                
                // Continue animation loop
                animationFrameId = requestAnimationFrame(updateCursorPosition);
            };
            
            // Start continuous position updates
            animationFrameId = requestAnimationFrame(updateCursorPosition);
            
            // Store animation frame ID for cleanup
            window.mizuCursorAnimationFrame = animationFrameId;
            
            pointerScrollHandler = () => {
                updateTooltipPosition();
            };
            pointerResizeHandler = () => {
                updateTooltipPosition();
            };
            
            window.addEventListener('scroll', pointerScrollHandler, { passive: true });
            window.addEventListener('resize', pointerResizeHandler);
            
            requestAnimationFrame(updateTooltipPosition);
            
            // Add subtle hover effect (pulsing scale)
            let hoverInterval = setInterval(() => {
                if (!animatedCursor || !pointerHighlightTarget) {
                    clearInterval(hoverInterval);
                    return;
                }
                // Subtle scale animation
                animatedCursor.style.transition = 'transform 0.5s ease-in-out';
                animatedCursor.style.transform = 'translate(-50%, -50%) scale(1.15)';
                
                setTimeout(() => {
                    if (animatedCursor) {
                        animatedCursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    }
                }, 500);
            }, 2000);
            
            // Store interval for cleanup
            window.mizuCursorHoverInterval = hoverInterval;
        }, 1200);
    }, 100);
    
    pointerHighlightTarget.addEventListener('click', () => {
        removeGiftCardPointer();
        if (window.mizuCursorHoverInterval) {
            clearInterval(window.mizuCursorHoverInterval);
            window.mizuCursorHoverInterval = null;
        }
    }, { once: true });
}

function initGiftCardPointer() {
    const existing = findGiftCardElement();
    if (existing) {
        showGiftCardPointer(existing);
        return;
    }
    
    if (pointerObserver) {
        pointerObserver.disconnect();
    }
    
    pointerObserver = new MutationObserver(() => {
        const el = findGiftCardElement();
        if (el) {
            showGiftCardPointer(el);
            if (pointerObserver) {
                pointerObserver.disconnect();
                pointerObserver = null;
            }
        }
    });
    
    pointerObserver.observe(document.body, { childList: true, subtree: true });
    
    setTimeout(() => {
        if (pointerObserver) {
            pointerObserver.disconnect();
            pointerObserver = null;
        }
    }, 8000);
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
    
    // Strategy 0: Direct search for "Total Amount" text (highest priority)
    try {
        // Look for elements containing "Total Amount" text
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let found = false;
        let node;
        while ((node = walker.nextNode()) && !found) {
            const text = node.textContent.trim();
            if (text.toLowerCase().includes('total amount') && !text.toLowerCase().includes('total mrp')) {
                // Find the parent element that contains this text
                let parent = node.parentElement;
                while (parent && parent !== document.body && !found) {
                    const parentText = (parent.textContent || '').toLowerCase();
                    if (parentText.includes('total amount')) {
                        // Look for amount in this element or its siblings
                        const fullText = parent.textContent || '';
                        const amountPattern = /total\s+amount[:\s]*[\$€£¥₹₽₦₵]?\s*([\d,]+\.?\d*)/i;
                        const match = fullText.match(amountPattern);
                        if (match) {
                            const num = match[1].replace(/,/g, '');
                            const parsed = parseFloat(num);
                            if (!isNaN(parsed) && parsed >= 0.01 && parsed <= 10000000) {
                                details.totalAmount = num;
                                console.log('✅ Found "Total Amount" directly:', num);
                                found = true;
                                break;
                            }
                        }
                        // Also check sibling elements for the amount
                        if (!found && parent.nextElementSibling) {
                            const siblingText = (parent.nextElementSibling.textContent || '').trim();
                            const siblingAmount = siblingText.match(/[\$€£¥₹₽₦₵]?\s*([\d,]+\.?\d*)/);
                            if (siblingAmount) {
                                const num = siblingAmount[1].replace(/,/g, '');
                                const parsed = parseFloat(num);
                                if (!isNaN(parsed) && parsed >= 0.01 && parsed <= 10000000) {
                                    details.totalAmount = num;
                                    console.log('✅ Found "Total Amount" in sibling:', num);
                                    found = true;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
        }
    } catch (e) {
        console.error('Error in Strategy 0:', e);
    }
    
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
        
        // Exclude subtotals and intermediate values
        if (combinedText.includes('subtotal') || 
            combinedText.includes('price (') || 
            combinedText.includes('items)') ||
            combinedText.includes('total mrp') ||
            combinedText.includes('mrp') ||
            combinedText.includes('maximum retail price') ||
            combinedText.includes('discount on') ||
            combinedText.includes('platform fee') ||
            combinedText.includes('delivery fee') ||
            combinedText.includes('cash/pay on delivery fee') ||
            combinedText.includes('item price') ||
            combinedText.includes('product price')) {
            return false;
        }
        // Include totals - prioritize "Total Amount" specifically
        return combinedText.includes('total amount') ||
               combinedText.includes('grand total') ||
               combinedText.includes('order total') ||
               combinedText.includes('final total') ||
               combinedText.includes('pay ') ||
               (combinedText.includes('total') && !combinedText.includes('mrp'));
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
                        const text = (element.textContent || element.innerText || '').toLowerCase();
                        const parentText = (element.parentElement?.textContent || '').toLowerCase();
                        const combinedText = text + ' ' + parentText;
                        // Priority: 0 = "Total Amount", 1 = other totals, 2 = other
                        let priority = selector.includes('total') ? 1 : 2;
                        if (combinedText.includes('total amount')) {
                            priority = 0;
                        }
                        totalCandidates.push({
                            amount: num,
                            value: parseFloat(num),
                            isTotal: isTotal,
                            priority: priority
                        });
                    }
                }
                
                // Check text content
                const text = element.textContent || element.innerText || '';
                const num = extractNumber(text);
                if (num) {
                    const isTotal = isTotalContext(element);
                    const parentText = (element.parentElement?.textContent || '').toLowerCase();
                    const combinedText = text.toLowerCase() + ' ' + parentText;
                    // Priority: 0 = "Total Amount", 1 = other totals, 2 = other
                    let priority = selector.includes('total') ? 1 : 2;
                    if (combinedText.includes('total amount')) {
                        priority = 0;
                    }
                    totalCandidates.push({
                        amount: num,
                        value: parseFloat(num),
                        isTotal: isTotal,
                        priority: priority
                    });
                }
            }
        } catch (e) {
            continue;
        }
    }
    
    // Sort: prioritize "Total Amount" (priority 0), then other totals, then by priority, then by amount (smallest for final total)
    if (totalCandidates.length > 0) {
        totalCandidates.sort((a, b) => {
            // First, prioritize "Total Amount" (priority 0)
            if (a.priority === 0 && b.priority !== 0) return -1;
            if (a.priority !== 0 && b.priority === 0) return 1;
            // Then prioritize totals over non-totals
            if (a.isTotal && !b.isTotal) return -1;
            if (!a.isTotal && b.isTotal) return 1;
            // Then by priority (lower is better)
            if (a.priority !== b.priority) return a.priority - b.priority;
            // For totals, prefer smaller amounts (final amount after discounts is usually smaller)
            // For non-totals, prefer larger amounts
            if (a.isTotal && b.isTotal) {
                return a.value - b.value;
            }
            return b.value - a.value;
        });
        
        // Prefer "Total Amount" (priority 0), then any total, then first candidate
        const bestCandidate = totalCandidates.find(c => c.priority === 0) || 
                              totalCandidates.find(c => c.isTotal) || 
                              totalCandidates[0];
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
            // Exclude subtotals, item prices, and intermediate values
            if (lowerText.includes('subtotal') || 
                lowerText.includes('price (') || 
                lowerText.includes('items)') ||
                lowerText.includes('item price') ||
                lowerText.includes('product price') ||
                lowerText.includes('total mrp') ||
                lowerText.includes('mrp') ||
                lowerText.includes('maximum retail price') ||
                lowerText.includes('discount on') ||
                lowerText.includes('platform fee') ||
                lowerText.includes('delivery fee') ||
                lowerText.includes('cash/pay on delivery fee')) {
                return false;
            }
            // Include totals, grand totals, final amounts - prioritize "Total Amount"
            return lowerText.includes('total amount') ||
                   lowerText.includes('grand total') ||
                   lowerText.includes('order total') ||
                   lowerText.includes('final total') ||
                   lowerText.includes('final amount') ||
                   lowerText.includes('pay ') ||
                   lowerText.includes('amount due') ||
                   (lowerText.includes('total') && !lowerText.includes('mrp'));
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
                        const combinedText = text.toLowerCase() + ' ' + parentText;
                        
                        // Priority: 0 = "Total Amount", 1 = other totals, 2 = other
                        let priority = (isTotal || isParentTotal) ? 1 : 2;
                        if (combinedText.includes('total amount')) {
                            priority = 0;
                        }
                        
                        amountCandidates.push({
                            amount: num,
                            value: parseFloat(num),
                            isTotal: isTotal || isParentTotal,
                            priority: priority,
                            text: text.substring(0, 100),
                            element: element
                        });
                    }
                }
            } catch (e) {
                continue;
            }
        }
        
        // Sort candidates: prioritize "Total Amount" (priority 0), then other totals, then by priority, then by amount
        amountCandidates.sort((a, b) => {
            // First, prioritize "Total Amount" (priority 0)
            if (a.priority === 0 && b.priority !== 0) return -1;
            if (a.priority !== 0 && b.priority === 0) return 1;
            // Then prioritize totals over non-totals
            if (a.isTotal && !b.isTotal) return -1;
            if (!a.isTotal && b.isTotal) return 1;
            // Then by priority (lower is better)
            if (a.priority !== b.priority) return a.priority - b.priority;
            // For totals, prefer smaller amounts (final amount after discounts is usually smaller)
            if (a.isTotal && b.isTotal) {
                return a.value - b.value;
            }
            // For non-totals, prefer larger amounts
            return b.value - a.value;
        });
        
        // Take the first candidate (best match)
        if (amountCandidates.length > 0) {
            // Prefer "Total Amount" (priority 0), then any total, then first candidate
            const bestCandidate = amountCandidates.find(c => c.priority === 0) || 
                                 amountCandidates.find(c => c.isTotal) || 
                                 amountCandidates[0];
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
    
    // Extract checkout details to get amount
    const checkoutDetails = extractCheckoutDetails();
    const amount = checkoutDetails.totalAmount || '0';
    const currency = checkoutDetails.currency || 'USD';
    
    // Format amount with currency symbol
    const formatAmount = (amt, curr) => {
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
        const symbol = currencySymbols[curr] || curr + ' ';
        const num = parseFloat(amt) || 0;
        return symbol + num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    
    const formattedAmount = formatAmount(amount, currency);
    
    // Log detected amount for debugging
    console.log('💰 Detected amount:', amount, currency, 'Formatted:', formattedAmount);
    
    // Create card container
    const card = document.createElement('div');
    card.id = 'mizu-pay-button';
    card.className = 'mizu-pay-payment-card';
    
    // Get logo URL from extension
    const logoUrl = chrome.runtime.getURL('Mizu-logo.png');
    
    // Function to update amount in the card
    const updateCardAmount = () => {
        const currentDetails = extractCheckoutDetails();
        const currentAmount = currentDetails.totalAmount || '0';
        const currentCurrency = currentDetails.currency || 'USD';
        const newFormattedAmount = formatAmount(currentAmount, currentCurrency);
        
        const amountElement = card.querySelector('.mizu-pay-card-amount');
        if (amountElement && newFormattedAmount !== formattedAmount) {
            console.log('💰 Amount updated:', currentAmount, currentCurrency, 'Formatted:', newFormattedAmount);
            amountElement.textContent = newFormattedAmount;
        }
    };
    
    card.innerHTML = `
        <div class="mizu-pay-card-content">
            <div class="mizu-pay-card-left">
                <div class="mizu-pay-logo-container">
                    <img src="${logoUrl}" alt="Mizu Pay" class="mizu-pay-logo" />
                </div>
                <div class="mizu-pay-card-text">
                    <div class="mizu-pay-card-title">Pay using Mizu Pay</div>
                    <div class="mizu-pay-card-amount">${formattedAmount}</div>
                    <div class="mizu-pay-card-subtitle">Click to start</div>
                </div>
            </div>
            <button class="mizu-pay-use-button" type="button">Use</button>
        </div>
    `;
    
    // Update amount after a short delay to ensure page is fully loaded
    setTimeout(() => {
        updateCardAmount();
    }, 500);
    
    // Watch for changes in price-related elements
    const priceObserver = new MutationObserver(() => {
        updateCardAmount();
    });
    
    // Observe changes in common price container elements
    const priceContainers = document.querySelectorAll('[class*="price"], [class*="total"], [class*="amount"], [id*="price"], [id*="total"]');
    priceContainers.forEach(container => {
        priceObserver.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
        });
    });
    
    // Also observe body for new price elements
    priceObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Add click handler to the entire card and Use button
    const handleClick = () => {
        console.log('Pay With Mizu Pay clicked!');
        removeGiftCardPointer();
        
        // Check if extension runtime is available
        if (!chrome.runtime || !chrome.runtime.sendMessage) {
            console.error('Chrome runtime not available');
            return;
        }
        
        // Extract checkout details from the page (refresh in case it changed)
        const currentCheckoutDetails = extractCheckoutDetails();
        console.log('Extracted checkout details:', currentCheckoutDetails);
        
        // Send message to background.js with all checkout details
        chrome.runtime.sendMessage({
            type: 'MIZU_PAY_CLICKED',
            data: {
                ...currentCheckoutDetails,
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
    };
    
    card.addEventListener('click', handleClick);
    const useButton = card.querySelector('.mizu-pay-use-button');
    useButton.addEventListener('click', (e) => {
        e.stopPropagation();
        handleClick();
    });
    
    // Inject the card into the page
    document.body.appendChild(card);
    console.log("✅ Mizu Pay payment card injected!");
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
        initGiftCardPointer();
    } else {
        console.log("❌ No gift card support found");
        removeGiftCardPointer();
        // Debug: Check what we found
        const pageText = document.body.innerText.toLowerCase();
        const foundKeywords = GIFT_CARD_KEYWORDS.filter(keyword => pageText.includes(keyword));
        if (foundKeywords.length > 0) {
            console.log("⚠️ Found gift card keywords but detection failed:", foundKeywords);
        }
    }
} else {
    console.log("❌ Not a checkout page");
}
