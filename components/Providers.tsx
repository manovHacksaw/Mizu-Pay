'use client';

import {PrivyProvider} from '@privy-io/react-auth';

export default function Providers({children}: {children: React.ReactNode}) {
  
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmhn7k3t700cikt0dgtyknj9q'}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || 'client-WY6SVRPj3reUY8iV2kN38yRYoypqDZvihZ6NDYptZyp'}
      config={{
        // Create embedded wallets for all users on login, even if they have linked external wallets
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users'
          }
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}