
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

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onOpenChange }) => {
  const { apiKeys, setApiKeys, selectedExchange, setSelectedExchange } = useAppContext();
  const [formData, setFormData] = useState({
    exchangeApiKey: apiKeys.exchangeApiKey || '',
    exchangeSecretKey: apiKeys.exchangeSecretKey || '',
    dataProviderApiKey: apiKeys.dataProviderApiKey || ''
  });

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
      title: "Configuration Saved",
      description: `Your ${selectedExchangeData?.name} configuration has been saved.`,
    });
    onOpenChange(false);
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
            Configure your exchange connection and API keys for trading and data access.
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
                <Label htmlFor="exchangeApiKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {selectedExchangeData.name} API Key
                </Label>
                <Input
                  id="exchangeApiKey"
                  name="exchangeApiKey"
                  placeholder={`Enter your ${selectedExchangeData.name} API key`}
                  value={formData.exchangeApiKey}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="exchangeSecretKey" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {selectedExchangeData.name} Secret Key
                </Label>
                <Input
                  id="exchangeSecretKey"
                  name="exchangeSecretKey"
                  type="password"
                  placeholder={`Enter your ${selectedExchangeData.name} secret key`}
                  value={formData.exchangeSecretKey}
                  onChange={handleChange}
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
                />
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Configuration</Button>
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
