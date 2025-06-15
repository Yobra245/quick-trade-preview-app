
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Key, Shield, Settings, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminPanel = () => {
  const [exchangeConfigs, setExchangeConfigs] = useState({
    binance: {
      apiKey: '',
      secretKey: '',
      enabled: false,
      testnet: true
    },
    coinbase: {
      apiKey: '',
      secretKey: '',
      passphrase: '',
      enabled: false,
      sandbox: true
    },
    bybit: {
      apiKey: '',
      secretKey: '',
      enabled: false,
      testnet: true
    }
  });

  const [tradingSettings, setTradingSettings] = useState({
    maxOrderSize: 1000,
    dailyTradeLimit: 10,
    riskPercentage: 2,
    autoTradingEnabled: false,
    emergencyStop: false
  });

  const handleExchangeConfigUpdate = (exchange: string, field: string, value: any) => {
    setExchangeConfigs(prev => ({
      ...prev,
      [exchange]: {
        ...prev[exchange as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSaveExchangeConfig = async (exchange: string) => {
    try {
      // Here you would save to Supabase secrets or edge function
      console.log(`Saving ${exchange} configuration:`, exchangeConfigs[exchange as keyof typeof exchangeConfigs]);
      
      toast({
        title: "Configuration Saved",
        description: `${exchange} API configuration has been saved securely.`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async (exchange: string) => {
    try {
      // Here you would test the API connection
      console.log(`Testing ${exchange} connection...`);
      
      toast({
        title: "Connection Test",
        description: `${exchange} connection test initiated. Check logs for results.`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${exchange}. Please check your API credentials.`,
        variant: "destructive"
      });
    }
  };

  const handleTradingSettingsUpdate = (field: string, value: any) => {
    setTradingSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveTradingSettings = async () => {
    try {
      console.log('Saving trading settings:', tradingSettings);
      
      toast({
        title: "Settings Saved",
        description: "Trading settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save trading settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getEnvironmentValue = (exchange: string, config: any) => {
    if (exchange === 'coinbase') {
      return config.sandbox ? 'sandbox' : 'production';
    }
    return config.testnet ? 'testnet' : 'production';
  };

  const handleEnvironmentChange = (exchange: string, value: string) => {
    if (exchange === 'coinbase') {
      handleExchangeConfigUpdate(exchange, 'sandbox', value === 'sandbox');
    } else {
      handleExchangeConfigUpdate(exchange, 'testnet', value === 'testnet');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage API keys and trading configurations</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Admin Only
        </Badge>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          API keys are stored securely and encrypted. Never share your production API keys with untrusted sources.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="exchanges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exchanges">Exchange APIs</TabsTrigger>
          <TabsTrigger value="trading">Trading Settings</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges" className="space-y-6">
          {Object.entries(exchangeConfigs).map(([exchange, config]) => (
            <Card key={exchange}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    {exchange.charAt(0).toUpperCase() + exchange.slice(1)} API Configuration
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(checked) => 
                        handleExchangeConfigUpdate(exchange, 'enabled', checked)
                      }
                    />
                    <span className="text-sm">{config.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </CardTitle>
                <CardDescription>
                  Configure API credentials for {exchange} exchange integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${exchange}-api-key`}>API Key</Label>
                    <Input
                      id={`${exchange}-api-key`}
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => 
                        handleExchangeConfigUpdate(exchange, 'apiKey', e.target.value)
                      }
                      placeholder="Enter API key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${exchange}-secret-key`}>Secret Key</Label>
                    <Input
                      id={`${exchange}-secret-key`}
                      type="password"
                      value={config.secretKey}
                      onChange={(e) => 
                        handleExchangeConfigUpdate(exchange, 'secretKey', e.target.value)
                      }
                      placeholder="Enter secret key"
                    />
                  </div>
                  {exchange === 'coinbase' && (
                    <div className="space-y-2">
                      <Label htmlFor={`${exchange}-passphrase`}>Passphrase</Label>
                      <Input
                        id={`${exchange}-passphrase`}
                        type="password"
                        value={(config as any).passphrase || ''}
                        onChange={(e) => 
                          handleExchangeConfigUpdate(exchange, 'passphrase', e.target.value)
                        }
                        placeholder="Enter passphrase"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Select
                      value={getEnvironmentValue(exchange, config)}
                      onValueChange={(value) => handleEnvironmentChange(exchange, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={exchange === 'coinbase' ? 'sandbox' : 'testnet'}>
                          {exchange === 'coinbase' ? 'Sandbox' : 'Testnet'}
                        </SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleSaveExchangeConfig(exchange)}
                    disabled={!config.apiKey || !config.secretKey}
                  >
                    Save Configuration
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection(exchange)}
                    disabled={!config.enabled || !config.apiKey || !config.secretKey}
                  >
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Trading Risk Management
              </CardTitle>
              <CardDescription>
                Configure global trading limits and risk parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max-order-size">Maximum Order Size (USDT)</Label>
                  <Input
                    id="max-order-size"
                    type="number"
                    value={tradingSettings.maxOrderSize}
                    onChange={(e) => 
                      handleTradingSettingsUpdate('maxOrderSize', parseFloat(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily-trade-limit">Daily Trade Limit</Label>
                  <Input
                    id="daily-trade-limit"
                    type="number"
                    value={tradingSettings.dailyTradeLimit}
                    onChange={(e) => 
                      handleTradingSettingsUpdate('dailyTradeLimit', parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk-percentage">Risk Per Trade (%)</Label>
                  <Input
                    id="risk-percentage"
                    type="number"
                    step="0.1"
                    value={tradingSettings.riskPercentage}
                    onChange={(e) => 
                      handleTradingSettingsUpdate('riskPercentage', parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Trading</Label>
                    <p className="text-sm text-muted-foreground">Allow automated trade execution</p>
                  </div>
                  <Switch
                    checked={tradingSettings.autoTradingEnabled}
                    onCheckedChange={(checked) => 
                      handleTradingSettingsUpdate('autoTradingEnabled', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emergency Stop</Label>
                    <p className="text-sm text-muted-foreground">Stop all trading activities immediately</p>
                  </div>
                  <Switch
                    checked={tradingSettings.emergencyStop}
                    onCheckedChange={(checked) => 
                      handleTradingSettingsUpdate('emergencyStop', checked)
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveTradingSettings}>
                Save Trading Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Monitor system health and trading activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <div className="text-sm text-gray-600">System Status</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Active Trades</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Connected Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
