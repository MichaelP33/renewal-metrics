'use client';

import React, { useRef, useMemo } from 'react';
import { Users, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WAUMoMChart } from './wau-mom-chart';
import { WAUWoWChart } from './wau-wow-chart';
import { 
  WAURawDataRow, 
  WAUProcessedDataRow, 
  WAUMoMData, 
  WAUWoWData,
  WAUChartConfig, 
  WAUFilterConfig,
  DateRange
} from '@/types';
import { 
  processWAUData, 
  aggregateWAUMoM, 
  aggregateWAUWoW,
  getWAUDataDateRange
} from '@/lib/wau-data-processing';
import { formatUserCount } from '@/lib/chart-utils';

interface WAUDashboardProps {
  rawData: WAURawDataRow[];
  filterConfig: WAUFilterConfig;
  chartConfig: WAUChartConfig;
  onFilterConfigChange: (config: WAUFilterConfig) => void;
  onChartConfigChange: (config: WAUChartConfig) => void;
}

export function WAUDashboard({ 
  rawData, 
  filterConfig, 
  chartConfig, 
  onFilterConfigChange, 
  onChartConfigChange 
}: WAUDashboardProps) {
  // Refs for export functionality
  const momChartRef = useRef<HTMLDivElement>(null);
  const wowChartRef = useRef<HTMLDivElement>(null);

  // Process data based on current filters
  const processedData = useMemo(() => {
    if (rawData.length === 0) return [];
    return processWAUData(rawData, filterConfig);
  }, [rawData, filterConfig]);

  const momData = useMemo(() => {
    return aggregateWAUMoM(processedData);
  }, [processedData]);

  const wowData = useMemo(() => {
    return aggregateWAUWoW(processedData);
  }, [processedData]);

  // Get available date range from data
  const availableDateRange = useMemo(() => {
    return getWAUDataDateRange(rawData);
  }, [rawData]);

  const hasData = rawData.length > 0;
  const hasProcessedData = processedData.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No WAU Data Available
          </h3>
          <p className="text-gray-600">
            Upload a WAU CSV file to view analytics and visualizations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {hasProcessedData ? formatUserCount(processedData.reduce((sum, week) => sum + week.wauCount, 0) / processedData.length) : '0'}
            </div>
            <div className="text-sm text-gray-600">
              Average WAU
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {processedData.length}
            </div>
            <div className="text-sm text-gray-600">
              Data Points
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {momData.length}
            </div>
            <div className="text-sm text-gray-600">
              Months
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">View Options</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onChartConfigChange({ ...chartConfig, viewType: 'MoM' })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  chartConfig.viewType === 'MoM'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month-over-Month
              </button>
              <button
                onClick={() => onChartConfigChange({ ...chartConfig, viewType: 'WoW' })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  chartConfig.viewType === 'WoW'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week-over-Week
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      {hasProcessedData ? (
        <>
          {chartConfig.viewType === 'MoM' ? (
            <WAUMoMChart
              ref={momChartRef}
              data={momData}
              config={chartConfig}
              title="Average WAUs MoM"
              height={400}
            />
          ) : (
            <WAUWoWChart
              ref={wowChartRef}
              data={wowData}
              config={chartConfig}
              title="WAUs Week-over-Week"
              height={400}
            />
          )}

          {/* Chart Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Chart Options</h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={chartConfig.showDataLabels}
                      onChange={(e) => onChartConfigChange({ 
                        ...chartConfig, 
                        showDataLabels: e.target.checked 
                      })}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Show data labels</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
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
                  Date range: {filterConfig.dateRange 
                    ? `${filterConfig.dateRange.from.toDateString()} - ${filterConfig.dateRange.to.toDateString()}`
                    : 'All data'
                  }
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
