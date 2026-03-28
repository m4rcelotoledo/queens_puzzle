import React from 'react';

/**
 * Shows app version (from package.json at build time). Not used on the login screen.
 */
export default function AppFooter({ variant = 'default' }) {
  // Inlined at build via vite `define`; Jest sets process.env.VITE_APP_VERSION in setupTests.js
  const version = process.env.VITE_APP_VERSION ?? 'dev';
  const base =
    'py-2 px-4 text-center text-xs border-t transition-colors';
  const theme =
    variant === 'overlay'
      ? 'bg-black/70 text-gray-300 border-white/10'
      : 'bg-gray-100/95 dark:bg-gray-900/95 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700';

  return (
    <footer className={`${base} ${theme}`} role="contentinfo">
      <span className="font-mono">v{version}</span>
    </footer>
  );
}
