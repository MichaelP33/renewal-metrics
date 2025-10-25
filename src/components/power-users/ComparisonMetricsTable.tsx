'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import { Trophy } from 'lucide-react';

interface ComparisonMetricsTableProps {
  stats: MultiCohortStats;
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
 * Finds the best (highest) value across cohorts for a metric
 */
function findBestCohort(values: Record<string, number>): string | null {
  let bestValue = -Infinity;
  let bestCohort: string | null = null;
  
  Object.entries(values).forEach(([cohortId, value]) => {
    if (value > bestValue && isFinite(value)) {
      bestValue = value;
      bestCohort = cohortId;
    }
  });
  
  return bestCohort;
}

export function ComparisonMetricsTable({ stats }: ComparisonMetricsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Metrics Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Metric</TableHead>
                {stats.cohorts.map(({ cohort }) => (
                  <TableHead key={cohort.id} className="text-right">
                    {cohort.name}
                  </TableHead>
                ))}
                <TableHead className="text-right">Spread</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.comparisonMetrics.map(metric => {
                const bestCohortId = findBestCohort(metric.values);
                
                return (
                  <TableRow key={metric.metricKey}>
                    <TableCell className="font-medium">{metric.metricName}</TableCell>
                    {stats.cohorts.map(({ cohort }) => {
                      const value = metric.values[cohort.id] || 0;
                      const isBest = bestCohortId === cohort.id;
                      
                      return (
                        <TableCell key={cohort.id} className="text-right font-mono">
                          <div className="flex items-center justify-end space-x-1">
                            {isBest && (
                              <Trophy className="h-3 w-3 text-yellow-500" />
                            )}
                            <span>{formatNumber(value)}</span>
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-mono">
                      {formatNumber(metric.spread)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

