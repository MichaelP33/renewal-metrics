'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  RawDataRow,
  WAURawDataRow,
  AICodeMetricsRow,
  ActiveUserGrowthRawRow,
  PercentileDataRow,
  MCPUsageRawRow,
  RuleUsageRawRow,
  FilterConfig,
  WAUFilterConfig,
  AICodeMetricsConfig,
  ActiveUserGrowthConfig,
  PercentileConfig,
  MCPUsageConfig,
  RuleUsageConfig,
  ChartConfig,
  WAUChartConfig,
  MAUUsageData,
  MAUUsageConfig,
  CATEGORY_ORDER
} from '@/types';
import {
  parseCSVData,
  getDataDateRange
} from '@/lib/data-processing';
import {
  parseWAUCSVData,
  getWAUDataDateRange
} from '@/lib/wau-data-processing';
import {
  parseAICodeCSV
} from '@/lib/ai-code-data-processing';
import {
  parseActiveUserGrowthCSV,
  getActiveUserGrowthDateRange
} from '@/lib/active-user-growth-processing';
import {
  parsePercentileCSV
} from '@/lib/percentile-data-processing';
import {
  parseMCPUsageCSV,
  getMCPUsageDateRange
} from '@/lib/mcp-usage-processing';
import {
  parseRuleUsageCSV,
  getRuleUsageDateRange
} from '@/lib/rule-usage-processing';

interface DashboardDataContextType {
  // Raw data
  rawData: RawDataRow[];
  wauRawData: WAURawDataRow[];
  aiCodeRawData: AICodeMetricsRow[];
  activeUserGrowthRawData: ActiveUserGrowthRawRow[];
  percentileRawData: PercentileDataRow[];
  mcpUsageRawData: MCPUsageRawRow[];
  ruleUsageRawData: RuleUsageRawRow[];
  
  // Config states
  filterConfig: FilterConfig;
  wauFilterConfig: WAUFilterConfig;
  chartConfig: ChartConfig;
  wauChartConfig: WAUChartConfig;
  mauUsageData: MAUUsageData;
  mauUsageConfig: MAUUsageConfig;
  aiCodeConfig: AICodeMetricsConfig;
  activeUserGrowthConfig: ActiveUserGrowthConfig;
  percentileConfig: PercentileConfig;
  mcpUsageConfig: MCPUsageConfig;
  ruleUsageConfig: RuleUsageConfig;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Upload handlers
  handleModelCostsUpload: (file: File, content: string) => Promise<void>;
  handleWAUUpload: (file: File, content: string) => Promise<void>;
  handleAICodeUpload: (file: File, content: string) => Promise<void>;
  handleActiveUserGrowthUpload: (file: File, content: string) => Promise<void>;
  handlePercentileUpload: (file: File, content: string) => Promise<void>;
  handleMCPUsageUpload: (file: File, content: string) => Promise<void>;
  handleRuleUsageUpload: (file: File, content: string) => Promise<void>;
  
  // Config update handlers
  setFilterConfig: React.Dispatch<React.SetStateAction<FilterConfig>>;
  setWAUFilterConfig: React.Dispatch<React.SetStateAction<WAUFilterConfig>>;
  setChartConfig: React.Dispatch<React.SetStateAction<ChartConfig>>;
  setWAUChartConfig: React.Dispatch<React.SetStateAction<WAUChartConfig>>;
  setMAUUsageData: React.Dispatch<React.SetStateAction<MAUUsageData>>;
  setMAUUsageConfig: React.Dispatch<React.SetStateAction<MAUUsageConfig>>;
  setAICodeConfig: React.Dispatch<React.SetStateAction<AICodeMetricsConfig>>;
  setActiveUserGrowthConfig: React.Dispatch<React.SetStateAction<ActiveUserGrowthConfig>>;
  setPercentileConfig: React.Dispatch<React.SetStateAction<PercentileConfig>>;
  setMCPUsageConfig: React.Dispatch<React.SetStateAction<MCPUsageConfig>>;
  setRuleUsageConfig: React.Dispatch<React.SetStateAction<RuleUsageConfig>>;
  
  // Computed values
  hasModelCostsData: boolean;
  hasWAUData: boolean;
  hasAICodeData: boolean;
  hasActiveUserGrowthData: boolean;
  hasPercentileData: boolean;
  hasMCPUsageData: boolean;
  hasRuleUsageData: boolean;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  // Data state
  const [rawData, setRawData] = useState<RawDataRow[]>([]);
  const [wauRawData, setWAURawData] = useState<WAURawDataRow[]>([]);
  const [aiCodeRawData, setAICodeRawData] = useState<AICodeMetricsRow[]>([]);
  const [activeUserGrowthRawData, setActiveUserGrowthRawData] = useState<ActiveUserGrowthRawRow[]>([]);
  const [percentileRawData, setPercentileRawData] = useState<PercentileDataRow[]>([]);
  const [mcpUsageRawData, setMCPUsageRawData] = useState<MCPUsageRawRow[]>([]);
  const [ruleUsageRawData, setRuleUsageRawData] = useState<RuleUsageRawRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    showXAxisLabels: false,
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

  // AI Code Metrics state
  const [aiCodeConfig, setAICodeConfig] = useState<AICodeMetricsConfig>({
    showDataLabels: true,
    maxSelectedUsers: 15,
    useLabelNames: false
  });

  // Active User Growth state
  const [activeUserGrowthConfig, setActiveUserGrowthConfig] = useState<ActiveUserGrowthConfig>({
    showDataLabels: true,
    visibleLines: new Set(['agent_wau', 'agent_l4', 'agent_power_user']),
    dateRange: null
  });

  // Percentile Distribution state
  const [percentileConfig, setPercentileConfig] = useState<PercentileConfig>({
    showDataLabels: true,
    exclude100thPercentile: false
  });

  // MCP Usage state
  const [mcpUsageConfig, setMCPUsageConfig] = useState<MCPUsageConfig>({
    showDataLabels: true,
    dateRange: null,
    visibleLines: new Set(['mcp_usage_wau', 'agent_l4'])
  });

  // Rule Usage state
  const [ruleUsageConfig, setRuleUsageConfig] = useState<RuleUsageConfig>({
    showDataLabels: true,
    dateRange: null,
    visibleLines: new Set(['rule_usage_wau', 'agent_l4'])
  });

  // Upload handlers
  const handleModelCostsUpload = useCallback(async (file: File, content: string) => {
    console.log('[DashboardDataContext] Starting Model Costs upload:', file.name);
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseCSVData(content);
      console.log('[DashboardDataContext] Parsed Model Costs data:', parsed.length, 'rows');
      setRawData(parsed);

      const dateRange = getDataDateRange(parsed);
      setFilterConfig(prev => ({
        ...prev,
        dateRange
      }));
      console.log('[DashboardDataContext] Model Costs upload successful');
    } catch (err) {
      console.error('[DashboardDataContext] File processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleWAUUpload = useCallback(async (file: File, content: string) => {
    console.log('[DashboardDataContext] Starting WAU upload:', file.name);
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseWAUCSVData(content);
      console.log('[DashboardDataContext] Parsed WAU data:', parsed.length, 'rows');
      setWAURawData(parsed);

      const dateRange = getWAUDataDateRange(parsed);
      setWAUFilterConfig(prev => ({
        ...prev,
        dateRange
      }));
      console.log('[DashboardDataContext] WAU upload successful');
    } catch (err) {
      console.error('[DashboardDataContext] WAU file processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process WAU file');
      setWAURawData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAICodeUpload = useCallback(async (file: File, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseAICodeCSV(content);
      setAICodeRawData(parsed);
    } catch (err) {
      console.error('AI Code file processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process AI Code Metrics file');
      setAICodeRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleActiveUserGrowthUpload = useCallback(async (file: File, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseActiveUserGrowthCSV(content);
      setActiveUserGrowthRawData(parsed);

      const dateRange = getActiveUserGrowthDateRange(parsed);
      setActiveUserGrowthConfig(prev => ({
        ...prev,
        dateRange
      }));
    } catch (err) {
      console.error('Active User Growth file processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process Active User Growth file');
      setActiveUserGrowthRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePercentileUpload = useCallback(async (file: File, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parsePercentileCSV(content);
      setPercentileRawData(parsed);
    } catch (err) {
      console.error('Percentile file processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process Percentile file');
      setPercentileRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMCPUsageUpload = useCallback(async (file: File, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseMCPUsageCSV(content);
      setMCPUsageRawData(parsed);

      const dateRange = getMCPUsageDateRange(parsed);
      setMCPUsageConfig(prev => ({
        ...prev,
        dateRange
      }));
    } catch (err) {
      console.error('MCP Usage file processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process MCP Usage file');
      setMCPUsageRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRuleUsageUpload = useCallback(async (file: File, content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseRuleUsageCSV(content);
      setRuleUsageRawData(parsed);

      const dateRange = getRuleUsageDateRange(parsed);
      setRuleUsageConfig(prev => ({
        ...prev,
        dateRange
      }));
    } catch (err) {
      console.error('Rule Usage file processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process Rule Usage file');
      setRuleUsageRawData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed values
  const hasModelCostsData = rawData.length > 0;
  const hasWAUData = wauRawData.length > 0;
  const hasAICodeData = aiCodeRawData.length > 0;
  const hasActiveUserGrowthData = activeUserGrowthRawData.length > 0;
  const hasPercentileData = percentileRawData.length > 0;
  const hasMCPUsageData = mcpUsageRawData.length > 0;
  const hasRuleUsageData = ruleUsageRawData.length > 0;

  const value = useMemo(() => ({
    rawData,
    wauRawData,
    aiCodeRawData,
    activeUserGrowthRawData,
    percentileRawData,
    mcpUsageRawData,
    ruleUsageRawData,
    filterConfig,
    wauFilterConfig,
    chartConfig,
    wauChartConfig,
    mauUsageData,
    mauUsageConfig,
    aiCodeConfig,
    activeUserGrowthConfig,
    percentileConfig,
    mcpUsageConfig,
    ruleUsageConfig,
    isLoading,
    error,
    handleModelCostsUpload,
    handleWAUUpload,
    handleAICodeUpload,
    handleActiveUserGrowthUpload,
    handlePercentileUpload,
    handleMCPUsageUpload,
    handleRuleUsageUpload,
    setFilterConfig,
    setWAUFilterConfig,
    setChartConfig,
    setWAUChartConfig,
    setMAUUsageData,
    setMAUUsageConfig,
    setAICodeConfig,
    setActiveUserGrowthConfig,
    setPercentileConfig,
    setMCPUsageConfig,
    setRuleUsageConfig,
    hasModelCostsData,
    hasWAUData,
    hasAICodeData,
    hasActiveUserGrowthData,
    hasPercentileData,
    hasMCPUsageData,
    hasRuleUsageData
  }), [
    rawData,
    wauRawData,
    aiCodeRawData,
    activeUserGrowthRawData,
    percentileRawData,
    mcpUsageRawData,
    ruleUsageRawData,
    filterConfig,
    wauFilterConfig,
    chartConfig,
    wauChartConfig,
    mauUsageData,
    mauUsageConfig,
    aiCodeConfig,
    activeUserGrowthConfig,
    percentileConfig,
    mcpUsageConfig,
    ruleUsageConfig,
    isLoading,
    error,
    handleModelCostsUpload,
    handleWAUUpload,
    handleAICodeUpload,
    handleActiveUserGrowthUpload,
    handlePercentileUpload,
    handleMCPUsageUpload,
    handleRuleUsageUpload,
    hasModelCostsData,
    hasWAUData,
    hasAICodeData,
    hasActiveUserGrowthData,
    hasPercentileData,
    hasMCPUsageData,
    hasRuleUsageData
  ]);

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
}

