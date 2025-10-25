// Test script following Chingu's exact email pattern
// Simple and clean like Chingu's implementation

const { Resend } = require('resend')

// Following Chingu's exact pattern
const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail() {
  try {
    console.log('🧪 Testing Chingu-style email implementation...')
    
    const result = await resend.emails.send({
      from: 'noreply@mizu-pay.com',
      to: ['test@example.com'],
      subject: 'Test Email - Mizu Pay',
      html: '<h1>Test Email</h1><p>This is a test email following Chingu\'s pattern.</p>',
    })
    
    console.log('✅ Email sent successfully:', result)
    
  } catch (error) {
    console.error('❌ Email error:', error)
  }
}

// Run test
testEmail()
