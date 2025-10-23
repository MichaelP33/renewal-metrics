'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, ExternalLink, Eye, ChevronLeft, ChevronRight, Edit2, Check, X, XCircle } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MasterUserRecord, EnhancedMasterUserRecord } from '@/types/power-users';
import { exportCSV } from '@/lib/export-utils';
import { FilterState } from './MasterTableFilters';
import { UserDetailDrawer } from './UserDetailDrawer';
import { usePowerUsers } from '@/contexts/PowerUsersContext';
import { Input } from '@/components/ui/input';

interface MasterTableProps {
  rows: MasterUserRecord[] | EnhancedMasterUserRecord[];
  filters?: FilterState;
}

type SortColumn = 
  | 'email' 
  | 'firstName' 
  | 'lastName' 
  | 'aiLinesChanged' 
  | 'totalLinesChanged' 
  | 'pctAiCode' 
  | 'commitCount'
  | 'totalSessions'
  | 'totalAgentRequests'
  | 'isMcpUser'
  | 'isRuleCreator'
  | 'isRuleUser'
  | 'isCommandCreator'
  | 'isCommandUser'
  | 'numProductsUsed'
  | 'membershipDays'
  | 'engagementScore'
  | 'engagementPercentile'
  | 'segment';

type SortDirection = 'asc' | 'desc' | null;

interface ColumnVisibility {
  email: boolean;
  firstName: boolean;
  lastName: boolean;
  linkedinUrl: boolean;
  aiLinesChanged: boolean;
  totalLinesChanged: boolean;
  pctAiCode: boolean;
  commitCount: boolean;
  totalSessions: boolean;
  totalAgentRequests: boolean;
  isMcpUser: boolean;
  isRuleCreator: boolean;
  isRuleUser: boolean;
  isCommandCreator: boolean;
  isCommandUser: boolean;
  numProductsUsed: boolean;
  membershipDays: boolean;
  engagementScore: boolean;
  engagementPercentile: boolean;
  segment: boolean;
}

const ROWS_PER_PAGE = 50;

export function MasterTable({ rows, filters }: MasterTableProps) {
  const { updateUserName, selectedUserEmails, toggleUserSelection, clearSelection, selectAllUsers } = usePowerUsers();
  const [sortColumn, setSortColumn] = useState<SortColumn>('email');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<MasterUserRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ email: string; field: 'firstName' | 'lastName' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    email: true,
    firstName: true,
    lastName: true,
    linkedinUrl: true,
    aiLinesChanged: true,
    totalLinesChanged: true,
    pctAiCode: true,
    commitCount: true,
    totalSessions: true,
    totalAgentRequests: true,
    isMcpUser: true,
    isRuleCreator: true,
    isRuleUser: true,
    isCommandCreator: true,
    isCommandUser: true,
    numProductsUsed: true,
    membershipDays: true,
    engagementScore: false,
    engagementPercentile: false,
    segment: false,
  });

  // Reset pagination when data changes to ensure fresh render
  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  // Force remount when data reference changes to avoid stale memoized paths
  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    setDataVersion((v) => v + 1);
  }, [rows]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!filters) return rows;

    return rows.filter(row => {
      // Text search
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesEmail = row.email.toLowerCase().includes(searchLower);
        const matchesFirstName = row.firstName?.toLowerCase().includes(searchLower);
        const matchesLastName = row.lastName?.toLowerCase().includes(searchLower);
        
        if (!matchesEmail && !matchesFirstName && !matchesLastName) {
          return false;
        }
      }

      // Boolean filters (AND logic - all selected filters must match)
      if (filters.isMcpUser !== null && row.isMcpUser !== filters.isMcpUser) {
        return false;
      }
      if (filters.isRuleCreator !== null && row.isRuleCreator !== filters.isRuleCreator) {
        return false;
      }
      if (filters.isRuleUser !== null && row.isRuleUser !== filters.isRuleUser) {
        return false;
      }
      if (filters.isCommandCreator !== null && row.isCommandCreator !== filters.isCommandCreator) {
        return false;
      }
      if (filters.isCommandUser !== null && row.isCommandUser !== filters.isCommandUser) {
        return false;
      }

      // Numeric range filters
      if (filters.aiLinesMin && (row.aiLinesChanged ?? 0) < Number(filters.aiLinesMin)) {
        return false;
      }
      if (filters.aiLinesMax && (row.aiLinesChanged ?? 0) > Number(filters.aiLinesMax)) {
        return false;
      }
      if (filters.sessionsMin && (row.totalSessions ?? 0) < Number(filters.sessionsMin)) {
        return false;
      }
      if (filters.sessionsMax && (row.totalSessions ?? 0) > Number(filters.sessionsMax)) {
        return false;
      }
      if (filters.requestsMin && (row.totalAgentRequests ?? 0) < Number(filters.requestsMin)) {
        return false;
      }
      if (filters.requestsMax && (row.totalAgentRequests ?? 0) > Number(filters.requestsMax)) {
        return false;
      }

      return true;
    });
  }, [rows, filters]);

  // Handle select all checkbox state
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      selectAllUsers(filteredData.map(row => row.email));
    } else {
      clearSelection();
    }
  }, [filteredData, selectAllUsers, clearSelection]);

  // Check if all visible rows are selected
  const allSelected = useMemo(() => {
    if (filteredData.length === 0) return false;
    return filteredData.every(row => selectedUserEmails.has(row.email));
  }, [filteredData, selectedUserEmails]);

  // Check if some rows are selected
  const someSelected = useMemo(() => {
    return filteredData.some(row => selectedUserEmails.has(row.email));
  }, [filteredData, selectedUserEmails]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue: number | string | boolean | undefined;
      let bValue: number | string | boolean | undefined;

      switch (sortColumn) {
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'firstName':
          aValue = (a.firstName || '').toLowerCase();
          bValue = (b.firstName || '').toLowerCase();
          break;
        case 'lastName':
          aValue = (a.lastName || '').toLowerCase();
          bValue = (b.lastName || '').toLowerCase();
          break;
        case 'aiLinesChanged':
          aValue = a.aiLinesChanged ?? 0;
          bValue = b.aiLinesChanged ?? 0;
          break;
        case 'totalLinesChanged':
          aValue = a.totalLinesChanged ?? 0;
          bValue = b.totalLinesChanged ?? 0;
          break;
        case 'pctAiCode':
          aValue = a.pctAiCode ?? 0;
          bValue = b.pctAiCode ?? 0;
          break;
        case 'commitCount':
          aValue = a.commitCount ?? 0;
          bValue = b.commitCount ?? 0;
          break;
        case 'totalSessions':
          aValue = a.totalSessions ?? 0;
          bValue = b.totalSessions ?? 0;
          break;
        case 'totalAgentRequests':
          aValue = a.totalAgentRequests ?? 0;
          bValue = b.totalAgentRequests ?? 0;
          break;
        case 'isMcpUser':
          aValue = a.isMcpUser ?? false;
          bValue = b.isMcpUser ?? false;
          break;
        case 'isRuleCreator':
          aValue = a.isRuleCreator ?? false;
          bValue = b.isRuleCreator ?? false;
          break;
        case 'isRuleUser':
          aValue = a.isRuleUser ?? false;
          bValue = b.isRuleUser ?? false;
          break;
        case 'isCommandCreator':
          aValue = a.isCommandCreator ?? false;
          bValue = b.isCommandCreator ?? false;
          break;
        case 'isCommandUser':
          aValue = a.isCommandUser ?? false;
          bValue = b.isCommandUser ?? false;
          break;
        case 'numProductsUsed':
          aValue = a.numProductsUsed ?? 0;
          bValue = b.numProductsUsed ?? 0;
          break;
        case 'membershipDays':
          aValue = a.membershipDays ?? 0;
          bValue = b.membershipDays ?? 0;
          break;
        case 'engagementScore':
          aValue = (a as EnhancedMasterUserRecord).engagementScore ?? 0;
          bValue = (b as EnhancedMasterUserRecord).engagementScore ?? 0;
          break;
        case 'engagementPercentile':
          aValue = (a as EnhancedMasterUserRecord).engagementPercentile ?? 0;
          bValue = (b as EnhancedMasterUserRecord).engagementPercentile ?? 0;
          break;
        case 'segment':
          aValue = (a as EnhancedMasterUserRecord).segment || '';
          bValue = (b as EnhancedMasterUserRecord).segment || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedData.slice(start, start + ROWS_PER_PAGE);
  }, [sortedData, currentPage]);

  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn('email');
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortColumn, sortDirection]);

  const getSortIcon = useCallback((column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 text-blue-600" />;
    } else if (sortDirection === 'desc') {
      return <ArrowDown className="h-3 w-3 text-blue-600" />;
    }
    return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
  }, [sortColumn, sortDirection]);

  const handleStartEdit = useCallback((email: string, field: 'firstName' | 'lastName', currentValue: string) => {
    setEditingCell({ email, field });
    setEditValue(currentValue);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingCell) return;
    
    const user = rows.find(r => r.email === editingCell.email);
    if (!user) return;
    
    if (editingCell.field === 'firstName') {
      updateUserName(editingCell.email, editValue, user.lastName || '');
    } else {
      updateUserName(editingCell.email, user.firstName || '', editValue);
    }
    
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, rows, updateUserName]);

  const handleExportCSV = useCallback(() => {
    if (filteredData.length === 0) return;

    // Build headers from visible columns
    const headers: string[] = [];
    if (columnVisibility.email) headers.push('Email');
    if (columnVisibility.firstName) headers.push('First Name');
    if (columnVisibility.lastName) headers.push('Last Name');
    if (columnVisibility.linkedinUrl) headers.push('LinkedIn URL');
    if (columnVisibility.aiLinesChanged) headers.push('AI Lines Changed');
    if (columnVisibility.totalLinesChanged) headers.push('Total Lines Changed');
    if (columnVisibility.pctAiCode) headers.push('AI %');
    if (columnVisibility.commitCount) headers.push('Commits');
    if (columnVisibility.totalSessions) headers.push('Total Sessions');
    if (columnVisibility.totalAgentRequests) headers.push('Total Agent Requests');
    if (columnVisibility.isMcpUser) headers.push('MCP User');
    if (columnVisibility.isRuleCreator) headers.push('Rule Creator');
    if (columnVisibility.isRuleUser) headers.push('Rule User');
    if (columnVisibility.isCommandCreator) headers.push('Command Creator');
    if (columnVisibility.isCommandUser) headers.push('Command User');
    if (columnVisibility.numProductsUsed) headers.push('Products Used');
    if (columnVisibility.membershipDays) headers.push('Membership Days');
    if (columnVisibility.engagementScore) headers.push('Engagement Score');
    if (columnVisibility.engagementPercentile) headers.push('Engagement Percentile');
    if (columnVisibility.segment) headers.push('Segment');

    // Build rows
    const csvRows = filteredData.map(row => {
      const values: string[] = [];
      if (columnVisibility.email) values.push(row.email);
      if (columnVisibility.firstName) values.push(row.firstName || '');
      if (columnVisibility.lastName) values.push(row.lastName || '');
      if (columnVisibility.linkedinUrl) values.push(row.linkedinUrl || '');
      if (columnVisibility.aiLinesChanged) values.push(String(row.aiLinesChanged ?? ''));
      if (columnVisibility.totalLinesChanged) values.push(String(row.totalLinesChanged ?? ''));
      if (columnVisibility.pctAiCode) values.push(row.pctAiCode ? `${row.pctAiCode.toFixed(1)}%` : '');
      if (columnVisibility.commitCount) values.push(String(row.commitCount ?? ''));
      if (columnVisibility.totalSessions) values.push(String(row.totalSessions ?? ''));
      if (columnVisibility.totalAgentRequests) values.push(String(row.totalAgentRequests ?? ''));
      if (columnVisibility.isMcpUser) values.push(row.isMcpUser ? 'Yes' : 'No');
      if (columnVisibility.isRuleCreator) values.push(row.isRuleCreator ? 'Yes' : 'No');
      if (columnVisibility.isRuleUser) values.push(row.isRuleUser ? 'Yes' : 'No');
      if (columnVisibility.isCommandCreator) values.push(row.isCommandCreator ? 'Yes' : 'No');
      if (columnVisibility.isCommandUser) values.push(row.isCommandUser ? 'Yes' : 'No');
      if (columnVisibility.numProductsUsed) values.push(String(row.numProductsUsed ?? ''));
      if (columnVisibility.membershipDays) values.push(String(row.membershipDays ?? ''));
      if (columnVisibility.engagementScore) values.push(String((row as EnhancedMasterUserRecord).engagementScore?.toFixed(1) ?? ''));
      if (columnVisibility.engagementPercentile) values.push(String((row as EnhancedMasterUserRecord).engagementPercentile ?? ''));
      if (columnVisibility.segment) values.push((row as EnhancedMasterUserRecord).segment || '');
      return values;
    });

    // Convert to CSV
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `power-users-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  }, [filteredData, columnVisibility]);

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '—';
    return value.toLocaleString();
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null) return '—';
    return `${value.toFixed(1)}%`;
  };

  const formatBoolean = (value: boolean | undefined): string => {
    if (value === undefined || value === null) return '—';
    return value ? 'Yes' : 'No';
  };

  const formatSegment = (segment: string | undefined): string => {
    if (!segment) return '—';
    const labels: Record<string, string> = {
      'power': 'Power',
      'active': 'Active',
      'casual': 'Casual',
      'at-risk': 'At Risk',
    };
    return labels[segment] || segment;
  };


  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center space-x-2">
          <span>Master User Table</span>
          <span className="text-sm font-normal text-gray-500">
            ({filteredData.length} of {rows.length} users)
          </span>
          {selectedUserEmails.size > 0 && (
            <span className="text-sm font-normal text-blue-600 flex items-center space-x-1">
              <span>•</span>
              <span>{selectedUserEmails.size} selected</span>
            </span>
          )}
        </CardTitle>
        
        <div className="flex items-center space-x-2">
          {selectedUserEmails.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="flex items-center space-x-2"
            >
              <XCircle className="h-3 w-3" />
              <span>Clear Selection</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={columnVisibility.email}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, email: checked }))}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.firstName}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, firstName: checked }))}
              >
                First Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.lastName}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, lastName: checked }))}
              >
                Last Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.linkedinUrl}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, linkedinUrl: checked }))}
              >
                LinkedIn
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={columnVisibility.aiLinesChanged}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, aiLinesChanged: checked }))}
              >
                AI Lines
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.totalLinesChanged}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, totalLinesChanged: checked }))}
              >
                Total Lines
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.pctAiCode}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, pctAiCode: checked }))}
              >
                AI %
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.commitCount}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, commitCount: checked }))}
              >
                Commits
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={columnVisibility.totalSessions}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, totalSessions: checked }))}
              >
                Sessions
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.totalAgentRequests}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, totalAgentRequests: checked }))}
              >
                Agent Requests
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={columnVisibility.isMcpUser}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, isMcpUser: checked }))}
              >
                MCP User
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.isRuleCreator}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, isRuleCreator: checked }))}
              >
                Rule Creator
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.isRuleUser}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, isRuleUser: checked }))}
              >
                Rule User
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.isCommandCreator}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, isCommandCreator: checked }))}
              >
                Command Creator
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.isCommandUser}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, isCommandUser: checked }))}
              >
                Command User
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={columnVisibility.numProductsUsed}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, numProductsUsed: checked }))}
              >
                Products Used
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.membershipDays}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, membershipDays: checked }))}
              >
                Membership Days
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={columnVisibility.engagementScore}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, engagementScore: checked }))}
              >
                Engagement Score
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.engagementPercentile}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, engagementPercentile: checked }))}
              >
                Engagement Percentile
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.segment}
                onCheckedChange={(checked) => setColumnVisibility(prev => ({ ...prev, segment: checked }))}
              >
                Segment
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center space-x-2"
          >
            <Download className="h-3 w-3" />
            <span>Export CSV</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
              <Table key={dataVersion}>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-label="Select all users"
                    />
                  </TableHead>
                  {columnVisibility.email && (
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
                  )}
                  
                  {columnVisibility.firstName && (
                    <TableHead className="min-w-[120px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100"
                        onClick={() => handleSort('firstName')}
                      >
                        <span>First Name</span>
                        {getSortIcon('firstName')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.lastName && (
                    <TableHead className="min-w-[120px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100"
                        onClick={() => handleSort('lastName')}
                      >
                        <span>Last Name</span>
                        {getSortIcon('lastName')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.linkedinUrl && (
                    <TableHead className="min-w-[150px]">
                      <span className="font-semibold">LinkedIn</span>
                    </TableHead>
                  )}
                  
                  {columnVisibility.aiLinesChanged && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('aiLinesChanged')}
                      >
                        <span>AI Lines</span>
                        {getSortIcon('aiLinesChanged')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.totalLinesChanged && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('totalLinesChanged')}
                      >
                        <span>Total Lines</span>
                        {getSortIcon('totalLinesChanged')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.pctAiCode && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('pctAiCode')}
                      >
                        <span>AI %</span>
                        {getSortIcon('pctAiCode')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.commitCount && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('commitCount')}
                      >
                        <span>Commits</span>
                        {getSortIcon('commitCount')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.totalSessions && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('totalSessions')}
                      >
                        <span>Sessions</span>
                        {getSortIcon('totalSessions')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.totalAgentRequests && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('totalAgentRequests')}
                      >
                        <span>Agent Requests</span>
                        {getSortIcon('totalAgentRequests')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.isMcpUser && (
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100"
                        onClick={() => handleSort('isMcpUser')}
                      >
                        <span>MCP</span>
                        {getSortIcon('isMcpUser')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.isRuleCreator && (
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100"
                        onClick={() => handleSort('isRuleCreator')}
                      >
                        <span>Rule Creator</span>
                        {getSortIcon('isRuleCreator')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.isRuleUser && (
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100"
                        onClick={() => handleSort('isRuleUser')}
                      >
                        <span>Rule User</span>
                        {getSortIcon('isRuleUser')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.isCommandCreator && (
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100"
                        onClick={() => handleSort('isCommandCreator')}
                      >
                        <span>Cmd Creator</span>
                        {getSortIcon('isCommandCreator')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.isCommandUser && (
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100"
                        onClick={() => handleSort('isCommandUser')}
                      >
                        <span>Cmd User</span>
                        {getSortIcon('isCommandUser')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.numProductsUsed && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('numProductsUsed')}
                      >
                        <span>Products</span>
                        {getSortIcon('numProductsUsed')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.membershipDays && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('membershipDays')}
                      >
                        <span>Membership Days</span>
                        {getSortIcon('membershipDays')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.engagementScore && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('engagementScore')}
                      >
                        <span>Engagement Score</span>
                        {getSortIcon('engagementScore')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.engagementPercentile && (
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort('engagementPercentile')}
                      >
                        <span>Engagement %</span>
                        {getSortIcon('engagementPercentile')}
                      </Button>
                    </TableHead>
                  )}
                  
                  {columnVisibility.segment && (
                    <TableHead className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100"
                        onClick={() => handleSort('segment')}
                      >
                        <span>Segment</span>
                        {getSortIcon('segment')}
                      </Button>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {paginatedData.map((row) => (
                    <TableRow 
                      key={row.email} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedUserEmails.has(row.email) ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedUser(row);
                        setIsDrawerOpen(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedUser(row);
                          setIsDrawerOpen(true);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View details for ${row.email}`}
                    >
                      <TableCell 
                        className="w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUserEmails.has(row.email)}
                          onChange={() => toggleUserSelection(row.email)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select ${row.email}`}
                        />
                      </TableCell>
                      {columnVisibility.email && (
                        <TableCell className="font-medium">
                          {row.email}
                        </TableCell>
                      )}
                      
                      {columnVisibility.firstName && (
                        <TableCell 
                          className="group relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {editingCell?.email === row.email && editingCell?.field === 'firstName' ? (
                            <div className="flex items-center space-x-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                                className="h-7 text-sm"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 text-green-600 hover:text-green-700"
                                aria-label="Save"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:text-red-700"
                                aria-label="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 group-hover:bg-gray-50 -mx-1 px-1 rounded">
                              <span className="flex-1">{row.firstName || '—'}</span>
                              <button
                                onClick={() => handleStartEdit(row.email, 'firstName', row.firstName || '')}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
                                aria-label="Edit first name"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </TableCell>
                      )}
                      
                      {columnVisibility.lastName && (
                        <TableCell 
                          className="group relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {editingCell?.email === row.email && editingCell?.field === 'lastName' ? (
                            <div className="flex items-center space-x-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit();
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                                className="h-7 text-sm"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 text-green-600 hover:text-green-700"
                                aria-label="Save"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-red-600 hover:text-red-700"
                                aria-label="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 group-hover:bg-gray-50 -mx-1 px-1 rounded">
                              <span className="flex-1">{row.lastName || '—'}</span>
                              <button
                                onClick={() => handleStartEdit(row.email, 'lastName', row.lastName || '')}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
                                aria-label="Edit last name"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </TableCell>
                      )}
                      
                      {columnVisibility.linkedinUrl && (
                        <TableCell>
                          {row.linkedinUrl ? (
                            <a
                              href={row.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="truncate max-w-[120px]">View</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </TableCell>
                      )}
                      
                      {columnVisibility.aiLinesChanged && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.aiLinesChanged)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.totalLinesChanged && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.totalLinesChanged)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.pctAiCode && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatPercentage(row.pctAiCode)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.commitCount && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.commitCount)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.totalSessions && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.totalSessions)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.totalAgentRequests && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.totalAgentRequests)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.isMcpUser && (
                        <TableCell className="text-center">
                          {formatBoolean(row.isMcpUser)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.isRuleCreator && (
                        <TableCell className="text-center">
                          {formatBoolean(row.isRuleCreator)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.isRuleUser && (
                        <TableCell className="text-center">
                          {formatBoolean(row.isRuleUser)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.isCommandCreator && (
                        <TableCell className="text-center">
                          {formatBoolean(row.isCommandCreator)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.isCommandUser && (
                        <TableCell className="text-center">
                          {formatBoolean(row.isCommandUser)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.numProductsUsed && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.numProductsUsed)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.membershipDays && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber(row.membershipDays)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.engagementScore && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber((row as EnhancedMasterUserRecord).engagementScore)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.engagementPercentile && (
                        <TableCell className="text-right font-mono text-sm">
                          {formatNumber((row as EnhancedMasterUserRecord).engagementPercentile)}
                        </TableCell>
                      )}
                      
                      {columnVisibility.segment && (
                        <TableCell className="text-center text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (row as EnhancedMasterUserRecord).segment === 'power' ? 'bg-green-100 text-green-800' :
                            (row as EnhancedMasterUserRecord).segment === 'active' ? 'bg-blue-100 text-blue-800' :
                            (row as EnhancedMasterUserRecord).segment === 'casual' ? 'bg-orange-100 text-orange-800' :
                            (row as EnhancedMasterUserRecord).segment === 'at-risk' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {formatSegment((row as EnhancedMasterUserRecord).segment)}
                          </span>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ROWS_PER_PAGE + 1} to {Math.min(currentPage * ROWS_PER_PAGE, filteredData.length)} of {filteredData.length} users
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUser(null);
        }}
      />
    </Card>
  );
}

