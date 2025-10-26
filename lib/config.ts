import { defineChain } from 'viem'

// CELO Sepolia testnet configuration
export const celoSepolia = defineChain({
  id: 11142220, // Correct CELO Sepolia Chain ID
  name: 'CELO Sepolia Testnet',
  network: 'celo-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/celo_sepolia'],
    },
    public: {
      http: ['https://rpc.ankr.com/celo_sepolia'],
    },
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://sepolia.celoscan.io' },
  },
  testnet: true,
})

// CELO Mainnet configuration
export const celo = defineChain({
  id: 42220,
  name: 'CELO',
  network: 'celo',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/celo'],
    },
    public: {
      http: ['https://rpc.ankr.com/celo'],
    },
  },
  blockExplorers: {
    default: { name: 'CeloScan', url: 'https://celoscan.io' },
  },
})