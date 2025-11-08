# Extracting ABIs from Remix

After deploying contracts in Remix, you can extract the ABIs for use in your application.

## Method 1: Copy from Remix UI

1. In Remix, go to the "Solidity Compiler" tab
2. After compiling, scroll down to find the "ABI" section
3. Click the copy icon next to the ABI
4. Save it to a JSON file in your project

## Method 2: Using Hardhat (Local Compilation)

If you want to compile locally and generate ABIs:

```bash
cd contracts
npm install
npm run compile
```

ABIs will be generated in:
- `artifacts/contracts/MockCUSD.sol/MockCUSD.json`
- `artifacts/contracts/MizuPay.sol/MizuPay.json`

Extract the `abi` field from these JSON files.

## Method 3: Using Remix API

You can also access the ABI programmatically through Remix's file system API.

## Using ABIs in Your Application

### Example: Create ABI files

Create these files in your project:

**`lib/abis/MockCUSD.json`:**
```json
[
  {
    "inputs": [...],
    "name": "transfer",
    "outputs": [...],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  ...
]
```

**`lib/abis/MizuPay.json`:**
```json
[
  {
    "inputs": [...],
    "name": "payForSession",
    "outputs": [...],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  ...
]
```

### Using in TypeScript/JavaScript

```typescript
import mizuPayAbi from '@/lib/abis/MizuPay.json'
import mockCusdAbi from '@/lib/abis/MockCUSD.json'

// With viem
import { getContract } from 'viem'

const mizuPayContract = getContract({
  address: MIZU_PAY_CONTRACT,
  abi: mizuPayAbi,
  client: publicClient,
})

// Call contract functions
await mizuPayContract.write.payForSession([sessionId, amount])
```

