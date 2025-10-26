import { calculateCohortMetrics } from '../cohort-aggregation';
import type { EnhancedMasterUserRecord } from '@/types/power-users';

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

describe('cohort-aggregation', () => {
  describe('calculateCohortMetrics', () => {
    it('should calculate metrics for a single user', () => {
      const users = [
        createTestUser({
          totalLinesChanged: 1000,
          aiLinesChanged: 500,
          commitCount: 100,
          pctAiCode: 50,
          totalSessions: 200,
          totalAgentRequests: 1000,
          numProductsUsed: 5,
          membershipDays: 365,
          engagementScore: 75,
        }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.userCount).toBe(1);
      expect(result.metrics.totalLinesChanged.mean).toBe(1000);
      expect(result.metrics.totalLinesChanged.median).toBe(1000);
      expect(result.metrics.totalLinesChanged.min).toBe(1000);
      expect(result.metrics.totalLinesChanged.max).toBe(1000);
      expect(result.metrics.aiLinesChanged.mean).toBe(500);
      expect(result.metrics.engagementScore.mean).toBe(75);
    });

    it('should calculate mean correctly for multiple users', () => {
      const users = [
        createTestUser({ totalSessions: 100 }),
        createTestUser({ totalSessions: 200 }),
        createTestUser({ totalSessions: 300 }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.totalSessions.mean).toBe(200);
    });

    it('should calculate median correctly', () => {
      const users = [
        createTestUser({ totalAgentRequests: 100 }),
        createTestUser({ totalAgentRequests: 200 }),
        createTestUser({ totalAgentRequests: 300 }),
        createTestUser({ totalAgentRequests: 400 }),
        createTestUser({ totalAgentRequests: 500 }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.totalAgentRequests.median).toBe(300);
    });

    it('should calculate p75 correctly', () => {
      const users = [
        createTestUser({ aiLinesChanged: 100 }),
        createTestUser({ aiLinesChanged: 200 }),
        createTestUser({ aiLinesChanged: 300 }),
        createTestUser({ aiLinesChanged: 400 }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.aiLinesChanged.p75).toBe(400);
    });

    it('should calculate p90 correctly', () => {
      const users = Array.from({ length: 10 }, (_, i) =>
        createTestUser({ commitCount: (i + 1) * 10 })
      );

      const result = calculateCohortMetrics(users);

      expect(result.metrics.commitCount.p90).toBe(100);
    });

    it('should calculate min and max correctly', () => {
      const users = [
        createTestUser({ engagementScore: 30 }),
        createTestUser({ engagementScore: 50 }),
        createTestUser({ engagementScore: 70 }),
        createTestUser({ engagementScore: 90 }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.engagementScore.min).toBe(30);
      expect(result.metrics.engagementScore.max).toBe(90);
    });

    it('should calculate total correctly', () => {
      const users = [
        createTestUser({ totalLinesChanged: 1000 }),
        createTestUser({ totalLinesChanged: 2000 }),
        createTestUser({ totalLinesChanged: 3000 }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.totalLinesChanged.total).toBe(6000);
    });

    it('should calculate feature adoption percentages', () => {
      const users = [
        createTestUser({ isMcpUser: true, isRuleCreator: true, isRuleUser: false }),
        createTestUser({ isMcpUser: true, isRuleCreator: false, isRuleUser: true }),
        createTestUser({ isMcpUser: false, isRuleCreator: false, isRuleUser: false }),
        createTestUser({ isMcpUser: false, isRuleCreator: false, isRuleUser: false }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.featureAdoption.isMcpUser).toBe(50); // 2/4 = 50%
      expect(result.featureAdoption.isRuleCreator).toBe(25); // 1/4 = 25%
      expect(result.featureAdoption.isRuleUser).toBe(25); // 1/4 = 25%
    });

    it('should handle 100% feature adoption', () => {
      const users = [
        createTestUser({ isMcpUser: true, isRuleCreator: true }),
        createTestUser({ isMcpUser: true, isRuleCreator: true }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.featureAdoption.isMcpUser).toBe(100);
      expect(result.featureAdoption.isRuleCreator).toBe(100);
    });

    it('should handle 0% feature adoption', () => {
      const users = [
        createTestUser({ isMcpUser: false, isRuleCreator: false }),
        createTestUser({ isMcpUser: false, isRuleCreator: false }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.featureAdoption.isMcpUser).toBe(0);
      expect(result.featureAdoption.isRuleCreator).toBe(0);
    });

    it('should handle empty user array', () => {
      const users: EnhancedMasterUserRecord[] = [];

      const result = calculateCohortMetrics(users);

      expect(result.userCount).toBe(0);
      expect(result.metrics.totalSessions.mean).toBe(0);
      expect(result.metrics.totalSessions.median).toBe(0);
      expect(result.metrics.totalSessions.min).toBe(0);
      expect(result.metrics.totalSessions.max).toBe(0);
      expect(result.featureAdoption.isMcpUser).toBe(0);
    });

    it('should handle undefined numeric values by filtering them out', () => {
      const users = [
        createTestUser({ totalSessions: 100 }),
        createTestUser({ totalSessions: undefined }),
        createTestUser({ totalSessions: 200 }),
      ];

      const result = calculateCohortMetrics(users);

      // Should calculate based on 2 users, not 3
      expect(result.metrics.totalSessions.mean).toBe(150);
      expect(result.metrics.totalSessions.min).toBe(100);
      expect(result.metrics.totalSessions.max).toBe(200);
    });

    it('should handle NaN values by filtering them out', () => {
      const users = [
        createTestUser({ pctAiCode: 20 }),
        createTestUser({ pctAiCode: NaN }),
        createTestUser({ pctAiCode: 40 }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.pctAiCode.mean).toBe(30);
    });

    it('should calculate all 9 metrics', () => {
      const users = [createTestUser()];

      const result = calculateCohortMetrics(users);

      expect(result.metrics).toHaveProperty('totalLinesChanged');
      expect(result.metrics).toHaveProperty('aiLinesChanged');
      expect(result.metrics).toHaveProperty('commitCount');
      expect(result.metrics).toHaveProperty('pctAiCode');
      expect(result.metrics).toHaveProperty('totalSessions');
      expect(result.metrics).toHaveProperty('totalAgentRequests');
      expect(result.metrics).toHaveProperty('numProductsUsed');
      expect(result.metrics).toHaveProperty('membershipDays');
      expect(result.metrics).toHaveProperty('engagementScore');
    });

    it('should calculate all 5 feature adoption metrics', () => {
      const users = [createTestUser()];

      const result = calculateCohortMetrics(users);

      expect(result.featureAdoption).toHaveProperty('isMcpUser');
      expect(result.featureAdoption).toHaveProperty('isRuleCreator');
      expect(result.featureAdoption).toHaveProperty('isRuleUser');
      expect(result.featureAdoption).toHaveProperty('isCommandCreator');
      expect(result.featureAdoption).toHaveProperty('isCommandUser');
    });

    it('should handle duplicate values correctly', () => {
      const users = [
        createTestUser({ engagementScore: 50 }),
        createTestUser({ engagementScore: 50 }),
        createTestUser({ engagementScore: 50 }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.engagementScore.mean).toBe(50);
      expect(result.metrics.engagementScore.median).toBe(50);
      expect(result.metrics.engagementScore.min).toBe(50);
      expect(result.metrics.engagementScore.max).toBe(50);
      expect(result.metrics.engagementScore.total).toBe(150);
    });

    it('should handle large dataset (1000 users) with acceptable performance', () => {
      const users = Array.from({ length: 1000 }, (_, i) =>
        createTestUser({
          totalSessions: Math.floor(Math.random() * 500),
          engagementScore: Math.floor(Math.random() * 100),
          isMcpUser: Math.random() > 0.5,
        })
      );

      const startTime = Date.now();
      const result = calculateCohortMetrics(users);
      const duration = Date.now() - startTime;

      expect(result.userCount).toBe(1000);
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should return correct structure with all required fields', () => {
      const users = [createTestUser()];

      const result = calculateCohortMetrics(users);

      expect(result).toHaveProperty('userCount');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('featureAdoption');

      // Check metric structure
      const sampleMetric = result.metrics.totalSessions;
      expect(sampleMetric).toHaveProperty('mean');
      expect(sampleMetric).toHaveProperty('median');
      expect(sampleMetric).toHaveProperty('p75');
      expect(sampleMetric).toHaveProperty('p90');
      expect(sampleMetric).toHaveProperty('min');
      expect(sampleMetric).toHaveProperty('max');
      expect(sampleMetric).toHaveProperty('total');
    });

    it('should handle edge case: single user with all zeros', () => {
      const users = [
        createTestUser({
          totalLinesChanged: 0,
          aiLinesChanged: 0,
          commitCount: 0,
          pctAiCode: 0,
          totalSessions: 0,
          totalAgentRequests: 0,
          numProductsUsed: 0,
          membershipDays: 0,
          engagementScore: 0,
        }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.userCount).toBe(1);
      expect(result.metrics.totalSessions.mean).toBe(0);
      expect(result.metrics.totalSessions.max).toBe(0);
    });

    it('should handle edge case: very large numbers', () => {
      const users = [
        createTestUser({
          totalLinesChanged: 1000000,
          aiLinesChanged: 500000,
          totalAgentRequests: 100000,
        }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.totalLinesChanged.mean).toBe(1000000);
      expect(result.metrics.aiLinesChanged.mean).toBe(500000);
      expect(result.metrics.totalAgentRequests.mean).toBe(100000);
    });

    it('should maintain precision with decimal values', () => {
      const users = [
        createTestUser({ pctAiCode: 33.33 }),
        createTestUser({ pctAiCode: 66.67 }),
      ];

      const result = calculateCohortMetrics(users);

      expect(result.metrics.pctAiCode.mean).toBeCloseTo(50, 1);
    });
  });
});

