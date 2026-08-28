import { useState, useEffect } from 'react';

let globalDeferredPrompt = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    window.__pwaInstallPrompt = e;
    listeners.forEach((cb) => cb(e));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    window.__pwaInstallPrompt = null;
    listeners.forEach((cb) => cb(null));
  });
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
    }

    const updatePrompt = (prompt) => {
      setDeferredPrompt(prompt);
    };

    listeners.add(updatePrompt);
    return () => listeners.delete(updatePrompt);
  }, []);

  const triggerInstall = async () => {
    const promptEvent = deferredPrompt || window.__pwaInstallPrompt || globalDeferredPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === 'accepted') {
          globalDeferredPrompt = null;
          window.__pwaInstallPrompt = null;
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
        setIsGuideOpen(true);
      }
    } else {
      // If browser doesn't support direct trigger or already prompted, open guide
      setIsGuideOpen(true);
    }
  };

  return {
    isInstallable: Boolean(deferredPrompt || window.__pwaInstallPrompt),
    isInstalled,
    isGuideOpen,
    setIsGuideOpen,
    triggerInstall
  };
};

export default usePWAInstall;
