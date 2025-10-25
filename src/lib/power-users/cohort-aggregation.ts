import type { EnhancedMasterUserRecord, CohortMetrics, NumericMetricKey } from '@/types/power-users';

const NUMERIC_METRICS: NumericMetricKey[] = [
  'totalLinesChanged',
  'aiLinesChanged',
  'commitCount',
  'pctAiCode',
  'totalSessions',
  'totalAgentRequests',
  'numProductsUsed',
  'membershipDays',
  'engagementScore',
];

/**
 * Calculate descriptive statistics for a metric
 */
function calculateMetricStats(values: number[]) {
  if (values.length === 0) {
    return { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const total = values.reduce((sum, val) => sum + val, 0);
  const mean = total / values.length;
  const median = sorted[Math.floor(sorted.length * 0.5)];
  const p75 = sorted[Math.floor(sorted.length * 0.75)];
  const p90 = sorted[Math.floor(sorted.length * 0.90)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  return { mean, median, p75, p90, min, max, total };
}

/**
 * Calculate comprehensive metrics for a cohort of users
 */
export function calculateCohortMetrics(
  users: EnhancedMasterUserRecord[]
): CohortMetrics {
  // Handle empty users array
  if (users.length === 0) {
    return {
      userCount: 0,
      metrics: {
        totalLinesChanged: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        aiLinesChanged: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        commitCount: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        pctAiCode: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        totalSessions: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        totalAgentRequests: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        numProductsUsed: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        membershipDays: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        engagementScore: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
      },
      featureAdoption: {
        isMcpUser: 0,
        isRuleCreator: 0,
        isRuleUser: 0,
        isCommandCreator: 0,
        isCommandUser: 0,
      },
    };
  }

  const metrics = {} as CohortMetrics['metrics'];
  
  // Calculate stats for each numeric metric
  for (const metricKey of NUMERIC_METRICS) {
    const values = users
      .map(u => u[metricKey])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
    
    metrics[metricKey] = calculateMetricStats(values);
  }
  
  // Calculate feature adoption percentages
  const featureAdoption = {
    isMcpUser: (users.filter(u => u.isMcpUser).length / users.length) * 100,
    isRuleCreator: (users.filter(u => u.isRuleCreator).length / users.length) * 100,
    isRuleUser: (users.filter(u => u.isRuleUser).length / users.length) * 100,
    isCommandCreator: (users.filter(u => u.isCommandCreator).length / users.length) * 100,
    isCommandUser: (users.filter(u => u.isCommandUser).length / users.length) * 100,
  };
  
  return {
    userCount: users.length,
    metrics,
    featureAdoption,
  };
}

