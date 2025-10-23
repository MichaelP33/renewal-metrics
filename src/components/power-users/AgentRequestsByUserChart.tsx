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
import { DataSourceLink } from '../DataSourceLink';
import { TAM_MISSION_CONTROL_HEX_URL } from '@/lib/data-source-links';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, Download } from 'lucide-react';
import { MasterUserRecord } from '@/types/power-users';
import { exportCSV } from '@/lib/export-utils';
import { getUserDisplayName, getShortDisplayName } from '@/lib/power-users/name-utils';

interface AgentRequestsByUserChartProps {
  data: MasterUserRecord[];
}

interface ChartDataPoint {
  email: string;
  displayName: string;
  shortName: string;
  firstName: string;
  lastName: string;
  requests: number;
}

const TOP_N_OPTIONS = [10, 20, 50, 100];

export function AgentRequestsByUserChart({ data }: AgentRequestsByUserChartProps) {
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

    // Sort by requests descending and take top N
    const sorted = [...filtered]
      .filter(row => row.totalAgentRequests !== undefined && row.totalAgentRequests > 0)
      .sort((a, b) => (b.totalAgentRequests ?? 0) - (a.totalAgentRequests ?? 0))
      .slice(0, topN);

    return sorted.map(row => {
      return {
        email: row.email,
        displayName: getUserDisplayName(row),
        shortName: getShortDisplayName(row),
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        requests: row.totalAgentRequests ?? 0,
      };
    }).reverse(); // Reverse to show highest at top
  }, [data, topN, searchText]);

  const handleExportCSV = () => {
    if (chartData.length === 0) return;

    const headers = ['Email', 'First Name', 'Last Name', 'Total Agent Requests'];
    const rows = chartData.map(row => [
      row.email,
      row.firstName,
      row.lastName,
      String(row.requests),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `agent-requests-by-user-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  };

  interface CustomTooltipPayload { payload: { displayName: string; email: string; requests: number } }
  interface CustomTooltipProps { active?: boolean; payload?: CustomTooltipPayload[] }
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.displayName}</p>
          {data.email !== data.displayName && (
            <p className="text-xs text-gray-500 mb-2">{data.email}</p>
          )}
          <div className="space-y-1">
            <div className="flex items-center justify-between min-w-[200px]">
              <span className="text-sm text-gray-700">Total Agent Requests:</span>
              <span className="text-sm font-medium text-gray-900">
                {data.requests.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const maxRequests = useMemo(() => {
    if (chartData.length === 0) return 100;
    return Math.max(...chartData.map(d => d.requests));
  }, [chartData]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No agent request data available</p>
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
            <span>Agent Requests by User</span>
          </div>
          <div className="flex items-center space-x-2">
            <DataSourceLink href={TAM_MISSION_CONTROL_HEX_URL} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center space-x-2"
            >
              <Download className="h-3 w-3" />
              <span>Export CSV</span>
            </Button>
          </div>
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
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              
              <XAxis 
                type="number"
                domain={[0, maxRequests]}
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              
              <YAxis 
                type="category"
                dataKey="shortName"
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={{ stroke: '#e0e0e0' }}
                width={110}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Bar dataKey="requests" fill="#8b5cf6" maxBarSize={30}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Showing {chartData.length} user{chartData.length !== 1 ? 's' : ''} with agent request data
        </div>
      </CardContent>
    </Card>
  );
}

