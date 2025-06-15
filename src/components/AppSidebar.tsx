
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/AppContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { 
  Home, 
  Settings, 
  ChartLine, 
  KeyRound,
  TrendingUp, 
  Clock, 
  CircleDollarSign,
  BarChart3,
  Shield
} from "lucide-react";
import { useMemo, useState } from 'react';
import ApiKeyModal from './ApiKeyModal';
import MarketsModal from './MarketsModal';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationCenter from './NotificationCenter';
import ConnectionStatus from './ConnectionStatus';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Avatar, AvatarFallback } from './ui/avatar';

export function AppSidebar() {
  const location = useLocation();
  const { apiKeysConfigured } = useAppContext();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [marketsModalOpen, setMarketsModalOpen] = useState(false);

  const navigationItems = useMemo(() => [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Backtest",
      url: "/backtest",
      icon: ChartLine,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Admin",
      url: "/admin",
      icon: Shield,
    },
  ], []);

  const toolItems = useMemo(() => [
    {
      title: "Live Markets",
      action: () => setMarketsModalOpen(true),
      icon: BarChart3,
      disabled: false,
    },
    {
      title: "Market Analysis",
      url: "#",
      icon: TrendingUp,
      disabled: !apiKeysConfigured,
    },
    {
      title: "Trading History",
      url: "#",
      icon: Clock,
      disabled: !apiKeysConfigured,
    },
    {
      title: "Portfolio",
      url: "#",
      icon: CircleDollarSign,
      disabled: !apiKeysConfigured,
    },
  ], [apiKeysConfigured]);

  const isActive = (url: string) => {
    return location.pathname === url;
  };

  return (
    <>
      <Sidebar variant="sidebar">
        <SidebarHeader className="flex flex-col items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 py-2">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-md p-1">
              <ChartLine className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SignalAI</span>
            <span className="hidden md:inline-flex text-xs font-semibold bg-secondary px-2 py-0.5 rounded">BETA</span>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <ConnectionStatus />
            <NotificationCenter />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarSeparator />
          
          {/* Trading Tools */}
          <SidebarGroup>
            <SidebarGroupLabel>Trading Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {toolItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <SidebarMenuButton
                            onClick={item.action}
                            isActive={item.url ? isActive(item.url) : false}
                            tooltip={item.disabled ? "Configure API keys first" : item.title}
                            className={cn(
                              item.disabled && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {item.disabled && !item.action ? (
                              <div>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </div>
                            ) : item.action ? (
                              <div className="flex items-center">
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </div>
                            ) : (
                              <Link to={item.url!}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            )}
                          </SidebarMenuButton>
                        </div>
                      </TooltipTrigger>
                      {item.disabled && (
                        <TooltipContent side="right">
                          Configure API keys to access this feature
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
                
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setApiKeyModalOpen(true)}
                    tooltip="API Keys Configuration"
                    className={cn(
                      !apiKeysConfigured && "bg-primary/10 border border-primary/30"
                    )}
                  >
                    <KeyRound className={cn("h-4 w-4", !apiKeysConfigured && "text-primary")} />
                    <span>API Keys</span>
                    {!apiKeysConfigured && (
                      <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                        Required
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="flex items-center justify-between p-4">
            <ThemeSwitcher />
            
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <ApiKeyModal
        open={apiKeyModalOpen}
        onOpenChange={setApiKeyModalOpen}
      />
      
      <MarketsModal
        open={marketsModalOpen}
        onOpenChange={setMarketsModalOpen}
      />
    </>
  );
}

export default AppSidebar;
