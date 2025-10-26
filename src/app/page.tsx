'use client';

import { useDashboardData } from '@/contexts/DashboardDataContext';
import { OverviewSectionCard } from '@/components/OverviewSectionCard';
import { TrendingUp, Target, Users } from 'lucide-react';

export default function Home() {
  const {
    hasModelCostsData,
    hasWAUData,
    hasActiveUserGrowthData,
    hasPercentileData,
    hasMCPUsageData,
    hasRuleUsageData,
  } = useDashboardData();

  // Count loaded metrics for each section
  const generalAdoptionLoaded = [hasModelCostsData, hasWAUData].filter(Boolean).length;
  const teamTrendsLoaded = [hasActiveUserGrowthData, hasPercentileData, hasMCPUsageData, hasRuleUsageData].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">
            Account Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Analyze account adoption, engagement patterns, and usage trends across accounts. 
            Select a section below to upload account data and explore insights.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <OverviewSectionCard
            title="General adoption"
            description="Monitor account-level adoption metrics, usage costs, and engagement trends"
            icon={<TrendingUp className="h-8 w-8" />}
            href="/general-adoption"
            loadedCount={generalAdoptionLoaded}
            totalCount={2}
            themeColor="blue"
          />
          
          <OverviewSectionCard
            title="Team trends"
            description="Analyze feature adoption patterns and usage trends within customer accounts"
            icon={<Target className="h-8 w-8" />}
            href="/team-trends"
            loadedCount={teamTrendsLoaded}
            totalCount={4}
            themeColor="orange"
          />
          
          <OverviewSectionCard
            title="Power users"
            description="Identify and analyze power users and advanced feature adoption within accounts"
            icon={<Users className="h-8 w-8" />}
            href="/power-users"
            loadedCount={0}
            totalCount={3}
            themeColor="green"
          />
        </div>
      </div>
    </div>
  );
}
