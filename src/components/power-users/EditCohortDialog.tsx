'use client';

import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
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
import type { StoredCohort } from '@/lib/power-users/cohort-manager';

interface EditCohortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  cohort: StoredCohort;
  existingCohortNames: string[];
}

export function EditCohortDialog({
  isOpen,
  onClose,
  onSave,
  cohort,
  existingCohortNames,
}: EditCohortDialogProps) {
  const [cohortName, setCohortName] = useState(cohort.name);
  const [error, setError] = useState('');

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setCohortName(cohort.name);
      setError('');
    }
  }, [isOpen, cohort.name]);

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

    if (trimmedName === cohort.name) {
      // No change
      onClose();
      return;
    }

    if (existingCohortNames.some(name => name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A cohort with this name already exists');
      return;
    }

    // Save the cohort
    onSave(trimmedName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !error) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Rename Cohort
          </DialogTitle>
          <DialogDescription>
            Change the name of your cohort.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-cohort-name">Cohort Name</Label>
            <Input
              id="edit-cohort-name"
              placeholder="Enter cohort name"
              value={cohortName}
              onChange={(e) => {
                setCohortName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              maxLength={50}
              aria-invalid={!!error}
              aria-describedby={error ? 'edit-cohort-name-error' : undefined}
            />
            {error && (
              <p id="edit-cohort-name-error" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!!error || !cohortName.trim()}>
            <Edit2 className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

