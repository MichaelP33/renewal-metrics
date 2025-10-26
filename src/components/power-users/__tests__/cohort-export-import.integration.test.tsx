import { exportCohortDefinitions, importCohortDefinitions } from '@/lib/power-users/cohort-export-utils';
import { createCohort, saveCohort, loadCohorts, deleteCohort } from '@/lib/power-users/cohort-manager';
import type { FilterState } from '../MasterTableFilters';

// Mock DOM methods for export
beforeAll(() => {
  document.body.appendChild = jest.fn();
  document.body.removeChild = jest.fn();
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = jest.fn();
  HTMLAnchorElement.prototype.click = jest.fn();

  // Mock File.text() for imports
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

describe('Cohort Export/Import Integration', () => {
  it('should export and import cohorts successfully', async () => {
    // Create cohorts
    const cohort1 = createCohort('Test Cohort 1', {
      ...defaultFilters,
      isMcpUser: true,
    });

    const cohort2 = createCohort('Test Cohort 2', {
      ...defaultFilters,
      engagementScoreMin: '70',
    });

    // Export data
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cohorts: [cohort1, cohort2],
    };

    const file = new File([JSON.stringify(exportData)], 'cohorts.json', {
      type: 'application/json',
    });

    // Import the data
    const result = await importCohortDefinitions(file);

    // Verify import success
    expect(result.cohorts).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.cohorts[0].name).toBe('Test Cohort 1');
    expect(result.cohorts[1].name).toBe('Test Cohort 2');
  });

  it('should validate imported data', async () => {
    const invalidData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cohorts: [
        {
          id: 'valid',
          name: 'Valid Cohort',
          color: '#f54e00',
          createdAt: new Date().toISOString(),
          filterCriteria: defaultFilters,
        },
        {
          // Missing id - invalid
          name: 'Invalid Cohort',
          color: '#526070',
          createdAt: new Date().toISOString(),
          filterCriteria: defaultFilters,
        },
      ],
    };

    const file = new File([JSON.stringify(invalidData)], 'cohorts.json', {
      type: 'application/json',
    });

    const result = await importCohortDefinitions(file);

    // Should import only valid cohort
    expect(result.cohorts).toHaveLength(1);
    expect(result.cohorts[0].id).toBe('valid');
    expect(result.errors).toHaveLength(1);
  });
});

