// Final test for the working email service
// This will send emails to any user's email address

const { sendPaymentConfirmationEmail } = require('../lib/email-service');

async function testFinalEmail() {
  console.log('🧪 Testing final email service...');
  console.log('📧 Target: manovmandal@gmail.com');
  console.log('🎯 This should work to send emails to ANY address!');
  
  try {
    const result = await sendPaymentConfirmationEmail({
      userEmail: 'manovmandal@gmail.com',
      userName: 'Manov',
      amount: 17.08,
      token: 'CUSD',
      store: 'Flipkart.com',
      product: 'Purchase',
      sessionId: 'session_test_123',
      txHash: '0x94f8b57adc22d497bdd36c78abb365e3142ef85a906eb8b3a8fbabe17b462989'
    });
    
    console.log('📊 Result:', result);
    
    if (result.success) {
      console.log('🎉 SUCCESS: Email sent successfully!');
      console.log('📧 Check Gmail inbox: manovmandal@gmail.com');
      console.log('🚀 Your Mizu Pay email system is now working!');
      console.log('');
      console.log('✅ Features:');
      console.log('• Send emails to ANY email address');
      console.log('• Professional email templates');
      console.log('• 100% FREE solution');
      console.log('• No domain verification required');
      console.log('• Gmail\'s reliable infrastructure');
    } else {
      console.log('❌ Email failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run test
testFinalEmail();
