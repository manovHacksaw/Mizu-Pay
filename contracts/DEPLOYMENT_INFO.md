# Contract Deployment Information

## ✅ Successfully Deployed Contracts

### Contract Addresses (Celo Sepolia Testnet)

- **MockCUSD**: `0x967DBe52B9b4133B18A91bDC4F800063D205704A`
- **MizuPay**: `0x34C5A617e32c84BC9A54c862723FA5538f42F221`

### Network Details

- **Network**: Celo Sepolia Testnet
- **Chain ID**: 11142220
- **RPC URL**: `https://rpc.ankr.com/celo_sepolia`
- **Block Explorer**: `https://celo-sepolia.blockscout.com`

---

## 📁 Files Created/Updated

### ABIs Saved
- ✅ `lib/abis/MockCUSD.json` - MockCUSD contract ABI
- ✅ `lib/abis/MizuPay.json` - MizuPay contract ABI

### Configuration
- ✅ `lib/contracts.ts` - Contract addresses and configuration
- ✅ `app/dashboard/page.tsx` - Updated to use new MockCUSD address

---

## 🔗 Contract Links

### MockCUSD
- **Explorer**: https://celo-sepolia.blockscout.com/address/0x967DBe52B9b4133B18A91bDC4F800063D205704A
- **Functions**: `mint`, `transfer`, `approve`, `transferFrom`, `balanceOf`

### MizuPay
- **Explorer**: https://celo-sepolia.blockscout.com/address/0x34C5A617e32c84BC9A54c862723FA5538f42F221
- **Functions**: `payForSession`, `getPaymentInfo`, `withdraw`, `getBalance`

---

## 🚀 Usage in Application

### Import Contract Configuration

```typescript
import { 
  MOCK_CUSD_ADDRESS, 
  MIZU_PAY_CONTRACT,
  MockCUSD_ABI_typed,
  MizuPay_ABI_typed 
} from '@/lib/contracts'
```

### Example: Pay for Session

```typescript
import { getContract, parseUnits } from 'viem'
import { MIZU_PAY_CONTRACT, MizuPay_ABI_typed } from '@/lib/contracts'

const mizuPay = getContract({
  address: MIZU_PAY_CONTRACT,
  abi: MizuPay_ABI_typed,
  client: walletClient,
})

// Approve first
await mockCusd.write.approve([MIZU_PAY_CONTRACT, amountWei])

// Pay for session
await mizuPay.write.payForSession([sessionId, amountWei])
```

### Example: Check Payment Status

```typescript
const [paid, payer, amount, timestamp] = await mizuPay.read.getPaymentInfo([sessionId])
```

---

## 📝 Next Steps

1. ✅ Contracts deployed
2. ✅ ABIs saved
3. ✅ Configuration updated
4. ⏳ Integrate payment flow in checkout page
5. ⏳ Add event listeners for PaymentReceived events
6. ⏳ Test payment flow end-to-end

---

## 🧪 Testing

### Mint Test Tokens

1. Go to Remix or use contract directly
2. Call `mint` function on MockCUSD:
   - `_to`: Your wallet address
   - `_amount`: `1000000000000000000` (1 token)

### Test Payment

1. Approve MizuPay to spend tokens
2. Call `payForSession` with a test sessionId
3. Check payment status with `getPaymentInfo`

---

## 📚 Contract Functions Reference

### MockCUSD
- `mint(address _to, uint256 _amount)` - Mint tokens (owner only)
- `transfer(address _to, uint256 _value)` - Transfer tokens
- `approve(address _spender, uint256 _value)` - Approve spending
- `transferFrom(address _from, address _to, uint256 _value)` - Transfer on behalf
- `balanceOf(address account)` - Get balance

### MizuPay
- `payForSession(string sessionId, uint256 amount)` - Pay for a session
- `getPaymentInfo(string sessionId)` - Get payment details
- `withdraw(address to, uint256 amount)` - Withdraw funds (owner only)
- `getBalance()` - Get contract balance
- `setCusdToken(address _newToken)` - Update token address (owner only)

---

## 🔐 Security Notes

- Both contracts are deployed on **testnet** - do not use in production
- MockCUSD allows unlimited minting - for testing only
- MizuPay owner can withdraw funds - ensure secure key management
- Always verify contract addresses before interacting

---

## 📞 Support

If you need to redeploy or update contracts:
1. Update addresses in `lib/contracts.ts`
2. Update ABIs if contract code changes
3. Update dashboard and other components using contracts

