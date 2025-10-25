'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { parseCSV as parseAICode } from '@/lib/power-users/ai-code-parser';
import { parseCSV as parseFeatures } from '@/lib/power-users/power-user-features-parser';
import { parseCSV as parseAgent } from '@/lib/power-users/agent-requests-parser';
import { aggregateUserData } from '@/lib/power-users/aggregator';
import { calculateEngagementScore, calculatePercentiles, segmentUser } from '@/lib/power-users/engagement-score';
import type { MasterUserRecord, EnhancedMasterUserRecord, AICodeMetrics, PowerUserFeatures, AgentRequests } from '@/types/power-users';
import { FilterState } from '@/components/power-users/MasterTableFilters';
import * as CohortManager from '@/lib/power-users/cohort-manager';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';
import { calculateMultiCohortStats, type MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';

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
  powerUserFlags?: Record<string, boolean>;
  selectedUsers?: string[];
}

export interface PowerUsersContextValue {
  masterUsers: MasterUserRecord[];
  enhancedUsers: EnhancedMasterUserRecord[];
  filteredEnhancedUsers: EnhancedMasterUserRecord[];
  uploadStatus: Record<'ai' | 'features' | 'agent', 'idle' | 'parsing' | 'success' | 'error'>;
  uploadDataset: (kind: 'ai' | 'features' | 'agent', file: File) => Promise<void>;
  clearData: () => void;
  cachedTimestamp: string | null;
  hasData: boolean;
  updateUserName: (email: string, firstName: string, lastName: string) => void;
  selectedUserEmails: Set<string>;
  toggleUserSelection: (email: string) => void;
  clearSelection: () => void;
  selectAllUsers: (emails: string[]) => void;
  togglePowerUser: (email: string) => void;
  setPowerUsers: (emails: string[], isPowerUser: boolean | undefined) => void;
  powerUserCount: number;
  nonPowerUserCount: number;
  
  // Cohort management
  savedCohorts: StoredCohort[];
  selectedCohortIds: string[];
  createAndSaveCohort: (name: string, filterCriteria: FilterState) => StoredCohort;
  deleteCohort: (id: string) => void;
  updateCohort: (id: string, updates: Partial<StoredCohort>) => void;
  selectCohortForComparison: (cohortId: string) => void;
  deselectCohortForComparison: (cohortId: string) => void;
  clearComparisonCohorts: () => void;
  getSelectedCohorts: () => StoredCohort[];
  getMultiCohortStats: (cohortIds: string[]) => MultiCohortStats | null;
}

const PowerUsersContext = createContext<PowerUsersContextValue | undefined>(undefined);

export function PowerUsersProvider({ children }: { children: React.ReactNode }) {
  const [aiCode, setAiCode] = useState<AICodeMetrics[] | null>(null);
  const [features, setFeatures] = useState<PowerUserFeatures[] | null>(null);
  const [agent, setAgent] = useState<AgentRequests[] | null>(null);
  const [nameOverrides, setNameOverrides] = useState<Record<string, NameOverride>>({});
  const [powerUserFlags, setPowerUserFlags] = useState<Record<string, boolean>>({});
  const [selectedUserEmails, setSelectedUserEmails] = useState<Set<string>>(new Set());
  const [uploadStatus, setUploadStatus] = useState<Record<'ai' | 'features' | 'agent', 'idle' | 'parsing' | 'success' | 'error'>>({
    ai: 'idle',
    features: 'idle',
    agent: 'idle',
  });
  const [cachedTimestamp, setCachedTimestamp] = useState<string | null>(null);
  const [savedCohorts, setSavedCohorts] = useState<StoredCohort[]>([]);
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);

  // Aggregate master users whenever any dataset changes
  const masterUsers = useMemo(() => {
    const aggregated = aggregateUserData(aiCode ?? [], features ?? [], agent ?? []);
    
    // Apply name overrides and power user flags
    return aggregated.map(user => {
      const override = nameOverrides[user.email];
      const isPowerUser = powerUserFlags[user.email];
      
      return {
        ...user,
        firstName: override?.firstName !== undefined ? override.firstName : user.firstName,
        lastName: override?.lastName !== undefined ? override.lastName : user.lastName,
        isPowerUser: isPowerUser,
      };
    });
  }, [aiCode, features, agent, nameOverrides, powerUserFlags]);

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

  // Compute filtered enhanced users based on selection
  const filteredEnhancedUsers = useMemo(() => {
    if (selectedUserEmails.size === 0) {
      return enhancedUsers;
    }
    return enhancedUsers.filter(user => selectedUserEmails.has(user.email));
  }, [enhancedUsers, selectedUserEmails]);

  const hasData = masterUsers.length > 0;

  const powerUserCount = useMemo(() => 
    masterUsers.filter(u => u.isPowerUser === true).length, 
    [masterUsers]
  );

  const nonPowerUserCount = useMemo(() => 
    masterUsers.filter(u => u.isPowerUser === false).length, 
    [masterUsers]
  );

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
        setPowerUserFlags(data.powerUserFlags ?? {});
        setCachedTimestamp(data.timestamp);
        
        // Load selected users
        if (data.selectedUsers && data.selectedUsers.length > 0) {
          setSelectedUserEmails(new Set(data.selectedUsers));
        }
        
        // Update upload status for loaded datasets
        setUploadStatus({
          ai: data.aiCode.length > 0 ? 'success' : 'idle',
          features: data.features.length > 0 ? 'success' : 'idle',
          agent: data.agent.length > 0 ? 'success' : 'idle',
        });
      }
      
      // Load saved cohorts
      const cohorts = CohortManager.loadCohorts();
      setSavedCohorts(cohorts);
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
          powerUserFlags,
          selectedUsers: Array.from(selectedUserEmails),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setCachedTimestamp(data.timestamp);
      } catch (error) {
        console.error('Failed to save data to localStorage:', error);
      }
    }
  }, [aiCode, features, agent, nameOverrides, powerUserFlags, selectedUserEmails]);

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
    setPowerUserFlags({});
    setSelectedUserEmails(new Set());
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

  const toggleUserSelection = useCallback((email: string) => {
    setSelectedUserEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUserEmails(new Set());
  }, []);

  const selectAllUsers = useCallback((emails: string[]) => {
    setSelectedUserEmails(new Set(emails));
  }, []);

  const togglePowerUser = useCallback((email: string) => {
    setPowerUserFlags(prev => {
      const next = { ...prev };
      if (next[email] === true) {
        next[email] = false;
      } else if (next[email] === false) {
        delete next[email]; // Remove to save space
      } else {
        next[email] = true;
      }
      return next;
    });
  }, []);

  const setPowerUsers = useCallback((emails: string[], isPowerUser: boolean | undefined) => {
    setPowerUserFlags(prev => {
      const next = { ...prev };
      for (const email of emails) {
        if (isPowerUser === undefined) {
          delete next[email];
        } else {
          next[email] = isPowerUser;
        }
      }
      return next;
    });
  }, []);

  // Cohort management functions
  const createAndSaveCohort = useCallback((name: string, filterCriteria: FilterState) => {
    const cohort = CohortManager.createCohort(name, filterCriteria);
    CohortManager.saveCohort(cohort);
    setSavedCohorts(CohortManager.loadCohorts());
    return cohort;
  }, []);

  const deleteCohortHandler = useCallback((id: string) => {
    CohortManager.deleteCohort(id);
    setSavedCohorts(CohortManager.loadCohorts());
    setSelectedCohortIds(prev => prev.filter(cid => cid !== id));
  }, []);

  const updateCohortHandler = useCallback((id: string, updates: Partial<StoredCohort>) => {
    CohortManager.updateCohort(id, updates);
    setSavedCohorts(CohortManager.loadCohorts());
  }, []);

  const selectCohortForComparison = useCallback((cohortId: string) => {
    setSelectedCohortIds(prev => {
      if (prev.includes(cohortId)) return prev;
      if (prev.length >= 6) return prev; // Max 6 cohorts
      return [...prev, cohortId];
    });
  }, []);

  const deselectCohortForComparison = useCallback((cohortId: string) => {
    setSelectedCohortIds(prev => prev.filter(id => id !== cohortId));
  }, []);

  const clearComparisonCohorts = useCallback(() => {
    setSelectedCohortIds([]);
  }, []);

  const getSelectedCohorts = useCallback(() => {
    return selectedCohortIds
      .map(id => savedCohorts.find(c => c.id === id))
      .filter((c): c is StoredCohort => c !== undefined);
  }, [selectedCohortIds, savedCohorts]);

  const getMultiCohortStats = useCallback((cohortIds: string[]) => {
    if (cohortIds.length < 2) return null;
    
    const cohorts = cohortIds
      .map(id => savedCohorts.find(c => c.id === id))
      .filter((c): c is StoredCohort => c !== undefined);
    
    if (cohorts.length < 2) return null;
    
    return calculateMultiCohortStats(enhancedUsers, cohorts);
  }, [enhancedUsers, savedCohorts]);

  return (
    <PowerUsersContext.Provider
      value={{
        masterUsers,
        enhancedUsers,
        filteredEnhancedUsers,
        uploadStatus,
        uploadDataset,
        clearData,
        cachedTimestamp,
        hasData,
        updateUserName,
        selectedUserEmails,
        toggleUserSelection,
        clearSelection,
        selectAllUsers,
        togglePowerUser,
        setPowerUsers,
        powerUserCount,
        nonPowerUserCount,
        savedCohorts,
        selectedCohortIds,
        createAndSaveCohort,
        deleteCohort: deleteCohortHandler,
        updateCohort: updateCohortHandler,
        selectCohortForComparison,
        deselectCohortForComparison,
        clearComparisonCohorts,
        getSelectedCohorts,
        getMultiCohortStats,
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

