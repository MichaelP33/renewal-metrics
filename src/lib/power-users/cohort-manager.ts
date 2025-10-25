import type { FilterState } from '@/components/power-users/MasterTableFilters';
import { COHORT_COLOR_ARRAY } from '@/types';

const COHORT_STORAGE_KEY = 'power-users-cohorts/v1';

// Define a compatible type for stored cohort data
export interface StoredCohort {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  filterCriteria: FilterState;
  userCount?: number;
}

/**
 * Generate a unique ID for a cohort using timestamp and random string
 */
export function generateCohortId(): string {
  return `cohort_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Assign a color to a cohort based on its index
 */
export function assignCohortColor(index: number): string {
  return COHORT_COLOR_ARRAY[index % COHORT_COLOR_ARRAY.length];
}

/**
 * Create a new cohort with the given name and filter criteria
 */
export function createCohort(name: string, filterCriteria: FilterState): StoredCohort {
  const existingCohorts = loadCohorts();
  const color = assignCohortColor(existingCohorts.length);
  
  return {
    id: generateCohortId(),
    name: name.trim(),
    color,
    createdAt: new Date().toISOString(),
    filterCriteria,
  };
}

/**
 * Save a cohort to localStorage
 */
export function saveCohort(cohort: StoredCohort): void {
  const cohorts = loadCohorts();
  const existingIndex = cohorts.findIndex(c => c.id === cohort.id);
  
  if (existingIndex >= 0) {
    cohorts[existingIndex] = cohort;
  } else {
    cohorts.push(cohort);
  }
  
  localStorage.setItem(COHORT_STORAGE_KEY, JSON.stringify(cohorts));
}

/**
 * Load all cohorts from localStorage
 */
export function loadCohorts(): StoredCohort[] {
  try {
    const stored = localStorage.getItem(COHORT_STORAGE_KEY);
    if (!stored) return [];
    
    const cohorts = JSON.parse(stored) as StoredCohort[];
    return Array.isArray(cohorts) ? cohorts : [];
  } catch (error) {
    console.error('Failed to load cohorts:', error);
    return [];
  }
}

/**
 * Delete a cohort by ID
 */
export function deleteCohort(id: string): void {
  const cohorts = loadCohorts();
  const filtered = cohorts.filter(c => c.id !== id);
  localStorage.setItem(COHORT_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Update an existing cohort
 */
export function updateCohort(id: string, updates: Partial<StoredCohort>): void {
  const cohorts = loadCohorts();
  const index = cohorts.findIndex(c => c.id === id);
  
  if (index >= 0) {
    cohorts[index] = { ...cohorts[index], ...updates };
    localStorage.setItem(COHORT_STORAGE_KEY, JSON.stringify(cohorts));
  }
}

/**
 * Get a single cohort by ID
 */
export function getCohortById(id: string): StoredCohort | undefined {
  const cohorts = loadCohorts();
  return cohorts.find(c => c.id === id);
}

