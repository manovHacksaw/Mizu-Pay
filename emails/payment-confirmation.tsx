// Payment confirmation email template - Following Chingu's pattern
// This is the React component used as the email body

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';

interface PaymentConfirmationProps {
  userName: string;
  userEmail: string;
  amount: number;
  token: string;
  store: string;
  product: string;
  txHash: string;
  sessionId: string;
}

export default function PaymentConfirmation({
  userName,
  userEmail,
  amount,
  token,
  store,
  product,
  txHash,
  sessionId,
}: PaymentConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Payment Successful - Gift Card Processing</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>✅ Payment Successful!</Heading>
            <Text style={headerSubtitle}>Your payment has been processed successfully</Text>
          </Section>

          <Section style={content}>
            <Heading style={contentTitle}>Hello {userName || 'Valued Customer'},</Heading>
            <Text style={contentText}>
              <strong>Payment confirmation for:</strong> {userEmail}
            </Text>
            
            <Text style={contentText}>
              Great news! Your payment has been successfully processed and confirmed on the blockchain.
            </Text>

            <Section style={paymentDetails}>
              <Heading style={detailsTitle}>Payment Details</Heading>
              
              <Row style={detailRow}>
                <Column style={detailLabel}>Amount:</Column>
                <Column style={detailValue}>{amount} {token}</Column>
              </Row>
              
              <Row style={detailRow}>
                <Column style={detailLabel}>Store:</Column>
                <Column style={detailValue}>{store || 'N/A'}</Column>
              </Row>
              
              <Row style={detailRow}>
                <Column style={detailLabel}>Product:</Column>
                <Column style={detailValue}>{product || 'N/A'}</Column>
              </Row>
              
              <Row style={detailRow}>
                <Column style={detailLabel}>Transaction Hash:</Column>
                <Column style={detailValue}>{txHash}</Column>
              </Row>
            </Section>

            <Section style={giftCardSection}>
              <Heading style={giftCardTitle}>🎁 Gift Card Processing</Heading>
              <Text style={giftCardText}>
                <strong>Your gift card will be sent to your email within 2-3 minutes after verification.</strong>
              </Text>
              <Text style={giftCardText}>
                We're currently verifying your payment and preparing your gift card. You'll receive it shortly!
              </Text>
            </Section>

            <Section style={nextStepsSection}>
              <Heading style={nextStepsTitle}>What's Next?</Heading>
              <Text style={nextStepsText}>✅ Payment confirmed on blockchain</Text>
              <Text style={nextStepsText}>🔄 Gift card verification in progress</Text>
              <Text style={nextStepsText}>📧 Gift card delivery within 2-3 minutes</Text>
            </Section>

            <Section style={footer}>
              <Text style={footerText}>Thank you for using Mizu Pay!</Text>
              <Text style={footerText}>If you have any questions, please contact our support team.</Text>
              <Text style={footerSmall}>
                This is an automated message. Please do not reply to this email.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '30px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
};

const headerSubtitle = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '10px 0 0 0',
};

const content = {
  padding: '30px',
  backgroundColor: '#f9f9f9',
  borderRadius: '0 0 10px 10px',
};

const contentTitle = {
  color: '#333333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
};

const contentText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const paymentDetails = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #4CAF50',
};

const detailsTitle = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const detailRow = {
  margin: '10px 0',
  padding: '8px 0',
  borderBottom: '1px solid #eee',
};

const detailLabel = {
  fontWeight: 'bold',
  color: '#666666',
  fontSize: '14px',
};

const detailValue = {
  color: '#333333',
  fontSize: '14px',
  fontFamily: 'monospace',
};

const giftCardSection = {
  backgroundColor: '#e8f5e8',
  padding: '15px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #4CAF50',
};

const giftCardTitle = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const giftCardText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
};

const nextStepsSection = {
  backgroundColor: '#f0f8ff',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  borderLeft: '4px solid #2196F3',
};

const nextStepsTitle = {
  color: '#333333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const nextStepsText = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '30px',
  color: '#666666',
  fontSize: '14px',
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const footerSmall = {
  color: '#999999',
  fontSize: '12px',
  margin: '0',
};
