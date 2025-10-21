'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Code, Download, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataSourceLink } from './DataSourceLink';
import { AI_CODE_METRICS_HEX_URL } from '@/lib/data-source-links';
import { AICodeMetricsTable } from './AICodeMetricsTable';
import { AICodeHorizontalBarChart } from './AICodeHorizontalBarChart';
import { AICodeMetricsRow, AICodeMetricsConfig, UserNameData } from '@/types';
import { exportAICodeMetricsToCSV, getTopUsers } from '@/lib/ai-code-data-processing';
import { exportCSV } from '@/lib/export-utils';

interface AICodeMetricsDashboardProps {
  rawData: AICodeMetricsRow[];
  config: AICodeMetricsConfig;
  onConfigChange: (config: AICodeMetricsConfig) => void;
}

export function AICodeMetricsDashboard({ 
  rawData, 
  config, 
  onConfigChange 
}: AICodeMetricsDashboardProps) {
  // State for selected users
  const [selectedUserKeys, setSelectedUserKeys] = useState<Set<string>>(() => {
    // Initialize with first 5 users by default
    const topUsers = getTopUsers(rawData, 5);
    return new Set(topUsers.map(user => `${user.user_id}-${user.email}`));
  });

  // State for user names (manually entered)
  const [userNames, setUserNames] = useState<Map<string, UserNameData>>(new Map());

  // Refs for export functionality
  const chartRef = useRef<HTMLDivElement>(null);

  // Get selected users data for chart
  const selectedUsersData = useMemo(() => {
    const selectedUsers = rawData.filter(user => 
      selectedUserKeys.has(`${user.user_id}-${user.email}`)
    );
    
    // Sort by total_lines_changed descending for consistent chart ordering
    return selectedUsers.sort((a, b) => b.total_lines_changed - a.total_lines_changed);
  }, [rawData, selectedUserKeys]);

  // Update selection when raw data changes (e.g., new upload)
  React.useEffect(() => {
    if (rawData.length > 0 && selectedUserKeys.size === 0) {
      const topUsers = getTopUsers(rawData, 5);
      setSelectedUserKeys(new Set(topUsers.map(user => `${user.user_id}-${user.email}`)));
    }
  }, [rawData, selectedUserKeys.size]);

  const handleSelectionChange = (newSelection: Set<string>) => {
    setSelectedUserKeys(newSelection);
  };

  const handleConfigChange = (newConfig: Partial<AICodeMetricsConfig>) => {
    onConfigChange({ ...config, ...newConfig });
  };

  const handleNameChange = (userKey: string, nameData: UserNameData) => {
    setUserNames(prev => {
      const newMap = new Map(prev);
      newMap.set(userKey, nameData);
      return newMap;
    });
  };

  const handleExportTableCSV = () => {
    if (rawData.length === 0) return;

    try {
      const csvContent = exportAICodeMetricsToCSV(rawData, userNames);
      const filename = `ai-code-metrics-${new Date().toISOString().split('T')[0]}`;
      exportCSV(csvContent, filename);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportSelectedCSV = () => {
    if (selectedUsersData.length === 0) return;

    try {
      const csvContent = exportAICodeMetricsToCSV(selectedUsersData, userNames);
      const filename = `ai-code-metrics-selected-${new Date().toISOString().split('T')[0]}`;
      exportCSV(csvContent, filename);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (rawData.length === 0) return null;

    const totalUsers = rawData.length;
    const totalLines = rawData.reduce((sum, user) => sum + user.total_lines_changed, 0);
    const totalAILines = rawData.reduce((sum, user) => sum + user.ai_lines_changed, 0);
    const avgAIPercentage = rawData.reduce((sum, user) => sum + user.pct_ai_lines_changed, 0) / totalUsers;
    const totalCommits = rawData.reduce((sum, user) => sum + user.commit_count, 0);

    return {
      totalUsers,
      totalLines,
      totalAILines,
      avgAIPercentage,
      totalCommits,
      overallAIPercentage: totalLines > 0 ? (totalAILines / totalLines) * 100 : 0
    };
  }, [rawData]);

  if (rawData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No AI Code Metrics Data
          </h3>
          <p className="text-gray-600">
            Upload an AI code metrics CSV file to view user statistics and visualizations.
          </p>
          <div className="mt-3">
            <DataSourceLink href={AI_CODE_METRICS_HEX_URL} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with data source link */}
      <div className="flex justify-end">
        <DataSourceLink href={AI_CODE_METRICS_HEX_URL} />
      </div>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Code className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Total Users
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Code className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalLines.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Total Lines Changed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Code className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {summaryStats.overallAIPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                Overall AI Code %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Code className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {summaryStats.totalCommits.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Total Commits
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.showDataLabels}
              onChange={(e) => handleConfigChange({ showDataLabels: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show data labels on chart</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.useLabelNames}
              onChange={(e) => handleConfigChange({ useLabelNames: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Use names as chart labels</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSelectedCSV}
            disabled={selectedUsersData.length === 0}
            className="flex items-center space-x-2"
          >
            <Download className="h-3 w-3" />
            <span>Export Selected</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTableCSV}
            className="flex items-center space-x-2"
          >
            <Download className="h-3 w-3" />
            <span>Export All</span>
          </Button>
        </div>
      </div>

      {/* User Selection Table */}
      <AICodeMetricsTable
        data={rawData}
        selectedUsers={selectedUserKeys}
        onSelectionChange={handleSelectionChange}
        maxSelection={config.maxSelectedUsers}
        title="User AI Code Metrics"
        userNames={userNames}
        onNameChange={handleNameChange}
      />

      {/* Horizontal Bar Chart */}
      <AICodeHorizontalBarChart
        ref={chartRef}
        data={selectedUsersData}
        config={config}
        userNames={userNames}
        title="AI Code Usage Visualization"
        height={Math.max(300, selectedUsersData.length * 40 + 100)} // Dynamic height based on number of users
      />

      {/* Additional Info */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <strong>How to use:</strong> Select up to {config.maxSelectedUsers} users from the table above to visualize their AI code usage in the chart below.
            </p>
            <p>
              <strong>Chart explanation:</strong> The horizontal bars show only the AI-generated portion of each user&apos;s code changes. 
              Bar length represents the number of AI lines, and percentages show the ratio of AI to total lines changed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
