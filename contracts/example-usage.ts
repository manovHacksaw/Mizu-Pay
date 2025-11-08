/**
 * Example usage of MizuPay contracts
 * This file shows how to interact with the contracts from your frontend
 */

import { createPublicClient, http, getContract, formatUnits, parseUnits, defineChain } from 'viem'

// Contract addresses (update after deployment)
const MOCK_CUSD_ADDRESS = '0x...' // Your MockCUSD contract address
const MIZU_PAY_ADDRESS = '0x...' // Your MizuPay contract address

// Celo Sepolia configuration
const celoSepolia = defineChain({
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/celo_sepolia'],
    },
  },
})

// MockCUSD ABI (minimal - add full ABI from Remix)
const mockCusdAbi = [
  {
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

// MizuPay ABI (minimal - add full ABI from Remix)
const mizuPayAbi = [
  {
    inputs: [
      { name: 'sessionId', type: 'string' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'payForSession',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'sessionId', type: 'string' }],
    name: 'getPaymentInfo',
    outputs: [
      { name: 'paid', type: 'bool' },
      { name: 'payer', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

/**
 * Example: Pay for a session
 */
export async function payForSession(
  walletClient: any,
  sessionId: string,
  amountUSD: number
) {
  const publicClient = createPublicClient({
    chain: celoSepolia,
    transport: http()
  })

  // Convert USD amount to wei (18 decimals)
  const amountWei = parseUnits(amountUSD.toString(), 18)

  // Get contract instances
  const mockCusd = getContract({
    address: MOCK_CUSD_ADDRESS as `0x${string}`,
    abi: mockCusdAbi,
    client: { public: publicClient, wallet: walletClient },
  })

  const mizuPay = getContract({
    address: MIZU_PAY_ADDRESS as `0x${string}`,
    abi: mizuPayAbi,
    client: { public: publicClient, wallet: walletClient },
  })

  try {
    // Step 1: Approve MizuPay to spend cUSD
    console.log('Approving cUSD...')
    const approveHash = await mockCusd.write.approve([
      MIZU_PAY_ADDRESS as `0x${string}`,
      amountWei
    ])
    
    await publicClient.waitForTransactionReceipt({ hash: approveHash })
    console.log('Approval confirmed:', approveHash)

    // Step 2: Pay for session
    console.log('Paying for session...')
    const payHash = await mizuPay.write.payForSession([sessionId, amountWei])
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: payHash })
    console.log('Payment confirmed:', payHash)

    // Extract transaction hash from receipt
    const txHash = receipt.transactionHash

    // Step 3: Call your backend API to record the payment
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        txHash,
        amountCrypto: amountUSD, // Already in USD equivalent
        token: 'cUSD',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to record payment in backend')
    }

    return { txHash, receipt }
  } catch (error) {
    console.error('Payment error:', error)
    throw error
  }
}

/**
 * Example: Check payment status
 */
export async function checkPaymentStatus(sessionId: string) {
  const publicClient = createPublicClient({
    chain: celoSepolia,
    transport: http()
  })

  const mizuPay = getContract({
    address: MIZU_PAY_ADDRESS as `0x${string}`,
    abi: mizuPayAbi,
    client: publicClient,
  })

  try {
    const [paid, payer, amount, timestamp] = await mizuPay.read.getPaymentInfo([sessionId])
    
    return {
      paid,
      payer,
      amount: formatUnits(amount, 18),
      timestamp: new Date(Number(timestamp) * 1000),
    }
  } catch (error) {
    console.error('Error checking payment:', error)
    throw error
  }
}

/**
 * Example: Get cUSD balance
 */
export async function getCusdBalance(walletAddress: string) {
  const publicClient = createPublicClient({
    chain: celoSepolia,
    transport: http()
  })

  const mockCusd = getContract({
    address: MOCK_CUSD_ADDRESS as `0x${string}`,
    abi: mockCusdAbi,
    client: publicClient,
  })

  try {
    const balance = await mockCusd.read.balanceOf([walletAddress as `0x${string}`])
    return formatUnits(balance, 18)
  } catch (error) {
    console.error('Error fetching balance:', error)
    throw error
  }
}

