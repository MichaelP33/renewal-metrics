import React from 'react';
import { render, screen } from '@testing-library/react';
import { ComparisonBuilder } from '../ComparisonBuilder';

// Mock PowerUsersContext
jest.mock('@/contexts/PowerUsersContext', () => ({
  usePowerUsers: () => ({
    savedCohorts: [
      {
        id: 'cohort1',
        name: 'Test Cohort 1',
        color: '#f54e00',
        createdAt: new Date().toISOString(),
        filterCriteria: {},
      },
    ],
    selectedCohortIds: [],
    selectCohortForComparison: jest.fn(),
    deselectCohortForComparison: jest.fn(),
    clearComparisonCohorts: jest.fn(),
    getSelectedCohorts: () => [],
    enhancedUsers: [],
  }),
}));

// Mock CohortSelector
jest.mock('../CohortSelector', () => ({
  CohortSelector: ({ placeholder }: { placeholder: string }) => (
    <div data-testid="cohort-selector">{placeholder}</div>
  ),
}));

// Mock CohortBadge
jest.mock('../CohortBadge', () => ({
  CohortBadge: ({ cohort }: any) => (
    <div data-testid="cohort-badge">{cohort.name}</div>
  ),
}));

describe('ComparisonBuilder', () => {
  it('should render comparison builder title', () => {
    render(<ComparisonBuilder />);
    
    expect(screen.getByText('Cohort Comparison Builder')).toBeInTheDocument();
  });

  it('should show prompt to select cohorts when none selected', () => {
    render(<ComparisonBuilder />);
    
    expect(screen.getByText('Select cohorts to compare')).toBeInTheDocument();
  });

  it('should render cohort selector slots', () => {
    render(<ComparisonBuilder />);
    
    const selectors = screen.getAllByTestId('cohort-selector');
    expect(selectors.length).toBeGreaterThan(0);
  });

  it('should show info tooltip about comparison limits', () => {
    const { container } = render(<ComparisonBuilder />);
    
    const infoIcon = container.querySelector('.cursor-help');
    expect(infoIcon).toBeInTheDocument();
  });
});

