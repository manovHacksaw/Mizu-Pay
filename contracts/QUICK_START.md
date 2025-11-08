# Quick Start - Deploy Contracts via Remix

## 🚀 Fast Deployment Guide

### Step 1: Deploy MockCUSD (Copy & Paste)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create file: `MockCUSD.sol`
3. **Copy the entire code below:**

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

4. Compile with **Solidity 0.8.20**
5. Deploy to **Celo Sepolia** (Injected Provider)
6. **Save the address** → `MOCK_CUSD_ADDRESS`

---

### Step 2: Deploy MizuPay (Copy & Paste)

1. In Remix, create file: `MizuPay.sol`
2. **Copy the entire code below:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Complete ERC20 interface
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
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

3. Compile with **Solidity 0.8.20**
4. Deploy to **Celo Sepolia**
5. In constructor, enter: **`MOCK_CUSD_ADDRESS`** (from Step 1)
6. **Save the address** → `MIZU_PAY_ADDRESS`

---

### Step 3: Mint Test Tokens

1. In Remix, select your **MockCUSD** contract
2. Call `mint` function:
   - `_to`: Your wallet address
   - `_amount`: `1000000000000000000` (1 token = 10^18 wei)
3. Click "transact"
4. Repeat to mint more tokens

---

### Step 4: Extract ABIs

1. In Remix, go to **Solidity Compiler** tab
2. After compiling, scroll to **ABI** section
3. Click **copy** icon
4. Save as:
   - `lib/abis/MockCUSD.json`
   - `lib/abis/MizuPay.json`

---

### Step 5: Update Your App

Update contract addresses in your code:

```typescript
// app/dashboard/page.tsx
const MOCK_CUSD = '0x...' // Your MockCUSD address

// Environment or config file
export const MIZU_PAY_CONTRACT = '0x...' // Your MizuPay address
```

---

## ✅ Done!

You now have:
- ✅ MockCUSD token deployed
- ✅ MizuPay contract deployed
- ✅ Test tokens minted
- ✅ ABIs extracted
- ✅ Addresses saved

Ready to integrate with your frontend! 🎉

