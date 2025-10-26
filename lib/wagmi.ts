import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { celoSepolia, celo } from './config'

export const config = getDefaultConfig({
  appName: 'Mizu Pay',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [celoSepolia, celo],
  ssr: false,
})
