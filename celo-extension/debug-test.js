// Simple debug test for the extension
console.log('CELO Pay Extension: Debug test script loaded');

// Test basic functionality
try {
  console.log('CELO Pay Extension: Testing basic functionality...');
  
  // Test if we can access chrome APIs
  if (typeof chrome !== 'undefined') {
    console.log('CELO Pay Extension: Chrome APIs available');
    
    if (chrome.runtime) {
      console.log('CELO Pay Extension: Chrome runtime available');
    } else {
      console.error('CELO Pay Extension: Chrome runtime not available');
    }
  } else {
    console.error('CELO Pay Extension: Chrome APIs not available');
  }
  
  // Test DOM access
  if (typeof document !== 'undefined') {
    console.log('CELO Pay Extension: Document available');
    console.log('CELO Pay Extension: Current URL:', window.location.href);
  } else {
    console.error('CELO Pay Extension: Document not available');
  }
  
  console.log('CELO Pay Extension: Debug test completed successfully');
} catch (error) {
  console.error('CELO Pay Extension: Debug test failed:', error);
}
