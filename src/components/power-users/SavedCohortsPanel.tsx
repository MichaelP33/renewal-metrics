'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { CohortBadge } from './CohortBadge';
import { EditCohortDialog } from './EditCohortDialog';
import { DeleteCohortDialog } from './DeleteCohortDialog';
import { usePowerUsers } from '@/contexts/PowerUsersContext';
import type { FilterState } from './MasterTableFilters';
import { applyFilters } from '@/lib/power-users/filter-utils';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';

interface SavedCohortsPanelProps {
  onApplyFilters: (filters: FilterState) => void;
}

export function SavedCohortsPanel({ onApplyFilters }: SavedCohortsPanelProps) {
  const { savedCohorts, enhancedUsers, deleteCohort, updateCohort } = usePowerUsers();
  const [isExpanded, setIsExpanded] = useState(savedCohorts.length > 0);
  const [editingCohort, setEditingCohort] = useState<StoredCohort | null>(null);
  const [deletingCohort, setDeletingCohort] = useState<StoredCohort | null>(null);

  // Calculate user counts for each cohort
  const cohortsWithCounts = useMemo(() => {
    return savedCohorts.map(cohort => {
      const filteredUsers = applyFilters(enhancedUsers, cohort.filterCriteria);
      return {
        cohort,
        userCount: filteredUsers.length,
      };
    });
  }, [savedCohorts, enhancedUsers]);

  // Sort cohorts by created date (newest first)
  const sortedCohorts = useMemo(() => {
    return [...cohortsWithCounts].sort((a, b) => {
      const dateA = new Date(a.cohort.createdAt).getTime();
      const dateB = new Date(b.cohort.createdAt).getTime();
      return dateB - dateA;
    });
  }, [cohortsWithCounts]);

  const handleCohortClick = (cohort: StoredCohort) => {
    onApplyFilters(cohort.filterCriteria);
  };

  const handleEdit = (cohort: StoredCohort) => {
    setEditingCohort(cohort);
  };

  const handleDelete = (cohort: StoredCohort) => {
    setDeletingCohort(cohort);
  };

  const handleConfirmDelete = () => {
    if (deletingCohort) {
      deleteCohort(deletingCohort.id);
      setDeletingCohort(null);
    }
  };

  const handleSaveEdit = (newName: string) => {
    if (editingCohort) {
      updateCohort(editingCohort.id, { name: newName });
      setEditingCohort(null);
    }
  };

  // Auto-expand if cohorts exist
  React.useEffect(() => {
    if (savedCohorts.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [savedCohorts.length, isExpanded]);

  return (
    <div className="space-y-2">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            Saved Cohorts
          </span>
          {savedCohorts.length > 0 && (
            <span className="text-xs text-gray-500">
              ({savedCohorts.length})
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Cohorts list */}
      {isExpanded && (
        <div className="space-y-2 animate-in fade-in duration-200">
          {sortedCohorts.length === 0 ? (
            <div className="text-sm text-gray-500 italic py-4 text-center border border-dashed rounded-md bg-gray-50">
              No saved cohorts yet.
              <br />
              Apply filters and click &apos;Save as Cohort&apos; to create your first cohort.
            </div>
          ) : (
            sortedCohorts.map(({ cohort, userCount }) => (
              <CohortBadge
                key={cohort.id}
                cohort={cohort}
                userCount={userCount}
                onClick={() => handleCohortClick(cohort)}
                onEdit={() => handleEdit(cohort)}
                onDelete={() => handleDelete(cohort)}
                showActions
              />
            ))
          )}
        </div>
      )}

      {/* Edit dialog */}
      {editingCohort && (
        <EditCohortDialog
          isOpen={!!editingCohort}
          onClose={() => setEditingCohort(null)}
          onSave={handleSaveEdit}
          cohort={editingCohort}
          existingCohortNames={savedCohorts
            .filter(c => c.id !== editingCohort.id)
            .map(c => c.name)}
        />
      )}

      {/* Delete confirmation dialog */}
      {deletingCohort && (
        <DeleteCohortDialog
          isOpen={!!deletingCohort}
          onClose={() => setDeletingCohort(null)}
          onConfirm={handleConfirmDelete}
          cohort={deletingCohort}
        />
      )}
    </div>
  );
}

