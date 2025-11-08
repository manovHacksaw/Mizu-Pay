# Mizu Pay Smart Contracts

This directory contains the smart contracts for Mizu Pay payment system.

## Contracts

1. **MockCUSD.sol** - Mock cUSD token for testing (ERC20 compatible)
2. **MizuPay.sol** - Main payment receiver contract

## Setup

### Install Dependencies

```bash
cd contracts
npm install
```

### Compile Contracts

```bash
npm run compile
```

This will generate ABIs in the `artifacts/` directory.

## Deployment via Remix

### 1. Deploy MockCUSD

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `MockCUSD.sol`
3. Copy the contents of `contracts/MockCUSD.sol`
4. Compile with Solidity version 0.8.20
5. Deploy to Celo Sepolia:
   - Select "Injected Provider" (MetaMask/Privy)
   - Make sure you're connected to Celo Sepolia testnet
   - Click "Deploy"
   - Save the deployed contract address

### 2. Deploy MizuPay

1. In Remix, create a new file `MizuPay.sol`
2. Copy the contents of `contracts/MizuPay.sol`
3. Compile with Solidity version 0.8.20
4. Deploy to Celo Sepolia:
   - Select "Injected Provider"
   - In the constructor, enter the MockCUSD contract address from step 1
   - Click "Deploy"
   - Save the deployed contract address

### 3. Mint Mock cUSD for Testing

After deploying MockCUSD, you can mint tokens for testing:

1. In Remix, go to the "Deployed Contracts" section
2. Select your MockCUSD contract
3. Call the `mint` function:
   - `_to`: Your wallet address
   - `_amount`: Amount in wei (e.g., 1000000000000000000 for 1 token)
4. Click "transact"

## Contract Addresses

After deployment, update these addresses in your application:

- **MockCUSD**: `0x...` (update in `app/dashboard/page.tsx`)
- **MizuPay**: `0x...` (add to your environment variables)

## Usage

### Paying for a Session

```javascript
// Approve MizuPay contract to spend cUSD
await mockCUSD.approve(mizuPayAddress, amount);

// Pay for session
await mizuPay.payForSession(sessionId, amount);
```

### Checking Payment Status

```javascript
const paymentInfo = await mizuPay.getPaymentInfo(sessionId);
// Returns: { paid, payer, amount, timestamp }
```

## Events

The `MizuPay` contract emits `PaymentReceived` events that can be indexed:

```solidity
event PaymentReceived(
    string indexed sessionId,
    address indexed payer,
    uint256 amount,
    uint256 timestamp
);
```

## Local Compilation (Optional)

If you want to compile locally and generate ABIs:

```bash
cd contracts
npm install
npm run compile
```

ABIs will be in `artifacts/contracts/` directory.

