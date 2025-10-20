'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Download } from 'lucide-react';
import { EnhancedMasterUserRecord } from '@/types/power-users';
import { exportCSV } from '@/lib/export-utils';

interface TopContributorsDashboardProps {
  data: EnhancedMasterUserRecord[];
}

const TOP_N_OPTIONS = [10, 20, 50];

interface LeaderboardEntry {
  email: string;
  firstName: string;
  lastName: string;
  value: number;
  rank: number;
}

export function TopContributorsDashboard({ data }: TopContributorsDashboardProps) {
  const [topN, setTopN] = useState(10);

  // Calculate top sessions
  const topSessions = useMemo((): LeaderboardEntry[] => {
    return [...data]
      .filter(user => user.totalSessions !== undefined && user.totalSessions > 0)
      .sort((a, b) => (b.totalSessions ?? 0) - (a.totalSessions ?? 0))
      .slice(0, topN)
      .map((user, index) => ({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        value: user.totalSessions ?? 0,
        rank: index + 1,
      }));
  }, [data, topN]);

  // Calculate top requests
  const topRequests = useMemo((): LeaderboardEntry[] => {
    return [...data]
      .filter(user => user.totalAgentRequests !== undefined && user.totalAgentRequests > 0)
      .sort((a, b) => (b.totalAgentRequests ?? 0) - (a.totalAgentRequests ?? 0))
      .slice(0, topN)
      .map((user, index) => ({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        value: user.totalAgentRequests ?? 0,
        rank: index + 1,
      }));
  }, [data, topN]);

  // Calculate top AI code
  const topAICode = useMemo((): LeaderboardEntry[] => {
    return [...data]
      .filter(user => user.aiLinesChanged !== undefined && user.aiLinesChanged > 0)
      .sort((a, b) => (b.aiLinesChanged ?? 0) - (a.aiLinesChanged ?? 0))
      .slice(0, topN)
      .map((user, index) => ({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        value: user.aiLinesChanged ?? 0,
        rank: index + 1,
      }));
  }, [data, topN]);

  const handleExportSessions = () => {
    const headers = ['Rank', 'Email', 'First Name', 'Last Name', 'Total Sessions'];
    const rows = topSessions.map(entry => [
      String(entry.rank),
      entry.email,
      entry.firstName,
      entry.lastName,
      String(entry.value),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `top-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  };

  const handleExportRequests = () => {
    const headers = ['Rank', 'Email', 'First Name', 'Last Name', 'Total Requests'];
    const rows = topRequests.map(entry => [
      String(entry.rank),
      entry.email,
      entry.firstName,
      entry.lastName,
      String(entry.value),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `top-requests-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  };

  const handleExportAICode = () => {
    const headers = ['Rank', 'Email', 'First Name', 'Last Name', 'AI Lines Changed'];
    const rows = topAICode.map(entry => [
      String(entry.rank),
      entry.email,
      entry.firstName,
      entry.lastName,
      String(entry.value),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `top-ai-code-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  };

  const LeaderboardCard = ({ 
    title, 
    entries, 
    onExport 
  }: { 
    title: string; 
    entries: LeaderboardEntry[];
    onExport: () => void;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>{title}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center space-x-2"
          >
            <Download className="h-3 w-3" />
            <span>Export</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No data available</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.email}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {entry.rank}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {entry.firstName && entry.lastName 
                        ? `${entry.firstName} ${entry.lastName}`
                        : entry.email}
                    </div>
                    {entry.firstName && entry.lastName && (
                      <div className="text-xs text-gray-500">{entry.email}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {entry.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Top Contributors</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Show Top:</span>
              <Select value={String(topN)} onValueChange={(value) => setTopN(Number(value))}>
                <SelectTrigger className="w-20">
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
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LeaderboardCard
          title="Most Sessions"
          entries={topSessions}
          onExport={handleExportSessions}
        />
        <LeaderboardCard
          title="Most Requests"
          entries={topRequests}
          onExport={handleExportRequests}
        />
        <LeaderboardCard
          title="Most AI Code"
          entries={topAICode}
          onExport={handleExportAICode}
        />
      </div>
    </div>
  );
}

