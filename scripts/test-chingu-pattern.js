// Test script using Chingu's exact pattern
// This should work to send emails to any address

const { Resend } = require('resend');
const React = require('react');

// Following Chingu's exact pattern
const resend = new Resend('re_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn');

// Simple email template following Chingu's pattern
const PaymentConfirmation = ({ userName, userEmail, amount, token, store, product, txHash }) => 
  React.createElement('div', {
    style: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9'
    }
  },
    React.createElement('div', {
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        textAlign: 'center',
        borderRadius: '10px 10px 0 0'
      }
    },
      React.createElement('h1', { style: { margin: 0 } }, '✅ Payment Successful!'),
      React.createElement('p', { style: { margin: '10px 0 0 0' } }, 'Your payment has been processed successfully')
    ),
    React.createElement('div', {
      style: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '0 0 10px 10px'
      }
    },
      React.createElement('h2', null, `Hello ${userName || 'Valued Customer'}!`),
      React.createElement('p', null, `Payment confirmation for: ${userEmail}`),
      React.createElement('p', null, 'Great news! Your payment has been successfully processed and confirmed on the blockchain.'),
      
      React.createElement('div', {
        style: {
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0',
          borderLeft: '4px solid #4CAF50'
        }
      },
        React.createElement('h3', null, 'Payment Details'),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' } },
          React.createElement('span', { style: { fontWeight: 'bold', color: '#666' } }, 'Amount:'),
          React.createElement('span', { style: { color: '#333' } }, `${amount} ${token}`)
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' } },
          React.createElement('span', { style: { fontWeight: 'bold', color: '#666' } }, 'Store:'),
          React.createElement('span', { style: { color: '#333' } }, store || 'N/A')
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' } },
          React.createElement('span', { style: { fontWeight: 'bold', color: '#666' } }, 'Product:'),
          React.createElement('span', { style: { color: '#333' } }, product || 'N/A')
        ),
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' } },
          React.createElement('span', { style: { fontWeight: 'bold', color: '#666' } }, 'Transaction Hash:'),
          React.createElement('span', { style: { color: '#333', fontFamily: 'monospace', fontSize: '12px' } }, txHash)
        )
      ),
      
      React.createElement('div', {
        style: {
          backgroundColor: '#e8f5e8',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0',
          borderLeft: '4px solid #4CAF50'
        }
      },
        React.createElement('h3', null, '🎁 Gift Card Processing'),
        React.createElement('p', null, React.createElement('strong', null, 'Your gift card will be sent to your email within 2-3 minutes after verification.')),
        React.createElement('p', null, 'We\'re currently verifying your payment and preparing your gift card. You\'ll receive it shortly!')
      ),
      
      React.createElement('div', {
        style: {
          backgroundColor: '#f0f8ff',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0',
          borderLeft: '4px solid #2196F3'
        }
      },
        React.createElement('h3', null, 'What\'s Next?'),
        React.createElement('p', null, '✅ Payment confirmed on blockchain'),
        React.createElement('p', null, '🔄 Gift card verification in progress'),
        React.createElement('p', null, '📧 Gift card delivery within 2-3 minutes')
      ),
      
      React.createElement('div', {
        style: {
          textAlign: 'center',
          marginTop: '30px',
          color: '#666',
          fontSize: '14px'
        }
      },
        React.createElement('p', null, 'Thank you for using Mizu Pay!'),
        React.createElement('p', null, 'If you have any questions, please contact our support team.'),
        React.createElement('p', { style: { fontSize: '12px', color: '#999' } }, 'This is an automated message. Please do not reply to this email.')
      )
    )
  );

// Following Chingu's exact sendEmail function
async function sendEmail({ to, subject, react }) {
  try {
    const data = await resend.emails.send({
      from: "Mizu Pay <onboarding@resend.dev>", // Following Chingu's pattern
      to,
      subject,
      react
    });

    console.log("Email sent successfully!", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Test function following Chingu's exact calling syntax
async function testChinguPattern() {
  console.log('🧪 Testing Chingu\'s exact pattern...');
  console.log('📧 Target: anuskaswork@gmail.com');
  console.log('🎯 Using Chingu\'s exact syntax and approach');
  
  try {
    // Following Chingu's exact calling syntax
    const result = await sendEmail({
      to: "anuskaswork@gmail.com", // Any email address
      subject: "Payment Successful - Gift Card Processing",
      react: PaymentConfirmation({
        userName: "Anuska",
        userEmail: "anuskaswork@gmail.com",
        amount: 17.08,
        token: "CUSD",
        store: "Flipkart.com",
        product: "Purchase",
        txHash: "0x94f8b57adc22d497bdd36c78abb365e3142ef85a906eb8b3a8fbabe17b462989"
      })
    });
    
    console.log('📊 Result:', result);
    
    if (result.success) {
      console.log('🎉 SUCCESS: Email sent using Chingu\'s exact pattern!');
      console.log('📧 Check Gmail inbox: anuskaswork@gmail.com');
    } else {
      console.log('❌ Email failed:', result.error);
      console.log('💡 This confirms the domain restriction issue');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run test
testChinguPattern();
