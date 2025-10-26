'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useDashboardData } from '@/contexts/DashboardDataContext';
import { GeneralAdoptionUpload } from '@/components/GeneralAdoptionUpload';
import { WAUDashboard } from '@/components/wau-analytics-dashboard';
import { MAUUsageDashboard } from '@/components/mau-usage-dashboard';
import { DateRangePicker } from '@/components/DateRangePicker';
import { ModelSelector } from '@/components/ModelSelector';
import { ChartControls } from '@/components/ChartControls';
import { ExportControls } from '@/components/ExportControls';
import { StackedBarChart } from '@/components/StackedBarChart';
import { PieChart } from '@/components/PieChart';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, AlertCircle, BarChart3, PieChart as PieChartIcon, Table } from 'lucide-react';
import { 
  ModelCategory, 
  CATEGORY_ORDER,
  DateRange,
  ChartConfig,
  MAUUsageData,
  MAUUsageConfig
} from '@/types';
import { 
  processData, 
  aggregateData, 
  prepareChartData,
  preparePieChartData,
  getDataDateRange
} from '@/lib/data-processing';

export default function GeneralAdoptionPage() {
  const { 
    rawData,
    wauRawData,
    mauUsageData,
    mauUsageConfig,
    wauFilterConfig,
    wauChartConfig,
    filterConfig,
    chartConfig,
    setFilterConfig,
    setChartConfig,
    setWAUFilterConfig,
    setWAUChartConfig,
    setMAUUsageData,
    setMAUUsageConfig,
    handleModelCostsUpload,
    handleWAUUpload,
    isLoading,
    error
  } = useDashboardData();

  const [activeTab, setActiveTab] = useState<'MODEL_COSTS' | 'WAU_ANALYTICS' | 'MAU_USAGE'>('MODEL_COSTS');

  // Refs for export functionality
  const dashboardRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const dataTableRef = useRef<HTMLDivElement>(null);

  // Process data based on current filters
  const processedData = useMemo(() => {
    if (rawData.length === 0) return [];
    return processData(rawData, filterConfig);
  }, [rawData, filterConfig]);

  const aggregatedData = useMemo(() => {
    return aggregateData(processedData, chartConfig.timePeriod);
  }, [processedData, chartConfig.timePeriod]);

  const chartData = useMemo(() => {
    return prepareChartData(aggregatedData);
  }, [aggregatedData]);

  const pieChartData = useMemo(() => {
    return preparePieChartData(aggregatedData);
  }, [aggregatedData]);

  // Get available date range from data
  const availableDateRange = useMemo(() => {
    return getDataDateRange(rawData);
  }, [rawData]);

  // Category counts for model selector
  const categoryCounts = useMemo(() => {
    const counts: Record<ModelCategory, number> = {} as Record<ModelCategory, number>;
    
    CATEGORY_ORDER.forEach(category => {
      counts[category] = processedData.filter(row => row.category === category).length;
    });

    return counts;
  }, [processedData]);

  const handleDateRangeChange = (dateRange: DateRange | null) => {
    setFilterConfig(prev => ({
      ...prev,
      dateRange
    }));
  };

  const handleCategoriesChange = (categories: Set<ModelCategory>) => {
    setFilterConfig(prev => ({
      ...prev,
      enabledCategories: categories
    }));
  };

  const handleChartConfigChange = (config: ChartConfig) => {
    setChartConfig(config);
  };

  const handleMAUUsageDataChange = (data: MAUUsageData) => {
    setMAUUsageData(data);
  };

  const handleMAUUsageConfigChange = (config: MAUUsageConfig) => {
    setMAUUsageConfig(config);
  };

  const hasModelCostsData = rawData.length > 0;
  const hasWAUData = wauRawData.length > 0;
  const hasProcessedData = aggregatedData.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6" ref={dashboardRef}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Account Adoption Overview
          </h1>
          <p className="text-gray-600">
            Monitor usage patterns and costs across customer accounts
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <GeneralAdoptionUpload
            onModelCostsUpload={handleModelCostsUpload}
            onWAUUpload={handleWAUUpload}
            isLoading={isLoading}
            error={error}
            hasModelCostsData={hasModelCostsData}
            hasWAUData={hasWAUData}
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('MODEL_COSTS')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'MODEL_COSTS'
                    ? 'border-[var(--cursor-orange)] text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Model costs</span>
                  {hasModelCostsData && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                      Loaded
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('WAU_ANALYTICS')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'WAU_ANALYTICS'
                    ? 'border-[var(--cursor-orange)] text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>WAU analytics</span>
                  {hasWAUData && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                      Loaded
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('MAU_USAGE')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'MAU_USAGE'
                    ? 'border-[var(--cursor-orange)] text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>MAU usage</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                    Interactive
                  </span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'MODEL_COSTS' && hasModelCostsData && (
          <>
            {/* Controls Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <DateRangePicker
                dateRange={filterConfig.dateRange}
                onDateRangeChange={handleDateRangeChange}
                availableRange={availableDateRange}
              />
              
              <ModelSelector
                enabledCategories={filterConfig.enabledCategories}
                onCategoriesChange={handleCategoriesChange}
                categoryCounts={categoryCounts}
              />
              
              <ChartControls
                config={chartConfig}
                onConfigChange={handleChartConfigChange}
              />

              <ExportControls
                data={aggregatedData}
                chartRefs={{
                  dashboard: dashboardRef,
                  barChart: barChartRef,
                  pieChart: pieChartRef,
                  dataTable: dataTableRef
                }}
              />
            </div>

            {hasProcessedData ? (
              <>
                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                  <StackedBarChart
                    ref={barChartRef}
                    data={chartData}
                    config={chartConfig}
                    enabledCategories={filterConfig.enabledCategories}
                    title={`Monthly Model Costs (${chartConfig.timePeriod})`}
                    height={400}
                  />
                  
                  <PieChart
                    ref={pieChartRef}
                    data={pieChartData}
                    config={chartConfig}
                    title="Total Cost Distribution"
                    size={300}
                  />
                </div>

                {/* Data Table Section */}
                <div className="mb-8">
                  <DataTable
                    ref={dataTableRef}
                    data={aggregatedData}
                    title="Detailed Cost Breakdown"
                    showExport={true}
                  />
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">
                        {aggregatedData.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Time Periods
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <PieChartIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">
                        {filterConfig.enabledCategories.size}
                      </div>
                      <div className="text-sm text-gray-600">
                        Active Categories
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Table className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">
                        {rawData.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Data Points
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Data Available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    The current filters have excluded all data. Try adjusting your date range or enabling more model categories.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* WAU Analytics Tab */}
        {activeTab === 'WAU_ANALYTICS' && hasWAUData && (
          <WAUDashboard
            rawData={wauRawData}
            filterConfig={wauFilterConfig}
            chartConfig={wauChartConfig}
            onFilterConfigChange={setWAUFilterConfig}
            onChartConfigChange={setWAUChartConfig}
          />
        )}

        {/* MAU Usage Tab */}
        {activeTab === 'MAU_USAGE' && (
          <MAUUsageDashboard
            data={mauUsageData}
            config={mauUsageConfig}
            onDataChange={handleMAUUsageDataChange}
            onConfigChange={handleMAUUsageConfigChange}
          />
        )}

        {/* Show message if no data for active tab */}
        {((activeTab === 'MODEL_COSTS' && !hasModelCostsData) || 
          (activeTab === 'WAU_ANALYTICS' && !hasWAUData)) && (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Data Available
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'MODEL_COSTS' 
                  ? 'Upload account model costs data to view cost analytics.'
                  : 'Upload account WAU analytics data to view user engagement analytics.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

