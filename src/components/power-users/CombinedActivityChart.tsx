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
import { Checkbox } from '@/components/ui/checkbox';
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

interface CombinedActivityChartProps {
  data: MasterUserRecord[];
}

interface ChartDataPoint {
  email: string;
  displayName: string;
  shortName: string;
  firstName: string;
  lastName: string;
  requests: number;
  sessions: number;
}

const TOP_N_OPTIONS = [10, 20, 50, 100];

// Color constants matching existing chart colors
const COLORS = {
  requests: '#f54e00', // Primary brand orange
  sessions: '#D4A27F', // Tan/beige (consistent secondary)
};

export function CombinedActivityChart({ data }: CombinedActivityChartProps) {
  const [topN, setTopN] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [showRequests, setShowRequests] = useState(true);
  const [showSessions, setShowSessions] = useState(true);
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

    // Get users with either metric
    const withData = filtered.filter(row => 
      (row.totalAgentRequests !== undefined && row.totalAgentRequests > 0) ||
      (row.totalSessions !== undefined && row.totalSessions > 0)
    );

    // Sort by combined score or primary visible metric
    const sorted = [...withData].sort((a, b) => {
      if (showRequests && showSessions) {
        // Sort by combined total
        const aTotal = (a.totalAgentRequests ?? 0) + (a.totalSessions ?? 0);
        const bTotal = (b.totalAgentRequests ?? 0) + (b.totalSessions ?? 0);
        return bTotal - aTotal;
      } else if (showRequests) {
        return (b.totalAgentRequests ?? 0) - (a.totalAgentRequests ?? 0);
      } else {
        return (b.totalSessions ?? 0) - (a.totalSessions ?? 0);
      }
    }).slice(0, topN);

    return sorted.map(row => {
      return {
        email: row.email,
        displayName: getUserDisplayName(row),
        shortName: getShortDisplayName(row),
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        requests: row.totalAgentRequests ?? 0,
        sessions: row.totalSessions ?? 0,
      };
    }).reverse(); // Reverse to show highest at top
  }, [data, topN, searchText, showRequests, showSessions]);

  const handleExportCSV = () => {
    if (chartData.length === 0) return;

    const headers = ['Email', 'First Name', 'Last Name', 'Total Agent Requests', 'Total Sessions'];
    const rows = chartData.map(row => [
      row.email,
      row.firstName,
      row.lastName,
      String(row.requests),
      String(row.sessions),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `user-activity-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  };

  interface CustomTooltipPayload { 
    payload: { 
      displayName: string; 
      email: string; 
      requests: number;
      sessions: number;
    } 
  }
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
            {showRequests && (
              <div className="flex items-center justify-between min-w-[200px]">
                <span className="text-sm text-gray-700">Total Agent Requests:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.requests.toLocaleString()}
                </span>
              </div>
            )}
            {showSessions && (
              <div className="flex items-center justify-between min-w-[200px]">
                <span className="text-sm text-gray-700">Total Sessions:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.sessions.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const values = chartData.flatMap(d => {
      const result = [];
      if (showRequests) result.push(d.requests);
      if (showSessions) result.push(d.sessions);
      return result;
    });
    return Math.max(...values);
  }, [chartData, showRequests, showSessions]);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No activity data available</p>
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
            <span>User Activity</span>
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

          {/* Toggle controls */}
          <div className="flex items-center space-x-6">
            <Label className="text-sm font-medium">Show Metrics:</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="toggle-requests"
                checked={showRequests}
                onCheckedChange={(checked) => setShowRequests(checked === true)}
              />
              <Label htmlFor="toggle-requests" className="text-sm flex items-center space-x-2 cursor-pointer">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.requests }}></span>
                <span>Agent Requests</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="toggle-sessions"
                checked={showSessions}
                onCheckedChange={(checked) => setShowSessions(checked === true)}
              />
              <Label htmlFor="toggle-sessions" className="text-sm flex items-center space-x-2 cursor-pointer">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.sessions }}></span>
                <span>Sessions</span>
              </Label>
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
                domain={[0, maxValue]}
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
              
              {showRequests && (
                <Bar dataKey="requests" fill={COLORS.requests} maxBarSize={30} name="Agent Requests">
                  {chartData.map((entry, index) => (
                    <Cell key={`requests-cell-${index}`} />
                  ))}
                </Bar>
              )}
              
              {showSessions && (
                <Bar dataKey="sessions" fill={COLORS.sessions} maxBarSize={30} name="Sessions">
                  {chartData.map((entry, index) => (
                    <Cell key={`sessions-cell-${index}`} />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Showing {chartData.length} user{chartData.length !== 1 ? 's' : ''} with activity data
        </div>
      </CardContent>
    </Card>
  );
}

