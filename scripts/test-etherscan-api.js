/**
 * Simple test script to verify Etherscan API works
 * Tests the API call from the user's curl command
 */

const ETHERSCAN_API_KEY = 'AX7UYGEWBMPK97S5KQWQJ6FXUJI3AKKEN8';
const CHAIN_ID = 11142220; // Celo Sepolia
const TOKEN_CONTRACT = '0x967DBe52B9b4133B18A91bDC4F800063D205704A'; // MockCUSD
const TEST_ADDRESS = '0x2D4575003f6017950C2f7a10aFb17bf2fBb648d2'; // From user's curl command

const ETHERSCAN_API_BASE = 'https://api.etherscan.io/v2/api';

async function testEtherscanAPI() {
  console.log('='.repeat(80));
  console.log('🧪 TESTING ETHERSCAN API');
  console.log('='.repeat(80));
  console.log(`\nChain ID: ${CHAIN_ID} (Celo Sepolia)`);
  console.log(`Token Contract: ${TOKEN_CONTRACT}`);
  console.log(`Test Address: ${TEST_ADDRESS}`);

  try {
    // Test 1: Get token transfers for the address
    console.log('\n' + '-'.repeat(80));
    console.log('TEST 1: Get Token Transfers for Address');
    console.log('-'.repeat(80));

    const url = new URL(ETHERSCAN_API_BASE);
    url.searchParams.append('apikey', ETHERSCAN_API_KEY);
    url.searchParams.append('chainid', CHAIN_ID.toString());
    url.searchParams.append('module', 'account');
    url.searchParams.append('action', 'tokentx');
    url.searchParams.append('contractaddress', TOKEN_CONTRACT);
    url.searchParams.append('address', TEST_ADDRESS);
    url.searchParams.append('sort', 'desc');

    console.log(`\n📡 Request URL:`);
    console.log(url.toString());

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log(`\n📥 Response Status: ${data.status}`);
    console.log(`📥 Response Message: ${data.message || 'N/A'}`);

    if (data.status === '1' && data.result) {
      console.log(`\n✅ Success! Found ${data.result.length} token transfer(s)`);
      
      if (data.result.length > 0) {
        console.log(`\n📋 First ${Math.min(5, data.result.length)} transfer(s):`);
        data.result.slice(0, 5).forEach((tx, index) => {
          console.log(`\n  Transfer ${index + 1}:`);
          console.log(`    Hash: ${tx.hash}`);
          console.log(`    From: ${tx.from}`);
          console.log(`    To: ${tx.to}`);
          console.log(`    Value: ${tx.value} (${parseFloat(tx.value) / 1e18} cUSD)`);
          console.log(`    Block: ${tx.blockNumber}`);
          console.log(`    Timestamp: ${new Date(parseInt(tx.timeStamp) * 1000).toISOString()}`);
        });
      }
    } else {
      console.log(`\n⚠️  No results or error: ${data.message || JSON.stringify(data)}`);
    }

    // Test 2: Get token transfers to MizuPay contract
    console.log('\n' + '-'.repeat(80));
    console.log('TEST 2: Get Token Transfers TO MizuPay Contract');
    console.log('-'.repeat(80));

    const MIZU_PAY_CONTRACT = '0x18042d3C48d7f09E863A5e18Ef3562E4827638aA'; // Updated contract (uses bytes32 sessionId)
    
    const url2 = new URL(ETHERSCAN_API_BASE);
    url2.searchParams.append('apikey', ETHERSCAN_API_KEY);
    url2.searchParams.append('chainid', CHAIN_ID.toString());
    url2.searchParams.append('module', 'account');
    url2.searchParams.append('action', 'tokentx');
    url2.searchParams.append('contractaddress', TOKEN_CONTRACT);
    url2.searchParams.append('address', MIZU_PAY_CONTRACT);
    url2.searchParams.append('sort', 'desc');

    console.log(`\n📡 Request URL:`);
    console.log(url2.toString());

    const response2 = await fetch(url2.toString());
    const data2 = await response2.json();

    console.log(`\n📥 Response Status: ${data2.status}`);
    console.log(`📥 Response Message: ${data2.message || 'N/A'}`);

    if (data2.status === '1' && data2.result) {
      console.log(`\n✅ Success! Found ${data2.result.length} token transfer(s) to contract`);
      
      if (data2.result.length > 0) {
        console.log(`\n📋 First ${Math.min(5, data2.result.length)} transfer(s) TO contract:`);
        data2.result.slice(0, 5).forEach((tx, index) => {
          console.log(`\n  Transfer ${index + 1}:`);
          console.log(`    Hash: ${tx.hash}`);
          console.log(`    From: ${tx.from}`);
          console.log(`    To: ${tx.to}`);
          console.log(`    Value: ${tx.value} (${parseFloat(tx.value) / 1e18} cUSD)`);
          console.log(`    Block: ${tx.blockNumber}`);
          console.log(`    Timestamp: ${new Date(parseInt(tx.timeStamp) * 1000).toISOString()}`);
        });
      }
    } else {
      console.log(`\n⚠️  No results or error: ${data2.message || JSON.stringify(data2)}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ API TEST COMPLETE');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testEtherscanAPI();

