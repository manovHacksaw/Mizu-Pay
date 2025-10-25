// Working EmailJS solution - 100% FREE and easy setup
// This will send emails to anuskaswork@gmail.com without any domain verification

const https = require('https');

async function testEmailJSWorking() {
  console.log('🧪 Testing EmailJS - 100% FREE email service...');
  console.log('📧 Target: anuskaswork@gmail.com');
  console.log('🎯 This is the easiest FREE solution!');
  
  try {
    // EmailJS API call - you need to sign up at https://www.emailjs.com/
    // It's 100% free and takes 2 minutes to set up
    const data = JSON.stringify({
      service_id: 'service_123456', // Replace with your EmailJS service ID
      template_id: 'template_123456', // Replace with your EmailJS template ID
      user_id: 'user_123456', // Replace with your EmailJS user ID
      template_params: {
        to_email: 'anuskaswork@gmail.com',
        user_name: 'Anuska',
        amount: '17.08',
        token: 'CUSD',
        store: 'Flipkart.com',
        product: 'Purchase',
        tx_hash: '0x94f8b57adc22d497bdd36c78abb365e3142ef85a906eb8b3a8fbabe17b462989',
        message: 'Payment Successful - Gift Card Processing'
      }
    });

    const options = {
      hostname: 'api.emailjs.com',
      port: 443,
      path: '/api/v1.0/email/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📊 Response:', responseData);
        
        if (res.statusCode === 200) {
          console.log('🎉 SUCCESS: Email sent using EmailJS!');
          console.log('📧 Check Gmail inbox: anuskaswork@gmail.com');
          console.log('🚀 EmailJS is working perfectly!');
        } else {
          console.log('❌ Email failed:', responseData);
          console.log('💡 This is expected - you need to sign up for EmailJS first');
          console.log('📋 Quick setup steps:');
          console.log('1. Go to: https://www.emailjs.com/');
          console.log('2. Sign up for free account (takes 1 minute)');
          console.log('3. Connect your Gmail account');
          console.log('4. Create a new service and template');
          console.log('5. Get your service_id, template_id, and user_id');
          console.log('6. Update this script with your credentials');
          console.log('7. Run the test again');
          console.log('');
          console.log('🎯 EmailJS Benefits:');
          console.log('✅ 100% FREE (200 emails/month)');
          console.log('✅ No domain verification required');
          console.log('✅ Send to any email address');
          console.log('✅ Easy setup (2 minutes)');
          console.log('✅ Professional email templates');
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
    });

    req.write(data);
    req.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run test
testEmailJSWorking();
