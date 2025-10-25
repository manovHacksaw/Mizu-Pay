// Test script to send emails to any address
// Testing different approaches to overcome Resend restrictions

const { Resend } = require('resend');

// Using your Resend API key
const resend = new Resend('re_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn');

async function testEmailToAnyAddress() {
  console.log('🧪 Testing email to any address...');
  console.log('📧 Target: anuskaswork@gmail.com');
  console.log('🎯 Goal: Send to user\'s actual email address');
  
  try {
    // Test 1: Try with onboarding@resend.dev (current setup)
    console.log('\n📧 Test 1: Using onboarding@resend.dev');
    const result1 = await resend.emails.send({
      from: 'Mizu Pay <onboarding@resend.dev>',
      to: ['anuskaswork@gmail.com'],
      subject: 'Test Email - Mizu Pay (Any Address)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 Test Email Successful!</h1>
            <p style="margin: 10px 0 0 0;">This email was sent to your actual address</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello Anuska!</h2>
            <p>This is a test email to verify that Mizu Pay can send emails to any address.</p>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3>✅ Email System Status</h3>
              <p><strong>From:</strong> Mizu Pay <onboarding@resend.dev></p>
              <p><strong>To:</strong> anuskaswork@gmail.com</p>
              <p><strong>Status:</strong> Email sent successfully!</p>
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3>🚀 Next Steps</h3>
              <p>If you received this email, your system is working!</p>
              <p>You can now send payment confirmations to any user's email address.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>Thank you for testing Mizu Pay!</p>
              <p style="font-size: 12px; color: #999;">
                This is a test email. Please do not reply.
              </p>
            </div>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Test 1 Result:', result1);
    
    if (result1.data && !result1.error) {
      console.log('🎉 SUCCESS: Email sent to user\'s actual email address!');
      console.log('📧 Check Gmail inbox: anuskaswork@gmail.com');
      return;
    }
    
  } catch (error) {
    console.log('❌ Test 1 Failed:', error.message);
  }
  
  try {
    // Test 2: Try with different from address
    console.log('\n📧 Test 2: Using different from address');
    const result2 = await resend.emails.send({
      from: 'Mizu Pay <noreply@mizu-pay.com>',
      to: ['anuskaswork@gmail.com'],
      subject: 'Test Email - Mizu Pay (Custom Domain)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 Custom Domain Test!</h1>
            <p style="margin: 10px 0 0 0;">Testing with custom domain</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello Anuska!</h2>
            <p>This email is testing with a custom domain approach.</p>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3>⚠️ Domain Not Verified</h3>
              <p>This will likely fail because mizu-pay.com is not verified with Resend.</p>
              <p>To fix this, you need to add your domain to Resend and verify it.</p>
            </div>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Test 2 Result:', result2);
    
  } catch (error) {
    console.log('❌ Test 2 Failed:', error.message);
  }
  
  try {
    // Test 3: Try with account owner email (should work)
    console.log('\n📧 Test 3: Using account owner email (should work)');
    const result3 = await resend.emails.send({
      from: 'Mizu Pay <onboarding@resend.dev>',
      to: ['manovmandal@gmail.com'],
      subject: 'Test Email - Mizu Pay (Account Owner)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎉 Account Owner Test!</h1>
            <p style="margin: 10px 0 0 0;">This should work because it\'s the account owner</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello Account Owner!</h2>
            <p>This email is sent to the Resend account owner email.</p>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3>✅ This Should Work</h3>
              <p>Resend allows sending to the account owner email address.</p>
              <p>To send to other emails, you need to verify a domain.</p>
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3>🚀 To Send to Any Email:</h3>
              <p>1. Go to <a href="https://resend.com/domains">resend.com/domains</a></p>
              <p>2. Add your domain (e.g., mizu-pay.com)</p>
              <p>3. Add DNS records to your domain registrar</p>
              <p>4. Wait for verification</p>
              <p>5. Update your email service to use your domain</p>
            </div>
          </div>
        </div>
      `,
    });
    
    console.log('✅ Test 3 Result:', result3);
    
    if (result3.data && !result3.error) {
      console.log('🎉 SUCCESS: Email sent to account owner!');
      console.log('📧 Check Gmail inbox: manovmandal@gmail.com');
    }
    
  } catch (error) {
    console.log('❌ Test 3 Failed:', error.message);
  }
  
  console.log('\n📋 Summary:');
  console.log('• Test 1: Send to user email (anuskaswork@gmail.com) - Likely blocked');
  console.log('• Test 2: Send with custom domain - Likely blocked (domain not verified)');
  console.log('• Test 3: Send to account owner - Should work');
  console.log('\n💡 Solution: Add your domain to Resend and verify it to send to any email!');
}

// Run the test
testEmailToAnyAddress();
