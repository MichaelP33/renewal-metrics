'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingSkeletonProps {
  variant?: 'chart' | 'table' | 'stat-card';
  className?: string;
}

export function LoadingSkeleton({ variant = 'chart', className = '' }: LoadingSkeletonProps) {
  if (variant === 'chart') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4 animate-pulse">
            {/* Header */}
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            {/* Chart area */}
            <div className="h-64 bg-gray-100 rounded" />
            {/* Legend */}
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded flex-1" />
            <div className="h-12 bg-gray-200 rounded w-32" />
            <div className="h-12 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'stat-card') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

