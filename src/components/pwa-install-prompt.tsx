"use client";

import { useState, useEffect } from "react";

export function PwaInstallPrompt() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker only for the App portion
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }

    // Check if app is already installed
    if (typeof window !== "undefined") {
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
      setIsStandalone(isStandaloneMode);

      if (!isStandaloneMode) {
        // Detect OS
        const ua = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(ua);
        const android = /android/.test(ua);
        
        setIsIOS(ios);
        setIsAndroid(android);

        // Check Local Storage
        const closed = localStorage.getItem("pwa-prompt-closed");
        if (!closed) {
          // Add a small delay so it doesn't pop up immediately
          const timer = setTimeout(() => setShowPrompt(true), 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Listen for Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const closePrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-closed", "true");
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  // If we are not on iOS and don't have deferredPrompt (meaning it's desktop or prompt failed to fire), we might not want to show it.
  // We'll show it for Android if deferredPrompt is ready, and for iOS specifically.
  if (!isIOS && !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-olive/20 p-5 w-full max-w-sm mx-auto flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-terracotta rounded-xl shadow-inner flex items-center justify-center text-white shrink-0 font-bold text-lg">
              MD
            </div>
            <div>
              <h3 className="font-semibold text-text text-sm">Instalează Aplicația</h3>
              <p className="text-xs text-text/70 mt-0.5 leading-snug">
                Pentru o experiență mai rapidă, instalează Companion App-ul pe telefonul tău.
              </p>
            </div>
          </div>
          <button 
            onClick={closePrompt}
            className="text-text/40 hover:text-text p-1 shrink-0 bg-transparent rounded-full"
            aria-label="Închide sugestia de instalare"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {isIOS && (
          <div className="bg-olive/10 rounded-xl p-3 mt-1 space-y-2 text-xs text-text/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-terracotta">1.</span> Apasă iconița de <strong>Share</strong> din Safari 
              <span className="inline-block mx-1 align-middle opacity-70">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-terracotta">2.</span> Alege <strong>Add to Home Screen</strong>
              <span className="inline-block align-middle ml-1 bg-black/5 p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              </span>
            </div>
          </div>
        )}

        {!isIOS && deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="w-full mt-1 bg-terracotta hover:bg-terracotta/90 text-white transition-colors duration-200 py-2.5 rounded-xl font-medium text-sm shadow-md"
          >
            Instalează pe Android
          </button>
        )}
      </div>
    </div>
  );
}
