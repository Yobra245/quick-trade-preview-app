
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TradeExecution } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/mockData';

interface RecentExecutionsProps {
  executions: TradeExecution[];
}

const RecentExecutions: React.FC<RecentExecutionsProps> = ({ executions }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED': return 'bg-green-500/20 text-green-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      case 'CANCELLED': return 'bg-gray-500/20 text-gray-400';
      case 'FAILED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
        <h3 className="font-medium text-lg">Recent Executions</h3>
      </CardHeader>
      <CardContent className="p-0">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Amount
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                P/L
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {executions.map((execution) => (
              <tr key={execution.id} className="hover:bg-gray-900/30">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  {execution.symbol}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <Badge 
                    className={`${execution.direction === 'BUY' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'}`}
                  >
                    {execution.direction}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {formatCurrency(execution.entryPrice)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm hidden sm:table-cell">
                  {execution.quantity}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {execution.profitLossPercentage ? (
                    <span className={execution.profitLossPercentage >= 0 ? 'text-profit' : 'text-loss'}>
                      {formatPercentage(execution.profitLossPercentage)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                  {timeAgo(execution.entryTime)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <Badge variant="outline" className={getStatusColor(execution.status)}>
                    {execution.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};

export default RecentExecutions;
