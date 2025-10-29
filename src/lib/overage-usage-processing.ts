import { OverageUsageData, OverageUsageConfig, ForecastMethod, OverageUsageMonthData } from '@/types';

/**
 * Calculates linear trend forecast using least squares regression
 */
export function calculateLinearTrendForecast(
  data: OverageUsageData,
  forecastMonths: number
): OverageUsageMonthData[] {
  if (data.length < 2) {
    return [];
  }

  // Sort data by month to ensure chronological order
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  
  // Calculate slope and intercept using least squares
  const n = sortedData.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  sortedData.forEach((item, index) => {
    const x = index; // Use index as x value (0, 1, 2, ...)
    const y = item.spend;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate forecast starting from the month after the last data point
  const forecast: OverageUsageMonthData[] = [];
  const lastMonth = sortedData[sortedData.length - 1].month;
  const [lastYear, lastMonthNum] = lastMonth.split('-').map(Number);

  for (let i = 0; i < forecastMonths; i++) {
    let year = lastYear;
    let month = lastMonthNum + i + 1;

    // Handle year rollover
    while (month > 12) {
      month -= 12;
      year += 1;
    }

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const x = n + i; // Continue from where data left off
    const forecastedSpend = Math.max(0, slope * x + intercept); // Ensure non-negative

    forecast.push({
      month: monthStr,
      spend: forecastedSpend
    });
  }

  return forecast;
}

/**
 * Calculates growth rate forecast using average month-over-month growth
 */
export function calculateGrowthRateForecast(
  data: OverageUsageData,
  forecastMonths: number,
  customGrowthRate: number | null
): OverageUsageMonthData[] {
  if (data.length < 2) {
    return [];
  }

  // Sort data by month
  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  
  // Calculate average month-over-month growth rate
  let growthRates: number[] = [];
  for (let i = 1; i < sortedData.length; i++) {
    const prevSpend = sortedData[i - 1].spend;
    if (prevSpend > 0) {
      const growthRate = (sortedData[i].spend - prevSpend) / prevSpend;
      growthRates.push(growthRate);
    }
  }

  // Use custom growth rate if provided, otherwise calculate average
  const avgGrowthRate = customGrowthRate !== null 
    ? customGrowthRate 
    : growthRates.length > 0
      ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
      : 0;

  // Generate forecast
  const forecast: OverageUsageMonthData[] = [];
  let lastSpend = sortedData[sortedData.length - 1].spend;
  const lastMonth = sortedData[sortedData.length - 1].month;
  const [lastYear, lastMonthNum] = lastMonth.split('-').map(Number);

  for (let i = 0; i < forecastMonths; i++) {
    let year = lastYear;
    let month = lastMonthNum + i + 1;

    // Handle year rollover
    while (month > 12) {
      month -= 12;
      year += 1;
    }

    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    lastSpend = Math.max(0, lastSpend * (1 + avgGrowthRate)); // Apply growth rate

    forecast.push({
      month: monthStr,
      spend: lastSpend
    });
  }

  return forecast;
}

/**
 * Generates forecast data based on config
 */
export function generateForecastData(
  data: OverageUsageData,
  config: OverageUsageConfig
): OverageUsageMonthData[] {
  if (!config.showForecast || data.length < 2) {
    return [];
  }

  if (config.forecastMethod === 'linear') {
    return calculateLinearTrendForecast(data, config.forecastMonths);
  } else {
    return calculateGrowthRateForecast(data, config.forecastMonths, config.customGrowthRate);
  }
}

/**
 * Calculates overall growth trend percentage
 * Returns the percentage change from first to last month
 */
export function calculateGrowthTrend(data: OverageUsageData): number {
  if (data.length < 2) {
    return 0;
  }

  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const firstSpend = sortedData[0].spend;
  const lastSpend = sortedData[sortedData.length - 1].spend;

  if (firstSpend === 0) {
    return lastSpend > 0 ? 100 : 0;
  }

  return ((lastSpend - firstSpend) / firstSpend) * 100;
}

/**
 * Calculates average month-over-month growth rate
 */
export function calculateAverageMoMGrowthRate(data: OverageUsageData): number {
  if (data.length < 2) {
    return 0;
  }

  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const growthRates: number[] = [];

  for (let i = 1; i < sortedData.length; i++) {
    const prevSpend = sortedData[i - 1].spend;
    if (prevSpend > 0) {
      const growthRate = (sortedData[i].spend - prevSpend) / prevSpend;
      growthRates.push(growthRate);
    }
  }

  if (growthRates.length === 0) {
    return 0;
  }

  return (growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length) * 100;
}

/**
 * Interface for month-to-month growth rate data
 */
export interface MonthToMonthGrowth {
  fromMonth: string;
  toMonth: string;
  fromSpend: number;
  toSpend: number;
  growthRate: number; // Percentage (e.g., 50.5 for 50.5%)
}

/**
 * Calculates individual month-to-month growth rates
 * Returns array of growth rates for each consecutive month pair
 */
export function calculateMonthToMonthGrowthRates(
  data: OverageUsageData
): MonthToMonthGrowth[] {
  if (data.length < 2) {
    return [];
  }

  const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
  const growthRates: MonthToMonthGrowth[] = [];

  for (let i = 1; i < sortedData.length; i++) {
    const prevMonth = sortedData[i - 1];
    const currentMonth = sortedData[i];
    const prevSpend = prevMonth.spend;
    const currentSpend = currentMonth.spend;

    // Calculate growth rate
    let growthRate = 0;
    if (prevSpend > 0) {
      growthRate = ((currentSpend - prevSpend) / prevSpend) * 100;
    } else if (currentSpend > 0) {
      // If previous was 0 and current is > 0, it's infinite growth
      // Represent as a very large number for display purposes
      growthRate = Infinity;
    } else {
      // Both are 0, growth rate is 0
      growthRate = 0;
    }

    growthRates.push({
      fromMonth: prevMonth.month,
      toMonth: currentMonth.month,
      fromSpend: prevSpend,
      toSpend: currentSpend,
      growthRate
    });
  }

  return growthRates;
}

/**
 * Formats month string for display (YYYY-MM -> MMM YYYY)
 */
export function formatMonthDisplay(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Generates month options for select dropdown
 * Returns array of {value: YYYY-MM, label: MMM YYYY} for a range of months
 */
export function generateMonthOptions(startMonthsAgo: number = 24, futureMonths: number = 12): Array<{value: string, label: string}> {
  const options: Array<{value: string, label: string}> = [];
  const now = new Date();
  
  // Generate past months
  for (let i = startMonthsAgo; i > 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    const label = formatMonthDisplay(value);
    options.push({ value, label });
  }
  
  // Generate current and future months
  for (let i = 0; i <= futureMonths; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    const label = formatMonthDisplay(value);
    options.push({ value, label });
  }
  
  return options;
}

