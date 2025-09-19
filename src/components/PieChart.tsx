'use client';

import React, { forwardRef } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { 
  PieChartData, 
  ChartConfig
} from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/chart-utils';

interface PieChartProps {
  data: PieChartData[];
  config: ChartConfig;
  title?: string;
  size?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PieChartData;
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-semibold text-gray-900">{data.name}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between min-w-[150px]">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">{formatCurrency(data.value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Percentage:</span>
            <span className="font-medium">{formatPercentage(data.percentage)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomLabel = (entry: any) => {
  const { cx, cy, midAngle, outerRadius, percent, name, value } = entry;
  
  // Type guards and defaults
  if (!cx || !cy || !outerRadius || !midAngle || !name || !value) return null;
  
  // Only show label if percentage is above 2% to avoid cluttering
  const percentage = (percent || 0) * 100;
  if (percentage < 2) return null;
  
  const RADIAN = Math.PI / 180;
  const radius = Number(outerRadius) + 30; // Position outside the pie
  const centerX = Number(cx);
  const centerY = Number(cy);
  const angle = Number(midAngle);
  
  const x = centerX + radius * Math.cos(-angle * RADIAN);
  const y = centerY + radius * Math.sin(-angle * RADIAN);
  
  // Calculate line points for the leader line
  const lineStartRadius = Number(outerRadius) + 5;
  const lineEndRadius = Number(outerRadius) + 25;
  const lineStartX = centerX + lineStartRadius * Math.cos(-angle * RADIAN);
  const lineStartY = centerY + lineStartRadius * Math.sin(-angle * RADIAN);
  const lineEndX = centerX + lineEndRadius * Math.cos(-angle * RADIAN);
  const lineEndY = centerY + lineEndRadius * Math.sin(-angle * RADIAN);

  return (
    <g>
      {/* Leader line */}
      <polyline
        points={`${lineStartX},${lineStartY} ${lineEndX},${lineEndY} ${x > centerX ? x - 5 : x + 5},${y}`}
        stroke="#d1d5db"
        strokeWidth="1"
        fill="none"
      />
      
      {/* Label text */}
      <text 
        x={x} 
        y={y - 2} 
        fill="#374151" 
        textAnchor={x > centerX ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="14"
      >
        {/* Model name (bold) */}
        <tspan fontWeight="600">{name}</tspan>
        {/* Percentage and amount */}
        <tspan fontWeight="400"> {formatPercentage(percentage)} ({formatCurrency(Number(value))})</tspan>
      </text>
    </g>
  );
};

interface LegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: PieChartData;
  }>;
}

const CustomLegend = (props: LegendProps) => {
  const { payload } = props;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry, index: number) => {
        const data = entry.payload;
        return (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.value}</span>
            <span className="text-gray-500 font-mono">
              ({formatCurrency(data.value)})
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  ({ data, config, title = "Model Cost Distribution", size = 300 }, ref) => {
    // Calculate total for validation
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (data.length === 0 || total === 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <PieChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data to display</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className="w-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <PieChartIcon className="h-4 w-4" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height: size + 150 }}>
            <ResponsiveContainer>
              <RechartsPieChart>
                <Pie
                  data={data.map(item => ({ ...item, [item.name]: item.value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={config.showDataLabels ? CustomLabel : false}
                  outerRadius={size / 2 - 60}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                
                <Tooltip content={<CustomTooltip />} />
                
                {config.showLegend && (
                  <Legend content={<CustomLegend />} />
                )}
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary statistics */}
          <div className="mt-4 space-y-3">
            {/* Top categories */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Top Categories</h4>
              <div className="space-y-1">
                {data.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatPercentage(item.percentage)}</span>
                      <span className="text-gray-500 font-mono text-xs">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart footer info */}
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
              <span>
                {data.length} categories • Total: {formatCurrency(total)}
              </span>
              <span>
                Largest: {formatPercentage(data[0]?.percentage || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

PieChart.displayName = 'PieChart';
