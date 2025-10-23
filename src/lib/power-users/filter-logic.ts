import { MasterUserRecord, FilterCondition, FilterGroup, NestedFilterGroups } from '@/types/power-users';

/**
 * Evaluates a single filter condition against a user record
 */
function evaluateFilterCondition(user: MasterUserRecord, condition: FilterCondition): boolean {
  const userValue = user[condition.field];
  return userValue === condition.value;
}

/**
 * Evaluates a filter group with its operator (AND/OR)
 */
function evaluateFilterGroup(user: MasterUserRecord, group: FilterGroup): boolean {
  if (group.conditions.length === 0) {
    return true; // Empty group matches everything
  }

  if (group.operator === 'AND') {
    // All conditions must be true
    return group.conditions.every(condition => evaluateFilterCondition(user, condition));
  } else {
    // At least one condition must be true
    return group.conditions.some(condition => evaluateFilterCondition(user, condition));
  }
}

/**
 * Evaluates nested filter groups with AND logic between groups
 */
function evaluateNestedFilters(user: MasterUserRecord, filters: NestedFilterGroups): boolean {
  const group1Result = filters.group1 ? evaluateFilterGroup(user, filters.group1) : true;
  const group2Result = filters.group2 ? evaluateFilterGroup(user, filters.group2) : true;

  // Both groups must pass (AND logic between groups)
  return group1Result && group2Result;
}

/**
 * Main filter function to filter user records based on nested filter groups
 */
export function filterUsers(
  users: MasterUserRecord[],
  filters: NestedFilterGroups
): MasterUserRecord[] {
  // If no filters are active, return all users
  if (!filters.group1 && !filters.group2) {
    return users;
  }

  return users.filter(user => evaluateNestedFilters(user, filters));
}

/**
 * Checks if any filters are active
 */
export function hasActiveFilters(filters: NestedFilterGroups): boolean {
  return (filters.group1 !== null && filters.group1.conditions.length > 0) ||
         (filters.group2 !== null && filters.group2.conditions.length > 0);
}

