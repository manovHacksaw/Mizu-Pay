# Remix Deployment Guide

## Step 1: Deploy MockCUSD Token

### Contract Code (Copy this into Remix)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockCUSD {
    string public name = "Mock cUSD";
    string public symbol = "mcUSD";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        owner = msg.sender;
        totalSupply = 0;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    function mint(address _to, uint256 _amount) public {
        require(msg.sender == owner, "Only owner can mint");
        balanceOf[_to] += _amount;
        totalSupply += _amount;
        emit Transfer(address(0), _to, _amount);
    }
    
    function burn(uint256 _amount) public {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        emit Transfer(msg.sender, address(0), _amount);
    }
}
```

### Deployment Steps:

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create new file: `MockCUSD.sol`
3. Paste the code above
4. Select Solidity compiler version: **0.8.20**
5. Click "Compile MockCUSD.sol"
6. Go to "Deploy & Run Transactions"
7. Select environment: **Injected Provider - MetaMask** (or Privy)
8. Make sure you're connected to **Celo Sepolia** testnet
9. Click "Deploy"
10. **Save the deployed contract address** - you'll need it for MizuPay deployment

### Mint Test Tokens:

After deployment, mint some tokens for testing:

1. In "Deployed Contracts", expand your MockCUSD contract
2. Find the `mint` function
3. Enter:
   - `_to`: Your wallet address (0x...)
   - `_amount`: `1000000000000000000` (1 token with 18 decimals)
4. Click "transact"
5. Repeat to mint more tokens as needed

---

## Step 2: Deploy MizuPay Contract

### Contract Code (Copy this into Remix)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract MizuPay {
    address public owner;
    address public cusdToken;
    
    struct PaymentInfo {
        address payer;
        uint256 amount;
        uint256 timestamp;
        bool paid;
    }
    
    mapping(string => PaymentInfo) public payments;
    mapping(address => uint256) public totalReceived;
    
    event PaymentReceived(
        string indexed sessionId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );
    
    event PaymentWithdrawn(
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    constructor(address _cusdToken) {
        owner = msg.sender;
        cusdToken = _cusdToken;
    }
    
    function payForSession(string memory sessionId, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(!payments[sessionId].paid, "Session already paid");
        require(bytes(sessionId).length > 0, "Session ID cannot be empty");
        
        IERC20 token = IERC20(cusdToken);
        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        payments[sessionId] = PaymentInfo({
            payer: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            paid: true
        });
        
        totalReceived[msg.sender] += amount;
        
        emit PaymentReceived(sessionId, msg.sender, amount, block.timestamp);
    }
    
    function getPaymentInfo(string memory sessionId) external view returns (
        bool paid,
        address payer,
        uint256 amount,
        uint256 timestamp
    ) {
        PaymentInfo memory payment = payments[sessionId];
        return (payment.paid, payment.payer, payment.amount, payment.timestamp);
    }
    
    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 token = IERC20(cusdToken);
        require(
            token.balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );
        
        require(
            token.transfer(to, amount),
            "Token transfer failed"
        );
        
        emit PaymentWithdrawn(to, amount, block.timestamp);
    }
    
    function getBalance() external view returns (uint256) {
        IERC20 token = IERC20(cusdToken);
        return token.balanceOf(address(this));
    }
    
    function setCusdToken(address _newCusdToken) external onlyOwner {
        require(_newCusdToken != address(0), "Invalid address");
        cusdToken = _newCusdToken;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
```

### Deployment Steps:

1. In Remix, create new file: `MizuPay.sol`
2. Paste the code above
3. Select Solidity compiler version: **0.8.20**
4. Click "Compile MizuPay.sol"
5. Go to "Deploy & Run Transactions"
6. Select environment: **Injected Provider - MetaMask** (or Privy)
7. Make sure you're connected to **Celo Sepolia** testnet
8. In the constructor field, enter: **Your MockCUSD contract address** (from Step 1)
9. Click "Deploy"
10. **Save the deployed MizuPay contract address** - you'll need this in your app

---

## Step 3: Update Your Application

After deployment, update these addresses:

### In `app/dashboard/page.tsx`:
```typescript
const MOCK_CUSD = '0x...' // Your MockCUSD address
```

### Create environment variable or config:
```typescript
// Add to your config
export const MIZU_PAY_CONTRACT = '0x...' // Your MizuPay address
```

---

## Testing the Contracts

### Test Payment Flow:

1. **Approve MizuPay to spend your cUSD:**
   - In Remix, select MockCUSD contract
   - Call `approve`:
     - `_spender`: MizuPay contract address
     - `_value`: `1000000000000000000` (1 token)

2. **Pay for a session:**
   - In Remix, select MizuPay contract
   - Call `payForSession`:
     - `sessionId`: `"test-session-123"` (any string)
     - `amount`: `1000000000000000000` (1 token)

3. **Check payment status:**
   - Call `getPaymentInfo`:
     - `sessionId`: `"test-session-123"`
   - Should return payment details

---

## Contract Addresses Summary

After deployment, save these addresses:

- **MockCUSD**: `0x...`
- **MizuPay**: `0x...`

You'll need both addresses in your frontend code to interact with the contracts.

