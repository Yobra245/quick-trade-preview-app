
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIInsight } from '@/lib/types';
import { Sparkles, TrendingUp, TrendingDown, CircleDollarSign } from 'lucide-react';

interface AIInsightCardProps {
  insight: AIInsight;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'bg-profit/20 text-profit';
      case 'BEARISH': return 'bg-loss/20 text-loss';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return <TrendingUp className="h-4 w-4 text-profit" />;
      case 'BEARISH': return <TrendingDown className="h-4 w-4 text-loss" />;
      default: return <CircleDollarSign className="h-4 w-4 text-gray-400" />;
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="bg-black/40 border border-gray-800">
      <CardHeader className="border-b border-gray-800 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-medium">AI Analysis: {insight.symbol}</h3>
          </div>
          <Badge className={getSentimentColor(insight.sentiment)}>
            <div className="flex items-center gap-1">
              {getSentimentIcon(insight.sentiment)}
              <span>{insight.sentiment}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-gray-300 mb-4">{insight.summary}</p>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-400">Confidence</span>
            <span className="text-xs font-medium">{insight.confidence}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${insight.confidence}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs text-gray-400 mb-2">Key Factors</h4>
          <ul className="space-y-2">
            {insight.factors.map((factor, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1 h-1 mt-1.5 rounded-full bg-primary"></span>
                <span className="text-xs text-gray-300">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-500">Timeframe: {insight.timeframe}</span>
          <span className="text-xs text-gray-500">{timeAgo(insight.generatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightCard;
