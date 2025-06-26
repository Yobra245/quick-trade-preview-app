
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

interface ChartLoadingStateProps {
  loading: boolean;
  error: string | null;
  height: number;
}

const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({
  loading,
  error,
  height
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading professional trading interface...</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-accent rounded w-3/4"></div>
                <div className="h-6 bg-accent rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div className="text-center">
              <p className="text-sm font-medium">Failed to load professional chart</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ChartLoadingState;
