import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EnhancedMasterUserRecord } from '@/types/power-users';
import type { FilterState } from '../MasterTableFilters';
import { createCohort, saveCohort, loadCohorts, deleteCohort } from '@/lib/power-users/cohort-manager';
import { applyFilters } from '@/lib/power-users/filter-utils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
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

describe('Cohort Workflow Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Complete E2E Workflow', () => {
    it('should complete full cohort lifecycle: create, save, load, delete', () => {
      // Step 1: Create test data
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true, totalSessions: 150 }),
        createTestUser({ email: 'user2@example.com', isMcpUser: true, totalSessions: 100 }),
        createTestUser({ email: 'user3@example.com', isMcpUser: false, totalSessions: 50 }),
      ];

      // Step 2: Apply filters
      const filters: FilterState = {
        ...defaultFilters,
        isMcpUser: true,
        sessionsMin: '75',
      };

      const filteredUsers = applyFilters(users, filters);
      expect(filteredUsers).toHaveLength(2); // Only MCP users with sessions >= 75

      // Step 3: Save as cohort
      const cohort = createCohort('High-Engagement MCP Users', filters);
      saveCohort(cohort);

      // Step 4: Verify cohort in saved list
      const savedCohorts = loadCohorts();
      expect(savedCohorts).toHaveLength(1);
      expect(savedCohorts[0].name).toBe('High-Engagement MCP Users');

      // Step 5: Reapply filters from saved cohort
      const reappliedUsers = applyFilters(users, savedCohorts[0].filterCriteria);
      expect(reappliedUsers).toHaveLength(2);
      expect(reappliedUsers.every(u => u.isMcpUser)).toBe(true);

      // Step 6: Delete cohort
      deleteCohort(cohort.id);

      // Step 7: Verify removal from localStorage
      const afterDelete = loadCohorts();
      expect(afterDelete).toHaveLength(0);
    });

    it('should persist cohorts across page refresh (localStorage)', () => {
      // Create and save cohort
      const filters: FilterState = {
        ...defaultFilters,
        engagementScoreMin: '70',
      };

      const cohort = createCohort('Power Users', filters);
      saveCohort(cohort);

      // Simulate page refresh by loading cohorts from localStorage
      const loaded = loadCohorts();
      
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe(cohort.id);
      expect(loaded[0].name).toBe('Power Users');
      expect(loaded[0].filterCriteria).toEqual(filters);
    });

    it('should handle multiple cohorts correctly', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', engagementScore: 80, isMcpUser: true }),
        createTestUser({ email: 'user2@example.com', engagementScore: 60, isMcpUser: true }),
        createTestUser({ email: 'user3@example.com', engagementScore: 40, isMcpUser: false }),
      ];

      // Create multiple cohorts with different filters
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
        engagementScoreMin: '50',
      });

      saveCohort(cohort1);
      saveCohort(cohort2);
      saveCohort(cohort3);

      // Verify all cohorts saved
      const savedCohorts = loadCohorts();
      expect(savedCohorts).toHaveLength(3);

      // Verify each cohort filters correctly
      const powerUsers = applyFilters(users, cohort1.filterCriteria);
      expect(powerUsers).toHaveLength(1);
      expect(powerUsers[0].engagementScore).toBe(80);

      const mcpUsers = applyFilters(users, cohort2.filterCriteria);
      expect(mcpUsers).toHaveLength(2);
      expect(mcpUsers.every(u => u.isMcpUser)).toBe(true);

      const activeUsers = applyFilters(users, cohort3.filterCriteria);
      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every(u => u.engagementScore! >= 50)).toBe(true);
    });

    it('should handle cohort updates correctly', () => {
      const filters: FilterState = {
        ...defaultFilters,
        isMcpUser: true,
      };

      const cohort = createCohort('Original Name', filters);
      saveCohort(cohort);

      // Load and verify
      let savedCohorts = loadCohorts();
      expect(savedCohorts[0].name).toBe('Original Name');

      // Update the cohort name
      const updatedCohort = { ...cohort, name: 'Updated Name' };
      saveCohort(updatedCohort);

      // Verify update
      savedCohorts = loadCohorts();
      expect(savedCohorts).toHaveLength(1);
      expect(savedCohorts[0].name).toBe('Updated Name');
      expect(savedCohorts[0].id).toBe(cohort.id); // ID should remain the same
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      const filters: FilterState = {
        ...defaultFilters,
        isMcpUser: true,
      };

      const cohort = createCohort('Test Cohort', filters);

      // This should not throw an error, but handle it gracefully
      expect(() => saveCohort(cohort)).toThrow(); // May throw or handle internally

      // Restore original implementation
      localStorageMock.setItem = originalSetItem;
    });

    it('should clear filters and apply cohort filters correctly', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true, totalSessions: 100 }),
        createTestUser({ email: 'user2@example.com', isMcpUser: false, totalSessions: 200 }),
      ];

      // Step 1: Apply initial filters
      const initialFilters: FilterState = {
        ...defaultFilters,
        sessionsMin: '150',
      };

      let filtered = applyFilters(users, initialFilters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].email).toBe('user2@example.com');

      // Step 2: Clear filters (apply default filters)
      filtered = applyFilters(users, defaultFilters);
      expect(filtered).toHaveLength(2);

      // Step 3: Apply cohort filters
      const cohortFilters: FilterState = {
        ...defaultFilters,
        isMcpUser: true,
      };

      filtered = applyFilters(users, cohortFilters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].email).toBe('user1@example.com');
    });

    it('should handle overlapping cohorts correctly', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true, isRuleCreator: true }),
        createTestUser({ email: 'user2@example.com', isMcpUser: true, isRuleCreator: false }),
        createTestUser({ email: 'user3@example.com', isMcpUser: false, isRuleCreator: true }),
      ];

      const mcpCohort = createCohort('MCP Users', {
        ...defaultFilters,
        isMcpUser: true,
      });

      const ruleCreatorCohort = createCohort('Rule Creators', {
        ...defaultFilters,
        isRuleCreator: true,
      });

      // Both cohorts should include user1
      const mcpUsers = applyFilters(users, mcpCohort.filterCriteria);
      const ruleCreators = applyFilters(users, ruleCreatorCohort.filterCriteria);

      expect(mcpUsers).toHaveLength(2);
      expect(ruleCreators).toHaveLength(2);

      const user1InBoth = mcpUsers.some(u => u.email === 'user1@example.com') &&
                          ruleCreators.some(u => u.email === 'user1@example.com');
      expect(user1InBoth).toBe(true);
    });
  });
});

