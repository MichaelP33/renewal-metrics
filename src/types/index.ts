export interface RawDataRow {
  month: string;
  model: string;
  total_cost_dollars: number;
}

export interface WAURawDataRow {
  week: string;
  weekly_usage: number;
  weekly_tabs: number;
  wau_count: number;
  requestsper: number;
}

export interface ProcessedDataRow {
  month: string;
  monthDisplay: string;
  category: ModelCategory;
  cost: number;
  originalModel: string;
}

export interface WAUProcessedDataRow {
  week: string;
  weekDisplay: string;
  weeklyUsage: number;
  weeklyTabs: number;
  wauCount: number;
  requestsPer: number;
}

export interface AggregatedData {
  month: string;
  monthDisplay: string;
  [key: string]: number | string; // Dynamic keys for each category
  total: number;
}

export interface WAUMoMData {
  month: string;
  monthDisplay: string;
  averageWAU: number;
  totalWeeks: number;
  totalUsage: number;
  totalTabs: number;
}

export interface WAUWoWData {
  week: string;
  weekDisplay: string;
  monthLabel: string;
  wauCount: number;
  weeklyUsage: number;
  weeklyTabs: number;
  requestsPer: number;
}

export interface ChartDataPoint {
  month: string;
  [category: string]: number | string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export type ModelCategory = 
  | 'Opus'
  | 'Sonnet'
  | 'Anthropic (other)'
  | 'GPT-5'
  | 'OpenAI (other)'
  | 'Gemini'
  | 'Grok'
  | 'Auto'
  | 'Other';

export interface ModelCategoryConfig {
  name: ModelCategory;
  color: string;
  enabled: boolean;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type TimePeriod = 'MoM' | 'QoQ';
export type DataType = 'MODEL_COSTS' | 'WAU_ANALYTICS' | 'MAU_USAGE' | 'AI_CODE_METRICS';
export type WAUViewType = 'MoM' | 'WoW';

export interface ChartConfig {
  showDataLabels: boolean;
  showLegend: boolean;
  timePeriod: TimePeriod;
}

export interface WAUChartConfig {
  showDataLabels: boolean;
  viewType: WAUViewType;
}

export interface FilterConfig {
  dateRange: DateRange | null;
  enabledCategories: Set<ModelCategory>;
  minCostThreshold: number;
}

export interface WAUFilterConfig {
  dateRange: DateRange | null;
}

export interface MAUUsageData {
  activeUsers: number;
  agentPercentage: number;
  tabPercentage: number;
  agentUsers: number;
  tabUsers: number;
}

export interface MAUUsageConfig {
  showLabels: boolean;
}

export interface AICodeMetricsRow {
  team_id: number;
  team_name: string;
  user_id: number;
  email: string;
  person_linkedin_url: string;
  total_lines_changed: number;
  ai_lines_changed: number;
  non_ai_lines_changed: number;
  pct_ai_lines_changed: number;
  pct_non_ai_lines_changed: number;
  commit_count: number;
}

export interface AICodeMetricsConfig {
  showDataLabels: boolean;
  maxSelectedUsers: number;
}

export interface ExportOptions {
  format: 'png' | 'csv';
  chartType?: 'table' | 'bar' | 'pie' | 'all';
  filename?: string;
}

// Predefined date ranges
export interface PredefinedDateRange {
  label: string;
  getValue: () => DateRange;
}

// Color configuration for consistency
export const MODEL_COLORS: Record<ModelCategory, string> = {
  'Opus': '#CC785C',           // Brown/terracotta
  'Sonnet': '#D4A27F',         // Beige
  'Anthropic (other)': '#D1D5DB', // Light gray
  'GPT-5': '#1E3A8A',          // Dark blue
  'OpenAI (other)': '#3B82F6', // Light blue
  'Gemini': '#8B5CF6',         // Purple
  'Grok': '#F59E0B',           // Orange
  'Auto': '#000000',           // Black
  'Other': '#9CA3AF'           // Gray
};

// WAU chart colors
export const WAU_COLORS = {
  primary: '#ED5F2E',          // Custom orange
  secondary: '#ED5F2E',        // Same color for consistency
  accent: '#ED5F2E',           // Same color for consistency
  background: '#FEF3C7'        // Orange-100 background
};

// AI Code Metrics colors
export const AI_CODE_COLORS = {
  aiCode: '#ED5F2E',           // Orange for AI code percentage
  background: '#F3F4F6'        // Light gray background
};

// Default category order for consistent display
export const CATEGORY_ORDER: ModelCategory[] = [
  'Opus',
  'Sonnet',
  'Anthropic (other)',
  'GPT-5',
  'OpenAI (other)',
  'Gemini',
  'Grok',
  'Auto',
  'Other'
];
