/**
 * Monitor and log transactions in real-time
 * 
 * This script monitors transactions and logs verification details to terminal
 * Run this while making payments from the frontend
 * 
 * Usage:
 *   node scripts/monitor-transactions.js [address]
 * 
 * Examples:
 *   # Monitor all transactions to MizuPay contract
 *   node scripts/monitor-transactions.js
 * 
 *   # Monitor transactions from a specific address
 *   node scripts/monitor-transactions.js 0x2D4575003f6017950C2f7a10aFb17bf2fBb648d2
 */

require('dotenv').config();
const { ethers } = require('ethers');

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
if (!ETHERSCAN_API_KEY) {
  console.error('Error: ETHERSCAN_API_KEY not found in environment variables');
  console.error('Please add ETHERSCAN_API_KEY to your .env file');
  process.exit(1);
}
const CHAIN_ID = 11142220; // Celo Sepolia
const TOKEN_CONTRACT = '0x967DBe52B9b4133B18A91bDC4F800063D205704A'; // MockCUSD
const MIZU_PAY_CONTRACT = '0x18042d3C48d7f09E863A5e18Ef3562E4827638aA'; // MizuPay contract (updated - uses bytes32 sessionId)

const ETHERSCAN_API_BASE = 'https://api.etherscan.io/v2/api';

// Track seen transactions to avoid duplicate logging
const seenTransactions = new Set();

/**
 * Convert wei to USD (assuming 18 decimals)
 */
function weiToUSD(wei) {
  return parseFloat(wei) / 1e18;
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

  const response = await fetch(url.toString());
  const data = await response.json();

  // Handle JSON-RPC responses (for proxy module)
  if (data.jsonrpc && data.result) {
    return { status: '1', result: data.result };
  }

  // Handle standard Etherscan API responses
  if (data.status !== '1' && data.status !== '0' && !data.result) {
    if (data.error) {
      throw new Error(`Etherscan API error: ${JSON.stringify(data.error)}`);
    }
    if (!data.result) {
      throw new Error(`Etherscan API error: ${JSON.stringify(data)}`);
    }
  }

  return data;
}

/**
 * Get recent token transfers
 */
async function getRecentTokenTransfers(address = null, limit = 10) {
  const params = {
    module: 'account',
    action: 'tokentx',
    contractaddress: TOKEN_CONTRACT,
    sort: 'desc',
    page: '1',
    offset: limit.toString()
  };

  if (address) {
    params.address = address;
  } else {
    // Monitor transfers TO the MizuPay contract
    params.address = MIZU_PAY_CONTRACT;
  }

  const data = await etherscanRequest(params);

  if (data.status === '0' || !data.result || data.result.length === 0) {
    return [];
  }

  return data.result;
}

/**
 * Get transaction receipt
 */
async function getTransactionReceipt(txHash) {
  const data = await etherscanRequest({
    module: 'proxy',
    action: 'eth_getTransactionReceipt',
    txhash: txHash
  });

  if (data.jsonrpc && data.result) {
    return data.result;
  }

  if (data.status !== '1' || !data.result) {
    return null;
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
 * Note: sessionId is now bytes32 (not string), so it's directly in topics[1]
 */
function decodePaymentReceivedEvent(logs, contractAddress) {
  const mizuPayLogs = logs.filter(log => 
    log.address && log.address.toLowerCase() === contractAddress.toLowerCase()
  );

  if (mizuPayLogs.length === 0) {
    return null;
  }

  const log = mizuPayLogs[0]; // Get first PaymentReceived event

  if (!log.topics || log.topics.length < 3) {
    return null;
  }

  const eventSignature = log.topics[0];
  const sessionIdBytes32 = log.topics[1]; // bytes32 sessionId (directly in topic, not hashed)
  const payerTopic = log.topics[2];
  
  // Decode payer address
  const payerAddress = '0x' + payerTopic.slice(-40).toLowerCase();
  
  // Decode bytes32 to string using ethers (same as ethers.decodeBytes32String)
  const sessionIdString = decodeBytes32String(sessionIdBytes32);
  
  // Decode amount and timestamp from data
  let amount = null;
  let timestamp = null;
  
  if (log.data && log.data.length >= 128) {
    const amountHex = '0x' + log.data.slice(2, 66);
    const timestampHex = '0x' + log.data.slice(66, 130);
    
    amount = BigInt(amountHex).toString();
    timestamp = parseInt(timestampHex, 16);
  }

  return {
    eventSignature,
    sessionIdBytes32,
    sessionIdString, // Decoded string if valid, null otherwise
    payerAddress,
    amount,
    timestamp,
    rawLog: log
  };
}

/**
 * Log transaction details
 * @param {Object} transfer - Token transfer data
 * @param {Object} receipt - Transaction receipt
 * @param {Object} eventData - Decoded PaymentReceived event data
 * @param {string} expectedSessionId - Optional expected sessionId to verify against
 */
function logTransaction(transfer, receipt, eventData, expectedSessionId = null) {
  console.log('\n' + '='.repeat(80));
  console.log('🔔 NEW TRANSACTION DETECTED');
  console.log('='.repeat(80));
  
  console.log(`\n📋 Transaction Details:`);
  console.log(`  Hash: ${transfer.hash}`);
  console.log(`  Block: ${transfer.blockNumber}`);
  console.log(`  Timestamp: ${new Date(parseInt(transfer.timeStamp) * 1000).toISOString()}`);
  console.log(`  From: ${transfer.from}`);
  console.log(`  To: ${transfer.to}`);
  console.log(`  Value: ${transfer.value} wei (${weiToUSD(transfer.value)} cUSD)`);
  
  if (receipt) {
    console.log(`\n📋 Transaction Receipt:`);
    console.log(`  Status: ${receipt.status === '0x1' ? '✅ Success' : '❌ Failed'}`);
    console.log(`  Gas Used: ${parseInt(receipt.gasUsed, 16)}`);
    console.log(`  Logs Count: ${receipt.logs ? receipt.logs.length : 0}`);
  }

  if (eventData) {
    console.log(`\n📋 PaymentReceived Event:`);
    console.log(`  Event Signature: ${eventData.eventSignature}`);
    console.log(`  SessionId (bytes32): ${eventData.sessionIdBytes32}`);
    if (eventData.sessionIdString) {
      console.log(`  SessionId (decoded): "${eventData.sessionIdString}"`);
      console.log(`  ✅ SessionId successfully decoded using ethers.decodeBytes32String()`);
    } else {
      console.log(`  SessionId (decoded): <failed to decode - not a valid encoded string>`);
    }
    console.log(`  Payer Address: ${eventData.payerAddress}`);
    console.log(`  Amount: ${eventData.amount} wei (${weiToUSD(eventData.amount)} cUSD)`);
    console.log(`  Timestamp: ${eventData.timestamp} (${new Date(eventData.timestamp * 1000).toISOString()})`);
    
    // Verify amount matches
    const transferAmount = transfer.value;
    if (eventData.amount === transferAmount) {
      console.log(`  ✅ Amount matches between transfer and event!`);
    } else {
      console.log(`  ⚠️  Amount mismatch:`);
      console.log(`     Transfer: ${transferAmount} wei`);
      console.log(`     Event: ${eventData.amount} wei`);
    }
    
    // Verify payer matches
    if (eventData.payerAddress.toLowerCase() === transfer.from.toLowerCase()) {
      console.log(`  ✅ Payer address matches!`);
    } else {
      console.log(`  ⚠️  Payer address mismatch:`);
      console.log(`     Transfer From: ${transfer.from}`);
      console.log(`     Event Payer: ${eventData.payerAddress}`);
    }
    
    // Verify sessionId if expected is provided
    if (expectedSessionId && eventData.sessionIdString) {
      console.log(`\n  🔍 SessionId Verification:`);
      console.log(`     Expected: "${expectedSessionId}"`);
      console.log(`     Actual (decoded): "${eventData.sessionIdString}"`);
      
      if (eventData.sessionIdString === expectedSessionId) {
        console.log(`     ✅ SessionId matches!`);
      } else {
        console.log(`     ❌ SessionId mismatch!`);
        // Also verify bytes32 encoding
        const expectedBytes32 = encodeBytes32String(expectedSessionId);
        if (eventData.sessionIdBytes32.toLowerCase() === expectedBytes32.toLowerCase()) {
          console.log(`     ⚠️  But bytes32 values match - decoding issue?`);
        }
      }
    }
  } else {
    console.log(`\n⚠️  No PaymentReceived event found in logs`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Process a transaction
 */
async function processTransaction(transfer) {
  // Skip if already processed
  if (seenTransactions.has(transfer.hash)) {
    return;
  }

  // Only process transfers TO MizuPay contract
  if (!transfer.to || transfer.to.toLowerCase() !== MIZU_PAY_CONTRACT.toLowerCase()) {
    return;
  }

  seenTransactions.add(transfer.hash);

  try {
    // Get transaction receipt
    const receipt = await getTransactionReceipt(transfer.hash);
    
    // Decode event logs
    let eventData = null;
    if (receipt && receipt.logs) {
      eventData = decodePaymentReceivedEvent(receipt.logs, MIZU_PAY_CONTRACT);
    }

    // Log everything
    logTransaction(transfer, receipt, eventData);
  } catch (error) {
    console.error(`\n❌ Error processing transaction ${transfer.hash}:`, error.message);
  }
}

/**
 * Monitor transactions
 */
async function monitorTransactions(address = null) {
  console.log('='.repeat(80));
  console.log('🔍 TRANSACTION MONITOR');
  console.log('='.repeat(80));
  console.log(`\nMonitoring token transfers...`);
  if (address) {
    console.log(`  Address: ${address}`);
  } else {
    console.log(`  Contract: ${MIZU_PAY_CONTRACT} (MizuPay)`);
  }
  console.log(`  Token: ${TOKEN_CONTRACT} (MockCUSD)`);
  console.log(`  Chain: Celo Sepolia (${CHAIN_ID})`);
  console.log(`\n⏳ Waiting for new transactions...`);
  console.log(`   (Press Ctrl+C to stop)\n`);

  let lastCheckedBlock = null;

  while (true) {
    try {
      // Get recent transfers
      const transfers = await getRecentTokenTransfers(address, 20);

      if (transfers.length > 0) {
        // Process transfers in reverse order (oldest first)
        const sortedTransfers = transfers.reverse();
        
        for (const transfer of sortedTransfers) {
          // Only process new transactions
          if (!seenTransactions.has(transfer.hash)) {
            await processTransaction(transfer);
          }
        }
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
    } catch (error) {
      console.error(`\n❌ Error in monitoring loop:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping monitor...');
  console.log(`   Processed ${seenTransactions.size} transaction(s)`);
  process.exit(0);
});

// Get address from command line args
const address = process.argv[2] || null;

// Start monitoring
monitorTransactions(address).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

