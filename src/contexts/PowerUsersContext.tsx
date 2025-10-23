'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { parseCSV as parseAICode } from '@/lib/power-users/ai-code-parser';
import { parseCSV as parseFeatures } from '@/lib/power-users/power-user-features-parser';
import { parseCSV as parseAgent } from '@/lib/power-users/agent-requests-parser';
import { aggregateUserData } from '@/lib/power-users/aggregator';
import { calculateEngagementScore, calculatePercentiles, segmentUser } from '@/lib/power-users/engagement-score';
import type { MasterUserRecord, EnhancedMasterUserRecord, AICodeMetrics, PowerUserFeatures, AgentRequests } from '@/types/power-users';

const STORAGE_KEY = 'power-users/v1';

interface NameOverride {
  firstName?: string;
  lastName?: string;
}

interface StoredData {
  version: number;
  timestamp: string;
  aiCode: AICodeMetrics[];
  features: PowerUserFeatures[];
  agent: AgentRequests[];
  nameOverrides?: Record<string, NameOverride>;
}

export interface PowerUsersContextValue {
  masterUsers: MasterUserRecord[];
  enhancedUsers: EnhancedMasterUserRecord[];
  uploadStatus: Record<'ai' | 'features' | 'agent', 'idle' | 'parsing' | 'success' | 'error'>;
  uploadDataset: (kind: 'ai' | 'features' | 'agent', file: File) => Promise<void>;
  clearData: () => void;
  cachedTimestamp: string | null;
  hasData: boolean;
  updateUserName: (email: string, firstName: string, lastName: string) => void;
}

const PowerUsersContext = createContext<PowerUsersContextValue | undefined>(undefined);

export function PowerUsersProvider({ children }: { children: React.ReactNode }) {
  const [aiCode, setAiCode] = useState<AICodeMetrics[] | null>(null);
  const [features, setFeatures] = useState<PowerUserFeatures[] | null>(null);
  const [agent, setAgent] = useState<AgentRequests[] | null>(null);
  const [nameOverrides, setNameOverrides] = useState<Record<string, NameOverride>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<'ai' | 'features' | 'agent', 'idle' | 'parsing' | 'success' | 'error'>>({
    ai: 'idle',
    features: 'idle',
    agent: 'idle',
  });
  const [cachedTimestamp, setCachedTimestamp] = useState<string | null>(null);

  // Aggregate master users whenever any dataset changes
  const masterUsers = useMemo(() => {
    const aggregated = aggregateUserData(aiCode ?? [], features ?? [], agent ?? []);
    
    // Apply name overrides
    return aggregated.map(user => {
      const override = nameOverrides[user.email];
      if (override) {
        return {
          ...user,
          firstName: override.firstName !== undefined ? override.firstName : user.firstName,
          lastName: override.lastName !== undefined ? override.lastName : user.lastName,
        };
      }
      return user;
    });
  }, [aiCode, features, agent, nameOverrides]);

  // Compute enhanced users with engagement scores
  const enhancedUsers = useMemo(() => {
    // Calculate scores for all users
    const scores = masterUsers.map(user => calculateEngagementScore(user));
    
    // Calculate percentiles
    const percentiles = calculatePercentiles(scores);
    
    // Create enhanced users
    return masterUsers.map((user, index) => {
      const score = scores[index];
      const percentile = percentiles[index];
      const segment = segmentUser(score);
      
      return {
        ...user,
        engagementScore: score,
        engagementPercentile: percentile,
        segment,
      };
    });
  }, [masterUsers]);

  const hasData = masterUsers.length > 0;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        setAiCode(data.aiCode);
        setFeatures(data.features);
        setAgent(data.agent);
        setNameOverrides(data.nameOverrides ?? {});
        setCachedTimestamp(data.timestamp);
        
        // Update upload status for loaded datasets
        setUploadStatus({
          ai: data.aiCode.length > 0 ? 'success' : 'idle',
          features: data.features.length > 0 ? 'success' : 'idle',
          agent: data.agent.length > 0 ? 'success' : 'idle',
        });
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (aiCode !== null || features !== null || agent !== null) {
      try {
        const data: StoredData = {
          version: 1,
          timestamp: new Date().toISOString(),
          aiCode: aiCode ?? [],
          features: features ?? [],
          agent: agent ?? [],
          nameOverrides,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setCachedTimestamp(data.timestamp);
      } catch (error) {
        console.error('Failed to save data to localStorage:', error);
      }
    }
  }, [aiCode, features, agent, nameOverrides]);

  const uploadDataset = useCallback(async (kind: 'ai' | 'features' | 'agent', file: File) => {
    console.log(`[PowerUsers] Uploading ${kind} file:`, file.name);
    setUploadStatus(prev => ({ ...prev, [kind]: 'parsing' }));

    try {
      const text = await file.text();
      console.log(`[PowerUsers] Read ${kind} file, length:`, text.length);
      
      let parsed: AICodeMetrics[] | PowerUserFeatures[] | AgentRequests[];
      
      if (kind === 'ai') {
        parsed = await parseAICode(text);
        console.log(`[PowerUsers] Parsed ${parsed.length} AI code records`);
        setAiCode(parsed as AICodeMetrics[]);
      } else if (kind === 'features') {
        parsed = await parseFeatures(text);
        console.log(`[PowerUsers] Parsed ${parsed.length} feature records`);
        setFeatures(parsed as PowerUserFeatures[]);
      } else {
        parsed = await parseAgent(text);
        console.log(`[PowerUsers] Parsed ${parsed.length} agent records`);
        setAgent(parsed as AgentRequests[]);
      }

      setUploadStatus(prev => ({ ...prev, [kind]: 'success' }));
      console.log(`[PowerUsers] Successfully uploaded ${kind}`);
    } catch (error) {
      console.error(`[PowerUsers] Failed to parse ${kind} CSV:`, error);
      setUploadStatus(prev => ({ ...prev, [kind]: 'error' }));
      throw error;
    }
  }, []);

  const clearData = useCallback(() => {
    setAiCode(null);
    setFeatures(null);
    setAgent(null);
    setNameOverrides({});
    setUploadStatus({ ai: 'idle', features: 'idle', agent: 'idle' });
    setCachedTimestamp(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, []);

  const updateUserName = useCallback((email: string, firstName: string, lastName: string) => {
    setNameOverrides(prev => ({
      ...prev,
      [email]: {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      },
    }));
  }, []);

  return (
    <PowerUsersContext.Provider
      value={{
        masterUsers,
        enhancedUsers,
        uploadStatus,
        uploadDataset,
        clearData,
        cachedTimestamp,
        hasData,
        updateUserName,
      }}
    >
      {children}
    </PowerUsersContext.Provider>
  );
}

export function usePowerUsers() {
  const context = useContext(PowerUsersContext);
  if (context === undefined) {
    throw new Error('usePowerUsers must be used within a PowerUsersProvider');
  }
  return context;
}

