'use client';

import React, { forwardRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { WAUMoMData, WAUChartConfig, WAU_COLORS } from '@/types';
import { 
  formatUserCount, 
  wauYAxisTickFormatter,
  WAU_CHART_PRESETS
} from '@/lib/chart-utils';

interface WAUMoMChartProps {
  data: WAUMoMData[];
  config: WAUChartConfig;
  title?: string;
  height?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: WAUMoMData;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">Average WAU:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatUserCount(data.averageWAU)}
            </span>
          </div>
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">Total Weeks:</span>
            <span className="text-sm font-medium text-gray-900">
              {data.totalWeeks}
            </span>
          </div>
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">Total Usage:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatUserCount(data.totalUsage)}
            </span>
          </div>
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">Total Tabs:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatUserCount(data.totalTabs)}
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
  
  // Format as full number with comma separators, no abbreviations
  const formattedValue = Math.round(value).toLocaleString();
  
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="11"
      fontWeight="700"
    >
      {formattedValue}
    </text>
  );
};

export const WAUMoMChart = forwardRef<HTMLDivElement, WAUMoMChartProps>(
  ({ data, config, title = "Average WAUs MoM", height = 400 }, ref) => {
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
              (Month-over-Month)
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={WAU_CHART_PRESETS.mom.margin}
                barCategoryGap={WAU_CHART_PRESETS.mom.barCategoryGap}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="monthDisplay" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tickFormatter={wauYAxisTickFormatter}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Bar
                  dataKey="averageWAU"
                  fill={WAU_COLORS.primary}
                  stroke={WAU_COLORS.primary}
                  strokeWidth={0}
                  radius={[2, 2, 0, 0]}
                  label={config.showDataLabels ? <CustomDataLabel /> : false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              {data.length} month{data.length !== 1 ? 's' : ''} • Average WAU: {formatUserCount(data.reduce((sum, month) => sum + month.averageWAU, 0) / data.length)}
            </span>
            <span>
              View: Month-over-Month
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
);

WAUMoMChart.displayName = 'WAUMoMChart';
