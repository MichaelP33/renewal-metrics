'use client';

import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePowerUsers } from '@/contexts/PowerUsersContext';
import { applyFilters } from '@/lib/power-users/filter-utils';

interface CohortSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  excludeIds?: string[];
  placeholder?: string;
}

export function CohortSelector({
  value,
  onValueChange,
  excludeIds = [],
  placeholder = 'Select a cohort...',
}: CohortSelectorProps) {
  const { savedCohorts, enhancedUsers } = usePowerUsers();

  // Calculate user count for each cohort
  const cohortsWithCounts = useMemo(() => {
    return savedCohorts.map(cohort => {
      const filteredUsers = applyFilters(enhancedUsers, cohort.filterCriteria);
      return {
        ...cohort,
        userCount: filteredUsers.length,
      };
    });
  }, [savedCohorts, enhancedUsers]);

  // Check if cohort is disabled (already selected)
  const isDisabled = (cohortId: string) => excludeIds.includes(cohortId);

  // Empty state
  if (savedCohorts.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2 border border-dashed rounded-md">
        No cohorts saved yet. Create cohorts in the Master Table first.
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full" aria-label="Select cohort for comparison">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {cohortsWithCounts.map(cohort => (
          <SelectItem
            key={cohort.id}
            value={cohort.id}
            disabled={isDisabled(cohort.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cohort.color }}
                aria-hidden="true"
              />
              {/* Cohort name */}
              <span className="font-medium">{cohort.name}</span>
              {/* User count */}
              <span className="text-xs text-gray-500 ml-auto">
                ({cohort.userCount} {cohort.userCount === 1 ? 'user' : 'users'})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

