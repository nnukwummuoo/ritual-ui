'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // This component works for ALL users (authenticated and unauthenticated)
    // No authentication checks here - install prompt should be available to everyone
    
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running as standalone (installed PWA)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      
      // Check if running in standalone mode on iOS
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    };

    if (checkIfInstalled()) {
      console.log('[PWA Install] App already installed, not showing prompt');
      return;
    }

    // Check if user has dismissed the prompt recently (within 7 days)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        console.log('[PWA Install] Prompt dismissed recently, not showing');
        return; // Don't show if dismissed within last 7 days
      }
    }

    // Listen for the beforeinstallprompt event
    // This event fires for ALL users when the app is installable
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA Install] beforeinstallprompt event received');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show the prompt after a short delay (3 seconds) to let the page load
      setTimeout(() => {
        console.log('[PWA Install] Showing install prompt');
        setShowPrompt(true);
      }, 3000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA Install] App installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    // Add event listeners for all users
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: Check if service worker is registered (helps with installability)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('[PWA Install] Service worker registrations:', registrations.length);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowPrompt(false);
      setDeferredPrompt(null);
    } else {
      console.log('User dismissed the install prompt');
      // Store dismissal time
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] w-full pointer-events-none">
      {/* Banner at top of page */}
      <div className="bg-gradient-to-r from-[#00A86B] to-[#00A86B]/90 shadow-lg pointer-events-auto animate-in slide-in-from-top">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Icon and Text */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Install Mmeko App
                </h3>
                <p className="text-xs sm:text-sm text-white/90 truncate">
                  Get quick access, offline support, and faster loading times
                </p>
              </div>
            </div>

            {/* Right side - Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white/90 hover:text-white transition-colors whitespace-nowrap"
              >
                Later
              </button>
              <button
                onClick={handleInstallClick}
                className="px-4 py-1.5 text-xs sm:text-sm font-medium text-[#00A86B] bg-white rounded-lg hover:bg-white/90 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="ml-1 text-white/80 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

