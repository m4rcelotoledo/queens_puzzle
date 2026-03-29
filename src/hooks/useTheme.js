import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference, mirroring index.html logic
    try {
      const cached = localStorage.getItem('darkMode');
      if (cached !== null) {
        return cached === 'true';
      }
    } catch (e) {
      // Ignore storage errors
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('darkMode', 'true'); } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('darkMode', 'false'); } catch (e) {}
    }
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode];
}
