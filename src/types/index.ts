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
export type DataType = 'MODEL_COSTS' | 'WAU_ANALYTICS' | 'MAU_USAGE' | 'AI_CODE_METRICS' | 'ACTIVE_USER_GROWTH' | 'PERCENTILE_DATA' | 'MCP_USAGE' | 'RULE_USAGE' | 'OVERAGE_USAGE';
export type WAUViewType = 'MoM' | 'WoW';

export interface ChartConfig {
  showDataLabels: boolean;
  showLegend: boolean;
  timePeriod: TimePeriod;
}

export interface WAUChartConfig {
  showDataLabels: boolean;      // User counts on/in bars
  showXAxisLabels: boolean;      // X-axis date labels
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
  useLabelNames: boolean;
}

export interface ActiveUserGrowthRawRow {
  week: string;
  agent_l4: number;
  agent_power_user: number;
  agent_wau: number;
}

export interface ActiveUserGrowthProcessedRow {
  week: string;
  weekDisplay: string;
  agent_l4: number;
  agent_power_user: number;
  agent_wau: number;
}

export interface ActiveUserGrowthConfig {
  showDataLabels: boolean;
  visibleLines: Set<'agent_wau' | 'agent_l4' | 'agent_power_user'>;
  dateRange: DateRange | null;
}

export interface PercentileDataRow {
  percentile: number;
  interactions: number;
}

export interface PercentileConfig {
  showDataLabels: boolean;
  exclude100thPercentile: boolean;
}

export interface MCPUsageRawRow {
  week: string;
  agent_l4: number;
  mcp_usage_wau: number;
}

export interface MCPUsageProcessedRow {
  week: string;
  weekDisplay: string;
  agent_l4: number;
  mcp_usage_wau: number;
}

export interface MCPUsageConfig {
  showDataLabels: boolean;
  dateRange: DateRange | null;
  visibleLines: Set<'mcp_usage_wau' | 'agent_l4'>;
}

export interface RuleUsageRawRow {
  week: string;
  agent_l4: number;
  rule_usage_wau: number;
}

export interface RuleUsageProcessedRow {
  week: string;
  weekDisplay: string;
  agent_l4: number;
  rule_usage_wau: number;
}

export interface RuleUsageConfig {
  showDataLabels: boolean;
  dateRange: DateRange | null;
  visibleLines: Set<'rule_usage_wau' | 'agent_l4'>;
}

export interface OverageUsageMonthData {
  month: string; // YYYY-MM format
  spend: number; // Dollar amount
}

export type OverageUsageData = OverageUsageMonthData[];

export type ForecastMethod = 'linear' | 'growth_rate';

export interface OverageUsageConfig {
  showLabels: boolean;
  showForecast: boolean;
  forecastMonths: number; // 1-12
  forecastMethod: ForecastMethod;
  customGrowthRate: number | null; // Percentage as decimal (-0.5 to 2.0), null uses calculated rate
}

export interface UserNameData {
  first_name: string;
  last_name: string;
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
  primary: '#f54e00',          // Primary brand orange
  secondary: '#f54e00',        // Same color for consistency
  accent: '#f54e00',           // Same color for consistency
  background: '#FEF3C7'        // Orange-100 background
};

// AI Code Metrics colors
export const AI_CODE_COLORS = {
  aiCode: '#f54e00',           // Primary brand orange for AI code percentage
  background: '#F3F4F6'        // Light gray background
};

// Active User Growth colors
export const ACTIVE_USER_GROWTH_COLORS = {
  agent_wau: '#f54e00',       // Primary brand orange
  agent_l4: '#D4A27F',        // Tan/beige (consistent secondary)
  agent_power_user: '#526070' // Muted slate (tertiary)
};

// Percentile Distribution colors
export const PERCENTILE_COLORS = {
  bar: '#f54e00',             // Primary brand orange
  background: '#FFF7ED'       // Orange-50
};

// MCP Usage colors
export const MCP_USAGE_COLORS = {
  mcp_usage_wau: '#f54e00',   // Primary brand orange
  agent_l4: '#D4A27F'         // Tan/beige (consistent secondary)
};

// Rule Usage colors
export const RULE_USAGE_COLORS = {
  rule_usage_wau: '#f54e00',  // Primary brand orange
  agent_l4: '#D4A27F'         // Tan/beige (consistent secondary)
};

// Overage Usage colors
export const OVERAGE_USAGE_COLORS = {
  actual: '#f54e00',          // Primary brand orange for actual spend
  forecast: '#ff8844',        // Lighter orange for forecasted spend
  forecastStroke: '#f54e00'    // Stroke color for forecast bars
};

// Cohort colors for multi-cohort comparison
export const COHORT_COLORS = {
  cohort1: '#f54e00',  // Cursor orange (primary)
  cohort2: '#526070',  // Muted slate
  cohort3: '#D4A27F',  // Tan/beige
  cohort4: '#7C9885',  // Muted sage green
  cohort5: '#9B7E6B',  // Muted brown
  cohort6: '#6B8E9F',  // Muted blue-gray
  cohort7: '#B4846C',  // Muted terracotta
  cohort8: '#8A9BA8',  // Muted steel blue
  default: '#9CA3AF'   // Cool gray
} as const;

export const COHORT_COLOR_ARRAY = [
  COHORT_COLORS.cohort1,
  COHORT_COLORS.cohort2,
  COHORT_COLORS.cohort3,
  COHORT_COLORS.cohort4,
  COHORT_COLORS.cohort5,
  COHORT_COLORS.cohort6,
  COHORT_COLORS.cohort7,
  COHORT_COLORS.cohort8,
] as const;

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
