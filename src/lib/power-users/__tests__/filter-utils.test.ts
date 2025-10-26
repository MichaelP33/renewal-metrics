import { applyFilters, getFilterSummary } from '../filter-utils';
import type { FilterState } from '@/components/power-users/MasterTableFilters';
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

describe('filter-utils', () => {
  describe('applyFilters', () => {
    describe('search text filter', () => {
      it('should filter by email', () => {
        const users = [
          createTestUser({ email: 'john@example.com', firstName: 'Alice' }),
          createTestUser({ email: 'jane@example.com', firstName: 'Bob' }),
          createTestUser({ email: 'bob@example.com', firstName: 'Charlie' }),
        ];

        const filters: FilterState = { ...defaultFilters, searchText: 'john' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].email).toBe('john@example.com');
      });

      it('should filter by first name', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', firstName: 'Alice' }),
          createTestUser({ email: 'user2@example.com', firstName: 'Bob' }),
          createTestUser({ email: 'user3@example.com', firstName: 'Charlie' }),
        ];

        const filters: FilterState = { ...defaultFilters, searchText: 'bob' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].firstName).toBe('Bob');
      });

      it('should filter by last name', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', lastName: 'Smith' }),
          createTestUser({ email: 'user2@example.com', lastName: 'Jones' }),
          createTestUser({ email: 'user3@example.com', lastName: 'Brown' }),
        ];

        const filters: FilterState = { ...defaultFilters, searchText: 'jones' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].lastName).toBe('Jones');
      });

      it('should be case insensitive', () => {
        const users = [
          createTestUser({ email: 'JOHN@EXAMPLE.COM', firstName: 'JOHN' }),
        ];

        const filters: FilterState = { ...defaultFilters, searchText: 'john' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
      });
    });

    describe('boolean feature filters', () => {
      it('should filter by isMcpUser', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isMcpUser: true }),
          createTestUser({ email: 'user2@example.com', isMcpUser: false }),
          createTestUser({ email: 'user3@example.com', isMcpUser: true }),
        ];

        const filters: FilterState = { ...defaultFilters, isMcpUser: true };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(2);
        expect(result.every(u => u.isMcpUser === true)).toBe(true);
      });

      it('should filter by isRuleCreator', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isRuleCreator: true }),
          createTestUser({ email: 'user2@example.com', isRuleCreator: false }),
        ];

        const filters: FilterState = { ...defaultFilters, isRuleCreator: true };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].isRuleCreator).toBe(true);
      });

      it('should filter by multiple boolean features with AND logic', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isMcpUser: true, isRuleCreator: true }),
          createTestUser({ email: 'user2@example.com', isMcpUser: true, isRuleCreator: false }),
          createTestUser({ email: 'user3@example.com', isMcpUser: false, isRuleCreator: true }),
        ];

        const filters: FilterState = {
          ...defaultFilters,
          isMcpUser: true,
          isRuleCreator: true,
        };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].email).toBe('user1@example.com');
      });

      it('should not filter when feature is null', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isMcpUser: true }),
          createTestUser({ email: 'user2@example.com', isMcpUser: false }),
        ];

        const filters: FilterState = { ...defaultFilters, isMcpUser: null };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(2);
      });
    });

    describe('power user filter', () => {
      it('should filter by isPowerUser true', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isPowerUser: true }),
          createTestUser({ email: 'user2@example.com', isPowerUser: false }),
          createTestUser({ email: 'user3@example.com', isPowerUser: undefined }),
        ];

        const filters: FilterState = { ...defaultFilters, isPowerUserFilter: ['true'] };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].isPowerUser).toBe(true);
      });

      it('should filter by isPowerUser false', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isPowerUser: true }),
          createTestUser({ email: 'user2@example.com', isPowerUser: false }),
          createTestUser({ email: 'user3@example.com', isPowerUser: undefined }),
        ];

        const filters: FilterState = { ...defaultFilters, isPowerUserFilter: ['false'] };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].isPowerUser).toBe(false);
      });

      it('should filter by unmarked status', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isPowerUser: true }),
          createTestUser({ email: 'user2@example.com', isPowerUser: false }),
          createTestUser({ email: 'user3@example.com', isPowerUser: undefined }),
        ];

        const filters: FilterState = { ...defaultFilters, isPowerUserFilter: ['unmarked'] };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].isPowerUser).toBeUndefined();
      });

      it('should support multiple power user states', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isPowerUser: true }),
          createTestUser({ email: 'user2@example.com', isPowerUser: false }),
          createTestUser({ email: 'user3@example.com', isPowerUser: undefined }),
        ];

        const filters: FilterState = { ...defaultFilters, isPowerUserFilter: ['true', 'unmarked'] };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(2);
      });
    });

    describe('numeric range filters', () => {
      it('should filter by aiLinesMin', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', aiLinesChanged: 100 }),
          createTestUser({ email: 'user2@example.com', aiLinesChanged: 500 }),
          createTestUser({ email: 'user3@example.com', aiLinesChanged: 1000 }),
        ];

        const filters: FilterState = { ...defaultFilters, aiLinesMin: '500' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(2);
        expect(result.every(u => (u.aiLinesChanged ?? 0) >= 500)).toBe(true);
      });

      it('should filter by aiLinesMax', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', aiLinesChanged: 100 }),
          createTestUser({ email: 'user2@example.com', aiLinesChanged: 500 }),
          createTestUser({ email: 'user3@example.com', aiLinesChanged: 1000 }),
        ];

        const filters: FilterState = { ...defaultFilters, aiLinesMax: '500' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(2);
        expect(result.every(u => (u.aiLinesChanged ?? 0) <= 500)).toBe(true);
      });

      it('should filter by aiLines range (min and max)', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', aiLinesChanged: 100 }),
          createTestUser({ email: 'user2@example.com', aiLinesChanged: 500 }),
          createTestUser({ email: 'user3@example.com', aiLinesChanged: 1000 }),
        ];

        const filters: FilterState = { ...defaultFilters, aiLinesMin: '200', aiLinesMax: '800' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].aiLinesChanged).toBe(500);
      });

      it('should filter by sessionsMin and sessionsMax', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', totalSessions: 50 }),
          createTestUser({ email: 'user2@example.com', totalSessions: 100 }),
          createTestUser({ email: 'user3@example.com', totalSessions: 200 }),
        ];

        const filters: FilterState = { ...defaultFilters, sessionsMin: '75', sessionsMax: '150' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].totalSessions).toBe(100);
      });

      it('should filter by requestsMin and requestsMax', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', totalAgentRequests: 100 }),
          createTestUser({ email: 'user2@example.com', totalAgentRequests: 500 }),
          createTestUser({ email: 'user3@example.com', totalAgentRequests: 1000 }),
        ];

        const filters: FilterState = { ...defaultFilters, requestsMin: '200', requestsMax: '800' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].totalAgentRequests).toBe(500);
      });

      it('should handle undefined numeric values', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', aiLinesChanged: undefined }),
          createTestUser({ email: 'user2@example.com', aiLinesChanged: 500 }),
        ];

        const filters: FilterState = { ...defaultFilters, aiLinesMin: '100' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].email).toBe('user2@example.com');
      });
    });

    describe('engagement score filter', () => {
      it('should filter by engagementScoreMin', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', engagementScore: 30 }),
          createTestUser({ email: 'user2@example.com', engagementScore: 50 }),
          createTestUser({ email: 'user3@example.com', engagementScore: 80 }),
        ];

        const filters: FilterState = { ...defaultFilters, engagementScoreMin: '50' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(2);
        expect(result.every(u => (u.engagementScore ?? 0) >= 50)).toBe(true);
      });

      it('should filter by engagementScoreMax', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', engagementScore: 30 }),
          createTestUser({ email: 'user2@example.com', engagementScore: 50 }),
          createTestUser({ email: 'user3@example.com', engagementScore: 80 }),
        ];

        const filters: FilterState = { ...defaultFilters, engagementScoreMax: '60' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(2);
        expect(result.every(u => (u.engagementScore ?? 0) <= 60)).toBe(true);
      });

      it('should filter by engagement score range', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', engagementScore: 30 }),
          createTestUser({ email: 'user2@example.com', engagementScore: 50 }),
          createTestUser({ email: 'user3@example.com', engagementScore: 80 }),
        ];

        const filters: FilterState = { ...defaultFilters, engagementScoreMin: '40', engagementScoreMax: '70' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].engagementScore).toBe(50);
      });

      it('should exclude users with undefined engagement score when min is set', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', engagementScore: undefined }),
          createTestUser({ email: 'user2@example.com', engagementScore: 50 }),
        ];

        const filters: FilterState = { ...defaultFilters, engagementScoreMin: '40' };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].email).toBe('user2@example.com');
      });
    });

    describe('combined filters', () => {
      it('should apply multiple filters with AND logic', () => {
        const users = [
          createTestUser({
            email: 'user1@example.com',
            isMcpUser: true,
            totalSessions: 100,
            engagementScore: 60,
          }),
          createTestUser({
            email: 'user2@example.com',
            isMcpUser: true,
            totalSessions: 50,
            engagementScore: 70,
          }),
          createTestUser({
            email: 'user3@example.com',
            isMcpUser: false,
            totalSessions: 100,
            engagementScore: 60,
          }),
        ];

        const filters: FilterState = {
          ...defaultFilters,
          isMcpUser: true,
          sessionsMin: '75',
          engagementScoreMin: '55',
        };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(1);
        expect(result[0].email).toBe('user1@example.com');
      });

      it('should return empty array when no users match all filters', () => {
        const users = [
          createTestUser({ email: 'user1@example.com', isMcpUser: true, totalSessions: 50 }),
          createTestUser({ email: 'user2@example.com', isMcpUser: false, totalSessions: 100 }),
        ];

        const filters: FilterState = {
          ...defaultFilters,
          isMcpUser: true,
          sessionsMin: '75',
        };
        const result = applyFilters(users, filters);

        expect(result).toHaveLength(0);
      });

      it('should return all users when no filters are active', () => {
        const users = [
          createTestUser({ email: 'user1@example.com' }),
          createTestUser({ email: 'user2@example.com' }),
          createTestUser({ email: 'user3@example.com' }),
        ];

        const result = applyFilters(users, defaultFilters);

        expect(result).toHaveLength(3);
      });
    });
  });

  describe('getFilterSummary', () => {
    it('should return empty array for no active filters', () => {
      const filters: FilterState = {
        ...defaultFilters,
        isPowerUserFilter: ['true', 'false', 'unmarked'], // All 3 selected = no filter
      };
      const summary = getFilterSummary(filters);

      expect(summary).toEqual([]);
    });

    it('should summarize search text filter', () => {
      const filters: FilterState = { ...defaultFilters, searchText: 'john' };
      const summary = getFilterSummary(filters);

      expect(summary).toContain('Search: "john"');
    });

    it('should summarize boolean feature filters', () => {
      const filters: FilterState = {
        ...defaultFilters,
        isMcpUser: true,
        isRuleCreator: false,
      };
      const summary = getFilterSummary(filters);

      expect(summary).toContain('MCP User: Yes');
      expect(summary).toContain('Rule Creator: No');
    });

    it('should summarize numeric range filters', () => {
      const filters: FilterState = {
        ...defaultFilters,
        aiLinesMin: '100',
        aiLinesMax: '500',
      };
      const summary = getFilterSummary(filters);

      expect(summary).toContain('AI Lines: 100-500');
    });

    it('should handle min-only range filter', () => {
      const filters: FilterState = {
        ...defaultFilters,
        sessionsMin: '50',
      };
      const summary = getFilterSummary(filters);

      expect(summary).toContain('Sessions: 50-∞');
    });

    it('should handle max-only range filter', () => {
      const filters: FilterState = {
        ...defaultFilters,
        requestsMax: '1000',
      };
      const summary = getFilterSummary(filters);

      expect(summary).toContain('Requests: 0-1000');
    });

    it('should summarize engagement score range', () => {
      const filters: FilterState = {
        ...defaultFilters,
        engagementScoreMin: '40',
        engagementScoreMax: '70',
      };
      const summary = getFilterSummary(filters);

      expect(summary).toContain('Engagement: 40-70');
    });

    it('should summarize power user filter with partial selection', () => {
      const filters: FilterState = {
        ...defaultFilters,
        isPowerUserFilter: ['true'],
      };
      const summary = getFilterSummary(filters);

      expect(summary).toContain('Status: Power');
    });

    it('should summarize multiple power user states', () => {
      const filters: FilterState = {
        ...defaultFilters,
        isPowerUserFilter: ['true', 'unmarked'],
      };
      const summary = getFilterSummary(filters);

      expect(summary).toContain('Status: Power, Unmarked');
    });

    it('should not include power user filter when all 3 states selected', () => {
      const filters: FilterState = {
        ...defaultFilters,
        isPowerUserFilter: ['true', 'false', 'unmarked'],
      };
      const summary = getFilterSummary(filters);

      expect(summary.some(s => s.startsWith('Status:'))).toBe(false);
    });

    it('should summarize multiple active filters', () => {
      const filters: FilterState = {
        ...defaultFilters,
        searchText: 'test',
        isMcpUser: true,
        sessionsMin: '50',
        sessionsMax: '100',
        engagementScoreMin: '60',
        isPowerUserFilter: ['true', 'false', 'unmarked'], // All 3 selected = no filter
      };
      const summary = getFilterSummary(filters);

      expect(summary).toHaveLength(4);
      expect(summary).toContain('Search: "test"');
      expect(summary).toContain('MCP User: Yes');
      expect(summary).toContain('Sessions: 50-100');
      expect(summary).toContain('Engagement: 60-100');
    });
  });
});

