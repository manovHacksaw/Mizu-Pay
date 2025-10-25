// CELO Extension Background Script
console.log('CELO Extension: Background script loaded');

// Default settings
const defaultSettings = {
    autoDetect: true,
    showFloatingButton: true,
    dappUrl: 'http://localhost:3000/payment'
};

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
    console.log('CELO Extension: Installing/updating', details.reason);
    
    // Set default settings
    chrome.storage.sync.set({ celoExtensionSettings: defaultSettings });
    
    // Set up context menu (optional)
    chrome.contextMenus.create({
        id: 'celo-pay',
        title: 'Pay with CELO',
        contexts: ['page']
    });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('CELO Extension: Message received', request);
    
    switch (request.action) {
        case 'getSettings':
            handleGetSettings(sendResponse);
            return true; // Keep message channel open for async response
            
        case 'checkoutDetected':
            handleCheckoutDetected(request.data, sender);
            break;
            
        case 'testDetection':
            handleTestDetection(sender, sendResponse);
            return true;
            
        case 'openDApp':
            handleOpenDApp(request.data);
            break;
            
        default:
            console.log('CELO Extension: Unknown action', request.action);
    }
});

// Handle get settings request
async function handleGetSettings(sendResponse) {
    try {
        const result = await chrome.storage.sync.get(['celoExtensionSettings']);
        const settings = result.celoExtensionSettings || defaultSettings;
        console.log('CELO Extension: Returning settings', settings);
        sendResponse(settings);
    } catch (error) {
        console.error('CELO Extension: Error getting settings', error);
        sendResponse(defaultSettings);
    }
}

// Handle checkout detection
function handleCheckoutDetected(data, sender) {
    console.log('CELO Extension: Checkout detected', data);
    
    // Store checkout data
    chrome.storage.local.set({ 
        lastCheckout: { 
            ...data, 
            timestamp: Date.now(),
            tabId: sender.tab.id,
            url: sender.tab.url
        } 
    });
    
    // Notify popup if it's open
    chrome.runtime.sendMessage({ 
        action: 'checkoutDetected', 
        data: data 
    }).catch(() => {
        // Popup might not be open, that's okay
    });
}

// Handle test detection request
async function handleTestDetection(sender, sendResponse) {
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Send message to content script
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'testDetection' });
        sendResponse(response);
    } catch (error) {
        console.error('CELO Extension: Error testing detection', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle open DApp request
function handleOpenDApp(data) {
    console.log('CELO Extension: Opening DApp with data', data);
    
    // Build URL with parameters
    const params = new URLSearchParams(data);
    const url = `${defaultSettings.dappUrl}?${params.toString()}`;
    
    // Open in new tab
    chrome.tabs.create({ url: url });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'celo-pay') {
        console.log('CELO Extension: Context menu clicked');
        
        // Open DApp
        chrome.tabs.create({ url: defaultSettings.dappUrl });
    }
});

// Handle tab updates (for SPA navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('CELO Extension: Tab updated', tab.url);
        
        // Notify content script to re-evaluate
        chrome.tabs.sendMessage(tabId, { action: 'reEvaluate' }).catch(() => {
            // Content script might not be ready yet
        });
    }
});

// Handle extension icon clicks
chrome.action.onClicked.addListener((tab) => {
    console.log('CELO Extension: Icon clicked');
    
    // Open popup (this is handled by the popup.html)
    // But we can also open the DApp directly if needed
    chrome.tabs.create({ url: defaultSettings.dappUrl });
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('CELO Extension: Storage changed', changes, namespace);
    
    if (namespace === 'sync' && changes.celoExtensionSettings) {
        console.log('CELO Extension: Settings updated', changes.celoExtensionSettings.newValue);
        
        // Notify all content scripts about settings change
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { 
                    action: 'settingsUpdated', 
                    settings: changes.celoExtensionSettings.newValue 
                }).catch(() => {
                    // Tab might not have content script
                });
            });
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('CELO Extension: Browser startup');
    
    // Initialize settings if they don't exist
    chrome.storage.sync.get(['celoExtensionSettings'], (result) => {
        if (!result.celoExtensionSettings) {
            chrome.storage.sync.set({ celoExtensionSettings: defaultSettings });
        }
    });
});

// Handle extension suspend/resume
chrome.runtime.onSuspend.addListener(() => {
    console.log('CELO Extension: Suspending');
});

// Utility function to get current settings
async function getCurrentSettings() {
    try {
        const result = await chrome.storage.sync.get(['celoExtensionSettings']);
        return result.celoExtensionSettings || defaultSettings;
    } catch (error) {
        console.error('CELO Extension: Error getting current settings', error);
        return defaultSettings;
    }
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        defaultSettings,
        getCurrentSettings
    };
}
