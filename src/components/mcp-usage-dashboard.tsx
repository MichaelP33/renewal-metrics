'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Users, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MCPUsageChart } from './mcp-usage-chart';
import { DateRangePicker } from './DateRangePicker';
import { 
  MCPUsageRawRow,
  MCPUsageConfig,
  DateRange
} from '@/types';
import { 
  processMCPUsageData, 
  getMCPUsageDateRange
} from '@/lib/mcp-usage-processing';
import { formatUserCount } from '@/lib/chart-utils';

interface MCPUsageDashboardProps {
  rawData: MCPUsageRawRow[];
  config: MCPUsageConfig;
  onConfigChange: (config: MCPUsageConfig) => void;
}

export function MCPUsageDashboard({ 
  rawData, 
  config, 
  onConfigChange 
}: MCPUsageDashboardProps) {
  // Get available date range
  const availableDateRange = useMemo(() => {
    return getMCPUsageDateRange(rawData);
  }, [rawData]);

  // Process data based on current config
  const processedData = useMemo(() => {
    if (rawData.length === 0) return [];
    return processMCPUsageData(rawData, config);
  }, [rawData, config]);

  const hasData = rawData.length > 0;
  const hasProcessedData = processedData.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No MCP Usage Data Available
          </h3>
          <p className="text-gray-600">
            Upload a Weekly MCP Usage CSV file to view analytics and visualizations.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const avgMCPWAU = hasProcessedData 
    ? processedData.reduce((sum, week) => sum + week.mcp_usage_wau, 0) / processedData.length 
    : 0;
  const avgL4 = hasProcessedData 
    ? processedData.reduce((sum, week) => sum + week.agent_l4, 0) / processedData.length 
    : 0;

  const handleDateRangeChange = (dateRange: DateRange | null) => {
    onConfigChange({
      ...config,
      dateRange
    });
  };

  const handleShowDataLabelsChange = (showDataLabels: boolean) => {
    onConfigChange({
      ...config,
      showDataLabels
    });
  };

  const handleLineToggle = (lineName: 'mcp_usage_wau' | 'agent_l4') => {
    const newVisibleLines = new Set(config.visibleLines);
    
    if (newVisibleLines.has(lineName)) {
      newVisibleLines.delete(lineName);
    } else {
      newVisibleLines.add(lineName);
    }
    
    onConfigChange({
      ...config,
      visibleLines: newVisibleLines
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {hasProcessedData ? formatUserCount(avgMCPWAU) : '0'}
            </div>
            <div className="text-sm text-gray-600">
              Avg MCP Usage WAU
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {hasProcessedData ? formatUserCount(avgL4) : '0'}
            </div>
            <div className="text-sm text-gray-600">
              Avg Agent L4
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Visibility Controls */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Visibility</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="toggle-mcp-usage-wau"
                  checked={config.visibleLines.has('mcp_usage_wau')}
                  onCheckedChange={() => handleLineToggle('mcp_usage_wau')}
                />
                <Label htmlFor="toggle-mcp-usage-wau" className="text-sm font-medium cursor-pointer">
                  MCP Usage WAU
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="toggle-agent-l4-mcp"
                  checked={config.visibleLines.has('agent_l4')}
                  onCheckedChange={() => handleLineToggle('agent_l4')}
                />
                <Label htmlFor="toggle-agent-l4-mcp" className="text-sm font-medium cursor-pointer">
                  Agent L4
                </Label>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-data-labels-mcp"
                    checked={config.showDataLabels}
                    onCheckedChange={handleShowDataLabelsChange}
                  />
                  <Label htmlFor="show-data-labels-mcp" className="text-sm font-medium cursor-pointer">
                    Show data labels
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Range Picker */}
        <DateRangePicker
          dateRange={config.dateRange}
          onDateRangeChange={handleDateRangeChange}
          availableRange={availableDateRange}
        />
      </div>

      {/* Chart Section */}
      {hasProcessedData ? (
        <MCPUsageChart
          data={processedData}
          config={config}
          title="Weekly MCP Usage"
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
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />
    </div>
  );
}

