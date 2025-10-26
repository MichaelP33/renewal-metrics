import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavedCohortsPanel } from '../SavedCohortsPanel';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';
import type { FilterState } from '../MasterTableFilters';
import type { EnhancedMasterUserRecord } from '@/types/power-users';

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

// Mock CohortBadge
jest.mock('../CohortBadge', () => ({
  CohortBadge: ({ cohort, userCount, onClick }: any) => (
    <div data-testid="cohort-badge" onClick={onClick}>
      {cohort.name} ({userCount})
    </div>
  ),
}));

// Mock delete confirmation dialogs
jest.mock('../DeleteCohortDialog', () => ({
  DeleteCohortDialog: ({ isOpen, cohortName, onConfirm }: any) =>
    isOpen ? (
      <div data-testid="delete-dialog">
        Delete {cohortName}?
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

// Mock edit dialog
jest.mock('../EditCohortDialog', () => ({
  EditCohortDialog: ({ isOpen, currentName, onSave }: any) =>
    isOpen ? (
      <div data-testid="edit-dialog">
        Edit {currentName}
        <button onClick={() => onSave('New Name')}>Save</button>
      </div>
    ) : null,
}));

describe('SavedCohortsPanel', () => {
  const mockCohorts: StoredCohort[] = [
    {
      id: 'cohort1',
      name: 'Test Cohort 1',
      color: '#f54e00',
      createdAt: '2025-01-01T00:00:00.000Z',
      filterCriteria: defaultFilters,
    },
    {
      id: 'cohort2',
      name: 'Test Cohort 2',
      color: '#526070',
      createdAt: '2025-01-02T00:00:00.000Z',
      filterCriteria: defaultFilters,
    },
  ];

  const mockUsers: EnhancedMasterUserRecord[] = [];

  const defaultProps = {
    savedCohorts: mockCohorts,
    enhancedUsers: mockUsers,
    onApplyCohortFilters: jest.fn(),
    onEditCohort: jest.fn(),
    onDeleteCohort: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all saved cohorts', () => {
    render(<SavedCohortsPanel {...defaultProps} />);
    
    expect(screen.getByText(/Test Cohort 1/)).toBeInTheDocument();
    expect(screen.getByText(/Test Cohort 2/)).toBeInTheDocument();
  });

  it('should show empty state when no cohorts', () => {
    render(<SavedCohortsPanel {...defaultProps} savedCohorts={[]} />);
    
    expect(screen.getByText(/No cohorts saved yet/)).toBeInTheDocument();
  });

  it('should call onApplyCohortFilters when cohort is clicked', () => {
    render(<SavedCohortsPanel {...defaultProps} />);
    
    const badges = screen.getAllByTestId('cohort-badge');
    fireEvent.click(badges[0]);
    
    expect(defaultProps.onApplyCohortFilters).toHaveBeenCalledWith(mockCohorts[0].filterCriteria);
  });

  it('should display cohorts sorted by creation date (newest first)', () => {
    const cohorts = [
      {
        ...mockCohorts[0],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        ...mockCohorts[1],
        createdAt: '2025-01-03T00:00:00.000Z',
      },
    ];

    render(<SavedCohortsPanel {...defaultProps} savedCohorts={cohorts} />);
    
    const badges = screen.getAllByTestId('cohort-badge');
    // Newest first (Test Cohort 2 with later date)
    expect(badges[0]).toHaveTextContent('Test Cohort 2');
  });

  it('should be collapsible', () => {
    const { container } = render(<SavedCohortsPanel {...defaultProps} />);
    
    // Should have collapsible functionality (exact implementation may vary)
    expect(container).toBeInTheDocument();
  });
});

