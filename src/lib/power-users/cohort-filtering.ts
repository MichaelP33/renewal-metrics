import { applyFilters } from './filter-utils';
import type { EnhancedMasterUserRecord, Cohort } from '@/types/power-users';
import type { FilterState } from '@/components/power-users/MasterTableFilters';
import type { StoredCohort } from './cohort-manager';

/**
 * Filter users based on a cohort's filter criteria
 * Reuses existing applyFilters logic for consistency with Master Table filtering
 */
export function getUsersForCohort(
  allUsers: EnhancedMasterUserRecord[],
  cohort: Cohort | StoredCohort
): EnhancedMasterUserRecord[] {
  // StoredCohort uses FilterState directly, Cohort uses Record<string, unknown>
  // Cast to FilterState for both cases
  const filters = cohort.filterCriteria as unknown as FilterState;
  return applyFilters(allUsers, filters);
}

/**
 * Filter users for multiple cohorts and return a map of cohort ID to user arrays
 */
export function getUsersForCohorts(
  allUsers: EnhancedMasterUserRecord[],
  cohorts: (Cohort | StoredCohort)[]
): Map<string, EnhancedMasterUserRecord[]> {
  const result = new Map<string, EnhancedMasterUserRecord[]>();
  
  for (const cohort of cohorts) {
    const users = getUsersForCohort(allUsers, cohort);
    result.set(cohort.id, users);
  }
  
  return result;
}

