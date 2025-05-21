
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/components/ui/use-toast';
import { Key, KeyRound, Shield } from 'lucide-react';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onOpenChange }) => {
  const { apiKeys, setApiKeys } = useAppContext();
  const [formData, setFormData] = useState({
    exchangeApiKey: apiKeys.exchangeApiKey || '',
    exchangeSecretKey: apiKeys.exchangeSecretKey || '',
    dataProviderApiKey: apiKeys.dataProviderApiKey || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKeys(formData);
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been securely saved in your browser.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Configure API Keys
          </DialogTitle>
          <DialogDescription>
            Enter your exchange and data provider API keys to enable real-time trading and data features.
            Your keys are stored securely in your browser's local storage.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="exchangeApiKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Exchange API Key
            </Label>
            <Input
              id="exchangeApiKey"
              name="exchangeApiKey"
              placeholder="Enter your exchange API key"
              value={formData.exchangeApiKey}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="exchangeSecretKey" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Exchange Secret Key
            </Label>
            <Input
              id="exchangeSecretKey"
              name="exchangeSecretKey"
              type="password"
              placeholder="Enter your exchange secret key"
              value={formData.exchangeSecretKey}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dataProviderApiKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Data Provider API Key (Optional)
            </Label>
            <Input
              id="dataProviderApiKey"
              name="dataProviderApiKey"
              placeholder="Enter your data provider API key"
              value={formData.dataProviderApiKey}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Keys</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
