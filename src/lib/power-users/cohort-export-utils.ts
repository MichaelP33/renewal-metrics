import type { Cohort } from '@/types/power-users';
import type { MasterUserRecord, EnhancedMasterUserRecord } from '@/types/power-users';
import { exportCSV } from '@/lib/export-utils';
import { applyFilters } from './filter-utils';
import type { StoredCohort } from './cohort-manager';
import type { MultiCohortStats } from './multi-cohort-stats';

/**
 * Export cohort comparison data as CSV
 */
export function exportCohortComparison(
  stats: MultiCohortStats,
  filename?: string
): void {
  const cohorts = stats.cohorts;
  const csvRows: string[] = [];

  // Header row
  const headers = ['Metric', 'Spread', ...cohorts.map(c => c.name)];
  csvRows.push(headers.map(h => `"${h}"`).join(','));

  // Metric rows
  const metrics = [
    'Total Lines Changed',
    'AI Lines Changed',
    'Commit Count',
    'AI Code %',
    'Total Sessions',
    'Total Agent Requests',
    'Products Used',
    'Membership Days',
    'Engagement Score',
  ] as const;

  const metricKeys = [
    'totalLinesChanged',
    'aiLinesChanged',
    'commitCount',
    'pctAiCode',
    'totalSessions',
    'totalAgentRequests',
    'numProductsUsed',
    'membershipDays',
    'engagementScore',
  ] as const;

  metrics.forEach((metricName, index) => {
    const metricKey = metricKeys[index];
    const values = cohorts.map(cohort => {
      const metric = cohort.metrics[metricKey];
      return metric.mean.toFixed(2);
    });
    
    // Calculate spread
    const allValues = cohorts.map(cohort => cohort.metrics[metricKey].mean);
    const spread = (Math.max(...allValues) - Math.min(...allValues)).toFixed(2);

    csvRows.push([metricName, spread, ...values].map(v => `"${v}"`).join(','));
  });

  // Feature adoption rows
  csvRows.push(['']); // Empty row
  csvRows.push(['Feature Adoption'].map(h => `"${h}"`).join(','));
  
  const featureHeaders = ['Feature', 'Spread', ...cohorts.map(c => c.name)];
  csvRows.push(featureHeaders.map(h => `"${h}"`).join(','));

  const features = ['MCP', 'Rules (Creator)', 'Rules (User)', 'Commands (Creator)', 'Commands (User)'] as const;
  const featureKeys = ['mcp', 'rulesCreator', 'rulesUser', 'commandsCreator', 'commandsUser'] as const;

  features.forEach((featureName, index) => {
    const featureKey = featureKeys[index];
    const values = cohorts.map(cohort => {
      const adoption = cohort.featureAdoption[featureKey];
      return `${adoption.toFixed(1)}%`;
    });

    // Calculate spread
    const allValues = cohorts.map(cohort => cohort.featureAdoption[featureKey]);
    const spread = (Math.max(...allValues) - Math.min(...allValues)).toFixed(1);

    csvRows.push([featureName, `${spread}%`, ...values].map(v => `"${v}"`).join(','));
  });

  const csvContent = csvRows.join('\n');
  const finalFilename = filename || `cohort-comparison-${new Date().toISOString().split('T')[0]}.csv`;
  exportCSV(csvContent, finalFilename);
}

/**
 * Export cohort definitions as JSON
 */
export function exportCohortDefinitions(cohorts: Cohort[] | StoredCohort[]): void {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    cohorts: cohorts.map(cohort => ({
      id: cohort.id,
      name: cohort.name,
      color: cohort.color,
      createdAt: cohort.createdAt,
      filterCriteria: cohort.filterCriteria,
    })),
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cohort-definitions-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import cohort definitions from JSON file
 */
export async function importCohortDefinitions(file: File): Promise<{
  cohorts: StoredCohort[];
  errors: string[];
}> {
  const errors: string[] = [];
  const cohorts: StoredCohort[] = [];

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.cohorts || !Array.isArray(data.cohorts)) {
      errors.push('Invalid file format: missing cohorts array');
      return { cohorts, errors };
    }

    for (const cohort of data.cohorts) {
      if (!cohort.id || !cohort.name || !cohort.filterCriteria) {
        errors.push(`Invalid cohort: ${cohort.name || 'unnamed'} - missing required fields`);
        continue;
      }

      cohorts.push({
        id: cohort.id,
        name: cohort.name,
        color: cohort.color || '#9CA3AF',
        createdAt: cohort.createdAt || new Date().toISOString(),
        filterCriteria: cohort.filterCriteria,
      });
    }
  } catch (error) {
    errors.push(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { cohorts, errors };
}

/**
 * Export individual cohort user list as CSV
 */
export function exportCohortUserList(
  cohort: Cohort | StoredCohort,
  users: MasterUserRecord[] | EnhancedMasterUserRecord[]
): void {
  const filteredUsers = applyFilters(users as EnhancedMasterUserRecord[], cohort.filterCriteria);

  const headers = [
    'Email',
    'First Name',
    'Last Name',
    'LinkedIn URL',
    'AI Lines Changed',
    'Total Lines Changed',
    'AI Code %',
    'Commits',
    'Total Sessions',
    'Total Agent Requests',
    'MCP User',
    'Rule Creator',
    'Rule User',
    'Command Creator',
    'Command User',
    'Products Used',
    'Membership Days',
    'Engagement Score',
    'Power User',
  ];

  const csvRows = [headers.map(h => `"${h}"`).join(',')];

  filteredUsers.forEach(user => {
    const row = [
      user.email,
      user.firstName || '',
      user.lastName || '',
      user.linkedinUrl || '',
      String(user.aiLinesChanged ?? ''),
      String(user.totalLinesChanged ?? ''),
      user.pctAiCode ? `${user.pctAiCode.toFixed(1)}%` : '',
      String(user.commitCount ?? ''),
      String(user.totalSessions ?? ''),
      String(user.totalAgentRequests ?? ''),
      user.isMcpUser ? 'Yes' : 'No',
      user.isRuleCreator ? 'Yes' : 'No',
      user.isRuleUser ? 'Yes' : 'No',
      user.isCommandCreator ? 'Yes' : 'No',
      user.isCommandUser ? 'Yes' : 'No',
      String(user.numProductsUsed ?? ''),
      String(user.membershipDays ?? ''),
      (user as EnhancedMasterUserRecord).engagementScore !== undefined
        ? String((user as EnhancedMasterUserRecord).engagementScore)
        : '',
      user.isPowerUser === true ? 'Yes' : user.isPowerUser === false ? 'No' : 'Unmarked',
    ];

    csvRows.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
  });

  const csvContent = csvRows.join('\n');
  const filename = `cohort-${cohort.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
  exportCSV(csvContent, filename);
}

/**
 * Export all cohorts as separate CSV files (downloads individually)
 */
export function exportAllCohorts(
  savedCohorts: Cohort[] | StoredCohort[],
  enhancedUsers: EnhancedMasterUserRecord[]
): void {
  savedCohorts.forEach(cohort => {
    exportCohortUserList(cohort, enhancedUsers);
  });
}

