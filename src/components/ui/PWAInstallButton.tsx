import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Info, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-none bg-text-primary px-4 py-2 text-sm font-medium text-background border border-text-primary hover:bg-background hover:text-text-primary transition-colors font-mono"
      >
        <Download className="w-4 h-4" />
        INSTALL APP
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-none border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover transition-colors font-mono"
        >
          <Info className="w-4 h-4" />
          INSTALL ON IOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-none border border-border bg-surface p-6 shadow-2xl relative">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-display uppercase tracking-widest text-text-primary">Install on iPhone</h3>
              <div className="mt-4 text-sm text-text-secondary space-y-3 font-sans">
                <p>1. Tap the <strong>Share</strong> button in Safari toolbar.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
