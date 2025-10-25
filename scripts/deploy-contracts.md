# Deploy Contracts to CELO Sepolia Testnet

## Prerequisites
1. Install Hardhat: `npm install --save-dev hardhat`
2. Get CELO Sepolia testnet tokens from faucet
3. Set up your private key in environment variables

## Environment Variables
```bash
# .env.local
PRIVATE_KEY=your_private_key_here
CELO_SEPOLIA_RPC_URL=https://rpc.ankr.com/celo_sepolia
```

## Deployment Steps

### 1. Create Hardhat Config
```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    celoSepolia: {
      url: process.env.CELO_SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11142220 // Correct CELO Sepolia Chain ID
    }
  }
};
```

### 2. Deploy MizuPay Contract
```solidity
// contracts/MizuPay.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MizuPay {
    uint256 public totalPayments;
    uint256 public totalVolume;
    
    event PaymentReceived(address indexed payer, uint256 amount, string sessionId);
    
    function payWithCELO(string memory sessionId) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        totalPayments++;
        totalVolume += msg.value;
        
        emit PaymentReceived(msg.sender, msg.value, sessionId);
    }
    
    function payWithCUSD(uint256 amount, string memory sessionId) public {
        // Implementation for cUSD payments
        // This would require cUSD token contract integration
    }
    
    function getBalances() public view returns (uint256 celoBalance, uint256 cUSDBalance) {
        return (address(this).balance, 0); // cUSD balance would need token integration
    }
}
```

### 3. Update Contract Addresses
After deployment, update `lib/contracts.ts` with the actual deployed addresses:

```typescript
export const CONTRACT_ADDRESSES = {
  MOCK_CUSD: '0x...', // Your deployed cUSD token address
  MIZU_PAY: '0x...', // Your deployed MizuPay contract address
} as const
```

## Testing
1. Connect wallet to CELO Sepolia testnet
2. Ensure you have testnet CELO tokens
3. Test the `payWithCELO` function
4. Verify transaction on Sepolia Etherscan

## Network Details
- **Chain ID**: 11142220 (0xaa044c)
- **RPC URL**: https://rpc.ankr.com/celo_sepolia
- **Block Explorer**: https://sepolia.celoscan.io
- **Faucet**: https://faucet.celo.org/ (select CELO Sepolia)
     