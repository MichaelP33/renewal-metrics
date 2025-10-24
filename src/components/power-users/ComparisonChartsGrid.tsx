'use client';

import React from 'react';
import { ComparisonStats } from '@/lib/power-users/comparison-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonChartsGridProps {
  stats: ComparisonStats;
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
  payload: {
    name: string;
    'Power Users': number;
    'Non-Power Users': number;
  };
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
  // Get top 6 metrics by ratio (highest differences)
  const topMetrics = [...stats.metrics]
    .filter(m => m.ratio > 0 && isFinite(m.ratio))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 6);

  if (topMetrics.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {topMetrics.map(metric => {
        const chartData = [
          {
            name: 'Average',
            'Power Users': metric.powerUsers.mean,
            'Non-Power Users': metric.nonPowerUsers.mean,
          },
          {
            name: 'Median',
            'Power Users': metric.powerUsers.median,
            'Non-Power Users': metric.nonPowerUsers.median,
          },
          {
            name: 'P75',
            'Power Users': metric.powerUsers.p75,
            'Non-Power Users': metric.nonPowerUsers.p75,
          },
        ];

        return (
          <Card key={metric.metricKey}>
            <CardHeader>
              <CardTitle className="text-sm">{metric.metricName}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Power Users" fill="#f54e00" />
                  <Bar dataKey="Non-Power Users" fill="#9ca3af" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

