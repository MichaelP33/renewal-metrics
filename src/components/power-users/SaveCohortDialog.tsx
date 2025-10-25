'use client';

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FilterState } from './MasterTableFilters';
import { getFilterSummary } from '@/lib/power-users/filter-utils';

interface SaveCohortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentFilters: FilterState;
  userCount: number;
  existingCohortNames: string[];
}

export function SaveCohortDialog({
  isOpen,
  onClose,
  onSave,
  currentFilters,
  userCount,
  existingCohortNames,
}: SaveCohortDialogProps) {
  const [cohortName, setCohortName] = useState('');
  const [error, setError] = useState('');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCohortName('');
      setError('');
    }
  }, [isOpen]);

  const filterSummary = getFilterSummary(currentFilters);

  const handleSave = () => {
    // Validation
    const trimmedName = cohortName.trim();
    
    if (!trimmedName) {
      setError('Cohort name is required');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Cohort name must be 50 characters or less');
      return;
    }

    if (existingCohortNames.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A cohort with this name already exists');
      return;
    }

    // Save the cohort
    onSave(trimmedName);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save as Cohort
          </DialogTitle>
          <DialogDescription>
            Save your current filters as a named cohort for quick access later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Cohort name input */}
          <div className="space-y-2">
            <Label htmlFor="cohort-name">Cohort Name</Label>
            <Input
              id="cohort-name"
              placeholder="e.g., Power Users, Q4 Actives"
              value={cohortName}
              onChange={(e) => {
                setCohortName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              maxLength={50}
              aria-invalid={!!error}
              aria-describedby={error ? 'cohort-name-error' : undefined}
            />
            {error && (
              <p id="cohort-name-error" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Filter preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="bg-gray-50 border rounded-md p-3 min-h-[80px] max-h-[120px] overflow-y-auto">
              {filterSummary.length > 0 ? (
                <ul className="space-y-1">
                  {filterSummary.map((filter, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {filter}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No filters active</p>
              )}
            </div>
          </div>

          {/* User count preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Matching Users</Label>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm font-medium text-blue-900">
                {userCount} {userCount === 1 ? 'user' : 'users'} will be included in this cohort
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!!error || !cohortName.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Save Cohort
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

