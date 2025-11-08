# Contract Summary

## MockCUSD.sol

A simple ERC20-compatible token for testing on Celo Sepolia.

### Key Functions:
- `transfer(to, amount)` - Transfer tokens
- `approve(spender, amount)` - Approve spending
- `transferFrom(from, to, amount)` - Transfer on behalf
- `mint(to, amount)` - Mint new tokens (owner only)
- `burn(amount)` - Burn tokens

### Events:
- `Transfer(from, to, value)`
- `Approval(owner, spender, value)`

---

## MizuPay.sol

Main payment receiver contract that accepts cUSD payments for sessions.

### Key Functions:

#### `payForSession(sessionId, amount)`
- Pays for a session using cUSD
- Transfers tokens from user to contract
- Records payment information
- Emits `PaymentReceived` event
- **Requirements:**
  - User must have approved contract to spend cUSD
  - Session must not already be paid
  - Amount > 0

#### `getPaymentInfo(sessionId)`
- Returns payment details for a session
- Returns: `(paid, payer, amount, timestamp)`

#### `getBalance()`
- Returns contract's cUSD balance

#### `withdraw(to, amount)` (owner only)
- Withdraw collected payments

### Events:

#### `PaymentReceived(sessionId, payer, amount, timestamp)`
- Emitted when a payment is received
- **Indexed fields:** `sessionId`, `payer`
- Use this event for indexing/polling payments

#### `PaymentWithdrawn(to, amount, timestamp)`
- Emitted when owner withdraws funds

### Security:
- Only owner can withdraw funds
- Prevents double payment for same session
- Validates amounts and addresses

---

## Payment Flow

1. **User approves MizuPay to spend cUSD:**
   ```
   MockCUSD.approve(MizuPayAddress, amount)
   ```

2. **User pays for session:**
   ```
   MizuPay.payForSession(sessionId, amount)
   ```

3. **Contract emits event:**
   ```
   PaymentReceived(sessionId, payer, amount, timestamp)
   ```

4. **Backend/indexer listens for event:**
   - Validates payment
   - Updates database
   - Marks session as "paid"

---

## Integration Points

### Frontend:
- Approve and pay functions
- Check payment status
- Listen for events

### Backend:
- Listen to `PaymentReceived` events
- Validate payments
- Update session status
- Create Payment records

### Indexer (optional):
- Poll for `PaymentReceived` events
- Validate against database
- Update payment status

---

## Contract Addresses

After deployment, save these addresses:

- **MockCUSD**: `0x...`
- **MizuPay**: `0x...`

Update in:
- `app/dashboard/page.tsx` (MockCUSD)
- Environment variables (MizuPay)
- Frontend contract interactions

