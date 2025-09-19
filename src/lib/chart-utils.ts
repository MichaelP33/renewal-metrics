import { MODEL_COLORS, ModelCategory, ChartConfig, WAU_COLORS } from '@/types';

/**
 * Formats currency values for display
 */
export function formatCurrency(value: number): string {
  if (value === 0) return '$0';
  
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  } else if (value >= 1) {
    return `$${value.toFixed(0)}`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Formats percentage values
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Gets chart colors in order
 */
export function getChartColors(categories: ModelCategory[]): string[] {
  return categories.map(category => MODEL_COLORS[category]);
}

/**
 * Custom tooltip formatter for Recharts
 */
export function createTooltipFormatter(showPercentages = false) {
  return (value: number, name: string, props: any) => {
    const formattedValue = formatCurrency(value);
    
    if (showPercentages && props.payload) {
      const total = Object.keys(props.payload)
        .filter(key => key !== 'month' && typeof props.payload[key] === 'number')
        .reduce((sum, key) => sum + (props.payload[key] || 0), 0);
      
      const percentage = total > 0 ? (value / total) * 100 : 0;
      return [`${formattedValue} (${formatPercentage(percentage)})`, name];
    }
    
    return [formattedValue, name];
  };
}

/**
 * Custom label formatter for charts
 */
export function createLabelFormatter() {
  return (label: string) => `${label}`;
}

/**
 * Gets responsive chart dimensions based on container
 */
export function getChartDimensions(containerWidth: number) {
  const height = Math.max(400, Math.min(600, containerWidth * 0.6));
  
  return {
    width: '100%',
    height
  };
}

/**
 * Chart configuration presets
 */
export const CHART_PRESETS = {
  bar: {
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    barCategoryGap: '10%',
    barGap: 2
  },
  pie: {
    cx: '50%',
    cy: '50%',
    innerRadius: 0,
    outerRadius: 120,
    paddingAngle: 1
  }
};

/**
 * Generates chart export filename
 */
export function generateChartFilename(
  chartType: string,
  dateRange?: { from: Date; to: Date }
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const rangeSuffix = dateRange 
    ? `_${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}`
    : '';
  
  return `model-costs-${chartType}${rangeSuffix}_${timestamp}`;
}

/**
 * Custom tick formatter for Y-axis
 */
export function yAxisTickFormatter(value: number): string {
  return formatCurrency(value);
}

/**
 * Custom tick formatter for X-axis
 */
export function xAxisTickFormatter(value: string): string {
  return value;
}

/**
 * Gets optimal number of ticks for chart axis
 */
export function getOptimalTickCount(dataLength: number, maxTicks = 8): number {
  if (dataLength <= maxTicks) return dataLength;
  
  const interval = Math.ceil(dataLength / maxTicks);
  return Math.ceil(dataLength / interval);
}

/**
 * Determines if labels should be shown based on chart config and data size
 */
export function shouldShowLabels(config: ChartConfig, dataPointCount: number): boolean {
  if (!config.showDataLabels) return false;
  
  // Don't show labels if there are too many data points (cluttered)
  return dataPointCount <= 12;
}

/**
 * Custom data label formatter
 */
export function createDataLabelFormatter(threshold = 50) {
  return (value: number) => {
    // Only show label if value is above threshold
    return value >= threshold ? formatCurrency(value) : '';
  };
}

/**
 * Color opacity utilities
 */
export function adjustColorOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Gets contrasting text color for background
 */
export function getContrastingTextColor(backgroundColor: string): string {
  // Simple implementation - use white for dark colors, black for light colors
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// ===== WAU-SPECIFIC FORMATTING FUNCTIONS =====

/**
 * Formats user count values for display
 */
export function formatUserCount(value: number): string {
  if (value === 0) return '0';
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  } else {
    return value.toFixed(0);
  }
}

/**
 * Formats usage metrics for display
 */
export function formatUsageMetrics(value: number): string {
  if (value === 0) return '0';
  
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  } else {
    return value.toFixed(0);
  }
}

/**
 * Formats requests per user for display
 */
export function formatRequestsPerUser(value: number): string {
  return value.toFixed(1);
}

/**
 * Gets WAU chart colors
 */
export function getWAUChartColors(): string[] {
  return [WAU_COLORS.primary];
}

/**
 * Custom tooltip formatter for WAU MoM charts
 */
export function createWAUMoMTooltipFormatter() {
  return (value: number, name: string, props: any) => {
    const formattedValue = formatUserCount(value);
    return [formattedValue, 'Average WAU'];
  };
}

/**
 * Custom tooltip formatter for WAU WoW charts
 */
export function createWAUWoWTooltipFormatter() {
  return (value: number, name: string, props: any) => {
    if (name === 'wauCount') {
      return [formatUserCount(value), 'WAU Count'];
    } else if (name === 'weeklyUsage') {
      return [formatUsageMetrics(value), 'Weekly Usage'];
    } else if (name === 'weeklyTabs') {
      return [formatUsageMetrics(value), 'Weekly Tabs'];
    } else if (name === 'requestsPer') {
      return [formatRequestsPerUser(value), 'Requests per User'];
    }
    return [value.toString(), name];
  };
}

/**
 * Custom Y-axis tick formatter for WAU charts
 */
export function wauYAxisTickFormatter(value: number): string {
  return formatUserCount(value);
}

/**
 * Generates WAU chart export filename
 */
export function generateWAUChartFilename(
  chartType: 'mom' | 'wow',
  dateRange?: { from: Date; to: Date }
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const rangeSuffix = dateRange 
    ? `_${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}`
    : '';
  
  return `wau-${chartType}${rangeSuffix}_${timestamp}`;
}

/**
 * WAU chart configuration presets
 */
export const WAU_CHART_PRESETS = {
  mom: {
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    barCategoryGap: '10%',
    barGap: 2
  },
  wow: {
    margin: { top: 20, right: 30, left: 20, bottom: 60 }, // More bottom margin for month labels
    barCategoryGap: '5%',
    barGap: 1
  }
};
