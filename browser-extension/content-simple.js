// Simplified content script for debugging
// This version has more logging and simpler logic

console.log('🚀 Mizu Pay Content Script Starting...');

// Simple checkout detection
function detectCheckout() {
  console.log('🔍 Checking for checkout...');
  
  // Simple detection - look for common checkout elements
  const checkoutSelectors = [
    '#checkout', '.checkout', '[data-testid*="checkout"]',
    'form[action*="checkout"]', 'form[action*="payment"]',
    '.order-summary', '.cart-checkout', '.place-order'
  ];
  
  let foundCheckout = false;
  
  for (const selector of checkoutSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      console.log('✅ Found checkout element:', selector);
      foundCheckout = true;
      break;
    }
  }
  
  // Also check URL for checkout keywords
  const url = window.location.href.toLowerCase();
  const checkoutKeywords = ['checkout', 'payment', 'billing', 'order', 'cart'];
  
  if (checkoutKeywords.some(keyword => url.includes(keyword))) {
    console.log('✅ Found checkout in URL:', url);
    foundCheckout = true;
  }
  
  return foundCheckout;
}

// Extract amount from page
function extractAmount() {
  console.log('💰 Extracting amount...');
  
  const amountSelectors = [
    '.total', '.total-price', '.amount', '.price', '.cost',
    '[data-testid*="total"]', '[data-testid*="price"]',
    '.checkout-total', '.order-total', '.payment-total',
    '.grand-total', '.final-total', '.cart-total'
  ];
  
  for (const selector of amountSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.textContent || element.innerText;
      const amount = parseFloat(text.replace(/[^\d.,]/g, ''));
      if (amount > 0) {
        console.log('✅ Found amount:', amount, 'from selector:', selector);
        return amount;
      }
    }
  }
  
  console.log('❌ No amount found');
  return 0;
}

// Show floating button
function showFloatingButton() {
  console.log('💎 Showing floating button...');
  
  // Remove existing button if any
  const existingButton = document.getElementById('mizu-pay-floating-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Create floating button
  const floatingButton = document.createElement('div');
  floatingButton.id = 'mizu-pay-floating-button';
  floatingButton.innerHTML = `
    <div class="mizu-pay-button">
      <div class="mizu-pay-icon">💎</div>
      <div class="mizu-pay-text">Pay with CELO</div>
      <div class="mizu-pay-amount">Test Mode</div>
    </div>
  `;
  
  // Add click handler
  floatingButton.addEventListener('click', () => {
    console.log('Floating button clicked!');
    const amount = extractAmount();
    const storeName = document.title.split(' - ')[0] || 'Unknown Store';
    
    // Build redirect URL
    const params = new URLSearchParams({
      store: storeName,
      amount: amount.toString(),
      currency: 'INR',
      country: 'IN',
      description: 'Shopping Cart',
      returnUrl: window.location.href,
      source: 'browser-extension',
      timestamp: Date.now().toString()
    });
    
    const redirectUrl = `http://localhost:3000/payment?${params.toString()}`;
    console.log('Redirecting to:', redirectUrl);
    
    // Open in new tab
    window.open(redirectUrl, '_blank');
  });
  
  // Add to page
  document.body.appendChild(floatingButton);
  
  // Add CSS
  const style = document.createElement('style');
  style.id = 'mizu-pay-styles';
  style.textContent = `
    #mizu-pay-floating-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    #mizu-pay-floating-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
    }

    .mizu-pay-button {
      background: linear-gradient(135deg, #00D4AA 0%, #00A8CC 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 212, 170, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-size: 14px;
      min-width: 140px;
      justify-content: center;
      border: none;
      outline: none;
    }

    .mizu-pay-icon {
      font-size: 16px;
    }

    .mizu-pay-text {
      white-space: nowrap;
      font-size: 12px;
    }

    .mizu-pay-amount {
      font-size: 10px;
      opacity: 0.9;
      text-align: center;
      line-height: 1.2;
    }
  `;
  
  if (!document.getElementById('mizu-pay-styles')) {
    document.head.appendChild(style);
  }
  
  console.log('✅ Floating button created and added to page');
}

// Main initialization
function init() {
  console.log('🚀 Initializing Mizu Pay Content Script...');
  
  // Wait a bit for page to load
  setTimeout(() => {
    console.log('🔍 Starting checkout detection...');
    
    if (detectCheckout()) {
      console.log('✅ Checkout detected! Showing floating button...');
      showFloatingButton();
    } else {
      console.log('❌ No checkout detected');
    }
  }, 1000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also try after a delay for dynamic content
setTimeout(init, 3000);

console.log('✅ Mizu Pay Content Script Loaded');
