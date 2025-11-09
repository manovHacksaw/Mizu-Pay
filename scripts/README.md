# Etherscan Transaction Verification Scripts

These scripts verify transactions using Etherscan's API to check:
1. ✅ If tokens were sent to the MizuPay contract
2. ✅ If the actual amount matches the expected amount
3. ⚠️ If it was sent for the exact sessionId (requires event log decoding)

## Scripts

### 1. `test-etherscan-api.js`
Simple test script to verify Etherscan API connectivity and test basic queries.

**Usage:**
```bash
node scripts/test-etherscan-api.js
```

This will test:
- Getting token transfers for a test address
- Getting token transfers to the MizuPay contract

### 2. `monitor-transactions.js` ⭐ **USE THIS FOR LIVE MONITORING**
Real-time transaction monitor that logs all transactions to the terminal.

**Usage:**
```bash
# Monitor all transactions to MizuPay contract (recommended)
node scripts/monitor-transactions.js

# Monitor transactions from a specific address
node scripts/monitor-transactions.js 0x2D4575003f6017950C2f7a10aFb17bf2fBb648d2
```

**What it does:**
- Monitors for new token transfers to the MizuPay contract
- Automatically logs transaction details when detected
- Verifies amount, payer address, and decodes event logs
- Runs continuously (checks every 5 seconds)
- Press `Ctrl+C` to stop

**Perfect for:** Running in a terminal while making payments from the frontend!

### 3. `verify-transaction.js`
Main verification script that checks a specific transaction.

**Usage:**
```bash
node scripts/verify-transaction.js <txHash> <expectedSessionId> <expectedAmountUSD>
```

**Example:**
```bash
node scripts/verify-transaction.js 0x93e7e9e974dd1f60ebc4b4db9d15448c97e77c177182409238a45052464d10a5 test-session-123 6.1
```

**What it verifies:**
- ✅ Token transfer to MizuPay contract exists
- ✅ Amount matches expected amount (with tolerance for rounding)
- ⚠️ SessionId verification (shows hash, but requires keccak256 library for full verification)

## Configuration

The scripts use these constants (defined in the scripts):
- `ETHERSCAN_API_KEY`: Your Etherscan API key
- `CHAIN_ID`: 11142220 (Celo Sepolia)
- `TOKEN_CONTRACT`: 0x967DBe52B9b4133B18A91bDC4F800063D205704A (MockCUSD)
- `MIZU_PAY_CONTRACT`: 0x34C5A617e32c84BC9A54c862723FA5538f42F221

## API Endpoints Used

1. **Token Transfers**: `module=account&action=tokentx`
   - Gets ERC20 token transfers for a specific transaction or address
   
2. **Transaction Receipt**: `module=proxy&action=eth_getTransactionReceipt`
   - Gets full transaction receipt with event logs
   
3. **Event Logs**: `module=logs&action=getLogs`
   - Gets event logs filtered by contract address and transaction hash

## Event Log Structure

The `PaymentReceived` event from MizuPay contract has this structure:
```
PaymentReceived(
  string indexed sessionId,  // topics[1] - keccak256 hash
  address indexed payer,      // topics[2] - payer address
  uint256 amount,             // data[0:32] - amount in wei
  uint256 timestamp           // data[32:64] - block timestamp
)
```

## SessionId Verification

SessionId is stored as a **keccak256 hash** in the event log (indexed string). To fully verify:

1. **Option 1**: Call the contract's `getPaymentInfo(sessionId)` function via RPC
2. **Option 2**: Compute `keccak256(abi.encodePacked(sessionId))` and compare with `topics[1]`

For Option 2, you'll need to install the keccak library:
```bash
npm install keccak
```

Then compute the hash:
```javascript
const keccak = require('keccak');
const hash = '0x' + keccak('keccak256').update(sessionId).digest('hex');
```

## Example Output

```
================================================================================
🔐 TRANSACTION VERIFICATION
================================================================================

Transaction Hash: 0x93e7e9e974dd1f60ebc4b4db9d15448c97e77c177182409238a45052464d10a5
Expected Session ID: test-session-123
Expected Amount (USD): 6.1

✅ Found 1 transfer(s) to MizuPay contract
✅ Amount matches: 6.1 cUSD
✅ Payer address matches
⚠️  SessionId verification: Requires event log decoding
```

## Notes

- These scripts are for **verification/testing only** - not integrated into the main codebase
- The scripts use console.log for output (as requested)
- SessionId hash verification requires additional setup (keccak library)
- For production integration, you'd want to add proper error handling and retry logic

