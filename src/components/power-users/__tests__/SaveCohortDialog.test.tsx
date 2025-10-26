import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveCohortDialog } from '../SaveCohortDialog';
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

describe('SaveCohortDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    currentFilters: defaultFilters,
    userCount: 10,
    existingCohortNames: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    render(<SaveCohortDialog {...defaultProps} />);
    
    expect(screen.getByText('Save as Cohort')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<SaveCohortDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Save as Cohort')).not.toBeInTheDocument();
  });

  it('should display user count', () => {
    render(<SaveCohortDialog {...defaultProps} userCount={42} />);
    
    expect(screen.getByText(/42 users/)).toBeInTheDocument();
  });

  it('should display filter summary', () => {
    const filters: FilterState = {
      ...defaultFilters,
      isMcpUser: true,
      sessionsMin: '50',
      isPowerUserFilter: ['true', 'false', 'unmarked'],
    };
    
    render(<SaveCohortDialog {...defaultProps} currentFilters={filters} />);
    
    expect(screen.getByText('MCP User: Yes')).toBeInTheDocument();
    expect(screen.getByText(/Sessions: 50/)).toBeInTheDocument();
  });

  it('should show error when name is empty', async () => {
    render(<SaveCohortDialog {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Cohort name is required')).toBeInTheDocument();
    });
    
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('should show error when name is too long', async () => {
    const user = userEvent.setup();
    render(<SaveCohortDialog {...defaultProps} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, 'a'.repeat(51));
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Cohort name must be 50 characters or less')).toBeInTheDocument();
    });
    
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('should show error when duplicate name', async () => {
    const user = userEvent.setup();
    const props = {
      ...defaultProps,
      existingCohortNames: ['Existing Cohort'],
    };
    
    render(<SaveCohortDialog {...props} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, 'Existing Cohort');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('A cohort with this name already exists')).toBeInTheDocument();
    });
    
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('should handle case-insensitive duplicate check', async () => {
    const user = userEvent.setup();
    const props = {
      ...defaultProps,
      existingCohortNames: ['Existing Cohort'],
    };
    
    render(<SaveCohortDialog {...props} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, 'existing cohort');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('A cohort with this name already exists')).toBeInTheDocument();
    });
  });

  it('should call onSave with trimmed name on valid input', async () => {
    const user = userEvent.setup();
    render(<SaveCohortDialog {...defaultProps} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, '  Test Cohort  ');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith('Test Cohort');
    });
  });

  it('should close dialog after successful save', async () => {
    const user = userEvent.setup();
    render(<SaveCohortDialog {...defaultProps} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, 'New Cohort');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('should show loading state while saving', async () => {
    const user = userEvent.setup();
    render(<SaveCohortDialog {...defaultProps} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, 'New Cohort');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Should show loading icon briefly
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
    });
  });

  it('should disable save button while saving', async () => {
    const user = userEvent.setup();
    render(<SaveCohortDialog {...defaultProps} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, 'New Cohort');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Button should be disabled during save
    expect(saveButton).toBeDisabled();
    
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalled();
    });
  });

  it('should allow saving with Enter key', async () => {
    const user = userEvent.setup();
    render(<SaveCohortDialog {...defaultProps} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, 'New Cohort');
    
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith('New Cohort');
    });
  });

  it('should call onClose when cancel button clicked', () => {
    render(<SaveCohortDialog {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should reset state when dialog opens', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SaveCohortDialog {...defaultProps} isOpen={false} />);
    
    // Open dialog
    rerender(<SaveCohortDialog {...defaultProps} isOpen={true} />);
    
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, 'Test');
    
    // Close and reopen
    rerender(<SaveCohortDialog {...defaultProps} isOpen={false} />);
    rerender(<SaveCohortDialog {...defaultProps} isOpen={true} />);
    
    // Input should be cleared
    const newInput = screen.getByLabelText('Cohort Name') as HTMLInputElement;
    expect(newInput.value).toBe('');
  });

  it('should display filter count when no specific filters shown', () => {
    render(<SaveCohortDialog {...defaultProps} currentFilters={defaultFilters} />);
    
    // Should show message about no filters or "All users"
    expect(screen.getByText(/Current Filters/)).toBeInTheDocument();
  });

  it('should handle empty filter summary', () => {
    render(<SaveCohortDialog {...defaultProps} currentFilters={defaultFilters} />);
    
    // Should not crash with empty filters
    expect(screen.getByText('Save as Cohort')).toBeInTheDocument();
  });

  it('should show filter preview section', () => {
    render(<SaveCohortDialog {...defaultProps} />);
    
    expect(screen.getByText('Current Filters')).toBeInTheDocument();
  });

  it('should allow very long names up to 50 characters', async () => {
    const user = userEvent.setup();
    render(<SaveCohortDialog {...defaultProps} />);
    
    const validName = 'a'.repeat(50);
    const input = screen.getByLabelText('Cohort Name');
    await user.type(input, validName);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(validName);
    });
  });
});

