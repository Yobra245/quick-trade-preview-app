
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import Index from './pages/Index';
import LiveTrading from './pages/LiveTrading';
import Strategies from './pages/Strategies';
import TradingChart from './pages/TradingChart';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/live-trading" element={<LiveTrading />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/trading-chart" element={<TradingChart />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
