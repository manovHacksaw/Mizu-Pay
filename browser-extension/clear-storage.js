// Script to clear extension storage and force localhost URL
// Run this in the browser console on any page after the extension is loaded

console.log('Clearing Mizu Pay extension storage...');

// Clear all extension storage
chrome.storage.sync.clear(() => {
  console.log('Cleared sync storage');
});

chrome.storage.local.clear(() => {
  console.log('Cleared local storage');
});

// Set the correct localhost URL
chrome.storage.sync.set({
  enabled: true,
  showFloatingButton: true,
  mizuPayUrl: 'http://localhost:3000/payment'
}, () => {
  console.log('Set localhost URL in storage');
  console.log('Extension should now redirect to localhost:3000/payment');
});

// Alternative: Force reload the extension
chrome.runtime.reload();
