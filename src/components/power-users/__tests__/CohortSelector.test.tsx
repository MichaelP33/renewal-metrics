import React from 'react';
import { render, screen } from '@testing-library/react';
import { CohortSelector } from '../CohortSelector';
import { PowerUsersProvider } from '@/contexts/PowerUsersContext';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';
import type { FilterState } from '../MasterTableFilters';

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

// Mock PowerUsersContext
jest.mock('@/contexts/PowerUsersContext', () => ({
  usePowerUsers: () => ({
    savedCohorts: [
      {
        id: 'cohort1',
        name: 'Test Cohort 1',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: defaultFilters,
      },
      {
        id: 'cohort2',
        name: 'Test Cohort 2',
        color: '#526070',
        createdAt: new Date().toISOString(),
        filterCriteria: defaultFilters,
      },
    ],
    enhancedUsers: [],
  }),
}));

describe('CohortSelector', () => {
  const defaultProps = {
    value: '',
    onValueChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render placeholder text', () => {
    render(<CohortSelector {...defaultProps} />);
    
    expect(screen.getByText('Select a cohort...')).toBeInTheDocument();
  });

  it('should render custom placeholder', () => {
    render(<CohortSelector {...defaultProps} placeholder="Choose cohort" />);
    
    expect(screen.getByText('Choose cohort')).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<CohortSelector {...defaultProps} />);
    
    expect(screen.getByLabelText('Select cohort for comparison')).toBeInTheDocument();
  });

  it('should show empty state when no cohorts', () => {
    // Override mock to return empty cohorts
    jest.resetModules();
    jest.doMock('@/contexts/PowerUsersContext', () => ({
      usePowerUsers: () => ({
        savedCohorts: [],
        enhancedUsers: [],
      }),
    }));
    
    const { CohortSelector: EmptyCohortSelector } = require('../CohortSelector');
    render(<EmptyCohortSelector {...defaultProps} />);
    
    expect(screen.getByText(/No cohorts saved yet/)).toBeInTheDocument();
  });
});

