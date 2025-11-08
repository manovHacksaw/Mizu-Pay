# Payment Flow Review & Implementation Plan

## 📋 **Current State Analysis**

### Existing Implementation
- ✅ `/api/sessions/create` - Exists but needs updates
- ❌ `/api/payments/init` - Missing
- ❌ `/api/payments/confirm` - Missing  
- ❌ `/api/giftcards/assign` - Missing

### Schema Status
- ✅ `PaymentSession` model exists with status enum
- ✅ `Payment` model exists with txHash field
- ⚠️ Need to check if we need `tx_pending` status

---

## 🔄 **Proposed Flow**

```
1. Extension → POST /api/sessions/create
   Input: { giftCardId, walletAddress, userId }
   Output: { sessionId, amountUSD, payableAmountMinor }
   Status: PaymentSession.status = "pending"
   
2. Frontend → Send blockchain transaction
   - User approves transaction in wallet
   - Transaction is broadcast to blockchain
   
3. Frontend → POST /api/payments/init
   Input: { sessionId, txHash }
   Output: { success: true }
   Status: PaymentSession.status = "pending" (still)
   Creates: Payment record with status = "pending" (or we add tx_pending to PaymentSession)
   
4. Indexer → POST /api/payments/confirm
   Input: { sessionId, txHash, walletAddress, amount, currency }
   Validates: 
     - Wallet matches session wallet
     - Amount matches session amount
     - Currency matches
     - Transaction is confirmed on-chain
   Updates: PaymentSession.status = "paid"
   Updates: Payment.status = "paid"
   
5. Backend (cron/webhook) → POST /api/giftcards/assign
   Input: { sessionId }
   Finds: PaymentSession with status = "paid"
   Actions:
     - Select available gift card from stock
     - Decrement stock
     - Link gift card to session (need to add this relationship?)
     - Send email with gift card details
     - Update PaymentSession.status = "fulfilled"
```

---

## 🗄️ **Schema Changes Needed**

### Option 1: Add `tx_pending` to SessionStatus enum
```prisma
enum SessionStatus {
  pending      // Initial state
  tx_pending   // Transaction sent, waiting for confirmation
  paid         // Payment confirmed by indexer
  fulfilled    // Gift card assigned and delivered
  expired      // Session expired
  failed       // Payment failed
}
```

### Option 2: Use Payment model to track transaction state
- PaymentSession.status stays as "pending" until indexer confirms
- Payment.status can be: "pending", "paid", "failed"
- Payment.txHash stores the transaction hash

**Recommendation:** Option 2 (use Payment model) - cleaner separation of concerns

---

## 📝 **API Route Specifications**

### 1. POST `/api/sessions/create`
**Purpose:** Create payment session when user initiates checkout

**Request:**
```json
{
  "giftCardId": "string",
  "walletAddress": "string",
  "userId": "string" // From authenticated Privy user
}
```

**Response:**
```json
{
  "sessionId": "string",
  "amountUSD": 12.20,
  "payableAmountMinor": 100000,
  "store": "Amazon",
  "currency": "INR"
}
```

**Current Issues:**
- ❌ Doesn't use authenticated user (creates anonymous user)
- ❌ Should use userId from Privy sync
- ✅ Returns correct data structure

**Changes Needed:**
- Accept `userId` from authenticated request
- Validate user exists
- Ensure wallet belongs to user

---

### 2. POST `/api/payments/init`
**Purpose:** Store transaction hash after user sends payment

**Request:**
```json
{
  "sessionId": "string",
  "txHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "paymentId": "string"
}
```

**Actions:**
- Find PaymentSession by sessionId
- Validate session exists and status is "pending"
- Create Payment record with:
  - sessionId
  - txHash
  - status = "pending"
  - amountCrypto, token from session
- Return paymentId

**Status Flow:**
- PaymentSession.status: "pending" → "pending" (no change)
- Payment.status: "pending"

---

### 3. POST `/api/payments/confirm`
**Purpose:** Called by indexer to confirm payment on-chain

**Request:**
```json
{
  "sessionId": "string",
  "txHash": "0x...",
  "walletAddress": "0x...",
  "amount": "12.20",
  "currency": "cUSD"
}
```

**Response:**
```json
{
  "success": true,
  "confirmed": true
}
```

**Validation:**
1. Find PaymentSession by sessionId
2. Verify PaymentSession.status is "pending"
3. Verify Payment exists with matching txHash
4. Verify walletAddress matches PaymentSession.wallet.address
5. Verify amount matches PaymentSession.amountUSD (with tolerance)
6. Verify currency matches expected token

**Actions:**
- Update PaymentSession.status = "paid"
- Update Payment.status = "paid"
- Update Payment.txHash (if not already set)

**Error Cases:**
- Session not found → 404
- Session already paid → 400
- Wallet mismatch → 400
- Amount mismatch → 400
- Currency mismatch → 400

---

### 4. POST `/api/giftcards/assign`
**Purpose:** Assign gift card and send email after payment confirmed

**Request:**
```json
{
  "sessionId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "giftCardId": "string",
  "emailSent": true
}
```

**Actions:**
1. Find PaymentSession by sessionId
2. Verify PaymentSession.status is "paid"
3. Find available GiftCard:
   - Same store
   - Same currency
   - Stock > 0
   - Active = true
   - Amount >= session amount
4. Decrement GiftCard.stock
5. Link gift card to session (need relationship?)
6. Get user email from PaymentSession.user
7. Send email with gift card details
8. Update PaymentSession.status = "fulfilled"

**Schema Question:**
- Do we need a relationship between PaymentSession and GiftCard?
- Or store giftCardId in PaymentSession?

**Recommendation:** Add `giftCardId` to PaymentSession model

---

## 🔧 **Schema Updates Required**

### Add to PaymentSession model:
```prisma
model PaymentSession {
  // ... existing fields
  giftCardId     String?  // Gift card assigned to this session
  giftCard       GiftCard? @relation(fields: [giftCardId], references: [id])
}
```

### Update Payment model:
```prisma
model Payment {
  // ... existing fields
  status       PaymentStatus @default(pending) // Change default to pending
}

enum PaymentStatus {
  pending   // Transaction sent, waiting for confirmation
  paid      // Confirmed by indexer
  refunded
  failed
}
```

---

## 🚨 **Security Considerations**

### `/api/payments/confirm`
- **Authentication:** Should require API key or secret token
- **Rate limiting:** Prevent abuse
- **Idempotency:** Multiple calls with same data should be safe

### `/api/giftcards/assign`
- **Authentication:** Internal only or with auth token
- **Idempotency:** Should not assign multiple gift cards
- **Stock locking:** Prevent race conditions when assigning

---

## 📊 **Status Flow Diagram**

```
PaymentSession.status:
pending → (tx sent) → pending → (indexer confirms) → paid → (assign gift card) → fulfilled

Payment.status:
(payment/init) → pending → (indexer confirms) → paid
```

---

## ✅ **Implementation Checklist**

### Phase 1: Schema Updates
- [ ] Add `giftCardId` to PaymentSession
- [ ] Update PaymentStatus enum (add "pending")
- [ ] Run migration

### Phase 2: API Routes
- [ ] Update `/api/sessions/create` to use authenticated user
- [ ] Create `/api/payments/init`
- [ ] Create `/api/payments/confirm` with validation
- [ ] Create `/api/giftcards/assign` with email

### Phase 3: Frontend Integration
- [ ] Update checkout to call `/api/payments/init` after tx
- [ ] Handle payment confirmation flow
- [ ] Show success/error states

### Phase 4: Testing
- [ ] Test full flow end-to-end
- [ ] Test error cases
- [ ] Test concurrent requests

---

## ❓ **Questions to Clarify**

1. **Authentication:** How should `/api/payments/confirm` be authenticated? API key?
2. **Gift Card Assignment:** Should this be automatic or manual trigger?
3. **Email Service:** Which email provider? (SendGrid, Resend, etc.)
4. **Indexer:** Separate service or Next.js API route with polling?
5. **Error Handling:** What happens if gift card stock runs out?
6. **Session Expiry:** Should sessions expire? How long?

---

## 📝 **Next Steps**

1. Review this document
2. Confirm schema changes
3. Implement API routes in order
4. Test each route independently
5. Integrate with frontend
6. Set up indexer service

