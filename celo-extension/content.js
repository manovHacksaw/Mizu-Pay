// CELO Pay Extension - Content Script
// Detects checkout pages and extracts payment information

console.log("CELO Pay Extension: Content script loaded on", window.location.href)

// Configuration - customize these for different e-commerce sites
const CHECKOUT_CONFIG = {
  // Keywords to detect checkout pages
  checkoutKeywords: [
    "checkout",
    "cart",
    "payment",
    "billing",
    "order",
    "purchase",
    "pay now",
    "place order",
    "complete purchase",
    "finalize",
    "payment method",
    "billing address",
    "shipping address",
  ],
  
  // Keywords for pay buttons
  payButtonKeywords: [
    "pay",
    "pay now",
    "place order",
    "complete purchase",
    "checkout",
    "confirm order",
    "finalize order",
    "proceed to payment",
  ],
  
  // Common selectors for different e-commerce platforms
  selectors: {
    // Amount selectors (try multiple patterns)
    amount: [
      '[data-testid*="total"]',
      '[data-testid*="amount"]',
      '[data-testid*="price"]',
      ".total",
      ".amount",
      ".price",
      ".cost",
      '[class*="total"]',
      '[class*="amount"]',
      '[class*="price"]',
      '[id*="total"]',
      '[id*="amount"]',
      '[id*="price"]',
      'span[class*="currency"]',
      'div[class*="currency"]',
    ],
    
    // Store name selectors
    store: [
      '[data-testid*="store"]',
      '[data-testid*="merchant"]',
      ".store-name",
      ".merchant-name",
      ".brand",
      '[class*="store"]',
      '[class*="merchant"]',
      '[class*="brand"]',
      "h1",
      "h2",
      ".logo",
      '[class*="logo"]',
    ],
    
    // Product description selectors
    product: [
      // Myntra-specific selectors
      '[class*="pdp-product-name"]',
      '[class*="product-name"]',
      '[class*="item-title"]',
      '[class*="product-brand"]', 
      'h1[class*="pdp"]',
      'h1[class*="product"]',

      // Generic e-commerce selectors
      'a[href*="/product/"]', // Links to product pages
      '[data-testid*="product"]',
      '[data-testid*="item"]',
      ".product-name",
      ".item-name",
      ".product-title",
      '[class*="product"]',
      '[class*="item"]',
      ".cart-item",
      ".order-item",

      // Page title fallback
      "title",
    ],
    
    // Currency selectors
    currency: [
      '[data-testid*="currency"]',
      ".currency",
      '[class*="currency"]',
      'span[class*="symbol"]',
      'div[class*="symbol"]',
    ],
  },
}

// State management
let isCheckoutDetected = false
let checkoutData = null
let floatingIcon = null

// Initialize the extension
function init() {
  try {
    console.log("CELO Pay Extension: Initializing...")
    
    // Wait for page to load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", evaluatePage)
    } else {
      evaluatePage()
    }
    
    // Set up mutation observer for dynamic content
    setupMutationObserver()
    
    // Periodic check as fallback
    setInterval(evaluatePage, 3000)
  } catch (error) {
    console.error("CELO Pay Extension: Initialization error", error)
  }
}

// Main evaluation function
async function evaluatePage() {
  try {
    // Check if we're on a checkout page
    const isCheckout = await detectCheckoutPage()
    
    if (isCheckout && !isCheckoutDetected) {
      console.log("CELO Pay Extension: Checkout page detected!")
      isCheckoutDetected = true
      
      // Extract checkout data
      checkoutData = await extractCheckoutData()
      
      if (checkoutData) {
        // Show floating icon
        showFloatingIcon()
        
        // Notify background script
        try {
          window.chrome.runtime.sendMessage({
            type: "CHECKOUT_DETECTED",
            data: checkoutData,
          })
        } catch (msgError) {
          console.warn("CELO Pay Extension: Could not send message to background", msgError)
        }
      }
    } else if (!isCheckout && isCheckoutDetected) {
      // No longer on checkout page
      hideFloatingIcon()
      isCheckoutDetected = false
      checkoutData = null
    }
  } catch (error) {
    console.error("CELO Pay Extension: Error in evaluation", error)
  }
}

// Detect if current page is a checkout page
async function detectCheckoutPage() {
  const url = window.location.href.toLowerCase()
  const pageText = document.body.textContent.toLowerCase()
  const domain = window.location.hostname.toLowerCase()

  // Skip development and non-ecommerce domains
  if (isDevelopmentOrNonEcommerceDomain(domain, url)) {
    console.log("CELO Pay Extension: Skipping non-ecommerce domain:", domain)
    return false
  }
  
  // Check URL for checkout keywords
  const urlMatch = CHECKOUT_CONFIG.checkoutKeywords.some((keyword) => url.includes(keyword))
  
  // Check page content for checkout keywords
  const contentMatch = CHECKOUT_CONFIG.checkoutKeywords.some((keyword) => pageText.includes(keyword))
  
  // Check for pay buttons
  const payButtonMatch = await detectPayButtons()
  
  // Check for payment forms
  const paymentFormMatch = detectPaymentForms()
  
  // Check for amount/price elements
  const amountMatch = detectAmountElements()

  // Check for e-commerce indicators
  const ecommerceMatch = detectEcommerceIndicators()

  const score = [urlMatch, contentMatch, payButtonMatch, paymentFormMatch, amountMatch, ecommerceMatch].filter(Boolean).length

  console.log("CELO Pay Extension: Checkout detection score:", {
    urlMatch,
    contentMatch,
    payButtonMatch,
    paymentFormMatch,
    amountMatch,
    ecommerceMatch,
    score,
    domain
  })
  
  // Require at least 2 indicators for confidence
  return score >= 2
}

// Detect pay buttons on the page
async function detectPayButtons() {
  const buttons = document.querySelectorAll('button, input[type="submit"], a')
  
  for (const button of buttons) {
    const text = button.textContent?.toLowerCase().trim() || ""
    const hasPayKeyword = CHECKOUT_CONFIG.payButtonKeywords.some((keyword) => text.includes(keyword))
    
    if (hasPayKeyword) {
      console.log("CELO Pay Extension: Pay button found:", text)
      return true
    }
  }
  
  return false
}

// Detect payment forms
function detectPaymentForms() {
  const forms = document.querySelectorAll("form")
  
  for (const form of forms) {
    const inputs = form.querySelectorAll("input, select")
    const paymentFields = Array.from(inputs).filter((input) => {
      const name = (input.name || input.id || input.placeholder || "").toLowerCase()
      return /card|cc|billing|cvv|expiry|zip|address|payment/.test(name)
    })
    
    if (paymentFields.length > 0) {
      console.log("CELO Pay Extension: Payment form found with", paymentFields.length, "payment fields")
      return true
    }
  }
  
  return false
}

// Detect amount/price elements
function detectAmountElements() {
  for (const selector of CHECKOUT_CONFIG.selectors.amount) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim() || ""
      if (text && /[\d,]+\.?\d*/.test(text)) {
        console.log("CELO Pay Extension: Amount element found:", text)
        return true
      }
    }
  }
  return false
}

// Check if domain is development or non-ecommerce
function isDevelopmentOrNonEcommerceDomain(domain, url) {
  // Development domains
  const devDomains = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'github.com',
    'github.io',
    'gitlab.com',
    'bitbucket.org',
    'stackoverflow.com',
    'stackexchange.com',
    'codepen.io',
    'jsfiddle.net',
    'codesandbox.io',
    'repl.it',
    'glitch.com',
    'netlify.app',
    'vercel.app',
    'herokuapp.com',
    'firebaseapp.com',
    'surge.sh',
    'now.sh',
    'pages.dev',
    'webflow.io',
    'wix.com',
    'squarespace.com',
    'wordpress.com',
    'blogspot.com',
    'medium.com',
    'dev.to',
    'hashnode.com',
    'notion.site',
    'docs.google.com',
    'drive.google.com',
    'youtube.com',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'reddit.com',
    'discord.com',
    'slack.com',
    'telegram.org',
    'whatsapp.com',
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'linkedin.com',
    'pinterest.com',
    'tiktok.com',
    'snapchat.com',
    'tumblr.com',
    'flickr.com',
    'deviantart.com',
    'behance.net',
    'dribbble.com',
    'figma.com',
    'canva.com',
    'adobe.com',
    'microsoft.com',
    'apple.com',
    'google.com',
    'amazon.com',
    'wikipedia.org',
    'wikimedia.org',
    'archive.org',
    'waybackmachine.org',
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'edge-extension://'
  ]

  // Check if domain matches any development patterns
  for (const devDomain of devDomains) {
    if (domain.includes(devDomain) || url.includes(devDomain)) {
      return true
    }
  }

  // Check for development ports
  if (url.includes(':3000') || url.includes(':3001') || url.includes(':8080') || 
      url.includes(':8000') || url.includes(':5000') || url.includes(':4000')) {
    return true
  }

  // Check for file:// protocol
  if (url.startsWith('file://')) {
    return true
  }

  return false
}

// Detect e-commerce indicators
function detectEcommerceIndicators() {
  const pageText = document.body.textContent.toLowerCase()
  
  // E-commerce specific keywords
  const ecommerceKeywords = [
    'add to cart',
    'add to bag',
    'buy now',
    'shop now',
    'add to wishlist',
    'shopping cart',
    'my cart',
    'checkout',
    'proceed to checkout',
    'place order',
    'order summary',
    'shipping address',
    'billing address',
    'payment method',
    'credit card',
    'debit card',
    'paypal',
    'stripe',
    'square',
    'shopify',
    'woocommerce',
    'magento',
    'prestashop',
    'opencart',
    'bigcommerce',
    'squarespace',
    'wix',
    'product',
    'products',
    'catalog',
    'inventory',
    'stock',
    'price',
    'pricing',
    'sale',
    'discount',
    'coupon',
    'promo',
    'free shipping',
    'delivery',
    'returns',
    'refund',
    'warranty',
    'guarantee',
    'customer service',
    'support',
    'faq',
    'terms of service',
    'privacy policy',
    'shipping policy',
    'return policy'
  ]

  // Check for e-commerce keywords
  const keywordMatches = ecommerceKeywords.filter(keyword => pageText.includes(keyword)).length
  
  // Check for common e-commerce selectors
  const ecommerceSelectors = [
    '[data-testid*="cart"]',
    '[data-testid*="checkout"]',
    '[data-testid*="product"]',
    '[data-testid*="price"]',
    '[data-testid*="add-to-cart"]',
    '[class*="cart"]',
    '[class*="checkout"]',
    '[class*="product"]',
    '[class*="shop"]',
    '[class*="store"]',
    '[id*="cart"]',
    '[id*="checkout"]',
    '[id*="product"]',
    '[id*="shop"]',
    '[id*="store"]'
  ]

  let selectorMatches = 0
  for (const selector of ecommerceSelectors) {
    if (document.querySelector(selector)) {
      selectorMatches++
    }
  }

  // Check for shopping cart icons or buttons
  const cartIcons = document.querySelectorAll('svg, i, img')
  let cartIconMatches = 0
  for (const icon of cartIcons) {
    const alt = icon.getAttribute('alt') || ''
    const title = icon.getAttribute('title') || ''
    const className = icon.className || ''
    const text = (alt + title + className).toLowerCase()
    
    if (text.includes('cart') || text.includes('shopping') || text.includes('bag') || 
        text.includes('basket') || text.includes('checkout')) {
      cartIconMatches++
    }
  }

  console.log("CELO Pay Extension: E-commerce detection:", {
    keywordMatches,
    selectorMatches,
    cartIconMatches
  })

  // Return true if we have strong e-commerce indicators
  return keywordMatches >= 3 || selectorMatches >= 2 || cartIconMatches >= 1
}

// Extract checkout data from the page
async function extractCheckoutData() {
  try {
    // Extract currency first, as it's more reliable
    const currency = extractCurrency()
    
    const data = {
      store: extractStoreName(),
      amount: extractAmount(),
      currency: currency, // Use the pre-fetched currency
      country: extractCountry(currency), // Add country detection
      product_name: extractProductName(),
      url: window.location.href,
      timestamp: Date.now(),
    }
    
    // Get conversion rates if needed
    if (data.amount && data.currency && data.currency !== "USD") {
      data.conversion = await getConversionRates(data.currency, data.amount)
    }
    
    console.log("CELO Pay Extension: Extracted checkout data:", data)
    return data
  } catch (error) {
    console.error("CELO Pay Extension: Error extracting checkout data", error)
    return null
  }
}

// Extract store name
function extractStoreName() {
  // Try multiple strategies, RE-ORDERED for reliability
  const strategies = [
    // STRATEGY 1: 'og:site_name' is most reliable (e.g., content="Myntra")
    () => document.querySelector('meta[property="og:site_name"]')?.content,
    
    // STRATEGY 2: 'application-name' is also good
    () => document.querySelector('meta[name="application-name"]')?.content,
    
    // STRATEGY 3: Use the document title, but skip generic titles
    () => {
      const title = document.title.split(" - ")[0].split(" | ")[0]
      const lowerTitle = title.toLowerCase()
        // Avoid generic titles
      if (lowerTitle.includes("checkout") || lowerTitle.includes("shopping bag") || lowerTitle.includes("cart")) {
        return null // This title is bad, try the next strategy
        }
      return title
    },

    // STRATEGY 4: Use host name as a last resort
    () => {
      let host = window.location.hostname // e.g., "www.myntra.com"
      host = host.replace(/^www\./, "") // "myntra.com"
      host = host.split(".")[0] // "myntra"
      return host.charAt(0).toUpperCase() + host.slice(1) // "Myntra"
    },

    // STRATEGY 5: (Original) Generic selectors
    () => {
      for (const selector of CHECKOUT_CONFIG.selectors.store) {
        const element = document.querySelector(selector)
        if (element?.textContent?.trim()) {
          return element.textContent.trim()
        }
      }
      return null
    },
  ]
  
  for (const strategy of strategies) {
    try {
      const result = strategy()
      // Check for valid, non-trivial result
      if (result && result.trim().length > 0 && result.length < 100) {
        return result.trim() // Return the first valid result
      }
    } catch (error) {
      continue
    }
  }
  
  return "Unknown Store"
}

// Extract amount
function extractAmount() {
  for (const selector of CHECKOUT_CONFIG.selectors.amount) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim() || ""
      const amount = extractNumberFromText(text)
      if (amount > 0) {
        return amount.toString()
      }
    }
  }
  
  // Fallback: search entire page for price patterns
  const pricePattern = /[$€£¥₹]\s*[\d,]+\.?\d*/g
  const matches = document.body.textContent.match(pricePattern)
  if (matches && matches.length > 0) {
    const amount = extractNumberFromText(matches[0])
    if (amount > 0) {
      return amount.toString()
    }
  }
  
  return "0"
}

// Extract currency
function extractCurrency() {
  // STRATEGY 1: Check domain-based currency detection first
  const hostname = window.location.hostname.toLowerCase()

  // Indian e-commerce sites
  if (
    hostname.includes("myntra.com") ||
    hostname.includes("flipkart.com") ||
    hostname.includes("amazon.in") ||
    hostname.includes("nykaa.com") ||
    hostname.includes("swiggy.com") ||
    hostname.includes("zomato.com") ||
    hostname.includes(".in/")
  ) {
    return "INR"
  }

  // STRATEGY 2: Search the whole page text for currency symbols
  const bodyText = document.body.textContent || ""

  // Prioritize INR symbols for your region
  if (bodyText.includes("₹") || /Rs\.?/i.test(bodyText)) {
    return "INR"
  }
  
  // Try to find other common symbols
  const currencyPattern = /[$€£¥]/
  const match = bodyText.match(currencyPattern)
  if (match) {
    return getCurrencyFromSymbol(match[0])
  }

  // STRATEGY 3: Fallback to checking specific "amount" elements
  for (const selector of CHECKOUT_CONFIG.selectors.amount) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim() || ""
      const currency = extractCurrencyFromText(text)
      if (currency) {
        return currency
      }
    }
  }

  // STRATEGY 4: Default fallback based on domain
  if (hostname.includes(".in") || hostname.includes("myntra") || hostname.includes("flipkart")) {
    return "INR"
  }

  return "USD" // Default fallback
}

// Extract country based on currency and domain
function extractCountry(currency) {
  const hostname = window.location.hostname.toLowerCase()

  // Currency-based country detection
  if (currency === "INR") {
    return "IN" // India
  } else if (currency === "USD") {
    return "US" // United States
  } else if (currency === "EUR") {
    return "DE" // Germany (or other EU country)
  } else if (currency === "GBP") {
    return "GB" // United Kingdom
  } else if (currency === "JPY") {
    return "JP" // Japan
  }

  // Domain-based country detection
  if (hostname.includes(".in") || hostname.includes("myntra") || hostname.includes("flipkart")) {
    return "IN"
  } else if (hostname.includes(".com")) {
    return "US"
  } else if (hostname.includes(".de")) {
    return "DE"
  } else if (hostname.includes(".co.uk")) {
    return "GB"
  }

  // Default fallback
  return "US"
}

// Extract product name
function extractProductName() {
  // STRATEGY 1: Try to get product name from page title (most reliable for product pages)
  const title = document.title
  if (
    title &&
    !title.toLowerCase().includes("checkout") &&
    !title.toLowerCase().includes("cart") &&
    !title.toLowerCase().includes("bag")
  ) {
    // Clean up the title - remove store name and common suffixes
    const productName = title
      .replace(/ - .*$/, "") // Remove everything after " - "
      .replace(/ \| .*$/, "") // Remove everything after " | "
      .replace(/ on .*$/, "") // Remove " on StoreName"
      .trim()

    if (productName && productName.length > 5 && productName.length < 150) {
      return productName
    }
  }

  // STRATEGY 2: Look for specific product selectors
  for (const selector of CHECKOUT_CONFIG.selectors.product) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim()
      if (text && text.length > 5 && text.length < 200) {
        return text
      }
    }
  }

  // STRATEGY 3: Look for h1 tags (often contain product names)
  const h1Elements = document.querySelectorAll("h1")
  for (const h1 of h1Elements) {
    const text = h1.textContent?.trim()
    if (
      text &&
      text.length > 5 &&
      text.length < 200 &&
      !text.toLowerCase().includes("checkout") &&
      !text.toLowerCase().includes("cart")
    ) {
      return text
    }
  }

  // STRATEGY 4: Look for meta tags
  const ogTitle = document.querySelector('meta[property="og:title"]')?.content
  if (ogTitle && ogTitle.length > 5 && ogTitle.length < 200) {
    return ogTitle
  }

  return "Purchase"
}

// Helper function to extract number from text
function extractNumberFromText(text) {
  // Regex to find all numbers, including with commas and decimals.
  // e.g., "1", "9,028", "971.50"
  const matches = text.match(/[\d,]+\.?\d*/g)
  
  if (!matches || matches.length === 0) {
    return 0
  }
  
  // The total amount is often the LAST price-like number in the element.
  // e.g., in "Total (1 item): ₹9,028", matches will be ["1", "9,028"].
  // We want the last one, "9,028".
  const lastMatch = matches[matches.length - 1]
  
  // Clean the number (remove commas) and parse it.
  // This will correctly parse "9,028" as 9028 and "971.50" as 971.5.
  return Number.parseFloat(lastMatch.replace(/,/g, ""))
}

// Helper function to extract currency from text
function extractCurrencyFromText(text) {
  // Look for 3-letter codes first (more specific)
  const currencyCodeMatch = text.match(/\b(USD|EUR|GBP|JPY|INR|CAD|AUD)\b/i)
  if (currencyCodeMatch) {
    return currencyCodeMatch[0].toUpperCase()
  }
  
  // Look for symbols, including "Rs" or "Rs." (case-insensitive)
  const currencySymbolMatch = text.match(/[$€£¥₹]|Rs\.?/i)
  if (currencySymbolMatch) {
    return getCurrencyFromSymbol(currencySymbolMatch[0])
  }
  
  return null
}

// Helper function to get currency from symbol
function getCurrencyFromSymbol(symbol) {
  const symbolMap = {
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₹": "INR",
    Rs: "INR", // Added Rs
  }
  
  // Normalize 'Rs.' to 'Rs' and make case-insensitive
  const normalizedSymbol = symbol.trim().replace(/\.$/, "").toLowerCase()
  
  // Check for 'rs'
  if (normalizedSymbol === "rs") {
    return "INR"
  }
  
  // Check for standard symbols
  return symbolMap[symbol.trim()] || "USD"
}

// Get conversion rates
async function getConversionRates(fromCurrency, amount) {
  try {
    const response = await window.chrome.runtime.sendMessage({
      type: "GET_CONVERSION_RATE",
      fromCurrency: fromCurrency,
      toCurrency: "USD",
    })
    
    if (response.rate) {
      const usdAmount = Number.parseFloat(amount) * response.rate
      return {
        celoAmount: (usdAmount * 0.1).toFixed(4), // Assuming 1 CELO = $10 USD
        cusdAmount: usdAmount.toFixed(2),
        rate: response.rate,
        usdAmount: usdAmount.toFixed(2),
      }
    }
  } catch (error) {
    console.error("CELO Pay Extension: Error getting conversion rates", error)
  }
  
  return null
}

// Show floating CELO icon
function showFloatingIcon() {
  if (floatingIcon) {
    return // Already showing
  }
  
  floatingIcon = document.createElement("div")
  floatingIcon.id = "celo-pay-floating-icon"
  floatingIcon.innerHTML = `
    <div style="
        /* Main Container: White card, rounded, shadow */
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
        background: #FFFFFF;
        border-radius: 12px;
        padding: 14px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
        justify-content: space-between;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        min-width: 300px;
        gap: 12px;
      ">
        <div style="display: flex; align-items: center; flex-grow: 1; overflow: hidden;">
          <div style="
            width: 40px; 
            height: 40px; 
            background: #FFD700;
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: #1a1a1a; 
            font-weight: bold; 
            font-size: 18px;
            flex-shrink: 0;
            position: relative;
            box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
          ">
            <div style="
              position: absolute;
              width: 20px;
              height: 20px;
              background: #1a1a1a;
              border-radius: 3px;
              display: flex;
              align-items: center;
              justify-content: center;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            "></div>
            <div style="
              position: absolute;
              color: #FFD700;
              font-size: 14px;
              font-weight: 700;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              z-index: 2;
            ">C</div>
          </div>
          
          <div style="margin-left: 12px; overflow: hidden;">
            <div style="
              color: #1C1C1E;
              font-size: 15px; 
              font-weight: 600;
              line-height: 1.2;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">
              Pay using Celo/cUSD
            </div>
            <div style="
              color: #35D07F;
              font-size: 13px; 
              font-weight: 500;
              line-height: 1.2;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            ">
              Gift card option detected!
            </div>
          </div>
        </div>
        
        <div style="
          background: #1ABC9C;
          color: white;
          border-radius: 8px;
          padding: 8px 20px;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
          white-space: nowrap;
        ">
          Use
      </div>
    </div>
    `
  
  // Add click handler
  floatingIcon.addEventListener("click", handleFloatingIconClick)
  
  document.body.appendChild(floatingIcon)
  console.log("CELO Pay Extension: Floating icon shown")
}

// Hide floating icon
function hideFloatingIcon() {
  if (floatingIcon) {
    floatingIcon.remove()
    floatingIcon = null
    console.log("CELO Pay Extension: Floating icon hidden")
  }
}

// Handle floating icon click
function handleFloatingIconClick() {
  console.log("CELO Pay Extension: Floating icon clicked")
  
  if (checkoutData) {
    // Open DApp with checkout data
    window.chrome.runtime.sendMessage({
      type: "OPEN_DAPP",
      data: checkoutData,
    })
  }
}

// Set up mutation observer for dynamic content
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldReevaluate = false
    
    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        shouldReevaluate = true
        break
      }
    }
    
    if (shouldReevaluate) {
      // Debounce re-evaluation
      clearTimeout(window.celoPayReevaluateTimeout)
      window.celoPayReevaluateTimeout = setTimeout(evaluatePage, 1000) // Typo fixed: celoPayeReevaluateTimeout -> celoPayReevaluateTimeout
    }
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

// Initialize when script loads
init()
