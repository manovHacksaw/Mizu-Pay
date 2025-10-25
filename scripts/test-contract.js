// Test script to interact with the MizuPay contract on CELO Sepolia
// Run with: node scripts/test-contract.js

const { ethers } = require('ethers');

// Contract configuration
const CELO_SEPOLIA_RPC = 'https://rpc.ankr.com/celo_sepolia';
const MIZU_PAY_ADDRESS = '0x6aE731EbaC64f1E9c6A721eA2775028762830CF7';
const CUSD_ADDRESS = '0x61d11C622Bd98A71aD9361833379A2066Ad29CCa';

// Contract ABI (simplified for testing)
const MIZU_PAY_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "sessionId", "type": "string"}],
    "name": "payWithCELO",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "string", "name": "sessionId", "type": "string"}
    ],
    "name": "payWithCUSD",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalances",
    "outputs": [
      {"internalType": "uint256", "name": "celoBalance", "type": "uint256"},
      {"internalType": "uint256", "name": "cUSDBalance", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CUSD_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function testContract() {
  try {
    console.log('🔗 Connecting to CELO Sepolia testnet...');
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(CELO_SEPOLIA_RPC);
    
    // Check network
    const network = await provider.getNetwork();
    console.log('📡 Network:', network.name, 'Chain ID:', network.chainId.toString());
    
    if (network.chainId.toString() !== '11142220') {
      throw new Error('❌ Not connected to CELO Sepolia testnet!');
    }
    
    // Create contract instances
    const mizuPayContract = new ethers.Contract(MIZU_PAY_ADDRESS, MIZU_PAY_ABI, provider);
    const cusdContract = new ethers.Contract(CUSD_ADDRESS, CUSD_ABI, provider);
    
    console.log('✅ Connected to CELO Sepolia testnet');
    console.log('📋 Contract addresses:');
    console.log('   MizuPay:', MIZU_PAY_ADDRESS);
    console.log('   cUSD:', CUSD_ADDRESS);
    
    // Get contract balances
    console.log('\n💰 Checking contract balances...');
    const balances = await mizuPayContract.getBalances();
    console.log('   CELO Balance:', ethers.formatEther(balances.celoBalance), 'CELO');
    console.log('   cUSD Balance:', ethers.formatEther(balances.cUSDBalance), 'cUSD');
    
    // Check wallet balances (if private key provided)
    const privateKey = process.env.PRIVATE_KEY;
    if (privateKey) {
      console.log('\n👛 Checking wallet balances...');
      const wallet = new ethers.Wallet(privateKey, provider);
      const walletAddress = wallet.address;
      
      // Get CELO balance
      const celoBalance = await provider.getBalance(walletAddress);
      console.log('   Your CELO Balance:', ethers.formatEther(celoBalance), 'CELO');
      
      // Get cUSD balance
      const cusdBalance = await cusdContract.balanceOf(walletAddress);
      console.log('   Your cUSD Balance:', ethers.formatEther(cusdBalance), 'cUSD');
      
      console.log('   Wallet Address:', walletAddress);
    } else {
      console.log('\n💡 To check your wallet balances, set PRIVATE_KEY in environment variables');
      console.log('   Example: PRIVATE_KEY=your_private_key_here node scripts/test-contract.js');
    }
    
    console.log('\n✅ Contract interaction test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Get testnet CELO tokens from: https://faucet.celo.org/');
    console.log('2. Connect your wallet to CELO Sepolia testnet');
    console.log('3. Test payments through the web interface');
    
  } catch (error) {
    console.error('❌ Error testing contract:', error.message);
  }
}

// Run the test
testContract();
