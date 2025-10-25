'use client';

import React, { forwardRef, useMemo, memo } from 'react';
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
import { ActiveUserGrowthProcessedRow, ActiveUserGrowthConfig, ACTIVE_USER_GROWTH_COLORS } from '@/types';
import { formatUserCount } from '@/lib/chart-utils';

interface ActiveUserGrowthChartProps {
  data: ActiveUserGrowthProcessedRow[];
  config: ActiveUserGrowthConfig;
  title?: string;
  height?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    name?: string;
  }>;
  label?: string | number;
}

const CustomTooltip = memo(({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between min-w-[200px]">
              <span className="text-sm text-gray-700 capitalize">
                {(entry.name ?? entry.dataKey.replace('_', ' '))}:
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
});

CustomTooltip.displayName = 'CustomTooltip';

const ActiveUserGrowthChartComponent = forwardRef<HTMLDivElement, ActiveUserGrowthChartProps>(
  ({ data, config, title = "Agent WAU, Daily User, power users", height = 400 }, ref) => {
    // Create stable dot style objects that won't change on re-renders
    const dotStyles = useMemo(() => ({
      agent_wau: { fill: ACTIVE_USER_GROWTH_COLORS.agent_wau, r: 4 },
      agent_l4: { fill: ACTIVE_USER_GROWTH_COLORS.agent_l4, r: 4 },
      agent_power_user: { fill: ACTIVE_USER_GROWTH_COLORS.agent_power_user, r: 4 }
    }), []);

    if (data.length === 0) {
      return (
        <Card ref={ref}>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active user growth data to display</p>
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
                  allowDuplicatedCategory={false}
                />
                <YAxis 
                  tickFormatter={formatUserCount}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickLine={{ stroke: '#e0e0e0' }}
                  label={{ value: 'Active Users', angle: -90, position: 'insideLeft' }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                
                {config.visibleLines.has('agent_wau') && (
                  <Line
                    type="monotone"
                    dataKey="agent_wau"
                    stroke={ACTIVE_USER_GROWTH_COLORS.agent_wau}
                    strokeWidth={2}
                    dot={dotStyles.agent_wau}
                    name="Agent WAU"
                    isAnimationActive={false}
                  />
                )}
                
                {config.visibleLines.has('agent_l4') && (
                  <Line
                    type="monotone"
                    dataKey="agent_l4"
                    stroke={ACTIVE_USER_GROWTH_COLORS.agent_l4}
                    strokeWidth={2}
                    dot={dotStyles.agent_l4}
                    name="Daily User"
                    isAnimationActive={false}
                  />
                )}
                
                {config.visibleLines.has('agent_power_user') && (
                  <Line
                    type="monotone"
                    dataKey="agent_power_user"
                    stroke={ACTIVE_USER_GROWTH_COLORS.agent_power_user}
                    strokeWidth={2}
                    dot={dotStyles.agent_power_user}
                    name="Agent Power User"
                    isAnimationActive={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart footer info */}
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
            <span>
              {data.length} week{data.length !== 1 ? 's' : ''} • 
              {' '}Avg WAU: {formatUserCount(data.reduce((sum, week) => sum + week.agent_wau, 0) / data.length)} • 
              {' '}Avg Daily User: {formatUserCount(data.reduce((sum, week) => sum + week.agent_l4, 0) / data.length)} • 
              {' '}Avg Power: {formatUserCount(data.reduce((sum, week) => sum + week.agent_power_user, 0) / data.length)}
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

ActiveUserGrowthChartComponent.displayName = 'ActiveUserGrowthChart';

// Wrap component with React.memo to prevent unnecessary re-renders
export const ActiveUserGrowthChart = memo(ActiveUserGrowthChartComponent);

