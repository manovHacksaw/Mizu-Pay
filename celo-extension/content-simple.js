// CELO Pay Extension - Simple Content Script (Debug Version)
console.log('CELO Pay Extension: Simple content script loaded on', window.location.href);

// Simple test function
function simpleTest() {
  console.log('CELO Pay Extension: Running simple test...');
  
  // Create a simple test element
  const testDiv = document.createElement('div');
  testDiv.id = 'celo-pay-test';
  testDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #35D07F;
    color: white;
    padding: 10px;
    border-radius: 5px;
    z-index: 999999;
    font-family: Arial, sans-serif;
    font-size: 12px;
  `;
  testDiv.innerHTML = 'CELO Pay Extension Active';
  
  document.body.appendChild(testDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    if (testDiv.parentNode) {
      testDiv.parentNode.removeChild(testDiv);
    }
  }, 3000);
  
  console.log('CELO Pay Extension: Simple test completed');
}

// Run the test
try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', simpleTest);
  } else {
    simpleTest();
  }
} catch (error) {
  console.error('CELO Pay Extension: Simple test error', error);
}
