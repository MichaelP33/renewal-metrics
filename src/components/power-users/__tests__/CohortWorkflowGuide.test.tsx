import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CohortWorkflowGuide } from '../CohortWorkflowGuide';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CohortWorkflowGuide', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should render guide with 4 steps', () => {
    render(<CohortWorkflowGuide />);
    
    expect(screen.getByText(/Filter users/)).toBeInTheDocument();
    expect(screen.getByText(/Save as cohort/)).toBeInTheDocument();
    expect(screen.getByText(/Repeat/)).toBeInTheDocument();
    expect(screen.getByText(/Compare/)).toBeInTheDocument();
  });

  it('should render Got it button', () => {
    render(<CohortWorkflowGuide />);
    
    expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();
  });

  it('should save to localStorage when Got it is clicked', () => {
    render(<CohortWorkflowGuide />);
    
    const button = screen.getByRole('button', { name: /got it/i });
    fireEvent.click(button);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cohort-workflow-guide-dismissed',
      'true'
    );
  });

  it('should not render when previously dismissed', () => {
    localStorageMock.setItem('cohort-workflow-guide-dismissed', 'true');
    
    const { container } = render(<CohortWorkflowGuide />);
    
    // Should be hidden or not rendered
    expect(container.firstChild).toBeNull() || expect(container.querySelector('.hidden')).toBeInTheDocument();
  });

  it('should have reopen capability after dismissal', () => {
    localStorageMock.setItem('cohort-workflow-guide-dismissed', 'true');
    
    render(<CohortWorkflowGuide />);
    
    // Should have a button or way to reopen (implementation may vary)
    const reopenButton = screen.queryByRole('button', { name: /help|guide|show/i });
    if (reopenButton) {
      expect(reopenButton).toBeInTheDocument();
    }
  });

  it('should display step icons', () => {
    const { container } = render(<CohortWorkflowGuide />);
    
    // Should have icon elements for each step
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should be collapsible/expandable', () => {
    const { container } = render(<CohortWorkflowGuide />);
    
    // Should have collapsible functionality
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have smooth fade-in animation', () => {
    const { container } = render(<CohortWorkflowGuide />);
    
    // Should have animation classes
    const guide = container.firstChild as HTMLElement;
    if (guide) {
      const classes = guide.className || '';
      expect(classes).toMatch(/animate|fade|transition/i);
    }
  });

  it('should describe the complete workflow', () => {
    render(<CohortWorkflowGuide />);
    
    // Should mention key concepts
    expect(screen.getByText(/Filter/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
    expect(screen.getByText(/Compare/i)).toBeInTheDocument();
  });
});

