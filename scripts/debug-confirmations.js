/**
 * Debug script to test confirmation calculation
 * 
 * Usage:
 *   node scripts/debug-confirmations.js <txHash>
 * 
 * Example:
 *   node scripts/debug-confirmations.js 0x41c854ca68284028a5c757463628bfdd71000998b48204d339240c5efecf443e
 */

const BLOCKSCOUT_API_BASE = 'https://celo-sepolia.blockscout.com/api';
const REQUIRED_CONFIRMATIONS = 5;

async function debugConfirmations(txHash) {
  console.log('='.repeat(80));
  console.log('🔍 DEBUGGING CONFIRMATION CALCULATION');
  console.log('='.repeat(80));
  console.log(`\nTransaction Hash: ${txHash}\n`);

  // Test 1: Blockscout-specific API
  console.log('📡 Test 1: Blockscout-specific API (module=transaction&action=gettxinfo)');
  console.log('-'.repeat(80));
  try {
    const url1 = `${BLOCKSCOUT_API_BASE}?module=transaction&action=gettxinfo&txhash=${txHash}`;
    console.log(`URL: ${url1}`);
    
    const response1 = await fetch(url1);
    const data1 = await response1.json();
    
    console.log(`Response Status: ${response1.status}`);
    console.log(`Response OK: ${response1.ok}`);
    console.log(`Data Status: ${data1.status}`);
    console.log(`Has Result: ${!!data1.result}`);
    
    if (data1.result) {
      const txInfo = data1.result;
      console.log('\n📋 Transaction Info:');
      console.log(`  Block Number (raw): ${txInfo.blockNumber} (type: ${typeof txInfo.blockNumber})`);
      console.log(`  Block Number (stringified): ${JSON.stringify(txInfo.blockNumber)}`);
      console.log(`  Transaction Status: ${txInfo.txreceipt_status}`);
      console.log(`  From: ${txInfo.from}`);
      console.log(`  To: ${txInfo.to}`);
      
      // Try to parse block number
      let blockNumberParsed = null;
      if (txInfo.blockNumber) {
        if (typeof txInfo.blockNumber === 'string') {
          if (txInfo.blockNumber.startsWith('0x')) {
            blockNumberParsed = parseInt(txInfo.blockNumber, 16);
            console.log(`  Parsed as hex: ${blockNumberParsed}`);
          } else {
            blockNumberParsed = parseInt(txInfo.blockNumber, 10);
            console.log(`  Parsed as decimal: ${blockNumberParsed}`);
          }
        } else {
          blockNumberParsed = parseInt(txInfo.blockNumber.toString(), 10);
          console.log(`  Parsed as number: ${blockNumberParsed}`);
        }
      }
    } else {
      console.log('❌ No result in response');
      console.log('Full response:', JSON.stringify(data1, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: JSON-RPC Proxy API for receipt
  console.log('\n\n📡 Test 2: JSON-RPC Proxy API (module=proxy&action=eth_getTransactionReceipt)');
  console.log('-'.repeat(80));
  try {
    const url2 = `${BLOCKSCOUT_API_BASE}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}`;
    console.log(`URL: ${url2}`);
    
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    
    console.log(`Response Status: ${response2.status}`);
    console.log(`Response OK: ${response2.ok}`);
    
    if (data2.error) {
      console.log(`❌ API Error: ${JSON.stringify(data2.error)}`);
    }
    
    if (data2.result) {
      const receipt = data2.result;
      console.log('\n📋 Transaction Receipt:');
      console.log(`  Block Number (raw): ${receipt.blockNumber} (type: ${typeof receipt.blockNumber})`);
      console.log(`  Block Number (stringified): ${JSON.stringify(receipt.blockNumber)}`);
      console.log(`  Status: ${receipt.status}`);
      console.log(`  Transaction Hash: ${receipt.transactionHash}`);
      
      // Parse block number
      let blockNumberParsed = null;
      if (receipt.blockNumber) {
        if (typeof receipt.blockNumber === 'string') {
          if (receipt.blockNumber.startsWith('0x')) {
            blockNumberParsed = parseInt(receipt.blockNumber, 16);
            console.log(`  Parsed as hex: ${blockNumberParsed}`);
          } else {
            blockNumberParsed = parseInt(receipt.blockNumber, 10);
            console.log(`  Parsed as decimal: ${blockNumberParsed}`);
          }
        } else {
          blockNumberParsed = parseInt(receipt.blockNumber.toString(), 10);
          console.log(`  Parsed as number: ${blockNumberParsed}`);
        }
      }
    } else {
      console.log('❌ No result in response');
      console.log('Full response:', JSON.stringify(data2, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Get current block number (try different endpoints)
  console.log('\n\n📡 Test 3: Get Current Block Number');
  console.log('-'.repeat(80));
  
  // Try endpoint 1: module=block&action=eth_block_number
  console.log('\n  Method 1: module=block&action=eth_block_number');
  try {
    const url3a = `${BLOCKSCOUT_API_BASE}?module=block&action=eth_block_number`;
    console.log(`  URL: ${url3a}`);
    
    const response3a = await fetch(url3a);
    const data3a = await response3a.json();
    
    console.log(`  Response Status: ${response3a.status}`);
    console.log(`  Response OK: ${response3a.ok}`);
    console.log(`  Full Response: ${JSON.stringify(data3a)}`);
    
    if (data3a.result) {
      const currentBlockHex = data3a.result;
      const currentBlockNumber = parseInt(currentBlockHex, 16);
      console.log(`  ✅ Current Block (hex): ${currentBlockHex}`);
      console.log(`  ✅ Current Block (decimal): ${currentBlockNumber}`);
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
  
  // Try endpoint 2: module=block&action=getblocknobytime
  console.log('\n  Method 2: module=block&action=getblocknobytime');
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const url3b = `${BLOCKSCOUT_API_BASE}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before`;
    console.log(`  URL: ${url3b}`);
    
    const response3b = await fetch(url3b);
    const data3b = await response3b.json();
    
    console.log(`  Response Status: ${response3b.status}`);
    console.log(`  Response OK: ${response3b.ok}`);
    console.log(`  Full Response: ${JSON.stringify(data3b)}`);
    
    if (data3b.result && data3b.result.blockNumber) {
      const currentBlockDecimal = data3b.result.blockNumber;
      console.log(`  ✅ Current Block (decimal): ${currentBlockDecimal}`);
    }
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }

  // Test 4: Calculate confirmations using working endpoints
  console.log('\n\n📊 Test 4: Confirmation Calculation');
  console.log('-'.repeat(80));
  try {
    // Get transaction info (returns decimal block number)
    const txUrl = `${BLOCKSCOUT_API_BASE}?module=transaction&action=gettxinfo&txhash=${txHash}`;
    const txResponse = await fetch(txUrl);
    const txData = await txResponse.json();
    
    // Get current block (using working endpoint)
    const blockUrl = `${BLOCKSCOUT_API_BASE}?module=block&action=eth_block_number`;
    const blockResponse = await fetch(blockUrl);
    const blockData = await blockResponse.json();
    
    if (txData.result && txData.result.blockNumber && blockData.result) {
      const txBlockDecimal = txData.result.blockNumber; // Already decimal string
      const currentBlockHex = blockData.result; // Hex format
      
      const txBlockNumber = parseInt(txBlockDecimal, 10);
      const currentBlockNumber = parseInt(currentBlockHex, 16);
      const confirmations = currentBlockNumber - txBlockNumber;
      
      console.log(`  Transaction Block: ${txBlockDecimal} (decimal)`);
      console.log(`  Current Block: ${currentBlockHex} (${currentBlockNumber} decimal)`);
      console.log(`  Confirmations: ${confirmations}`);
      console.log(`  Required: ${REQUIRED_CONFIRMATIONS}`);
      console.log(`  ✅ Confirmed: ${confirmations >= REQUIRED_CONFIRMATIONS ? 'YES' : 'NO'}`);
      
      // Also check what Blockscout shows
      console.log(`\n  📋 Expected from Blockscout UI: ~21 confirmations`);
      console.log(`  📊 Our calculation: ${confirmations} confirmations`);
      if (Math.abs(confirmations - 21) > 2) {
        console.log(`  ⚠️  Discrepancy detected! Difference: ${Math.abs(confirmations - 21)} blocks`);
      }
    } else {
      console.log('❌ Cannot calculate - missing data');
      console.log(`  Transaction has blockNumber: ${!!txData.result?.blockNumber}`);
      console.log(`  Current block available: ${!!blockData.result}`);
      console.log(`  TX Data:`, JSON.stringify(txData, null, 2));
      console.log(`  Block Data:`, JSON.stringify(blockData, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

// Get txHash from command line
const txHash = process.argv[2];

if (!txHash) {
  console.error('❌ Please provide a transaction hash');
  console.log('Usage: node scripts/debug-confirmations.js <txHash>');
  process.exit(1);
}

debugConfirmations(txHash).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

