// CELO Pay Extension - Background Service Worker
// Handles extension lifecycle, message passing, and tab management

console.log('CELO Pay Extension: Background script loaded');

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  try {
    console.log('CELO Pay Extension: Installed/Updated', details);
    
    // Initialize default settings
    chrome.storage.local.set({
      celoPaySettings: {
        enabled: true,
        dappUrl: 'http://localhost:3000/payment', // Redirect to your payment page
        conversionApi: 'https://api.exchangerate-api.com/v4/latest/', // Default conversion API
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'],
        blacklistedDomains: [
          'chrome.google.com',
          'chrome-extension://',
          'chrome://',
          'moz-extension://',
          'edge://'
        ]
      }
    });
  } catch (error) {
    console.error('CELO Pay Extension: Installation error', error);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('CELO Pay Extension: Message received', message);
  
  switch (message.type) {
    case 'CHECKOUT_DETECTED':
      handleCheckoutDetected(message.data, sender.tab);
      break;
      
    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true; // Keep message channel open for async response
      
    case 'UPDATE_SETTINGS':
      updateSettings(message.settings).then(sendResponse);
      return true;
      
    case 'OPEN_DAPP':
      openDappWithData(message.data, sender.tab);
      break;
      
    case 'GET_CONVERSION_RATE':
      getConversionRate(message.fromCurrency, message.toCurrency).then(sendResponse);
      return true;
      
    default:
      console.log('CELO Pay Extension: Unknown message type', message.type);
  }
});

// Handle checkout detection
async function handleCheckoutDetected(data, tab) {
  console.log('CELO Pay Extension: Checkout detected', data);
  
  // Get current settings
  const settings = await getSettings();
  
  // Check if extension is enabled
  if (!settings.enabled) {
    console.log('CELO Pay Extension: Extension disabled, ignoring checkout');
    return;
  }
  
  // Check if domain is blacklisted
  if (isDomainBlacklisted(tab.url, settings.blacklistedDomains)) {
    console.log('CELO Pay Extension: Domain blacklisted', tab.url);
    return;
  }
  
  // Store checkout data for potential use
  await chrome.storage.local.set({
    lastCheckout: {
      ...data,
      timestamp: Date.now(),
      tabId: tab.id,
      url: tab.url
    }
  });
  
  console.log('CELO Pay Extension: Checkout data stored', data);
}

// Open DApp with checkout data
async function openDappWithData(data, tab) {
  try {
    const settings = await getSettings();
    const dappUrl = settings.dappUrl;
    
    // Build URL with query parameters
    const params = new URLSearchParams({
      store: data.store || 'Unknown Store',
      amount: data.amount || '0',
      currency: data.currency || 'USD',
      product_name: data.product_name || 'Purchase',
      original_url: tab.url,
      timestamp: Date.now().toString()
    });
    
    // Add conversion data if available
    if (data.conversion) {
      params.append('celo_amount', data.conversion.celoAmount);
      params.append('cusd_amount', data.conversion.cusdAmount);
      params.append('conversion_rate', data.conversion.rate);
    }
    
    const finalUrl = `${dappUrl}?${params.toString()}`;
    
    console.log('CELO Pay Extension: Opening DApp with data', finalUrl);
    
    // Open DApp in new tab
    await chrome.tabs.create({ url: finalUrl });
    
  } catch (error) {
    console.error('CELO Pay Extension: Error opening DApp', error);
  }
}

// Get extension settings
async function getSettings() {
  const result = await chrome.storage.local.get(['celoPaySettings']);
  return result.celoPaySettings || {};
}

// Update extension settings
async function updateSettings(newSettings) {
  const currentSettings = await getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  
  await chrome.storage.local.set({ celoPaySettings: updatedSettings });
  console.log('CELO Pay Extension: Settings updated', updatedSettings);
  
  return updatedSettings;
}

// Get currency conversion rate
async function getConversionRate(fromCurrency, toCurrency) {
  try {
    const settings = await getSettings();
    const apiUrl = `${settings.conversionApi}${fromCurrency}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.rates && data.rates[toCurrency]) {
      return {
        rate: data.rates[toCurrency],
        timestamp: Date.now()
      };
    } else {
      throw new Error(`Conversion rate not found for ${fromCurrency} to ${toCurrency}`);
    }
  } catch (error) {
    console.error('CELO Pay Extension: Conversion rate error', error);
    return { rate: 1, error: error.message };
  }
}

// Check if domain is blacklisted
function isDomainBlacklisted(url, blacklistedDomains) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return blacklistedDomains.some(blacklisted => 
      domain.includes(blacklisted.toLowerCase())
    );
  } catch (error) {
    console.error('CELO Pay Extension: Error checking blacklist', error);
    return false;
  }
}

// Handle tab updates to detect navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Clear any existing checkout data when navigating to new page
    chrome.storage.local.remove(['lastCheckout']);
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will be handled by the popup, but we can add fallback logic here
  console.log('CELO Pay Extension: Icon clicked on tab', tab.id);
});
