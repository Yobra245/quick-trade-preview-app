
import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlobalLoaderProps {
  message?: string;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
