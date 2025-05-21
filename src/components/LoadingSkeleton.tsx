
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  type: 'card' | 'chart' | 'table' | 'signal';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 1 }) => {
  const renderSkeleton = (index: number) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className="p-4 bg-card border border-border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        );
      case 'chart':
        return (
          <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <div className="flex space-x-2">
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
            </div>
            <div className="p-8 flex items-center justify-center">
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        );
      case 'table':
        return (
          <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 p-2 border-b border-border/50">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border-b border-border/50">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        );
      case 'signal':
        return (
          <div key={index} className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="ml-auto">
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        );
      default:
        return <Skeleton key={index} className="h-24 w-full" />;
    }
  };

  return (
    <div className="w-full grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, index) => renderSkeleton(index))}
    </div>
  );
};

export default LoadingSkeleton;
