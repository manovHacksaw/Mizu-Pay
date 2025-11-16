'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { ThemeInit } from '@/components/ThemeInit';
import { CurrencySelectionModal } from '@/components/CurrencySelectionModal';
import { useRouter, usePathname } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/lib/currencyStore';
import { syncUserToDatabase, extractWalletData } from '@/lib/syncUser';
import { Poppins, Roboto } from 'next/font/google';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, authenticated, logout, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencyChecked, setCurrencyChecked] = useState(false);
  const [walletSynced, setWalletSynced] = useState(false);
  const { userDefaultCurrency, setUserDefaultCurrency, fetchExchangeRates } = useCurrencyStore();

  // Fetch exchange rates on mount
  useEffect(() => {
    fetchExchangeRates();
    // Set up interval to refresh rates every 60 seconds
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchExchangeRates]);

  // Check if user needs to select currency
  useEffect(() => {
    if (!ready || !authenticated || !user?.email?.address || currencyChecked) return;

    const checkUserCurrency = async () => {
      try {
        const response = await fetch(`/api/users/currency?email=${encodeURIComponent(user.email?.address || '')}`);
        if (response.ok) {
          const data = await response.json();
          if (data.defaultCurrency) {
            setUserDefaultCurrency(data.defaultCurrency);
            setCurrencyChecked(true);
          } else {
            // User hasn't set currency preference - show modal
            setShowCurrencyModal(true);
          }
        } else if (response.status === 404) {
          // User doesn't exist yet - they'll be created with sync, show modal
          setShowCurrencyModal(true);
        } else {
          setCurrencyChecked(true); // Don't block on error
        }
      } catch (error) {
        console.error('Error checking user currency:', error);
        setCurrencyChecked(true); // Don't block UI on error
      }
    };

    checkUserCurrency();
  }, [ready, authenticated, user?.email?.address, currencyChecked, setUserDefaultCurrency]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

  // Check for embedded wallet and sync to database (only redirect if not on wallet page)
  useEffect(() => {
    if (!ready || !authenticated || !user?.id || !walletsReady || walletSynced) return;
    // Don't redirect if already on wallet page - let wallet page handle it
    if (pathname === '/dashboard/wallet') {
      setWalletSynced(true);
      return;
    }

    const checkAndSyncWallet = async () => {
      // Wait a bit for Privy to potentially create the wallet
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Find embedded wallet
      const embeddedWallet = wallets?.find(w => 
        w.walletClientType === 'privy' || 
        w.walletClientType === 'embedded' ||
        w.connectorType === 'privy'
      );

      if (embeddedWallet?.address) {
        // User has embedded wallet - sync to database
        // Wrap in async IIFE to catch all errors silently
        (async () => {
          try {
            const walletData = extractWalletData(wallets || []);
            const activeWalletAddress = embeddedWallet.address;
            
            await syncUserToDatabase({
              privyUserId: user.id,
              email: user.email?.address || null,
              wallets: walletData,
              activeWalletAddress,
            });
            
            // Silently handle - no logging needed for expected errors
            setWalletSynced(true);
          } catch (error) {
            // Completely suppress all errors to prevent Next.js from showing them
            setWalletSynced(true); // Set to true to prevent retries
          }
        })().catch(() => {
          // Additional catch to prevent unhandled promise rejections
          setWalletSynced(true);
        });
      } else {
        // No embedded wallet found - redirect to wallet page
        router.push('/dashboard/wallet');
        setWalletSynced(true); // Set to true to prevent infinite redirects
      }
    };

    checkAndSyncWallet();
  }, [ready, authenticated, user?.id, wallets, walletsReady, walletSynced, pathname, router]);

  const handleCurrencySelect = async (currency: string) => {
    if (user?.email?.address) {
      try {
        const response = await fetch('/api/users/currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email.address,
            defaultCurrency: currency,
          }),
        });

        if (response.ok) {
          setUserDefaultCurrency(currency as any);
          setShowCurrencyModal(false);
          setCurrencyChecked(true);
        }
      } catch (error) {
        console.error('Error saving currency:', error);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!ready) {
    return (
      <div className="min-h-screen dashboard-page-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="dashboard-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <>
      <ThemeInit />
      <CurrencySelectionModal
        isOpen={showCurrencyModal}
        onSelect={handleCurrencySelect}
      />
      <div className={`min-h-screen dashboard-page-bg ${poppins.variable} ${roboto.variable}`} style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
        <Sidebar onLogout={handleLogout} />
     
        <main className="ml-72 p-6" style={{ fontFamily: 'var(--font-roboto), sans-serif' }}>
          {children}
        </main>
      </div>
    </>
  );
}

