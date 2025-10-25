// CELO Pay Extension - Background Service Worker
console.log("CELO Pay Extension: Background script loaded");

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log("CELO Pay Extension: Installed/Updated", details);
  
  // Initialize default settings
  chrome.storage.local.set({
    celoPaySettings: {
      enabled: true,
      dappUrl: "http://localhost:3000/payment",
      conversionApi: "https://api.exchangerate-api.com/v4/latest/",
      supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"],
      blacklistedDomains: ["chrome.google.com", "chrome-extension://", "chrome://", "moz-extension://", "edge://"]
    }
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("CELO Pay Extension: Message received", message);
  
  switch (message.type) {
    case "CHECKOUT_DETECTED":
      handleCheckoutDetected(message.data, sender.tab);
      break;
      
    case "GET_SETTINGS":
      getSettings().then(sendResponse);
      return true;
      
    case "UPDATE_SETTINGS":
      updateSettings(message.settings).then(sendResponse);
      return true;
      
    case "OPEN_DAPP":
      openDappWithData(message.data, sender.tab);
      break;
      
    default:
      console.log("CELO Pay Extension: Unknown message type", message.type);
  }
});

// Handle checkout detection
async function handleCheckoutDetected(data, tab) {
  console.log("CELO Pay Extension: Checkout detected", data);
  
  const settings = await getSettings();
  
  if (!settings.enabled) {
    console.log("CELO Pay Extension: Extension disabled");
    return;
  }
  
  // Store checkout data
  await chrome.storage.local.set({
    lastCheckout: {
      ...data,
      timestamp: Date.now(),
      tabId: tab.id,
      url: tab.url
    }
  });
  
  console.log("CELO Pay Extension: Checkout data stored");
}

// Open DApp with checkout data
async function openDappWithData(data, tab) {
  try {
    const settings = await getSettings();
    const dappUrl = settings.dappUrl;
    
    const params = new URLSearchParams({
      store: data.store || "Unknown Store",
      amount: data.amount || "0",
      currency: data.currency || "USD",
      product_name: data.product_name || "Purchase",
      original_url: tab.url,
      timestamp: Date.now().toString()
    });
    
    if (data.conversion) {
      params.append("celo_amount", data.conversion.celoAmount);
      params.append("cusd_amount", data.conversion.cusdAmount);
      params.append("conversion_rate", data.conversion.rate);
    }
    
    const finalUrl = `${dappUrl}?${params.toString()}`;
    console.log("CELO Pay Extension: Opening DApp", finalUrl);
    
    await chrome.tabs.create({ url: finalUrl });
  } catch (error) {
    console.error("CELO Pay Extension: Error opening DApp", error);
  }
}

// Get extension settings
async function getSettings() {
  const result = await chrome.storage.local.get(["celoPaySettings"]);
  return result.celoPaySettings || {};
}

// Update extension settings
async function updateSettings(newSettings) {
  const currentSettings = await getSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  
  await chrome.storage.local.set({ celoPaySettings: updatedSettings });
  console.log("CELO Pay Extension: Settings updated", updatedSettings);
  
  return updatedSettings;
}

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.storage.local.remove(["lastCheckout"]);
  }
});

console.log("CELO Pay Extension: Background script ready");