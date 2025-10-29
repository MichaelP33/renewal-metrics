'use client';

import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { OverageUsageChart } from './overage-usage-chart';
import { OverageUsageControls } from './overage-usage-controls';
import { OverageUsageData, OverageUsageConfig } from '@/types';
import { formatCurrency } from '@/lib/chart-utils';
import { calculateGrowthTrend, calculateAverageMoMGrowthRate, generateForecastData } from '@/lib/overage-usage-processing';

interface OverageUsageDashboardProps {
  data: OverageUsageData;
  config: OverageUsageConfig;
  onDataChange: (data: OverageUsageData) => void;
  onConfigChange: (config: OverageUsageConfig) => void;
}

export function OverageUsageDashboard({ 
  data, 
  config, 
  onDataChange, 
  onConfigChange 
}: OverageUsageDashboardProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Safety checks: ensure data and config are always defined
  const safeData = data || [];
  const safeConfig = config || {
    showLabels: true,
    showForecast: false,
    forecastMonths: 3,
    forecastMethod: 'linear' as const,
    customGrowthRate: null
  };
  const hasData = safeData.length > 0;
  const sortedData = [...safeData].sort((a, b) => a.month.localeCompare(b.month));

  // Calculate summary statistics
  const totalSpend = sortedData.reduce((sum, item) => sum + item.spend, 0);
  const averageMonthly = sortedData.length > 0 ? totalSpend / sortedData.length : 0;
  
  const highestMonth = sortedData.length > 0 
    ? sortedData.reduce((max, item) => item.spend > max.spend ? item : max, sortedData[0])
    : null;
  
  const lowestMonth = sortedData.length > 0 
    ? sortedData.reduce((min, item) => item.spend < min.spend ? item : min, sortedData[0])
    : null;

  const growthTrend = calculateGrowthTrend(sortedData);
  const avgMoMGrowth = calculateAverageMoMGrowthRate(sortedData);

  // Calculate forecast total if enabled
  const forecastData = safeConfig.showForecast && sortedData.length >= 2
    ? generateForecastData(sortedData, safeConfig)
    : [];
  const forecastTotal = forecastData.reduce((sum, item) => sum + item.spend, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalSpend)}
            </div>
            <div className="text-sm text-gray-600">
              Total Spend
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(averageMonthly)}
            </div>
            <div className="text-sm text-gray-600">
              Average Monthly
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
              {growthTrend >= 0 ? (
                <ArrowUp className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600" />
              )}
              <span>{Math.abs(growthTrend).toFixed(1)}%</span>
            </div>
            <div className="text-sm text-gray-600">
              Growth Trend
            </div>
            {sortedData.length >= 2 && (
              <div className="text-xs text-gray-500 mt-1">
                Avg MoM: {avgMoMGrowth.toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            {highestMonth ? (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(highestMonth.spend)}
                </div>
                <div className="text-sm text-gray-600">
                  Highest Month
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {highestMonth.month}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-400">—</div>
                <div className="text-sm text-gray-600">Highest Month</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controls Section */}
      <OverageUsageControls
        data={safeData}
        config={safeConfig}
        onDataChange={onDataChange}
        onConfigChange={onConfigChange}
      />

      {/* Chart Section */}
      {hasData ? (
        <OverageUsageChart
          ref={chartRef}
          data={safeData}
          config={safeConfig}
          title="Overage Usage Spend"
          height={400}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configure Overage Usage Data
            </h3>
            <p className="text-gray-600">
              Enter your monthly overage spend data above to generate the visualization.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Additional Insights */}
      {hasData && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usage Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Spend Overview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spend:</span>
                    <span className="font-medium">{formatCurrency(totalSpend)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Monthly:</span>
                    <span className="font-medium">{formatCurrency(averageMonthly)}</span>
                  </div>
                  {highestMonth && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Highest Month:</span>
                      <span className="font-medium">{formatCurrency(highestMonth.spend)}</span>
                    </div>
                  )}
                  {lowestMonth && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lowest Month:</span>
                      <span className="font-medium">{formatCurrency(lowestMonth.spend)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Growth Analysis</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Growth:</span>
                    <span className={`font-medium ${growthTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {growthTrend >= 0 ? '+' : ''}{growthTrend.toFixed(1)}%
                    </span>
                  </div>
                  {sortedData.length >= 2 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg MoM Growth:</span>
                      <span className={`font-medium ${avgMoMGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {avgMoMGrowth >= 0 ? '+' : ''}{avgMoMGrowth.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {safeConfig.showForecast && forecastData.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Forecast Total:</span>
                      <span className="font-medium text-orange-600">
                        {formatCurrency(forecastTotal)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

