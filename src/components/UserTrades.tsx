
import React from 'react';
import { useTrades } from '@/hooks/useTrades';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const UserTrades = () => {
  const { trades, loading, error } = useTrades();

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">Error loading trades: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED': return 'default';
      case 'PENDING': return 'secondary';
      case 'CANCELLED': return 'outline';
      case 'FAILED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
        <CardDescription>Your recent trading activity</CardDescription>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="text-muted-foreground">No trades found. Start trading to see your history here.</p>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold">{trade.symbol}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trade.created_at).toLocaleDateString()} at {new Date(trade.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${getSideColor(trade.side)}`}>
                      {trade.side}
                    </span>
                    <Badge variant={getStatusColor(trade.status)}>
                      {trade.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trade.quantity} units @ ${trade.price.toFixed(2)}
                  </div>
                  <div className="font-semibold">
                    Total: ${trade.total_amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTrades;
