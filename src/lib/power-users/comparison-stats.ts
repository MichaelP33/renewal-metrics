import type { EnhancedMasterUserRecord } from '@/types/power-users';

/**
 * Statistics for a single metric within a user group
 */
export interface GroupStats {
  count: number;
  mean: number;
  median: number;
  total: number;
  p75: number;
  p90: number;
}

/**
 * Comparison data for a single metric
 */
export interface ComparisonMetric {
  metricName: string;
  metricKey: string;
  powerUsers: GroupStats;
  nonPowerUsers: GroupStats;
  ratio: number; // powerUsers.mean / nonPowerUsers.mean
  differencePercent: number; // ((powerUsers.mean - nonPowerUsers.mean) / nonPowerUsers.mean) * 100
}

/**
 * Complete comparison statistics
 */
export interface ComparisonStats {
  metrics: ComparisonMetric[];
  powerUserCount: number;
  nonPowerUserCount: number;
  unlabeledCount: number;
  totalCount: number;
}

/**
 * Calculates descriptive statistics for an array of numbers
 */
function calculateStats(values: number[]): GroupStats {
  if (values.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      total: 0,
      p75: 0,
      p90: 0,
    };
  }

  // Sort for percentile calculations
  const sorted = [...values].sort((a, b) => a - b);
  
  const count = values.length;
  const total = values.reduce((sum, val) => sum + val, 0);
  const mean = total / count;
  
  // Calculate median (50th percentile)
  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];
  
  // Calculate P75 (75th percentile)
  const p75Index = Math.ceil(count * 0.75) - 1;
  const p75 = sorted[Math.max(0, p75Index)];
  
  // Calculate P90 (90th percentile)
  const p90Index = Math.ceil(count * 0.90) - 1;
  const p90 = sorted[Math.max(0, p90Index)];

  return {
    count,
    mean,
    median,
    total,
    p75,
    p90,
  };
}

/**
 * Calculates ratio between two means, handling edge cases
 */
function calculateRatio(powerMean: number, nonPowerMean: number): number {
  if (nonPowerMean === 0) {
    // If non-power users have 0 mean, return a high ratio or 0
    return powerMean === 0 ? 0 : 999;
  }
  return powerMean / nonPowerMean;
}

/**
 * Calculates percentage difference between two means
 */
function calculateDifferencePercent(powerMean: number, nonPowerMean: number): number {
  if (nonPowerMean === 0) {
    // If non-power users have 0 mean, return 0 or a high percentage
    return powerMean === 0 ? 0 : 999;
  }
  return ((powerMean - nonPowerMean) / nonPowerMean) * 100;
}

/**
 * Extracts numeric values for a metric from user records
 */
function extractMetricValues(
  users: EnhancedMasterUserRecord[],
  metricKey: string
): number[] {
  return users
    .map(user => (user as Record<string, unknown>)[metricKey])
    .filter((val): val is number => typeof val === 'number' && !isNaN(val));
}

/**
 * Calculates comparison statistics between power users and non-power users
 */
export function calculateComparisonStats(
  users: EnhancedMasterUserRecord[]
): ComparisonStats {
  // Separate users into groups
  const powerUsers = users.filter(u => u.isPowerUser === true);
  const nonPowerUsers = users.filter(u => u.isPowerUser === false);
  const unlabeledUsers = users.filter(u => u.isPowerUser === undefined);
  
  const powerUserCount = powerUsers.length;
  const nonPowerUserCount = nonPowerUsers.length;
  const unlabeledCount = unlabeledUsers.length;
  const totalCount = users.length;

  // Define metrics to compare
  const metricDefinitions = [
    { key: 'totalLinesChanged', name: 'Total Lines of Code' },
    { key: 'aiLinesChanged', name: 'AI-Assisted Lines of Code' },
    { key: 'commitCount', name: 'Commit Count' },
    { key: 'pctAiCode', name: 'AI Code Percentage' },
    { key: 'totalSessions', name: 'Agent Sessions' },
    { key: 'totalAgentRequests', name: 'Agent Requests' },
    { key: 'numProductsUsed', name: 'Products Used' },
    { key: 'membershipDays', name: 'Membership Days' },
    { key: 'engagementScore', name: 'Engagement Score' },
  ];

  // Calculate stats for each metric
  const metrics: ComparisonMetric[] = metricDefinitions.map(({ key, name }) => {
    const powerValues = extractMetricValues(powerUsers, key);
    const nonPowerValues = extractMetricValues(nonPowerUsers, key);
    
    const powerStats = calculateStats(powerValues);
    const nonPowerStats = calculateStats(nonPowerValues);
    
    const ratio = calculateRatio(powerStats.mean, nonPowerStats.mean);
    const differencePercent = calculateDifferencePercent(powerStats.mean, nonPowerStats.mean);

    return {
      metricName: name,
      metricKey: key,
      powerUsers: powerStats,
      nonPowerUsers: nonPowerStats,
      ratio,
      differencePercent,
    };
  });

  return {
    metrics,
    powerUserCount,
    nonPowerUserCount,
    unlabeledCount,
    totalCount,
  };
}

