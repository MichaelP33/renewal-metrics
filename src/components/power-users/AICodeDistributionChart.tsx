'use client';

import React, { useMemo, useState, useRef } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, Download } from 'lucide-react';
import { EnhancedMasterUserRecord } from '@/types/power-users';
import { exportCSV } from '@/lib/export-utils';

interface AICodeDistributionChartProps {
  data: EnhancedMasterUserRecord[];
}

interface ChartDataPoint {
  email: string;
  emailShort: string;
  firstName: string;
  lastName: string;
  totalLines: number;
  aiLines: number;
  aiPercentage: number;
  value: number;
}

const TOP_N_OPTIONS = [10, 20, 50, 100];
const AI_CODE_COLOR = '#f97316'; // Orange

export function AICodeDistributionChart({ data }: AICodeDistributionChartProps) {
  const [topN, setTopN] = useState(10);
  const [searchText, setSearchText] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

  // Filter and prepare chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    // Filter by search text if provided
    let filtered = data;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = data.filter(row => 
        row.email.toLowerCase().includes(searchLower) ||
        row.firstName?.toLowerCase().includes(searchLower) ||
        row.lastName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by AI lines descending and take top N
    const sorted = [...filtered]
      .filter(row => row.aiLinesChanged !== undefined && row.aiLinesChanged > 0)
      .sort((a, b) => (b.aiLinesChanged ?? 0) - (a.aiLinesChanged ?? 0))
      .slice(0, topN);

    return sorted.map(row => {
      const emailParts = row.email.split('@');
      const emailShort = emailParts[0].length > 12 
        ? `${emailParts[0].substring(0, 12)}...@${emailParts[1]}`
        : row.email;

      return {
        email: row.email,
        emailShort,
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        totalLines: row.totalLinesChanged ?? 0,
        aiLines: row.aiLinesChanged ?? 0,
        aiPercentage: row.pctAiCode ?? 0,
        value: row.totalLinesChanged ?? 0,
      };
    }).reverse(); // Reverse to show highest at top
  }, [data, topN, searchText]);

  const handleExportCSV = () => {
    if (chartData.length === 0) return;

    const headers = ['Email', 'First Name', 'Last Name', 'Total Lines', 'AI Lines', 'AI %'];
    const rows = chartData.map(row => [
      row.email,
      row.firstName,
      row.lastName,
      String(row.totalLines),
      String(row.aiLines),
      `${row.aiPercentage.toFixed(1)}%`,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `ai-code-distribution-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.email}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between min-w-[200px]">
              <span className="text-sm text-gray-700">Total Lines:</span>
              <span className="text-sm font-medium text-gray-900">
                {data.totalLines.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">AI Lines:</span>
              <span className="text-sm font-medium text-orange-600">
                {data.aiLines.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">AI Percentage:</span>
              <span className="text-sm font-medium text-orange-600">
                {data.aiPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomCell = (props: any) => {
    const { payload, x, y, width, height } = props;
    
    if (typeof x !== 'number' || typeof y !== 'number' ||
        typeof width !== 'number' || typeof height !== 'number' ||
        !payload) {
      return <rect x={0} y={0} width={0} height={0} fill="#E5E7EB" />;
    }

    const orangeBarWidth = (payload.aiLines / payload.totalLines) * width;

    return (
      <g>
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
        <rect 
          x={x} 
          y={y} 
          width={orangeBarWidth} 
          height={height} 
          fill={AI_CODE_COLOR} 
          rx={4}
          ry={4}
        />
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
            {payload.aiPercentage.toFixed(0)}%
          </text>
        )}
      </g>
    );
  };

  const maxTotalLines = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map(d => d.totalLines));
  }, [chartData]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No AI code data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={chartRef}>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>AI Code Distribution by User</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center space-x-2"
          >
            <Download className="h-3 w-3" />
            <span>Export CSV</span>
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm">Search Users</Label>
              <Input
                id="search"
                placeholder="Search by email or name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="top-n" className="text-sm">Show Top</Label>
              <Select value={String(topN)} onValueChange={(value) => setTopN(Number(value))}>
                <SelectTrigger id="top-n">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOP_N_OPTIONS.map(option => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              
              <XAxis 
                type="number"
                domain={[0, maxTotalLines]}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              
              <YAxis 
                type="category"
                dataKey="emailShort"
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={{ stroke: '#e0e0e0' }}
                width={110}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
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
        
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <span>
            Showing AI code percentage for {chartData.length} user{chartData.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm bg-gray-300" />
              <span>Total Lines</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: AI_CODE_COLOR }} />
              <span>AI Code Lines</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

