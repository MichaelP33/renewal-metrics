import type { FilterState } from '@/components/power-users/MasterTableFilters';
import type { EnhancedMasterUserRecord } from '@/types/power-users';

/**
 * Apply filter criteria to a list of users
 * This replicates the filter logic from MasterTable for cohort user count calculation
 */
export function applyFilters(
  users: EnhancedMasterUserRecord[],
  filters: FilterState
): EnhancedMasterUserRecord[] {
  return users.filter(row => {
    // Text search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const matchesEmail = row.email.toLowerCase().includes(searchLower);
      const matchesFirstName = row.firstName?.toLowerCase().includes(searchLower);
      const matchesLastName = row.lastName?.toLowerCase().includes(searchLower);
      
      if (!matchesEmail && !matchesFirstName && !matchesLastName) {
        return false;
      }
    }

    // Boolean filters (AND logic - all selected filters must match)
    if (filters.isMcpUser !== null && row.isMcpUser !== filters.isMcpUser) {
      return false;
    }
    if (filters.isRuleCreator !== null && row.isRuleCreator !== filters.isRuleCreator) {
      return false;
    }
    if (filters.isRuleUser !== null && row.isRuleUser !== filters.isRuleUser) {
      return false;
    }
    if (filters.isCommandCreator !== null && row.isCommandCreator !== filters.isCommandCreator) {
      return false;
    }
    if (filters.isCommandUser !== null && row.isCommandUser !== filters.isCommandUser) {
      return false;
    }

    // Power user filter
    if (filters.isPowerUserFilter && filters.isPowerUserFilter.length > 0) {
      const userState = row.isPowerUser === true ? 'true' : row.isPowerUser === false ? 'false' : 'unmarked';
      if (!filters.isPowerUserFilter.includes(userState)) {
        return false;
      }
    }

    // Numeric range filters
    if (filters.aiLinesMin && (row.aiLinesChanged ?? 0) < Number(filters.aiLinesMin)) {
      return false;
    }
    if (filters.aiLinesMax && (row.aiLinesChanged ?? 0) > Number(filters.aiLinesMax)) {
      return false;
    }
    if (filters.sessionsMin && (row.totalSessions ?? 0) < Number(filters.sessionsMin)) {
      return false;
    }
    if (filters.sessionsMax && (row.totalSessions ?? 0) > Number(filters.sessionsMax)) {
      return false;
    }
    if (filters.requestsMin && (row.totalAgentRequests ?? 0) < Number(filters.requestsMin)) {
      return false;
    }
    if (filters.requestsMax && (row.totalAgentRequests ?? 0) > Number(filters.requestsMax)) {
      return false;
    }

    // Engagement score range filter
    if (filters.engagementScoreMin && row.engagementScore !== undefined) {
      if (row.engagementScore < Number(filters.engagementScoreMin)) {
        return false;
      }
    }
    if (filters.engagementScoreMax && row.engagementScore !== undefined) {
      if (row.engagementScore > Number(filters.engagementScoreMax)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Generate a human-readable summary of active filters
 */
export function getFilterSummary(filters: FilterState): string[] {
  const summary: string[] = [];

  if (filters.searchText) {
    summary.push(`Search: "${filters.searchText}"`);
  }

  if (filters.isMcpUser !== null) {
    summary.push(`MCP User: ${filters.isMcpUser ? 'Yes' : 'No'}`);
  }
  if (filters.isRuleCreator !== null) {
    summary.push(`Rule Creator: ${filters.isRuleCreator ? 'Yes' : 'No'}`);
  }
  if (filters.isRuleUser !== null) {
    summary.push(`Rule User: ${filters.isRuleUser ? 'Yes' : 'No'}`);
  }
  if (filters.isCommandCreator !== null) {
    summary.push(`Command Creator: ${filters.isCommandCreator ? 'Yes' : 'No'}`);
  }
  if (filters.isCommandUser !== null) {
    summary.push(`Command User: ${filters.isCommandUser ? 'Yes' : 'No'}`);
  }

  if (filters.aiLinesMin || filters.aiLinesMax) {
    const min = filters.aiLinesMin || '0';
    const max = filters.aiLinesMax || '∞';
    summary.push(`AI Lines: ${min}-${max}`);
  }

  if (filters.sessionsMin || filters.sessionsMax) {
    const min = filters.sessionsMin || '0';
    const max = filters.sessionsMax || '∞';
    summary.push(`Sessions: ${min}-${max}`);
  }

  if (filters.requestsMin || filters.requestsMax) {
    const min = filters.requestsMin || '0';
    const max = filters.requestsMax || '∞';
    summary.push(`Requests: ${min}-${max}`);
  }

  if (filters.engagementScoreMin || filters.engagementScoreMax) {
    const min = filters.engagementScoreMin || '0';
    const max = filters.engagementScoreMax || '100';
    summary.push(`Engagement: ${min}-${max}`);
  }

  if (filters.isPowerUserFilter && filters.isPowerUserFilter.length < 3) {
    const states = filters.isPowerUserFilter.map(s => {
      if (s === 'true') return 'Power';
      if (s === 'false') return 'Non-Power';
      return 'Unmarked';
    });
    summary.push(`Status: ${states.join(', ')}`);
  }

  return summary;
}

