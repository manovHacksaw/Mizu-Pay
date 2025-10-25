# Getting CELO Sepolia Testnet Tokens

## Overview
To test the payment system, you need both CELO and cUSD tokens on the CELO Sepolia testnet.

## Step 1: Get CELO Testnet Tokens

### Option 1: CELO Faucet (Recommended)
1. Visit: https://faucet.celo.org/
2. Select "Sepolia" network
3. Enter your wallet address
4. Request CELO tokens
5. Wait for confirmation

### Option 2: Ankr Faucet
1. Visit: https://www.ankr.com/faucet/celo/
2. Select "Sepolia" network
3. Enter your wallet address
4. Request tokens

## Step 2: Get cUSD Testnet Tokens

### Option 1: CELO Faucet (if available)
1. Visit: https://faucet.celo.org/
2. Look for cUSD option
3. Request cUSD tokens

### Option 2: Manual Contract Interaction
If no faucet is available, you can interact with the cUSD contract directly:

```javascript
// Connect to CELO Sepolia
const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/celo_sepolia');
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// cUSD contract address
const cusdAddress = '0x61d11C622Bd98A71aD9361833379A2066Ad29CCa';

// If the contract has a mint function, you can mint tokens
// (This depends on the specific contract implementation)
```

## Step 3: Verify Your Tokens

### Check CELO Balance
```bash
# Run the test script
node scripts/test-contract.js
```

### Check cUSD Balance
```bash
# Run the cUSD balance test
node scripts/test-cusd-balance.js
```

## Step 4: Test the Payment System

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open: http://localhost:3000/payment

3. Connect your wallet to CELO Sepolia

4. You should see your balances displayed

5. Make a test payment

## Troubleshooting

### If cUSD balance shows 0:
1. **Check Network**: Ensure you're on CELO Sepolia (Chain ID: 11142220)
2. **Check Contract**: Verify the contract address is correct
3. **Get Tokens**: Use the faucets above to get testnet tokens
4. **Check Console**: Look for error messages in browser console

### If CELO balance shows 0:
1. **Get CELO**: Use the CELO faucet to get testnet CELO
2. **Check Network**: Ensure you're on the correct network
3. **Wait**: Sometimes it takes a few minutes for tokens to appear

### Common Issues:
- **Wrong Network**: Make sure you're on CELO Sepolia, not mainnet
- **No Tokens**: Get testnet tokens from faucets
- **Contract Issues**: Verify contract addresses are correct
- **RPC Issues**: Try a different RPC endpoint if needed

## Useful Links:
- [CELO Sepolia Faucet](https://faucet.celo.org/)
- [CELO Sepolia Explorer](https://sepolia.celoscan.io/)
- [CELO Documentation](https://docs.celo.org/)
- [Ankr Faucet](https://www.ankr.com/faucet/celo/)

## Test Scripts:
- `node scripts/test-contract.js` - Test contract interaction
- `node scripts/test-cusd-balance.js` - Test cUSD balance
- `node scripts/integration-test.js` - Full integration test
