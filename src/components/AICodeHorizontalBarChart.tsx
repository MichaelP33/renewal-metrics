'use client';

import React, { forwardRef, useMemo } from 'react';
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
import { AICodeMetricsRow, AICodeMetricsConfig, AI_CODE_COLORS, UserNameData } from '@/types';
import { formatNumber, formatPercentage } from '@/lib/ai-code-data-processing';

interface AICodeHorizontalBarChartProps {
  data: AICodeMetricsRow[];
  config: AICodeMetricsConfig;
  userNames: Map<string, UserNameData>;
  title?: string;
  height?: number;
}

interface ChartDataPoint {
  email: string;
  emailShort: string;
  firstName: string;
  lastName: string;
  totalLines: number;
  aiLines: number;
  aiPercentage: number;
  value: number; // For full-width bars
  userKey: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.email}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between min-w-[200px]">
            <span className="text-sm text-gray-700">Total Lines:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatNumber(data.totalLines)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">AI Lines:</span>
            <span className="text-sm font-medium text-orange-600">
              {formatNumber(data.aiLines)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">AI Percentage:</span>
            <span className="text-sm font-medium text-orange-600">
              {formatPercentage(data.aiPercentage, 1)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface CustomYAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
    index: number;
  };
  chartData: ChartDataPoint[];
  useLabelNames: boolean;
}

const CustomYAxisTick = ({ x, y, payload, chartData, useLabelNames }: CustomYAxisTickProps) => {
  if (typeof x !== 'number' || typeof y !== 'number' || !payload) {
    return null;
  }

  const dataPoint = chartData.find(d => d.emailShort === payload.value);
  
  if (!dataPoint) {
    return (
      <text x={x} y={y} dy={4} textAnchor="end" fill="#374151" fontSize={11}>
        {payload.value}
      </text>
    );
  }

  // If using names and both are available, show stacked names with larger font
  if (useLabelNames && dataPoint.firstName && dataPoint.lastName) {
    return (
      <g>
        <text x={x} y={y - 6} textAnchor="end" fill="#374151" fontSize={14} fontWeight="400">
          {dataPoint.firstName}
        </text>
        <text x={x} y={y + 10} textAnchor="end" fill="#374151" fontSize={14} fontWeight="400">
          {dataPoint.lastName}
        </text>
      </g>
    );
  }

  // Otherwise show email (smaller font)
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#374151" fontSize={11}>
      {dataPoint.emailShort}
    </text>
  );
};

interface CustomCellProps {
  payload?: ChartDataPoint;
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
    return <rect x={0} y={0} width={0} height={0} fill="#E5E7EB" />;
  }

  // Calculate the orange bar width based on actual AI lines vs total lines
  const orangeBarWidth = (payload.aiLines / payload.totalLines) * width;

  return (
    <g>
      {/* Light grey background for the full bar (total lines) */}
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill="#E5E7EB" 
        stroke="#D1D5DB" 
        strokeWidth={1}
        rx={4}
        ry={4}
      />
      {/* Orange bar for the AI lines */}
      <rect 
        x={x} 
        y={y} 
        width={orangeBarWidth} 
        height={height} 
        fill={AI_CODE_COLORS.aiCode} 
        rx={4}
        ry={4}
      />
      {/* Percentage label inside the orange bar (if wide enough) */}
      {orangeBarWidth >= 40 && (
        <text
          x={x + orangeBarWidth / 2}
          y={y + height / 2}
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="500"
        >
          {formatPercentage(payload.aiPercentage, 0)}
        </text>
      )}
    </g>
  );
};

export const AICodeHorizontalBarChart = forwardRef<HTMLDivElement, AICodeHorizontalBarChartProps>(
  ({ data, config, userNames, title = "AI Code Usage by User", height = 400 }, ref) => {
    
    // Prepare chart data
    const chartData = useMemo((): ChartDataPoint[] => {
      return data.map(user => {
        const userKey = `${user.user_id}-${user.email}`;
        const nameData = userNames.get(userKey);
        
        // Truncate email for Y-axis display
        const emailParts = user.email.split('@');
        const emailShort = emailParts[0].length > 12 
          ? `${emailParts[0].substring(0, 12)}...@${emailParts[1]}`
          : user.email;

        return {
          email: user.email,
          emailShort,
          firstName: nameData?.first_name || '',
          lastName: nameData?.last_name || '',
          totalLines: user.total_lines_changed,
          aiLines: user.ai_lines_changed,
          aiPercentage: user.pct_ai_lines_changed,
          value: user.total_lines_changed, // For full-width bars
          userKey
        };
      }).reverse(); // Reverse to show highest values at top
    }, [data, userNames]);

    // Calculate max value for X-axis
    const maxTotalLines = useMemo(() => {
      if (chartData.length === 0) return 100;
      return Math.max(...chartData.map(d => d.totalLines));
    }, [chartData]);

    if (data.length === 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select users from the table above to display chart</p>
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
              ({data.length} user{data.length !== 1 ? 's' : ''})
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: config.useLabelNames ? 130 : 120, bottom: 5 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                
                <XAxis 
                  type="number"
                  domain={[0, maxTotalLines]}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                
                <YAxis 
                  type="category"
                  dataKey="emailShort"
                  tick={(props) => (
                    <CustomYAxisTick 
                      {...props} 
                      chartData={chartData} 
                      useLabelNames={config.useLabelNames}
                    />
                  )}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  width={config.useLabelNames ? 120 : 110}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* Single bar with custom cell renderer for aligned bars */}
                <Bar 
                  dataKey="value" 
                  isAnimationActive={false} 
                  shape={<CustomCell />}
                  maxBarSize={30}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              Showing AI code percentage for {data.length} selected user{data.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-sm bg-gray-300"
                />
                <span>Total Lines</span>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: AI_CODE_COLORS.aiCode }}
                />
                <span>AI Code Lines</span>
              </div>
            </div>
          </div>
          
          {/* Legend/explanation */}
          <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-800">
              <strong>Chart shows:</strong> Grey bars show total lines changed. Orange fill shows AI-generated lines. 
              Percentages indicate the ratio of AI code to total lines.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AICodeHorizontalBarChart.displayName = 'AICodeHorizontalBarChart';
