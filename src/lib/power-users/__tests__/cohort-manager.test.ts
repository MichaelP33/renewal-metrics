import {
  createCohort,
  saveCohort,
  loadCohorts,
  deleteCohort,
  updateCohort,
  assignCohortColor,
  generateCohortId,
  getCohortById,
  type StoredCohort,
} from '../cohort-manager';
import type { FilterState } from '@/components/power-users/MasterTableFilters';
import { COHORT_COLOR_ARRAY } from '@/types';

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

describe('cohort-manager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('generateCohortId', () => {
    it('should generate a unique ID with correct format', () => {
      const id1 = generateCohortId();
      const id2 = generateCohortId();

      expect(id1).toMatch(/^cohort_\d+_[a-z0-9]{7}$/);
      expect(id2).toMatch(/^cohort_\d+_[a-z0-9]{7}$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with increasing timestamps', () => {
      const id1 = generateCohortId();
      const timestamp1 = parseInt(id1.split('_')[1]);

      // Wait a bit
      const start = Date.now();
      while (Date.now() - start < 2) {
        // Small delay
      }

      const id2 = generateCohortId();
      const timestamp2 = parseInt(id2.split('_')[1]);

      expect(timestamp2).toBeGreaterThanOrEqual(timestamp1);
    });
  });

  describe('assignCohortColor', () => {
    it('should assign colors from COHORT_COLOR_ARRAY', () => {
      const color0 = assignCohortColor(0);
      const color1 = assignCohortColor(1);

      expect(color0).toBe(COHORT_COLOR_ARRAY[0]);
      expect(color1).toBe(COHORT_COLOR_ARRAY[1]);
    });

    it('should cycle through colors when index exceeds array length', () => {
      const arrayLength = COHORT_COLOR_ARRAY.length;
      const colorAtLength = assignCohortColor(arrayLength);
      const colorAt0 = assignCohortColor(0);

      expect(colorAtLength).toBe(colorAt0);
      expect(colorAtLength).toBe(COHORT_COLOR_ARRAY[0]);
    });

    it('should handle large index values', () => {
      const largeIndex = 100;
      const expectedIndex = largeIndex % COHORT_COLOR_ARRAY.length;
      const color = assignCohortColor(largeIndex);

      expect(color).toBe(COHORT_COLOR_ARRAY[expectedIndex]);
    });
  });

  describe('createCohort', () => {
    it('should create a cohort with all required fields', () => {
      const name = 'Test Cohort';
      const filterCriteria: FilterState = {
        searchText: '',
        isMcpUser: true,
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

      const cohort = createCohort(name, filterCriteria);

      expect(cohort.id).toMatch(/^cohort_\d+_[a-z0-9]{7}$/);
      expect(cohort.name).toBe(name);
      expect(cohort.color).toBe(COHORT_COLOR_ARRAY[0]);
      expect(cohort.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO timestamp
      expect(cohort.filterCriteria).toEqual(filterCriteria);
    });

    it('should trim whitespace from cohort name', () => {
      const name = '  Test Cohort  ';
      const filterCriteria: FilterState = {
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

      const cohort = createCohort(name, filterCriteria);

      expect(cohort.name).toBe('Test Cohort');
    });

    it('should assign colors based on existing cohort count', () => {
      const filterCriteria: FilterState = {
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

      const cohort1 = createCohort('Cohort 1', filterCriteria);
      saveCohort(cohort1);

      const cohort2 = createCohort('Cohort 2', filterCriteria);

      expect(cohort1.color).toBe(COHORT_COLOR_ARRAY[0]);
      expect(cohort2.color).toBe(COHORT_COLOR_ARRAY[1]);
    });
  });

  describe('saveCohort', () => {
    it('should save a new cohort to localStorage', () => {
      const cohort: StoredCohort = {
        id: 'test_id',
        name: 'Test Cohort',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      saveCohort(cohort);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'power-users-cohorts/v1',
        expect.any(String)
      );

      const stored = JSON.parse(localStorageMock.getItem('power-users-cohorts/v1') as string);
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual(cohort);
    });

    it('should update an existing cohort', () => {
      const cohort: StoredCohort = {
        id: 'test_id',
        name: 'Test Cohort',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      saveCohort(cohort);

      const updatedCohort = { ...cohort, name: 'Updated Cohort' };
      saveCohort(updatedCohort);

      const stored = JSON.parse(localStorageMock.getItem('power-users-cohorts/v1') as string);
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Updated Cohort');
    });

    it('should preserve other cohorts when updating one', () => {
      const cohort1: StoredCohort = {
        id: 'test_id_1',
        name: 'Cohort 1',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      const cohort2: StoredCohort = {
        id: 'test_id_2',
        name: 'Cohort 2',
        color: '#526070',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      saveCohort(cohort1);
      saveCohort(cohort2);

      const updatedCohort1 = { ...cohort1, name: 'Updated Cohort 1' };
      saveCohort(updatedCohort1);

      const stored = JSON.parse(localStorageMock.getItem('power-users-cohorts/v1') as string);
      expect(stored).toHaveLength(2);
      expect(stored[0].name).toBe('Updated Cohort 1');
      expect(stored[1].name).toBe('Cohort 2');
    });
  });

  describe('loadCohorts', () => {
    it('should load cohorts from localStorage', () => {
      const cohorts: StoredCohort[] = [
        {
          id: 'test_id_1',
          name: 'Cohort 1',
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
            engagementScoreMin: '',
            engagementScoreMax: '',
            isPowerUserFilter: [],
          },
        },
      ];

      localStorageMock.setItem('power-users-cohorts/v1', JSON.stringify(cohorts));

      const loaded = loadCohorts();

      expect(loaded).toEqual(cohorts);
    });

    it('should return empty array when no cohorts exist', () => {
      const loaded = loadCohorts();

      expect(loaded).toEqual([]);
    });

    it('should handle malformed JSON gracefully', () => {
      localStorageMock.setItem('power-users-cohorts/v1', 'invalid json {]');

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const loaded = loadCohorts();

      expect(loaded).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load cohorts:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('should handle non-array data gracefully', () => {
      localStorageMock.setItem('power-users-cohorts/v1', JSON.stringify({ not: 'array' }));

      const loaded = loadCohorts();

      expect(loaded).toEqual([]);
    });
  });

  describe('deleteCohort', () => {
    it('should delete a cohort by ID', () => {
      const cohort1: StoredCohort = {
        id: 'test_id_1',
        name: 'Cohort 1',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      const cohort2: StoredCohort = {
        id: 'test_id_2',
        name: 'Cohort 2',
        color: '#526070',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      saveCohort(cohort1);
      saveCohort(cohort2);

      deleteCohort('test_id_1');

      const stored = loadCohorts();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('test_id_2');
    });

    it('should handle deleting non-existent cohort', () => {
      const cohort: StoredCohort = {
        id: 'test_id',
        name: 'Cohort',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      saveCohort(cohort);

      deleteCohort('non_existent_id');

      const stored = loadCohorts();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('test_id');
    });
  });

  describe('updateCohort', () => {
    it('should update cohort properties', () => {
      const cohort: StoredCohort = {
        id: 'test_id',
        name: 'Original Name',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      saveCohort(cohort);

      updateCohort('test_id', { name: 'Updated Name' });

      const stored = loadCohorts();
      expect(stored[0].name).toBe('Updated Name');
      expect(stored[0].id).toBe('test_id');
      expect(stored[0].color).toBe('#f54e00');
    });

    it('should handle updating non-existent cohort', () => {
      updateCohort('non_existent_id', { name: 'Updated Name' });

      const stored = loadCohorts();
      expect(stored).toHaveLength(0);
    });

    it('should update multiple properties at once', () => {
      const cohort: StoredCohort = {
        id: 'test_id',
        name: 'Original Name',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      saveCohort(cohort);

      updateCohort('test_id', { name: 'Updated Name', color: '#526070' });

      const stored = loadCohorts();
      expect(stored[0].name).toBe('Updated Name');
      expect(stored[0].color).toBe('#526070');
    });
  });

  describe('getCohortById', () => {
    it('should return cohort by ID', () => {
      const cohort: StoredCohort = {
        id: 'test_id',
        name: 'Test Cohort',
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
          engagementScoreMin: '',
          engagementScoreMax: '',
          isPowerUserFilter: [],
        },
      };

      saveCohort(cohort);

      const found = getCohortById('test_id');

      expect(found).toEqual(cohort);
    });

    it('should return undefined for non-existent ID', () => {
      const found = getCohortById('non_existent_id');

      expect(found).toBeUndefined();
    });
  });
});

