import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CohortBadge } from '../CohortBadge';
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

const createTestCohort = (overrides: Partial<StoredCohort> = {}): StoredCohort => ({
  id: 'test_id',
  name: 'Test Cohort',
  color: '#f54e00',
  createdAt: new Date().toISOString(),
  filterCriteria: defaultFilters,
  ...overrides,
});

describe('CohortBadge', () => {
  it('should render cohort name', () => {
    const cohort = createTestCohort({ name: 'Power Users' });
    render(<CohortBadge cohort={cohort} userCount={10} />);
    
    expect(screen.getByText('Power Users')).toBeInTheDocument();
  });

  it('should render user count with singular form', () => {
    const cohort = createTestCohort();
    render(<CohortBadge cohort={cohort} userCount={1} />);
    
    expect(screen.getByText('(1 user)')).toBeInTheDocument();
  });

  it('should render user count with plural form', () => {
    const cohort = createTestCohort();
    render(<CohortBadge cohort={cohort} userCount={5} />);
    
    expect(screen.getByText('(5 users)')).toBeInTheDocument();
  });

  it('should display color indicator with correct color', () => {
    const cohort = createTestCohort({ color: '#ff0000' });
    const { container } = render(<CohortBadge cohort={cohort} userCount={10} />);
    
    const colorIndicator = container.querySelector('.w-3.h-3.rounded-full');
    expect(colorIndicator).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('should call onClick when clicked', () => {
    const cohort = createTestCohort();
    const handleClick = jest.fn();
    
    render(<CohortBadge cohort={cohort} userCount={10} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be keyboard accessible when clickable', () => {
    const cohort = createTestCohort();
    const handleClick = jest.fn();
    
    render(<CohortBadge cohort={cohort} userCount={10} onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    fireEvent.keyDown(button, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should not be clickable when onClick is not provided', () => {
    const cohort = createTestCohort();
    render(<CohortBadge cohort={cohort} userCount={10} />);
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should have hover effects when clickable', () => {
    const cohort = createTestCohort();
    const { container } = render(<CohortBadge cohort={cohort} userCount={10} onClick={() => {}} />);
    
    const badge = container.querySelector('.cursor-pointer');
    expect(badge).toHaveClass('hover:bg-gray-50');
    expect(badge).toHaveClass('hover:scale-[1.02]');
  });

  it('should not show action buttons by default', () => {
    const cohort = createTestCohort();
    render(<CohortBadge cohort={cohort} userCount={10} onEdit={() => {}} onDelete={() => {}} />);
    
    // Should not render Edit or Delete buttons when showActions is false
    expect(screen.queryByLabelText(/edit/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/delete/i)).not.toBeInTheDocument();
  });

  it('should show action buttons when showActions is true', () => {
    const cohort = createTestCohort();
    render(
      <CohortBadge
        cohort={cohort}
        userCount={10}
        onEdit={() => {}}
        onDelete={() => {}}
        showActions={true}
      />
    );
    
    // Should render action buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  it('should truncate long cohort names', () => {
    const longName = 'This is a very long cohort name that should be truncated';
    const cohort = createTestCohort({ name: longName });
    const { container } = render(<CohortBadge cohort={cohort} userCount={10} />);
    
    const nameElement = container.querySelector('.truncate');
    expect(nameElement).toHaveTextContent(longName);
    expect(nameElement).toHaveClass('truncate');
  });

  it('should have proper ARIA label for color indicator', () => {
    const cohort = createTestCohort({ color: '#f54e00' });
    render(<CohortBadge cohort={cohort} userCount={10} />);
    
    expect(screen.getByLabelText('Cohort color: #f54e00')).toBeInTheDocument();
  });

  it('should handle zero users', () => {
    const cohort = createTestCohort();
    render(<CohortBadge cohort={cohort} userCount={0} />);
    
    expect(screen.getByText('(0 users)')).toBeInTheDocument();
  });

  it('should render with custom class names', () => {
    const cohort = createTestCohort();
    const { container } = render(<CohortBadge cohort={cohort} userCount={10} />);
    
    const badge = container.firstChild;
    expect(badge).toHaveClass('flex', 'items-center', 'gap-2', 'px-3', 'py-2', 'rounded-md', 'border');
  });
});

