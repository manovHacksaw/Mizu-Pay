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
  custom
} from 'viem'
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
        console.log(`Switching from chain ${currentChainIdNumber} to Celo Sepolia (${celoSepolia.id})...`)
        
        try {
          // Try to switch to Celo Sepolia
          await ethereumProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${celoSepolia.id.toString(16)}` }],
          })
          console.log('Successfully switched to Celo Sepolia')
        } catch (switchError: any) {
          // If chain doesn't exist, add it
          if (switchError.code === 4902 || switchError.code === -32603) {
            console.log('Celo Sepolia not found, adding chain...')
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
            console.log('Successfully added and switched to Celo Sepolia')
          } else {
            throw switchError
          }
        }
        
        // Wait a bit for the switch to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (chainError) {
      console.error('Error switching chain:', chainError)
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
    const currentAllowance = await mockCusd.read.allowance([account, MIZU_PAY_CONTRACT])
    
    // Step 2: Approve if needed (or if allowance is less than amount)
    if (currentAllowance < amountWei) {
      console.log('Step 1/2: Approving cUSD spending...')
      onStatusUpdate?.('approving')
      
      const approveHash = await mockCusd.write.approve([MIZU_PAY_CONTRACT, amountWei], {
        account,
      })
      
      console.log('Approval transaction sent:', approveHash)
      console.log('Waiting for approval confirmation...')
      const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash })
      console.log('Approval confirmed:', approveHash)
      
      // Verify approval was successful
      if (approveReceipt.status !== 'success') {
        throw new Error('Approval transaction failed')
      }
      
      // Double-check allowance after approval
      const newAllowance = await mockCusd.read.allowance([account, MIZU_PAY_CONTRACT])
      console.log('New allowance after approval:', newAllowance.toString())
      
      if (newAllowance < amountWei) {
        throw new Error('Approval amount insufficient after transaction')
      }
      
      console.log('✓ Approval completed successfully')
    } else {
      console.log('Sufficient allowance already exists:', currentAllowance.toString())
    }

    // Step 3: Pay for session (this is the actual purchase transaction)
    console.log('Step 2/2: Executing PAYMENT transaction...', { sessionId, amountWei: amountWei.toString() })
    onStatusUpdate?.('paying')
    
    const payHash = await mizuPay.write.payForSession([sessionId, amountWei], {
      account,
    })
    
    console.log('✓ Payment transaction sent:', payHash)
    console.log('Waiting for payment confirmation...')
    onStatusUpdate?.('confirming')
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: payHash })
    
    // Verify payment was successful
    if (receipt.status !== 'success') {
      throw new Error('Payment transaction failed')
    }
    
    console.log('Payment confirmed:', payHash)
    
    // Verify payment on-chain
    try {
      const [paid, payer, amount, timestamp] = await mizuPay.read.getPaymentInfo([sessionId])
      console.log('On-chain payment verification:', { paid, payer, amount: amount.toString() })
      
      if (!paid) {
        throw new Error('Payment not recorded on-chain')
      }
    } catch (verifyError) {
      console.warn('Could not verify payment on-chain:', verifyError)
      // Don't throw - receipt confirms the transaction succeeded
    }

    return { txHash: payHash, receipt }
  } catch (error) {
    console.error('Payment error:', error)
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
    const balance = await mockCusd.read.balanceOf([address as `0x${string}`])
    return formatUnits(balance, 18)
  } catch (error) {
    console.error('Error fetching balance:', error)
    throw error
  }
}

