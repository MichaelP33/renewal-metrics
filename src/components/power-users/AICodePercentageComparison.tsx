'use client';

import React, { useMemo } from 'react';
import { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COHORT_COLOR_ARRAY } from '@/types';
import { Trophy } from 'lucide-react';

interface AICodePercentageComparisonProps {
  stats: MultiCohortStats;
}

/**
 * Formats a percentage value for display
 */
function formatPercentage(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}%`;
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
 * Custom tooltip component for the chart
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
              <span className="font-medium font-mono">{formatPercentage(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Finds the cohort with the highest %AI code percentage
 */
function findHighestCohort(values: Record<string, number>): string | null {
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

export function AICodePercentageComparison({ stats }: AICodePercentageComparisonProps) {
  // Build chart data with mean, median, p75, and p90 for pctAiCode
  const chartData = useMemo(() => {
    const pctAiCodeMetric = stats.comparisonMetrics.find(m => m.metricKey === 'pctAiCode');
    
    if (!pctAiCodeMetric) {
      return [];
    }

    // Get all cohort values
    const cohortValues: Record<string, number> = {};
    stats.cohorts.forEach(({ cohort }) => {
      cohortValues[cohort.id] = pctAiCodeMetric.values[cohort.id] || 0;
    });

    const highestCohortId = findHighestCohort(cohortValues);

    return ['mean', 'median', 'p75', 'p90'].map(name => {
      const dataPoint: Record<string, string | number> = { name };
      
      // Add each cohort's value
      stats.cohorts.forEach(({ cohort, metrics }) => {
        const metricValue = metrics.metrics.pctAiCode;
        if (metricValue) {
          dataPoint[cohort.name] = metricValue[name as keyof typeof metricValue] || 0;
        }
      });
      
      return dataPoint;
    });
  }, [stats]);

  // Find the highest cohort overall
  const pctAiCodeMetric = stats.comparisonMetrics.find(m => m.metricKey === 'pctAiCode');
  const cohortValues: Record<string, number> = {};
  if (pctAiCodeMetric) {
    stats.cohorts.forEach(({ cohort }) => {
      cohortValues[cohort.id] = pctAiCodeMetric.values[cohort.id] || 0;
    });
  }
  const highestCohortId = findHighestCohort(cohortValues);
  const highestCohort = stats.cohorts.find(({ cohort }) => cohort.id === highestCohortId);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">AI Code Percentage Comparison</CardTitle>
            <CardDescription>
              Comparing %AI code across cohorts: mean, median, 75th percentile, and 90th percentile
            </CardDescription>
          </div>
          {highestCohort && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">
                Highest: {highestCohort.cohort.name}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
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
  );
}

