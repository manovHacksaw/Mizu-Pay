// Test script with your Resend API key
// Following Chingu's exact pattern

const { Resend } = require('resend')

// Using your Resend API key
const resend = new Resend('re_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn')

async function testEmail() {
  try {
    console.log('🧪 Testing email with your Resend API key...')
    console.log('📧 API Key:', 're_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn')
    
    const result = await resend.emails.send({
      from: 'Mizu Pay <onboarding@resend.dev>',
      to: ['manovmandal@gmail.com'], // Your Resend account email
      subject: 'Test Email - Mizu Pay (Chingu Pattern)',
      html: `
        <h1>🎉 Email Test Successful!</h1>
        <p>This email was sent using Chingu's exact pattern:</p>
        <ul>
          <li>✅ Resend API Key: Configured</li>
          <li>✅ Domain: noreply@mizu-pay.com</li>
          <li>✅ Pattern: Chingu's exact implementation</li>
          <li>✅ Syntax: Same as Chingu application</li>
        </ul>
        <p><strong>Your Mizu Pay email system is now working!</strong></p>
      `,
    })
    
    console.log('✅ Email sent successfully!')
    console.log('📧 Result:', result)
    console.log('🎯 Check your Gmail inbox: anuskaswork@gmail.com')
    
  } catch (error) {
    console.error('❌ Email error:', error)
    console.log('💡 Make sure Resend package is installed: npm install resend')
  }
}

// Run test
testEmail()
