import type { EnhancedMasterUserRecord, Cohort, CohortMetrics } from '@/types/power-users';
import type { StoredCohort } from './cohort-manager';
import { getUsersForCohorts } from './cohort-filtering';
import { calculateCohortMetrics } from './cohort-aggregation';

// Extended MultiCohortStats interface that accepts both Cohort and StoredCohort
export interface MultiCohortStats {
  cohorts: Array<{
    cohort: Cohort | StoredCohort;
    metrics: CohortMetrics;
  }>;
  comparisonMetrics: Array<{
    metricName: string;
    metricKey: string;
    values: Record<string, number>;  // cohortId -> mean value
    range: { min: number; max: number };
    spread: number;
  }>;
}

const METRIC_DISPLAY_NAMES: Record<string, string> = {
  totalLinesChanged: 'Total Lines of Code',
  aiLinesChanged: 'AI-Assisted Lines',
  commitCount: 'Commit Count',
  pctAiCode: 'AI Code Percentage',
  totalSessions: 'Agent Sessions',
  totalAgentRequests: 'Agent Requests',
  numProductsUsed: 'Products Used',
  membershipDays: 'Membership Days',
  engagementScore: 'Engagement Score',
};

/**
 * Calculate comprehensive statistics for multiple cohorts
 * This is the main entry point for multi-cohort comparison analysis
 */
export function calculateMultiCohortStats(
  allUsers: EnhancedMasterUserRecord[],
  cohorts: (Cohort | StoredCohort)[]
): MultiCohortStats {
  // Filter users for each cohort
  const cohortUsersMap = getUsersForCohorts(allUsers, cohorts);
  
  // Calculate metrics for each cohort
  const cohortResults = cohorts.map(cohort => {
    const users = cohortUsersMap.get(cohort.id) || [];
    const metrics = calculateCohortMetrics(users);
    
    return {
      cohort,
      metrics,
    };
  });
  
  // Build comparison metrics (one entry per metric type)
  const metricKeys = Object.keys(METRIC_DISPLAY_NAMES);
  const comparisonMetrics = metricKeys.map(metricKey => {
    const values: Record<string, number> = {};
    let min = Infinity;
    let max = -Infinity;
    
    for (const result of cohortResults) {
      const meanValue = result.metrics.metrics[metricKey as keyof CohortMetrics['metrics']]?.mean || 0;
      values[result.cohort.id] = meanValue;
      
      if (meanValue < min) min = meanValue;
      if (meanValue > max) max = meanValue;
    }
    
    return {
      metricName: METRIC_DISPLAY_NAMES[metricKey],
      metricKey,
      values,
      range: { min: isFinite(min) ? min : 0, max: isFinite(max) ? max : 0 },
      spread: isFinite(max) && isFinite(min) ? max - min : 0,
    };
  });
  
  return {
    cohorts: cohortResults,
    comparisonMetrics,
  };
}

