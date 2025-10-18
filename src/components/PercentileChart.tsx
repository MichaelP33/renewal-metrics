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
  LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { PercentileDataRow, PercentileConfig, PERCENTILE_COLORS } from '@/types';

interface PercentileChartProps {
  data: PercentileDataRow[];
  config: PercentileConfig;
  title?: string;
  height?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">Percentile: {label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between min-w-[180px]">
              <span className="text-sm text-gray-700">Interactions:</span>
              <span className="text-sm font-medium text-gray-900">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}

const CustomLabel = (props: CustomLabelProps) => {
  const { x, y, width, value } = props;
  if (!x || !y || !width || value === undefined) return null;
  
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#666"
      textAnchor="middle"
      fontSize={10}
      fontWeight={500}
    >
      {value.toLocaleString()}
    </text>
  );
};

export const PercentileChart = forwardRef<HTMLDivElement, PercentileChartProps>(
  ({ data, config, title = "Percentile Distribution", height = 400 }, ref) => {
    if (data.length === 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No percentile data to display</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className="w-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-orange-600" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="percentile" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  label={{ value: 'Percentile', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  label={{ value: 'Interactions', angle: -90, position: 'insideLeft' }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Bar 
                  dataKey="interactions" 
                  fill={PERCENTILE_COLORS.bar}
                  radius={[4, 4, 0, 0]}
                >
                  {config.showDataLabels && <LabelList content={<CustomLabel />} />}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              {data.length} percentile{data.length !== 1 ? 's' : ''} • 
              {' '}Max: {Math.max(...data.map(d => d.interactions)).toLocaleString()} • 
              {' '}Min: {Math.min(...data.map(d => d.interactions)).toLocaleString()} • 
              {' '}Median: {data[Math.floor(data.length / 2)]?.interactions.toLocaleString()}
            </span>
            <span>
              Hover for details
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
);

PercentileChart.displayName = 'PercentileChart';

