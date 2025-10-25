'use client';

import React from 'react';
import { X, Edit2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { StoredCohort } from '@/lib/power-users/cohort-manager';
import { exportCohortUserList } from '@/lib/power-users/cohort-export-utils';
import type { EnhancedMasterUserRecord } from '@/types/power-users';

interface CohortBadgeProps {
  cohort: StoredCohort;
  userCount: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  users?: EnhancedMasterUserRecord[];
}

export function CohortBadge({
  cohort,
  userCount,
  onClick,
  onEdit,
  onDelete,
  showActions = false,
  users,
}: CohortBadgeProps) {
  const handleExport = () => {
    if (users) {
      exportCohortUserList(cohort, users);
    }
  };
  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-150
        ${onClick ? 'cursor-pointer hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${showActions ? 'pr-2' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Color indicator */}
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: cohort.color }}
        aria-label={`Cohort color: ${cohort.color}`}
      />
      
      {/* Cohort name */}
      <span className="text-sm font-medium text-gray-900 flex-1 truncate">
        {cohort.name}
      </span>
      
      {/* User count */}
      <span className="text-xs text-gray-500 shrink-0">
        ({userCount} {userCount === 1 ? 'user' : 'users'})
      </span>
      
      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {users && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  aria-label={`Export cohort: ${cohort.name}`}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-3 w-3 mr-2" />
                  Export User List (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200"
              onClick={onEdit}
              aria-label={`Edit cohort: ${cohort.name}`}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
              onClick={onDelete}
              aria-label={`Delete cohort: ${cohort.name}`}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

