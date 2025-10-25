// CELO Pay Extension - Content Script
// Detects checkout pages and extracts payment information

console.log("CELO Pay Extension: Content script loaded on", window.location.href)

// Global error handler for extension context issues
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('Extension context invalidated')) {
    console.warn("CELO Pay Extension: Extension context invalidated, gracefully handling...")
    event.preventDefault()
    return false
  }
})

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('Extension context invalidated')) {
    console.warn("CELO Pay Extension: Extension context invalidated in promise, gracefully handling...")
    event.preventDefault()
    return false
  }
})

// Utility function to safely check if extension context is valid
function isExtensionContextValid() {
  try {
    return !!(window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage)
  } catch (error) {
    return false
  }
}

// Safe wrapper for chrome.runtime.sendMessage
async function safeSendMessage(message) {
  if (!isExtensionContextValid()) {
    console.warn("CELO Pay Extension: Extension context not valid, skipping message")
    return null
  }
  
  try {
    return await window.chrome.runtime.sendMessage(message)
  } catch (error) {
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.warn("CELO Pay Extension: Extension context invalidated during message send")
      return null
    }
    throw error
  }
}

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
    "checkout/",
    "/checkout",
    "checkout/",
    "/cart",
    "cart/",
    "/payment",
    "payment/",
    "/billing",
    "billing/",
    "/order",
    "order/",
    "/purchase",
    "purchase/",
    "/pay",
    "pay/",
    "/place-order",
    "place-order/",
    "/complete-purchase",
    "complete-purchase/",
    "/finalize",
    "finalize/",
    "/payment-method",
    "payment-method/",
    "/billing-address",
    "billing-address/",
    "/shipping-address",
    "shipping-address/"
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
      // Generic selectors
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
      
      // Flipkart-specific selectors
      '[class*="total-amount"]',
      '[class*="payable-amount"]',
      '[class*="final-amount"]',
      'div[class*="total"] span',
      'div[class*="amount"] span',
      '[data-testid*="total-amount"]',
      '[data-testid*="payable-amount"]',
      
      // Myntra-specific selectors
      '[class*="total-amount"]',
      '[class*="final-amount"]',
      '[class*="payable-amount"]',
      'div[class*="total"] span',
      'div[class*="amount"] span',
      '[data-testid*="total-amount"]',
      '[data-testid*="final-amount"]',
      
      // Amazon-specific selectors
      '[class*="total-amount"]',
      '[class*="order-total"]',
      '[class*="grand-total"]',
      'span[class*="total"]',
      'div[class*="total"] span',
      
      // Generic e-commerce patterns
      'span:contains("Total")',
      'div:contains("Total")',
      'span:contains("Amount")',
      'div:contains("Amount")',
      'span:contains("Payable")',
      'div:contains("Payable")',
      'span:contains("Final")',
      'div:contains("Final")',
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

      // Cart and checkout specific selectors
      '[class*="cart-item"] [class*="product-name"]',
      '[class*="cart-item"] [class*="item-name"]',
      '[class*="checkout-item"] [class*="product-name"]',
      '[class*="order-item"] [class*="product-name"]',
      '[class*="summary-item"] [class*="product-name"]',
      '[class*="review-item"] [class*="product-name"]',
      
      // Generic e-commerce selectors
      'a[href*="/product/"]', // Links to product pages
      '[data-testid*="product"]',
      '[data-testid*="item"]',
      '[data-testid*="cart-item"]',
      '[data-testid*="checkout-item"]',
      '[data-testid*="order-item"]',
      ".product-name",
      ".item-name",
      ".product-title",
      '[class*="product"]',
      '[class*="item"]',
      ".cart-item",
      ".order-item",
      ".checkout-item",
      ".summary-item",
      ".review-item",

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
        safeSendMessage({
          type: "CHECKOUT_DETECTED",
          data: checkoutData,
        }).catch(error => {
          console.warn("CELO Pay Extension: Could not send message to background", error)
        })
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

  // Skip product listing pages and category pages (but not checkout pages)
  if (url.includes('checkout') || url.includes('cart') || url.includes('payment') || url.includes('billing')) {
    console.log("CELO Pay Extension: Checkout-related URL detected:", url)
    // Don't skip checkout-related URLs
  } else if (isProductListingPage(url, pageText)) {
    console.log("CELO Pay Extension: Skipping product listing page:", url)
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

  // Check for checkout-specific indicators
  const checkoutMatch = detectEcommerceIndicators()

  const score = [urlMatch, contentMatch, payButtonMatch, paymentFormMatch, amountMatch, checkoutMatch].filter(Boolean).length

  console.log("CELO Pay Extension: Checkout detection score:", {
    urlMatch,
    contentMatch,
    payButtonMatch,
    paymentFormMatch,
    amountMatch,
    checkoutMatch,
    score,
    domain
  })

  // Require at least 1 indicator for confidence (more lenient for checkout pages)
  return score >= 1
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

// Check if page is a product listing/category page (not checkout)
function isProductListingPage(url, pageText) {
  // URL patterns that indicate product listing pages
  const listingUrlPatterns = [
    '/category/',
    '/categories/',
    '/products/',
    '/search/',
    '/browse/',
    '/shop/',
    '/store/',
    '/collection/',
    '/collections/',
    '/men/',
    '/women/',
    '/kids/',
    '/electronics/',
    '/clothing/',
    '/shoes/',
    '/accessories/',
    '/home/',
    '/beauty/',
    '/sports/',
    '/books/',
    '/toys/',
    '/garden/',
    '/automotive/',
    '/health/',
    '/jewelry/',
    '/watches/',
    '/bags/',
    '/sunglasses/',
    '/perfumes/',
    '/cosmetics/',
    '/skincare/',
    '/haircare/',
    '/makeup/',
    '/fragrance/',
    '/brands/',
    '/brand/',
    '/sale/',
    '/deals/',
    '/offers/',
    '/discount/',
    '/clearance/',
    '/new-arrivals/',
    '/trending/',
    '/popular/',
    '/featured/',
    '/best-sellers/',
    '/top-rated/',
    '/recommended/',
    '/similar/',
    '/related/',
    '/compare/',
    '/wishlist/',
    '/favorites/',
    '/saved/',
    '/recent/',
    '/history/',
    '/viewed/',
    '/browsed/',
    '/explore/',
    '/discover/',
    '/find/',
    '/filter/',
    '/sort/',
    '/page/',
    '/p/',
    '/c/',
    '/s/',
    '/l/',
    '/list/',
    '/grid/',
    '/tile/',
    '/card/',
    '/item/',
    '/product-list/',
    '/product-grid/',
    '/product-tile/',
    '/product-card/',
    '/item-list/',
    '/item-grid/',
    '/item-tile/',
    '/item-card/'
  ]

  // Check URL patterns
  for (const pattern of listingUrlPatterns) {
    if (url.includes(pattern)) {
      return true
    }
  }

  // Check for product listing indicators in page content
  const listingIndicators = [
    'sort by',
    'filter by',
    'price range',
    'brand',
    'color',
    'size',
    'category',
    'subcategory',
    'sub-category',
    'product grid',
    'product list',
    'item grid',
    'item list',
    'browse products',
    'shop by',
    'shop by category',
    'shop by brand',
    'shop by price',
    'shop by color',
    'shop by size',
    'view all',
    'show more',
    'load more',
    'next page',
    'previous page',
    'page 1',
    'page 2',
    'page 3',
    'results found',
    'items found',
    'products found',
    'showing',
    'of',
    'results',
    'items',
    'products',
    'add to cart',
    'add to bag',
    'add to wishlist',
    'quick view',
    'view details',
    'product image',
    'product title',
    'product name',
    'product price',
    'product rating',
    'product review',
    'product description',
    'product specification',
    'product features',
    'product benefits',
    'product highlights',
    'product details',
    'product information',
    'product gallery',
    'product images',
    'product thumbnails',
    'product zoom',
    'product video',
    'product 360',
    'product tour',
    'product demo',
    'product sample',
    'product trial',
    'product test',
    'product comparison',
    'product comparison table',
    'compare products',
    'compare items'
  ]

  // Check for listing indicators
  const listingIndicatorMatches = listingIndicators.filter(indicator => pageText.includes(indicator)).length

  // Check for multiple product cards (indicating a listing page)
  const productCards = document.querySelectorAll('[class*="product"], [class*="item"], [class*="card"], [data-testid*="product"]')
  const hasMultipleProducts = productCards.length >= 3

  // Check for pagination
  const pagination = document.querySelectorAll('[class*="pagination"], [class*="page"], [class*="next"], [class*="previous"]')
  const hasPagination = pagination.length > 0

  // Check for filters
  const filters = document.querySelectorAll('[class*="filter"], [class*="sort"], [class*="category"], [class*="brand"]')
  const hasFilters = filters.length > 0

  console.log("CELO Pay Extension: Product listing detection:", {
    listingIndicatorMatches,
    hasMultipleProducts,
    hasPagination,
    hasFilters,
    productCardsCount: productCards.length
  })

  // Return true if this looks like a product listing page
  return listingIndicatorMatches >= 3 || hasMultipleProducts || hasPagination || hasFilters
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

  // Check for checkout-specific keywords (not just general e-commerce)
  const checkoutKeywords = [
    'checkout',
    'proceed to checkout',
    'place order',
    'complete purchase',
    'payment method',
    'billing address',
    'shipping address',
    'order summary',
    'payment details',
    'credit card',
    'debit card',
    'pay now',
    'finalize order',
    'confirm order',
    'review order',
    'payment information',
    'billing information',
    'shipping information'
  ]

  const checkoutKeywordMatches = checkoutKeywords.filter(keyword => pageText.includes(keyword)).length
  
  // Check for checkout-specific selectors
  const checkoutSelectors = [
    '[data-testid*="checkout"]',
    '[data-testid*="payment"]',
    '[data-testid*="billing"]',
    '[data-testid*="shipping"]',
    '[data-testid*="order-summary"]',
    '[class*="checkout"]',
    '[class*="payment"]',
    '[class*="billing"]',
    '[class*="shipping"]',
    '[class*="order-summary"]',
    '[id*="checkout"]',
    '[id*="payment"]',
    '[id*="billing"]',
    '[id*="shipping"]',
    '[id*="order-summary"]'
  ]

  let checkoutSelectorMatches = 0
  for (const selector of checkoutSelectors) {
    if (document.querySelector(selector)) {
      checkoutSelectorMatches++
    }
  }

  // Check for payment forms specifically
  const paymentForms = document.querySelectorAll('form')
  let paymentFormMatches = 0
  for (const form of paymentForms) {
    const inputs = form.querySelectorAll('input, select, textarea')
    const paymentFields = Array.from(inputs).filter((input) => {
      const name = (input.name || input.id || input.placeholder || '').toLowerCase()
      return /card|cc|cvv|expiry|zip|billing|payment|checkout/.test(name)
    })
    
    if (paymentFields.length >= 2) {
      paymentFormMatches++
    }
  }

  // Check for "Pay" buttons specifically (not just any button)
  const payButtons = document.querySelectorAll('button, input[type="submit"], a')
  let payButtonMatches = 0
  for (const button of payButtons) {
    const text = button.textContent?.toLowerCase().trim() || ''
    const payKeywords = ['pay', 'pay now', 'place order', 'complete purchase', 'checkout', 'proceed to payment']
    if (payKeywords.some(keyword => text.includes(keyword))) {
      payButtonMatches++
    }
  }

  console.log("CELO Pay Extension: Checkout-specific detection:", {
    checkoutKeywordMatches,
    checkoutSelectorMatches,
    paymentFormMatches,
    payButtonMatches
  })

  // Only return true if we have strong checkout indicators
  return checkoutKeywordMatches >= 2 || checkoutSelectorMatches >= 2 || paymentFormMatches >= 1 || payButtonMatches >= 1
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
    
    // Don't do conversion in extension - let payment page handle it
    console.log("CELO Pay Extension: Sending original amount and currency to payment page for conversion")
    
    console.log("CELO Pay Extension: Extracted checkout data:", data)
    console.log("CELO Pay Extension: Amount extracted:", data.amount, "Currency:", data.currency)
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
  // First, determine the currency to handle INR amounts properly
  const currency = extractCurrency()
  console.log("CELO Pay Extension: Extracting amount with currency:", currency)
  
  for (const selector of CHECKOUT_CONFIG.selectors.amount) {
    const elements = document.querySelectorAll(selector)
    console.log(`CELO Pay Extension: Checking selector "${selector}", found ${elements.length} elements`)
    
    for (const element of elements) {
      const text = element.textContent?.trim() || ""
      console.log(`CELO Pay Extension: Element text: "${text}"`)
      
      let amount = extractNumberFromText(text)
      console.log(`CELO Pay Extension: Extracted number: ${amount}`)
      
      // Handle INR amounts: if currency is INR and amount looks like paise (large number), convert to rupees
      if (currency === "INR" && amount > 1000) {
        // Check if the text contains decimal point or rupee symbol to determine if it's already in rupees
        const hasDecimal = text.includes('.') || text.includes('₹')
        if (!hasDecimal) {
          // This is likely in paise, convert to rupees
          amount = amount / 100
          console.log("CELO Pay Extension: Converted paise to rupees:", amount)
        } else {
          console.log("CELO Pay Extension: Amount already in rupees format:", amount)
        }
      }
      
      if (amount > 0) {
        console.log(`CELO Pay Extension: Found valid amount: ${amount} from selector: ${selector}`)
        return amount.toString()
      }
    }
  }
  
  // Fallback: search entire page for price patterns
  console.log("CELO Pay Extension: Using fallback pattern matching")
  const pricePattern = /[$€£¥₹]\s*[\d,]+\.?\d*/g
  const matches = document.body.textContent.match(pricePattern)
  console.log(`CELO Pay Extension: Found ${matches ? matches.length : 0} price pattern matches`)
  if (matches && matches.length > 0) {
    // Sort matches by amount (descending) to get the highest amount first
    const amounts = matches.map(match => {
      const num = extractNumberFromText(match)
      return { match, amount: num }
    }).sort((a, b) => b.amount - a.amount)
    
    for (const { match, amount } of amounts) {
      // Handle INR amounts: if currency is INR and amount looks like paise (large number), convert to rupees
      if (currency === "INR" && amount > 1000) {
        // Check if the text contains decimal point or rupee symbol to determine if it's already in rupees
        const hasDecimal = match.includes('.') || match.includes('₹')
        if (!hasDecimal) {
          // This is likely in paise, convert to rupees
          const convertedAmount = amount / 100
          console.log("CELO Pay Extension: Converted paise to rupees (fallback):", convertedAmount)
          if (convertedAmount > 0) {
            return convertedAmount.toString()
          }
        } else {
          console.log("CELO Pay Extension: Amount already in rupees format (fallback):", amount)
          if (amount > 0) {
            return amount.toString()
          }
        }
      } else if (amount > 0) {
        return amount.toString()
      }
    }
  }
  
  // Additional fallback: Look for text patterns like "Total: ₹1234" or "Amount: ₹1234"
  console.log("CELO Pay Extension: Using text pattern matching")
  const textPatterns = [
    /total[:\s]*₹?\s*[\d,]+\.?\d*/gi,
    /amount[:\s]*₹?\s*[\d,]+\.?\d*/gi,
    /payable[:\s]*₹?\s*[\d,]+\.?\d*/gi,
    /final[:\s]*₹?\s*[\d,]+\.?\d*/gi,
    /grand[:\s]*total[:\s]*₹?\s*[\d,]+\.?\d*/gi
  ]
  
  for (const pattern of textPatterns) {
    const matches = document.body.textContent.match(pattern)
    console.log(`CELO Pay Extension: Text pattern ${pattern} found ${matches ? matches.length : 0} matches`)
    if (matches && matches.length > 0) {
      for (const match of matches) {
        const amount = extractNumberFromText(match)
        if (amount > 0) {
          // Handle INR conversion if needed
          if (currency === "INR" && amount > 1000) {
            const hasDecimal = match.includes('.') || match.includes('₹')
            if (!hasDecimal) {
              const convertedAmount = amount / 100
              console.log("CELO Pay Extension: Converted paise to rupees (text pattern):", convertedAmount)
              if (convertedAmount > 0) {
                return convertedAmount.toString()
              }
            } else {
              return amount.toString()
            }
          } else {
            return amount.toString()
          }
        }
      }
    }
  }
  
  // Final fallback: Look for any large numbers that could be prices
  console.log("CELO Pay Extension: Using final fallback - looking for any large numbers")
  const allNumbers = document.body.textContent.match(/\d{3,}/g)
  if (allNumbers && allNumbers.length > 0) {
    console.log(`CELO Pay Extension: Found ${allNumbers.length} large numbers:`, allNumbers)
    // Sort by value and take the largest reasonable amount
    const sortedNumbers = allNumbers
      .map(num => parseInt(num))
      .filter(num => num > 100 && num < 1000000) // Reasonable price range
      .sort((a, b) => b - a)
    
    if (sortedNumbers.length > 0) {
      const amount = sortedNumbers[0]
      console.log(`CELO Pay Extension: Using largest reasonable number: ${amount}`)
      
      // Handle INR conversion if needed
      if (currency === "INR" && amount > 1000) {
        const convertedAmount = amount / 100
        console.log(`CELO Pay Extension: Converted final fallback amount: ${convertedAmount}`)
        return convertedAmount.toString()
      } else {
        return amount.toString()
      }
    }
  }
  
  console.log("CELO Pay Extension: No amount found, returning 0")
  return "0"
}

// Extract currency
function extractCurrency() {
  // STRATEGY 1: Check domain-based currency detection first
  const hostname = window.location.hostname.toLowerCase()

  // Indian e-commerce sites - Enhanced detection
  if (
    hostname.includes("myntra.com") ||
    hostname.includes("flipkart.com") ||
    hostname.includes("amazon.in") ||
    hostname.includes("nykaa.com") ||
    hostname.includes("swiggy.com") ||
    hostname.includes("zomato.com") ||
    hostname.includes("bigbasket.com") ||
    hostname.includes("grofers.com") ||
    hostname.includes("paytm.com") ||
    hostname.includes("snapdeal.com") ||
    hostname.includes("shopclues.com") ||
    hostname.includes("1mg.com") ||
    hostname.includes("pharmeasy.in") ||
    hostname.includes("netmeds.com") ||
    hostname.includes("apollopharmacy.in") ||
    hostname.includes(".in/") ||
    hostname.includes(".in")
  ) {
    console.log("CELO Pay Extension: Indian e-commerce site detected, returning INR")
    return "INR"
  }

  // STRATEGY 2: Search the whole page text for currency symbols
  const bodyText = document.body.textContent || ""

  // Prioritize INR symbols for your region - Enhanced detection
  if (bodyText.includes("₹") || /Rs\.?/i.test(bodyText) || /₹\s*\d+/i.test(bodyText) || /Rs\.?\s*\d+/i.test(bodyText)) {
    console.log("CELO Pay Extension: INR currency detected from page content")
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
  
  console.log("CELO Pay Extension: Extracting country for currency:", currency, "from hostname:", hostname)

  // Currency-based country detection - Enhanced for INR
  if (currency === "INR") {
    console.log("CELO Pay Extension: INR detected, returning India (IN)")
    return "IN" // India
  } else if (currency === "USD") {
    console.log("CELO Pay Extension: USD detected, returning US")
    return "US" // United States
  } else if (currency === "EUR") {
    console.log("CELO Pay Extension: EUR detected, returning Germany (DE)")
    return "DE" // Germany (or other EU country)
  } else if (currency === "GBP") {
    console.log("CELO Pay Extension: GBP detected, returning UK (GB)")
    return "GB" // United Kingdom
  } else if (currency === "JPY") {
    console.log("CELO Pay Extension: JPY detected, returning Japan (JP)")
    return "JP" // Japan
  }

  // Domain-based country detection
  if (hostname.includes(".in") || hostname.includes("myntra") || hostname.includes("flipkart")) {
    console.log("CELO Pay Extension: Indian domain detected, returning India (IN)")
    return "IN"
  } else if (hostname.includes(".com")) {
    console.log("CELO Pay Extension: .com domain detected, returning US")
    return "US"
  } else if (hostname.includes(".de")) {
    console.log("CELO Pay Extension: .de domain detected, returning Germany (DE)")
    return "DE"
  } else if (hostname.includes(".co.uk")) {
    console.log("CELO Pay Extension: .co.uk domain detected, returning UK (GB)")
    return "GB"
  }

  // Default fallback
  console.log("CELO Pay Extension: No specific domain/currency match, defaulting to US")
  return "US"
}

// Extract product name(s) - Enhanced for multiple products
function extractProductName() {
  console.log("CELO Pay Extension: Extracting product names...")
  
  // STRATEGY 1: Look for cart items with product names
  const cartItems = extractCartItems()
  if (cartItems.length > 0) {
    console.log("CELO Pay Extension: Found cart items:", cartItems)
    return cartItems.join(", ")
  }

  // STRATEGY 2: Look for checkout summary with product names
  const checkoutItems = extractCheckoutItems()
  if (checkoutItems.length > 0) {
    console.log("CELO Pay Extension: Found checkout items:", checkoutItems)
    return checkoutItems.join(", ")
  }

  // STRATEGY 3: Try to get product name from page title (for single product pages)
  const title = document.title
  if (
    title &&
    !title.toLowerCase().includes("checkout") &&
    !title.toLowerCase().includes("cart") &&
    !title.toLowerCase().includes("bag") &&
    !title.toLowerCase().includes("items selected")
  ) {
    // Clean up the title - remove store name and common suffixes
    const productName = title
      .replace(/ - .*$/, "") // Remove everything after " - "
      .replace(/ \| .*$/, "") // Remove everything after " | "
      .replace(/ on .*$/, "") // Remove " on StoreName"
      .trim()

    if (productName && productName.length > 5 && productName.length < 150) {
      console.log("CELO Pay Extension: Found product from title:", productName)
      return productName
    }
  }

  // STRATEGY 4: Look for specific product selectors
  for (const selector of CHECKOUT_CONFIG.selectors.product) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim()
      if (text && text.length > 5 && text.length < 200 && !text.includes("ITEMS SELECTED")) {
        console.log("CELO Pay Extension: Found product from selector:", text)
        return text
      }
    }
  }

  // STRATEGY 5: Look for h1 tags (often contain product names)
  const h1Elements = document.querySelectorAll("h1")
  for (const h1 of h1Elements) {
    const text = h1.textContent?.trim()
    if (
      text &&
      text.length > 5 &&
      text.length < 200 &&
      !text.toLowerCase().includes("checkout") &&
      !text.toLowerCase().includes("cart") &&
      !text.includes("ITEMS SELECTED")
    ) {
      console.log("CELO Pay Extension: Found product from h1:", text)
      return text
    }
  }

  // STRATEGY 6: Look for meta tags
  const ogTitle = document.querySelector('meta[property="og:title"]')?.content
  if (ogTitle && ogTitle.length > 5 && ogTitle.length < 200 && !ogTitle.includes("ITEMS SELECTED")) {
    console.log("CELO Pay Extension: Found product from og:title:", ogTitle)
    return ogTitle
  }

  console.log("CELO Pay Extension: No product names found, using default")
  return "Purchase"
}

// Extract cart items with product names
function extractCartItems() {
  const cartItems = []
  
  // Common cart item selectors
  const cartSelectors = [
    '[data-testid*="cart-item"]',
    '[data-testid*="cartitem"]',
    '[class*="cart-item"]',
    '[class*="cartitem"]',
    '[class*="cart-product"]',
    '[class*="checkout-item"]',
    '[class*="order-item"]',
    '[class*="product-item"]',
    '[class*="item-name"]',
    '[class*="product-name"]',
    '[class*="product-title"]',
    '[class*="item-title"]',
    '.cart-item',
    '.cartitem',
    '.checkout-item',
    '.order-item',
    '.product-item',
    '.item-name',
    '.product-name',
    '.product-title',
    '.item-title'
  ]
  
  for (const selector of cartSelectors) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim()
      if (text && text.length > 3 && text.length < 100 && !text.includes("ITEMS SELECTED")) {
        // Clean up the text
        const cleanText = text
          .replace(/\d+\/\d+\s*ITEMS?\s*SELECTED/i, '') // Remove "2/2 ITEMS SELECTED"
          .replace(/\d+\s*ITEMS?\s*SELECTED/i, '') // Remove "2 ITEMS SELECTED"
          .replace(/^\d+\s*/, '') // Remove leading numbers
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        if (cleanText && cleanText.length > 3) {
          cartItems.push(cleanText)
        }
      }
    }
  }
  
  // Remove duplicates and limit to 3 items
  return [...new Set(cartItems)].slice(0, 3)
}

// Extract checkout items with product names
function extractCheckoutItems() {
  const checkoutItems = []
  
  // Common checkout item selectors
  const checkoutSelectors = [
    '[data-testid*="checkout-item"]',
    '[data-testid*="order-item"]',
    '[class*="checkout-item"]',
    '[class*="order-item"]',
    '[class*="summary-item"]',
    '[class*="review-item"]',
    '.checkout-item',
    '.order-item',
    '.summary-item',
    '.review-item'
  ]
  
  for (const selector of checkoutSelectors) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim()
      if (text && text.length > 3 && text.length < 100 && !text.includes("ITEMS SELECTED")) {
        // Clean up the text
        const cleanText = text
          .replace(/\d+\/\d+\s*ITEMS?\s*SELECTED/i, '') // Remove "2/2 ITEMS SELECTED"
          .replace(/\d+\s*ITEMS?\s*SELECTED/i, '') // Remove "2 ITEMS SELECTED"
          .replace(/^\d+\s*/, '') // Remove leading numbers
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        if (cleanText && cleanText.length > 3) {
          checkoutItems.push(cleanText)
        }
      }
    }
  }
  
  // Remove duplicates and limit to 3 items
  return [...new Set(checkoutItems)].slice(0, 3)
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
    console.log(`CELO Pay Extension: Requesting conversion rate for ${fromCurrency} to USD`);
    
    const response = await safeSendMessage({
      type: "GET_CONVERSION_RATE",
      fromCurrency: fromCurrency,
      toCurrency: "USD",
    })
    
    console.log("CELO Pay Extension: Conversion rate response:", response);
    
    // Check if response exists and has rate property
    if (response && typeof response.rate === 'number' && response.rate > 0) {
      const usdAmount = Number.parseFloat(amount) * response.rate
      const conversion = {
        celoAmount: (usdAmount * 0.1).toFixed(4), // Assuming 1 CELO = $10 USD
        cusdAmount: usdAmount.toFixed(2),
        rate: response.rate,
        usdAmount: usdAmount.toFixed(2),
        success: response.success || false,
        fallback: response.fallback || false
      };
      
      console.log("CELO Pay Extension: Conversion calculated:", conversion);
      return conversion;
    } else {
      console.warn("CELO Pay Extension: Invalid conversion rate response:", response);
      return null;
    }
  } catch (error) {
    console.error("CELO Pay Extension: Error getting conversion rates", error);
    return null;
  }
}

// Get real-time conversion rates for CELO and cUSD using external APIs
async function getRealTimeConversionRates(inrAmount) {
  try {
    console.log("CELO Pay Extension: Getting real-time conversion rates for INR amount:", inrAmount)
    
    // Get USD to INR rate from Frankfurter API (more accurate)
    const usdToInrResponse = await fetch(`https://api.frankfurter.app/latest?from=USD&to=INR`)
    const usdToInrData = await usdToInrResponse.json()
    const usdToInrRate = usdToInrData.rates?.INR || 87.81 // Fallback rate
    const inrToUsdRate = 1 / usdToInrRate // Convert to INR to USD rate
    
    const usdAmount = inrAmount * inrToUsdRate
    console.log("CELO Pay Extension: INR to USD conversion:", inrAmount, "INR =", usdAmount, "USD")
    
    // Get CELO price from CoinGecko
    const celoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd')
    const celoData = await celoResponse.json()
    const celoPrice = celoData.celo?.usd || 0.25 // Fallback price
    
    // Get cUSD price from DIA Data
    const cusdResponse = await fetch('https://api.diadata.org/v1/assetQuotation/Celo/0x765DE816845861e75A25fCA122bb6898B8B1282a')
    const cusdData = await cusdResponse.json()
    const cusdPrice = cusdData.Price || 1.0 // cUSD should be close to $1
    
    // Calculate amounts
    const celoAmount = (usdAmount / celoPrice).toFixed(4)
    const cusdAmount = (usdAmount / cusdPrice).toFixed(2)
    
    console.log("CELO Pay Extension: Real-time rates - CELO:", celoPrice, "USD, cUSD:", cusdPrice, "USD")
    console.log("CELO Pay Extension: Calculated amounts - CELO:", celoAmount, "cUSD:", cusdAmount)
    
    return {
      celoAmount: celoAmount,
      cusdAmount: cusdAmount,
      rate: inrToUsdRate,
      celoPrice: celoPrice,
      cusdPrice: cusdPrice,
      usdAmount: usdAmount.toFixed(2)
    }
  } catch (error) {
    console.error("CELO Pay Extension: Error getting real-time conversion rates:", error)
    
    // Fallback rates (using current USD to INR rate of 87.81)
    const fallbackInrToUsd = 1 / 87.81 // More accurate rate: ~0.0114
    const fallbackCeloPrice = 0.25
    const fallbackCusdPrice = 1.0
    
    const usdAmount = inrAmount * fallbackInrToUsd
    const celoAmount = (usdAmount / fallbackCeloPrice).toFixed(4)
    const cusdAmount = (usdAmount / fallbackCusdPrice).toFixed(2)
    
    console.log("CELO Pay Extension: Using fallback rates")
    
    return {
      celoAmount: celoAmount,
      cusdAmount: cusdAmount,
      rate: fallbackInrToUsd,
      celoPrice: fallbackCeloPrice,
      cusdPrice: fallbackCusdPrice,
      usdAmount: usdAmount.toFixed(2),
      fallback: true
    }
  }
}

// Show floating CELO icon
function showFloatingIcon() {
  if (floatingIcon) {
    return // Already showing
  }
  
  // Get amount display text
  let amountDisplay = "Gift card option detected!"
  if (checkoutData && checkoutData.amount) {
    const amount = parseFloat(checkoutData.amount)
    const currency = checkoutData.currency || "USD"
    
    if (currency === "INR") {
      amountDisplay = `₹${amount.toLocaleString('en-IN')} (${currency})`
    } else if (currency === "USD") {
      amountDisplay = `$${amount.toFixed(2)} (${currency})`
    } else {
      amountDisplay = `${amount.toFixed(2)} ${currency}`
    }
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
              ${amountDisplay}
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
    // Show guidance modal first
    showGuidanceModal()
  }
}

// Show guidance modal
function showGuidanceModal() {
  // Remove existing modal if any
  const existingModal = document.getElementById("celo-pay-guidance-modal")
  if (existingModal) {
    existingModal.remove()
  }

  // Get amount information for display
  let amountInfo = ""
  if (checkoutData && checkoutData.amount) {
    const amount = parseFloat(checkoutData.amount)
    const currency = checkoutData.currency || "USD"
    
    if (currency === "INR") {
      amountInfo = `
        <div style="
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        ">
          <div style="color: #FFD700; font-weight: 600; margin-bottom: 4px;">Payment Amount</div>
          <div style="color: white; font-size: 18px; font-weight: bold;">₹${amount.toLocaleString('en-IN')} (INR)</div>
        </div>
      `
    } else if (currency === "USD") {
      amountInfo = `
        <div style="
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        ">
          <div style="color: #FFD700; font-weight: 600; margin-bottom: 4px;">Payment Amount</div>
          <div style="color: white; font-size: 18px; font-weight: bold;">$${amount.toFixed(2)} (USD)</div>
        </div>
      `
    } else {
      amountInfo = `
        <div style="
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        ">
          <div style="color: #FFD700; font-weight: 600; margin-bottom: 4px;">Payment Amount</div>
          <div style="color: white; font-size: 18px; font-weight: bold;">${amount.toFixed(2)} ${currency}</div>
        </div>
      `
    }
  }

  // Create modal overlay
  const modal = document.createElement("div")
  modal.id = "celo-pay-guidance-modal"
  modal.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 2147483648;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    ">
      <div style="
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 20px;
        padding: 32px;
        max-width: 480px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        animation: modalSlideIn 0.3s ease-out;
      ">
        <!-- Close button -->
        <button id="celo-modal-close" style="
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
          ×
        </button>

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              width: 32px;
              height: 32px;
              background: #1a1a1a;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFD700;
              font-weight: bold;
              font-size: 20px;
            ">
              C
            </div>
          </div>
          <h2 style="
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">
            Pay with Celo/cUSD
          </h2>
          <p style="
            color: rgba(255, 255, 255, 0.7);
            margin: 8px 0 0;
            font-size: 16px;
          ">
            Secure blockchain payment
          </p>
        </div>

        <!-- Amount Information -->
        ${amountInfo}
        
        <!-- Guidance content -->
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        ">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="
              width: 24px;
              height: 24px;
              background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              flex-shrink: 0;
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 style="
              color: white;
              margin: 0;
              font-size: 18px;
              font-weight: 600;
            ">
              Before proceeding, please ensure:
            </h3>
          </div>
          
          <ul style="
            color: rgba(255, 255, 255, 0.8);
            margin: 0;
            padding-left: 20px;
            line-height: 1.6;
          ">
            <li style="margin-bottom: 8px;">You're on the checkout page</li>
            <li style="margin-bottom: 8px;">All required details are filled out</li>
            <li style="margin-bottom: 8px;">You see the option to pay with a gift card</li>
          </ul>
          
          <div style="
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-top: 16px;
          ">
            <p style="
              color: #FFD700;
              margin: 0;
              font-size: 14px;
              font-weight: 500;
            ">
              💡 Once everything looks good, you'll be redirected to complete your payment securely with Mizu Pay.
            </p>
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display: flex; gap: 12px;">
          <button id="celo-modal-cancel" style="
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
            Cancel
          </button>
          <button id="celo-modal-proceed" style="
            flex: 2;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            border: none;
            color: #1a1a1a;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
          " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(255, 215, 0, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(255, 215, 0, 0.3)'">
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    </style>
  `

  // Add modal to page
  document.body.appendChild(modal)

  // Add event listeners
  const closeBtn = document.getElementById("celo-modal-close")
  const cancelBtn = document.getElementById("celo-modal-cancel")
  const proceedBtn = document.getElementById("celo-modal-proceed")

  const closeModal = () => {
    modal.style.opacity = "0"
    modal.style.transform = "scale(0.9) translateY(20px)"
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove()
      }
    }, 200)
  }

  const proceedToPayment = () => {
    closeModal()
    // Open DApp with checkout data
    safeSendMessage({
      type: "OPEN_DAPP",
      data: checkoutData,
    }).catch(error => {
      console.warn("CELO Pay Extension: Could not send message to background, using fallback", error)
      // Fallback: open DApp directly
      const dappUrl = `http://localhost:3000/payment?store=${encodeURIComponent(checkoutData.store || '')}&amount=${encodeURIComponent(checkoutData.amount || '')}&currency=${encodeURIComponent(checkoutData.currency || 'USD')}&product_name=${encodeURIComponent(checkoutData.product_name || '')}&country=${encodeURIComponent(checkoutData.country || 'US')}&original_url=${encodeURIComponent(checkoutData.url || '')}`
      window.open(dappUrl, '_blank')
    })
  }

  // Event listeners
  closeBtn.addEventListener("click", closeModal)
  cancelBtn.addEventListener("click", closeModal)
  proceedBtn.addEventListener("click", proceedToPayment)

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal()
    }
  })

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeModal()
      document.removeEventListener("keydown", handleEscape)
    }
  }
  document.addEventListener("keydown", handleEscape)

  console.log("CELO Pay Extension: Guidance modal shown")
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
