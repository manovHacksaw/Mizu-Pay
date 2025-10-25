# 🌐 Setup Custom Domain for Resend - Send to Any Email

## 🎯 Goal: Send Emails to User's Actual Email Address

### **Current Issue:**
- **Resend Free Account**: Only allows sending to `manovmandal@gmail.com`
- **User Emails**: `anuskaswork@gmail.com` (blocked)
- **Solution**: Add your own domain to Resend

## 🚀 Step-by-Step Solution

### **Step 1: Add Domain to Resend**

1. **Go to Resend Dashboard**: [https://resend.com/domains](https://resend.com/domains)
2. **Click "Add Domain"**
3. **Enter Your Domain**: `mizu-pay.com` (or any domain you own)
4. **Click "Add Domain"**

### **Step 2: Verify Domain with DNS Records**

Resend will give you DNS records to add to your domain:

#### **Example DNS Records:**
```
Type: TXT
Name: resend._domainkey.mizu-pay.com
Value: [Resend will provide this]

Type: CNAME  
Name: resend.mizu-pay.com
Value: [Resend will provide this]
```

#### **How to Add DNS Records:**
1. **Go to your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Find DNS Management**
3. **Add the TXT and CNAME records** provided by Resend
4. **Wait 5-10 minutes** for DNS propagation

### **Step 3: Update Email Configuration**

Once domain is verified, update your email service:

```typescript
// lib/email-service.ts
const result = await resend.emails.send({
  from: 'Mizu Pay <noreply@mizu-pay.com>', // Your verified domain
  to: [data.userEmail], // Now can send to any email!
  subject: 'Payment Successful - Gift Card Processing',
  html: `...`
})
```

### **Step 4: Test Email to User**

```typescript
// This will now work!
await resend.emails.send({
  from: 'Mizu Pay <noreply@mizu-pay.com>',
  to: ['anuskaswork@gmail.com'], // ✅ Now allowed!
  subject: 'Payment Successful - Gift Card Processing',
  html: `...`
})
```

## 🎯 Alternative Solutions

### **Option 1: Use Subdomain (Easiest)**
- **Domain**: `mizu-pay.vercel.app` (if using Vercel)
- **Email**: `noreply@mizu-pay.vercel.app`
- **Setup**: Add to Resend domains

### **Option 2: Use Existing Domain**
- **If you have a domain**: Add it to Resend
- **If you don't**: Buy a domain ($10-15/year)
- **Popular**: Namecheap, GoDaddy, Cloudflare

### **Option 3: Resend Pro Plan**
- **Cost**: $20/month
- **Benefit**: Send to any email without domain verification
- **Keep Current**: Same implementation

## 🚀 Quick Setup Guide

### **If You Have a Domain:**
1. **Go to**: [resend.com/domains](https://resend.com/domains)
2. **Add Domain**: Your domain name
3. **Get DNS Records**: Copy the TXT and CNAME records
4. **Add to DNS**: In your domain registrar
5. **Wait**: 5-10 minutes for verification
6. **Update Code**: Change `from` address to your domain

### **If You Don't Have a Domain:**
1. **Buy Domain**: $10-15/year (Namecheap, GoDaddy)
2. **Follow Steps Above**: Add to Resend
3. **Update Code**: Use your new domain

## 📧 Updated Email Service

### **Before (Limited):**
```typescript
from: 'Mizu Pay <onboarding@resend.dev>',
to: ['manovmandal@gmail.com'], // Only account owner
```

### **After (Unlimited):**
```typescript
from: 'Mizu Pay <noreply@mizu-pay.com>', // Your verified domain
to: [data.userEmail], // Any email address!
```

## 🎉 Result

Once you add your domain to Resend:

- ✅ **Send to Any Email**: `anuskaswork@gmail.com`, `user@example.com`, etc.
- ✅ **Professional Domain**: `noreply@mizu-pay.com`
- ✅ **No Restrictions**: Send to any recipient
- ✅ **Same Code**: Just change the `from` address

## 🚀 Next Steps

1. **Add Domain**: Go to [resend.com/domains](https://resend.com/domains)
2. **Verify DNS**: Add the required DNS records
3. **Update Code**: Change `from` address to your domain
4. **Test**: Send email to `anuskaswork@gmail.com`

**Your email system will then send to the actual user's email address!** 🎉
