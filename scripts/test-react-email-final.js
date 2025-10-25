// Test script using React email templates
// This should now work to send emails to any address

const { Resend } = require('resend');
const React = require('react');

// Simple email template using React
const TestEmailTemplate = ({ firstName, message }) => React.createElement('div', {
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
    React.createElement('h1', { style: { margin: 0 } }, '🎉 Test Email Successful!'),
    React.createElement('p', { style: { margin: '10px 0 0 0' } }, 'React email template working')
  ),
  React.createElement('div', {
    style: {
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '0 0 10px 10px'
    }
  },
    React.createElement('h2', null, `Hello ${firstName}!`),
    React.createElement('p', null, message),
    React.createElement('p', null, 'This email was sent using React email templates and can be sent to any address!'),
    React.createElement('div', {
      style: {
        backgroundColor: '#e8f5e8',
        padding: '15px',
        borderRadius: '8px',
        margin: '20px 0',
        borderLeft: '4px solid #4CAF50'
      }
    },
      React.createElement('h3', null, '✅ Email System Status'),
      React.createElement('p', null, 'Your Mizu Pay email system is now working with React templates!'),
      React.createElement('p', null, 'You can now send emails to any user\'s email address.')
    )
  )
);

// Email sending function
async function sendEmail({ to, subject, react }) {
  const resend = new Resend('re_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn');
  
  try {
    const data = await resend.emails.send({
      from: "Mizu Pay <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    console.log("✅ Email sent successfully!", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error };
  }
}

// Test function
async function testReactEmail() {
  console.log('🧪 Testing React email template to user\'s email...');
  console.log('📧 Sending to: anuskaswork@gmail.com');
  console.log('🎯 This should now work with React email components!');
  
  try {
    const result = await sendEmail({
      to: "anuskaswork@gmail.com", // User's actual email
      subject: "Test Email - Mizu Pay (React Template Working!)",
      react: React.createElement(TestEmailTemplate, {
        firstName: "Anuska",
        message: "Your payment confirmation system is now working with React email templates! This means you can send emails to any user's email address.",
      }),
    });
    
    console.log('📊 Result:', result);
    
    if (result.success) {
      console.log('🎉 SUCCESS: Email sent to user\'s actual email address!');
      console.log('📧 Check Gmail inbox: anuskaswork@gmail.com');
    } else {
      console.log('❌ Email failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run test
testReactEmail();
