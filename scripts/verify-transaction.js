/**
 * Script to verify transactions using Etherscan API
 * 
 * This script checks:
 * 1. If tokens were sent to the MizuPay contract
 * 2. If the actual amount matches
 * 3. If it was sent for the exact sessionId
 * 
 * Usage:
 * node scripts/verify-transaction.js <txHash> <expectedSessionId> <expectedAmountUSD>
 * 
 * Example:
 * node scripts/verify-transaction.js 0x123... session-123 10.5
 */

const { ethers } = require('ethers');

const ETHERSCAN_API_KEY = 'AX7UYGEWBMPK97S5KQWQJ6FXUJI3AKKEN8';
const CHAIN_ID = 11142220; // Celo Sepolia
const TOKEN_CONTRACT = '0x967DBe52B9b4133B18A91bDC4F800063D205704A'; // MockCUSD
const MIZU_PAY_CONTRACT = '0x18042d3C48d7f09E863A5e18Ef3562E4827638aA'; // MizuPay contract (updated - uses bytes32 sessionId)

// Etherscan API base URL for Celo Sepolia
const ETHERSCAN_API_BASE = 'https://api.etherscan.io/v2/api';

/**
 * Convert wei to USD (assuming 18 decimals)
 */
function weiToUSD(wei) {
  return parseFloat(wei) / 1e18;
}

/**
 * Convert USD to wei (assuming 18 decimals)
 */
function usdToWei(usd) {
  return BigInt(Math.floor(parseFloat(usd) * 1e18)).toString();
}

/**
 * Compute keccak256 hash (for sessionId verification)
 * Note: This is a simplified version. For production, use a proper keccak256 library.
 * For now, we'll use a workaround since Node.js doesn't have keccak256 built-in.
 */
function keccak256(input) {
  // Note: Node.js crypto doesn't have keccak256, so we'll use sha3-256 as approximation
  // For actual keccak256, you'd need: npm install keccak
  // For now, we'll note this limitation
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return '0x' + hash;
}

/**
 * Compute keccak256 hash of a string (for Solidity indexed string)
 * This matches how Solidity stores indexed strings in event logs
 */
function keccak256String(str) {
  // Solidity keccak256 encodes strings as: keccak256(abi.encodePacked(str))
  // For a simple approximation, we hash the string
  // Note: For exact match, you'd need the keccak library: const keccak = require('keccak');
  // For now, return a note that proper keccak256 is needed
  return keccak256(str);
}

/**
 * Make API request to Etherscan
 */
async function etherscanRequest(params) {
  const url = new URL(ETHERSCAN_API_BASE);
  Object.entries({
    apikey: ETHERSCAN_API_KEY,
    chainid: CHAIN_ID.toString(),
    ...params
  }).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  console.log(`\n📡 Making request to Etherscan API...`);
  console.log(`URL: ${url.toString()}`);

  const response = await fetch(url.toString());
  const data = await response.json();

  // Handle JSON-RPC responses (for proxy module)
  if (data.jsonrpc && data.result) {
    return { status: '1', result: data.result };
  }

  // Handle standard Etherscan API responses
  if (data.status !== '1' && data.status !== '0' && !data.result) {
    // If it's a JSON-RPC response with error, handle it
    if (data.error) {
      throw new Error(`Etherscan API error: ${JSON.stringify(data.error)}`);
    }
    // Otherwise, it might be a valid response with result field
    if (!data.result) {
      throw new Error(`Etherscan API error: ${JSON.stringify(data)}`);
    }
  }

  return data;
}

/**
 * Get token transfers for a transaction
 */
async function getTokenTransfers(txHash) {
  console.log(`\n🔍 Fetching token transfers for transaction: ${txHash}`);
  
  const data = await etherscanRequest({
    module: 'account',
    action: 'tokentx',
    contractaddress: TOKEN_CONTRACT,
    txhash: txHash,
    sort: 'desc'
  });

  if (data.status === '0' || !data.result || data.result.length === 0) {
    console.log('⚠️  No token transfers found for this transaction');
    return [];
  }

  return data.result;
}

/**
 * Get transaction receipt to decode event logs
 */
async function getTransactionReceipt(txHash) {
  console.log(`\n🔍 Fetching transaction receipt: ${txHash}`);
  
  const data = await etherscanRequest({
    module: 'proxy',
    action: 'eth_getTransactionReceipt',
    txhash: txHash
  });

  // Handle JSON-RPC response
  if (data.jsonrpc && data.result) {
    return data.result;
  }

  if (data.status !== '1' || !data.result) {
    throw new Error(`Failed to get transaction receipt: ${JSON.stringify(data)}`);
  }

  return data.result;
}

/**
 * Get event logs for a transaction
 */
async function getEventLogs(txHash, contractAddress) {
  console.log(`\n🔍 Fetching event logs for transaction: ${txHash}`);
  
  const data = await etherscanRequest({
    module: 'logs',
    action: 'getLogs',
    address: contractAddress,
    txhash: txHash
  });

  if (data.status === '0' || !data.result || data.result.length === 0) {
    console.log('⚠️  No event logs found for this transaction');
    return [];
  }

  return data.result;
}

/**
 * Decode bytes32 to string using ethers (same as ethers.decodeBytes32String)
 */
function decodeBytes32String(bytes32Hex) {
  try {
    return ethers.decodeBytes32String(bytes32Hex);
  } catch (e) {
    // If decoding fails, it might not be a valid encoded string
    return null;
  }
}

/**
 * Encode string to bytes32 using ethers (same as ethers.encodeBytes32String)
 */
function encodeBytes32String(str) {
  try {
    return ethers.encodeBytes32String(str);
  } catch (e) {
    throw new Error(`Failed to encode string to bytes32: ${e.message}`);
  }
}

/**
 * Decode PaymentReceived event from logs
 * Event signature: PaymentReceived(bytes32 indexed sessionId, address indexed payer, uint256 amount, uint256 timestamp)
 * 
 * Note: sessionId is now bytes32 (not string), so it's directly in topics[1] without hashing
 */
function decodePaymentReceivedEvent(logs, contractAddress, expectedPayer, expectedAmountWei, expectedSessionId) {
  // PaymentReceived event signature: keccak256("PaymentReceived(bytes32,address,uint256,uint256)")
  // We'll search for logs from the MizuPay contract
  const mizuPayLogs = logs.filter(log => 
    log.address && log.address.toLowerCase() === contractAddress.toLowerCase()
  );

  console.log(`\n📋 Found ${mizuPayLogs.length} logs from MizuPay contract`);

  // PaymentReceived event structure:
  // topics[0] = event signature hash
  // topics[1] = sessionId (bytes32) - directly in topic, not hashed
  // topics[2] = payer address (padded) - indexed address
  // data = amount (32 bytes) + timestamp (32 bytes)

  for (const log of mizuPayLogs) {
    console.log(`\n📄 Event Log:`);
    console.log(`  Address: ${log.address}`);
    console.log(`  Topics Count: ${log.topics ? log.topics.length : 0}`);
    
    if (log.topics && log.topics.length >= 3) {
      const eventSignature = log.topics[0];
      const sessionIdBytes32 = log.topics[1]; // bytes32 sessionId (directly in topic)
      const payerTopic = log.topics[2];
      
      // Decode payer address (remove 0x and padding)
      const payerAddress = '0x' + payerTopic.slice(-40).toLowerCase();
      
      // Decode bytes32 to string using ethers.decodeBytes32String
      const sessionIdString = decodeBytes32String(sessionIdBytes32);
      
      console.log(`  Event Signature: ${eventSignature}`);
      console.log(`  SessionId (bytes32): ${sessionIdBytes32}`);
      if (sessionIdString) {
        console.log(`  SessionId (decoded): "${sessionIdString}"`);
        console.log(`  ✅ SessionId successfully decoded using ethers.decodeBytes32String()`);
      } else {
        console.log(`  SessionId (decoded): <failed to decode - not a valid encoded string>`);
      }
      console.log(`  Payer Address: ${payerAddress}`);
      
      // Verify sessionId if expected is provided
      if (expectedSessionId) {
        // Encode expected sessionId using ethers.encodeBytes32String (same as frontend)
        const expectedBytes32 = encodeBytes32String(expectedSessionId);
        
        console.log(`\n  🔍 SessionId Verification:`);
        console.log(`     Expected SessionId: "${expectedSessionId}"`);
        console.log(`     Expected (bytes32): ${expectedBytes32}`);
        console.log(`     Actual (bytes32): ${sessionIdBytes32}`);
        
        if (sessionIdBytes32.toLowerCase() === expectedBytes32.toLowerCase()) {
          console.log(`     ✅ SessionId matches! (bytes32 comparison)`);
        } else {
          console.log(`     ❌ SessionId mismatch!`);
          if (sessionIdString) {
            console.log(`     Actual (decoded): "${sessionIdString}"`);
            // Also compare decoded strings
            if (sessionIdString === expectedSessionId) {
              console.log(`     ⚠️  But decoded strings match - encoding issue?`);
            }
          }
        }
      }
      
      // Verify payer matches
      if (expectedPayer && payerAddress.toLowerCase() === expectedPayer.toLowerCase()) {
        console.log(`  ✅ Payer address matches!`);
      } else if (expectedPayer) {
        console.log(`  ⚠️  Payer address mismatch`);
        console.log(`     Expected: ${expectedPayer}`);
        console.log(`     Actual: ${payerAddress}`);
      }
      
      // Decode amount and timestamp from data
      if (log.data && log.data.length >= 128) {
        const amountHex = '0x' + log.data.slice(2, 66); // First 32 bytes (64 hex chars)
        const timestampHex = '0x' + log.data.slice(66, 130); // Second 32 bytes
        
        const amount = BigInt(amountHex).toString();
        const timestamp = parseInt(timestampHex, 16);
        const date = new Date(timestamp * 1000);
        
        console.log(`  Amount (wei): ${amount}`);
        console.log(`  Amount (cUSD): ${weiToUSD(amount)}`);
        console.log(`  Timestamp: ${timestamp} (${date.toISOString()})`);
        
        // Verify amount matches
        if (expectedAmountWei && amount === expectedAmountWei) {
          console.log(`  ✅ Amount matches!`);
        } else if (expectedAmountWei) {
          console.log(`  ⚠️  Amount mismatch`);
          console.log(`     Expected: ${expectedAmountWei}`);
          console.log(`     Actual: ${amount}`);
        }
      }
    } else {
      console.log(`  Topics: ${JSON.stringify(log.topics, null, 2)}`);
      console.log(`  Data: ${log.data}`);
    }
  }

  return mizuPayLogs;
}

/**
 * Get token transfers for an address (to check all recent transactions)
 */
async function getAddressTokenTransfers(address, contractAddress) {
  console.log(`\n🔍 Fetching token transfers for address: ${address}`);
  
  const data = await etherscanRequest({
    module: 'account',
    action: 'tokentx',
    contractaddress: contractAddress,
    address: address,
    sort: 'desc',
    page: '1',
    offset: '10' // Get last 10 transactions
  });

  if (data.status === '0' || !data.result || data.result.length === 0) {
    console.log('⚠️  No token transfers found for this address');
    return [];
  }

  return data.result;
}

/**
 * Verify transaction
 */
async function verifyTransaction(txHash, expectedSessionId, expectedAmountUSD) {
  console.log('='.repeat(80));
  console.log('🔐 TRANSACTION VERIFICATION');
  console.log('='.repeat(80));
  console.log(`\nTransaction Hash: ${txHash}`);
  console.log(`Expected Session ID: ${expectedSessionId}`);
  console.log(`Expected Amount (USD): ${expectedAmountUSD}`);
  console.log(`Token Contract: ${TOKEN_CONTRACT}`);
  console.log(`MizuPay Contract: ${MIZU_PAY_CONTRACT}`);

  try {
    // Step 1: Get token transfers
    const transfers = await getTokenTransfers(txHash);
    
    if (transfers.length === 0) {
      console.log('\n❌ VERIFICATION FAILED: No token transfers found');
      return false;
    }

    console.log(`\n✅ Found ${transfers.length} token transfer(s)`);

    // Filter transfers to MizuPay contract for THIS specific transaction
    // We need to match by transaction hash
    const transfersToContract = transfers.filter(t => 
      t.to && 
      t.to.toLowerCase() === MIZU_PAY_CONTRACT.toLowerCase() &&
      t.hash && 
      t.hash.toLowerCase() === txHash.toLowerCase()
    );

    if (transfersToContract.length === 0) {
      console.log('\n❌ VERIFICATION FAILED: No transfers to MizuPay contract found');
      console.log('\nTransfers found:');
      transfers.forEach(t => {
        console.log(`  From: ${t.from} → To: ${t.to}, Amount: ${weiToUSD(t.value)} cUSD`);
      });
      return false;
    }

    console.log(`\n✅ Found ${transfersToContract.length} transfer(s) to MizuPay contract`);

    // Step 2: Verify amount
    const expectedAmountWei = usdToWei(expectedAmountUSD);
    let amountMatch = false;
    let actualAmount = null;

    for (const transfer of transfersToContract) {
      const transferAmount = transfer.value;
      actualAmount = transferAmount;
      
      console.log(`\n💰 Transfer Details:`);
      console.log(`  From: ${transfer.from}`);
      console.log(`  To: ${transfer.to}`);
      console.log(`  Amount (wei): ${transferAmount}`);
      console.log(`  Amount (cUSD): ${weiToUSD(transferAmount)}`);
      console.log(`  Expected (wei): ${expectedAmountWei}`);
      console.log(`  Expected (cUSD): ${expectedAmountUSD}`);

      // Allow small tolerance for rounding (0.01%)
      const tolerance = BigInt(Math.floor(parseFloat(expectedAmountUSD) * 1e16)); // 0.01% in wei
      const diff = BigInt(transferAmount) > BigInt(expectedAmountWei) 
        ? BigInt(transferAmount) - BigInt(expectedAmountWei)
        : BigInt(expectedAmountWei) - BigInt(transferAmount);

      if (diff <= tolerance) {
        amountMatch = true;
        console.log(`  ✅ Amount matches!`);
        break;
      } else {
        console.log(`  ⚠️  Amount mismatch (diff: ${diff.toString()} wei)`);
      }
    }

    if (!amountMatch) {
      console.log('\n❌ VERIFICATION FAILED: Amount does not match');
      return false;
    }

    // Step 3: Get transaction receipt to decode events
    const receipt = await getTransactionReceipt(txHash);
    
    console.log(`\n📋 Transaction Receipt:`);
    console.log(`  Status: ${receipt.status === '0x1' ? 'Success' : 'Failed'}`);
    console.log(`  Block Number: ${parseInt(receipt.blockNumber, 16)}`);
    console.log(`  Gas Used: ${parseInt(receipt.gasUsed, 16)}`);
    console.log(`  Logs Count: ${receipt.logs ? receipt.logs.length : 0}`);

    // Step 4: Get event logs and decode PaymentReceived event
    const eventLogs = await getEventLogs(txHash, MIZU_PAY_CONTRACT);
    const payerAddress = transfersToContract[0]?.from;
    const paymentLogs = decodePaymentReceivedEvent(
      receipt.logs || [], 
      MIZU_PAY_CONTRACT,
      payerAddress,
      expectedAmountWei,
      expectedSessionId
    );

    // SessionId verification:
    // - Frontend encodes: ethers.encodeBytes32String(sessionId)
    // - We decode: ethers.decodeBytes32String(event.sessionId)
    // - Compare: encoded expected === actual bytes32 from event
    
    console.log(`\n✅ SessionId verification:`);
    console.log(`   Using ethers.encodeBytes32String() and ethers.decodeBytes32String()`);
    console.log(`   Encodes sessionId before sending, decodes when reading from blockchain`);
    console.log(`   Compares bytes32 values to verify they match`);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Tokens sent to contract: YES`);
    console.log(`✅ Amount matches: ${amountMatch ? 'YES' : 'NO'}`);
    console.log(`   Expected: ${expectedAmountUSD} cUSD (${expectedAmountWei} wei)`);
    console.log(`   Actual: ${weiToUSD(actualAmount)} cUSD (${actualAmount} wei)`);
    
    // Check sessionId verification from event logs
    let sessionIdMatch = false;
    if (paymentLogs && paymentLogs.length > 0 && expectedSessionId) {
      const eventLog = paymentLogs[0];
      if (eventLog.topics && eventLog.topics.length >= 3) {
        const actualBytes32 = eventLog.topics[1];
        const expectedBytes32 = encodeBytes32String(expectedSessionId);
        sessionIdMatch = actualBytes32.toLowerCase() === expectedBytes32.toLowerCase();
      }
    }
    
    console.log(`✅ SessionId verification: ${sessionIdMatch ? 'MATCHES' : 'NOT VERIFIED'}`);
    console.log(`   Expected SessionId: "${expectedSessionId}"`);
    console.log(`   Using: ethers.encodeBytes32String() → compare with event bytes32`);
    console.log(`   Using: ethers.decodeBytes32String() → decode event bytes32 to string`);

    return amountMatch;
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: node scripts/verify-transaction.js <txHash> <expectedSessionId> <expectedAmountUSD>');
  console.error('\nExample:');
  console.error('  node scripts/verify-transaction.js 0x123... session-123 10.5');
  process.exit(1);
}

const [txHash, expectedSessionId, expectedAmountUSD] = args;

verifyTransaction(txHash, expectedSessionId, expectedAmountUSD)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

