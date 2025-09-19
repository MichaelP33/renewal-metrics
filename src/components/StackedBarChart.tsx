'use client';

import React, { forwardRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { 
  ChartDataPoint, 
  ChartConfig, 
  CATEGORY_ORDER, 
  MODEL_COLORS,
  ModelCategory
} from '@/types';
import { 
  formatCurrency, 
  createTooltipFormatter, 
  shouldShowLabels,
  createDataLabelFormatter,
  yAxisTickFormatter
} from '@/lib/chart-utils';

interface StackedBarChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  enabledCategories: Set<ModelCategory>;
  title?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {payload
            .filter((entry: any) => entry.value > 0)
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between min-w-[200px]">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700">{entry.dataKey}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
        </div>
        {total > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-gray-700">Total:</span>
              <span className="text-gray-900">{formatCurrency(total)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const CustomDataLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  
  if (!value || value < 50) return null; // Don't show labels for small values
  
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="11"
      fontWeight="500"
    >
      {formatCurrency(value)}
    </text>
  );
};

export const StackedBarChart = forwardRef<HTMLDivElement, StackedBarChartProps>(
  ({ data, config, enabledCategories, title = "Monthly Model Costs", height = 400 }, ref) => {
    // Filter categories to only show enabled ones
    const visibleCategories = CATEGORY_ORDER.filter(category => 
      enabledCategories.has(category)
    );

    // Use the original data since we removed WoW support
    const processedData = data;

    const shouldShowDataLabels = shouldShowLabels(config, data.length);

    if (data.length === 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No data to display</p>
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
              ({config.timePeriod})
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart
                data={processedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap="10%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tickFormatter={yAxisTickFormatter}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {config.showLegend && (
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                )}
                
                {visibleCategories.map((category) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="costs"
                    fill={MODEL_COLORS[category]}
                    stroke={MODEL_COLORS[category]}
                    strokeWidth={0}
                  >
                    {shouldShowDataLabels && config.showDataLabels && (
                      <Cell>
                        <CustomDataLabel />
                      </Cell>
                    )}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              {data.length} period{data.length !== 1 ? 's' : ''} • {visibleCategories.length} categories
            </span>
            <span>
              Time period: {config.timePeriod}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
);

StackedBarChart.displayName = 'StackedBarChart';
