'use client';

import { useDashboardData } from '@/contexts/DashboardDataContext';
import { OverviewSectionCard } from '@/components/OverviewSectionCard';
import { TripleFileUpload } from '@/components/TripleFileUpload';
import { TrendingUp, Target, Users } from 'lucide-react';

export default function Home() {
  const {
    hasModelCostsData,
    hasWAUData,
    hasActiveUserGrowthData,
    hasPercentileData,
    hasMCPUsageData,
    hasRuleUsageData,
    handleModelCostsUpload,
    handleWAUUpload,
    handleAICodeUpload,
    handleActiveUserGrowthUpload,
    handlePercentileUpload,
    handleMCPUsageUpload,
    handleRuleUsageUpload,
    isLoading,
    error
  } = useDashboardData();

  // Count loaded metrics for each section
  const generalAdoptionLoaded = [hasModelCostsData, hasWAUData].filter(Boolean).length;
  const teamTrendsLoaded = [hasActiveUserGrowthData, hasPercentileData, hasMCPUsageData, hasRuleUsageData].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Renewal Metrics Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Track adoption, analyze costs, and monitor engagement across your organization
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <OverviewSectionCard
            title="General Adoption"
            description="Track overall product adoption, costs, and user engagement across your organization"
            icon={<TrendingUp className="h-8 w-8" />}
            href="/general-adoption"
            loadedCount={generalAdoptionLoaded}
            totalCount={2}
            themeColor="blue"
          />
          
          <OverviewSectionCard
            title="Team Trends"
            description="Detailed insights into feature adoption and usage patterns across different teams"
            icon={<Target className="h-8 w-8" />}
            href="/team-trends"
            loadedCount={teamTrendsLoaded}
            totalCount={4}
            themeColor="orange"
          />
          
          <OverviewSectionCard
            title="Power Users"
            description="Deep dive into power user behavior, AI code metrics, and advanced feature usage"
            icon={<Users className="h-8 w-8" />}
            href="/power-users"
            loadedCount={0}
            totalCount={3}
            themeColor="green"
          />
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Data</h2>
          <p className="text-gray-600 mb-6">
            Upload CSV files to analyze your metrics. You can upload from here or navigate to a specific section.
          </p>
          
          <TripleFileUpload
            onModelCostsUpload={handleModelCostsUpload}
            onWAUUpload={handleWAUUpload}
            onAICodeUpload={handleAICodeUpload}
            onActiveUserGrowthUpload={handleActiveUserGrowthUpload}
            onPercentileUpload={handlePercentileUpload}
            onMCPUsageUpload={handleMCPUsageUpload}
            onRuleUsageUpload={handleRuleUsageUpload}
            isLoading={isLoading}
            error={error}
            hasModelCostsData={hasModelCostsData}
            hasWAUData={hasWAUData}
            hasAICodeData={false}
            hasActiveUserGrowthData={hasActiveUserGrowthData}
            hasPercentileData={hasPercentileData}
            hasMCPUsageData={hasMCPUsageData}
            hasRuleUsageData={hasRuleUsageData}
          />
        </div>
      </div>
    </div>
  );
}
