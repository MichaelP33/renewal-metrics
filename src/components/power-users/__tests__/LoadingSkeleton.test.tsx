import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('should render chart variant by default', () => {
    const { container } = render(<LoadingSkeleton />);
    
    // Check for chart-specific elements
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(container.querySelector('.h-64')).toBeInTheDocument(); // Chart area
  });

  it('should render chart variant when specified', () => {
    const { container } = render(<LoadingSkeleton variant="chart" />);
    
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(container.querySelector('.h-64')).toBeInTheDocument();
  });

  it('should render table variant', () => {
    const { container } = render(<LoadingSkeleton variant="table" />);
    
    const rows = container.querySelectorAll('.animate-pulse');
    expect(rows.length).toBe(5); // 5 skeleton rows
  });

  it('should render stat-card variant', () => {
    const { container } = render(<LoadingSkeleton variant="stat-card" />);
    
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(container.querySelector('.h-8')).toBeInTheDocument(); // Stat value
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSkeleton variant="chart" className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have shimmer animation class', () => {
    const { container } = render(<LoadingSkeleton variant="chart" />);
    
    const animatedElement = container.querySelector('.animate-pulse');
    expect(animatedElement).toBeInTheDocument();
  });

  it('should render null for invalid variant', () => {
    const { container } = render(<LoadingSkeleton variant={'invalid' as any} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render different structure for each variant', () => {
    const { container: chartContainer } = render(<LoadingSkeleton variant="chart" />);
    const { container: tableContainer } = render(<LoadingSkeleton variant="table" />);
    const { container: statContainer } = render(<LoadingSkeleton variant="stat-card" />);
    
    // Chart should have a single Card component
    expect(chartContainer.querySelector('.h-64')).toBeInTheDocument();
    
    // Table should have multiple rows
    expect(tableContainer.querySelectorAll('.flex').length).toBe(5);
    
    // Stat card should have stat-like structure
    expect(statContainer.querySelector('.h-8')).toBeInTheDocument();
  });
});

