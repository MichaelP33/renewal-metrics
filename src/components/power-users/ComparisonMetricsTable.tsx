'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComparisonStats } from '@/lib/power-users/comparison-stats';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ComparisonMetricsTableProps {
  stats: ComparisonStats;
}

/**
 * Formats a number for display
 */
function formatNumber(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return 'N/A';
  }
  
  // For very large numbers, use locale string
  if (value >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  // For decimals, show 1 decimal place
  return value.toFixed(1);
}

/**
 * Formats a percentage for display
 */
function formatPercent(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return 'N/A';
  }
  
  if (Math.abs(value) < 1) {
    return '~0%';
  }
  
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Component to display difference indicator with color coding
 */
function DifferenceIndicator({ diff }: { diff: number }) {
  if (isNaN(diff) || !isFinite(diff)) {
    return (
      <span className="inline-flex items-center text-gray-600">
        <Minus className="h-3 w-3 mr-1" />
        N/A
      </span>
    );
  }

  if (Math.abs(diff) < 1) {
    return (
      <span className="inline-flex items-center text-gray-600">
        <Minus className="h-3 w-3 mr-1" />
        ~0%
      </span>
    );
  }

  if (diff > 0) {
    return (
      <span className="inline-flex items-center text-green-600">
        <ArrowUp className="h-3 w-3 mr-1" />
        {formatPercent(diff)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-red-600">
      <ArrowDown className="h-3 w-3 mr-1" />
      {formatPercent(diff)}
    </span>
  );
}

export function ComparisonMetricsTable({ stats }: ComparisonMetricsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Metrics Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Metric</TableHead>
              <TableHead className="text-right">Power Users (Avg)</TableHead>
              <TableHead className="text-right">Non-Power Users (Avg)</TableHead>
              <TableHead className="text-right">Difference</TableHead>
              <TableHead className="text-right">Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.metrics.map(metric => (
              <TableRow key={metric.metricKey}>
                <TableCell className="font-medium">{metric.metricName}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(metric.powerUsers.mean)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatNumber(metric.nonPowerUsers.mean)}
                </TableCell>
                <TableCell className="text-right">
                  <DifferenceIndicator diff={metric.differencePercent} />
                </TableCell>
                <TableCell className="text-right font-mono">
                  {isNaN(metric.ratio) || !isFinite(metric.ratio) 
                    ? 'N/A' 
                    : `${metric.ratio.toFixed(2)}×`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

