
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from '@/components/ui/use-toast';
import { 
  Terminal, 
  Wifi, 
  WifiOff, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';

interface MetaTraderIntegrationProps {
  platform: 'mt4' | 'mt5';
}

const MetaTraderIntegration: React.FC<MetaTraderIntegrationProps> = ({ platform }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState({
    serverAddress: 'localhost',
    port: platform === 'mt4' ? '9090' : '9091',
    expertAdvisorEnabled: false,
    autoTrading: false,
  });

  const handleConnect = () => {
    // Simulate connection
    setIsConnected(!isConnected);
    toast({
      title: isConnected ? "Disconnected" : "Connected",
      description: isConnected 
        ? `Disconnected from ${platform.toUpperCase()}` 
        : `Connected to ${platform.toUpperCase()} successfully`,
    });
  };

  const handleConfigChange = (field: string, value: string | boolean) => {
    setConnectionConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          {platform.toUpperCase()} Integration
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serverAddress">Server Address</Label>
            <Input
              id="serverAddress"
              value={connectionConfig.serverAddress}
              onChange={(e) => handleConfigChange('serverAddress', e.target.value)}
              placeholder="localhost or IP address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              value={connectionConfig.port}
              onChange={(e) => handleConfigChange('port', e.target.value)}
              placeholder="9090"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Expert Advisor</Label>
              <p className="text-sm text-muted-foreground">
                Enable EA for automated signal execution
              </p>
            </div>
            <Switch
              checked={connectionConfig.expertAdvisorEnabled}
              onCheckedChange={(checked) => handleConfigChange('expertAdvisorEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Trading</Label>
              <p className="text-sm text-muted-foreground">
                Allow automated trade execution
              </p>
            </div>
            <Switch
              checked={connectionConfig.autoTrading}
              onCheckedChange={(checked) => handleConfigChange('autoTrading', checked)}
              disabled={!connectionConfig.expertAdvisorEnabled}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleConnect}
            variant={isConnected ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isConnected ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>

          {isConnected && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Live Trading Active
            </Badge>
          )}
        </div>

        {!isConnected && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Setup Required</p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Install the SignalAI Expert Advisor in your {platform.toUpperCase()} terminal and ensure DLL imports are enabled.
              </p>
            </div>
          </div>
        )}

        {platform === 'mt5' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>MT5 Enhanced Features:</strong> Supports crypto, forex, and stocks trading with advanced order types.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetaTraderIntegration;
