// Background service worker for Mizu Pay extension
// Handles extension lifecycle, storage, and communication

class BackgroundService {
  constructor() {
    this.initializeExtension();
  }

  async initializeExtension() {
    console.log('Mizu Pay extension background service started');
    
    // Set default settings on first install
    await this.setDefaultSettings();
    
    // Setup message listeners
    this.setupMessageListeners();
    
    // Setup storage change listeners
    this.setupStorageListeners();
  }

  async setDefaultSettings() {
    const result = await chrome.storage.sync.get([
      'enabled',
      'showFloatingButton',
      'dappUrl',
      'conversionApi',
      'supportedSites',
      'currencyPreferences'
    ]);

    const defaultSettings = {
      enabled: result.enabled !== false,
      showFloatingButton: result.showFloatingButton !== false,
      dappUrl: result.dappUrl || 'http://localhost:3000/payment',
      conversionApi: result.conversionApi || 'https://api.coingecko.com/api/v3/simple/price',
      supportedSites: result.supportedSites || [
        'amazon.com', 'flipkart.com', 'ebay.com', 'etsy.com', 'shopify.com',
        'myntra.com', 'nykaa.com', 'bigbasket.com', 'swiggy.com', 'zomato.com'
      ],
      currencyPreferences: result.currencyPreferences || {
        defaultCurrency: 'INR',
        targetCurrencies: ['CELO', 'cUSD'],
        conversionRate: 1.0
      }
    };

    await chrome.storage.sync.set(defaultSettings);
    console.log('Default settings initialized');
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse(settings);
          break;

        case 'updateSettings':
          await this.updateSettings(request.settings);
          sendResponse({ success: true });
          break;

        case 'checkoutDetected':
          await this.handleCheckoutDetection(request.data, sender.tab);
          sendResponse({ success: true });
          break;

        case 'getConversionRates':
          const rates = await this.getConversionRates(request.currency, request.amount);
          sendResponse(rates);
          break;

        case 'openDApp':
          await this.openDApp(request.params);
          sendResponse({ success: true });
          break;

        default:
          console.log('Unknown action:', request.action);
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async getSettings() {
    const result = await chrome.storage.sync.get([
      'enabled',
      'showFloatingButton',
      'dappUrl',
      'conversionApi',
      'supportedSites',
      'currencyPreferences'
    ]);

    return {
      enabled: result.enabled !== false,
      showFloatingButton: result.showFloatingButton !== false,
      dappUrl: result.dappUrl || 'http://localhost:3000/payment',
      conversionApi: result.conversionApi || 'https://api.coingecko.com/api/v3/simple/price',
      supportedSites: result.supportedSites || [],
      currencyPreferences: result.currencyPreferences || {}
    };
  }

  async updateSettings(newSettings) {
    await chrome.storage.sync.set(newSettings);
    console.log('Settings updated:', newSettings);
  }

  async handleCheckoutDetection(data, tab) {
    console.log('Checkout detected:', data);
    
    // Store checkout data for popup
    await chrome.storage.local.set({
      lastCheckout: {
        ...data,
        timestamp: Date.now(),
        tabId: tab.id,
        url: tab.url
      }
    });

    // Notify all content scripts about the detection
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) {
      try {
        await chrome.tabs.sendMessage(t.id, {
          action: 'checkoutDetected',
          data: data
        });
      } catch (error) {
        // Ignore errors for tabs without content scripts
      }
    }
  }

  async getConversionRates(currency, amount) {
    try {
      const settings = await this.getSettings();
      
      // For MVP, use a simple conversion rate
      // TODO: Replace with real API integration
      const conversionRates = {
        'INR': {
          'CELO': 0.0001, // 1 INR = 0.0001 CELO (example rate)
          'cUSD': 0.012   // 1 INR = 0.012 cUSD (example rate)
        },
        'USD': {
          'CELO': 0.1,    // 1 USD = 0.1 CELO (example rate)
          'cUSD': 1.0     // 1 USD = 1.0 cUSD (example rate)
        }
      };

      const rates = conversionRates[currency] || conversionRates['INR'];
      
      return {
        originalAmount: amount,
        originalCurrency: currency,
        conversions: {
          CELO: (amount * rates.CELO).toFixed(6),
          cUSD: (amount * rates.cUSD).toFixed(2)
        },
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting conversion rates:', error);
      return {
        originalAmount: amount,
        originalCurrency: currency,
        conversions: {
          CELO: (amount * 0.0001).toFixed(6),
          cUSD: (amount * 0.012).toFixed(2)
        },
        timestamp: Date.now()
      };
    }
  }

  async openDApp(params) {
    const settings = await this.getSettings();
    
    // Build URL with query parameters
    const url = new URL(settings.dappUrl);
    Object.keys(params).forEach(key => {
      url.searchParams.set(key, params[key]);
    });

    // Open in new tab
    await chrome.tabs.create({ url: url.toString() });
    console.log('Opened DApp with params:', params);
  }

  setupStorageListeners() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      console.log('Storage changed:', changes, namespace);
      
      // Notify content scripts of setting changes
      if (namespace === 'sync' && (changes.enabled || changes.showFloatingButton)) {
        this.notifyContentScripts('settingsChanged', changes);
      }
    });
  }

  async notifyContentScripts(action, data) {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action, data });
      } catch (error) {
        // Ignore errors for tabs without content scripts
      }
    }
  }
}

// Initialize background service
new BackgroundService();

// Handle extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('First time installation - setting up default configuration');
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Extension updated from version', details.previousVersion);
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup');
});