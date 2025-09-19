'use client';

import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, BarChart3, Percent } from 'lucide-react';
import { MAUUsageChart } from './mau-usage-chart';
import { MAUUsageControls } from './mau-usage-controls';
import { MAUUsageData, MAUUsageConfig } from '@/types';
import { formatUserCount } from '@/lib/chart-utils';

interface MAUUsageDashboardProps {
  data: MAUUsageData;
  config: MAUUsageConfig;
  onDataChange: (data: MAUUsageData) => void;
  onConfigChange: (config: MAUUsageConfig) => void;
}

export function MAUUsageDashboard({ 
  data, 
  config, 
  onDataChange, 
  onConfigChange 
}: MAUUsageDashboardProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const hasData = data.activeUsers > 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatUserCount(data.activeUsers)}
            </div>
            <div className="text-sm text-gray-600">
              Total Active Users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatUserCount(data.agentUsers)}
            </div>
            <div className="text-sm text-gray-600">
              Agent Users ({data.agentPercentage.toFixed(1)}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Percent className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatUserCount(data.tabUsers)}
            </div>
            <div className="text-sm text-gray-600">
              Tab Users ({data.tabPercentage.toFixed(1)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Section */}
      <MAUUsageControls
        data={data}
        config={config}
        onDataChange={onDataChange}
        onConfigChange={onConfigChange}
      />

      {/* Chart Section */}
      {hasData ? (
        <MAUUsageChart
          ref={chartRef}
          data={data}
          config={config}
          title="% of MAUs Using Tab + Agent"
          height={300}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configure MAU Usage Data
            </h3>
            <p className="text-gray-600">
              Enter your active user count and usage percentages above to generate the visualization.
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
                <h4 className="text-sm font-medium text-gray-700">Agent Adoption</h4>
                <div className="text-2xl font-bold text-orange-600">
                  {data.agentPercentage.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  {data.agentUsers.toLocaleString()} out of {data.activeUsers.toLocaleString()} users use the agent feature
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Tab Adoption</h4>
                <div className="text-2xl font-bold text-orange-600">
                  {data.tabPercentage.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  {data.tabUsers.toLocaleString()} out of {data.activeUsers.toLocaleString()} users use the tab feature
                </p>
              </div>
            </div>
            
            {/* Overlap Analysis */}
            {data.agentPercentage + data.tabPercentage > 100 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The combined percentage exceeds 100%, indicating user overlap between agent and tab usage.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
