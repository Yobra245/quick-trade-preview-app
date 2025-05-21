
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, User, Settings, ChartLine, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="border-b border-gray-800 px-4 py-2 w-full bg-black/20 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold text-primary">SignalAI</Link>
          <span className="hidden md:inline-flex text-xs font-semibold bg-secondary px-2 py-0.5 rounded">BETA</span>
        </div>
        
        <div className="hidden md:flex items-center gap-4 mx-4">
          <Link to="/" className={`text-sm font-medium ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
            <span className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </span>
          </Link>
          
          <Link to="/backtest" className={`text-sm font-medium ${isActive('/backtest') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
            <span className="flex items-center gap-1">
              <ChartLine className="h-4 w-4" />
              Backtest
            </span>
          </Link>
          
          <Link to="/settings" className={`text-sm font-medium ${isActive('/settings') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
            <span className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Settings
            </span>
          </Link>
        </div>
        
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search markets..."
              className="pl-8 bg-secondary/50 border-gray-700 text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary"></span>
          </Button>
          
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
