// Debug script for Mizu Pay extension
// Run this in the browser console to debug detection issues

console.log('🔍 Mizu Pay Extension Debug Tool');
console.log('=====================================');

// Check if extension is loaded
function checkExtensionLoaded() {
  console.log('1. Checking if extension is loaded...');
  
  if (typeof chrome === 'undefined') {
    console.error('❌ Chrome extension API not available');
    return false;
  }
  
  if (!chrome.runtime || !chrome.runtime.id) {
    console.error('❌ Extension not loaded or not in extension context');
    return false;
  }
  
  console.log('✅ Extension API available');
  return true;
}

// Check extension settings
async function checkExtensionSettings() {
  console.log('2. Checking extension settings...');
  
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        resolve(response);
      });
    });
    
    console.log('Extension settings:', response);
    
    if (!response.enabled) {
      console.error('❌ Extension is disabled');
      return false;
    }
    
    if (!response.showFloatingButton) {
      console.error('❌ Floating button is disabled');
      return false;
    }
    
    console.log('✅ Extension settings are correct');
    return true;
  } catch (error) {
    console.error('❌ Error getting settings:', error);
    return false;
  }
}

// Check if content script is running
function checkContentScript() {
  console.log('3. Checking content script...');
  
  if (window.mizuPayDetector) {
    console.log('✅ Content script detector found');
    return true;
  }
  
  // Check for floating button
  const floatingButton = document.getElementById('mizu-pay-floating-button');
  if (floatingButton) {
    console.log('✅ Floating button found in DOM');
    return true;
  }
  
  console.error('❌ Content script not running or detector not found');
  return false;
}

// Test checkout detection manually
function testCheckoutDetection() {
  console.log('4. Testing checkout detection...');
  
  // Check for common checkout selectors
  const checkoutSelectors = [
    '#checkout', '.checkout', '[data-testid*="checkout"]',
    'form[action*="checkout"]', 'form[action*="payment"]',
    '.order-summary', '.cart-checkout', '.place-order'
  ];
  
  let foundElements = [];
  
  checkoutSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      foundElements.push({ selector, count: elements.length });
    }
  });
  
  if (foundElements.length > 0) {
    console.log('✅ Found potential checkout elements:', foundElements);
    return true;
  } else {
    console.error('❌ No checkout elements found');
    return false;
  }
}

// Test amount extraction
function testAmountExtraction() {
  console.log('5. Testing amount extraction...');
  
  const amountSelectors = [
    '.total', '.total-price', '.amount', '.price', '.cost',
    '[data-testid*="total"]', '[data-testid*="price"]',
    '.checkout-total', '.order-total', '.payment-total',
    '.grand-total', '.final-total', '.cart-total'
  ];
  
  let foundAmounts = [];
  
  amountSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      const text = el.textContent || el.innerText;
      const amount = parseFloat(text.replace(/[^\d.,]/g, ''));
      if (amount > 0) {
        foundAmounts.push({ selector, text, amount });
      }
    });
  });
  
  if (foundAmounts.length > 0) {
    console.log('✅ Found potential amounts:', foundAmounts);
    return true;
  } else {
    console.error('❌ No amounts found');
    return false;
  }
}

// Force show floating button
function forceShowButton() {
  console.log('6. Force showing floating button...');
  
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
    alert('Floating button is working!');
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
  
  console.log('✅ Floating button force-created');
  return true;
}

// Run all debug checks
async function runDebugChecks() {
  console.log('🚀 Running Mizu Pay Extension Debug Checks');
  console.log('==========================================');
  
  const checks = [
    checkExtensionLoaded(),
    await checkExtensionSettings(),
    checkContentScript(),
    testCheckoutDetection(),
    testAmountExtraction()
  ];
  
  const passedChecks = checks.filter(Boolean).length;
  const totalChecks = checks.length;
  
  console.log(`\n📊 Debug Results: ${passedChecks}/${totalChecks} checks passed`);
  
  if (passedChecks < totalChecks) {
    console.log('\n🔧 Attempting to fix issues...');
    
    // Try to force show button
    forceShowButton();
    
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Make sure the extension is enabled in chrome://extensions/');
    console.log('2. Check if the page is a checkout page');
    console.log('3. Try refreshing the page');
    console.log('4. Check the extension popup for settings');
  } else {
    console.log('\n✅ All checks passed! The extension should be working.');
  }
}

// Auto-run debug checks
runDebugChecks();

// Export functions for manual testing
window.mizuPayDebug = {
  checkExtensionLoaded,
  checkExtensionSettings,
  checkContentScript,
  testCheckoutDetection,
  testAmountExtraction,
  forceShowButton,
  runDebugChecks
};

console.log('\n🛠️ Debug functions available as window.mizuPayDebug');
console.log('Example: window.mizuPayDebug.forceShowButton()');
