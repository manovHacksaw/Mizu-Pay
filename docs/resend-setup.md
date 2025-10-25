# Resend Email Setup Guide

## Overview
This guide explains how to set up Resend for sending payment confirmation emails to users' Gmail accounts.

## Step 1: Install Resend

```bash
# Install Resend package
npm install resend

# Or if you have permission issues, try:
npx install resend
```

## Step 2: Get Resend API Key

1. **Sign up for Resend**: Visit [https://resend.com](https://resend.com)
2. **Create Account**: Sign up with your email
3. **Get API Key**: 
   - Go to API Keys section
   - Create a new API key
   - Copy the key (starts with `re_`)

## Step 3: Configure Environment Variables

Create or update your `.env.local` file:

```env
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Mizu Pay

# Optional: Use your own domain
EMAIL_FROM=noreply@mizu-pay.com
```

## Step 4: Domain Setup (Optional but Recommended)

### For Production:
1. **Add Domain**: In Resend dashboard, add your domain
2. **Verify Domain**: Follow DNS verification steps
3. **Update From Email**: Use your verified domain

### For Testing:
- Use Resend's default domain: `onboarding@resend.dev`
- Or use your verified domain

## Step 5: Test Email Functionality

### Development Testing:
```bash
# Test email service
node scripts/test-email.js
```

### Live Testing:
1. Make a test payment
2. Check console logs for email status
3. Verify email delivery in Gmail

## Step 6: Production Configuration

### Update Email Config:
```typescript
// lib/email-config.ts
export const emailConfig: EmailConfig = {
  provider: 'resend',
  fromEmail: 'noreply@yourdomain.com', // Your verified domain
  fromName: 'Mizu Pay',
  apiKey: process.env.RESEND_API_KEY
}
```

### Environment Variables:
```env
RESEND_API_KEY=re_your_actual_api_key
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Mizu Pay
```

## Email Features

### ✅ What's Included:
- **Professional HTML Design**: Responsive email template
- **Payment Details**: Amount, token, store, product
- **Transaction Info**: Hash and session ID
- **Gift Card Timeline**: 2-3 minute delivery message
- **Gmail Compatible**: Optimized for Gmail rendering

### 📧 Email Content:
- **Subject**: "Payment Successful - Gift Card Processing"
- **From**: "Mizu Pay <noreply@yourdomain.com>"
- **HTML**: Professional template with payment details
- **Timeline**: Clear 2-3 minute gift card delivery message

## Troubleshooting

### Common Issues:

#### 1. "Resend not installed"
```bash
# Solution: Install Resend
npm install resend
```

#### 2. "Invalid API key"
```bash
# Solution: Check your API key
echo $RESEND_API_KEY
# Should start with 're_'
```

#### 3. "Domain not verified"
- Use `onboarding@resend.dev` for testing
- Or verify your domain in Resend dashboard

#### 4. "Email not delivered"
- Check spam folder
- Verify API key is correct
- Check Resend dashboard for delivery status

### Debug Steps:
1. **Check Console Logs**: Look for email status messages
2. **Verify API Key**: Ensure it's set correctly
3. **Test with Resend Dashboard**: Send test email from dashboard
4. **Check Domain**: Ensure domain is verified

## Resend Dashboard

### Monitor Email Delivery:
1. **Logs**: Check email delivery logs
2. **Analytics**: View delivery rates
3. **Errors**: See any delivery failures
4. **Domains**: Manage verified domains

### Email Limits:
- **Free Tier**: 3,000 emails/month
- **Paid Plans**: Higher limits available
- **Rate Limits**: 100 emails/minute

## Production Checklist

- [ ] Install Resend package
- [ ] Get API key from Resend
- [ ] Set environment variables
- [ ] Test email functionality
- [ ] Verify domain (optional)
- [ ] Monitor delivery rates
- [ ] Set up error handling

## Support

### Resend Support:
- **Documentation**: [https://resend.com/docs](https://resend.com/docs)
- **Support**: [https://resend.com/support](https://resend.com/support)
- **Status**: [https://status.resend.com](https://status.resend.com)

### Common Commands:
```bash
# Check if Resend is installed
npm list resend

# Test email service
node scripts/test-email.js

# Check environment variables
echo $RESEND_API_KEY
```

## Next Steps

1. **Install Resend**: `npm install resend`
2. **Get API Key**: Sign up at [resend.com](https://resend.com)
3. **Set Environment**: Add `RESEND_API_KEY` to `.env.local`
4. **Test Emails**: Make a test payment
5. **Monitor Delivery**: Check Resend dashboard

Your payment confirmation emails will now be sent directly to users' Gmail accounts via Resend!
