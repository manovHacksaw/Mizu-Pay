// Helper function to get extension settings
// Moved outside onInstalled so it can be used by other functions
async function getSettings() {
    const result = await chrome.storage.local.get(["mizuPaySettings"]);
    return result.mizuPaySettings || {};
}

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("Mizu Pay installed");

    chrome.storage.local.set({
        "mizuPaySettings": {
            "enabled": true,
            "currency": "usd",
            "dappUrl": "localhost:3000"
        }
    });
});

// Listen for messages from content script (and popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background received message:", request);
    
    // Handle different message types
    if (request.type === 'MIZU_PAY_CLICKED') {
        // User clicked "Pay With Mizu Pay" button
        handleMizuPayClick(request.data, sender)
            .then(response => {
                sendResponse({ success: true, data: response });
            })
            .catch(error => {
                console.error("Error handling Mizu Pay click:", error);
                sendResponse({ success: false, error: error.message });
            });
        
        // Return true to indicate we'll send response asynchronously
        return true;
    }
    
    // Handle other message types here in the future
    return false; // No response needed
});

// Handle when user clicks "Pay With Mizu Pay" button
async function handleMizuPayClick(data, sender) {
    console.log("Processing Mizu Pay click:", data);
    
    // Get extension settings
    const settings = await getSettings();
    
    // Store checkout information
    await chrome.storage.local.set({
        "currentCheckout": {
            url: data.url,
            timestamp: data.timestamp,
            tabId: sender.tab?.id
        }
    });
    
    // Open the extension popup
    // Note: In Manifest V3, we can't directly open popup programmatically
    // Alternative: Open a new tab with the dApp URL or show notification
    if (settings.dappUrl) {
        const dappUrl = `http://${settings.dappUrl}`;
        chrome.tabs.create({ url: dappUrl });
    }
    
    return {
        message: "Payment flow initiated",
        dappUrl: settings.dappUrl
    };
}

// Handle checkout detection (for future use)
async function handleCheckoutDetected(checkoutData) {
    console.log("Checkout detected:", checkoutData);
    // Store checkout data for later use
    await chrome.storage.local.set({
        "detectedCheckout": checkoutData
    });
}