'use client'

import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import {
  celo,
} from 'wagmi/chains'
import { defineChain } from 'viem'
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query"
import { http } from 'viem'
import { useState, useEffect } from 'react'

// CELO Sepolia testnet configuration
const celoSepolia = defineChain({
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

const config = getDefaultConfig({
  appName: 'Mizu Pay',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [celoSepolia, celo], // Only CELO Sepolia and CELO mainnet
})

const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading wallet provider...</div>
      </div>
    )
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
