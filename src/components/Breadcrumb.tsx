
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  className?: string;
}

const routeNameMap: Record<string, string> = {
  "/": "Dashboard",
  "/backtest": "Backtest",
  "/settings": "Settings",
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ className }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // Build breadcrumb paths with accumulated paths
  const breadcrumbPaths = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      name: routeNameMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1),
      path,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm text-muted-foreground", className)}>
      <ol className="flex items-center space-x-1">
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {breadcrumbPaths.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/70" />
            <Link
              to={item.path}
              className={cn(
                "hover:text-foreground transition-colors",
                index === breadcrumbPaths.length - 1
                  ? "text-foreground font-medium"
                  : ""
              )}
              aria-current={
                index === breadcrumbPaths.length - 1 ? "page" : undefined
              }
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
