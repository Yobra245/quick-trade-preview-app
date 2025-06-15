
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import UserPortfolio from '@/components/UserPortfolio';
import UserTrades from '@/components/UserTrades';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.email}! Monitor your trades and performance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
            <CardDescription>Your trading performance at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <UserPortfolio />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest trades and signals</CardDescription>
          </CardHeader>
          <CardContent>
            <UserTrades />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
