'use client';

import React, { forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { MAUUsageData, MAUUsageConfig } from '@/types';

interface MAUUsageChartProps {
  data: MAUUsageData;
  config: MAUUsageConfig;
  title?: string;
  height?: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
  count: number;
  total: number;
  percentage: number;
  color: string;
}

const MAU_COLORS = {
  agent: '#ED5F2E', // Orange color as requested
  tab: '#ED5F2E'    // Same orange color for consistency
};

export const MAUUsageChart = forwardRef<HTMLDivElement, MAUUsageChartProps>(
  ({ data, config, title = "% of MAUs Using Tab + Agent", height = 300 }, ref) => {
    // Prepare data for horizontal bar chart
    // Set all bars to 100% so they extend to full width, then we'll overlay the actual percentage
    const chartData: ChartDataPoint[] = [
      {
        name: 'Agent Use',
        value: 100, // Always 100% for full width
        count: data.agentUsers,
        total: data.activeUsers,
        percentage: data.agentPercentage,
        color: MAU_COLORS.agent
      },
      {
        name: 'Tab Use',
        value: 100, // Always 100% for full width
        count: data.tabUsers,
        total: data.activeUsers,
        percentage: data.tabPercentage,
        color: MAU_COLORS.tab
      }
    ];

    // Custom cell component that includes labels and background fill
    interface CustomCellProps {
      payload?: {
        value: number;
        color: string;
        name: string;
        percentage: number;
        count: number;
        total: number;
      };
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      [key: string]: unknown;
    }
    
    const CustomCell = (props: CustomCellProps) => {
      const { payload, x, y, width, height } = props;
      
      // Validate coordinates and payload
      if (typeof x !== 'number' || isNaN(x) || 
          typeof y !== 'number' || isNaN(y) ||
          typeof width !== 'number' || isNaN(width) ||
          typeof height !== 'number' || isNaN(height) ||
          !payload) {
        return <rect x={0} y={0} width={0} height={0} fill={MAU_COLORS.agent} />;
      }

      const labelText = `${payload.count} of ${payload.total} MAUs (${Math.round(payload.percentage)}%)`;
      const textColor = '#FFFFFF';
      
      // Calculate the orange bar width based on the actual percentage
      const orangeBarWidth = (payload.percentage / 100) * width;

      return (
        <g>
          {/* Light grey background for the full 100% bar */}
          <rect 
            x={x} 
            y={y} 
            width={width} 
            height={height} 
            fill="#F5F5F5" 
            stroke="#E0E0E0" 
            strokeWidth={1}
          />
          {/* Orange bar for the actual percentage */}
          <rect 
            x={x} 
            y={y} 
            width={orangeBarWidth} 
            height={height} 
            fill={payload.color} 
          />
          {config.showLabels && (
            <>
              <text
                x={x + 20}
                y={y + height / 2}
                fill={textColor}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize="14"
                fontWeight="600"
              >
                {payload.name}
              </text>
              <text
                x={x + 20}
                y={y + height / 2 + 18}
                fill={textColor}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="400"
              >
                {labelText}
              </text>
            </>
          )}
        </g>
      );
    };

    // Render helper state: only draw chart when we have a positive active user base
    if (data.activeUsers <= 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Please enter active user data</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className="w-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  width={70}
                />
                
                <Bar dataKey="value" isAnimationActive={false} shape={<CustomCell />}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              Total Active Users: {data.activeUsers.toLocaleString()}
            </span>
            <span>
              Agent: {data.agentUsers} • Tab: {data.tabUsers}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
);

MAUUsageChart.displayName = 'MAUUsageChart';
