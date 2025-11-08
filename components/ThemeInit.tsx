'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

// This component ensures the theme is properly initialized
export function ThemeInit() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Ensure theme is initialized correctly
    if (!theme) {
      setTheme('light');
    }
    
    // Ensure HTML element has correct class
    // Note: next-themes already handles this, but we ensure consistency
    const htmlEl = document.documentElement;
    if (theme === 'dark') {
      htmlEl.classList.add('dark');
      htmlEl.classList.remove('light');
    } else {
      htmlEl.classList.remove('dark');
      if (theme === 'light') {
        htmlEl.classList.add('light');
      }
    }
  }, [theme, setTheme, mounted]);

  // Don't render anything during SSR to avoid hydration mismatches
  if (!mounted) {
    return null;
  }

  return null;
}

