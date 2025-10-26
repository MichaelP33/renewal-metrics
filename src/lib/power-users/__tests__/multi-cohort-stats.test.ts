import { calculateMultiCohortStats } from '../multi-cohort-stats';
import type { EnhancedMasterUserRecord } from '@/types/power-users';
import type { StoredCohort } from '../cohort-manager';
import type { FilterState } from '@/components/power-users/MasterTableFilters';

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

const createTestCohort = (
  id: string,
  name: string,
  filterCriteria: FilterState
): StoredCohort => ({
  id,
  name,
  color: '#f54e00',
  createdAt: new Date().toISOString(),
  filterCriteria,
});

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

describe('multi-cohort-stats', () => {
  describe('calculateMultiCohortStats', () => {
    it('should calculate stats for 2 cohorts', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true, totalSessions: 100 }),
        createTestUser({ email: 'user2@example.com', isMcpUser: true, totalSessions: 200 }),
        createTestUser({ email: 'user3@example.com', isMcpUser: false, totalSessions: 50 }),
        createTestUser({ email: 'user4@example.com', isMcpUser: false, totalSessions: 75 }),
      ];

      const cohort1 = createTestCohort('cohort1', 'MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const cohort2 = createTestCohort('cohort2', 'Non-MCP Users', {
        ...defaultFilters,
        isMcpUser: false,
      });

      const result = calculateMultiCohortStats(users, [cohort1, cohort2]);

      expect(result.cohorts).toHaveLength(2);
      expect(result.cohorts[0].cohort.id).toBe('cohort1');
      expect(result.cohorts[0].metrics.userCount).toBe(2);
      expect(result.cohorts[1].cohort.id).toBe('cohort2');
      expect(result.cohorts[1].metrics.userCount).toBe(2);
    });

    it('should calculate stats for 6 cohorts (maximum)', () => {
      const users = Array.from({ length: 60 }, (_, i) =>
        createTestUser({
          email: `user${i}@example.com`,
          engagementScore: Math.floor((i / 10) * 20) + 10,
        })
      );

      const cohorts = [
        createTestCohort('c1', 'Cohort 1', { ...defaultFilters, engagementScoreMin: '0', engagementScoreMax: '20' }),
        createTestCohort('c2', 'Cohort 2', { ...defaultFilters, engagementScoreMin: '21', engagementScoreMax: '40' }),
        createTestCohort('c3', 'Cohort 3', { ...defaultFilters, engagementScoreMin: '41', engagementScoreMax: '60' }),
        createTestCohort('c4', 'Cohort 4', { ...defaultFilters, engagementScoreMin: '61', engagementScoreMax: '80' }),
        createTestCohort('c5', 'Cohort 5', { ...defaultFilters, engagementScoreMin: '81', engagementScoreMax: '100' }),
        createTestCohort('c6', 'Cohort 6', defaultFilters),
      ];

      const result = calculateMultiCohortStats(users, cohorts);

      expect(result.cohorts).toHaveLength(6);
      expect(result.comparisonMetrics).toHaveLength(9); // 9 metrics
    });

    it('should return correct structure with cohort results and comparison metrics', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', totalSessions: 100 }),
      ];

      const cohort = createTestCohort('cohort1', 'Test Cohort', defaultFilters);

      const result = calculateMultiCohortStats(users, [cohort, cohort]);

      expect(result).toHaveProperty('cohorts');
      expect(result).toHaveProperty('comparisonMetrics');
      expect(Array.isArray(result.cohorts)).toBe(true);
      expect(Array.isArray(result.comparisonMetrics)).toBe(true);
    });

    it('should calculate comparison metrics for each metric type', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', totalSessions: 100, engagementScore: 60 }),
        createTestUser({ email: 'user2@example.com', totalSessions: 200, engagementScore: 80 }),
      ];

      const cohort1 = createTestCohort('cohort1', 'Low Sessions', {
        ...defaultFilters,
        sessionsMax: '150',
      });

      const cohort2 = createTestCohort('cohort2', 'High Sessions', {
        ...defaultFilters,
        sessionsMin: '150',
      });

      const result = calculateMultiCohortStats(users, [cohort1, cohort2]);

      expect(result.comparisonMetrics).toHaveLength(9);
      
      const sessionsMetric = result.comparisonMetrics.find(m => m.metricKey === 'totalSessions');
      expect(sessionsMetric).toBeDefined();
      expect(sessionsMetric?.metricName).toBe('Agent Sessions');
      expect(sessionsMetric?.values).toHaveProperty('cohort1');
      expect(sessionsMetric?.values).toHaveProperty('cohort2');
    });

    it('should calculate min, max, and spread correctly', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', engagementScore: 30 }),
        createTestUser({ email: 'user2@example.com', engagementScore: 50 }),
        createTestUser({ email: 'user3@example.com', engagementScore: 70 }),
      ];

      const cohort1 = createTestCohort('cohort1', 'Low Engagement', {
        ...defaultFilters,
        engagementScoreMax: '40',
      });

      const cohort2 = createTestCohort('cohort2', 'High Engagement', {
        ...defaultFilters,
        engagementScoreMin: '60',
      });

      const result = calculateMultiCohortStats(users, [cohort1, cohort2]);

      const engagementMetric = result.comparisonMetrics.find(m => m.metricKey === 'engagementScore');
      expect(engagementMetric).toBeDefined();
      expect(engagementMetric?.range.min).toBe(30);
      expect(engagementMetric?.range.max).toBe(70);
      expect(engagementMetric?.spread).toBe(40);
    });

    it('should handle cohorts with no matching users', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: false }),
      ];

      const cohort1 = createTestCohort('cohort1', 'MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const cohort2 = createTestCohort('cohort2', 'All Users', defaultFilters);

      const result = calculateMultiCohortStats(users, [cohort1, cohort2]);

      expect(result.cohorts[0].metrics.userCount).toBe(0);
      expect(result.cohorts[1].metrics.userCount).toBe(1);
    });

    it('should include all 9 metric keys in comparison metrics', () => {
      const users = [createTestUser()];
      const cohort = createTestCohort('cohort1', 'Test', defaultFilters);

      const result = calculateMultiCohortStats(users, [cohort, cohort]);

      const metricKeys = result.comparisonMetrics.map(m => m.metricKey);
      expect(metricKeys).toContain('totalLinesChanged');
      expect(metricKeys).toContain('aiLinesChanged');
      expect(metricKeys).toContain('commitCount');
      expect(metricKeys).toContain('pctAiCode');
      expect(metricKeys).toContain('totalSessions');
      expect(metricKeys).toContain('totalAgentRequests');
      expect(metricKeys).toContain('numProductsUsed');
      expect(metricKeys).toContain('membershipDays');
      expect(metricKeys).toContain('engagementScore');
    });

    it('should use display names for metrics', () => {
      const users = [createTestUser()];
      const cohort = createTestCohort('cohort1', 'Test', defaultFilters);

      const result = calculateMultiCohortStats(users, [cohort, cohort]);

      const engagementMetric = result.comparisonMetrics.find(m => m.metricKey === 'engagementScore');
      expect(engagementMetric?.metricName).toBe('Engagement Score');

      const sessionsMetric = result.comparisonMetrics.find(m => m.metricKey === 'totalSessions');
      expect(sessionsMetric?.metricName).toBe('Agent Sessions');
    });

    it('should calculate mean values for comparison metrics', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', totalSessions: 100 }),
        createTestUser({ email: 'user2@example.com', totalSessions: 200 }),
        createTestUser({ email: 'user3@example.com', totalSessions: 300 }),
      ];

      const cohort = createTestCohort('cohort1', 'All Users', defaultFilters);

      const result = calculateMultiCohortStats(users, [cohort]);

      const sessionsMetric = result.comparisonMetrics.find(m => m.metricKey === 'totalSessions');
      expect(sessionsMetric?.values['cohort1']).toBe(200);
    });

    it('should handle overlapping cohorts correctly', () => {
      const users = [
        createTestUser({
          email: 'user1@example.com',
          isMcpUser: true,
          isRuleCreator: true,
          engagementScore: 80,
        }),
        createTestUser({
          email: 'user2@example.com',
          isMcpUser: true,
          isRuleCreator: false,
          engagementScore: 60,
        }),
        createTestUser({
          email: 'user3@example.com',
          isMcpUser: false,
          isRuleCreator: true,
          engagementScore: 70,
        }),
      ];

      const cohort1 = createTestCohort('cohort1', 'MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const cohort2 = createTestCohort('cohort2', 'Rule Creators', {
        ...defaultFilters,
        isRuleCreator: true,
      });

      const result = calculateMultiCohortStats(users, [cohort1, cohort2]);

      expect(result.cohorts[0].metrics.userCount).toBe(2);
      expect(result.cohorts[1].metrics.userCount).toBe(2);
    });

    it('should preserve cohort metadata in results', () => {
      const users = [createTestUser()];

      const cohort = createTestCohort('test_id', 'Test Cohort', defaultFilters);

      const result = calculateMultiCohortStats(users, [cohort]);

      expect(result.cohorts[0].cohort.id).toBe('test_id');
      expect(result.cohorts[0].cohort.name).toBe('Test Cohort');
      expect(result.cohorts[0].cohort.color).toBe('#f54e00');
    });

    it('should handle edge case: all cohorts with same users', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', engagementScore: 50 }),
        createTestUser({ email: 'user2@example.com', engagementScore: 50 }),
      ];

      const cohort = createTestCohort('cohort1', 'All Users', defaultFilters);

      const result = calculateMultiCohortStats(users, [cohort, cohort, cohort]);

      expect(result.cohorts).toHaveLength(3);
      expect(result.cohorts.every(c => c.metrics.userCount === 2)).toBe(true);
      
      // Spread should be 0 since all cohorts have identical users
      const engagementMetric = result.comparisonMetrics.find(m => m.metricKey === 'engagementScore');
      expect(engagementMetric?.spread).toBe(0);
    });

    it('should handle performance with large dataset', () => {
      const users = Array.from({ length: 1000 }, (_, i) =>
        createTestUser({
          email: `user${i}@example.com`,
          totalSessions: Math.floor(Math.random() * 500),
          engagementScore: Math.floor(Math.random() * 100),
        })
      );

      const cohorts = [
        createTestCohort('c1', 'Low', { ...defaultFilters, engagementScoreMax: '50' }),
        createTestCohort('c2', 'High', { ...defaultFilters, engagementScoreMin: '50' }),
        createTestCohort('c3', 'All', defaultFilters),
      ];

      const startTime = Date.now();
      const result = calculateMultiCohortStats(users, cohorts);
      const duration = Date.now() - startTime;

      expect(result.cohorts).toHaveLength(3);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle infinite values gracefully in range calculations', () => {
      const users: EnhancedMasterUserRecord[] = [];

      const cohort1 = createTestCohort('cohort1', 'Empty Cohort 1', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const cohort2 = createTestCohort('cohort2', 'Empty Cohort 2', {
        ...defaultFilters,
        isRuleCreator: true,
      });

      const result = calculateMultiCohortStats(users, [cohort1, cohort2]);

      result.comparisonMetrics.forEach(metric => {
        expect(isFinite(metric.range.min)).toBe(true);
        expect(isFinite(metric.range.max)).toBe(true);
        expect(isFinite(metric.spread)).toBe(true);
      });
    });

    it('should return mean of 0 for cohorts with no users', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: false }),
      ];

      const cohort = createTestCohort('cohort1', 'MCP Users Only', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const result = calculateMultiCohortStats(users, [cohort]);

      const sessionsMetric = result.comparisonMetrics.find(m => m.metricKey === 'totalSessions');
      expect(sessionsMetric?.values['cohort1']).toBe(0);
    });

    it('should calculate comparison metrics with correct cohort IDs as keys', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', totalSessions: 100 }),
        createTestUser({ email: 'user2@example.com', totalSessions: 200 }),
      ];

      const cohort1 = createTestCohort('custom_id_1', 'Cohort 1', defaultFilters);
      const cohort2 = createTestCohort('custom_id_2', 'Cohort 2', defaultFilters);

      const result = calculateMultiCohortStats(users, [cohort1, cohort2]);

      const sessionsMetric = result.comparisonMetrics.find(m => m.metricKey === 'totalSessions');
      expect(sessionsMetric?.values).toHaveProperty('custom_id_1');
      expect(sessionsMetric?.values).toHaveProperty('custom_id_2');
    });
  });
});

