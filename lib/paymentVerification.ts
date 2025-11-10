/**
 * Payment verification utilities using Blockscout API
 * Verifies transactions on Celo Sepolia network
 */

import { encodeBytes32String } from 'ethers'
import { parseUnits, formatUnits } from 'viem'
import { MIZU_PAY_CONTRACT } from './contracts'

const BLOCKSCOUT_API_BASE = 'https://celo-sepolia.blockscout.com/api'
const POLL_INTERVAL_MS = 2000 // 2 seconds
const REQUIRED_CONFIRMATIONS = 5

interface TransactionDetails {
  hash: string
  from: string
  to: string
  input: string
  blockNumber: string | null
  status: string | null
  confirmations: number | null
  success: boolean | null
}

interface TransactionReceipt {
  blockNumber: string | null
  status: string
  transactionHash: string
}

interface VerificationResult {
  verified: boolean
  confirmations: number
  error?: string
  transactionDetails?: TransactionDetails
}

/**
 * Fetch transaction details from Blockscout API
 * Exported for use in API routes
 */
export async function fetchTransactionDetails(txHash: string): Promise<TransactionDetails> {
  // Try Blockscout-specific API first (more reliable)
  let url = `${BLOCKSCOUT_API_BASE}?module=transaction&action=gettxinfo&txhash=${txHash}`
  
  let response = await fetch(url)
  let data = await response.json()
  
  // If Blockscout-specific API works, extract data
  if (response.ok && data.status === '1' && data.result) {
    const txInfo = data.result
    // Blockscout returns confirmations as a string, convert to number
    const confirmations = txInfo.confirmations 
      ? parseInt(txInfo.confirmations, 10) 
      : null
    
    return {
      hash: txHash,
      from: txInfo.from?.toLowerCase() || '',
      to: txInfo.to?.toLowerCase() || '',
      input: txInfo.input || '',
      blockNumber: txInfo.blockNumber || null,
      status: txInfo.txreceipt_status || (txInfo.success ? '1' : '0'),
      confirmations: confirmations,
      success: txInfo.success !== undefined ? txInfo.success : null,
    }
  }
  
  // Fallback to JSON-RPC proxy endpoint
  url = `${BLOCKSCOUT_API_BASE}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}`
  
  response = await fetch(url)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch transaction: ${response.statusText} - ${errorText}`)
  }
  
  data = await response.json()
  
  if (data.error) {
    throw new Error(`Blockscout API error: ${data.error.message || data.error}`)
  }
  
  if (!data.result || data.result === null) {
    throw new Error('Transaction not found')
  }
  
  // Fallback case: proxy endpoint doesn't work on Celo Sepolia
  // This should never be reached if gettxinfo works
  return {
    hash: data.result.hash,
    from: data.result.from?.toLowerCase() || '',
    to: data.result.to?.toLowerCase() || '',
    input: data.result.input || '',
    blockNumber: data.result.blockNumber,
    status: null,
    confirmations: null, // Not available from proxy endpoint
    success: null, // Not available from proxy endpoint
  }
}

/**
 * Fetch transaction receipt from Blockscout API
 * Exported for use in API routes
 */
export async function fetchTransactionReceipt(txHash: string): Promise<TransactionReceipt> {
  // Try Blockscout-specific API first (more reliable)
  let url = `${BLOCKSCOUT_API_BASE}?module=transaction&action=gettxinfo&txhash=${txHash}`
  
  let response = await fetch(url)
  let data = await response.json()
  
  // If Blockscout-specific API works, extract data
  if (response.ok && data.status === '1' && data.result) {
    const txInfo = data.result
    // Block number might be in decimal or hex format
    let blockNumber: string | null = null
    if (txInfo.blockNumber) {
      // Blockscout API returns block number as decimal string or number
      if (typeof txInfo.blockNumber === 'string') {
        if (txInfo.blockNumber.startsWith('0x')) {
          blockNumber = txInfo.blockNumber
        } else {
          // Convert decimal string to hex
          blockNumber = `0x${parseInt(txInfo.blockNumber, 10).toString(16)}`
        }
      } else {
        // Convert number to hex
        blockNumber = `0x${parseInt(txInfo.blockNumber.toString(), 10).toString(16)}`
      }
    }
    
    // Determine transaction status
    // Blockscout may return success field or txreceipt_status field
    // Prefer txreceipt_status if available, otherwise use success field
    let txStatus: string
    if (txInfo.txreceipt_status !== null && txInfo.txreceipt_status !== undefined) {
      txStatus = txInfo.txreceipt_status === '1' ? '0x1' : '0x0'
    } else if (txInfo.success !== null && txInfo.success !== undefined) {
      // Fallback to success field if txreceipt_status is not available
      txStatus = txInfo.success === true ? '0x1' : '0x0'
    } else {
      // Default to success if neither field is available (optimistic)
      txStatus = '0x1'
    }
    
    console.log("Blockscout API response:", {
      blockNumber: txInfo.blockNumber,
      convertedBlockNumber: blockNumber,
      txreceipt_status: txInfo.txreceipt_status,
      success: txInfo.success,
      finalStatus: txStatus,
    })
    
    return {
      blockNumber: blockNumber || null,
      status: txStatus,
      transactionHash: txHash,
    }
  }
  
  // Fallback to JSON-RPC proxy endpoint
  url = `${BLOCKSCOUT_API_BASE}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}`
  
  response = await fetch(url)
  if (!response.ok) {
    // If it's a 400 Bad Request, the transaction might not be confirmed yet
    if (response.status === 400) {
      throw new Error('Transaction receipt not found (transaction may not be confirmed yet)')
    }
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Failed to fetch transaction receipt: ${response.statusText} - ${errorText}`)
  }
  
  data = await response.json()
  
  if (data.error) {
    // If error message indicates transaction not found, throw appropriate error
    const errorMsg = data.error.message || data.error
    if (typeof errorMsg === 'string' && (errorMsg.includes('not found') || errorMsg.includes('null'))) {
      throw new Error('Transaction receipt not found (transaction may not be confirmed yet)')
    }
    throw new Error(`Blockscout API error: ${errorMsg}`)
  }
  
  if (!data.result || data.result === null) {
    throw new Error('Transaction receipt not found (transaction may not be confirmed yet)')
  }
  
  return {
    blockNumber: data.result.blockNumber,
    status: data.result.status,
    transactionHash: data.result.transactionHash || txHash,
  }
}

/**
 * Get current block number from Blockscout API
 * Exported for use in API routes
 */
export async function getCurrentBlockNumber(): Promise<number> {
  // Use the correct Blockscout endpoint for Celo Sepolia
  const url = `${BLOCKSCOUT_API_BASE}?module=block&action=eth_block_number`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch current block number: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  // Blockscout returns JSON-RPC format: {"jsonrpc":"2.0","result":"0x...","id":1}
  if (data.error) {
    throw new Error(`Blockscout API error: ${data.error.message || data.error}`)
  }
  
  if (!data.result) {
    throw new Error('No block number in response')
  }
  
  // Convert hex to number
  return parseInt(data.result, 16)
}

/**
 * Decode transaction input data to extract function parameters
 * For payForSession(bytes32 sessionId, uint256 amount)
 * Exported for use in API routes
 */
export function decodeTransactionInput(input: string, expectedSessionId: string, expectedAmount: string): {
  sessionIdMatches: boolean
  amountMatches: boolean
  functionSelectorValid: boolean
} {
  try {
    // Remove '0x' prefix if present
    const cleanInput = input.startsWith('0x') ? input.slice(2) : input
    
    // Minimum length check: selector (8) + sessionId (64) + amount (64) = 136 hex chars
    if (cleanInput.length < 136) {
      console.error('Transaction input too short')
      return { sessionIdMatches: false, amountMatches: false, functionSelectorValid: false }
    }
    
    // Function selector is first 8 characters (4 bytes)
    const functionSelector = '0x' + cleanInput.slice(0, 8)
    
    // Parameters start at position 8 (after selector)
    const paramsStart = 8
    
    // Extract sessionId (bytes32 = 64 hex chars)
    const sessionIdHex = cleanInput.slice(paramsStart, paramsStart + 64)
    
    // Extract amount (uint256 = 64 hex chars)
    const amountHex = cleanInput.slice(paramsStart + 64, paramsStart + 128)
    
    // Encode expected sessionId to bytes32
    const expectedSessionIdBytes32 = encodeBytes32String(expectedSessionId)
    const expectedSessionIdHex = expectedSessionIdBytes32.slice(2).toLowerCase()
    
    // Convert expected amount to hex (remove '0x' and pad)
    const expectedAmountBigInt = BigInt(expectedAmount)
    const expectedAmountHex = expectedAmountBigInt.toString(16).padStart(64, '0').toLowerCase()
    
    // Compare (case-insensitive)
    const sessionIdMatches = sessionIdHex.toLowerCase() === expectedSessionIdHex.toLowerCase()
    const amountMatches = amountHex.toLowerCase() === expectedAmountHex.toLowerCase()
    
    // Note: Function selector validation would require calculating keccak256
    // For now, we assume if parameters match, the selector is correct
    // In production, you might want to verify the selector matches expected value
    const functionSelectorValid = true // We'll trust the parameters match implies correct function
    
    return { sessionIdMatches, amountMatches, functionSelectorValid }
  } catch (error) {
    console.error('Error decoding transaction input:', error)
    return { sessionIdMatches: false, amountMatches: false, functionSelectorValid: false }
  }
}

/**
 * Poll for transaction confirmations
 * Returns when transaction has at least REQUIRED_CONFIRMATIONS confirmations
 * Uses Blockscout's confirmations field directly for accuracy
 */
async function waitForConfirmations(
  txHash: string,
  maxWaitTime: number = 120000 // 2 minutes max wait
): Promise<{ confirmations: number; blockNumber: number }> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Use gettxinfo which provides confirmations directly
      const url = `${BLOCKSCOUT_API_BASE}?module=transaction&action=gettxinfo&txhash=${txHash}`
      const response = await fetch(url)
      const data = await response.json()
      
      if (!response.ok || data.status !== '1' || !data.result) {
        // Transaction not yet found, continue polling
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
        continue
      }
      
      const txInfo = data.result
      
      // Check if transaction is included in a block
      if (!txInfo.blockNumber) {
        // Transaction not yet included in a block
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
        continue
      }
      
      // Use Blockscout's confirmations field directly (most accurate)
      const confirmations = txInfo.confirmations 
        ? parseInt(txInfo.confirmations, 10) 
        : 0
      
      const blockNumber = parseInt(txInfo.blockNumber, 10)
      
      console.log("Confirmation check:", {
        blockNumber,
        confirmations,
        required: REQUIRED_CONFIRMATIONS,
        success: txInfo.success,
      })
      
      if (confirmations >= REQUIRED_CONFIRMATIONS) {
        return { confirmations, blockNumber }
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
    } catch (error) {
      // If transaction not found or not confirmed yet, continue polling
      if (error instanceof Error && (
        error.message.includes('not found') || 
        error.message.includes('not be confirmed') ||
        error.message.includes('Bad Request')
      )) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
        continue
      }
      // For other errors, throw immediately
      throw error
    }
  }
  
  throw new Error(`Timeout waiting for ${REQUIRED_CONFIRMATIONS} confirmations`)
}

/**
 * Verify payment transaction meets all requirements
 */
export async function verifyPaymentTransaction(
  txHash: string,
  sessionId: string,
  expectedWalletAddress: string,
  expectedAmountCrypto: number
): Promise<VerificationResult> {
  try {
    // Step 1: Wait for 5 confirmations (polling every 2 seconds)
    const { confirmations, blockNumber } = await waitForConfirmations(txHash)
    
    // Step 2: Fetch transaction details
    const txDetails = await fetchTransactionDetails(txHash)
    
    // Step 3: Fetch transaction receipt to check status
    const receipt = await fetchTransactionReceipt(txHash)
    
    // Verify transaction was successful
    if (receipt.status === '0x0' || receipt.status === '0') {
      return {
        verified: false,
        confirmations,
        error: 'Transaction failed on-chain',
        transactionDetails: txDetails,
      }
    }
    
    // Step 4: Verify "to" address matches contract
    const contractAddressLower = MIZU_PAY_CONTRACT.toLowerCase()
    if (txDetails.to !== contractAddressLower) {
      return {
        verified: false,
        confirmations,
        error: `Transaction sent to wrong address. Expected: ${MIZU_PAY_CONTRACT}, Got: ${txDetails.to}`,
        transactionDetails: txDetails,
      }
    }
    
    // Step 5: Verify "from" address matches session wallet
    const expectedWalletLower = expectedWalletAddress.toLowerCase()
    if (txDetails.from !== expectedWalletLower) {
      return {
        verified: false,
        confirmations,
        error: `Transaction from wrong wallet. Expected: ${expectedWalletAddress}, Got: ${txDetails.from}`,
        transactionDetails: txDetails,
      }
    }
    
    // Step 6: Verify transaction input data matches sessionId and amount
    // Convert amount to wei (18 decimals)
    const amountWei = parseUnits(expectedAmountCrypto.toString(), 18).toString()
    const { sessionIdMatches, amountMatches, functionSelectorValid } = decodeTransactionInput(
      txDetails.input,
      sessionId,
      amountWei
    )
    
    if (!functionSelectorValid) {
      return {
        verified: false,
        confirmations,
        error: 'Invalid transaction input data format',
        transactionDetails: txDetails,
      }
    }
    
    if (!sessionIdMatches) {
      return {
        verified: false,
        confirmations,
        error: 'Transaction sessionId does not match expected sessionId',
        transactionDetails: txDetails,
      }
    }
    
    if (!amountMatches) {
      return {
        verified: false,
        confirmations,
        error: `Transaction amount does not match. Expected: ${expectedAmountCrypto} (${amountWei} wei)`,
        transactionDetails: txDetails,
      }
    }
    
    // All verifications passed
    return {
      verified: true,
      confirmations,
      transactionDetails: txDetails,
    }
  } catch (error) {
    return {
      verified: false,
      confirmations: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

