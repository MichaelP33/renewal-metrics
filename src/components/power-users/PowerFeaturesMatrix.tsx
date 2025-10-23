'use client';

import React, { useMemo, useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataSourceLink } from '../DataSourceLink';
import { TAM_MISSION_CONTROL_HEX_URL } from '@/lib/data-source-links';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MasterUserRecord, NestedFilterGroups } from '@/types/power-users';
import { exportCSV } from '@/lib/export-utils';
import { filterUsers, hasActiveFilters } from '@/lib/power-users/filter-logic';
import { PowerFeatureFilterBuilder } from './PowerFeatureFilterBuilder';

interface PowerFeaturesMatrixProps {
  data: MasterUserRecord[];
}

const ROWS_PER_PAGE_OPTIONS = [25, 50];

export function PowerFeaturesMatrix({ data }: PowerFeaturesMatrixProps) {
  const [searchText, setSearchText] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] = useState<NestedFilterGroups>({
    group1: null,
    group2: null,
  });

  // Filter data - apply advanced filters first, then search
  const filteredData = useMemo(() => {
    let result = data;

    // Apply advanced filters
    if (hasActiveFilters(advancedFilters)) {
      result = filterUsers(result, advancedFilters);
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(row => 
        row.email.toLowerCase().includes(searchLower) ||
        row.firstName?.toLowerCase().includes(searchLower) ||
        row.lastName?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [data, searchText, advancedFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Reset to page 1 when filters or rows per page change
  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleAdvancedFiltersChange = (filters: NestedFilterGroups) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'Email',
      'First Name',
      'Last Name',
      'MCP User',
      'Rule Creator',
      'Rule User',
      'Command Creator',
      'Command User',
    ];

    const rows = filteredData.map(row => [
      row.email,
      row.firstName || '',
      row.lastName || '',
      row.isMcpUser ? 'Yes' : 'No',
      row.isRuleCreator ? 'Yes' : 'No',
      row.isRuleUser ? 'Yes' : 'No',
      row.isCommandCreator ? 'Yes' : 'No',
      row.isCommandUser ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `power-features-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  };

  const formatBoolean = (value: boolean | undefined): '✅' | '✖' => {
    return value ? '✅' : '✖';
  };

  const activeFilterCount = hasActiveFilters(advancedFilters) ? filteredData.length : null;

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No power features data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Power Features Matrix</span>
          <div className="flex items-center space-x-2">
            <DataSourceLink href={TAM_MISSION_CONTROL_HEX_URL} />
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
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Advanced Filters */}
        <div className="mb-4 pb-4 border-b">
          <PowerFeatureFilterBuilder 
            filters={advancedFilters} 
            onChange={handleAdvancedFiltersChange}
          />
          {activeFilterCount !== null && (
            <div className="mt-3 text-xs text-gray-600">
              {activeFilterCount} user{activeFilterCount !== 1 ? 's' : ''} match the filter criteria
            </div>
          )}
        </div>

        {/* Search and Pagination Controls */}
        <div className="mb-4 flex items-end space-x-4">
          <div className="flex-1">
            <Label htmlFor="search" className="text-sm">Search Users</Label>
            <Input
              id="search"
              placeholder="Search by email or name..."
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="w-32">
            <Label htmlFor="rows-per-page" className="text-sm">Rows per page</Label>
            <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
              <SelectTrigger id="rows-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map(option => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">First Name</TableHead>
                  <TableHead className="min-w-[120px]">Last Name</TableHead>
                  <TableHead className="text-center">MCP User</TableHead>
                  <TableHead className="text-center">Rule Creator</TableHead>
                  <TableHead className="text-center">Rule User</TableHead>
                  <TableHead className="text-center">Command Creator</TableHead>
                  <TableHead className="text-center">Command User</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={`${row.email}-${index}`} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {row.email}
                    </TableCell>
                    <TableCell>
                      {row.firstName || '—'}
                    </TableCell>
                    <TableCell>
                      {row.lastName || '—'}
                    </TableCell>
                    <TableCell className="text-center text-lg">
                      {formatBoolean(row.isMcpUser)}
                    </TableCell>
                    <TableCell className="text-center text-lg">
                      {formatBoolean(row.isRuleCreator)}
                    </TableCell>
                    <TableCell className="text-center text-lg">
                      {formatBoolean(row.isRuleUser)}
                    </TableCell>
                    <TableCell className="text-center text-lg">
                      {formatBoolean(row.isCommandCreator)}
                    </TableCell>
                    <TableCell className="text-center text-lg">
                      {formatBoolean(row.isCommandUser)}
                    </TableCell>
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
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} users
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

        {totalPages <= 1 && (
          <div className="mt-4 text-xs text-gray-500">
            Showing {filteredData.length} of {data.length} users
          </div>
        )}
      </CardContent>
    </Card>
  );
}

