import { z } from 'zod';

/**
 * Note: FilterState is defined in @/components/power-users/MasterTableFilters
 * and imported where needed for Cohort type usage
 */

/**
 * Normalizes an email address for use as a unique key.
 * - Trims whitespace
 * - Converts to lowercase
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * AI Code Metrics domain type
 */
export interface AICodeMetrics {
  email: string;
  linkedinUrl?: string;
  aiLinesChanged: number;
  totalLinesChanged: number;
  pctAiCode: number;
  commitCount: number;
}

/**
 * Power User Features domain type
 */
export interface PowerUserFeatures {
  email: string;
  isMcpUser?: boolean;
  isRuleCreator?: boolean;
  isRuleUser?: boolean;
  isCommandCreator?: boolean;
  isCommandUser?: boolean;
  numProductsUsed?: number;
  membershipDays?: number;
}

/**
 * Agent Requests domain type
 */
export interface AgentRequests {
  email: string;
  firstName?: string;
  lastName?: string;
  totalRequests?: number;
  totalSessions?: number;
}

/**
 * Master User Record - unified representation of a user across all datasets
 */
export interface MasterUserRecord {
  // Identity
  email: string;
  firstName?: string;
  lastName?: string;
  linkedinUrl?: string;

  // AI Code Metrics
  aiLinesChanged?: number;
  totalLinesChanged?: number;
  pctAiCode?: number;
  commitCount?: number;

  // Agent Activity
  totalSessions?: number;
  totalAgentRequests?: number;

  // Power Features (booleans)
  isMcpUser?: boolean;
  isRuleCreator?: boolean;
  isRuleUser?: boolean;
  isCommandCreator?: boolean;
  isCommandUser?: boolean;

  // Power Features (numeric)
  numProductsUsed?: number;
  membershipDays?: number;

  // Power User Classification (manual)
  /** 
   * Manual flag to indicate if this user is classified as a "power user"
   * Used for comparative analysis between power users and non-power users
   */
  isPowerUser?: boolean;

  // Metadata
  sourceFlags: {
    aiCode: boolean;
    features: boolean;
    agentRequests: boolean;
  };
}

/**
 * User segmentation categories
 */
export type UserSegment = 'power' | 'active' | 'casual' | 'at-risk';

/**
 * Power feature field names for filtering
 */
export type PowerFeatureField = 
  | 'isMcpUser' 
  | 'isRuleCreator' 
  | 'isRuleUser' 
  | 'isCommandCreator' 
  | 'isCommandUser';

/**
 * Filter operator types
 */
export type FilterOperator = 'AND' | 'OR';

/**
 * Single filter condition
 */
export interface FilterCondition {
  field: PowerFeatureField;
  value: boolean;
}

/**
 * Filter group containing multiple conditions
 */
export interface FilterGroup {
  operator: FilterOperator;
  conditions: FilterCondition[];
}

/**
 * Nested filter groups (supports up to 2 groups)
 */
export interface NestedFilterGroups {
  group1: FilterGroup | null;
  group2: FilterGroup | null;
}

/**
 * Enhanced Master User Record with computed analytics
 */
export interface EnhancedMasterUserRecord extends MasterUserRecord {
  engagementScore?: number;        // 0-100 score
  engagementPercentile?: number;   // 0-100 percentile
  segment?: UserSegment;
}

// Zod schemas for CSV row validation

/**
 * Schema for AI Code Metrics CSV rows
 */
export const AICodeMetricsCsvRowSchema = z.object({
  team_id: z.number(),
  team_name: z.string(),
  user_id: z.number(),
  email: z.string().trim().email(),
  person_linkedin_url: z.string().nullable().transform(val => val === '' || val === null ? undefined : val).optional(),
  total_lines_changed: z.number().nonnegative(),
  ai_lines_changed: z.number().nonnegative(),
  non_ai_lines_changed: z.number().nonnegative(),
  pct_ai_lines_changed: z.number().min(0).max(100),
  pct_non_ai_lines_changed: z.number().min(0).max(100),
  commit_count: z.number().nonnegative(),
});

/**
 * Schema for Power User Features CSV rows
 */
export const PowerUserFeaturesCsvRowSchema = z.object({
  userid: z.number(),
  email: z.string().trim().email(),
  membership_length: z.string(),
  membership_days: z.number().nonnegative(),
  is_mcp_user: z.boolean(),
  is_rule_creator: z.boolean(),
  is_rule_user: z.boolean(),
  is_command_creator: z.boolean(),
  is_command_user: z.boolean(),
  num_products_used: z.number().nonnegative(),
});

/**
 * Schema for Agent Requests CSV rows
 */
export const AgentRequestsCsvRowSchema = z.object({
  email: z.string().trim().email(),
  first_name: z.string().nullable().transform(val => val === '' || val === null ? undefined : val).optional(),
  last_name: z.string().nullable().transform(val => val === '' || val === null ? undefined : val).optional(),
  auth_id: z.string(),
  total_requests: z.number().nonnegative(),
  total_sessions: z.number().nonnegative(),
  combined_score: z.number(),
});

/**
 * Cohort definition with filter criteria
 * Note: FilterState is imported from MasterTableFilters where used
 */
export interface Cohort {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // User-provided name
  color: string;                 // Hex color code
  createdAt: string;             // ISO timestamp
  filterCriteria: Record<string, unknown>; // FilterState - the filter state that defines this cohort
  userCount?: number;            // Cached count (optional, calculated on demand)
}

/**
 * Cohort comparison configuration
 */
export interface CohortComparison {
  cohorts: Cohort[];            // Selected cohorts to compare (2-6)
  timestamp: string;             // When comparison was created
}

/**
 * Numeric metric keys used for cohort comparisons
 */
export type NumericMetricKey =
  | 'totalLinesChanged'
  | 'aiLinesChanged'
  | 'commitCount'
  | 'pctAiCode'
  | 'totalSessions'
  | 'totalAgentRequests'
  | 'numProductsUsed'
  | 'membershipDays'
  | 'engagementScore';

/**
 * Metrics for a single cohort
 */
export interface CohortMetrics {
  userCount: number;
  metrics: {
    [key in NumericMetricKey]: {
      mean: number;
      median: number;
      p75: number;
      p90: number;
      min: number;
      max: number;
      total: number;
    };
  };
  featureAdoption: {
    isMcpUser: number;      // percentage
    isRuleCreator: number;
    isRuleUser: number;
    isCommandCreator: number;
    isCommandUser: number;
  };
}

/**
 * Multi-cohort comparison result
 */
export interface MultiCohortStats {
  cohorts: Array<{
    cohort: Cohort;
    metrics: CohortMetrics;
  }>;
  comparisonMetrics: Array<{
    metricName: string;
    metricKey: string;
    values: Record<string, number>;  // cohortId -> mean value
    range: { min: number; max: number };
    spread: number;
  }>;
}

