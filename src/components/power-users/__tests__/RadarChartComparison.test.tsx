import React from 'react';
import { render, screen } from '@testing-library/react';
import { RadarChartComparison } from '../RadarChartComparison';
import type { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: ({ name }: any) => <div data-testid="radar">{name}</div>,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

const createMockStats = (cohortsCount: number): MultiCohortStats => {
  const cohorts = Array.from({ length: cohortsCount }, (_, i) => ({
    cohort: {
      id: `cohort${i + 1}`,
      name: `Cohort ${i + 1}`,
      color: `#color${i}`,
      createdAt: new Date().toISOString(),
      filterCriteria: {},
    } as StoredCohort,
    metrics: {
      userCount: 10,
      metrics: {
        totalSessions: { mean: (i + 1) * 100, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        totalAgentRequests: { mean: (i + 1) * 500, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        pctAiCode: { mean: (i + 1) * 20, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        engagementScore: { mean: (i + 1) * 15, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        totalLinesChanged: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        aiLinesChanged: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        commitCount: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        numProductsUsed: { mean: (i + 1) * 3, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
        membershipDays: { mean: 0, median: 0, p75: 0, p90: 0, min: 0, max: 0, total: 0 },
      },
      featureAdoption: {
        isMcpUser: 0,
        isRuleCreator: 0,
        isRuleUser: 0,
        isCommandCreator: 0,
        isCommandUser: 0,
      },
    },
  }));

  return {
    cohorts,
    comparisonMetrics: [],
  };
};

describe('RadarChartComparison', () => {
  it('should render radar chart container', () => {
    const stats = createMockStats(2);
    render(<RadarChartComparison stats={stats} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('should render chart title', () => {
    const stats = createMockStats(2);
    render(<RadarChartComparison stats={stats} />);
    
    expect(screen.getByText(/Radar Chart Comparison/)).toBeInTheDocument();
  });

  it('should render legend', () => {
    const stats = createMockStats(2);
    render(<RadarChartComparison stats={stats} />);
    
    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('should render one radar per cohort', () => {
    const stats = createMockStats(3);
    render(<RadarChartComparison stats={stats} />);
    
    const radars = screen.getAllByTestId('radar');
    expect(radars).toHaveLength(3);
  });

  it('should handle maximum 6 cohorts', () => {
    const stats = createMockStats(6);
    render(<RadarChartComparison stats={stats} />);
    
    const radars = screen.getAllByTestId('radar');
    expect(radars).toHaveLength(6);
  });

  it('should display cohort names in radar elements', () => {
    const stats = createMockStats(2);
    render(<RadarChartComparison stats={stats} />);
    
    expect(screen.getByText('Cohort 1')).toBeInTheDocument();
    expect(screen.getByText('Cohort 2')).toBeInTheDocument();
  });

  it('should render polar grid', () => {
    const stats = createMockStats(2);
    render(<RadarChartComparison stats={stats} />);
    
    expect(screen.getByTestId('polar-grid')).toBeInTheDocument();
  });

  it('should render angle and radius axes', () => {
    const stats = createMockStats(2);
    render(<RadarChartComparison stats={stats} />);
    
    expect(screen.getByTestId('polar-angle-axis')).toBeInTheDocument();
    expect(screen.getByTestId('polar-radius-axis')).toBeInTheDocument();
  });
});

