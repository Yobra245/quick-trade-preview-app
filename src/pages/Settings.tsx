
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import Navbar from '@/components/Navbar';
import { 
  Save, 
  RotateCcw, 
  KeyRound, 
  Shield, 
  PieChart,
  Sliders, 
  LineChart,
  BellRing
} from "lucide-react";

const Settings = () => {
  // API Configuration
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [testnetEnabled, setTestnetEnabled] = useState(true);
  
  // Risk Management
  const [maxTradeAmount, setMaxTradeAmount] = useState<number[]>([100]);
  const [maxLossPercentage, setMaxLossPercentage] = useState<number[]>([5]);
  const [autoStopLoss, setAutoStopLoss] = useState(true);
  const [takeProfitEnabled, setTakeProfitEnabled] = useState(true);
  const [takeProfitPercentage, setTakeProfitPercentage] = useState<number[]>([10]);
  
  // AI Strategy Settings
  const [minConfidenceLevel, setMinConfidenceLevel] = useState<number[]>([75]);
  const [autoTrade, setAutoTrade] = useState(false);
  const [enabledStrategies, setEnabledStrategies] = useState({
    macd: true,
    rsi: true,
    bollingerBands: true,
    sentiment: false,
    machineLearn: true
  });
  
  // Notification Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your trading configuration has been updated successfully.",
    });
  };
  
  const handleReset = () => {
    // Reset all settings to defaults
    setApiKey('');
    setApiSecret('');
    setTestnetEnabled(true);
    setMaxTradeAmount([100]);
    setMaxLossPercentage([5]);
    setAutoStopLoss(true);
    setTakeProfitEnabled(true);
    setTakeProfitPercentage([10]);
    setMinConfidenceLevel([75]);
    setAutoTrade(false);
    setEnabledStrategies({
      macd: true,
      rsi: true,
      bollingerBands: true,
      sentiment: false,
      machineLearn: true
    });
    setNotificationsEnabled(true);
    setEmailAlerts(false);
    setEmailAddress('');
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-16 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="api">
              <KeyRound className="mr-2 h-4 w-4" />
              API Configuration
            </TabsTrigger>
            <TabsTrigger value="risk">
              <Shield className="mr-2 h-4 w-4" />
              Risk Management
            </TabsTrigger>
            <TabsTrigger value="strategy">
              <LineChart className="mr-2 h-4 w-4" />
              AI Strategy
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <BellRing className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
          
          {/* API Configuration Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Binance API Configuration</h2>
                <p className="text-sm text-gray-400">Connect your Binance account for trade execution</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)} 
                    placeholder="Enter your Binance API key"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input 
                    id="apiSecret" 
                    type="password" 
                    value={apiSecret} 
                    onChange={(e) => setApiSecret(e.target.value)} 
                    placeholder="Enter your Binance API secret"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="testnet" 
                    checked={testnetEnabled}
                    onCheckedChange={setTestnetEnabled}
                  />
                  <Label htmlFor="testnet">Use Testnet (Recommended for testing)</Label>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-yellow-400 mb-2">Important Security Notes:</p>
                  <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                    <li>Use read-only API keys if you're not using auto-trading</li>
                    <li>Never share your API credentials with anyone</li>
                    <li>For real trading, restrict API access to specific IP addresses</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Risk Management Tab */}
          <TabsContent value="risk">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Risk Management</h2>
                <p className="text-sm text-gray-400">Configure trading limits and risk parameters</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Maximum Trade Amount (USDT)</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      value={maxTradeAmount} 
                      onValueChange={setMaxTradeAmount} 
                      max={1000} 
                      step={10}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{maxTradeAmount[0]}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Maximum Loss Percentage (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      value={maxLossPercentage} 
                      onValueChange={setMaxLossPercentage} 
                      max={20} 
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{maxLossPercentage[0]}%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="autoStopLoss" 
                    checked={autoStopLoss}
                    onCheckedChange={setAutoStopLoss}
                  />
                  <Label htmlFor="autoStopLoss">Automatic Stop Loss</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="takeProfit" 
                    checked={takeProfitEnabled}
                    onCheckedChange={setTakeProfitEnabled}
                  />
                  <Label htmlFor="takeProfit">Take Profit Enabled</Label>
                </div>
                
                {takeProfitEnabled && (
                  <div className="space-y-4 pl-8">
                    <Label>Take Profit Percentage (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={takeProfitPercentage} 
                        onValueChange={setTakeProfitPercentage} 
                        max={50} 
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">{takeProfitPercentage[0]}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AI Strategy Tab */}
          <TabsContent value="strategy">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">AI Trading Strategy</h2>
                <p className="text-sm text-gray-400">Configure AI models and trading strategies</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Minimum Signal Confidence (%)</Label>
                  <div className="flex items-center gap-4">
                    <Slider 
                      value={minConfidenceLevel} 
                      onValueChange={setMinConfidenceLevel} 
                      max={100} 
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{minConfidenceLevel[0]}%</span>
                  </div>
                  <p className="text-xs text-gray-400">Only signals with confidence above this threshold will be considered for trading</p>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="autoTrade" 
                    checked={autoTrade}
                    onCheckedChange={setAutoTrade}
                  />
                  <Label htmlFor="autoTrade">Automated Trading</Label>
                </div>
                
                <div className="pt-4">
                  <Label className="mb-2 block">Enabled Trading Strategies</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="macd" 
                        checked={enabledStrategies.macd}
                        onCheckedChange={(checked) => setEnabledStrategies({...enabledStrategies, macd: !!checked})}
                      />
                      <Label htmlFor="macd">MACD Crossover</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rsi" 
                        checked={enabledStrategies.rsi}
                        onCheckedChange={(checked) => setEnabledStrategies({...enabledStrategies, rsi: !!checked})}
                      />
                      <Label htmlFor="rsi">RSI Oscillator</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bollingerBands" 
                        checked={enabledStrategies.bollingerBands}
                        onCheckedChange={(checked) => setEnabledStrategies({...enabledStrategies, bollingerBands: !!checked})}
                      />
                      <Label htmlFor="bollingerBands">Bollinger Bands</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="sentiment" 
                        checked={enabledStrategies.sentiment}
                        onCheckedChange={(checked) => setEnabledStrategies({...enabledStrategies, sentiment: !!checked})}
                      />
                      <Label htmlFor="sentiment">Sentiment Analysis</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="machineLearn" 
                        checked={enabledStrategies.machineLearn}
                        onCheckedChange={(checked) => setEnabledStrategies({...enabledStrategies, machineLearn: !!checked})}
                      />
                      <Label htmlFor="machineLearn">Machine Learning Model</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Notification Settings</h2>
                <p className="text-sm text-gray-400">Configure alerts and notifications</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="notificationsEnabled" 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                  <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="emailAlerts" 
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                  <Label htmlFor="emailAlerts">Email Alerts</Label>
                </div>
                
                {emailAlerts && (
                  <div className="space-y-2 pl-8">
                    <Label htmlFor="emailAddress">Email Address</Label>
                    <Input 
                      id="emailAddress" 
                      type="email" 
                      value={emailAddress} 
                      onChange={(e) => setEmailAddress(e.target.value)} 
                      placeholder="Enter your email address"
                    />
                  </div>
                )}
                
                <div className="pt-4">
                  <p className="text-sm font-medium mb-2">Notification Events</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="signalAlert" defaultChecked />
                      <Label htmlFor="signalAlert">New Trade Signal Generated</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="executionAlert" defaultChecked />
                      <Label htmlFor="executionAlert">Trade Execution (Buy/Sell)</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="stopLossAlert" defaultChecked />
                      <Label htmlFor="stopLossAlert">Stop Loss Triggered</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="takeProfitAlert" defaultChecked />
                      <Label htmlFor="takeProfitAlert">Take Profit Reached</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="errorAlert" defaultChecked />
                      <Label htmlFor="errorAlert">System Errors</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
