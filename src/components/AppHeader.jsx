import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import AppBranding from './AppBranding';
import DarkModeToggle from './DarkModeToggle';
import { useMediaQuery } from '../hooks/useMediaQuery';

/** Max width (px) below which the mobile header stacks actions under the title. */
export const MOBILE_STACKED_BREAKPOINT_PX = 420;

/** Inline SVG — door + arrow (logout), stroke style aligned with DarkModeToggle icons. */
export function LogoutDoorIcon({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function HamburgerIcon({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

/**
 * Main shell header: branding + theme, avatar, logout.
 * Desktop (md+): row layout; logout is icon-only (same control as stacked mobile).
 * Mobile: hamburger menu when there is room beside the title; otherwise a row of three controls below the title.
 */
export default function AppHeader({
  user,
  isDarkMode,
  setIsDarkMode,
  onLogout,
}) {
  const isMdUp = useMediaQuery('(min-width: 768px)');
  const [menuOpen, setMenuOpen] = useState(false);
  const [useStackedMobile, setUseStackedMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth > 0 && window.innerWidth <= MOBILE_STACKED_BREAKPOINT_PX
  );
  const mobileMeasureRef = useRef(null);
  const menuWrapRef = useRef(null);

  const displayName = user?.displayName || 'Usuário';
  const photoUrl = user?.photoURL;

  useEffect(() => {
    if (isMdUp) setMenuOpen(false);
  }, [isMdUp]);

  useEffect(() => {
    if (useStackedMobile) setMenuOpen(false);
  }, [useStackedMobile]);

  useLayoutEffect(() => {
    if (isMdUp) return undefined;

    const el = mobileMeasureRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width ?? 0;
      if (w === 0) return;
      setUseStackedMobile(w <= MOBILE_STACKED_BREAKPOINT_PX);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [isMdUp]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const logoutIconOnlyClass =
    'inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400';

  const desktopLogout = (
    <button type="button" onClick={onLogout} className={logoutIconOnlyClass} aria-label="Sair">
      <LogoutDoorIcon className="h-5 w-5 shrink-0" />
    </button>
  );

  const avatar = (
    <img
      src={photoUrl}
      alt={displayName}
      referrerPolicy="no-referrer"
      className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-600"
    />
  );

  return (
    <header className="mb-8">
      {isMdUp ? (
        <div className="flex items-center justify-between gap-4">
          <AppBranding />
          <div className="flex shrink-0 items-center space-x-4">
            <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <div className="flex items-center space-x-2">
              {avatar}
              {desktopLogout}
            </div>
          </div>
        </div>
      ) : (
        <div ref={mobileMeasureRef}>
        {useStackedMobile ? (
          <div className="flex flex-col gap-3">
            <AppBranding compactTitle centered />
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
              {avatar}
              <button type="button" onClick={onLogout} className={logoutIconOnlyClass} aria-label="Sair">
                <LogoutDoorIcon className="h-5 w-5 shrink-0" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <AppBranding compactTitle />
            </div>
            <div className="relative shrink-0 pt-1" ref={menuWrapRef}>
              <button
                type="button"
                id="account-menu-button"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-controls="account-menu"
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700"
                aria-label="Menu da conta"
              >
                <HamburgerIcon className="h-6 w-6" />
              </button>
              {menuOpen && (
                <div
                  id="account-menu"
                  role="menu"
                  aria-labelledby="account-menu-button"
                  className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-xl border border-gray-200 bg-white py-3 shadow-lg dark:border-gray-600 dark:bg-gray-800"
                >
                  <div className="flex flex-col gap-3 px-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tema</span>
                      <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                    </div>
                    <div className="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                      <img
                        src={photoUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-600"
                      />
                      <span className="min-w-0 truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                        {displayName}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full justify-center border-t border-gray-100 pt-3 dark:border-gray-700"
                      aria-label="Sair"
                      onClick={() => {
                        closeMenu();
                        onLogout();
                      }}
                    >
                      <span className={logoutIconOnlyClass}>
                        <LogoutDoorIcon className="h-5 w-5 shrink-0" />
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      )}
    </header>
  );
}
