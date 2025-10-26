// Email service using React templates - following the provided example
// This allows sending emails to any address

import { Resend } from "resend";
import * as React from "react";

// --- Step 1: Define Payment Confirmation Email Template ---
interface PaymentEmailTemplateProps {
  userName: string;
  userEmail: string;
  amount: number;
  token: string;
  store: string;
  product: string;
  txHash: string;
  sessionId: string;
}

export const PaymentEmailTemplate: React.FC<PaymentEmailTemplateProps> = ({
  userName,
  userEmail,
  amount,
  token,
  store,
  product,
  txHash,
  sessionId,
}): React.JSX.Element => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      color: 'white', 
      padding: '30px', 
      textAlign: 'center', 
      borderRadius: '10px 10px 0 0' 
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
      <h1 style={{ margin: 0 }}>Payment Successful!</h1>
      <p style={{ margin: '10px 0 0 0' }}>Your payment has been processed successfully</p>
    </div>
    
    <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '0 0 10px 10px' }}>
      <h2>Hello {userName || 'Valued Customer'},</h2>
      <p><strong>Payment confirmation for:</strong> {userEmail}</p>
      
      <p>Great news! Your payment has been successfully processed and confirmed on the blockchain.</p>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '20px 0', 
        borderLeft: '4px solid #4CAF50' 
      }}>
        <h3>Payment Details</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#666' }}>Amount:</span>
          <span style={{ color: '#333' }}>{amount} {token}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#666' }}>Store:</span>
          <span style={{ color: '#333' }}>{store || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#666' }}>Product:</span>
          <span style={{ color: '#333' }}>{product || 'N/A'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#666' }}>Transaction Hash:</span>
          <span style={{ color: '#333', fontFamily: 'monospace', fontSize: '12px' }}>{txHash}</span>
        </div>
      </div>
      
      <div style={{ 
        background: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '8px', 
        margin: '20px 0', 
        borderLeft: '4px solid #4CAF50' 
      }}>
        <h3>🎁 Gift Card Processing</h3>
        <p><strong>Your gift card will be sent to your email within 2-3 minutes after verification.</strong></p>
        <p>We're currently verifying your payment and preparing your gift card. You'll receive it shortly!</p>
      </div>
      
      <div style={{ 
        background: '#f0f8ff', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '20px 0', 
        borderLeft: '4px solid #2196F3' 
      }}>
        <h3>What's Next?</h3>
        <ul>
          <li>✅ Payment confirmed on blockchain</li>
          <li>🔄 Gift card verification in progress</li>
          <li>📧 Gift card delivery within 2-3 minutes</li>
        </ul>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '14px' }}>
        <p>Thank you for using Mizu Pay!</p>
        <p>If you have any questions, please contact our support team.</p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  </div>
);

// --- Step 2: The Email Sending Function ---
type SendEmailParams = {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
};

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY || 're_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn');
  
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

// --- Step 3: Payment Confirmation Email Function ---
interface PaymentEmailData {
  userEmail: string;
  userName: string;
  amount: number;
  token: string;
  store: string;
  product: string;
  sessionId: string;
  txHash: string;
}

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    console.log('📧 Sending payment confirmation email to:', data.userEmail);
    
    const result = await sendEmail({
      to: data.userEmail, // Now can send to any email address!
      subject: 'Payment Successful - Gift Card Processing',
      react: React.createElement(PaymentEmailTemplate, {
        userName: data.userName,
        userEmail: data.userEmail,
        amount: data.amount,
        token: data.token,
        store: data.store,
        product: data.product,
        txHash: data.txHash,
        sessionId: data.sessionId,
      }),
    });
    
    return result;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, message: `Email error: ${error.message}` };
  }
}
