'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Table as TableIcon } from 'lucide-react';
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
import { AggregatedData, CATEGORY_ORDER, ModelCategory } from '@/types';
import { formatCurrency } from '@/lib/chart-utils';
import { exportToCSV } from '@/lib/data-processing';
import { exportCSV } from '@/lib/export-utils';

interface DataTableProps {
  data: AggregatedData[];
  title?: string;
  showExport?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = 'month' | 'total' | ModelCategory;

export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(({ 
  data, 
  title = "Model Cost Breakdown", 
  showExport = true 
}, ref) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('month');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calculate totals for the footer
  const totals = useMemo(() => {
    if (data.length === 0) return null;

    const result: Record<string, number> = {
      total: 0
    };

    CATEGORY_ORDER.forEach(category => {
      result[category] = data.reduce((sum, row) => sum + (row[category] as number), 0);
    });

    result.total = data.reduce((sum, row) => sum + row.total, 0);

    return result;
  }, [data]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn === 'month') {
        aValue = new Date(a.month);
        bValue = new Date(b.month);
      } else if (sortColumn === 'total') {
        aValue = a.total;
        bValue = b.total;
      } else {
        aValue = a[sortColumn] as number;
        bValue = b[sortColumn] as number;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null -> asc
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn('month'); // Reset to default
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
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

  const handleExportCSV = () => {
    if (data.length === 0) return;

    try {
      const csvContent = exportToCSV(data);
      const filename = `model-costs-table-${new Date().toISOString().split('T')[0]}`;
      exportCSV(csvContent, filename);
    } catch (error) {
      console.error('Export failed:', error);
      // You could add a toast notification here
    }
  };

  const formatCellValue = (value: number): string => {
    return value === 0 ? '—' : formatCurrency(value);
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TableIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={ref}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center space-x-2">
          <TableIcon className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
        
        {showExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center space-x-2"
          >
            <Download className="h-3 w-3" />
            <span>Export CSV</span>
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {/* Month column */}
                  <TableHead className="w-[120px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100"
                      onClick={() => handleSort('month')}
                    >
                      <span>Month</span>
                      {getSortIcon('month')}
                    </Button>
                  </TableHead>
                  
                  {/* Category columns */}
                  {CATEGORY_ORDER.map((category) => (
                    <TableHead key={category} className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                        onClick={() => handleSort(category as SortColumn)}
                      >
                        <span>{category}</span>
                        {getSortIcon(category as SortColumn)}
                      </Button>
                    </TableHead>
                  ))}
                  
                  {/* Total column */}
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-semibold hover:bg-gray-100 w-full justify-end"
                      onClick={() => handleSort('total')}
                    >
                      <span>Total</span>
                      {getSortIcon('total')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow key={row.month} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {row.monthDisplay}
                    </TableCell>
                    
                    {CATEGORY_ORDER.map((category) => (
                      <TableCell key={category} className="text-right font-mono text-sm">
                        {formatCellValue(row[category] as number)}
                      </TableCell>
                    ))}
                    
                    <TableCell className="text-right font-mono text-sm font-semibold">
                      {formatCurrency(row.total)}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Totals row */}
                {totals && (
                  <TableRow className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                    <TableCell className="font-bold">
                      TOTAL
                    </TableCell>
                    
                    {CATEGORY_ORDER.map((category) => (
                      <TableCell key={category} className="text-right font-mono text-sm font-bold">
                        {formatCellValue(totals[category])}
                      </TableCell>
                    ))}
                    
                    <TableCell className="text-right font-mono text-sm font-bold text-blue-600">
                      {formatCurrency(totals.total)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Table footer info */}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
          <span>
            Showing {sortedData.length} month{sortedData.length !== 1 ? 's' : ''} of data
          </span>
          
          {totals && (
            <span>
              Grand total: <span className="font-semibold text-blue-600">
                {formatCurrency(totals.total)}
              </span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

DataTable.displayName = 'DataTable';
