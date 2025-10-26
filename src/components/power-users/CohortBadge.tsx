'use client';

import React from 'react';
import { MoreHorizontal, Edit2, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
      toast.success(`User list for "${cohort.name}" exported`);
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
      
      {/* More actions menu */}
      {showActions && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200"
                aria-label={`Cohort actions for ${cohort.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {users && (
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export User List
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Rename Cohort
                </DropdownMenuItem>
              )}
              {(users || onEdit) && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Cohort
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

