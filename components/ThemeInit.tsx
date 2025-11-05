'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

// This component ensures the theme is properly initialized
export function ThemeInit() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Ensure theme is initialized correctly
    if (!theme) {
      setTheme('light');
    }
    
    // Ensure HTML element has correct class
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
  }, [theme, setTheme]);

  return null;
}

