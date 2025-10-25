'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SaveCohortDialog } from './SaveCohortDialog';
import { SavedCohortsPanel } from './SavedCohortsPanel';
import { CohortWorkflowGuide } from './CohortWorkflowGuide';
import { usePowerUsers } from '@/contexts/PowerUsersContext';
import { applyFilters } from '@/lib/power-users/filter-utils';
import { useDebounce } from '@/hooks/useDebounce';
// import { Switch } from '@/components/ui/switch';
// import { MasterUserRecord } from '@/types/power-users';

export interface FilterState {
  searchText: string;
  isMcpUser: boolean | null;
  isRuleCreator: boolean | null;
  isRuleUser: boolean | null;
  isCommandCreator: boolean | null;
  isCommandUser: boolean | null;
  isPowerUserFilter: ('true' | 'false' | 'unmarked')[];
  aiLinesMin: string;
  aiLinesMax: string;
  sessionsMin: string;
  sessionsMax: string;
  requestsMin: string;
  requestsMax: string;
  engagementScoreMin: string;
  engagementScoreMax: string;
}

interface MasterTableFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  onApplyCohortFilters?: (filters: FilterState) => void;
}

export function MasterTableFilters({ onFilterChange, searchInputRef, onApplyCohortFilters }: MasterTableFiltersProps) {
  const { enhancedUsers, savedCohorts, createAndSaveCohort } = usePowerUsers();
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    isMcpUser: null,
    isRuleCreator: null,
    isRuleUser: null,
    isCommandCreator: null,
    isCommandUser: null,
    isPowerUserFilter: ['true', 'false', 'unmarked'],
    aiLinesMin: '',
    aiLinesMax: '',
    sessionsMin: '',
    sessionsMax: '',
    requestsMin: '',
    requestsMax: '',
    engagementScoreMin: '',
    engagementScoreMax: '',
  });

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Debounce search text and numeric inputs
  const debouncedSearch = useDebounce(filters.searchText, 300);
  const debouncedAiLinesMin = useDebounce(filters.aiLinesMin, 300);
  const debouncedAiLinesMax = useDebounce(filters.aiLinesMax, 300);
  const debouncedSessionsMin = useDebounce(filters.sessionsMin, 300);
  const debouncedSessionsMax = useDebounce(filters.sessionsMax, 300);
  const debouncedRequestsMin = useDebounce(filters.requestsMin, 300);
  const debouncedRequestsMax = useDebounce(filters.requestsMax, 300);
  const debouncedEngagementScoreMin = useDebounce(filters.engagementScoreMin, 300);
  const debouncedEngagementScoreMax = useDebounce(filters.engagementScoreMax, 300);

  // Calculate filtered user count for save dialog with debounced values
  const filteredUserCount = useMemo(() => {
    const debouncedFilters = {
      ...filters,
      searchText: debouncedSearch,
      aiLinesMin: debouncedAiLinesMin,
      aiLinesMax: debouncedAiLinesMax,
      sessionsMin: debouncedSessionsMin,
      sessionsMax: debouncedSessionsMax,
      requestsMin: debouncedRequestsMin,
      requestsMax: debouncedRequestsMax,
      engagementScoreMin: debouncedEngagementScoreMin,
      engagementScoreMax: debouncedEngagementScoreMax,
    };
    return applyFilters(enhancedUsers, debouncedFilters).length;
  }, [
    enhancedUsers,
    filters,
    debouncedSearch,
    debouncedAiLinesMin,
    debouncedAiLinesMax,
    debouncedSessionsMin,
    debouncedSessionsMax,
    debouncedRequestsMin,
    debouncedRequestsMax,
    debouncedEngagementScoreMin,
    debouncedEngagementScoreMax,
  ]);

  // Get existing cohort names for validation
  const existingCohortNames = useMemo(() => {
    return savedCohorts.map(c => c.name);
  }, [savedCohorts]);

  const handleSaveCohort = useCallback((name: string) => {
    createAndSaveCohort(name, filters);
  }, [createAndSaveCohort, filters]);

  const handleApplyCohortFilters = useCallback((cohortFilters: FilterState) => {
    setFilters(cohortFilters);
    if (onApplyCohortFilters) {
      onApplyCohortFilters(cohortFilters);
    }
  }, [onApplyCohortFilters]);

  // Notify parent when filters change (with debounced values)
  useEffect(() => {
    onFilterChange({
      ...filters,
      searchText: debouncedSearch,
      aiLinesMin: debouncedAiLinesMin,
      aiLinesMax: debouncedAiLinesMax,
      sessionsMin: debouncedSessionsMin,
      sessionsMax: debouncedSessionsMax,
      requestsMin: debouncedRequestsMin,
      requestsMax: debouncedRequestsMax,
      engagementScoreMin: debouncedEngagementScoreMin,
      engagementScoreMax: debouncedEngagementScoreMax,
    });
  }, [
    debouncedSearch,
    debouncedAiLinesMin,
    debouncedAiLinesMax,
    debouncedSessionsMin,
    debouncedSessionsMax,
    debouncedRequestsMin,
    debouncedRequestsMax,
    debouncedEngagementScoreMin,
    debouncedEngagementScoreMax,
    filters,
    onFilterChange,
  ]);

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchText: value }));
  }, []);

  const handleBooleanToggle = useCallback((field: keyof FilterState, value: boolean | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNumericChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickFilter = useCallback((filterType: 'anyPowerFeature' | 'top10Sessions' | 'top10Requests' | 'powerUsers' | 'activeUsers' | 'casualUsers' | 'atRiskUsers') => {
    if (filterType === 'anyPowerFeature') {
      setFilters(prev => ({
        ...prev,
        isMcpUser: true,
        isRuleCreator: true,
        isRuleUser: true,
        isCommandCreator: true,
        isCommandUser: true,
      }));
    } else if (filterType === 'top10Sessions') {
      setFilters(prev => ({
        ...prev,
        sessionsMin: '100', // Adjust based on your data
      }));
    } else if (filterType === 'top10Requests') {
      setFilters(prev => ({
        ...prev,
        requestsMin: '100', // Adjust based on your data
      }));
    } else if (filterType === 'powerUsers') {
      setFilters(prev => ({
        ...prev,
        engagementScoreMin: '70',
        engagementScoreMax: '100',
      }));
    } else if (filterType === 'activeUsers') {
      setFilters(prev => ({
        ...prev,
        engagementScoreMin: '50',
        engagementScoreMax: '69',
      }));
    } else if (filterType === 'casualUsers') {
      setFilters(prev => ({
        ...prev,
        engagementScoreMin: '30',
        engagementScoreMax: '49',
      }));
    } else if (filterType === 'atRiskUsers') {
      setFilters(prev => ({
        ...prev,
        engagementScoreMin: '0',
        engagementScoreMax: '29',
      }));
    }
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters({
      searchText: '',
      isMcpUser: null,
      isRuleCreator: null,
      isRuleUser: null,
      isCommandCreator: null,
      isCommandUser: null,
      isPowerUserFilter: ['true', 'false', 'unmarked'],
      aiLinesMin: '',
      aiLinesMax: '',
      sessionsMin: '',
      sessionsMax: '',
      requestsMin: '',
      requestsMax: '',
      engagementScoreMin: '',
      engagementScoreMax: '',
    });
  }, []);

  const hasActiveFilters = filters.searchText || 
    filters.isMcpUser !== null ||
    filters.isRuleCreator !== null ||
    filters.isRuleUser !== null ||
    filters.isCommandCreator !== null ||
    filters.isCommandUser !== null ||
    filters.isPowerUserFilter.length < 3 ||
    filters.aiLinesMin ||
    filters.aiLinesMax ||
    filters.sessionsMin ||
    filters.sessionsMax ||
    filters.requestsMin ||
    filters.requestsMax ||
    filters.engagementScoreMin ||
    filters.engagementScoreMax;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Cohort Workflow Guide */}
        <CohortWorkflowGuide />
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium flex items-center space-x-2">
            <Search className="h-3 w-3" />
            <span>Search</span>
          </Label>
          <Input
            ref={searchInputRef}
            id="search"
            placeholder="Search by email, first name, or last name..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search users by email, first name, or last name"
          />
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('anyPowerFeature')}
            >
              Has Any Power Feature
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('top10Sessions')}
            >
              Top 10 Sessions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('top10Requests')}
            >
              Top 10 Requests
            </Button>
          </div>
        </div>

        {/* Engagement Score Quick Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Engagement Segments</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('powerUsers')}
              className="bg-green-50 hover:bg-green-100 text-green-800 border-green-300"
            >
              Power Users (70+)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('activeUsers')}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300"
            >
              Active Users (50-69)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('casualUsers')}
              className="bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-300"
            >
              Casual Users (30-49)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter('atRiskUsers')}
              className="bg-red-50 hover:bg-red-100 text-red-800 border-red-300"
            >
              At-Risk (&lt;30)
            </Button>
          </div>
        </div>

        {/* Save as Cohort Button */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="w-full bg-[#f54e00] hover:bg-[#e04800] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Cohort
            </Button>
          </div>
        )}

        {/* Boolean Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Power Features</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="mcp-user" className="text-sm font-normal cursor-pointer" aria-label="Filter by MCP User status">
                MCP User
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={filters.isMcpUser === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isMcpUser', filters.isMcpUser === false ? null : false)}
                >
                  No
                </Button>
                <Button
                  variant={filters.isMcpUser === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isMcpUser', filters.isMcpUser === true ? null : true)}
                >
                  Yes
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="rule-creator" className="text-sm font-normal cursor-pointer" aria-label="Filter by Rule Creator status">
                Rule Creator
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={filters.isRuleCreator === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isRuleCreator', filters.isRuleCreator === false ? null : false)}
                >
                  No
                </Button>
                <Button
                  variant={filters.isRuleCreator === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isRuleCreator', filters.isRuleCreator === true ? null : true)}
                >
                  Yes
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="rule-user" className="text-sm font-normal cursor-pointer" aria-label="Filter by Rule User status">
                Rule User
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={filters.isRuleUser === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isRuleUser', filters.isRuleUser === false ? null : false)}
                >
                  No
                </Button>
                <Button
                  variant={filters.isRuleUser === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isRuleUser', filters.isRuleUser === true ? null : true)}
                >
                  Yes
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="command-creator" className="text-sm font-normal cursor-pointer" aria-label="Filter by Command Creator status">
                Command Creator
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={filters.isCommandCreator === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isCommandCreator', filters.isCommandCreator === false ? null : false)}
                >
                  No
                </Button>
                <Button
                  variant={filters.isCommandCreator === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isCommandCreator', filters.isCommandCreator === true ? null : true)}
                >
                  Yes
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="command-user" className="text-sm font-normal cursor-pointer" aria-label="Filter by Command User status">
                Command User
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant={filters.isCommandUser === false ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isCommandUser', filters.isCommandUser === false ? null : false)}
                >
                  No
                </Button>
                <Button
                  variant={filters.isCommandUser === true ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleBooleanToggle('isCommandUser', filters.isCommandUser === true ? null : true)}
                >
                  Yes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Numeric Range Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Numeric Ranges</Label>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ai-lines-min" className="text-xs text-gray-600">
                AI Lines Changed
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="ai-lines-min"
                  type="number"
                  placeholder="Min"
                  value={filters.aiLinesMin}
                  onChange={(e) => handleNumericChange('aiLinesMin', e.target.value)}
                  className="text-sm"
                />
                <span className="text-gray-400">-</span>
                <Input
                  id="ai-lines-max"
                  type="number"
                  placeholder="Max"
                  value={filters.aiLinesMax}
                  onChange={(e) => handleNumericChange('aiLinesMax', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessions-min" className="text-xs text-gray-600">
                Total Sessions
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="sessions-min"
                  type="number"
                  placeholder="Min"
                  value={filters.sessionsMin}
                  onChange={(e) => handleNumericChange('sessionsMin', e.target.value)}
                  className="text-sm"
                />
                <span className="text-gray-400">-</span>
                <Input
                  id="sessions-max"
                  type="number"
                  placeholder="Max"
                  value={filters.sessionsMax}
                  onChange={(e) => handleNumericChange('sessionsMax', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requests-min" className="text-xs text-gray-600">
                Agent Requests
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="requests-min"
                  type="number"
                  placeholder="Min"
                  value={filters.requestsMin}
                  onChange={(e) => handleNumericChange('requestsMin', e.target.value)}
                  className="text-sm"
                />
                <span className="text-gray-400">-</span>
                <Input
                  id="requests-max"
                  type="number"
                  placeholder="Max"
                  value={filters.requestsMax}
                  onChange={(e) => handleNumericChange('requestsMax', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="engagement-score-min" className="text-xs text-gray-600">
                Engagement Score
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="engagement-score-min"
                  type="number"
                  placeholder="Min"
                  min="0"
                  max="100"
                  value={filters.engagementScoreMin}
                  onChange={(e) => handleNumericChange('engagementScoreMin', e.target.value)}
                  className="text-sm"
                />
                <span className="text-gray-400">-</span>
                <Input
                  id="engagement-score-max"
                  type="number"
                  placeholder="Max"
                  min="0"
                  max="100"
                  value={filters.engagementScoreMax}
                  onChange={(e) => handleNumericChange('engagementScoreMax', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Power User Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Power User Status</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="power-users-filter"
                checked={filters.isPowerUserFilter.includes('true')}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    isPowerUserFilter: checked
                      ? [...prev.isPowerUserFilter.filter(v => v !== 'true'), 'true']
                      : prev.isPowerUserFilter.filter(v => v !== 'true')
                  }));
                }}
              />
              <Label htmlFor="power-users-filter" className="text-sm font-normal cursor-pointer">
                Power Users
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="non-power-users-filter"
                checked={filters.isPowerUserFilter.includes('false')}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    isPowerUserFilter: checked
                      ? [...prev.isPowerUserFilter.filter(v => v !== 'false'), 'false']
                      : prev.isPowerUserFilter.filter(v => v !== 'false')
                  }));
                }}
              />
              <Label htmlFor="non-power-users-filter" className="text-sm font-normal cursor-pointer">
                Not Power Users
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="unmarked-filter"
                checked={filters.isPowerUserFilter.includes('unmarked')}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    isPowerUserFilter: checked
                      ? [...prev.isPowerUserFilter.filter(v => v !== 'unmarked'), 'unmarked']
                      : prev.isPowerUserFilter.filter(v => v !== 'unmarked')
                  }));
                }}
              />
              <Label htmlFor="unmarked-filter" className="text-sm font-normal cursor-pointer">
                Unmarked/Unclassified
              </Label>
            </div>
          </div>
        </div>

        {/* Saved Cohorts Panel */}
        <div className="pt-4 border-t">
          <SavedCohortsPanel onApplyFilters={handleApplyCohortFilters} />
        </div>
      </CardContent>

      {/* Save Cohort Dialog */}
      <SaveCohortDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveCohort}
        currentFilters={filters}
        userCount={filteredUserCount}
        existingCohortNames={existingCohortNames}
      />
    </Card>
  );
}

