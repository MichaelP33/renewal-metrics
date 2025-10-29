'use client';

import React, { forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { OverageUsageData, OverageUsageConfig } from '@/types';
import { generateForecastData, formatMonthDisplay } from '@/lib/overage-usage-processing';
import { formatCurrency } from '@/lib/chart-utils';
import { OVERAGE_USAGE_COLORS } from '@/types';

interface OverageUsageChartProps {
  data: OverageUsageData;
  config: OverageUsageConfig;
  title?: string;
  height?: number;
}

interface ChartDataPoint {
  month: string;
  monthDisplay: string;
  spend: number;
  isForecast: boolean;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
}

interface BarProps {
  payload?: ChartDataPoint;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}


export const OverageUsageChart = forwardRef<HTMLDivElement, OverageUsageChartProps>(
  ({ data, config, title = "Overage Usage Spend", height = 400 }, ref) => {
    // Safety checks: ensure data and config are always defined
    const safeData = data || [];
    const safeConfig = config || {
      showLabels: true,
      showForecast: false,
      forecastMonths: 3,
      forecastMethod: 'linear' as const,
      customGrowthRate: null
    };
    // Sort data chronologically
    const sortedData = [...safeData].sort((a, b) => a.month.localeCompare(b.month));
    
    // Prepare actual data points
    const actualData: ChartDataPoint[] = sortedData.map(item => ({
      month: item.month,
      monthDisplay: formatMonthDisplay(item.month),
      spend: item.spend,
      isForecast: false
    }));

    // Generate forecast data if enabled
    const forecastData: ChartDataPoint[] = safeConfig.showForecast && sortedData.length >= 2
      ? generateForecastData(sortedData, safeConfig).map(item => ({
          month: item.month,
          monthDisplay: formatMonthDisplay(item.month),
          spend: item.spend,
          isForecast: true
        }))
      : [];

    // Combine actual and forecast data
    const chartData: ChartDataPoint[] = [...actualData, ...forecastData];

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: TooltipProps) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload as ChartDataPoint;
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold text-gray-900">{data.monthDisplay}</p>
            <p className={`text-sm ${data.isForecast ? 'text-orange-600' : 'text-gray-700'}`}>
              {data.isForecast ? 'Forecasted: ' : 'Actual: '}
              <span className="font-medium">{formatCurrency(data.spend)}</span>
            </p>
          </div>
        );
      }
      return null;
    };

    // Custom bar component for forecast bars with dashed stroke and labels
    const CustomBar = (props: BarProps) => {
      const { payload, x, y, width, height, value } = props;
      
      if (!x || !y || !width || !height || value === undefined || !payload) {
        return null;
      }
      
      if (payload.isForecast) {
        return (
          <g>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={OVERAGE_USAGE_COLORS.forecast}
              fillOpacity={0.5}
              stroke={OVERAGE_USAGE_COLORS.forecastStroke}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            {safeConfig.showLabels && value > 0 && (
              <text
                x={x + width / 2}
                y={y - 8}
                fill={OVERAGE_USAGE_COLORS.forecastStroke}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                style={{ pointerEvents: 'none' }}
              >
                {formatCurrency(value)}
              </text>
            )}
          </g>
        );
      }
      
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={OVERAGE_USAGE_COLORS.actual}
          />
          {safeConfig.showLabels && value > 0 && (
            <text
              x={x + width / 2}
              y={y - 8}
              fill="#333"
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              style={{ pointerEvents: 'none' }}
            >
              {formatCurrency(value)}
            </text>
          )}
        </g>
      );
    };

    if (chartData.length === 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please enter monthly spend data</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className="w-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: safeConfig.showLabels ? 40 : 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="10%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="monthDisplay"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />
                <Bar 
                  dataKey="spend" 
                  name="Spend"
                  shape={<CustomBar />}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isForecast ? OVERAGE_USAGE_COLORS.forecast : OVERAGE_USAGE_COLORS.actual}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              Total Months: {actualData.length}
              {forecastData.length > 0 && ` (${forecastData.length} forecasted)`}
            </span>
            {actualData.length > 0 && (
              <span>
                Total Actual Spend: {formatCurrency(actualData.reduce((sum, d) => sum + d.spend, 0))}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

OverageUsageChart.displayName = 'OverageUsageChart';

