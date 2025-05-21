
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export type Theme = 'dark' | 'light' | 'system';

interface ApiKeys {
  exchangeApiKey?: string;
  exchangeSecretKey?: string;
  dataProviderApiKey?: string;
}

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  apiKeys: ApiKeys;
  setApiKeys: (keys: ApiKeys) => void;
  apiKeysConfigured: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize theme from localStorage or default to system
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'system';
  });
  
  // Initialize API keys from localStorage
  const [apiKeys, setApiKeysState] = useState<ApiKeys>(() => {
    const savedKeys = localStorage.getItem('apiKeys');
    return savedKeys ? JSON.parse(savedKeys) : {};
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  // Check if API keys are configured
  const apiKeysConfigured = !!(apiKeys.exchangeApiKey && apiKeys.exchangeSecretKey);

  // Update localStorage when theme changes
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update document class for theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: "Theme updated",
      description: `Application theme set to ${newTheme}.`,
    });
  };

  // Update localStorage when API keys change
  const setApiKeys = (keys: ApiKeys) => {
    setApiKeysState(keys);
    localStorage.setItem('apiKeys', JSON.stringify(keys));
  };

  // Initialize theme based on system preference or saved preference
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save sidebar state when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <AppContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        apiKeys, 
        setApiKeys, 
        apiKeysConfigured,
        sidebarCollapsed,
        setSidebarCollapsed
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
