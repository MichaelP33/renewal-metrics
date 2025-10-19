'use client';

import React, { forwardRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { MCPUsageProcessedRow, MCPUsageConfig, MCP_USAGE_COLORS } from '@/types';
import { formatUserCount } from '@/lib/chart-utils';

interface MCPUsageChartProps {
  data: MCPUsageProcessedRow[];
  config: MCPUsageConfig;
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
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between min-w-[200px]">
              <span className="text-sm text-gray-700 capitalize">
                {entry.dataKey === 'mcp_usage_wau' ? 'MCP Usage WAU' : 'Agent L4'}:
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatUserCount(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const MCPUsageChart = forwardRef<HTMLDivElement, MCPUsageChartProps>(
  ({ data, config, title = "Weekly MCP Usage", height = 400 }, ref) => {
    if (data.length === 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No MCP usage data to display</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className="w-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="weekDisplay" 
                  tick={{ fontSize: 10 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={formatUserCount}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  label={{ value: 'Number of MCP Users', angle: -90, position: 'insideLeft' }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                
                {config.visibleLines.has('mcp_usage_wau') && (
                  <Line
                    type="monotone"
                    dataKey="mcp_usage_wau"
                    stroke={MCP_USAGE_COLORS.mcp_usage_wau}
                    strokeWidth={2}
                    dot={{ fill: MCP_USAGE_COLORS.mcp_usage_wau, r: 4 }}
                    name="MCP Usage WAU"
                    label={config.showDataLabels ? { position: 'top', fontSize: 10 } : undefined}
                  />
                )}
                
                {config.visibleLines.has('agent_l4') && (
                  <Line
                    type="monotone"
                    dataKey="agent_l4"
                    stroke={MCP_USAGE_COLORS.agent_l4}
                    strokeWidth={2}
                    dot={{ fill: MCP_USAGE_COLORS.agent_l4, r: 4 }}
                    name="Agent L4"
                    label={config.showDataLabels ? { position: 'top', fontSize: 10 } : undefined}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              {data.length} week{data.length !== 1 ? 's' : ''} • 
              {' '}Avg MCP WAU: {formatUserCount(data.reduce((sum, week) => sum + week.mcp_usage_wau, 0) / data.length)} • 
              {' '}Avg L4: {formatUserCount(data.reduce((sum, week) => sum + week.agent_l4, 0) / data.length)}
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

MCPUsageChart.displayName = 'MCPUsageChart';

