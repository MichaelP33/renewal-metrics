'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';

interface DeleteCohortDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cohort: StoredCohort;
}

export function DeleteCohortDialog({
  isOpen,
  onClose,
  onConfirm,
  cohort,
}: DeleteCohortDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Cohort
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this cohort? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: cohort.color }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{cohort.name}</p>
              <p className="text-xs text-gray-500">
                Created {new Date(cohort.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Cohort
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

