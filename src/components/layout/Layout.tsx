import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { PWAInstallButton } from '../ui/PWAInstallButton';
import { AudioPillPlayer } from '../audio/AudioPillPlayer';
import { initBackgroundPrefetch } from '../../lib/prefetchManager';

export const Layout: React.FC = () => {
  const { pathname } = useLocation();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Scroll to top whenever navigating to a new route
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    // Initiate unified background prefetch across Supabase tables
    initBackgroundPrefetch();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col md:flex-row max-w-7xl mx-auto selection:bg-accent selection:text-white">
      {/* Desktop Sidebar (Optional, scales from mobile layout) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border h-screen sticky top-0 p-8 pt-12">
        <h1 className="text-4xl font-display tracking-widest uppercase mb-12">Sorside</h1>
        <nav className="flex-1">
          <ul className="space-y-6">
            {['Home', 'Discography', 'The Side', 'Frequency', 'About'].map((label) => {
              const path = label === 'Home' ? '/' : `/${label.toLowerCase().replace(' ', '-')}`;
              return (
                <li key={path}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `font-mono text-sm tracking-widest uppercase transition-colors ${
                        isActive
                          ? 'text-text-primary font-semibold'
                          : 'text-text-secondary hover:text-text-primary'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto">
          <PWAInstallButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative pb-14 md:pb-0">
        {!isOnline && (
          <div className="bg-accent text-white text-xs font-mono py-1 px-4 text-center">
            OFFLINE MODE
          </div>
        )}

        <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-12 relative">
          <Outlet />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Navigation />
        </div>

        {/* Global Persistent Floating Audio Pill */}
        <AudioPillPlayer />
      </main>
    </div>
  );
};

