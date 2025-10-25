'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DataSourceLink } from './DataSourceLink';
import { TAM_MISSION_CONTROL_HEX_URL } from '@/lib/data-source-links';
import { ActiveUserGrowthChart } from './ActiveUserGrowthChart';
import { ActiveUserGrowthControls } from './ActiveUserGrowthControls';
import { 
  ActiveUserGrowthRawRow,
  ActiveUserGrowthConfig
} from '@/types';
import { 
  processActiveUserGrowthData, 
  getActiveUserGrowthDateRange
} from '@/lib/active-user-growth-processing';
import { formatUserCount } from '@/lib/chart-utils';

interface ActiveUserGrowthDashboardProps {
  rawData: ActiveUserGrowthRawRow[];
  config: ActiveUserGrowthConfig;
  onConfigChange: (config: ActiveUserGrowthConfig) => void;
}

export function ActiveUserGrowthDashboard({ 
  rawData, 
  config, 
  onConfigChange 
}: ActiveUserGrowthDashboardProps) {
  // Get available date range
  const availableDateRange = useMemo(() => {
    return getActiveUserGrowthDateRange(rawData);
  }, [rawData]);

  // Process data based on current config
  const processedData = useMemo(() => {
    if (rawData.length === 0) return [];
    return processActiveUserGrowthData(rawData, config);
  }, [rawData, config]);

  const hasData = rawData.length > 0;
  const hasProcessedData = processedData.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active User Growth Data Available
          </h3>
          <p className="text-gray-600">
            Upload an Active User Growth CSV file to view analytics and visualizations.
          </p>
          <div className="mt-3">
            <DataSourceLink href={TAM_MISSION_CONTROL_HEX_URL} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const avgWAU = hasProcessedData 
    ? processedData.reduce((sum, week) => sum + week.agent_wau, 0) / processedData.length 
    : 0;
  const avgDailyUser = hasProcessedData 
    ? processedData.reduce((sum, week) => sum + week.agent_l4, 0) / processedData.length 
    : 0;
  const avgPowerUser = hasProcessedData 
    ? processedData.reduce((sum, week) => sum + week.agent_power_user, 0) / processedData.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with data source link */}
      <div className="flex justify-end">
        <DataSourceLink href={TAM_MISSION_CONTROL_HEX_URL} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {hasProcessedData ? formatUserCount(avgWAU) : '0'}
            </div>
            <div className="text-sm text-gray-600">
              Avg Agent WAU
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {hasProcessedData ? formatUserCount(avgDailyUser) : '0'}
            </div>
            <div className="text-sm text-gray-600">
              Avg Daily User
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {hasProcessedData ? formatUserCount(avgPowerUser) : '0'}
            </div>
            <div className="text-sm text-gray-600">
              Avg Power Users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {processedData.length}
            </div>
            <div className="text-sm text-gray-600">
              Data Points
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Section */}
      <ActiveUserGrowthControls
        config={config}
        onConfigChange={onConfigChange}
        availableRange={availableDateRange}
      />

      {/* Chart Section */}
      {hasProcessedData ? (
        <ActiveUserGrowthChart
          data={processedData}
          config={config}
          title="Agent WAU, Daily User, power users"
          height={400}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-600 mb-4">
              The current filters have excluded all data. Try adjusting your date range.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Current filters:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Date range: {config.dateRange 
                    ? `${config.dateRange.from.toDateString()} - ${config.dateRange.to.toDateString()}`
                    : 'All data'
                  }
                </li>
                <li>
                  Visible lines: {config.visibleLines.size} / 3
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />
    </div>
  );
}

