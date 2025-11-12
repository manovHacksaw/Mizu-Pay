/**
 * Payment utilities for interacting with MizuPay smart contract
 */

import { 
  createPublicClient, 
  http, 
  getContract, 
  parseUnits, 
  formatUnits,
  defineChain,
  createWalletClient,
  custom,
  encodeFunctionData
} from 'viem'
import { encodeBytes32String } from 'ethers'
import { MOCK_CUSD_ADDRESS, MIZU_PAY_CONTRACT, MockCUSD_ABI_typed, MizuPay_ABI_typed } from './contracts'

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
  blockExplorers: {
    default: {
      name: 'Celo Sepolia Explorer',
      url: 'https://celo-sepolia.blockscout.com',
    },
  },
  testnet: true,
})

/**
 * Execute payment for a session
 * @param ethereumProvider - Ethereum provider from wallet
 * @param sessionId - Session ID to pay for
 * @param amountUSD - Amount in USD (will be converted to wei)
 * @param onStatusUpdate - Optional callback for status updates
 * @returns Transaction hash
 */
export async function executePayment(
  ethereumProvider: any,
  sessionId: string,
  amountUSD: number,
  onStatusUpdate?: (status: 'approving' | 'paying' | 'confirming') => void
): Promise<{ txHash: string; receipt: any }> {
  try {
    // Get account address from provider first
    const accounts = await ethereumProvider.request({ method: 'eth_accounts' })
    if (!accounts || accounts.length === 0) {
      throw new Error('No account found. Please connect your wallet.')
    }
    const account = accounts[0] as `0x${string}`

    // Check current chain and switch to Celo Sepolia if needed
    try {
      const currentChainId = await ethereumProvider.request({ method: 'eth_chainId' })
      const currentChainIdNumber = parseInt(currentChainId, 16)
      
      if (currentChainIdNumber !== celoSepolia.id) {
        
        try {
          // Try to switch to Celo Sepolia
          await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${celoSepolia.id.toString(16)}` }],
          })
        } catch (switchError: any) {
          // If chain doesn't exist, add it
          if (switchError.code === 4902 || switchError.code === -32603) {
            await ethereumProvider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${celoSepolia.id.toString(16)}`,
                  chainName: celoSepolia.name,
                  nativeCurrency: {
                    name: celoSepolia.nativeCurrency.name,
                    symbol: celoSepolia.nativeCurrency.symbol,
                    decimals: celoSepolia.nativeCurrency.decimals,
                  },
                  rpcUrls: celoSepolia.rpcUrls.default.http,
                  blockExplorerUrls: celoSepolia.blockExplorers?.default?.url ? [celoSepolia.blockExplorers.default.url] : undefined,
                },
              ],
            })
          } else {
            throw switchError
          }
        }
        
        // Wait a bit for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (chainError) {
      throw new Error('Failed to switch to Celo Sepolia network. Please switch manually in your wallet.')
    }

    // Create public client
    const publicClient = createPublicClient({
      chain: celoSepolia,
      transport: http()
    })

    // Create wallet client from provider with account
    const walletClient = createWalletClient({
      chain: celoSepolia,
      transport: custom(ethereumProvider),
      account: account,
    })

    // Convert USD amount to wei (18 decimals)
    const amountWei = parseUnits(amountUSD.toString(), 18)

    // Get contract instances with account
    const mockCusd = getContract({
      address: MOCK_CUSD_ADDRESS,
      abi: MockCUSD_ABI_typed,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    })

    const mizuPay = getContract({
      address: MIZU_PAY_CONTRACT,
      abi: MizuPay_ABI_typed,
      client: {
        public: publicClient,
        wallet: walletClient,
      },
    })

    // Step 1: Check current allowance
    const currentAllowance = await mockCusd.read.allowance([account, MIZU_PAY_CONTRACT]) as bigint
    
    // Step 2: Approve if needed (or if allowance is less than amount)
    if (currentAllowance < amountWei) {
      onStatusUpdate?.('approving')
      
      // Use viem's write method - Privy will show transaction details
      // Note: The amount (amountWei) is encoded in the transaction data
      const approveHash = await mockCusd.write.approve([MIZU_PAY_CONTRACT, amountWei], {
        account,
      })
      
      const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash })
      
      // Verify approval was successful
      if (approveReceipt.status !== 'success') {
        throw new Error('Approval transaction failed')
      }
      
      // Double-check allowance after approval
      const newAllowance = await mockCusd.read.allowance([account, MIZU_PAY_CONTRACT]) as bigint
      
      if (newAllowance < amountWei) {
        throw new Error('Approval amount insufficient after transaction')
      }
      
    } else {
    }

    // Step 3: Pay for session (this is the actual purchase transaction)
    onStatusUpdate?.('paying')
    
    // Encode sessionId to bytes32 using ethers.encodeBytes32String
    // This matches the encoding used in the scripts and ensures compatibility
    const sessionIdBytes32 = encodeBytes32String(sessionId) as `0x${string}`
    
    
    // Use viem's write method - Privy will show transaction details
    // Note: The amount (amountWei) is encoded in the transaction data
    const payHash = await mizuPay.write.payForSession([sessionIdBytes32, amountWei], {
      account,
    })
    
    onStatusUpdate?.('confirming')
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: payHash })
    
    // Verify payment was successful
    if (receipt.status !== 'success') {
      throw new Error(`Payment transaction failed. Transaction hash: ${payHash}`)
    }
    
    // Verify payment on-chain
    try {
      // Use encoded bytes32 sessionId for getPaymentInfo as well
      const result = await mizuPay.read.getPaymentInfo([sessionIdBytes32]) as [boolean, `0x${string}`, bigint, bigint]
      const [paid, payer, amount, timestamp] = result
      
      if (!paid) {
        throw new Error('Payment not recorded on-chain')
      }
      
      // Payment made (details)
      console.log('Payment made:', {
        txHash: payHash,
        sessionId,
        amountUSD,
        amountWei: amountWei.toString(),
        payer: payer,
        amount: amount.toString(),
        timestamp: timestamp.toString(),
      })
    } catch (verifyError) {
      // Don't throw - receipt confirms the transaction succeeded
    }

    return { txHash: payHash, receipt }
  } catch (error) {
    
    // Mark session as failed when payment fails
    try {
      await fetch('/api/payments/fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          error: error instanceof Error ? error.message : String(error)
        })
      })
    } catch (failError) {
      // Don't throw - the original error is more important
    }
    
    throw error
  }
}

/**
 * Check payment status on-chain
 * @param sessionId - Session ID to check
 * @returns Payment information
 */
export async function checkPaymentStatus(sessionId: string) {
  const publicClient = createPublicClient({
    chain: celoSepolia,
    transport: http()
  })

  const mizuPay = getContract({
    address: MIZU_PAY_CONTRACT,
    abi: MizuPay_ABI_typed,
    client: publicClient,
  })

  try {
    // Encode sessionId to bytes32 using ethers.encodeBytes32String
    const sessionIdBytes32 = encodeBytes32String(sessionId) as `0x${string}`
    
    const result = await mizuPay.read.getPaymentInfo([sessionIdBytes32]) as [boolean, `0x${string}`, bigint, bigint]
    const [paid, payer, amount, timestamp] = result
    
    return {
      paid,
      payer,
      amount: formatUnits(amount, 18),
      timestamp: new Date(Number(timestamp) * 1000),
    }
  } catch (error) {
    throw error
  }
}

/**
 * Get cUSD balance for an address
 * @param address - Wallet address
 * @returns Balance in cUSD (formatted)
 */
export async function getCusdBalance(address: string): Promise<string> {
  const publicClient = createPublicClient({
    chain: celoSepolia,
    transport: http()
  })

  const mockCusd = getContract({
    address: MOCK_CUSD_ADDRESS,
    abi: MockCUSD_ABI_typed,
    client: publicClient,
  })

  try {
    const balance = await mockCusd.read.balanceOf([address as `0x${string}`]) as bigint
    return formatUnits(balance, 18)
  } catch (error) {
    throw error
  }
}

