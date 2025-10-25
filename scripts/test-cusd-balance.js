// Test script to check cUSD balance
// Run with: node scripts/test-cusd-balance.js

const { ethers } = require('ethers');

// Configuration
const CELO_SEPOLIA_RPC = 'https://rpc.ankr.com/celo_sepolia';
const CUSD_ADDRESS = '0x61d11C622Bd98A71aD9361833379A2066Ad29CCa';

// cUSD ABI (minimal for balance check)
const CUSD_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function testCUSDBalance() {
  console.log('🔍 Testing cUSD Balance Check\n');
  
  try {
    // Connect to CELO Sepolia
    console.log('1️⃣ Connecting to CELO Sepolia...');
    const provider = new ethers.JsonRpcProvider(CELO_SEPOLIA_RPC);
    const network = await provider.getNetwork();
    console.log('✅ Connected to network:', network.name, '(Chain ID:', network.chainId.toString(), ')');
    
    // Create contract instance
    console.log('\n2️⃣ Creating cUSD contract instance...');
    const cusdContract = new ethers.Contract(CUSD_ADDRESS, CUSD_ABI, provider);
    console.log('✅ cUSD Contract Address:', CUSD_ADDRESS);
    
    // Test with a known address (you can replace this)
    const testAddress = '0x1234567890123456789012345678901234567890'; // Replace with your address
    
    console.log('\n3️⃣ Testing balanceOf function...');
    console.log('   Test Address:', testAddress);
    
    try {
      const balance = await cusdContract.balanceOf(testAddress);
      console.log('   Raw Balance:', balance.toString());
      console.log('   Formatted Balance:', ethers.formatEther(balance), 'cUSD');
    } catch (error) {
      console.log('   ❌ Error fetching balance:', error.message);
    }
    
    // Test contract info
    console.log('\n4️⃣ Contract Information:');
    try {
      const code = await provider.getCode(CUSD_ADDRESS);
      if (code === '0x') {
        console.log('   ❌ No contract found at this address');
      } else {
        console.log('   ✅ Contract exists at address');
        console.log('   📝 Contract code length:', code.length, 'characters');
      }
    } catch (error) {
      console.log('   ❌ Error checking contract:', error.message);
    }
    
    console.log('\n✅ cUSD balance test completed!');
    console.log('\n💡 To test with your wallet:');
    console.log('   1. Set PRIVATE_KEY environment variable');
    console.log('   2. Run: PRIVATE_KEY=your_key node scripts/test-cusd-balance.js');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if private key is provided
const privateKey = process.env.PRIVATE_KEY;
if (privateKey) {
  console.log('🔑 Private key provided, testing with your wallet...\n');
  
  async function testWithWallet() {
    try {
      const provider = new ethers.JsonRpcProvider(CELO_SEPOLIA_RPC);
      const wallet = new ethers.Wallet(privateKey, provider);
      const walletAddress = wallet.address;
      
      console.log('👛 Your Wallet Address:', walletAddress);
      
      const cusdContract = new ethers.Contract(CUSD_ADDRESS, CUSD_ABI, provider);
      const balance = await cusdContract.balanceOf(walletAddress);
      
      console.log('💰 Your cUSD Balance:', ethers.formatEther(balance), 'cUSD');
      
      if (balance === 0n) {
        console.log('\n💡 Your cUSD balance is 0. You may need to:');
        console.log('   1. Get testnet cUSD from a faucet');
        console.log('   2. Check if you\'re on the correct network (CELO Sepolia)');
        console.log('   3. Verify the contract address is correct');
      }
      
    } catch (error) {
      console.error('❌ Wallet test failed:', error.message);
    }
  }
  
  testWithWallet();
} else {
  testCUSDBalance();
}
