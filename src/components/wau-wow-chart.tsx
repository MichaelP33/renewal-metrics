'use client';

import React, { forwardRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { WAUWoWData, WAUChartConfig, WAU_COLORS } from '@/types';
import { 
  formatUserCount, 
  formatUsageMetrics,
  formatRequestsPerUser,
  wauYAxisTickFormatter,
  WAU_CHART_PRESETS
} from '@/lib/chart-utils';

interface WAUWoWChartProps {
  data: WAUWoWData[];
  config: WAUChartConfig;
  title?: string;
  height?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: WAUWoWData;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.weekDisplay}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">WAU Count:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatUserCount(data.wauCount)}
            </span>
          </div>
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">Weekly Usage:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatUsageMetrics(data.weeklyUsage)}
            </span>
          </div>
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">Weekly Tabs:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatUsageMetrics(data.weeklyTabs)}
            </span>
          </div>
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">Requests per User:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatRequestsPerUser(data.requestsPer)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface DataLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}

const CustomDataLabel = (props: DataLabelProps) => {
  const { x, y, width, height, value } = props;
  
  if (!value || value < 10 || x === undefined || y === undefined || width === undefined || height === undefined) {
    return null; // Do not show labels for small values or undefined positions
  }
  
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="10"
      fontWeight="500"
    >
      {formatUserCount(value)}
    </text>
  );
};


export const WAUWoWChart = forwardRef<HTMLDivElement, WAUWoWChartProps>(
  ({ data, config, title = "WAUs Week-over-Week", height = 400 }, ref) => {
    if (data.length === 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No WAU data to display</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className="w-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>{title}</span>
            <span className="text-sm font-normal text-gray-500">
              (Week-over-Week)
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={WAU_CHART_PRESETS.wow.margin}
                barCategoryGap={WAU_CHART_PRESETS.wow.barCategoryGap}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="weekDisplay" 
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  hide={true} // Hide default labels, we will show month labels instead
                />
                <YAxis 
                  tickFormatter={wauYAxisTickFormatter}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Bar
                  dataKey="wauCount"
                  fill={WAU_COLORS.primary}
                  stroke={WAU_COLORS.primary}
                  strokeWidth={0}
                  radius={[1, 1, 0, 0]}
                >
                  {config.showDataLabels && data.length <= 20 && (
                    <Cell>
                      <CustomDataLabel />
                    </Cell>
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              {data.length} week{data.length !== 1 ? 's' : ''} • Average WAU: {formatUserCount(data.reduce((sum, week) => sum + week.wauCount, 0) / data.length)}
            </span>
            <span>
              View: Week-over-Week • Hover for week details
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
);

WAUWoWChart.displayName = 'WAUWoWChart';
