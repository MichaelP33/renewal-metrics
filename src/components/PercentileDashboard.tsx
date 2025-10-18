'use client';

import React, { useMemo, useRef } from 'react';
import { BarChart3, TrendingUp, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PercentileChart } from './PercentileChart';
import { PercentileControls } from './PercentileControls';
import { PercentileDataRow, PercentileConfig } from '@/types';

interface PercentileDashboardProps {
  data: PercentileDataRow[];
  config: PercentileConfig;
  onConfigChange: (config: PercentileConfig) => void;
}

export function PercentileDashboard({ 
  data, 
  config, 
  onConfigChange 
}: PercentileDashboardProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const hasData = data.length > 0;

  // Filter data based on config
  const filteredData = useMemo(() => {
    if (!hasData) return [];
    if (config.exclude100thPercentile) {
      return data.filter(d => d.percentile < 100);
    }
    return data;
  }, [data, hasData, config.exclude100thPercentile]);

  // Calculate summary stats based on filtered data
  const maxInteractions = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return Math.max(...filteredData.map(d => d.interactions));
  }, [filteredData]);

  const minInteractions = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return Math.min(...filteredData.map(d => d.interactions));
  }, [filteredData]);

  const medianInteractions = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const sorted = [...filteredData].sort((a, b) => a.interactions - b.interactions);
    const mid = Math.floor(sorted.length / 2);
    return sorted[mid]?.interactions || 0;
  }, [filteredData]);

  const medianPercentile = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const sorted = [...filteredData].sort((a, b) => a.percentile - b.percentile);
    const mid = Math.floor(sorted.length / 2);
    return sorted[mid]?.percentile || 0;
  }, [filteredData]);

  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Percentile Data Available
          </h3>
          <p className="text-gray-600">
            Upload a percentile distribution CSV file to view analytics and visualizations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {filteredData.length}
            </div>
            <div className="text-sm text-gray-600">
              Data Points {config.exclude100thPercentile && '(excl. 100th)'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {maxInteractions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Max Interactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Percent className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {medianPercentile}
            </div>
            <div className="text-sm text-gray-600">
              Median Percentile
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {medianInteractions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Median Interactions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Section */}
      <PercentileControls
        config={config}
        onConfigChange={onConfigChange}
      />

      {/* Chart Section */}
      {filteredData.length > 0 && (
        <PercentileChart
          ref={chartRef}
          data={filteredData}
          config={config}
          title={config.exclude100thPercentile ? "Percentile Distribution Chart (excl. 100th percentile)" : "Percentile Distribution Chart"}
          height={400}
        />
      )}

      {/* Additional Insights */}
      {hasData && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribution Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Range</h4>
                <div className="text-2xl font-bold text-orange-600">
                  {minInteractions.toLocaleString()} - {maxInteractions.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">
                  Interaction count spans from {minInteractions.toLocaleString()} to {maxInteractions.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Distribution Type</h4>
                <div className="text-2xl font-bold text-orange-600">
                  {maxInteractions > medianInteractions * 10 ? 'Highly Skewed' : 'Normal'}
                </div>
                <p className="text-sm text-gray-600">
                  {maxInteractions > medianInteractions * 10 
                    ? 'Most interactions concentrated at higher percentiles'
                    : 'Relatively even distribution across percentiles'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Data Coverage</h4>
                <div className="text-2xl font-bold text-orange-600">
                  {filteredData[filteredData.length - 1]?.percentile || 0}%
                </div>
                <p className="text-sm text-gray-600">
                  Highest percentile value {config.exclude100thPercentile ? '(100th excluded)' : 'in dataset'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

