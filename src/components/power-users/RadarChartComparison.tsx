'use client';

import React, { useMemo } from 'react';
import { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { COHORT_COLOR_ARRAY } from '@/types';

interface RadarChartComparisonProps {
  stats: MultiCohortStats;
}

/**
 * Radar chart axes with normalization logic
 */
const RADAR_AXES = [
  { 
    key: 'totalSessions', 
    label: 'Sessions',
    normalize: (value: number, max: number) => max > 0 ? (value / max) * 100 : 0
  },
  { 
    key: 'totalAgentRequests', 
    label: 'Requests',
    normalize: (value: number, max: number) => max > 0 ? (value / max) * 100 : 0
  },
  { 
    key: 'pctAiCode', 
    label: 'AI Code %',
    normalize: (value: number) => value // Already 0-100
  },
  { 
    key: 'numProductsUsed', 
    label: 'Feature Count',
    normalize: (value: number) => value * 20 // 0-5 to 0-100
  },
  { 
    key: 'engagementScore', 
    label: 'Engagement',
    normalize: (value: number) => value // Already 0-100
  },
] as const;


export function RadarChartComparison({ stats }: RadarChartComparisonProps) {
  const radarData = useMemo(() => {
    // Calculate max values for normalization
    const maxValues: Record<string, number> = {};
    
    RADAR_AXES.forEach(axis => {
      let max = 0;
      stats.cohorts.forEach(({ metrics }) => {
        const metricData = metrics.metrics[axis.key as keyof typeof metrics.metrics];
        if (metricData && metricData.mean > max) {
          max = metricData.mean;
        }
      });
      maxValues[axis.key] = max;
    });
    
    // Build radar data points
    const axes = RADAR_AXES.map(axis => {
      const dataPoint: Record<string, number | string> = {
        axis: axis.label,
      };
      
      stats.cohorts.forEach(({ cohort, metrics }) => {
        const metricData = metrics.metrics[axis.key as keyof typeof metrics.metrics];
        const meanValue = metricData?.mean || 0;
        const normalizedValue = axis.normalize(meanValue, maxValues[axis.key]);
        dataPoint[cohort.name] = normalizedValue;
      });
      
      return dataPoint;
    });
    
    return axes;
  }, [stats.cohorts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Radar Chart Comparison</CardTitle>
        <CardDescription>
          Multi-dimensional comparison across 5 key metrics (normalized to 0-100 scale)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            {stats.cohorts.map(({ cohort }, index) => (
              <Radar
                key={cohort.id}
                name={cohort.name}
                dataKey={cohort.name}
                stroke={COHORT_COLOR_ARRAY[index % COHORT_COLOR_ARRAY.length]}
                fill={COHORT_COLOR_ARRAY[index % COHORT_COLOR_ARRAY.length]}
                fillOpacity={0.2}
              />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

