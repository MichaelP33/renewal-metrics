import type { MasterUserRecord, UserSegment } from '@/types/power-users';

/**
 * Scoring weights for engagement calculation
 */
const SCORING_WEIGHTS = {
  sessions: 45,      // 0-45 points
  requests: 35,      // 0-35 points
  powerFeatures: 20, // 0-20 points
} as const;

/**
 * Max values for normalization
 */
const MAX_VALUES = {
  sessions: 1000,
  requests: 10000,
} as const;

/**
 * Segmentation thresholds
 */
const SEGMENT_THRESHOLDS = {
  power: 70,
  active: 50,
  casual: 30,
  atRisk: 0,
} as const;

/**
 * Calculates engagement score for a user based on multiple factors
 * 
 * Simplified formula: Sessions (45) + Requests (35) + Power Features (20)
 * 
 * @param user - Master user record
 * @returns Engagement score from 0-100
 */
export function calculateEngagementScore(user: MasterUserRecord): number {
  let score = 0;

  // Sessions score (0-45 points)
  const sessions = user.totalSessions ?? 0;
  const sessionsScore = Math.min((sessions / MAX_VALUES.sessions) * SCORING_WEIGHTS.sessions, SCORING_WEIGHTS.sessions);
  score += sessionsScore;

  // Requests score (0-35 points)
  const requests = user.totalAgentRequests ?? 0;
  const requestsScore = Math.min((requests / MAX_VALUES.requests) * SCORING_WEIGHTS.requests, SCORING_WEIGHTS.requests);
  score += requestsScore;

  // Power features score (0-20 points)
  // Simplified 3-category system:
  // - MCP User: 4 points
  // - Rules: Creator OR User = 4 points, both = 8 points
  // - Commands: Creator OR User = 4 points, both = 8 points
  let powerFeaturesScore = 0;
  
  // MCP user (4 points)
  if (user.isMcpUser) powerFeaturesScore += 4;
  
  // Rules (4 points for creator OR user, 8 points for both)
  const hasRuleCreator = user.isRuleCreator ?? false;
  const hasRuleUser = user.isRuleUser ?? false;
  if (hasRuleCreator && hasRuleUser) {
    powerFeaturesScore += 8;
  } else if (hasRuleCreator || hasRuleUser) {
    powerFeaturesScore += 4;
  }
  
  // Commands (4 points for creator OR user, 8 points for both)
  const hasCommandCreator = user.isCommandCreator ?? false;
  const hasCommandUser = user.isCommandUser ?? false;
  if (hasCommandCreator && hasCommandUser) {
    powerFeaturesScore += 8;
  } else if (hasCommandCreator || hasCommandUser) {
    powerFeaturesScore += 4;
  }
  
  score += powerFeaturesScore;

  // Clamp to 0-100 and round to whole number
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Segments a user based on their engagement score
 * 
 * @param score - Engagement score (0-100)
 * @returns User segment category
 */
export function segmentUser(score: number): UserSegment {
  if (score >= SEGMENT_THRESHOLDS.power) return 'power';
  if (score >= SEGMENT_THRESHOLDS.active) return 'active';
  if (score >= SEGMENT_THRESHOLDS.casual) return 'casual';
  return 'at-risk';
}

/**
 * Calculates percentiles for an array of scores
 * 
 * @param scores - Array of engagement scores
 * @returns Array of percentiles (0-100) corresponding to each score
 */
export function calculatePercentiles(scores: number[]): number[] {
  if (scores.length === 0) return [];
  
  // Sort scores for percentile calculation
  const sortedScores = [...scores].sort((a, b) => a - b);
  
  // Calculate percentile for each score
  return scores.map(score => {
    const rank = sortedScores.findIndex(s => s >= score);
    const percentile = (rank / sortedScores.length) * 100;
    return Math.round(percentile);
  });
}

/**
 * Calculates Pearson correlation coefficient between two arrays
 * 
 * @param x - First array of numbers
 * @param y - Second array of numbers
 * @returns Correlation coefficient (-1 to 1)
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }

  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
  const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;

  // Calculate covariance and variances
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;

  for (let i = 0; i < x.length; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    covariance += diffX * diffY;
    varianceX += diffX * diffX;
    varianceY += diffY * diffY;
  }

  // Calculate correlation
  const denominator = Math.sqrt(varianceX * varianceY);
  if (denominator === 0) return 0;

  return covariance / denominator;
}

/**
 * Counts power features for a user
 * 
 * @param user - Master user record
 * @returns Number of power features enabled (0-5)
 */
export function countPowerFeatures(user: MasterUserRecord): number {
  let count = 0;
  if (user.isMcpUser) count++;
  if (user.isRuleCreator) count++;
  if (user.isRuleUser) count++;
  if (user.isCommandCreator) count++;
  if (user.isCommandUser) count++;
  return count;
}

