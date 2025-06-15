import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from '@/components/UserProfile';
import UserPortfolio from '@/components/UserPortfolio';
import UserTrades from '@/components/UserTrades';
import StrategySignalPanel from '@/components/StrategySignalPanel';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Trading Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.email}! Monitor your trades and strategies.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
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
        </TabsContent>

        <TabsContent value="portfolio">
          <UserPortfolio />
        </TabsContent>

        <TabsContent value="trades">
          <UserTrades />
        </TabsContent>

        <TabsContent value="strategies">
          <StrategySignalPanel />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
