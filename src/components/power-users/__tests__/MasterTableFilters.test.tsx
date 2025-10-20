import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MasterTableFilters } from '../MasterTableFilters';

describe('MasterTableFilters', () => {
  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders all filter controls', () => {
    render(<MasterTableFilters onFilterChange={mockOnFilterChange} />);
    
    expect(screen.getByLabelText(/Search users by email/i)).toBeInTheDocument();
    expect(screen.getByText('Power Features')).toBeInTheDocument();
    expect(screen.getByText('Numeric Ranges')).toBeInTheDocument();
  });

  it('debounces search input', async () => {
    const user = userEvent.setup();
    render(<MasterTableFilters onFilterChange={mockOnFilterChange} />);
    
    const searchInput = screen.getByLabelText(/Search users by email/i);
    
    await user.type(searchInput, 'test');
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('toggles boolean filters', () => {
    render(<MasterTableFilters onFilterChange={mockOnFilterChange} />);
    
    // Click Yes button for MCP User
    const mcpYesButton = screen.getByText('MCP User').parentElement?.querySelectorAll('button')[1];
    expect(mcpYesButton).toBeInTheDocument();
    
    fireEvent.click(mcpYesButton!);
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('handles numeric range filters', async () => {
    const user = userEvent.setup();
    render(<MasterTableFilters onFilterChange={mockOnFilterChange} />);
    
    const aiLinesMinInput = screen.getByLabelText(/AI Lines Changed/i).parentElement?.querySelector('input[placeholder="Min"]');
    expect(aiLinesMinInput).toBeInTheDocument();
    
    await user.type(aiLinesMinInput!, '100');
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('applies quick filter presets', () => {
    render(<MasterTableFilters onFilterChange={mockOnFilterChange} />);
    
    const hasAnyPowerFeatureButton = screen.getByText('Has Any Power Feature');
    fireEvent.click(hasAnyPowerFeatureButton);
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('clears all filters', () => {
    render(<MasterTableFilters onFilterChange={mockOnFilterChange} />);
    
    // Set some filters first
    const mcpYesButton = screen.getByText('MCP User').parentElement?.querySelectorAll('button')[1];
    fireEvent.click(mcpYesButton!);
    
    // Clear all
    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);
    
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('shows clear button when filters are active', () => {
    render(<MasterTableFilters onFilterChange={mockOnFilterChange} />);
    
    // Initially no clear button
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
    
    // Set a filter
    const mcpYesButton = screen.getByText('MCP User').parentElement?.querySelectorAll('button')[1];
    fireEvent.click(mcpYesButton!);
    
    // Clear button should appear
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('forwards search input ref', () => {
    const searchInputRef = React.createRef<HTMLInputElement>();
    render(<MasterTableFilters onFilterChange={mockOnFilterChange} searchInputRef={searchInputRef} />);
    
    expect(searchInputRef.current).toBeInstanceOf(HTMLInputElement);
  });
});

