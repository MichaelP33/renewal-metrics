import {
  AICodeMetrics,
  PowerUserFeatures,
  AgentRequests,
  MasterUserRecord,
  normalizeEmail,
} from '@/types/power-users';

/**
 * Aggregates user data from multiple datasets by normalized email
 */
export function aggregateUserData(
  ai?: AICodeMetrics[],
  features?: PowerUserFeatures[],
  agent?: AgentRequests[]
): MasterUserRecord[] {
  const userMap = new Map<string, Partial<MasterUserRecord>>();

  // Process AI Code Metrics
  if (ai) {
    const aiMap = new Map<string, AICodeMetrics>();
    
    // Pre-reduce duplicates within AI dataset (sum numeric fields)
    for (const record of ai) {
      const email = normalizeEmail(record.email);
      const existing = aiMap.get(email);
      
      if (existing) {
        existing.aiLinesChanged += record.aiLinesChanged;
        existing.totalLinesChanged += record.totalLinesChanged;
        existing.commitCount += record.commitCount;
        // Keep max pctAiCode
        if (record.pctAiCode > existing.pctAiCode) {
          existing.pctAiCode = record.pctAiCode;
        }
        // Keep first non-empty linkedinUrl
        if (!existing.linkedinUrl && record.linkedinUrl) {
          existing.linkedinUrl = record.linkedinUrl;
        }
      } else {
        aiMap.set(email, { ...record });
      }
    }

    // Add to master map
    for (const record of aiMap.values()) {
      const email = normalizeEmail(record.email);
      const existing = userMap.get(email);
      
      if (existing) {
        existing.aiLinesChanged = record.aiLinesChanged;
        existing.totalLinesChanged = record.totalLinesChanged;
        existing.pctAiCode = record.pctAiCode;
        existing.commitCount = record.commitCount;
        if (!existing.linkedinUrl && record.linkedinUrl) {
          existing.linkedinUrl = record.linkedinUrl;
        }
        if (!existing.sourceFlags) {
          existing.sourceFlags = { aiCode: false, features: false, agentRequests: false };
        }
        existing.sourceFlags.aiCode = true;
      } else {
        userMap.set(email, {
          email,
          linkedinUrl: record.linkedinUrl,
          aiLinesChanged: record.aiLinesChanged,
          totalLinesChanged: record.totalLinesChanged,
          pctAiCode: record.pctAiCode,
          commitCount: record.commitCount,
          sourceFlags: { aiCode: true, features: false, agentRequests: false },
        });
      }
    }
  }

  // Process Power User Features
  if (features) {
    const featuresMap = new Map<string, PowerUserFeatures>();
    
    // Pre-reduce duplicates within features dataset (max numeric fields)
    for (const record of features) {
      const email = normalizeEmail(record.email);
      const existing = featuresMap.get(email);
      
      if (existing) {
        // OR logic for booleans
        existing.isMcpUser = existing.isMcpUser || record.isMcpUser;
        existing.isRuleCreator = existing.isRuleCreator || record.isRuleCreator;
        existing.isRuleUser = existing.isRuleUser || record.isRuleUser;
        existing.isCommandCreator = existing.isCommandCreator || record.isCommandCreator;
        existing.isCommandUser = existing.isCommandUser || record.isCommandUser;
        // Max for numeric fields
        if ((record.numProductsUsed ?? 0) > (existing.numProductsUsed ?? 0)) {
          existing.numProductsUsed = record.numProductsUsed;
        }
        if ((record.membershipDays ?? 0) > (existing.membershipDays ?? 0)) {
          existing.membershipDays = record.membershipDays;
        }
      } else {
        featuresMap.set(email, { ...record });
      }
    }

    // Add to master map
    for (const record of featuresMap.values()) {
      const email = normalizeEmail(record.email);
      const existing = userMap.get(email);
      
      if (existing) {
        existing.isMcpUser = record.isMcpUser;
        existing.isRuleCreator = record.isRuleCreator;
        existing.isRuleUser = record.isRuleUser;
        existing.isCommandCreator = record.isCommandCreator;
        existing.isCommandUser = record.isCommandUser;
        existing.numProductsUsed = record.numProductsUsed;
        existing.membershipDays = record.membershipDays;
        if (!existing.sourceFlags) {
          existing.sourceFlags = { aiCode: false, features: false, agentRequests: false };
        }
        existing.sourceFlags.features = true;
      } else {
        userMap.set(email, {
          email,
          isMcpUser: record.isMcpUser,
          isRuleCreator: record.isRuleCreator,
          isRuleUser: record.isRuleUser,
          isCommandCreator: record.isCommandCreator,
          isCommandUser: record.isCommandUser,
          numProductsUsed: record.numProductsUsed,
          membershipDays: record.membershipDays,
          sourceFlags: { aiCode: false, features: true, agentRequests: false },
        });
      }
    }
  }

  // Process Agent Requests
  if (agent) {
    const agentMap = new Map<string, AgentRequests>();
    
    // Pre-reduce duplicates within agent dataset (max numeric fields)
    for (const record of agent) {
      const email = normalizeEmail(record.email);
      const existing = agentMap.get(email);
      
      if (existing) {
        // Keep first non-empty firstName/lastName
        if (!existing.firstName && record.firstName) {
          existing.firstName = record.firstName;
        }
        if (!existing.lastName && record.lastName) {
          existing.lastName = record.lastName;
        }
        // Max for numeric fields
        if ((record.totalSessions ?? 0) > (existing.totalSessions ?? 0)) {
          existing.totalSessions = record.totalSessions;
        }
        if ((record.totalRequests ?? 0) > (existing.totalRequests ?? 0)) {
          existing.totalRequests = record.totalRequests;
        }
      } else {
        agentMap.set(email, { ...record });
      }
    }

    // Add to master map
    for (const record of agentMap.values()) {
      const email = normalizeEmail(record.email);
      const existing = userMap.get(email);
      
      if (existing) {
        if (!existing.firstName && record.firstName) {
          existing.firstName = record.firstName;
        }
        if (!existing.lastName && record.lastName) {
          existing.lastName = record.lastName;
        }
        existing.totalSessions = record.totalSessions;
        existing.totalAgentRequests = record.totalRequests;
        if (!existing.sourceFlags) {
          existing.sourceFlags = { aiCode: false, features: false, agentRequests: false };
        }
        existing.sourceFlags!.agentRequests = true;
      } else {
        userMap.set(email, {
          email,
          firstName: record.firstName,
          lastName: record.lastName,
          totalSessions: record.totalSessions,
          totalAgentRequests: record.totalRequests,
          sourceFlags: { aiCode: false, features: false, agentRequests: true },
        });
      }
    }
  }

  // Convert map to array and sort
  const records: MasterUserRecord[] = Array.from(userMap.values()).map(
    (partial): MasterUserRecord => ({
      email: partial.email!,
      firstName: partial.firstName,
      lastName: partial.lastName,
      linkedinUrl: partial.linkedinUrl,
      aiLinesChanged: partial.aiLinesChanged,
      totalLinesChanged: partial.totalLinesChanged,
      pctAiCode: partial.pctAiCode,
      commitCount: partial.commitCount,
      totalSessions: partial.totalSessions,
      totalAgentRequests: partial.totalAgentRequests,
      isMcpUser: partial.isMcpUser,
      isRuleCreator: partial.isRuleCreator,
      isRuleUser: partial.isRuleUser,
      isCommandCreator: partial.isCommandCreator,
      isCommandUser: partial.isCommandUser,
      numProductsUsed: partial.numProductsUsed,
      membershipDays: partial.membershipDays,
      sourceFlags: partial.sourceFlags!,
    })
  );

  // Sort by totalSessions descending, fallback to aiLinesChanged
  records.sort((a, b) => {
    const aSessions = a.totalSessions ?? 0;
    const bSessions = b.totalSessions ?? 0;
    if (aSessions !== bSessions) {
      return bSessions - aSessions;
    }
    const aLines = a.aiLinesChanged ?? 0;
    const bLines = b.aiLinesChanged ?? 0;
    return bLines - aLines;
  });

  return records;
}

