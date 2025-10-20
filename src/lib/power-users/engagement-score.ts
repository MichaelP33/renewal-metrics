import type { MasterUserRecord, UserSegment } from '@/types/power-users';

/**
 * Scoring weights for engagement calculation
 */
const SCORING_WEIGHTS = {
  sessions: 40,      // 0-40 points
  requests: 25,      // 0-25 points
  aiCodePct: 20,     // 0-20 points
  powerFeatures: 10, // 0-10 points
  tenure: 5,         // 0-5 points
} as const;

/**
 * Max values for normalization
 */
const MAX_VALUES = {
  sessions: 1000,
  requests: 10000,
  aiCodePct: 100,
  powerFeatures: 5,  // 5 boolean features
  tenure: 365,       // 1 year
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
 * @param user - Master user record
 * @returns Engagement score from 0-100
 */
export function calculateEngagementScore(user: MasterUserRecord): number {
  let score = 0;

  // Sessions score (0-40 points)
  const sessions = user.totalSessions ?? 0;
  const sessionsScore = Math.min((sessions / MAX_VALUES.sessions) * SCORING_WEIGHTS.sessions, SCORING_WEIGHTS.sessions);
  score += sessionsScore;

  // Requests score (0-25 points)
  const requests = user.totalAgentRequests ?? 0;
  const requestsScore = Math.min((requests / MAX_VALUES.requests) * SCORING_WEIGHTS.requests, SCORING_WEIGHTS.requests);
  score += requestsScore;

  // AI Code % score (0-20 points)
  const aiCodePct = user.pctAiCode ?? 0;
  const aiCodeScore = (aiCodePct / MAX_VALUES.aiCodePct) * SCORING_WEIGHTS.aiCodePct;
  score += aiCodeScore;

  // Power features score (0-10 points)
  let powerFeatureCount = 0;
  if (user.isMcpUser) powerFeatureCount++;
  if (user.isRuleCreator) powerFeatureCount++;
  if (user.isRuleUser) powerFeatureCount++;
  if (user.isCommandCreator) powerFeatureCount++;
  if (user.isCommandUser) powerFeatureCount++;
  const powerFeaturesScore = (powerFeatureCount / MAX_VALUES.powerFeatures) * SCORING_WEIGHTS.powerFeatures;
  score += powerFeaturesScore;

  // Tenure score (0-5 points)
  const membershipDays = user.membershipDays ?? 0;
  const tenureScore = Math.min((membershipDays / MAX_VALUES.tenure) * SCORING_WEIGHTS.tenure, SCORING_WEIGHTS.tenure);
  score += tenureScore;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
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

