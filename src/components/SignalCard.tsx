
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TradeSignal } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/mockData';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface SignalCardProps {
  signal: TradeSignal;
  onClick?: () => void;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, onClick }) => {
  const potentialReturn = signal.direction === 'BUY' 
    ? (signal.targetPrice - signal.entryPrice) / signal.entryPrice * 100
    : (signal.entryPrice - signal.targetPrice) / signal.entryPrice * 100;

  const potentialRisk = signal.direction === 'BUY'
    ? (signal.entryPrice - signal.stopLoss) / signal.entryPrice * 100
    : (signal.stopLoss - signal.entryPrice) / signal.entryPrice * 100;

  const riskRewardRatio = (potentialReturn / potentialRisk).toFixed(2);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-500/20 text-blue-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      case 'COMPLETED': return 'bg-green-500/20 text-green-400';
      case 'CANCELLED': return 'bg-gray-500/20 text-gray-400';
      case 'STOPPED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Card 
      className="bg-black/40 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="py-3 px-4 flex flex-row justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">{signal.symbol}</h3>
          <Badge 
            className={`${signal.direction === 'BUY' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'}`}
          >
            {signal.direction}
          </Badge>
        </div>
        <Badge variant="outline" className={`${getStatusColor(signal.status)}`}>
          {signal.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Entry Price</p>
            <p className="font-medium">{formatCurrency(signal.entryPrice)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Target Price</p>
            <p className="font-medium">{formatCurrency(signal.targetPrice)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Stop Loss</p>
            <p className="font-medium">{formatCurrency(signal.stopLoss)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Risk/Reward</p>
            <p className="font-medium">{riskRewardRatio}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            {signal.direction === 'BUY' 
              ? <TrendingUp className="w-4 h-4 text-profit" /> 
              : <TrendingDown className="w-4 h-4 text-loss" />}
            <span className="text-sm font-medium">{signal.strategy}</span>
          </div>
          
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20">
            <span className="text-xs font-medium">{signal.confidence}%</span>
            <span className="text-xs text-gray-400">confidence</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="flex flex-wrap gap-2">
            {signal.indicators.map((indicator, index) => (
              <div key={index} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800/50">
                <span className="text-xs font-medium">{indicator.name}</span>
                <span className="text-xs">{indicator.value}</span>
                {indicator.bullish 
                  ? <ArrowUp className="w-3 h-3 text-profit" /> 
                  : <ArrowDown className="w-3 h-3 text-loss" />}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignalCard;
