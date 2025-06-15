
import React from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const UserPortfolio = () => {
  const { portfolio, loading, error } = usePortfolio();

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">Error loading portfolio: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalValue = portfolio.reduce((sum, item) => sum + (item.current_value || 0), 0);
  const totalPnL = portfolio.reduce((sum, item) => sum + (item.profit_loss || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPnL.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Holdings</CardTitle>
          <CardDescription>Your current cryptocurrency positions</CardDescription>
        </CardHeader>
        <CardContent>
          {portfolio.length === 0 ? (
            <p className="text-muted-foreground">No holdings found. Start trading to see your portfolio here.</p>
          ) : (
            <div className="space-y-4">
              {portfolio.map((holding) => (
                <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">{holding.symbol}</h3>
                      <p className="text-sm text-muted-foreground">
                        {holding.quantity} units @ ${holding.average_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${holding.current_value?.toFixed(2) || '0.00'}</div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={holding.profit_loss && holding.profit_loss >= 0 ? 'default' : 'destructive'}>
                        {holding.profit_loss && holding.profit_loss >= 0 ? '+' : ''}${holding.profit_loss?.toFixed(2) || '0.00'}
                      </Badge>
                      <span className={`text-sm ${holding.profit_loss_percentage && holding.profit_loss_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ({holding.profit_loss_percentage && holding.profit_loss_percentage >= 0 ? '+' : ''}{holding.profit_loss_percentage?.toFixed(2) || '0.00'}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPortfolio;
