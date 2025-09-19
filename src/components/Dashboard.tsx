'use client';

import React, { useState, useRef, useMemo } from 'react';
import { AlertCircle, BarChart3, PieChart as PieChartIcon, Table, DollarSign, Users, TrendingUp } from 'lucide-react';
import { DualFileUpload } from './dual-file-upload';
import { DateRangePicker } from './DateRangePicker';
import { ModelSelector } from './ModelSelector';
import { ChartControls } from './ChartControls';
import { DataTable } from './DataTable';
import { StackedBarChart } from './StackedBarChart';
import { PieChart } from './PieChart';
import { WAUDashboard } from './wau-analytics-dashboard';
import { MAUUsageDashboard } from './mau-usage-dashboard';
import { ExportControls } from './ExportControls';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  RawDataRow,
  WAURawDataRow,
  FilterConfig,
  WAUFilterConfig,
  ChartConfig,
  WAUChartConfig,
  MAUUsageData,
  MAUUsageConfig,
  DateRange,
  ModelCategory,
  DataType,
  CATEGORY_ORDER
} from '@/types';
import { 
  parseCSVData, 
  processData, 
  aggregateData, 
  prepareChartData,
  preparePieChartData,
  getDataDateRange
} from '@/lib/data-processing';
import { 
  parseWAUCSVData, 
  getWAUDataDateRange
} from '@/lib/wau-data-processing';

export function Dashboard() {
  // Data state
  const [rawData, setRawData] = useState<RawDataRow[]>([]);
  const [wauRawData, setWAURawData] = useState<WAURawDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DataType>('MODEL_COSTS');

  // Filter state
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    dateRange: null,
    enabledCategories: new Set(CATEGORY_ORDER),
    minCostThreshold: 1
  });

  const [wauFilterConfig, setWAUFilterConfig] = useState<WAUFilterConfig>({
    dateRange: null
  });

  // Chart configuration state
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    showDataLabels: true,
    showLegend: true,
    timePeriod: 'MoM'
  });

  const [wauChartConfig, setWAUChartConfig] = useState<WAUChartConfig>({
    showDataLabels: true,
    viewType: 'MoM'
  });

  // MAU Usage state
  const [mauUsageData, setMAUUsageData] = useState<MAUUsageData>({
    activeUsers: 0,
    agentPercentage: 0,
    tabPercentage: 0,
    agentUsers: 0,
    tabUsers: 0
  });

  const [mauUsageConfig, setMAUUsageConfig] = useState<MAUUsageConfig>({
    showLabels: true
  });

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

  const handleModelCostsUpload = async (file: File, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseCSVData(content);
      setRawData(parsed);

      // Set initial date range to all available data
      const dateRange = getDataDateRange(parsed);
      setFilterConfig(prev => ({
        ...prev,
        dateRange
      }));

      // Switch to model costs tab if not already there
      setActiveTab('MODEL_COSTS');

    } catch (err) {
      console.error('File processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWAUUpload = async (file: File, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseWAUCSVData(content);
      setWAURawData(parsed);

      // Set initial date range to all available data
      const dateRange = getWAUDataDateRange(parsed);
      setWAUFilterConfig(prev => ({
        ...prev,
        dateRange
      }));

      // Switch to WAU analytics tab if not already there
      setActiveTab('WAU_ANALYTICS');

    } catch (err) {
      console.error('WAU file processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process WAU file');
      setWAURawData([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleWAUFilterConfigChange = (config: WAUFilterConfig) => {
    setWAUFilterConfig(config);
  };

  const handleWAUChartConfigChange = (config: WAUChartConfig) => {
    setWAUChartConfig(config);
  };

  const handleMAUUsageDataChange = (data: MAUUsageData) => {
    setMAUUsageData(data);
  };

  const handleMAUUsageConfigChange = (config: MAUUsageConfig) => {
    setMAUUsageConfig(config);
  };

  const hasModelCostsData = rawData.length > 0;
  const hasWAUData = wauRawData.length > 0;
  const hasData = hasModelCostsData || hasWAUData;
  const hasProcessedData = aggregatedData.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6" ref={dashboardRef}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Model Cost & Usage Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Upload your model usage data and WAU analytics to analyze spending patterns, or use the MAU Usage tool to visualize user adoption rates
          </p>
        </div>

        {/* File Upload Section or MAU Usage Access */}
        {!hasData && activeTab !== 'MAU_USAGE' && (
          <div className="mb-8">
            <DualFileUpload
              onModelCostsUpload={handleModelCostsUpload}
              onWAUUpload={handleWAUUpload}
              isLoading={isLoading}
              error={error}
              hasModelCostsData={hasModelCostsData}
              hasWAUData={hasWAUData}
            />
            {/* Quick access to MAU Usage tool */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="text-sm font-medium text-purple-900">MAU Usage Visualization</h3>
                    <p className="text-sm text-purple-700">Create interactive charts without uploading data</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('MAU_USAGE')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Open MAU Tool
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        {(hasData || activeTab === 'MAU_USAGE') && (
          <>
            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('MODEL_COSTS')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'MODEL_COSTS'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Model Costs</span>
                      {hasModelCostsData && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Loaded
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('WAU_ANALYTICS')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'WAU_ANALYTICS'
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>WAU Analytics</span>
                      {hasWAUData && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Loaded
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('MAU_USAGE')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'MAU_USAGE'
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>MAU Usage</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
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
                      <div className="space-y-2 text-sm text-gray-500">
                        <p>Current filters:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Date range: {filterConfig.dateRange 
                              ? `${filterConfig.dateRange.from.toDateString()} - ${filterConfig.dateRange.to.toDateString()}`
                              : 'All data'
                            }
                          </li>
                          <li>
                            Active categories: {filterConfig.enabledCategories.size} / {CATEGORY_ORDER.length}
                          </li>
                          <li>
                            Minimum cost: ${filterConfig.minCostThreshold}
                          </li>
                        </ul>
                      </div>
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
                onFilterConfigChange={handleWAUFilterConfigChange}
                onChartConfigChange={handleWAUChartConfigChange}
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
                      ? 'Upload a model costs CSV file to view cost analytics.'
                      : 'Upload a WAU analytics CSV file to view user engagement analytics.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}

            <Separator className="my-8" />

            {/* Upload New Data */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Upload New Data
                </h3>
                <DualFileUpload
                  onModelCostsUpload={handleModelCostsUpload}
                  onWAUUpload={handleWAUUpload}
                  isLoading={isLoading}
                  error={error}
                  hasModelCostsData={hasModelCostsData}
                  hasWAUData={hasWAUData}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
