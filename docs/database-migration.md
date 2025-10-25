# Database Migration Guide

## 🚨 Issue: Missing txHash Field

The payment API is failing because the `txHash` field is missing from the Payment model in the database schema.

## ✅ Solution: Add txHash Field

### 1. Schema Updated
The `prisma/schema.prisma` file has been updated to include the `txHash` field:

```prisma
model Payment {
  id           String            @id @default(uuid())
  sessionId    String            @unique
  amount       Float
  token        String
  status       String            @default("PENDING")
  store        String?
  brand        String?
  giftCardCode String?
  txHash       String?          // ← NEW FIELD ADDED
  userId       String?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  user         User?             @relation(fields: [userId], references: [id])
  refi         RefiContribution?
}
```

### 2. Database Migration Required

You need to run the following commands to update your database:

```bash
# Push schema changes to database
npx prisma db push

# Generate new Prisma client
npx prisma generate
```

### 3. Restart Development Server

After running the migration commands, restart your development server:

```bash
npm run dev
```

## 🔧 What This Fixes

### ✅ Payment API
- **Before**: `Unknown argument 'txHash'` error
- **After**: Payment records will save with transaction hash

### ✅ Email Integration
- **Before**: Email sent but payment not saved
- **After**: Both email and payment record saved successfully

### ✅ Transaction Tracking
- **Before**: No blockchain transaction tracking
- **After**: Full transaction hash stored in database

## 📋 Migration Steps

### Step 1: Run Migration Commands
```bash
# In your project directory
npx prisma db push
npx prisma generate
```

### Step 2: Verify Migration
```bash
# Check if migration was successful
node scripts/migrate-database.js
```

### Step 3: Test Payment Flow
1. Start development server: `npm run dev`
2. Go to: `http://localhost:3000/payment`
3. Make a test payment
4. Verify payment is saved to database
5. Check email confirmation

## 🎯 Expected Results

After migration, the payment flow will work correctly:

1. **Payment Success** → Transaction confirmed on blockchain
2. **Database Save** → Payment record saved with txHash
3. **Email Sent** → Confirmation email sent via Resend
4. **User Notification** → "Payment successful! Confirmation email sent."

## 🚨 If Migration Fails

### Common Issues:
1. **Permission Error**: Run terminal as administrator
2. **Database Connection**: Check DATABASE_URL in .env
3. **Prisma Not Found**: Run `npm install prisma @prisma/client`

### Troubleshooting:
```bash
# Check Prisma installation
npm list prisma

# Check database connection
npx prisma db pull

# Reset database (if needed)
npx prisma db push --force-reset
```

## 📊 Database Schema

### Payment Model Fields:
- `id`: Unique identifier
- `sessionId`: Payment session ID
- `amount`: Payment amount
- `token`: Payment token (CELO/CUSD)
- `status`: Payment status (PENDING/COMPLETED)
- `store`: Store name
- `brand`: Product brand
- `giftCardCode`: Gift card code
- `txHash`: **Blockchain transaction hash** ← NEW
- `userId`: User ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## 🎉 After Migration

Your payment system will be fully functional:
- ✅ **Blockchain Integration**: Transaction hashes stored
- ✅ **Email Notifications**: Resend emails sent to Gmail
- ✅ **Database Storage**: All payment data saved
- ✅ **User Experience**: Complete payment flow

## 📞 Support

If you encounter issues:
1. **Check Console Logs**: Look for error messages
2. **Verify Database**: Ensure migration completed
3. **Test Payment**: Make a test payment
4. **Check Email**: Verify email delivery

The migration is essential for the payment system to work correctly!
