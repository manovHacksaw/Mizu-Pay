'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  onLogout?: () => void;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-6 h-6" />,
  },
  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: <Receipt className="w-6 h-6" />,
  },
  {
    name: 'Wallet',
    href: '/dashboard/wallet',
    icon: <Wallet className="w-6 h-6" />,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="w-6 h-6" />,
  },
];

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    if (!mounted) return;
    
    const root = document.documentElement;
    const currentTheme = resolvedTheme || theme || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set theme using next-themes
    setTheme(newTheme);
    
    // Also manually update the HTML class (same approach as ThemeToggle)
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  };

  const currentTheme = mounted ? (resolvedTheme || theme || 'light') : 'light';
  const isDark = currentTheme === 'dark';

  return (
    <aside className="fixed left-0 top-0 h-full w-70 flex flex-col z-40" style={{
      background: 'linear-gradient(180deg, #0066ff 0%, #0052cc 100%)',
      fontFamily: 'var(--font-poppins), sans-serif',
    }}>
      {/* Logo */}
      <div className="h-28 flex items-center justify-start px-6 border-b py-4 border-white/20">
        <div className="flex items-center relative">
          <img 
            src="/Mizu-logo.png" 
            alt="Mizu Pay" 
            className="w-32 h-32 object-contain rounded-lg p-2"
          />
          <span className="font-bold text-white text-xl -ml-8 relative z-10">Mizu Pay</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 py-8 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-4 px-6 py-4 rounded-xl text-base font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-white text-[#0066ff] shadow-lg shadow-blue-500/30'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      {onLogout && (
        <div className="px-6 py-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-base font-medium text-white  transition-all duration-200"
          >
            <LogOut className="w-6 h-6" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="px-6 py-6 border-t border-white/20">
        <div className="flex items-start justify-between px-6 py-4">
          <span className="flex items-center text-base font-medium text-white/80">
            {mounted && isDark ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </span>
          
          {/* Toggle Switch */}
          <button
            onClick={handleThemeToggle}
            className={`
              relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
              ${mounted && isDark ? 'bg-white/20' : 'bg-white/30'}
            `}
            role="switch"
            aria-checked={mounted && isDark}
            aria-label="Toggle theme"
          >
            <span
              className={`
                inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 shadow-lg
                ${mounted && isDark ? 'translate-x-8' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}

