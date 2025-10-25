# Test CELO Sepolia Contract Payment Flow

## Prerequisites

### 1. Get Testnet CELO Tokens
1. Visit: https://faucet.celo.org/
2. Select "CELO Sepolia" from the dropdown
3. Enter your wallet address
4. Request testnet CELO tokens

### 2. Add CELO Sepolia to Your Wallet
- **Network Name**: CELO Sepolia Testnet
- **RPC URL**: https://rpc.ankr.com/celo_sepolia
- **Chain ID**: 11142220
- **Currency**: CELO
- **Block Explorer**: https://sepolia.celoscan.io

## Testing Steps

### 1. Test Contract Connection
```bash
# Install dependencies if needed
npm install ethers

# Run the test script
node scripts/test-contract.js
```

### 2. Test Web Interface
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/payment

3. Connect your wallet to CELO Sepolia testnet

4. Test payment with:
   - **Amount**: 0.001 CELO (small test amount)
   - **Token**: CELO
   - **Store**: Test Store
   - **Product**: Test Product

### 3. Expected Payment Flow

#### For CELO Payments:
1. **User clicks "Pay"** → MetaMask opens
2. **User confirms transaction** → Transaction sent to contract
3. **Transaction confirmed** → Database saves payment record
4. **Success message** → Payment completed

#### For cUSD Payments:
1. **User clicks "Pay"** → First approval transaction
2. **User confirms approval** → cUSD approval sent
3. **User confirms payment** → cUSD payment sent to contract
4. **Transaction confirmed** → Database saves payment record

## Contract Functions

### `payWithCELO(string sessionId)`
- **Purpose**: Pay with native CELO tokens
- **Parameters**: sessionId (string)
- **Value**: CELO amount to send
- **Example**: Send 0.001 CELO with sessionId "test_123"

### `payWithCUSD(uint256 amount, string sessionId)`
- **Purpose**: Pay with cUSD tokens
- **Parameters**: amount (uint256), sessionId (string)
- **Prerequisites**: User must approve cUSD spending first
- **Example**: Send 1.0 cUSD with sessionId "test_123"

### `getBalances()`
- **Purpose**: Get contract's CELO and cUSD balances
- **Returns**: (celoBalance, cUSDBalance)
- **Use**: Check if payments are received correctly

## Troubleshooting

### Common Issues:

1. **"Please switch to CELO Sepolia testnet"**
   - Solution: Switch your wallet to CELO Sepolia (Chain ID: 11142220)

2. **"Insufficient funds"**
   - Solution: Get testnet CELO from https://faucet.celo.org/

3. **"Transaction failed"**
   - Solution: Check you have enough CELO for gas fees

4. **"Contract not found"**
   - Solution: Verify you're on CELO Sepolia testnet

### Debug Information:
- Check browser console for detailed error messages
- Verify contract addresses in the debug panel
- Ensure wallet is connected to the correct network

## Success Indicators:

✅ **Wallet Connected**: Shows "CELO Sepolia" in network status
✅ **Transaction Sent**: MetaMask shows transaction hash
✅ **Transaction Confirmed**: Green success message appears
✅ **Database Updated**: Payment record saved with transaction hash
✅ **Contract Balance**: Contract receives the payment

## Next Steps:

1. **Deploy to Production**: Use CELO mainnet for live payments
2. **Add More Tokens**: Support additional CELO ecosystem tokens
3. **Enhanced UI**: Add transaction history and payment tracking
4. **Analytics**: Track payment volumes and success rates
