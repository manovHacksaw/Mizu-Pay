'use client'

import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import {
  mainnet,
  celo,
  celoAlfajores,
} from 'wagmi/chains'
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query"
import { http } from 'viem'
import { useState, useEffect } from 'react'

const config = getDefaultConfig({
  appName: 'Mizu Pay',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [celo, celoAlfajores, mainnet],
  transports: {
    [celo.id]: http('https://celo-json-rpc.stakely.io'),
    [celoAlfajores.id]: http('https://alfajores-forno.celo-testnet.org'),
    [mainnet.id]: http(),
  },
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
