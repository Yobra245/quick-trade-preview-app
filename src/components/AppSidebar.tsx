import React from "react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import { BarChart3, TrendingUp, Target, User, Settings, Home, Activity } from "lucide-react";

export function AppSidebar() {
  const location = useLocation();

  const menuItems = [
    {
      title: "Overview",
      url: "/",
      icon: Home,
      description: "Dashboard overview of your trading activity"
    },
    {
      title: "Live Trading",
      url: "/live-trading",
      icon: TrendingUp,
      description: "Execute trades and monitor markets in real-time"
    },
    {
      title: "Strategies",
      url: "/strategies",
      icon: Target,
      description: "Configure and monitor your trading strategies"
    },
    {
      title: "Account",
      url: "/account",
      icon: User,
      description: "Manage your profile and API credentials"
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      description: "Customize your trading experience"
    },
    {
      title: "Advanced Charts",
      url: "/trading-chart",
      icon: Activity,
      description: "Professional real-time trading charts"
    },
  ];

  return (
    <div className="flex flex-col h-full bg-secondary border-r">
      <div className="px-4 py-6">
        <Link to="/" className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Trading App</span>
        </Link>
      </div>
      <div className="flex-1 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "group flex items-center space-x-3 py-2 px-4 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-200",
              location.pathname === item.url
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Trading App
        </p>
      </div>
    </div>
  );
}
