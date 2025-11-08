/**
 * Contract addresses and configuration for Mizu Pay
 * Deployed on Celo Sepolia testnet
 */

// Contract addresses
export const MOCK_CUSD_ADDRESS = '0x967DBe52B9b4133B18A91bDC4F800063D205704A' as `0x${string}`
export const MIZU_PAY_CONTRACT = '0x34C5A617e32c84BC9A54c862723FA5538f42F221' as `0x${string}`

// Contract ABIs
import MockCUSD_ABI from './abis/MockCUSD.json'
import MizuPay_ABI from './abis/MizuPay.json'

export const MockCUSD_ABI_typed = MockCUSD_ABI as const
export const MizuPay_ABI_typed = MizuPay_ABI as const

// Network configuration
export const CELO_SEPOLIA_CHAIN_ID = 11142220
export const CELO_SEPOLIA_RPC = 'https://rpc.ankr.com/celo_sepolia'

