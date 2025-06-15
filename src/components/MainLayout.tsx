
import React, { useEffect, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import Breadcrumb from './Breadcrumb';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { useAppContext } from '@/contexts/AppContext';
import ApiKeyModal from './ApiKeyModal';
import { toast } from './ui/use-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { apiKeysConfigured } = useAppContext();
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  
  // Check if API keys are configured and show modal if not
  useEffect(() => {
    if (!apiKeysConfigured) {
      // Wait a bit before showing the modal to prevent it from rendering immediately on first load
      const timer = setTimeout(() => {
        setShowApiKeyModal(true);
        toast({
          title: "API Keys Required",
          description: "Configure your exchange API keys to enable full functionality.",
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [apiKeysConfigured]);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset className="pt-6">
          <div className="container mx-auto px-4">
            <Breadcrumb className="mb-6" />
            <ApiKeyModal open={showApiKeyModal} onOpenChange={setShowApiKeyModal} />
            <main>{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
