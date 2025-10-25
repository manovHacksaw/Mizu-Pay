// CELO Pay Extension - Simple Stable Content Script
console.log('CELO Pay Extension: Simple content script loaded');

// Simple checkout detection
function isCheckoutPage() {
  const url = window.location.href.toLowerCase();
  const pageText = document.body.textContent.toLowerCase();
  
  // Check for checkout keywords
  const checkoutKeywords = ['checkout', 'cart', 'payment', 'billing', 'order', 'pay now'];
  const hasCheckoutKeyword = checkoutKeywords.some(keyword => 
    url.includes(keyword) || pageText.includes(keyword)
  );
  
  // Check for pay buttons
  const payButtons = document.querySelectorAll('button, input[type="submit"], a');
  const hasPayButton = Array.from(payButtons).some(button => {
    const text = button.textContent?.toLowerCase() || '';
    return ['pay', 'pay now', 'checkout', 'place order'].some(keyword => 
      text.includes(keyword)
    );
  });
  
  return hasCheckoutKeyword || hasPayButton;
}

// Extract comprehensive checkout data
function extractCheckoutData() {
  // Extract store name
  const storeName = extractStoreName()
  
  // Extract amount and currency
  const { amount, currency } = extractAmountAndCurrency()
  
  // Extract product/cart items
  const items = extractCartItems()
  
  // Generate cart hash
  const cartHash = generateCartHash(items)
  
  // Extract country from domain
  const country = extractCountry()
  
  return {
    store: storeName,
    amount: amount,
    currency: currency,
    product_name: items.length > 0 ? items[0].name : 'Purchase',
    items: JSON.stringify(items),
    country: country,
    cartHash: cartHash,
    original_url: window.location.href,
    timestamp: Date.now()
  }
}

// Extract store name from various sources
function extractStoreName() {
  // Try meta tags first
  const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.content
  if (ogSiteName) return ogSiteName
  
  // Try application name
  const appName = document.querySelector('meta[name="application-name"]')?.content
  if (appName) return appName
  
  // Try title
  const title = document.title.split(' - ')[0].split(' | ')[0]
  if (title && title.length < 50) return title
  
  // Try hostname
  const hostname = window.location.hostname
  if (hostname.includes('amazon')) return 'Amazon'
  if (hostname.includes('flipkart')) return 'Flipkart'
  if (hostname.includes('shopify')) return 'Shopify Store'
  if (hostname.includes('etsy')) return 'Etsy'
  
  return hostname.replace('www.', '')
}

// Extract amount and currency
function extractAmountAndCurrency() {
  // Common selectors for total amount
  const amountSelectors = [
    '[data-testid*="total"]',
    '[data-testid*="amount"]',
    '.total', '.amount', '.price', '.cost',
    '[class*="total"]', '[class*="amount"]', '[class*="price"]',
    '[id*="total"]', '[id*="amount"]', '[id*="price"]'
  ]
  
  let amount = '0'
  let currency = 'USD'
  
  // Try to find amount in DOM
  for (const selector of amountSelectors) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const text = element.textContent?.trim() || ''
      const match = text.match(/[\$€£¥₹]\s*[\d,]+\.?\d*/)
      if (match) {
        amount = match[0].replace(/[\$€£¥₹\s,]/g, '')
        currency = getCurrencyFromSymbol(match[0])
        break
      }
    }
    if (amount !== '0') break
  }
  
  // Fallback: search entire page
  if (amount === '0') {
    const pricePattern = /[\$€£¥₹]\s*[\d,]+\.?\d*/g
    const matches = document.body.textContent.match(pricePattern)
    if (matches && matches.length > 0) {
      const match = matches[0]
      amount = match.replace(/[\$€£¥₹\s,]/g, '')
      currency = getCurrencyFromSymbol(match)
    }
  }
  
  return { amount, currency }
}

// Extract cart items
function extractCartItems() {
  const items = []
  
  // Try to find cart items in DOM
  const itemSelectors = [
    '.cart-item', '.order-item', '.product-item',
    '[data-testid*="item"]', '[class*="item"]'
  ]
  
  for (const selector of itemSelectors) {
    const elements = document.querySelectorAll(selector)
    for (const element of elements) {
      const name = element.querySelector('h3, h4, .name, .title, [class*="name"]')?.textContent?.trim()
      const price = element.querySelector('.price, .cost, [class*="price"]')?.textContent?.trim()
      const quantity = element.querySelector('.quantity, [class*="qty"]')?.textContent?.trim()
      
      if (name) {
        items.push({
          name: name,
          price: price || '0',
          quantity: quantity || '1'
        })
      }
    }
  }
  
  return items
}

// Generate cart hash for verification
function generateCartHash(items) {
  const cartString = JSON.stringify(items.sort((a, b) => a.name.localeCompare(b.name)))
  return btoa(cartString).substring(0, 16) // Simple hash for demo
}

// Extract country from domain
function extractCountry() {
  const hostname = window.location.hostname
  if (hostname.includes('.in')) return 'IN'
  if (hostname.includes('.uk')) return 'GB'
  if (hostname.includes('.ca')) return 'CA'
  if (hostname.includes('.au')) return 'AU'
  if (hostname.includes('.de')) return 'DE'
  if (hostname.includes('.fr')) return 'FR'
  return 'US' // Default
}

// Get currency from symbol
function getCurrencyFromSymbol(symbol) {
  const symbolMap = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR'
  }
  return symbolMap[symbol] || 'USD'
}

// Show simple floating button
function showFloatingButton() {
  if (document.getElementById('celo-pay-button')) {
    return; // Already exists
  }
  
  const button = document.createElement('div');
  button.id = 'celo-pay-button';
  button.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    background: #35D07F;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    z-index: 2147483647 !important;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    border: 2px solid #2ECC71;
    margin: 0 !important;
    transform: none !important;
    transition: none !important;
  `;
  button.textContent = 'Pay with CELO';
  
  button.addEventListener('click', () => {
    // Redirect to your payment page with checkout data
    const data = extractCheckoutData();
    const params = new URLSearchParams(data);
    const paymentUrl = `http://localhost:3000/payment?${params.toString()}`;
    
    console.log('CELO Pay Extension: Redirecting to payment page:', paymentUrl);
    window.open(paymentUrl, '_blank');
  });
  
  document.body.appendChild(button);
  console.log('CELO Pay Extension: Floating button shown');
}

// Main function
function checkAndShowButton() {
  if (isCheckoutPage()) {
    console.log('CELO Pay Extension: Checkout page detected');
    showFloatingButton();
  }
}

// Initialize
try {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndShowButton);
  } else {
    checkAndShowButton();
  }
  
  // Check periodically for dynamic content
  setInterval(checkAndShowButton, 2000);
  
} catch (error) {
  console.error('CELO Pay Extension: Error:', error);
}
