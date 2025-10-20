'use client';

import React, { useMemo } from 'react';
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
import { EnhancedMasterUserRecord, UserSegment } from '@/types/power-users';

interface UserSegmentationProps {
  data: EnhancedMasterUserRecord[];
  onSegmentClick?: (segment: UserSegment | null) => void;
}

interface SegmentData {
  name: string;
  value: number;
  color: string;
  segment: UserSegment;
}

const SEGMENT_COLORS: Record<UserSegment, string> = {
  'power': '#10b981',    // Green
  'active': '#3b82f6',   // Blue
  'casual': '#f59e0b',   // Orange
  'at-risk': '#ef4444',  // Red
};

const SEGMENT_LABELS: Record<UserSegment, string> = {
  'power': 'Power Users',
  'active': 'Active Users',
  'casual': 'Casual Users',
  'at-risk': 'At Risk',
};

export function UserSegmentation({ data, onSegmentClick }: UserSegmentationProps) {
  // Calculate segment counts
  const segmentData = useMemo((): SegmentData[] => {
    const counts: Record<UserSegment, number> = {
      'power': 0,
      'active': 0,
      'casual': 0,
      'at-risk': 0,
    };

    data.forEach(user => {
      if (user.segment) {
        counts[user.segment]++;
      }
    });

    return Object.entries(counts).map(([segment, value]) => ({
      name: SEGMENT_LABELS[segment as UserSegment],
      value,
      color: SEGMENT_COLORS[segment as UserSegment],
      segment: segment as UserSegment,
    })).filter(item => item.value > 0);
  }, [data]);

  const total = segmentData.reduce((sum, item) => sum + item.value, 0);

  interface TooltipDatum { payload: SegmentData }
  interface CustomTooltipProps { active?: boolean; payload?: TooltipDatum[] }
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      
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
              <span className="text-gray-600">Count:</span>
              <span className="font-medium">{data.value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-medium">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  interface CustomLabelEntry {
    cx?: number; cy?: number; midAngle?: number; outerRadius?: number; percent?: number; name?: string;
  }
  const CustomLabel = (entry: CustomLabelEntry) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = entry;
    
    if (!cx || !cy || !outerRadius || !midAngle || !name) return null;
    
    const percentage = (percent || 0) * 100;
    if (percentage < 5) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = Number(outerRadius) + 30;
    const centerX = Number(cx);
    const centerY = Number(cy);
    const angle = Number(midAngle);
    
    const x = centerX + radius * Math.cos(-angle * RADIAN);
    const y = centerY + radius * Math.sin(-angle * RADIAN);
    
    const lineStartRadius = Number(outerRadius) + 5;
    const lineEndRadius = Number(outerRadius) + 25;
    const lineStartX = centerX + lineStartRadius * Math.cos(-angle * RADIAN);
    const lineStartY = centerY + lineStartRadius * Math.sin(-angle * RADIAN);
    const lineEndX = centerX + lineEndRadius * Math.cos(-angle * RADIAN);
    const lineEndY = centerY + lineEndRadius * Math.sin(-angle * RADIAN);

    return (
      <g>
        <polyline
          points={`${lineStartX},${lineStartY} ${lineEndX},${lineEndY} ${x > centerX ? x - 5 : x + 5},${y}`}
          stroke="#d1d5db"
          strokeWidth="1"
          fill="none"
        />
        <text 
          x={x} 
          y={y - 2} 
          fill="#374151" 
          textAnchor={x > centerX ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize="14"
        >
          <tspan fontWeight="600">{name}</tspan>
          <tspan fontWeight="400"> {percentage.toFixed(0)}%</tspan>
        </text>
      </g>
    );
  };

  interface LegendEntry { color: string; value: string; payload: SegmentData }
  interface CustomLegendProps { payload?: LegendEntry[] }
  const CustomLegend = (props: CustomLegendProps) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry, index: number) => {
          const data = entry.payload;
          const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
          
          return (
            <button
              key={index}
              onClick={() => onSegmentClick?.(data.segment)}
              className="flex items-center space-x-2 text-sm hover:opacity-80 transition-opacity"
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">{entry.value}</span>
              <span className="text-gray-500 font-mono">
                ({data.value} - {percentage}%)
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  if (data.length === 0 || total === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <PieChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No user data available for segmentation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <PieChartIcon className="h-4 w-4" />
          <span>User Segmentation</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <RechartsPieChart>
              <Pie
                data={segmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={2}
              >
                {segmentData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                  />
                ))}
              </Pie>
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend content={<CustomLegend />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Segment Breakdown</h4>
            <div className="space-y-1">
              {segmentData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{((item.value / total) * 100).toFixed(1)}%</span>
                    <span className="text-gray-500 font-mono text-xs">
                      ({item.value.toLocaleString()})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <span>
              {segmentData.length} segments • Total: {total.toLocaleString()} users
            </span>
            <span>
              Largest: {segmentData[0] ? ((segmentData[0].value / total) * 100).toFixed(1) : '0'}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

