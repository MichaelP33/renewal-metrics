import { calculateMultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import { createCohort } from '@/lib/power-users/cohort-manager';
import { applyFilters } from '@/lib/power-users/filter-utils';
import type { EnhancedMasterUserRecord } from '@/types/power-users';
import type { FilterState } from '../MasterTableFilters';

const defaultFilters: FilterState = {
  searchText: '',
  isMcpUser: null,
  isRuleCreator: null,
  isRuleUser: null,
  isCommandCreator: null,
  isCommandUser: null,
  aiLinesMin: '',
  aiLinesMax: '',
  sessionsMin: '',
  sessionsMax: '',
  requestsMin: '',
  requestsMax: '',
  engagementScoreMin: '',
  engagementScoreMax: '',
  isPowerUserFilter: [],
};

const createTestUser = (overrides: Partial<EnhancedMasterUserRecord> = {}): EnhancedMasterUserRecord => ({
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  totalSessions: 100,
  totalAgentRequests: 500,
  aiLinesChanged: 1000,
  totalLinesChanged: 5000,
  pctAiCode: 20,
  commitCount: 50,
  isMcpUser: false,
  isRuleCreator: false,
  isRuleUser: false,
  isCommandCreator: false,
  isCommandUser: false,
  numProductsUsed: 3,
  membershipDays: 365,
  engagementScore: 50,
  isPowerUser: false,
  sourceFlags: {
    aiCode: true,
    features: true,
    agentRequests: true,
  },
  ...overrides,
});

describe('Multi-Cohort Comparison Integration', () => {
  it('should create and compare 3 cohorts end-to-end', () => {
    // Create test users
    const users = [
      createTestUser({ email: 'user1@example.com', engagementScore: 85, isMcpUser: true }),
      createTestUser({ email: 'user2@example.com', engagementScore: 65, isMcpUser: true }),
      createTestUser({ email: 'user3@example.com', engagementScore: 45, isMcpUser: false }),
      createTestUser({ email: 'user4@example.com', engagementScore: 25, isMcpUser: false }),
    ];

    // Create 3 cohorts with different criteria
    const cohort1 = createCohort('Power Users', {
      ...defaultFilters,
      engagementScoreMin: '70',
    });

    const cohort2 = createCohort('MCP Users', {
      ...defaultFilters,
      isMcpUser: true,
    });

    const cohort3 = createCohort('Active Users', {
      ...defaultFilters,
      engagementScoreMin: '40',
    });

    // Calculate stats for all cohorts
    const stats = calculateMultiCohortStats(users, [cohort1, cohort2, cohort3]);

    // Verify structure
    expect(stats.cohorts).toHaveLength(3);
    expect(stats.comparisonMetrics).toHaveLength(9);

    // Verify user counts
    expect(stats.cohorts[0].metrics.userCount).toBe(1); // Power Users
    expect(stats.cohorts[1].metrics.userCount).toBe(2); // MCP Users
    expect(stats.cohorts[2].metrics.userCount).toBe(3); // Active Users

    // Verify comparison metrics have correct structure
    stats.comparisonMetrics.forEach(metric => {
      expect(metric).toHaveProperty('metricName');
      expect(metric).toHaveProperty('metricKey');
      expect(metric).toHaveProperty('values');
      expect(metric).toHaveProperty('range');
      expect(metric).toHaveProperty('spread');
    });
  });

  it('should calculate correct metrics across cohorts', () => {
    const users = [
      createTestUser({ email: 'user1@example.com', totalSessions: 200, engagementScore: 80 }),
      createTestUser({ email: 'user2@example.com', totalSessions: 100, engagementScore: 50 }),
    ];

    const highCohort = createCohort('High Sessions', {
      ...defaultFilters,
      sessionsMin: '150',
    });

    const lowCohort = createCohort('Low Sessions', {
      ...defaultFilters,
      sessionsMax: '150',
    });

    const stats = calculateMultiCohortStats(users, [highCohort, lowCohort]);

    // High cohort should have higher average sessions
    const sessionsMetric = stats.comparisonMetrics.find(m => m.metricKey === 'totalSessions');
    expect(sessionsMetric?.values[highCohort.id]).toBeGreaterThan(
      sessionsMetric?.values[lowCohort.id] || 0
    );
  });
});

