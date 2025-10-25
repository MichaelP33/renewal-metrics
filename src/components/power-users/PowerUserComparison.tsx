'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import { ComparisonMetricsTable } from './ComparisonMetricsTable';
import { ComparisonChartsGrid } from './ComparisonChartsGrid';
import { FeatureAdoptionHeatmap } from './FeatureAdoptionHeatmap';
import { RadarChartComparison } from './RadarChartComparison';
import { Download, Info } from 'lucide-react';
import { exportCSV } from '@/lib/export-utils';
import { COHORT_COLOR_ARRAY } from '@/types';

interface PowerUserComparisonProps {
  stats: MultiCohortStats;
}

/**
 * Stat card component for displaying counts
 */
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  // Convert hex to rgba for background
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div 
      className="rounded-lg border p-4"
      style={{
        backgroundColor: hexToRgba(color, 0.1),
        borderColor: hexToRgba(color, 0.3),
        color: color,
      }}
    >
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}

/**
 * Exports comparison data as CSV
 */
function handleExport(stats: MultiCohortStats): void {
  const cohortNames = stats.cohorts.map(({ cohort }) => cohort.name);
  const headers = ['Metric', ...cohortNames, 'Spread'];
  
  const rows = stats.comparisonMetrics.map(metric => {
    const cohortValues = stats.cohorts.map(({ cohort }) => 
      (metric.values[cohort.id] || 0).toFixed(2)
    );
    return [
      metric.metricName,
      ...cohortValues,
      metric.spread.toFixed(2),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  exportCSV(csvContent, `cohort-comparison-${timestamp}`);
}

export function PowerUserComparison({ stats }: PowerUserComparisonProps) {
  // Handle edge case
  if (stats.cohorts.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cohort Comparison</CardTitle>
          <CardDescription>
            Select at least 2 cohorts to enable comparison analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="font-medium">Not enough cohorts selected.</p>
            <p className="text-sm">Select at least 2 cohorts from the comparison builder above.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Cohort Legend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Multi-Cohort Comparison</CardTitle>
              <CardDescription>
                Compare metrics across selected cohorts
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport(stats)}
            >
              <Download className="h-3 w-3 mr-2" />
              Export Comparison
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cohort Legend */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Cohorts</h4>
            <div className="flex flex-wrap gap-3">
              {stats.cohorts.map(({ cohort, metrics }, index) => (
                <div 
                  key={cohort.id}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full border"
                  style={{ borderColor: COHORT_COLOR_ARRAY[index % COHORT_COLOR_ARRAY.length] }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COHORT_COLOR_ARRAY[index % COHORT_COLOR_ARRAY.length] }}
                  />
                  <span className="text-sm font-medium">{cohort.name}</span>
                  <span className="text-xs text-gray-500">({metrics.userCount})</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.cohorts.map(({ cohort, metrics }, index) => (
              <StatCard
                key={cohort.id}
                label={cohort.name}
                value={metrics.userCount}
                color={COHORT_COLOR_ARRAY[index % COHORT_COLOR_ARRAY.length]}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Table */}
      <ComparisonMetricsTable stats={stats} />

      {/* Visual Comparisons */}
      <ComparisonChartsGrid stats={stats} />
      
      {/* Feature Adoption Heatmap */}
      <FeatureAdoptionHeatmap stats={stats} />
      
      {/* Radar Chart */}
      <RadarChartComparison stats={stats} />
    </div>
  );
}

