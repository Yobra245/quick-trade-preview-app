
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
import { Key, KeyRound, Shield, Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MetaTraderIntegration from './MetaTraderIntegration';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { dataService } from '@/lib/services/DataService';

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { selectedExchange, setSelectedExchange } = useAppContext();
  const [formData, setFormData] = useState({
    apiKey: '',
    secretKey: '',
    passphrase: '',
    sandboxMode: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const exchanges = [
    { id: 'binance', name: 'Binance', requiresKeys: true },
    { id: 'coinbase', name: 'Coinbase Pro', requiresKeys: true },
    { id: 'kraken', name: 'Kraken', requiresKeys: true },
    { id: 'bybit', name: 'Bybit', requiresKeys: true },
    { id: 'mt4', name: 'MetaTrader 4', requiresKeys: false },
    { id: 'mt5', name: 'MetaTrader 5', requiresKeys: false },
    { id: 'ib', name: 'Interactive Brokers', requiresKeys: true },
    { id: 'alpaca', name: 'Alpaca', requiresKeys: true },
  ];

  const selectedExchangeData = exchanges.find(e => e.id === selectedExchange);
  const isMetaTrader = selectedExchange === 'mt4' || selectedExchange === 'mt5';

  React.useEffect(() => {
    if (open && user && selectedExchangeData?.requiresKeys) {
      loadExistingCredentials();
    }
  }, [open, user, selectedExchange]);

  const loadExistingCredentials = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('api_credentials')
        .select('api_key, secret_key, passphrase, sandbox_mode')
        .eq('user_id', user.id)
        .eq('exchange', selectedExchange)
        .eq('is_active', true)
        .single();

      if (data && !error) {
        setFormData({
          apiKey: data.api_key || '',
          secretKey: data.secret_key || '',
          passphrase: data.passphrase || '',
          sandboxMode: data.sandbox_mode || false
        });
      }
    } catch (error) {
      console.log('No existing credentials found');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Save API credentials to database
      const { error } = await supabase
        .from('api_credentials')
        .upsert({
          user_id: user.id,
          exchange: selectedExchange,
          api_key: formData.apiKey,
          secret_key: formData.secretKey,
          passphrase: formData.passphrase || null,
          sandbox_mode: formData.sandboxMode,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,exchange'
        });

      if (error) throw error;

      // Initialize the data service with real APIs
      await dataService.initialize(user.id);

      toast({
        title: "API Keys Saved",
        description: `Your ${selectedExchangeData?.name} API keys have been saved securely. Real data integration is now active.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving API credentials:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save API credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Exchange Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your exchange connection and API keys for real trading and data access.
            Your API keys are encrypted and stored securely.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Exchange Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Select Exchange
            </Label>
            <Select value={selectedExchange} onValueChange={setSelectedExchange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exchanges.map((exchange) => (
                  <SelectItem key={exchange.id} value={exchange.id}>
                    {exchange.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* MetaTrader Integration */}
          {isMetaTrader && (
            <MetaTraderIntegration platform={selectedExchange as 'mt4' | 'mt5'} />
          )}

          {/* API Keys Form (for non-MetaTrader exchanges) */}
          {selectedExchangeData?.requiresKeys && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {selectedExchangeData.name} API Key
                </Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  placeholder={`Enter your ${selectedExchangeData.name} API key`}
                  value={formData.apiKey}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="secretKey" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {selectedExchangeData.name} Secret Key
                </Label>
                <Input
                  id="secretKey"
                  name="secretKey"
                  type="password"
                  placeholder={`Enter your ${selectedExchangeData.name} secret key`}
                  value={formData.secretKey}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {selectedExchange === 'coinbase' && (
                <div className="grid gap-2">
                  <Label htmlFor="passphrase" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Passphrase
                  </Label>
                  <Input
                    id="passphrase"
                    name="passphrase"
                    type="password"
                    placeholder="Enter your Coinbase Pro passphrase"
                    value={formData.passphrase}
                    onChange={handleChange}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sandboxMode"
                  name="sandboxMode"
                  checked={formData.sandboxMode}
                  onChange={handleChange}
                  className="rounded"
                />
                <Label htmlFor="sandboxMode" className="text-sm">
                  Use Sandbox/Testnet Mode (Recommended for testing)
                </Label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Security Note:</strong> Your API keys are encrypted and stored securely. 
                  We recommend using read-only or limited permissions for maximum security.
                </p>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Close button for MetaTrader */}
          {isMetaTrader && (
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
