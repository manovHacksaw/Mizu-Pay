// CELO Extension Popup Script
let settings = {
    autoDetect: true,
    showFloatingButton: true,
    dappUrl: 'http://localhost:3000/payment'
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
    updateUI();
});

// Load settings from storage
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(['celoExtensionSettings']);
        if (result.celoExtensionSettings) {
            settings = { ...settings, ...result.celoExtensionSettings };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings to storage
async function saveSettings() {
    try {
        await chrome.storage.sync.set({ celoExtensionSettings: settings });
        console.log('Settings saved:', settings);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Open DApp button
    document.getElementById('open-dapp-btn').addEventListener('click', () => {
        chrome.tabs.create({ url: settings.dappUrl });
        window.close();
    });
    
    // Test detection button
    document.getElementById('test-detection-btn').addEventListener('click', async () => {
        await testDetection();
    });
    
    // Auto-detect toggle
    document.getElementById('auto-detect-toggle').addEventListener('click', () => {
        settings.autoDetect = !settings.autoDetect;
        updateToggle('auto-detect-toggle', settings.autoDetect);
        saveSettings();
    });
    
    // Floating button toggle
    document.getElementById('floating-button-toggle').addEventListener('click', () => {
        settings.showFloatingButton = !settings.showFloatingButton;
        updateToggle('floating-button-toggle', settings.showFloatingButton);
        saveSettings();
    });
}

// Update toggle visual state
function updateToggle(toggleId, isActive) {
    const toggle = document.getElementById(toggleId);
    if (isActive) {
        toggle.classList.add('active');
    } else {
        toggle.classList.remove('active');
    }
}

// Update UI based on current state
function updateUI() {
    updateToggle('auto-detect-toggle', settings.autoDetect);
    updateToggle('floating-button-toggle', settings.showFloatingButton);
    
    // Update status text
    const statusText = document.getElementById('status-text');
    if (settings.autoDetect) {
        statusText.textContent = 'Auto-detection enabled';
    } else {
        statusText.textContent = 'Auto-detection disabled';
    }
}

// Test detection on current tab
async function testDetection() {
    const statusText = document.getElementById('status-text');
    statusText.textContent = 'Testing detection...';
    
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Send message to content script to test detection
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'testDetection' });
        
        if (response && response.success) {
            statusText.textContent = 'Checkout detected!';
            statusText.style.color = '#28a745';
        } else {
            statusText.textContent = 'No checkout detected on this page';
            statusText.style.color = '#dc3545';
        }
    } catch (error) {
        console.error('Error testing detection:', error);
        statusText.textContent = 'Error testing detection';
        statusText.style.color = '#dc3545';
    }
    
    // Reset status after 3 seconds
    setTimeout(() => {
        statusText.textContent = settings.autoDetect ? 'Auto-detection enabled' : 'Auto-detection disabled';
        statusText.style.color = '#718096';
    }, 3000);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkoutDetected') {
        updateStatus('Checkout detected on current page!');
    } else if (request.action === 'checkoutData') {
        console.log('Checkout data received:', request.data);
        updateStatus(`Detected: ${request.data.storeName} - ${request.data.currency} ${request.data.amount}`);
    }
});

// Update status text
function updateStatus(message) {
    const statusText = document.getElementById('status-text');
    statusText.textContent = message;
    statusText.style.color = '#28a745';
    
    // Reset after 5 seconds
    setTimeout(() => {
        statusText.textContent = settings.autoDetect ? 'Auto-detection enabled' : 'Auto-detection disabled';
        statusText.style.color = '#718096';
    }, 5000);
}
