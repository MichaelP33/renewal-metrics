import { getUsersForCohort, getUsersForCohorts } from '../cohort-filtering';
import type { EnhancedMasterUserRecord, Cohort } from '@/types/power-users';
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

describe('cohort-filtering', () => {
  describe('getUsersForCohort', () => {
    it('should filter users based on cohort filter criteria', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true, totalSessions: 100 }),
        createTestUser({ email: 'user2@example.com', isMcpUser: false, totalSessions: 50 }),
        createTestUser({ email: 'user3@example.com', isMcpUser: true, totalSessions: 200 }),
      ];

      const cohort = createTestCohort('cohort1', 'MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const result = getUsersForCohort(users, cohort);

      expect(result).toHaveLength(2);
      expect(result.every(u => u.isMcpUser === true)).toBe(true);
    });

    it('should handle StoredCohort type', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', totalSessions: 100 }),
        createTestUser({ email: 'user2@example.com', totalSessions: 50 }),
        createTestUser({ email: 'user3@example.com', totalSessions: 200 }),
      ];

      const cohort: StoredCohort = {
        id: 'cohort1',
        name: 'High Sessions',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: {
          ...defaultFilters,
          sessionsMin: '75',
        },
      };

      const result = getUsersForCohort(users, cohort);

      expect(result).toHaveLength(2);
      expect(result.every(u => (u.totalSessions ?? 0) >= 75)).toBe(true);
    });

    it('should handle Cohort type (with Record<string, unknown> filterCriteria)', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', engagementScore: 80 }),
        createTestUser({ email: 'user2@example.com', engagementScore: 50 }),
        createTestUser({ email: 'user3@example.com', engagementScore: 30 }),
      ];

      const cohort: Cohort = {
        id: 'cohort1',
        name: 'Power Users',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: {
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
          engagementScoreMin: '70',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        } as unknown as Record<string, unknown>,
      };

      const result = getUsersForCohort(users, cohort);

      expect(result).toHaveLength(1);
      expect(result[0].engagementScore).toBe(80);
    });

    it('should return empty array when no users match', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: false }),
        createTestUser({ email: 'user2@example.com', isMcpUser: false }),
      ];

      const cohort = createTestCohort('cohort1', 'MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const result = getUsersForCohort(users, cohort);

      expect(result).toHaveLength(0);
    });

    it('should handle multiple filter criteria', () => {
      const users = [
        createTestUser({
          email: 'user1@example.com',
          isMcpUser: true,
          totalSessions: 100,
          engagementScore: 70,
        }),
        createTestUser({
          email: 'user2@example.com',
          isMcpUser: true,
          totalSessions: 50,
          engagementScore: 80,
        }),
        createTestUser({
          email: 'user3@example.com',
          isMcpUser: false,
          totalSessions: 100,
          engagementScore: 70,
        }),
      ];

      const cohort = createTestCohort('cohort1', 'High Engagement MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
        sessionsMin: '75',
        engagementScoreMin: '65',
      });

      const result = getUsersForCohort(users, cohort);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('user1@example.com');
    });

    it('should return all users when no filters are active', () => {
      const users = [
        createTestUser({ email: 'user1@example.com' }),
        createTestUser({ email: 'user2@example.com' }),
        createTestUser({ email: 'user3@example.com' }),
      ];

      const cohort = createTestCohort('cohort1', 'All Users', defaultFilters);

      const result = getUsersForCohort(users, cohort);

      expect(result).toHaveLength(3);
    });

    it('should handle empty user array', () => {
      const users: EnhancedMasterUserRecord[] = [];

      const cohort = createTestCohort('cohort1', 'Test Cohort', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const result = getUsersForCohort(users, cohort);

      expect(result).toHaveLength(0);
    });
  });

  describe('getUsersForCohorts', () => {
    it('should filter users for multiple cohorts', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true, totalSessions: 100 }),
        createTestUser({ email: 'user2@example.com', isMcpUser: false, totalSessions: 200 }),
        createTestUser({ email: 'user3@example.com', isMcpUser: true, totalSessions: 50 }),
      ];

      const cohort1 = createTestCohort('cohort1', 'MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const cohort2 = createTestCohort('cohort2', 'High Sessions', {
        ...defaultFilters,
        sessionsMin: '150',
      });

      const result = getUsersForCohorts(users, [cohort1, cohort2]);

      expect(result.size).toBe(2);
      expect(result.get('cohort1')).toHaveLength(2);
      expect(result.get('cohort2')).toHaveLength(1);
      expect(result.get('cohort2')?.[0].email).toBe('user2@example.com');
    });

    it('should return map with cohort IDs as keys', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true }),
      ];

      const cohort1 = createTestCohort('test_id_1', 'Cohort 1', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const cohort2 = createTestCohort('test_id_2', 'Cohort 2', {
        ...defaultFilters,
        isMcpUser: false,
      });

      const result = getUsersForCohorts(users, [cohort1, cohort2]);

      expect(result.has('test_id_1')).toBe(true);
      expect(result.has('test_id_2')).toBe(true);
    });

    it('should handle overlapping cohorts', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true, isRuleCreator: true }),
        createTestUser({ email: 'user2@example.com', isMcpUser: true, isRuleCreator: false }),
        createTestUser({ email: 'user3@example.com', isMcpUser: false, isRuleCreator: true }),
      ];

      const cohort1 = createTestCohort('cohort1', 'MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const cohort2 = createTestCohort('cohort2', 'Rule Creators', {
        ...defaultFilters,
        isRuleCreator: true,
      });

      const result = getUsersForCohorts(users, [cohort1, cohort2]);

      expect(result.get('cohort1')).toHaveLength(2);
      expect(result.get('cohort2')).toHaveLength(2);
      
      // Verify that user1 appears in both cohorts
      const cohort1Users = result.get('cohort1') || [];
      const cohort2Users = result.get('cohort2') || [];
      expect(cohort1Users.some(u => u.email === 'user1@example.com')).toBe(true);
      expect(cohort2Users.some(u => u.email === 'user1@example.com')).toBe(true);
    });

    it('should handle empty cohorts array', () => {
      const users = [
        createTestUser({ email: 'user1@example.com' }),
      ];

      const result = getUsersForCohorts(users, []);

      expect(result.size).toBe(0);
    });

    it('should handle cohorts with no matching users', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: false }),
      ];

      const cohort1 = createTestCohort('cohort1', 'MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const cohort2 = createTestCohort('cohort2', 'High Sessions', {
        ...defaultFilters,
        sessionsMin: '500',
      });

      const result = getUsersForCohorts(users, [cohort1, cohort2]);

      expect(result.size).toBe(2);
      expect(result.get('cohort1')).toHaveLength(0);
      expect(result.get('cohort2')).toHaveLength(0);
    });

    it('should handle maximum cohorts (6)', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', engagementScore: 10 }),
        createTestUser({ email: 'user2@example.com', engagementScore: 30 }),
        createTestUser({ email: 'user3@example.com', engagementScore: 50 }),
        createTestUser({ email: 'user4@example.com', engagementScore: 70 }),
        createTestUser({ email: 'user5@example.com', engagementScore: 90 }),
      ];

      const cohorts = [
        createTestCohort('c1', 'Segment 1', { ...defaultFilters, engagementScoreMin: '0', engagementScoreMax: '20' }),
        createTestCohort('c2', 'Segment 2', { ...defaultFilters, engagementScoreMin: '21', engagementScoreMax: '40' }),
        createTestCohort('c3', 'Segment 3', { ...defaultFilters, engagementScoreMin: '41', engagementScoreMax: '60' }),
        createTestCohort('c4', 'Segment 4', { ...defaultFilters, engagementScoreMin: '61', engagementScoreMax: '80' }),
        createTestCohort('c5', 'Segment 5', { ...defaultFilters, engagementScoreMin: '81', engagementScoreMax: '100' }),
        createTestCohort('c6', 'All Users', defaultFilters),
      ];

      const result = getUsersForCohorts(users, cohorts);

      expect(result.size).toBe(6);
      expect(result.get('c1')).toHaveLength(1);
      expect(result.get('c2')).toHaveLength(1);
      expect(result.get('c3')).toHaveLength(1);
      expect(result.get('c4')).toHaveLength(1);
      expect(result.get('c5')).toHaveLength(1);
      expect(result.get('c6')).toHaveLength(5);
    });

    it('should work with mix of Cohort and StoredCohort types', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true }),
        createTestUser({ email: 'user2@example.com', isMcpUser: false }),
      ];

      const storedCohort: StoredCohort = {
        id: 'stored_cohort',
        name: 'Stored Cohort',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: {
          ...defaultFilters,
          isMcpUser: true,
        },
      };

      const regularCohort: Cohort = {
        id: 'regular_cohort',
        name: 'Regular Cohort',
        color: '#526070',
        createdAt: new Date().toISOString(),
        filterCriteria: {
          ...defaultFilters,
          isMcpUser: false,
        } as unknown as Record<string, unknown>,
      };

      const result = getUsersForCohorts(users, [storedCohort, regularCohort]);

      expect(result.size).toBe(2);
      expect(result.get('stored_cohort')).toHaveLength(1);
      expect(result.get('regular_cohort')).toHaveLength(1);
    });
  });
});

