// Popup script for Mizu Pay extension
// Handles popup UI interactions and communication with background service

class PopupManager {
  constructor() {
    this.settings = null;
    this.checkoutData = null;
    this.currentTab = null;
    this.conversionRates = null;
    
    this.init();
  }

  async init() {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tabs[0];

    // Load settings
    await this.loadSettings();
    
    // Load checkout data
    await this.loadCheckoutData();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Update UI
    this.updateUI();
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        this.settings = response || {
          enabled: true,
          showFloatingButton: true,
          dappUrl: 'http://localhost:3000/payment'
        };
        resolve();
      });
    });
  }

  async loadCheckoutData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['lastCheckout'], (result) => {
        this.checkoutData = result.lastCheckout;
        resolve();
      });
    });
  }

  setupEventListeners() {
    // Settings toggles
    document.getElementById('extensionEnabled').addEventListener('change', (e) => {
      this.updateSetting('enabled', e.target.checked);
    });

    document.getElementById('showFloatingButton').addEventListener('change', (e) => {
      this.updateSetting('showFloatingButton', e.target.checked);
    });

    document.getElementById('dappUrl').addEventListener('change', (e) => {
      this.updateSetting('dappUrl', e.target.value);
    });

    // Action buttons
    document.getElementById('payWithCeloBtn').addEventListener('click', () => {
      this.payWithCelo();
    });

    document.getElementById('openDApp').addEventListener('click', () => {
      this.openDApp();
    });

    document.getElementById('testDetection').addEventListener('click', () => {
      this.testDetection();
    });

    document.getElementById('refreshRates').addEventListener('click', () => {
      this.refreshRates();
    });

    // Footer links
    document.getElementById('helpLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });

    document.getElementById('settingsLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openSettings();
    });
  }

  async updateSetting(key, value) {
    this.settings[key] = value;
    
    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: { [key]: value }
    }, (response) => {
      if (response && response.success) {
        console.log(`Setting ${key} updated to ${value}`);
        
        // Notify content script of setting change
        chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'settingsChanged',
          settings: this.settings
        });
      }
    });
  }

  updateUI() {
    // Update settings toggles
    document.getElementById('extensionEnabled').checked = this.settings.enabled;
    document.getElementById('showFloatingButton').checked = this.settings.showFloatingButton;
    document.getElementById('dappUrl').value = this.settings.dappUrl;

    // Update checkout section visibility
    const checkoutSection = document.getElementById('checkoutSection');
    const noCheckoutSection = document.getElementById('noCheckoutSection');

    if (this.checkoutData && this.isRecentCheckout()) {
      checkoutSection.style.display = 'block';
      noCheckoutSection.style.display = 'none';
      
      // Update checkout info
      document.getElementById('storeName').textContent = this.checkoutData.storeName || 'Unknown Store';
      document.getElementById('amount').textContent = this.formatAmount(this.checkoutData.amount);
      document.getElementById('currency').textContent = this.checkoutData.currency || 'INR';
      document.getElementById('country').textContent = this.checkoutData.country || 'IN';
      
      // Update conversion amounts
      this.updateConversionAmounts();
    } else {
      checkoutSection.style.display = 'none';
      noCheckoutSection.style.display = 'block';
    }

    // Update status indicator
    this.updateStatusIndicator();
  }

  async updateConversionAmounts() {
    if (!this.checkoutData) return;

    try {
      const rates = await this.getConversionRates(
        this.checkoutData.currency, 
        this.checkoutData.amount
      );
      
      if (rates) {
        document.getElementById('celoAmount').textContent = 
          `${rates.conversions.CELO} CELO`;
        document.getElementById('cusdAmount').textContent = 
          `${rates.conversions.cUSD} cUSD`;
      }
    } catch (error) {
      console.error('Error updating conversion amounts:', error);
      document.getElementById('celoAmount').textContent = 'Loading...';
      document.getElementById('cusdAmount').textContent = 'Loading...';
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

  isRecentCheckout() {
    if (!this.checkoutData) return false;
    
    const now = Date.now();
    const checkoutTime = this.checkoutData.timestamp || 0;
    const timeDiff = now - checkoutTime;
    
    // Consider checkout recent if it's within the last 5 minutes
    return timeDiff < 5 * 60 * 1000;
  }

  formatAmount(amount) {
    if (!amount || amount === 0) return '₹0.00';
    return `₹${parseFloat(amount).toFixed(2)}`;
  }

  updateStatusIndicator() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const statusDot = statusIndicator.querySelector('.status-dot');

    if (this.checkoutData && this.isRecentCheckout()) {
      statusText.textContent = 'Checkout Detected';
      statusDot.style.background = '#00D4AA';
    } else if (this.settings.enabled) {
      statusText.textContent = 'Ready';
      statusDot.style.background = '#00D4AA';
    } else {
      statusText.textContent = 'Disabled';
      statusDot.style.background = '#666';
    }
  }

  async payWithCelo() {
    if (!this.checkoutData) {
      console.log('No checkout data available');
      return;
    }

    // Build redirect URL with payment details as query parameters
    const params = {
      store: this.checkoutData.storeName || 'Unknown Store',
      amount: this.checkoutData.amount?.toString() || '0',
      currency: this.checkoutData.currency || 'INR',
      country: this.checkoutData.country || 'IN',
      description: this.checkoutData.description || 'Shopping Cart',
      returnUrl: this.currentTab.url,
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
    }, (response) => {
      if (response && response.success) {
        console.log('DApp opened successfully');
        window.close();
      }
    });
  }

  openDApp() {
    chrome.runtime.sendMessage({
      action: 'openDApp',
      params: { source: 'popup' }
    });
    window.close();
  }

  async testDetection() {
    // Send test message to content script
    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'testDetection'
      });
      
      if (response && response.success) {
        console.log('Detection test successful');
        // Reload checkout data
        await this.loadCheckoutData();
        this.updateUI();
      } else {
        console.log('Detection test failed');
        this.showNotification('Detection test failed. Make sure you\'re on a checkout page.');
      }
    } catch (error) {
      console.error('Error testing detection:', error);
      this.showNotification('Error testing detection. Please refresh the page and try again.');
    }
  }

  async refreshRates() {
    if (!this.checkoutData) {
      this.showNotification('No checkout data available to refresh rates.');
      return;
    }

    try {
      const rates = await this.getConversionRates(
        this.checkoutData.currency, 
        this.checkoutData.amount
      );
      
      if (rates) {
        this.conversionRates = rates;
        this.updateConversionAmounts();
        this.showNotification('Conversion rates refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing rates:', error);
      this.showNotification('Error refreshing rates. Please try again.');
    }
  }

  showNotification(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #00D4AA;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  openHelp() {
    chrome.tabs.create({ 
      url: 'https://github.com/mizupay/browser-extension#help' 
    });
    window.close();
  }

  openSettings() {
    // Open extension options page if available
    chrome.runtime.openOptionsPage();
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkoutDetected') {
    // Reload popup data when new checkout is detected
    location.reload();
  }
});