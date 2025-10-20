'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
// import { Switch } from '@/components/ui/switch';
// import { MasterUserRecord } from '@/types/power-users';

export interface FilterState {
  searchText: string;
  isMcpUser: boolean | null;
  isRuleCreator: boolean | null;
  isRuleUser: boolean | null;
  isCommandCreator: boolean | null;
  isCommandUser: boolean | null;
  aiLinesMin: string;
  aiLinesMax: string;
  sessionsMin: string;
  sessionsMax: string;
  requestsMin: string;
  requestsMax: string;
}

interface MasterTableFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

const DEBOUNCE_MS = 300;

export function MasterTableFilters({ onFilterChange, searchInputRef }: MasterTableFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    isMcpUser: null,
    isRuleCreator: null,
    isRuleUser: null,
    isCommandCreator: null,
    isCommandUser: null,
    aiLinesMin: '',
    aiLinesMax: '',
    sessionsMin: '',
    sessionsMax: '',
    requestsMin: '',
    requestsMax: '',
  });

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchText);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filters.searchText]);

  // Notify parent when filters change
  useEffect(() => {
    onFilterChange({ ...filters, searchText: debouncedSearch });
  }, [debouncedSearch, filters, onFilterChange]);

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, searchText: value }));
  }, []);

  const handleBooleanToggle = useCallback((field: keyof FilterState, value: boolean | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNumericChange = useCallback((field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickFilter = useCallback((filterType: 'anyPowerFeature' | 'top10Sessions' | 'top10Requests') => {
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
      aiLinesMin: '',
      aiLinesMax: '',
      sessionsMin: '',
      sessionsMax: '',
      requestsMin: '',
      requestsMax: '',
    });
  }, []);

  const hasActiveFilters = filters.searchText || 
    filters.isMcpUser !== null ||
    filters.isRuleCreator !== null ||
    filters.isRuleUser !== null ||
    filters.isCommandCreator !== null ||
    filters.isCommandUser !== null ||
    filters.aiLinesMin ||
    filters.aiLinesMax ||
    filters.sessionsMin ||
    filters.sessionsMax ||
    filters.requestsMin ||
    filters.requestsMax;

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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

