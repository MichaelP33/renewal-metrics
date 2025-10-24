'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedMasterUserRecord } from '@/types/power-users';
import { calculateComparisonStats, ComparisonStats } from '@/lib/power-users/comparison-stats';
import { ComparisonMetricsTable } from './ComparisonMetricsTable';
import { ComparisonChartsGrid } from './ComparisonChartsGrid';
import { Download, Info } from 'lucide-react';
import { exportCSV } from '@/lib/export-utils';

interface PowerUserComparisonProps {
  data: EnhancedMasterUserRecord[];
}

/**
 * Stat card component for displaying counts
 */
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    green: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}

/**
 * Exports comparison data as CSV
 */
function handleExport(stats: ComparisonStats): void {
  const headers = ['Metric', 'Power Users Avg', 'Non-Power Users Avg', 'Difference %', 'Ratio'];
  const rows = stats.metrics.map(metric => [
    metric.metricName,
    metric.powerUsers.mean.toFixed(2),
    metric.nonPowerUsers.mean.toFixed(2),
    metric.differencePercent.toFixed(1),
    metric.ratio.toFixed(2),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  exportCSV(csvContent, `power-user-comparison-${timestamp}`);
}

export function PowerUserComparison({ data }: PowerUserComparisonProps) {
  const stats = useMemo(() => calculateComparisonStats(data), [data]);

  // Handle empty states
  if (stats.powerUserCount === 0 || stats.nonPowerUserCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Power User Comparison</CardTitle>
          <CardDescription>
            Label users as power users in the Master Table to enable comparison analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {stats.powerUserCount === 0 && stats.nonPowerUserCount === 0 && (
              <div className="space-y-2">
                <Info className="h-12 w-12 mx-auto text-gray-400" />
                <p className="font-medium">No users have been labeled yet.</p>
                <p className="text-sm">Start by marking some users as power users in the Master Table.</p>
              </div>
            )}
            {stats.powerUserCount === 0 && stats.nonPowerUserCount > 0 && (
              <div className="space-y-2">
                <Info className="h-12 w-12 mx-auto text-gray-400" />
                <p className="font-medium">No power users labeled.</p>
                <p className="text-sm">Mark some users as power users to see comparisons.</p>
              </div>
            )}
            {stats.powerUserCount > 0 && stats.nonPowerUserCount === 0 && (
              <div className="space-y-2">
                <Info className="h-12 w-12 mx-auto text-gray-400" />
                <p className="font-medium">All users are marked as power users.</p>
                <p className="text-sm">Mark some users as non-power users to see comparisons.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Power User Comparison</CardTitle>
              <CardDescription>
                Compare productivity metrics between power users and non-power users
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
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Power Users"
              value={stats.powerUserCount}
              color="blue"
            />
            <StatCard
              label="Non-Power Users"
              value={stats.nonPowerUserCount}
              color="gray"
            />
            <StatCard
              label="Unlabeled"
              value={stats.unlabeledCount}
              color="yellow"
            />
            <StatCard
              label="Total Users"
              value={stats.totalCount}
              color="green"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Table */}
      <ComparisonMetricsTable stats={stats} />

      {/* Visual Comparisons */}
      <ComparisonChartsGrid stats={stats} />
    </div>
  );
}

