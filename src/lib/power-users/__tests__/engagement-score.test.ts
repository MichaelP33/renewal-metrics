import {
  calculateEngagementScore,
  segmentUser,
  calculatePercentiles,
  calculateCorrelation,
  countPowerFeatures,
} from '../engagement-score';
import type { MasterUserRecord } from '@/types/power-users';

describe('engagement-score', () => {
  describe('calculateEngagementScore', () => {
    it('should calculate score for a power user', () => {
      const user: MasterUserRecord = {
        email: 'test@example.com',
        totalSessions: 500,
        totalAgentRequests: 5000,
        pctAiCode: 80,
        isMcpUser: true,
        isRuleCreator: true,
        isRuleUser: true,
        isCommandCreator: true,
        isCommandUser: true,
        membershipDays: 200,
        sourceFlags: {
          aiCode: true,
          features: true,
          agentRequests: true,
        },
      };

      const score = calculateEngagementScore(user);
      expect(score).toBeGreaterThan(50);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate score for a casual user', () => {
      const user: MasterUserRecord = {
        email: 'test@example.com',
        totalSessions: 50,
        totalAgentRequests: 500,
        pctAiCode: 30,
        isMcpUser: false,
        isRuleCreator: false,
        isRuleUser: false,
        isCommandCreator: false,
        isCommandUser: false,
        membershipDays: 100,
        sourceFlags: {
          aiCode: true,
          features: true,
          agentRequests: true,
        },
      };

      const score = calculateEngagementScore(user);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(50);
    });

    it('should handle missing data gracefully', () => {
      const user: MasterUserRecord = {
        email: 'test@example.com',
        sourceFlags: {
          aiCode: false,
          features: false,
          agentRequests: false,
        },
      };

      const score = calculateEngagementScore(user);
      expect(score).toBe(0);
    });

    it('should clamp score to 0-100 range', () => {
      const user: MasterUserRecord = {
        email: 'test@example.com',
        totalSessions: 10000,
        totalAgentRequests: 100000,
        pctAiCode: 100,
        isMcpUser: true,
        isRuleCreator: true,
        isRuleUser: true,
        isCommandCreator: true,
        isCommandUser: true,
        membershipDays: 1000,
        sourceFlags: {
          aiCode: true,
          features: true,
          agentRequests: true,
        },
      };

      const score = calculateEngagementScore(user);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('segmentUser', () => {
    it('should segment power users correctly', () => {
      expect(segmentUser(85)).toBe('power');
      expect(segmentUser(100)).toBe('power');
      expect(segmentUser(70)).toBe('power');
    });

    it('should segment active users correctly', () => {
      expect(segmentUser(60)).toBe('active');
      expect(segmentUser(50)).toBe('active');
    });

    it('should segment casual users correctly', () => {
      expect(segmentUser(40)).toBe('casual');
      expect(segmentUser(30)).toBe('casual');
    });

    it('should segment at-risk users correctly', () => {
      expect(segmentUser(20)).toBe('at-risk');
      expect(segmentUser(0)).toBe('at-risk');
    });
  });

  describe('calculatePercentiles', () => {
    it('should calculate percentiles correctly', () => {
      const scores = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const percentiles = calculatePercentiles(scores);
      
      expect(percentiles).toHaveLength(10);
      expect(percentiles[0]).toBe(0); // 10 is the lowest
      expect(percentiles[9]).toBe(90); // 100 is the highest
    });

    it('should handle empty array', () => {
      const percentiles = calculatePercentiles([]);
      expect(percentiles).toEqual([]);
    });

    it('should handle single value', () => {
      const percentiles = calculatePercentiles([50]);
      expect(percentiles).toEqual([0]);
    });

    it('should handle duplicate values', () => {
      const scores = [50, 50, 50, 50, 50];
      const percentiles = calculatePercentiles(scores);
      
      expect(percentiles).toHaveLength(5);
      expect(percentiles.every(p => p === 0)).toBe(true);
    });
  });

  describe('calculateCorrelation', () => {
    it('should calculate positive correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10];
      
      const correlation = calculateCorrelation(x, y);
      expect(correlation).toBeCloseTo(1, 5);
    });

    it('should calculate negative correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [10, 8, 6, 4, 2];
      
      const correlation = calculateCorrelation(x, y);
      expect(correlation).toBeCloseTo(-1, 5);
    });

    it('should calculate zero correlation', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [5, 5, 5, 5, 5];
      
      const correlation = calculateCorrelation(x, y);
      expect(correlation).toBe(0);
    });

    it('should handle empty arrays', () => {
      const correlation = calculateCorrelation([], []);
      expect(correlation).toBe(0);
    });

    it('should handle mismatched arrays', () => {
      const correlation = calculateCorrelation([1, 2, 3], [1, 2]);
      expect(correlation).toBe(0);
    });
  });

  describe('countPowerFeatures', () => {
    it('should count all power features', () => {
      const user: MasterUserRecord = {
        email: 'test@example.com',
        isMcpUser: true,
        isRuleCreator: true,
        isRuleUser: true,
        isCommandCreator: true,
        isCommandUser: true,
        sourceFlags: {
          aiCode: false,
          features: true,
          agentRequests: false,
        },
      };

      expect(countPowerFeatures(user)).toBe(5);
    });

    it('should count no power features', () => {
      const user: MasterUserRecord = {
        email: 'test@example.com',
        sourceFlags: {
          aiCode: false,
          features: false,
          agentRequests: false,
        },
      };

      expect(countPowerFeatures(user)).toBe(0);
    });

    it('should count partial power features', () => {
      const user: MasterUserRecord = {
        email: 'test@example.com',
        isMcpUser: true,
        isRuleCreator: true,
        sourceFlags: {
          aiCode: false,
          features: true,
          agentRequests: false,
        },
      };

      expect(countPowerFeatures(user)).toBe(2);
    });
  });
});

