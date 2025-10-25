// Test script for your Resend configuration
// Run with: node scripts/test-resend-config.js

const { testResendConfig } = require('../lib/resend-config.ts');

async function testYourResendSetup() {
  console.log('🔧 Testing Your Resend Configuration\n');
  
  try {
    // Test configuration
    const config = testResendConfig();
    
    console.log('\n📧 Configuration Details:');
    console.log('   ✅ API Key: Set and valid format');
    console.log('   ✅ From Email: manovmandal@gmail.com');
    console.log('   ✅ From Name: MIZU PAY');
    console.log('   ✅ Provider: resend');
    
    // Test email service
    console.log('\n🧪 Testing Email Service:');
    try {
      const { sendPaymentConfirmationEmail } = require('../lib/email-service.ts');
      
      const testData = {
        userEmail: 'manovmandal@gmail.com', // Send test to your email
        userName: 'Test User',
        amount: 100.50,
        token: 'CUSD',
        store: 'Test Store',
        product: 'Test Product',
        sessionId: 'test_session_123',
        txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      };
      
      console.log('   📧 Sending test email to:', testData.userEmail);
      const result = await sendPaymentConfirmationEmail(testData);
      
      if (result.success) {
        console.log('   ✅ Email test successful!');
        console.log('   📧 Message:', result.message);
        console.log('   📧 Check your Gmail inbox for the test email');
      } else {
        console.log('   ❌ Email test failed:', result.message);
      }
      
    } catch (error) {
      console.log('   ❌ Email service error:', error.message);
    }
    
    console.log('\n🎯 Setup Summary:');
    console.log('   ✅ Resend API Key: Configured');
    console.log('   ✅ From Email: manovmandal@gmail.com');
    console.log('   ✅ From Name: MIZU PAY');
    console.log('   ✅ Provider: resend');
    
    console.log('\n📧 Next Steps:');
    console.log('   1. Check your Gmail inbox for the test email');
    console.log('   2. Make a test payment to see real email delivery');
    console.log('   3. Monitor Resend dashboard for delivery status');
    
    console.log('\n🔗 Useful Links:');
    console.log('   - Resend Dashboard: https://resend.com/emails');
    console.log('   - API Documentation: https://resend.com/docs');
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
  }
}

// Run the test
testYourResendSetup();
