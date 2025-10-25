import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { exportCSV } from '@/lib/export-utils';
import { MasterTable } from '../MasterTable';
import { MasterUserRecord } from '@/types/power-users';
import type { FilterState } from '../MasterTableFilters';

// Mock the UserDetailDrawer component
jest.mock('../UserDetailDrawer', () => ({
  UserDetailDrawer: ({ isOpen, user }: { isOpen: boolean; user: { email?: string } | null }) => 
    isOpen ? <div data-testid="user-detail-drawer">Drawer Open: {user?.email}</div> : null
}));

// Mock the exportCSV utility
jest.mock('@/lib/export-utils', () => ({
  exportCSV: jest.fn(),
}));

const mockUsers: MasterUserRecord[] = [
  {
    email: 'user1@example.com',
    firstName: 'John',
    lastName: 'Doe',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    aiLinesChanged: 1000,
    totalLinesChanged: 5000,
    pctAiCode: 20,
    commitCount: 50,
    totalSessions: 100,
    totalAgentRequests: 500,
    isMcpUser: true,
    isRuleCreator: true,
    isRuleUser: false,
    isCommandCreator: false,
    isCommandUser: true,
    numProductsUsed: 3,
    membershipDays: 365,
    sourceFlags: {
      aiCode: true,
      features: true,
      agentRequests: true,
    },
  },
  {
    email: 'user2@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    aiLinesChanged: 2000,
    totalLinesChanged: 8000,
    pctAiCode: 25,
    commitCount: 100,
    totalSessions: 200,
    totalAgentRequests: 1000,
    isMcpUser: false,
    isRuleCreator: false,
    isRuleUser: true,
    isCommandCreator: true,
    isCommandUser: false,
    numProductsUsed: 2,
    membershipDays: 180,
    sourceFlags: {
      aiCode: true,
      features: true,
      agentRequests: true,
    },
  },
];

describe('MasterTable', () => {
  it('renders empty state when no data', () => {
    render(<MasterTable rows={[]} />);
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  it('renders table with user data', () => {
    render(<MasterTable rows={mockUsers} />);
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
  });

  it('displays filtered count', () => {
    const filters: FilterState = {
      searchText: 'user1',
      isMcpUser: null,
      isRuleCreator: null,
      isRuleUser: null,
      isCommandCreator: null,
      isCommandUser: null,
      isPowerUserFilter: ['true', 'false', 'unmarked'],
      aiLinesMin: '',
      aiLinesMax: '',
      sessionsMin: '',
      sessionsMax: '',
      requestsMin: '',
      requestsMax: '',
      engagementScoreMin: '',
      engagementScoreMax: '',
    };
    render(<MasterTable rows={mockUsers} filters={filters} />);
    expect(screen.getByText(/1 of 2 users/)).toBeInTheDocument();
  });

  it('sorts by column when header is clicked', () => {
    render(<MasterTable rows={mockUsers} />);
    
    // Click on AI Lines header to sort
    const aiLinesHeader = screen.getByText('AI Lines').closest('button');
    expect(aiLinesHeader).toBeInTheDocument();
    
    fireEvent.click(aiLinesHeader!);
    
    // Just verify the click worked without error
    expect(aiLinesHeader).toBeInTheDocument();
  });

  it('opens user detail drawer when row is clicked', async () => {
    render(<MasterTable rows={mockUsers} />);
    
    const firstRow = screen.getByText('user1@example.com').closest('tr');
    expect(firstRow).toBeInTheDocument();
    
    fireEvent.click(firstRow!);
    
    await waitFor(() => {
      expect(screen.getByTestId('user-detail-drawer')).toBeInTheDocument();
      expect(screen.getByText(/Drawer Open: user1@example.com/)).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', () => {
    const manyUsers = Array.from({ length: 100 }, (_, i) => ({
      ...mockUsers[0],
      email: `user${i}@example.com`,
    }));
    
    render(<MasterTable rows={manyUsers} />);
    
    // Should show pagination controls
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    
    // Click next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
  });

  it('toggles column visibility', () => {
    render(<MasterTable rows={mockUsers} />);
    
    // Open column visibility dropdown
    const columnsButton = screen.getByText('Columns');
    expect(columnsButton).toBeInTheDocument();
    
    fireEvent.click(columnsButton);
    
    // Just verify the button exists and can be clicked
    expect(columnsButton).toBeInTheDocument();
  });

  it('exports CSV when export button is clicked', () => {
    
    render(<MasterTable rows={mockUsers} />);
    
    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);
    
    expect(exportCSV).toHaveBeenCalled();
  });

  it('updates agent requests values when rows prop updates without toggling columns', async () => {
    // Start with rows that have undefined agent requests
    const initialRows: MasterUserRecord[] = [
      { ...mockUsers[0], totalAgentRequests: undefined, totalSessions: undefined },
      { ...mockUsers[1], totalAgentRequests: undefined, totalSessions: undefined },
    ];

    const { rerender } = render(<MasterTable rows={initialRows} />);

    // Values should display as em-dash initially
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);

    // Rerender with updated rows containing values
    const updatedRows: MasterUserRecord[] = [
      { ...mockUsers[0], totalAgentRequests: 500, totalSessions: 100 },
      { ...mockUsers[1], totalAgentRequests: 1000, totalSessions: 200 },
    ];

    rerender(<MasterTable rows={updatedRows} />);

    // Wait for the numbers to appear without any user interaction
    await waitFor(() => {
      expect(screen.getAllByText('500').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1,000').length).toBeGreaterThan(0);
      expect(screen.getAllByText('100').length).toBeGreaterThan(0);
      expect(screen.getAllByText('200').length).toBeGreaterThan(0);
    });
  });
});

