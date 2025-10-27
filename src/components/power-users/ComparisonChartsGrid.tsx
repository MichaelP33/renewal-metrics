'use client';

import React, { useMemo } from 'react';
import { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COHORT_COLOR_ARRAY } from '@/types';

interface ComparisonChartsGridProps {
  stats: MultiCohortStats;
}

/**
 * Formats a number for display in tooltips
 */
function formatTooltipValue(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return 'N/A';
  }
  
  if (value >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  
  return value.toFixed(1);
}

/**
 * Type for recharts tooltip payload entry
 */
interface TooltipPayloadEntry {
  name: string;
  value: number;
  dataKey: string;
  payload: Record<string, number | string>;
}

/**
 * Type for recharts tooltip props
 */
interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

/**
 * Custom tooltip component for charts
 */
function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{payload[0].payload.name}</p>
        <div className="space-y-1 text-sm">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between min-w-[150px]">
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium font-mono">{formatTooltipValue(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function ComparisonChartsGrid({ stats }: ComparisonChartsGridProps) {
  // Get top 6 metrics by spread (highest differences)
  const topMetrics = useMemo(() => {
    return [...stats.comparisonMetrics]
      .filter(m => m.spread > 0 && isFinite(m.spread))
      .sort((a, b) => b.spread - a.spread)
      .slice(0, 6);
  }, [stats.comparisonMetrics]);

  // Generate bar charts dynamically for each cohort
  const chartData = useMemo(() => {
    return topMetrics.map(metric => {
      const dataPoints = ['mean', 'median', 'p75'].map(name => {
        const dataPoint: Record<string, string | number> = { name };
        
        // Add each cohort's value
        stats.cohorts.forEach(({ cohort, metrics: cohortMetrics }) => {
          const metricValue = cohortMetrics.metrics[metric.metricKey as keyof typeof cohortMetrics.metrics];
          if (metricValue) {
            dataPoint[cohort.name] = metricValue[name as keyof typeof metricValue] || 0;
          }
        });
        
        return dataPoint;
      });
      
      return { metric, dataPoints };
    });
  }, [topMetrics, stats.cohorts]);

  if (topMetrics.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {chartData.map(({ metric, dataPoints }) => (
        <Card key={metric.metricKey}>
          <CardHeader>
            <CardTitle className="text-sm">{metric.metricName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={dataPoints}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {stats.cohorts.map(({ cohort }, index) => (
                  <Bar 
                    key={cohort.id} 
                    dataKey={cohort.name} 
                    fill={COHORT_COLOR_ARRAY[index % COHORT_COLOR_ARRAY.length]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

