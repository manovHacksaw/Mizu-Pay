// Resend setup helper script
// Run with: node scripts/setup-resend.js

const fs = require('fs');
const path = require('path');

function checkResendSetup() {
  console.log('🔧 Checking Resend Setup\n');
  
  // Check if Resend is installed
  try {
    require('resend');
    console.log('✅ Resend package is installed');
  } catch (error) {
    console.log('❌ Resend package not found');
    console.log('   Run: npm install resend');
    return false;
  }
  
  // Check environment variables
  console.log('\n📧 Checking Environment Variables:');
  
  const requiredVars = [
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'EMAIL_FROM_NAME'
  ];
  
  let allSet = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${varName === 'RESEND_API_KEY' ? 'Set (hidden)' : value}`);
    } else {
      console.log(`   ❌ ${varName}: Not set`);
      allSet = false;
    }
  });
  
  if (!allSet) {
    console.log('\n⚠️  Missing environment variables!');
    console.log('   Add these to your .env.local file:');
    console.log('   RESEND_API_KEY=re_your_api_key_here');
    console.log('   EMAIL_FROM=noreply@yourdomain.com');
    console.log('   EMAIL_FROM_NAME=Mizu Pay');
  }
  
  // Check .env.local file
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('\n📄 .env.local file exists');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('RESEND_API_KEY')) {
      console.log('   ✅ RESEND_API_KEY found in .env.local');
    } else {
      console.log('   ❌ RESEND_API_KEY not found in .env.local');
    }
  } else {
    console.log('\n📄 .env.local file not found');
    console.log('   Create .env.local with your Resend configuration');
  }
  
  // Test email service
  console.log('\n🧪 Testing Email Service:');
  try {
    const { sendPaymentConfirmationEmail } = require('../lib/email-service.ts');
    console.log('   ✅ Email service loaded successfully');
    
    // Test with sample data
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
    
    console.log('   📧 Testing email sending...');
    sendPaymentConfirmationEmail(testData).then(result => {
      if (result.success) {
        console.log('   ✅ Email test successful:', result.message);
      } else {
        console.log('   ❌ Email test failed:', result.message);
      }
    });
    
  } catch (error) {
    console.log('   ❌ Email service error:', error.message);
  }
  
  console.log('\n🎯 Setup Summary:');
  console.log('   1. Install Resend: npm install resend');
  console.log('   2. Get API key from: https://resend.com');
  console.log('   3. Set environment variables in .env.local');
  console.log('   4. Test with: node scripts/test-email.js');
  console.log('   5. Make a test payment to verify email delivery');
  
  return allSet;
}

// Run the setup check
checkResendSetup();
