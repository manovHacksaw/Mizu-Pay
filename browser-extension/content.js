// Content script for Mizu Pay extension
// Detects checkout forms and displays floating "Pay with CELO" button

class CheckoutDetector {
  constructor() {
    this.floatingButton = null;
    this.isCheckoutDetected = false;
    this.checkoutData = null;
    this.observer = null;
    this.settings = null;
    this.conversionRates = null;
    
    this.init();
  }

  async init() {
    // Get extension settings
    this.settings = await this.getSettings();
    
    if (!this.settings.enabled) {
      console.log('Mizu Pay extension is disabled');
      return;
    }

    // Start monitoring for checkout forms
    this.startMonitoring();
    
    // Check if we're already on a checkout page
    this.checkForCheckout();
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        resolve(response || { 
          enabled: true, 
          showFloatingButton: true,
          dappUrl: 'http://localhost:3000/payment'
        });
      });
    });
  }

  startMonitoring() {
    // Use MutationObserver to watch for dynamic content changes
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          this.checkForCheckout();
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkForCheckout() {
    if (this.isCheckoutDetected) return;

    // Get site-specific detection rules
    const siteRules = this.getSiteSpecificRules();
    const currentDomain = this.getCurrentDomain();
    
    let detected = false;
    let checkoutData = null;

    // Check if current site has specific rules
    if (siteRules[currentDomain]) {
      const result = this.applySiteRules(siteRules[currentDomain]);
      if (result.detected) {
        detected = true;
        checkoutData = result.data;
      }
    } else {
      // Generic checkout detection
      const result = this.detectGenericCheckout();
      if (result.detected) {
        detected = true;
        checkoutData = result.data;
      }
    }

    if (detected && !this.isCheckoutDetected) {
      this.handleCheckoutDetection(checkoutData);
    }
  }

  getCurrentDomain() {
    return window.location.hostname.toLowerCase().replace('www.', '');
  }

  getSiteSpecificRules() {
    return {
      // Indian e-commerce sites
      'flipkart.com': {
        selectors: [
          '#checkout',
          '.checkout',
          '[data-testid*="checkout"]',
          '.cart-checkout',
          '.place-order'
        ],
        amountSelectors: [
          '.total-amount',
          '.cart-total',
          '.order-total',
          '[data-testid*="total"]',
          '.price-total'
        ],
        storeName: 'Flipkart',
        currency: 'INR'
      },
      'amazon.in': {
        selectors: [
          '#spc-orders',
          '.checkout',
          '[data-testid="order-summary"]',
          '.place-your-order'
        ],
        amountSelectors: [
          '.a-size-medium.a-color-price',
          '.order-total',
          '.total-price'
        ],
        storeName: 'Amazon India',
        currency: 'INR'
      },
      'myntra.com': {
        selectors: [
          '.checkout',
          '.place-order',
          '.cart-checkout'
        ],
        amountSelectors: [
          '.total-amount',
          '.cart-total'
        ],
        storeName: 'Myntra',
        currency: 'INR'
      },
      'nykaa.com': {
        selectors: [
          '.checkout',
          '.place-order'
        ],
        amountSelectors: [
          '.total-amount',
          '.cart-total'
        ],
        storeName: 'Nykaa',
        currency: 'INR'
      },
      'bigbasket.com': {
        selectors: [
          '.checkout',
          '.place-order'
        ],
        amountSelectors: [
          '.total-amount',
          '.cart-total'
        ],
        storeName: 'BigBasket',
        currency: 'INR'
      },
      // International sites
      'amazon.com': {
        selectors: [
          '#spc-orders',
          '.checkout',
          '[data-testid="order-summary"]'
        ],
        amountSelectors: [
          '.a-size-medium.a-color-price',
          '.order-total'
        ],
        storeName: 'Amazon',
        currency: 'USD'
      },
      'ebay.com': {
        selectors: [
          '#checkout',
          '.checkout-container',
          '[data-testid="checkout"]'
        ],
        amountSelectors: [
          '.total-price',
          '.checkout-total'
        ],
        storeName: 'eBay',
        currency: 'USD'
      },
      'etsy.com': {
        selectors: [
          '.checkout-page',
          '#checkout'
        ],
        amountSelectors: [
          '.total-price'
        ],
        storeName: 'Etsy',
        currency: 'USD'
      },
      'shopify.com': {
        selectors: [
          '.checkout',
          '#checkout',
          '[data-checkout]'
        ],
        amountSelectors: [
          '.total-line-price',
          '.checkout-summary'
        ],
        storeName: 'Shopify Store',
        currency: 'USD'
      }
    };
  }

  applySiteRules(rules) {
    for (const selector of rules.selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const amount = this.extractAmount(rules.amountSelectors);
        const currency = rules.currency || this.detectCurrency();
        
        return {
          detected: true,
          data: {
            storeName: rules.storeName,
            amount: amount,
            currency: currency,
            country: this.detectCountry(),
            description: this.extractDescription(),
            url: window.location.href,
            domain: this.getCurrentDomain()
          }
        };
      }
    }
    return { detected: false };
  }

  detectGenericCheckout() {
    // Generic checkout detection patterns
    const checkoutKeywords = [
      'checkout', 'payment', 'billing', 'order', 'cart', 'purchase',
      'pay', 'buy', 'complete', 'confirm', 'review', 'place-order'
    ];

    const checkoutSelectors = [
      // Common checkout form selectors
      'form[action*="checkout"]',
      'form[action*="payment"]',
      'form[action*="billing"]',
      'form[action*="order"]',
      '#checkout',
      '#payment',
      '#billing',
      '#order',
      '.checkout',
      '.payment',
      '.billing',
      '.order',
      '[data-testid*="checkout"]',
      '[data-testid*="payment"]',
      '[data-testid*="order"]',
      '[class*="checkout"]',
      '[class*="payment"]',
      '[class*="order"]',
      '[id*="checkout"]',
      '[id*="payment"]',
      '[id*="order"]'
    ];

    for (const selector of checkoutSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return {
          detected: true,
          data: {
            storeName: this.extractStoreName(),
            amount: this.extractAmount(),
            currency: this.detectCurrency(),
            country: this.detectCountry(),
            description: this.extractDescription(),
            url: window.location.href,
            domain: this.getCurrentDomain()
          }
        };
      }
    }

    // Check URL patterns
    const url = window.location.href.toLowerCase();
    if (checkoutKeywords.some(keyword => url.includes(keyword))) {
      return {
        detected: true,
        data: {
          storeName: this.extractStoreName(),
          amount: this.extractAmount(),
          currency: this.detectCurrency(),
          country: this.detectCountry(),
          description: this.extractDescription(),
          url: window.location.href,
          domain: this.getCurrentDomain()
        }
      };
    }

    return { detected: false };
  }

  extractStoreName() {
    // Try to extract store name from various sources
    const title = document.title;
    const domain = this.getCurrentDomain();
    
    // Common patterns
    if (domain.includes('amazon')) return 'Amazon';
    if (domain.includes('flipkart')) return 'Flipkart';
    if (domain.includes('myntra')) return 'Myntra';
    if (domain.includes('nykaa')) return 'Nykaa';
    if (domain.includes('bigbasket')) return 'BigBasket';
    if (domain.includes('ebay')) return 'eBay';
    if (domain.includes('etsy')) return 'Etsy';
    if (domain.includes('shopify')) return 'Shopify Store';
    
    // Extract from title
    const titleMatch = title.match(/([^-|]+)/);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    return domain.replace('www.', '');
  }

  extractAmount(selectors = null) {
    const defaultSelectors = [
      '.total', '.total-price', '.amount', '.price', '.cost',
      '[data-testid*="total"]', '[data-testid*="price"]',
      '.checkout-total', '.order-total', '.payment-total',
      '.grand-total', '.final-total', '.cart-total',
      '.order-summary .total', '.checkout-summary .total'
    ];

    const searchSelectors = selectors || defaultSelectors;

    for (const selector of searchSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent || element.innerText;
        const amount = this.parseAmount(text);
        if (amount > 0) {
          return amount;
        }
      }
    }

    return 0;
  }

  parseAmount(text) {
    // Extract numeric amount from text
    const cleanText = text.replace(/[^\d.,$€£¥₹]/g, '');
    const match = cleanText.match(/[\d,]+\.?\d*/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
  }

  detectCurrency() {
    // Try to detect currency from various sources
    const currencySelectors = [
      '.currency', '.price-currency', '[data-currency]',
      '.total-currency', '.amount-currency'
    ];

    for (const selector of currencySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const currency = element.textContent?.trim();
        if (currency && currency.length <= 3) {
          return currency.toUpperCase();
        }
      }
    }

    // Check for currency symbols in price elements
    const priceElements = document.querySelectorAll('.price, .total, .amount');
    for (const element of priceElements) {
      const text = element.textContent || element.innerText;
      if (text.includes('₹')) return 'INR';
      if (text.includes('$')) return 'USD';
      if (text.includes('€')) return 'EUR';
      if (text.includes('£')) return 'GBP';
    }

    // Default based on domain
    const domain = this.getCurrentDomain();
    if (domain.includes('.in')) return 'INR';
    if (domain.includes('.com')) return 'USD';
    if (domain.includes('.co.uk')) return 'GBP';
    if (domain.includes('.de')) return 'EUR';

    return 'INR'; // Default to INR for Indian sites
  }

  detectCountry() {
    // Try to detect country from various sources
    const countrySelectors = [
      'select[name*="country"]',
      'select[name*="region"]',
      'input[name*="country"]',
      '[data-testid*="country"]'
    ];

    for (const selector of countrySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const value = element.value || element.textContent;
        if (value && value.length === 2) {
          return value.toUpperCase();
        }
      }
    }

    // Default based on domain
    const domain = this.getCurrentDomain();
    if (domain.includes('.in')) return 'IN';
    if (domain.includes('.com')) return 'US';
    if (domain.includes('.co.uk')) return 'GB';
    if (domain.includes('.de')) return 'DE';

    return 'IN'; // Default to India
  }

  extractDescription() {
    // Try to extract product/cart description
    const productSelectors = [
      '.product-title', '.item-title', '.product-name',
      '.cart-item', '.order-item', '[data-testid*="product"]',
      '.product-description', '.item-description'
    ];

    const descriptions = [];
    for (const selector of productSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 0 && text.length < 100) {
          descriptions.push(text);
        }
      });
    }

    return descriptions.slice(0, 3).join(', ') || 'Shopping Cart';
  }

  async handleCheckoutDetection(data) {
    console.log('Checkout detected:', data);
    
    this.isCheckoutDetected = true;
    this.checkoutData = data;

    // Get conversion rates
    try {
      const rates = await this.getConversionRates(data.currency, data.amount);
      this.conversionRates = rates;
    } catch (error) {
      console.error('Error getting conversion rates:', error);
    }

    // Notify background script
    chrome.runtime.sendMessage({
      action: 'checkoutDetected',
      data: data
    });

    // Show floating button if enabled
    if (this.settings.showFloatingButton) {
      this.showFloatingButton();
    }
  }

  async getConversionRates(currency, amount) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'getConversionRates',
        currency: currency,
        amount: amount
      }, (response) => {
        resolve(response);
      });
    });
  }

  showFloatingButton() {
    if (this.floatingButton) return;

    // Create floating button
    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'mizu-pay-floating-button';
    this.floatingButton.innerHTML = `
      <div class="mizu-pay-button">
        <div class="mizu-pay-icon">💎</div>
        <div class="mizu-pay-text">Pay with CELO</div>
        <div class="mizu-pay-amount">${this.formatAmount()}</div>
      </div>
    `;

    // Add click handler
    this.floatingButton.addEventListener('click', () => {
      this.redirectToDApp();
    });

    // Add to page
    document.body.appendChild(this.floatingButton);

    // Add CSS
    this.injectStyles();
  }

  formatAmount() {
    if (!this.conversionRates) return '';
    
    const celoAmount = this.conversionRates.conversions.CELO;
    const cusdAmount = this.conversionRates.conversions.cUSD;
    
    return `${celoAmount} CELO / ${cusdAmount} cUSD`;
  }

  injectStyles() {
    if (document.getElementById('mizu-pay-styles')) return;

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

      @media (max-width: 768px) {
        #mizu-pay-floating-button {
          bottom: 10px;
          right: 10px;
        }
        
        .mizu-pay-button {
          padding: 10px 12px;
          font-size: 12px;
          min-width: 120px;
        }
        
        .mizu-pay-text {
          font-size: 11px;
        }
        
        .mizu-pay-amount {
          font-size: 9px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  async redirectToDApp() {
    if (!this.checkoutData) return;

    // Build query parameters
    const params = {
      store: this.checkoutData.storeName,
      amount: this.checkoutData.amount.toString(),
      currency: this.checkoutData.currency,
      country: this.checkoutData.country,
      description: this.checkoutData.description,
      returnUrl: window.location.href,
      source: 'browser-extension',
      timestamp: Date.now().toString()
    };

    // Add conversion rates if available
    if (this.conversionRates) {
      params.celoAmount = this.conversionRates.conversions.CELO;
      params.cusdAmount = this.conversionRates.conversions.cUSD;
    }

    // Send to background script to open DApp
    chrome.runtime.sendMessage({
      action: 'openDApp',
      params: params
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.floatingButton) {
      this.floatingButton.remove();
      this.floatingButton = null;
    }
    
    this.isCheckoutDetected = false;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CheckoutDetector();
  });
} else {
  new CheckoutDetector();
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (window.mizuPayDetector) {
    window.mizuPayDetector.destroy();
  }
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsChanged') {
    // Reload settings and update UI
    location.reload();
  }
});