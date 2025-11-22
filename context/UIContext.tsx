
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ToastMessage, ToastType, ToastContainer } from '../components/Toast';

interface UIContextType {
  showToast: (message: string, type?: ToastType) => void;
  isOffline: boolean;
  installPrompt: any;
  setInstallPrompt: (e: any) => void;
  promptInstall: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
        setIsOffline(true);
        showToast("You are currently offline. AI features will be limited.", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const closeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const promptInstall = () => {
      if (installPrompt) {
          installPrompt.prompt();
          installPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                  setInstallPrompt(null);
              }
          });
      }
  };

  return (
    <UIContext.Provider value={{ showToast, isOffline, installPrompt, setInstallPrompt, promptInstall }}>
      {children}
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
