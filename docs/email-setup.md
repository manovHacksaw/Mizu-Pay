# Email Setup Guide for Mizu Pay

## Overview
The payment system now automatically sends confirmation emails when payments are successful. This guide explains how to set up and configure email functionality.

## Current Implementation

### ✅ What's Working
- **Email Service**: Basic email service with HTML templates
- **Payment Integration**: Emails are sent automatically after successful payments
- **Email Templates**: Professional HTML email templates with payment details
- **Development Mode**: Emails are logged to console for testing

### 📧 Email Content
The confirmation email includes:
- ✅ Payment success confirmation
- 💰 Payment details (amount, token, store, product)
- 🔗 Transaction hash and session ID
- 🎁 Gift card processing information
- ⏰ 2-3 minute delivery timeline
- 📱 Professional HTML design

## Setup Instructions

### 1. Development Mode (Current)
Currently configured for development with console logging:

```typescript
// lib/email-config.ts
export const emailConfig: EmailConfig = {
  provider: 'console', // Logs to console
  fromEmail: 'noreply@mizu-pay.com',
  fromName: 'Mizu Pay',
}
```

### 2. Production Email Services

#### Option A: Resend (Recommended)
```bash
# Install Resend
npm install resend

# Set environment variables
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Mizu Pay
```

#### Option B: SendGrid
```bash
# Install SendGrid
npm install @sendgrid/mail

# Set environment variables
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Mizu Pay
```

#### Option C: Nodemailer (SMTP)
```bash
# Install Nodemailer
npm install nodemailer

# Set environment variables
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Mizu Pay
```

## Email Flow

### 1. Payment Success
When a payment is successful:
1. ✅ Transaction confirmed on blockchain
2. 💾 Payment saved to database
3. 📧 Confirmation email sent automatically
4. 🎁 Gift card processing message included

### 2. Email Content
The email includes:
- **Header**: Success confirmation with checkmark
- **Payment Details**: Amount, token, store, product
- **Transaction Info**: Hash and session ID
- **Gift Card Info**: 2-3 minute delivery timeline
- **Next Steps**: What happens next
- **Footer**: Contact information

### 3. User Experience
- **Immediate**: Email sent right after payment success
- **Professional**: HTML template with branding
- **Informative**: All payment details included
- **Reassuring**: Clear timeline for gift card delivery

## Testing

### 1. Development Testing
```bash
# Test email functionality
node scripts/test-email.js
```

### 2. Live Testing
1. Make a test payment
2. Check console logs for email content
3. Verify email details are correct

### 3. Production Testing
1. Configure real email service
2. Test with real email addresses
3. Verify delivery and formatting

## Configuration Files

### `lib/email-service.ts`
- Main email service logic
- Handles different email providers
- Manages email templates

### `lib/email-config.ts`
- Email configuration
- Provider settings
- Template definitions

### `app/api/send-email/route.ts`
- API endpoint for sending emails
- Handles email requests
- Returns success/error status

## Email Template

The email template includes:
- **Responsive Design**: Works on all devices
- **Professional Styling**: Clean, modern look
- **Payment Details**: All transaction information
- **Gift Card Info**: Clear delivery timeline
- **Branding**: Mizu Pay branding and colors

## Troubleshooting

### Common Issues
1. **Email not sending**: Check console logs for errors
2. **Template issues**: Verify HTML template syntax
3. **Provider issues**: Check API keys and configuration
4. **Delivery issues**: Check spam folders

### Debug Steps
1. Check console logs for email content
2. Verify email service configuration
3. Test with different email addresses
4. Check provider-specific logs

## Production Checklist

- [ ] Configure real email service (Resend/SendGrid/Nodemailer)
- [ ] Set up domain authentication
- [ ] Test email delivery
- [ ] Verify HTML rendering
- [ ] Check spam folder placement
- [ ] Monitor email delivery rates
- [ ] Set up email analytics

## Support

For email-related issues:
1. Check console logs for error messages
2. Verify email service configuration
3. Test with different providers
4. Contact support if needed

## Next Steps

1. **Choose Email Provider**: Select Resend, SendGrid, or Nodemailer
2. **Configure API Keys**: Set up authentication
3. **Test Delivery**: Verify emails are sent and received
4. **Monitor Performance**: Track delivery rates and user feedback
