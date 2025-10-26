import React from 'react';
import { render, screen } from '@testing-library/react';
import { ComparisonMetricsTable } from '../ComparisonMetricsTable';
import type { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';

const mockStats: MultiCohortStats = {
  cohorts: [
    {
      cohort: {
        id: 'cohort1',
        name: 'Cohort 1',
        color: '#f54e00',
        createdAt: '2025-01-01T00:00:00.000Z',
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
    {
      cohort: {
        id: 'cohort2',
        name: 'Cohort 2',
        color: '#526070',
        createdAt: '2025-01-02T00:00:00.000Z',
        filterCriteria: {},
      } as StoredCohort,
      metrics: {
        userCount: 20,
        metrics: {
          totalLinesChanged: { mean: 800, median: 750, p75: 900, p90: 1100, min: 400, max: 1500, total: 16000 },
          aiLinesChanged: { mean: 400, median: 380, p75: 480, p90: 600, min: 200, max: 800, total: 8000 },
          commitCount: { mean: 40, median: 38, p75: 50, p90: 60, min: 20, max: 80, total: 800 },
          pctAiCode: { mean: 45, median: 45, p75: 50, p90: 55, min: 35, max: 65, total: 900 },
          totalSessions: { mean: 80, median: 75, p75: 95, p90: 120, min: 40, max: 150, total: 1600 },
          totalAgentRequests: { mean: 400, median: 380, p75: 480, p90: 600, min: 200, max: 800, total: 8000 },
          numProductsUsed: { mean: 2, median: 2, p75: 3, p90: 4, min: 1, max: 5, total: 40 },
          membershipDays: { mean: 300, median: 300, p75: 350, p90: 400, min: 90, max: 450, total: 6000 },
          engagementScore: { mean: 55, median: 50, p75: 65, p90: 75, min: 25, max: 85, total: 1100 },
        },
        featureAdoption: {
          isMcpUser: 40,
          isRuleCreator: 25,
          isRuleUser: 35,
          isCommandCreator: 15,
          isCommandUser: 30,
        },
      },
    },
  ],
  comparisonMetrics: [],
};

describe('ComparisonMetricsTable', () => {
  it('should render table with cohort columns', () => {
    render(<ComparisonMetricsTable stats={mockStats} />);
    
    expect(screen.getByText('Cohort 1')).toBeInTheDocument();
    expect(screen.getByText('Cohort 2')).toBeInTheDocument();
  });

  it('should display metric names', () => {
    render(<ComparisonMetricsTable stats={mockStats} />);
    
    // Should show some metric names (exact text may vary)
    expect(screen.getByText(/Sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/Requests/i)).toBeInTheDocument();
  });

  it('should show user counts', () => {
    render(<ComparisonMetricsTable stats={mockStats} />);
    
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });

  it('should display trophy icon for best values', () => {
    const { container } = render(<ComparisonMetricsTable stats={mockStats} />);
    
    // Should have trophy icons (🏆) for best-performing cohorts
    const trophies = container.querySelectorAll('[aria-label="Best value"]');
    expect(trophies.length).toBeGreaterThan(0);
  });

  it('should show spread column', () => {
    render(<ComparisonMetricsTable stats={mockStats} />);
    
    expect(screen.getByText('Spread')).toBeInTheDocument();
  });

  it('should handle empty stats gracefully', () => {
    const emptyStats: MultiCohortStats = {
      cohorts: [],
      comparisonMetrics: [],
    };
    
    render(<ComparisonMetricsTable stats={emptyStats} />);
    
    // Should not crash
    expect(screen.queryByRole('table')).toBeInTheDocument();
  });
});

