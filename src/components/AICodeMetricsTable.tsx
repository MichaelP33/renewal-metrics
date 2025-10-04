'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AICodeMetricsRow, UserNameData } from '@/types';
import { formatNumber, formatPercentage, formatLinkedInUrl } from '@/lib/ai-code-data-processing';

interface AICodeMetricsTableProps {
  data: AICodeMetricsRow[];
  selectedUsers: Set<string>;
  onSelectionChange: (selectedUsers: Set<string>) => void;
  maxSelection?: number;
  title?: string;
  userNames: Map<string, UserNameData>;
  onNameChange: (userKey: string, nameData: UserNameData) => void;
}

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = 'email' | 'first_name' | 'last_name' | 'total_lines_changed' | 'ai_lines_changed' | 'pct_ai_lines_changed' | 'commit_count';

export const AICodeMetricsTable = React.forwardRef<HTMLDivElement, AICodeMetricsTableProps>(({ 
  data, 
  selectedUsers,
  onSelectionChange,
  maxSelection = 15,
  title = "AI Code Metrics",
  userNames,
  onNameChange
}, ref) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('total_lines_changed');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      const aKey = `${a.user_id}-${a.email}`;
      const bKey = `${b.user_id}-${b.email}`;

      switch (sortColumn) {
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'first_name':
          aValue = (userNames.get(aKey)?.first_name || '').toLowerCase();
          bValue = (userNames.get(bKey)?.first_name || '').toLowerCase();
          break;
        case 'last_name':
          aValue = (userNames.get(aKey)?.last_name || '').toLowerCase();
          bValue = (userNames.get(bKey)?.last_name || '').toLowerCase();
          break;
        case 'total_lines_changed':
          aValue = a.total_lines_changed;
          bValue = b.total_lines_changed;
          break;
        case 'ai_lines_changed':
          aValue = a.ai_lines_changed;
          bValue = b.ai_lines_changed;
          break;
        case 'pct_ai_lines_changed':
          aValue = a.pct_ai_lines_changed;
          bValue = b.pct_ai_lines_changed;
          break;
        case 'commit_count':
          aValue = a.commit_count;
          bValue = b.commit_count;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, userNames]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null -> asc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn('total_lines_changed'); // Reset to default
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection(column === 'email' ? 'asc' : 'desc'); // Default to desc for numeric columns
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }

    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 text-blue-600" />;
    } else if (sortDirection === 'desc') {
      return <ArrowDown className="h-3 w-3 text-blue-600" />;
    }

    return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
  };

  const handleRowSelection = (userKey: string, checked: boolean) => {
    const newSelection = new Set(selectedUsers);
    
    if (checked && newSelection.size < maxSelection) {
      newSelection.add(userKey);
    } else if (!checked) {
      newSelection.delete(userKey);
    }
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select first maxSelection users
      const newSelection = new Set<string>();
      sortedData.slice(0, maxSelection).forEach(user => {
        newSelection.add(`${user.user_id}-${user.email}`);
      });
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(new Set());
    }
  };

  const getUserKey = (user: AICodeMetricsRow): string => {
    return `${user.user_id}-${user.email}`;
  };

  const isAllSelected = selectedUsers.size > 0 && 
    sortedData.slice(0, Math.min(maxSelection, sortedData.length))
      .every(user => selectedUsers.has(getUserKey(user)));

  const isIndeterminate = selectedUsers.size > 0 && !isAllSelected;

  if (data.length === 0) {
    return (
      <Card ref={ref}>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No AI code metrics data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={ref}>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{title}</span>
          </div>
          <div className="text-sm font-normal text-gray-500">
            {selectedUsers.size} of {maxSelection} selected
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {/* Selection column */}
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all users"
                      className={isIndeterminate ? "data-[state=checked]:bg-blue-600" : ""}
                    />
                  </TableHead>
                  
                  {/* Email column */}
                  <TableHead className="min-w-[200px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      <span>Email</span>
                      {getSortIcon('email')}
                    </Button>
                  </TableHead>
                  
                  {/* First Name column */}
                  <TableHead className="min-w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100"
                      onClick={() => handleSort('first_name')}
                    >
                      <span>First Name</span>
                      {getSortIcon('first_name')}
                    </Button>
                  </TableHead>
                  
                  {/* Last Name column */}
                  <TableHead className="min-w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100"
                      onClick={() => handleSort('last_name')}
                    >
                      <span>Last Name</span>
                      {getSortIcon('last_name')}
                    </Button>
                  </TableHead>
                  
                  {/* LinkedIn URL column */}
                  <TableHead className="min-w-[150px]">
                    <span className="font-semibold">LinkedIn</span>
                  </TableHead>
                  
                  {/* Total Lines Changed column */}
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                      onClick={() => handleSort('total_lines_changed')}
                    >
                      <span>Total Lines</span>
                      {getSortIcon('total_lines_changed')}
                    </Button>
                  </TableHead>
                  
                  {/* AI Lines Changed column */}
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                      onClick={() => handleSort('ai_lines_changed')}
                    >
                      <span>AI Lines</span>
                      {getSortIcon('ai_lines_changed')}
                    </Button>
                  </TableHead>
                  
                  {/* AI Percentage column */}
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                      onClick={() => handleSort('pct_ai_lines_changed')}
                    >
                      <span>AI %</span>
                      {getSortIcon('pct_ai_lines_changed')}
                    </Button>
                  </TableHead>
                  
                  {/* Commit Count column */}
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                      onClick={() => handleSort('commit_count')}
                    >
                      <span>Commits</span>
                      {getSortIcon('commit_count')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {sortedData.map((user) => {
                  const userKey = getUserKey(user);
                  const isSelected = selectedUsers.has(userKey);
                  const canSelect = !isSelected && selectedUsers.size < maxSelection;
                  const linkedInInfo = formatLinkedInUrl(user.person_linkedin_url);
                  const nameData = userNames.get(userKey) || { first_name: '', last_name: '' };
                  
                  return (
                    <TableRow 
                      key={userKey} 
                      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleRowSelection(userKey, checked as boolean)}
                          disabled={!canSelect && !isSelected}
                          aria-label={`Select ${user.email}`}
                        />
                      </TableCell>
                      
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      
                      <TableCell>
                        <input
                          type="text"
                          value={nameData.first_name}
                          onChange={(e) => onNameChange(userKey, { ...nameData, first_name: e.target.value })}
                          placeholder="First name"
                          className="w-full px-2 py-1 text-sm border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <input
                          type="text"
                          value={nameData.last_name}
                          onChange={(e) => onNameChange(userKey, { ...nameData, last_name: e.target.value })}
                          placeholder="Last name"
                          className="w-full px-2 py-1 text-sm border-0 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                        />
                      </TableCell>
                      
                      <TableCell>
                        {linkedInInfo.href ? (
                          <a
                            href={linkedInInfo.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <span className="truncate max-w-[120px]">{linkedInInfo.display}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber(user.total_lines_changed)}
                      </TableCell>
                      
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber(user.ai_lines_changed)}
                      </TableCell>
                      
                      <TableCell className="text-right font-mono text-sm font-semibold text-orange-600">
                        {formatPercentage(user.pct_ai_lines_changed, 1)}
                      </TableCell>
                      
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber(user.commit_count)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Table footer info */}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <span>
            Showing {sortedData.length} user{sortedData.length !== 1 ? 's' : ''}
          </span>
          
          <span>
            {selectedUsers.size} selected • Max {maxSelection} users for chart
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

AICodeMetricsTable.displayName = 'AICodeMetricsTable';
