import * as React from 'react';

interface PaymentConfirmationProps {
  userName: string;
  amount: number;
  token: string;
  store: string;
  product: string;
  txHash: string;
  sessionId: string;
}

export function PaymentConfirmationEmail({
  userName,
  amount,
  token,
  store,
  product,
  txHash,
  sessionId
}: PaymentConfirmationProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', 
          padding: '30px', 
          textAlign: 'center', 
          borderRadius: '10px 10px 0 0' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ margin: '0', fontSize: '24px' }}>Payment Successful!</h1>
          <p style={{ margin: '10px 0 0 0', opacity: '0.9' }}>Your payment has been processed successfully</p>
        </div>
        
        {/* Content */}
        <div style={{ 
          background: '#f9f9f9', 
          padding: '30px', 
          borderRadius: '0 0 10px 10px' 
        }}>
          <h2 style={{ color: '#333', marginTop: '0' }}>Hello {userName},</h2>
          
          <p>Great news! Your payment has been successfully processed and confirmed on the blockchain.</p>
          
          {/* Payment Details */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            margin: '20px 0', 
            borderLeft: '4px solid #4CAF50' 
          }}>
            <h3 style={{ marginTop: '0', color: '#333' }}>Payment Details</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: 'bold', color: '#666' }}>Amount:</span>
              <span style={{ color: '#333' }}>{amount} {token}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: 'bold', color: '#666' }}>Store:</span>
              <span style={{ color: '#333' }}>{store}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: 'bold', color: '#666' }}>Product:</span>
              <span style={{ color: '#333' }}>{product}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: 'bold', color: '#666' }}>Transaction Hash:</span>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#333' }}>{txHash}</span>
            </div>
          </div>
          
          {/* Gift Card Processing */}
          <div style={{ 
            background: '#e8f5e8', 
            padding: '15px', 
            borderRadius: '8px', 
            margin: '20px 0', 
            borderLeft: '4px solid #4CAF50' 
          }}>
            <h3 style={{ marginTop: '0', color: '#333' }}>🎁 Gift Card Processing</h3>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
              Your gift card will be sent to your email within 2-3 minutes after verification.
            </p>
            <p style={{ margin: '0' }}>
              We're currently verifying your payment and preparing your gift card. You'll receive it shortly!
            </p>
          </div>
          
          {/* Next Steps */}
          <div style={{ 
            background: '#f0f8ff', 
            padding: '20px', 
            borderRadius: '8px', 
            margin: '20px 0', 
            borderLeft: '4px solid #2196F3' 
          }}>
            <h3 style={{ marginTop: '0', color: '#333' }}>What's Next?</h3>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>✅ Payment confirmed on blockchain</li>
              <li>🔄 Gift card verification in progress</li>
              <li>📧 Gift card delivery within 2-3 minutes</li>
            </ul>
          </div>
          
          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '14px' }}>
            <p style={{ margin: '0' }}>Thank you for using Mizu Pay!</p>
            <p style={{ margin: '5px 0' }}>If you have any questions, please contact our support team.</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
