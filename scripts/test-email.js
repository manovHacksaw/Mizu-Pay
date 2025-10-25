// Test script for email functionality
// Run with: node scripts/test-email.js

const { sendPaymentConfirmationEmail } = require('../lib/email-service.ts');

async function testEmailFunctionality() {
  console.log('📧 Testing Email Functionality\n');
  
  try {
    // Test data
    const testData = {
      userEmail: 'test@example.com',
      userName: 'Test User',
      amount: 100.50,
      token: 'CUSD',
      store: 'Test Store',
      product: 'Test Product',
      sessionId: 'test_session_123',
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    };
    
    console.log('1️⃣ Testing email service with sample data...');
    console.log('   User Email:', testData.userEmail);
    console.log('   User Name:', testData.userName);
    console.log('   Amount:', testData.amount, testData.token);
    console.log('   Store:', testData.store);
    console.log('   Product:', testData.product);
    console.log('   Session ID:', testData.sessionId);
    console.log('   Transaction Hash:', testData.txHash);
    
    console.log('\n2️⃣ Sending test email...');
    const result = await sendPaymentConfirmationEmail(testData);
    
    if (result.success) {
      console.log('✅ Email test successful!');
      console.log('   Message:', result.message);
    } else {
      console.log('❌ Email test failed!');
      console.log('   Error:', result.message);
    }
    
    console.log('\n✅ Email functionality test completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Make a test payment to see the email in action');
    console.log('   2. Check the console logs for email content');
    console.log('   3. For production, configure a real email service');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
}

// Run the test
testEmailFunctionality();
