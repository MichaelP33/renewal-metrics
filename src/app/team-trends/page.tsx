'use client';

import React, { useState } from 'react';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { TeamTrendsUpload } from '@/components/TeamTrendsUpload';
import { ActiveUserGrowthDashboard } from '@/components/ActiveUserGrowthDashboard';
import { PercentileDashboard } from '@/components/PercentileDashboard';
import { MCPUsageDashboard } from '@/components/mcp-usage-dashboard';
import { RuleUsageDashboard } from '@/components/rule-usage-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { processPercentileData } from '@/lib/percentile-data-processing';

export default function TeamTrendsPage() {
  const { 
    activeUserGrowthRawData,
    percentileRawData,
    mcpUsageRawData,
    ruleUsageRawData,
    activeUserGrowthConfig,
    percentileConfig,
    mcpUsageConfig,
    ruleUsageConfig,
    setActiveUserGrowthConfig,
    setPercentileConfig,
    setMCPUsageConfig,
    setRuleUsageConfig,
    handleActiveUserGrowthUpload,
    handlePercentileUpload,
    handleMCPUsageUpload,
    handleRuleUsageUpload,
    isLoading,
    error
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState<'ACTIVE_USER_GROWTH' | 'PERCENTILE_DATA' | 'MCP_USAGE' | 'RULE_USAGE'>('ACTIVE_USER_GROWTH');

  const handleActiveUserGrowthConfigChange = (config: any) => {
    setActiveUserGrowthConfig(config);
  };

  const handlePercentileConfigChange = (config: any) => {
    setPercentileConfig(config);
  };

  const handleMCPUsageConfigChange = (config: any) => {
    setMCPUsageConfig(config);
  };

  const handleRuleUsageConfigChange = (config: any) => {
    setRuleUsageConfig(config);
  };

  const hasActiveUserGrowthData = activeUserGrowthRawData.length > 0;
  const hasPercentileData = percentileRawData.length > 0;
  const hasMCPUsageData = mcpUsageRawData.length > 0;
  const hasRuleUsageData = ruleUsageRawData.length > 0;

  // Process Percentile Distribution data
  const processedPercentileData = React.useMemo(() => {
    if (percentileRawData.length === 0) return [];
    return processPercentileData(percentileRawData);
  }, [percentileRawData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Team Adoption Trends
          </h1>
          <p className="text-gray-600">
            Detailed insights into feature adoption and usage patterns across different teams
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <TeamTrendsUpload
            onActiveUserGrowthUpload={handleActiveUserGrowthUpload}
            onPercentileUpload={handlePercentileUpload}
            onMCPUsageUpload={handleMCPUsageUpload}
            onRuleUsageUpload={handleRuleUsageUpload}
            isLoading={isLoading}
            error={error}
            hasActiveUserGrowthData={hasActiveUserGrowthData}
            hasPercentileData={hasPercentileData}
            hasMCPUsageData={hasMCPUsageData}
            hasRuleUsageData={hasRuleUsageData}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('ACTIVE_USER_GROWTH')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ACTIVE_USER_GROWTH'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Agent WAU Analytics</span>
                  {hasActiveUserGrowthData && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Loaded
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('PERCENTILE_DATA')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'PERCENTILE_DATA'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Percentile Distribution</span>
                  {hasPercentileData && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Loaded
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('MCP_USAGE')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'MCP_USAGE'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Weekly MCP Usage</span>
                  {hasMCPUsageData && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Loaded
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('RULE_USAGE')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'RULE_USAGE'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Weekly Rule Usage</span>
                  {hasRuleUsageData && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Loaded
                    </span>
                  )}
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'ACTIVE_USER_GROWTH' && hasActiveUserGrowthData && (
          <ActiveUserGrowthDashboard
            rawData={activeUserGrowthRawData}
            config={activeUserGrowthConfig}
            onConfigChange={handleActiveUserGrowthConfigChange}
          />
        )}

        {activeTab === 'PERCENTILE_DATA' && hasPercentileData && (
          <PercentileDashboard
            data={processedPercentileData}
            config={percentileConfig}
            onConfigChange={handlePercentileConfigChange}
          />
        )}

        {activeTab === 'MCP_USAGE' && hasMCPUsageData && (
          <MCPUsageDashboard
            rawData={mcpUsageRawData}
            config={mcpUsageConfig}
            onConfigChange={handleMCPUsageConfigChange}
          />
        )}

        {activeTab === 'RULE_USAGE' && hasRuleUsageData && (
          <RuleUsageDashboard
            rawData={ruleUsageRawData}
            config={ruleUsageConfig}
            onConfigChange={handleRuleUsageConfigChange}
          />
        )}

        {/* Show message if no data for active tab */}
        {((activeTab === 'ACTIVE_USER_GROWTH' && !hasActiveUserGrowthData) ||
          (activeTab === 'PERCENTILE_DATA' && !hasPercentileData) ||
          (activeTab === 'MCP_USAGE' && !hasMCPUsageData) ||
          (activeTab === 'RULE_USAGE' && !hasRuleUsageData)) && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'ACTIVE_USER_GROWTH'
                  ? 'Upload an active user growth CSV file to view agent WAU analytics.'
                  : activeTab === 'PERCENTILE_DATA'
                  ? 'Upload a percentile distribution CSV file to view percentile analytics.'
                  : activeTab === 'MCP_USAGE'
                  ? 'Upload a weekly MCP usage CSV file to view MCP usage analytics.'
                  : 'Upload a weekly rule usage CSV file to view rule usage analytics.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

