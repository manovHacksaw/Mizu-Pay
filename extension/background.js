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
            "dappUrl": "mizu-pay.vercel.app"
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
    
    // Store complete checkout information (all details from content script)
    await chrome.storage.local.set({
        "currentCheckout": {
            storeName: data.storeName,
            url: data.url,
            totalAmount: data.totalAmount,
            currency: data.currency,
            timestamp: data.timestamp,
            tabId: sender.tab?.id
        }
    });
    
    // Try to open the extension popup programmatically
    // Note: In Manifest V3, this only works in response to user action (which we have)
    try {
        await chrome.action.openPopup();
        console.log("Popup opened successfully");
    } catch (error) {
        console.log("Could not open popup programmatically:", error);
        // Fallback: Show notification or badge
        chrome.action.setBadgeText({ text: "1" });
        chrome.action.setBadgeBackgroundColor({ color: "#007bff" });
    }
    
    return {
        message: "Payment flow initiated",
        checkoutStored: true
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