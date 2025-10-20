import { aggregateUserData } from '../aggregator';
import { AICodeMetrics, PowerUserFeatures, AgentRequests } from '@/types/power-users';

describe('aggregateUserData', () => {
  describe('single dataset aggregation', () => {
    it('should aggregate AI code data only', () => {
      const ai: AICodeMetrics[] = [
        {
          email: 'test@example.com',
          linkedinUrl: 'https://linkedin.com/in/test',
          aiLinesChanged: 1000,
          totalLinesChanged: 2000,
          pctAiCode: 50,
          commitCount: 10,
        },
      ];

      const result = aggregateUserData(ai);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        email: 'test@example.com',
        linkedinUrl: 'https://linkedin.com/in/test',
        aiLinesChanged: 1000,
        totalLinesChanged: 2000,
        pctAiCode: 50,
        commitCount: 10,
        sourceFlags: { aiCode: true, features: false, agentRequests: false },
      });
    });

    it('should aggregate features data only', () => {
      const features: PowerUserFeatures[] = [
        {
          email: 'test@example.com',
          isMcpUser: true,
          isRuleCreator: true,
          isRuleUser: false,
          isCommandCreator: false,
          isCommandUser: false,
          numProductsUsed: 3,
          membershipDays: 60,
        },
      ];

      const result = aggregateUserData(undefined, features);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        email: 'test@example.com',
        isMcpUser: true,
        isRuleCreator: true,
        isRuleUser: false,
        isCommandCreator: false,
        isCommandUser: false,
        numProductsUsed: 3,
        membershipDays: 60,
        sourceFlags: { aiCode: false, features: true, agentRequests: false },
      });
    });

    it('should aggregate agent data only', () => {
      const agent: AgentRequests[] = [
        {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          totalRequests: 100,
          totalSessions: 50,
        },
      ];

      const result = aggregateUserData(undefined, undefined, agent);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        totalSessions: 50,
        totalAgentRequests: 100,
        sourceFlags: { aiCode: false, features: false, agentRequests: true },
      });
    });
  });

  describe('multi-dataset aggregation', () => {
    it('should merge AI code and features data', () => {
      const ai: AICodeMetrics[] = [
        {
          email: 'test@example.com',
          linkedinUrl: 'https://linkedin.com/in/test',
          aiLinesChanged: 1000,
          totalLinesChanged: 2000,
          pctAiCode: 50,
          commitCount: 10,
        },
      ];

      const features: PowerUserFeatures[] = [
        {
          email: 'test@example.com',
          isMcpUser: true,
          isRuleCreator: true,
          isRuleUser: false,
          isCommandCreator: false,
          isCommandUser: false,
          numProductsUsed: 3,
          membershipDays: 60,
        },
      ];

      const result = aggregateUserData(ai, features);
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('test@example.com');
      expect(result[0].aiLinesChanged).toBe(1000);
      expect(result[0].isMcpUser).toBe(true);
      expect(result[0].sourceFlags).toEqual({
        aiCode: true,
        features: true,
        agentRequests: false,
      });
    });

    it('should merge all three datasets', () => {
      const ai: AICodeMetrics[] = [
        {
          email: 'test@example.com',
          linkedinUrl: 'https://linkedin.com/in/test',
          aiLinesChanged: 1000,
          totalLinesChanged: 2000,
          pctAiCode: 50,
          commitCount: 10,
        },
      ];

      const features: PowerUserFeatures[] = [
        {
          email: 'test@example.com',
          isMcpUser: true,
          isRuleCreator: true,
          isRuleUser: false,
          isCommandCreator: false,
          isCommandUser: false,
          numProductsUsed: 3,
          membershipDays: 60,
        },
      ];

      const agent: AgentRequests[] = [
        {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          totalRequests: 100,
          totalSessions: 50,
        },
      ];

      const result = aggregateUserData(ai, features, agent);
      expect(result).toHaveLength(1);
      expect(result[0].sourceFlags).toEqual({
        aiCode: true,
        features: true,
        agentRequests: true,
      });
      expect(result[0].firstName).toBe('John');
      expect(result[0].isMcpUser).toBe(true);
      expect(result[0].aiLinesChanged).toBe(1000);
    });
  });

  describe('duplicate handling', () => {
    it('should sum numeric fields for duplicate AI code records', () => {
      const ai: AICodeMetrics[] = [
        {
          email: 'test@example.com',
          linkedinUrl: 'https://linkedin.com/in/test',
          aiLinesChanged: 1000,
          totalLinesChanged: 2000,
          pctAiCode: 50,
          commitCount: 10,
        },
        {
          email: 'test@example.com',
          linkedinUrl: 'https://linkedin.com/in/test2',
          aiLinesChanged: 500,
          totalLinesChanged: 1000,
          pctAiCode: 60,
          commitCount: 5,
        },
      ];

      const result = aggregateUserData(ai);
      expect(result).toHaveLength(1);
      expect(result[0].aiLinesChanged).toBe(1500);
      expect(result[0].totalLinesChanged).toBe(3000);
      expect(result[0].commitCount).toBe(15);
      expect(result[0].pctAiCode).toBe(60); // Max
    });

    it('should use OR logic for boolean fields in features', () => {
      const features: PowerUserFeatures[] = [
        {
          email: 'test@example.com',
          isMcpUser: false,
          isRuleCreator: true,
          isRuleUser: false,
          isCommandCreator: false,
          isCommandUser: false,
          numProductsUsed: 2,
          membershipDays: 30,
        },
        {
          email: 'test@example.com',
          isMcpUser: true,
          isRuleCreator: false,
          isRuleUser: true,
          isCommandCreator: false,
          isCommandUser: false,
          numProductsUsed: 3,
          membershipDays: 60,
        },
      ];

      const result = aggregateUserData(undefined, features);
      expect(result).toHaveLength(1);
      expect(result[0].isMcpUser).toBe(true); // OR
      expect(result[0].isRuleCreator).toBe(true); // OR
      expect(result[0].isRuleUser).toBe(true); // OR
      expect(result[0].numProductsUsed).toBe(3); // Max
      expect(result[0].membershipDays).toBe(60); // Max
    });

    it('should use max for numeric fields in agent data', () => {
      const agent: AgentRequests[] = [
        {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          totalRequests: 100,
          totalSessions: 50,
        },
        {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          totalRequests: 150,
          totalSessions: 75,
        },
      ];

      const result = aggregateUserData(undefined, undefined, agent);
      expect(result).toHaveLength(1);
      expect(result[0].totalSessions).toBe(75); // Max
      expect(result[0].totalAgentRequests).toBe(150); // Max
    });
  });

  describe('identity field merging', () => {
    it('should use first non-empty firstName/lastName', () => {
      const agent1: AgentRequests[] = [
        {
          email: 'test@example.com',
          firstName: undefined,
          lastName: undefined,
          totalRequests: 100,
          totalSessions: 50,
        },
      ];

      const agent2: AgentRequests[] = [
        {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          totalRequests: 100,
          totalSessions: 50,
        },
      ];

      const result1 = aggregateUserData(undefined, undefined, agent1);
      const result2 = aggregateUserData(undefined, undefined, agent2);

      expect(result1[0].firstName).toBeUndefined();
      expect(result2[0].firstName).toBe('John');
    });

    it('should use first non-empty linkedinUrl', () => {
      const ai1: AICodeMetrics[] = [
        {
          email: 'test@example.com',
          linkedinUrl: undefined,
          aiLinesChanged: 1000,
          totalLinesChanged: 2000,
          pctAiCode: 50,
          commitCount: 10,
        },
      ];

      const ai2: AICodeMetrics[] = [
        {
          email: 'test@example.com',
          linkedinUrl: 'https://linkedin.com/in/test',
          aiLinesChanged: 1000,
          totalLinesChanged: 2000,
          pctAiCode: 50,
          commitCount: 10,
        },
      ];

      const result1 = aggregateUserData(ai1);
      const result2 = aggregateUserData(ai2);

      expect(result1[0].linkedinUrl).toBeUndefined();
      expect(result2[0].linkedinUrl).toBe('https://linkedin.com/in/test');
    });
  });

  describe('sorting', () => {
    it('should sort by totalSessions descending', () => {
      const agent: AgentRequests[] = [
        {
          email: 'user1@example.com',
          totalRequests: 100,
          totalSessions: 50,
        },
        {
          email: 'user2@example.com',
          totalRequests: 200,
          totalSessions: 100,
        },
        {
          email: 'user3@example.com',
          totalRequests: 150,
          totalSessions: 75,
        },
      ];

      const result = aggregateUserData(undefined, undefined, agent);
      expect(result).toHaveLength(3);
      expect(result[0].email).toBe('user2@example.com');
      expect(result[1].email).toBe('user3@example.com');
      expect(result[2].email).toBe('user1@example.com');
    });

    it('should fallback to aiLinesChanged when totalSessions is equal', () => {
      const ai: AICodeMetrics[] = [
        {
          email: 'user1@example.com',
          aiLinesChanged: 1000,
          totalLinesChanged: 2000,
          pctAiCode: 50,
          commitCount: 10,
        },
        {
          email: 'user2@example.com',
          aiLinesChanged: 2000,
          totalLinesChanged: 3000,
          pctAiCode: 60,
          commitCount: 20,
        },
      ];

      const agent: AgentRequests[] = [
        {
          email: 'user1@example.com',
          totalRequests: 100,
          totalSessions: 50,
        },
        {
          email: 'user2@example.com',
          totalRequests: 100,
          totalSessions: 50,
        },
      ];

      const result = aggregateUserData(ai, undefined, agent);
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user2@example.com'); // Higher aiLinesChanged
      expect(result[1].email).toBe('user1@example.com');
    });
  });

  describe('empty inputs', () => {
    it('should return empty array when all inputs are undefined', () => {
      const result = aggregateUserData();
      expect(result).toEqual([]);
    });

    it('should return empty array when all inputs are empty arrays', () => {
      const result = aggregateUserData([], [], []);
      expect(result).toEqual([]);
    });
  });

  describe('deterministic output', () => {
    it('should produce same results for same inputs', () => {
      const ai: AICodeMetrics[] = [
        {
          email: 'test@example.com',
          linkedinUrl: 'https://linkedin.com/in/test',
          aiLinesChanged: 1000,
          totalLinesChanged: 2000,
          pctAiCode: 50,
          commitCount: 10,
        },
      ];

      const features: PowerUserFeatures[] = [
        {
          email: 'test@example.com',
          isMcpUser: true,
          isRuleCreator: true,
          isRuleUser: false,
          isCommandCreator: false,
          isCommandUser: false,
          numProductsUsed: 3,
          membershipDays: 60,
        },
      ];

      const result1 = aggregateUserData(ai, features);
      const result2 = aggregateUserData(ai, features);

      expect(result1).toEqual(result2);
    });
  });
});

