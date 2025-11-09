'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { ThemeInit } from '@/components/ThemeInit';
import { CurrencySelectionModal } from '@/components/CurrencySelectionModal';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useCurrencyStore } from '@/lib/currencyStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, authenticated, logout, user } = usePrivy();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencyChecked, setCurrencyChecked] = useState(false);
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
        const response = await fetch(`/api/users/currency?email=${encodeURIComponent(user.email.address)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.defaultCurrency && (data.defaultCurrency === 'INR' || data.defaultCurrency === 'USD')) {
            setUserDefaultCurrency(data.defaultCurrency as 'INR' | 'USD');
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

  const handleCurrencySelect = async (currency: 'INR' | 'USD') => {
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
          setUserDefaultCurrency(currency);
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
      <div className="min-h-screen dashboard-page-bg">
        <Sidebar />
        <Topbar onLogout={handleLogout} />
        <main className="ml-64 mt-16 p-6">
          {children}
        </main>
      </div>
    </>
  );
}

