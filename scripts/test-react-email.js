// Test script using React email templates
// This should work to send emails to any address

const { Resend } = require('resend');
const React = require('react');

// Simple email template
const MyEmailTemplate = ({ firstName, body }) => React.createElement('div', null,
  React.createElement('h1', null, `Hi, ${firstName}!`),
  React.createElement('p', null, body)
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

    console.log("Email sent successfully!", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Test function
async function testReactEmail() {
  console.log('🧪 Testing React email template...');
  console.log('📧 Sending to: anuskaswork@gmail.com');
  
  try {
    const result = await sendEmail({
      to: "anuskaswork@gmail.com", // User's actual email
      subject: "Test Email - Mizu Pay (React Template)",
      react: React.createElement(MyEmailTemplate, {
        firstName: "Anuska",
        body: "This is a test email using React templates. Your payment confirmation system is working!",
      }),
    });
    
    console.log('✅ Result:', result);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run test
testReactEmail();
