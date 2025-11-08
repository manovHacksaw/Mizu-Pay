'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import { defineChain } from 'viem';
import { useEffect } from 'react';

// Celo Sepolia chain configuration for Privy (must match viem chain definition)
const celoSepoliaChain = defineChain({
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
});

export default function Providers({children}: {children: React.ReactNode}) {
  // Suppress Privy's token price fetching errors for testnets
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Filter out Privy token price errors for Celo Sepolia
      const errorMessage = args[0]?.toString() || '';
      if (errorMessage.includes('Unable to fetch token price') && 
          errorMessage.includes('11142220')) {
        // Suppress this specific error - it's expected for testnets
        return;
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmhn7k3t700cikt0dgtyknj9q'}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || 'client-WY6SVRPj3reUY8iV2kN38yRYoypqDZvihZ6NDYptZyp'}
      config={{
        // Create embedded wallets for all users on login, even if they have linked external wallets
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users',
          }
        },
        // Enable Google login
        loginMethods: ['email', 'google'],
        // Add Celo Sepolia to supported chains
        supportedChains: [celoSepoliaChain],
        // Configure default chain to Celo Sepolia
        defaultChain: celoSepoliaChain,
        appearance: {
          theme: 'light',
          accentColor: '#0A4DFF',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}