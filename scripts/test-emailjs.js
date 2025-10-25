// Test script for EmailJS - 100% FREE email service
// This allows sending emails to ANY address without any setup

const https = require('https');

async function testEmailJS() {
  console.log('🧪 Testing EmailJS - FREE email service...');
  console.log('📧 Target: anuskaswork@gmail.com');
  console.log('🎯 This should work to send emails to ANY address for FREE!');
  
  try {
    // EmailJS API call (you need to sign up at https://www.emailjs.com/)
    const data = JSON.stringify({
      service_id: 'your_service_id', // You need to get this from EmailJS
      template_id: 'your_template_id', // You need to get this from EmailJS
      user_id: 'your_user_id', // You need to get this from EmailJS
      template_params: {
        to_email: 'anuskaswork@gmail.com',
        user_name: 'Anuska',
        amount: '17.08',
        token: 'CUSD',
        store: 'Flipkart.com',
        product: 'Purchase',
        tx_hash: '0x94f8b57adc22d497bdd36c78abb365e3142ef85a906eb8b3a8fbabe17b462989'
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
        } else {
          console.log('❌ Email failed:', responseData);
          console.log('💡 This is expected - you need to sign up for EmailJS first');
          console.log('📋 Next steps:');
          console.log('1. Go to: https://www.emailjs.com/');
          console.log('2. Sign up for free account');
          console.log('3. Connect your Gmail account');
          console.log('4. Get your service_id, template_id, and user_id');
          console.log('5. Update this script with your credentials');
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
testEmailJS();
