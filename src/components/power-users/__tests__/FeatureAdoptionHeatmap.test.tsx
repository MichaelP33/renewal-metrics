import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureAdoptionHeatmap } from '../FeatureAdoptionHeatmap';
import type { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';

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
      metrics: {} as any,
      featureAdoption: {
        isMcpUser: (i + 1) * 20,
        isRuleCreator: (i + 1) * 15,
        isRuleUser: (i + 1) * 10,
        isCommandCreator: (i + 1) * 8,
        isCommandUser: (i + 1) * 12,
      },
    },
  }));

  return {
    cohorts,
    comparisonMetrics: [],
  };
};

describe('FeatureAdoptionHeatmap', () => {
  it('should render heatmap title', () => {
    const stats = createMockStats(2);
    render(<FeatureAdoptionHeatmap stats={stats} />);
    
    expect(screen.getByText(/Feature Adoption/)).toBeInTheDocument();
  });

  it('should display all feature names', () => {
    const stats = createMockStats(2);
    render(<FeatureAdoptionHeatmap stats={stats} />);
    
    expect(screen.getByText(/MCP/)).toBeInTheDocument();
    expect(screen.getByText(/Rules/)).toBeInTheDocument();
    expect(screen.getByText(/Commands/)).toBeInTheDocument();
  });

  it('should display all cohort names', () => {
    const stats = createMockStats(2);
    render(<FeatureAdoptionHeatmap stats={stats} />);
    
    expect(screen.getByText('Cohort 1')).toBeInTheDocument();
    expect(screen.getByText('Cohort 2')).toBeInTheDocument();
  });

  it('should handle 6 cohorts (maximum)', () => {
    const stats = createMockStats(6);
    const { container } = render(<FeatureAdoptionHeatmap stats={stats} />);
    
    expect(container).toBeInTheDocument();
    expect(screen.getByText('Cohort 6')).toBeInTheDocument();
  });

  it('should display percentage values', () => {
    const stats = createMockStats(2);
    render(<FeatureAdoptionHeatmap stats={stats} />);
    
    // Should show percentage values (exact format may vary)
    expect(screen.getByText(/20%|40%/)).toBeInTheDocument();
  });

  it('should render as a table structure', () => {
    const stats = createMockStats(2);
    const { container } = render(<FeatureAdoptionHeatmap stats={stats} />);
    
    expect(container.querySelector('table') || container.querySelector('[role="table"]')).toBeInTheDocument();
  });

  it('should use color intensity for percentages', () => {
    const stats = createMockStats(2);
    const { container } = render(<FeatureAdoptionHeatmap stats={stats} />);
    
    // Should have cells with background colors based on percentage
    const cells = container.querySelectorAll('[style*="background"]');
    expect(cells.length).toBeGreaterThan(0);
  });
});

