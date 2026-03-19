import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Check iOS
    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check visit count and dismissal
    const visits = parseInt(localStorage.getItem('pwa-visits') || '0', 10) + 1;
    localStorage.setItem('pwa-visits', String(visits));

    const dismissedAt = localStorage.getItem('pwa-dismissed-at');
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const canShow = !dismissedAt || (Date.now() - parseInt(dismissedAt, 10)) > sevenDaysMs;

    if (visits >= 3 && canShow) {
      if (iOS) {
        setShowBanner(true);
      }
    }

    // Android / Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (visits >= 3 && canShow) setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-dismissed-at', String(Date.now()));
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-xl shadow-xl p-4">
        {isIOS ? (
          <div className="flex items-start gap-3">
            <div className="text-2xl">📲</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Install TrueTrucker on iOS</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tap the <Share className="h-3 w-3 inline" /> Share button below, then tap "Add to Home Screen"
              </p>
              <Button size="sm" variant="outline" className="mt-2" onClick={handleDismiss}>Got It ✓</Button>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="text-2xl">📲</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Install TrueTrucker</p>
              <p className="text-xs text-muted-foreground mt-1">Add to your home screen for faster access on the road</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="ghost" onClick={handleDismiss}>Not Now</Button>
                <Button size="sm" onClick={handleInstall}><Download className="h-3 w-3 mr-1" />Install App</Button>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground"><X className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
