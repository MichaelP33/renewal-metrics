'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CohortSelector } from './CohortSelector';
import { CohortBadge } from './CohortBadge';
import { usePowerUsers } from '@/contexts/PowerUsersContext';
import { applyFilters } from '@/lib/power-users/filter-utils';
import { Info, X } from 'lucide-react';

export function ComparisonBuilder() {
  const {
    savedCohorts,
    selectedCohortIds,
    selectCohortForComparison,
    deselectCohortForComparison,
    clearComparisonCohorts,
    getSelectedCohorts,
    enhancedUsers,
  } = usePowerUsers();

  // Local state for dropdown values (empty string when no selection)
  const [dropdownValues, setDropdownValues] = useState<Record<number, string>>({
    0: '',
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });

  const selectedCohorts = getSelectedCohorts();

  // Calculate user count for each selected cohort
  const cohortsWithCounts = useMemo(() => {
    return selectedCohorts.map(cohort => {
      const filteredUsers = applyFilters(enhancedUsers, cohort.filterCriteria);
      return {
        cohort,
        userCount: filteredUsers.length,
      };
    });
  }, [selectedCohorts, enhancedUsers]);

  const handleSelectCohort = (slotIndex: number, cohortId: string) => {
    if (cohortId) {
      selectCohortForComparison(cohortId);
      // Reset this slot's dropdown
      setDropdownValues(prev => ({ ...prev, [slotIndex]: '' }));
    }
  };

  const handleRemoveCohort = (cohortId: string) => {
    deselectCohortForComparison(cohortId);
  };

  const handleClearAll = () => {
    clearComparisonCohorts();
    setDropdownValues({ 0: '', 1: '', 2: '', 3: '', 4: '', 5: '' });
  };

  const maxReached = selectedCohortIds.length >= 6;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Cohort Comparison Builder
              <div className="relative group">
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                  Select 2-6 cohorts to compare their metrics side by side
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              {selectedCohortIds.length === 0 && 'Select cohorts to compare'}
              {selectedCohortIds.length === 1 && 'Select at least one more cohort to enable comparison'}
              {selectedCohortIds.length >= 2 && (
                <span className="text-green-600 font-medium">
                  {selectedCohortIds.length} of 6 cohorts selected
                </span>
              )}
            </CardDescription>
          </div>
          {selectedCohortIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Cohorts */}
        {cohortsWithCounts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Selected Cohorts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {cohortsWithCounts.map(({ cohort, userCount }) => (
                <CohortBadge
                  key={cohort.id}
                  cohort={cohort}
                  userCount={userCount}
                  onDelete={() => handleRemoveCohort(cohort.id)}
                  showActions={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cohort Selection Slots */}
        {!maxReached && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              {cohortsWithCounts.length === 0 ? 'Select Cohorts' : 'Add More Cohorts'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Show slots based on current selection */}
              {[...Array(Math.min(6 - selectedCohortIds.length, 3))].map((_, index) => (
                <CohortSelector
                  key={index}
                  value={dropdownValues[index] || ''}
                  onValueChange={(cohortId) => handleSelectCohort(index, cohortId)}
                  excludeIds={selectedCohortIds}
                  placeholder={
                    selectedCohortIds.length === 0 && index === 0
                      ? 'Select first cohort...'
                      : selectedCohortIds.length === 1 && index === 0
                      ? 'Select second cohort...'
                      : 'Select a cohort...'
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Info message when max reached */}
        {maxReached && (
          <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-3">
            Maximum of 6 cohorts reached. Remove a cohort to add a different one.
          </div>
        )}

        {/* Empty state when no saved cohorts */}
        {savedCohorts.length === 0 && (
          <div className="text-center py-8 text-gray-500 space-y-2">
            <Info className="h-12 w-12 mx-auto text-gray-400" />
            <p className="font-medium">No cohorts saved yet</p>
            <p className="text-sm">
              Create cohorts in the Master Table by applying filters and clicking &quot;Save as Cohort&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

