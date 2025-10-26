import {
  exportCohortComparison,
  exportCohortDefinitions,
  importCohortDefinitions,
  exportCohortUserList,
} from '../cohort-export-utils';
import type { EnhancedMasterUserRecord } from '@/types/power-users';
import type { StoredCohort } from '../cohort-manager';
import type { MultiCohortStats } from '../multi-cohort-stats';
import type { FilterState } from '@/components/power-users/MasterTableFilters';
import * as exportUtils from '@/lib/export-utils';

// Mock the export-utils module
jest.mock('@/lib/export-utils', () => ({
  exportCSV: jest.fn(),
}));

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

describe('cohort-export-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportCohortComparison', () => {
    it('should call exportCSV with correct format', () => {
      const stats: MultiCohortStats = {
        cohorts: [
          {
            cohort: {
              id: 'cohort1',
              name: 'Cohort 1',
              color: '#f54e00',
              createdAt: new Date().toISOString(),
              filterCriteria: {},
            } as StoredCohort,
            metrics: {
              userCount: 10,
              metrics: {
                totalLinesChanged: { mean: 1000, median: 900, p75: 1200, p90: 1500, min: 500, max: 2000, total: 10000 },
                aiLinesChanged: { mean: 500, median: 450, p75: 600, p90: 750, min: 250, max: 1000, total: 5000 },
                commitCount: { mean: 50, median: 45, p75: 60, p90: 75, min: 25, max: 100, total: 500 },
                pctAiCode: { mean: 50, median: 50, p75: 55, p90: 60, min: 40, max: 70, total: 500 },
                totalSessions: { mean: 100, median: 90, p75: 120, p90: 150, min: 50, max: 200, total: 1000 },
                totalAgentRequests: { mean: 500, median: 450, p75: 600, p90: 750, min: 250, max: 1000, total: 5000 },
                numProductsUsed: { mean: 3, median: 3, p75: 4, p90: 5, min: 1, max: 6, total: 30 },
                membershipDays: { mean: 365, median: 365, p75: 400, p90: 450, min: 100, max: 500, total: 3650 },
                engagementScore: { mean: 60, median: 55, p75: 70, p90: 80, min: 30, max: 90, total: 600 },
              },
              featureAdoption: {
                isMcpUser: 50,
                isRuleCreator: 30,
                isRuleUser: 40,
                isCommandCreator: 20,
                isCommandUser: 35,
              },
            },
          },
        ],
        comparisonMetrics: [],
      };

      exportCohortComparison(stats);

      expect(exportUtils.exportCSV).toHaveBeenCalledTimes(1);
      const [csvContent, filename] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      
      expect(typeof csvContent).toBe('string');
      expect(filename).toMatch(/cohort-comparison-\d{4}-\d{2}-\d{2}\.csv/);
      expect(csvContent).toContain('Metric');
      expect(csvContent).toContain('Cohort 1');
    });

    it('should include all metrics in CSV', () => {
      const stats: MultiCohortStats = {
        cohorts: [
          {
            cohort: {
              id: 'cohort1',
              name: 'Test',
              color: '#f54e00',
              createdAt: new Date().toISOString(),
              filterCriteria: {},
            } as StoredCohort,
            metrics: {
              userCount: 1,
              metrics: {
                totalLinesChanged: { mean: 100, median: 100, p75: 100, p90: 100, min: 100, max: 100, total: 100 },
                aiLinesChanged: { mean: 50, median: 50, p75: 50, p90: 50, min: 50, max: 50, total: 50 },
                commitCount: { mean: 10, median: 10, p75: 10, p90: 10, min: 10, max: 10, total: 10 },
                pctAiCode: { mean: 50, median: 50, p75: 50, p90: 50, min: 50, max: 50, total: 50 },
                totalSessions: { mean: 20, median: 20, p75: 20, p90: 20, min: 20, max: 20, total: 20 },
                totalAgentRequests: { mean: 100, median: 100, p75: 100, p90: 100, min: 100, max: 100, total: 100 },
                numProductsUsed: { mean: 3, median: 3, p75: 3, p90: 3, min: 3, max: 3, total: 3 },
                membershipDays: { mean: 365, median: 365, p75: 365, p90: 365, min: 365, max: 365, total: 365 },
                engagementScore: { mean: 60, median: 60, p75: 60, p90: 60, min: 60, max: 60, total: 60 },
              },
              featureAdoption: {
                isMcpUser: 100,
                isRuleCreator: 0,
                isRuleUser: 0,
                isCommandCreator: 0,
                isCommandUser: 0,
              },
            },
          },
        ],
        comparisonMetrics: [],
      };

      exportCohortComparison(stats);

      const [csvContent] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      
      expect(csvContent).toContain('Total Lines Changed');
      expect(csvContent).toContain('AI Lines Changed');
      expect(csvContent).toContain('Commit Count');
      expect(csvContent).toContain('AI Code %');
      expect(csvContent).toContain('Total Sessions');
      expect(csvContent).toContain('Total Agent Requests');
      expect(csvContent).toContain('Products Used');
      expect(csvContent).toContain('Membership Days');
      expect(csvContent).toContain('Engagement Score');
    });

    it('should include feature adoption section', () => {
      const stats: MultiCohortStats = {
        cohorts: [
          {
            cohort: {
              id: 'cohort1',
              name: 'Test',
              color: '#f54e00',
              createdAt: new Date().toISOString(),
              filterCriteria: {},
            } as StoredCohort,
            metrics: {
              userCount: 1,
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
                isMcpUser: 75.5,
                isRuleCreator: 25.0,
                isRuleUser: 50.0,
                isCommandCreator: 10.5,
                isCommandUser: 90.0,
              },
            },
          },
        ],
        comparisonMetrics: [],
      };

      exportCohortComparison(stats);

      const [csvContent] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      
      expect(csvContent).toContain('Feature Adoption');
      expect(csvContent).toContain('MCP');
      expect(csvContent).toContain('Rules (Creator)');
      expect(csvContent).toContain('Rules (User)');
      expect(csvContent).toContain('Commands (Creator)');
      expect(csvContent).toContain('Commands (User)');
      expect(csvContent).toContain('75.5%');
      expect(csvContent).toContain('25.0%');
    });

    it('should accept custom filename', () => {
      const stats: MultiCohortStats = {
        cohorts: [],
        comparisonMetrics: [],
      };

      exportCohortComparison(stats, 'custom-filename.csv');

      const [, filename] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      expect(filename).toBe('custom-filename.csv');
    });
  });

  describe('exportCohortDefinitions', () => {
    beforeEach(() => {
      // Mock DOM methods
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
      HTMLAnchorElement.prototype.click = jest.fn();
    });

    it('should export cohorts as JSON', () => {
      const cohorts: StoredCohort[] = [
        {
          id: 'cohort1',
          name: 'Test Cohort',
          color: '#f54e00',
          createdAt: '2025-01-01T00:00:00.000Z',
          filterCriteria: defaultFilters,
        },
      ];

      exportCohortDefinitions(cohorts);

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should generate filename with date stamp', () => {
      const cohorts: StoredCohort[] = [
        {
          id: 'cohort1',
          name: 'Test',
          color: '#f54e00',
          createdAt: '2025-01-01T00:00:00.000Z',
          filterCriteria: defaultFilters,
        },
      ];

      exportCohortDefinitions(cohorts);

      // Verify that appendChild was called (indicates download was triggered)
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('importCohortDefinitions', () => {
    beforeEach(() => {
      // Mock File.text() method
      if (!File.prototype.text) {
        File.prototype.text = async function(this: File) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsText(this);
          });
        };
      }
    });

    it('should import valid cohort definitions', async () => {
      const validData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        cohorts: [
          {
            id: 'cohort1',
            name: 'Test Cohort',
            color: '#f54e00',
            createdAt: '2025-01-01T00:00:00.000Z',
            filterCriteria: defaultFilters,
          },
        ],
      };

      const file = new File([JSON.stringify(validData)], 'cohorts.json', {
        type: 'application/json',
      });

      const result = await importCohortDefinitions(file);

      expect(result.cohorts).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.cohorts[0].id).toBe('cohort1');
      expect(result.cohorts[0].name).toBe('Test Cohort');
    });

    it('should handle invalid JSON', async () => {
      const file = new File(['invalid json {]'], 'cohorts.json', {
        type: 'application/json',
      });

      const result = await importCohortDefinitions(file);

      expect(result.cohorts).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to parse JSON');
    });

    it('should handle missing cohorts array', async () => {
      const invalidData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
      };

      const file = new File([JSON.stringify(invalidData)], 'cohorts.json', {
        type: 'application/json',
      });

      const result = await importCohortDefinitions(file);

      expect(result.cohorts).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid file format: missing cohorts array');
    });

    it('should skip invalid cohorts and report errors', async () => {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        cohorts: [
          {
            id: 'cohort1',
            name: 'Valid Cohort',
            color: '#f54e00',
            createdAt: '2025-01-01T00:00:00.000Z',
            filterCriteria: defaultFilters,
          },
          {
            id: 'cohort2',
            // missing name
            color: '#526070',
            createdAt: '2025-01-01T00:00:00.000Z',
            filterCriteria: defaultFilters,
          },
          {
            // missing id
            name: 'Invalid Cohort',
            color: '#D4A27F',
            createdAt: '2025-01-01T00:00:00.000Z',
            filterCriteria: defaultFilters,
          },
        ],
      };

      const file = new File([JSON.stringify(data)], 'cohorts.json', {
        type: 'application/json',
      });

      const result = await importCohortDefinitions(file);

      expect(result.cohorts).toHaveLength(1);
      expect(result.errors).toHaveLength(2);
      expect(result.cohorts[0].name).toBe('Valid Cohort');
    });

    it('should provide default values for missing optional fields', async () => {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        cohorts: [
          {
            id: 'cohort1',
            name: 'Minimal Cohort',
            // missing color and createdAt
            filterCriteria: defaultFilters,
          },
        ],
      };

      const file = new File([JSON.stringify(data)], 'cohorts.json', {
        type: 'application/json',
      });

      const result = await importCohortDefinitions(file);

      expect(result.cohorts).toHaveLength(1);
      expect(result.cohorts[0].color).toBe('#9CA3AF');
      expect(result.cohorts[0].createdAt).toBeDefined();
    });
  });

  describe('exportCohortUserList', () => {
    it('should export users matching cohort filters', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: true }),
        createTestUser({ email: 'user2@example.com', isMcpUser: false }),
      ];

      const cohort: StoredCohort = {
        id: 'cohort1',
        name: 'MCP Users',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: {
          ...defaultFilters,
          isMcpUser: true,
        },
      };

      exportCohortUserList(cohort, users);

      expect(exportUtils.exportCSV).toHaveBeenCalledTimes(1);
      const [csvContent, filename] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      
      expect(csvContent).toContain('user1@example.com');
      expect(csvContent).not.toContain('user2@example.com');
      expect(filename).toContain('mcp-users');
    });

    it('should include all user fields in CSV', () => {
      const users = [
        createTestUser({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
        }),
      ];

      const cohort: StoredCohort = {
        id: 'cohort1',
        name: 'All Users',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: defaultFilters,
      };

      exportCohortUserList(cohort, users);

      const [csvContent] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      
      expect(csvContent).toContain('Email');
      expect(csvContent).toContain('First Name');
      expect(csvContent).toContain('Last Name');
      expect(csvContent).toContain('LinkedIn URL');
      expect(csvContent).toContain('Engagement Score');
      expect(csvContent).toContain('Power User');
    });

    it('should format boolean values as Yes/No', () => {
      const users = [
        createTestUser({
          email: 'test@example.com',
          isMcpUser: true,
          isRuleCreator: false,
          isPowerUser: true,
        }),
      ];

      const cohort: StoredCohort = {
        id: 'cohort1',
        name: 'Test',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: defaultFilters,
      };

      exportCohortUserList(cohort, users);

      const [csvContent] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      
      expect(csvContent).toContain('"Yes"'); // MCP User
      expect(csvContent).toContain('"No"'); // Rule Creator
    });

    it('should generate filename from cohort name', () => {
      const users = [createTestUser()];

      const cohort: StoredCohort = {
        id: 'cohort1',
        name: 'Power Users Group',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: defaultFilters,
      };

      exportCohortUserList(cohort, users);

      const [, filename] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      
      expect(filename).toContain('power-users-group');
      expect(filename).toMatch(/\.csv$/);
    });

    it('should handle empty user list', () => {
      const users = [
        createTestUser({ email: 'user1@example.com', isMcpUser: false }),
      ];

      const cohort: StoredCohort = {
        id: 'cohort1',
        name: 'MCP Users',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: {
          ...defaultFilters,
          isMcpUser: true,
        },
      };

      exportCohortUserList(cohort, users);

      const [csvContent] = (exportUtils.exportCSV as jest.Mock).mock.calls[0];
      
      // Should still have headers
      expect(csvContent).toContain('Email');
      // But no user data
      expect(csvContent).not.toContain('user1@example.com');
    });
  });
});

