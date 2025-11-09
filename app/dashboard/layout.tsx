'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { ThemeInit } from '@/components/ThemeInit';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/login');
    }
  }, [ready, authenticated, router]);

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

