'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange, PredefinedDateRange } from '@/types';

interface DateRangePickerProps {
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  availableRange: DateRange | null;
}

const PREDEFINED_RANGES: PredefinedDateRange[] = [
  {
    label: 'Last 3 months',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 2)),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'Last 6 months',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 5)),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'Year to date',
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: 'Last 12 months',
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 11)),
      to: endOfMonth(new Date())
    })
  }
];

export function DateRangePicker({ dateRange, onDateRangeChange, availableRange }: DateRangePickerProps) {
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange | null>(null);

  const handlePredefinedRange = (rangeKey: string) => {
    if (rangeKey === 'all') {
      onDateRangeChange(availableRange);
      return;
    }

    if (rangeKey === 'custom') {
      // Open custom date picker
      setTempDateRange(dateRange);
      setIsCustomPickerOpen(true);
      return;
    }

    const predefinedRange = PREDEFINED_RANGES.find(r => r.label === rangeKey);
    if (predefinedRange) {
      const range = predefinedRange.getValue();
      
      // Constrain to available data range if provided
      if (availableRange) {
        const constrainedRange: DateRange = {
          from: range.from < availableRange.from ? availableRange.from : range.from,
          to: range.to > availableRange.to ? availableRange.to : range.to
        };
        onDateRangeChange(constrainedRange);
      } else {
        onDateRangeChange(range);
      }
    }
  };

  const handleCustomDateApply = () => {
    if (tempDateRange) {
      // Constrain to available data range if provided
      if (availableRange) {
        const constrainedRange: DateRange = {
          from: tempDateRange.from < availableRange.from ? availableRange.from : tempDateRange.from,
          to: tempDateRange.to > availableRange.to ? availableRange.to : tempDateRange.to
        };
        onDateRangeChange(constrainedRange);
      } else {
        onDateRangeChange(tempDateRange);
      }
    }
    setIsCustomPickerOpen(false);
  };

  const handleCustomDateCancel = () => {
    setTempDateRange(null);
    setIsCustomPickerOpen(false);
  };

  const getCurrentRangeLabel = (): string => {
    if (!dateRange) return 'Select date range';

    // Check if it matches available range (all data)
    if (availableRange && 
        dateRange.from.getTime() === availableRange.from.getTime() && 
        dateRange.to.getTime() === availableRange.to.getTime()) {
      return 'All available data';
    }

    // Check if it matches a predefined range
    for (const predefined of PREDEFINED_RANGES) {
      const range = predefined.getValue();
      if (dateRange.from.getTime() === range.from.getTime() && 
          dateRange.to.getTime() === range.to.getTime()) {
        return predefined.label;
      }
    }

    // Custom range
    return `${format(dateRange.from, 'MMM yyyy')} - ${format(dateRange.to, 'MMM yyyy')}`;
  };

  const formatDateRange = (range: DateRange): string => {
    return `${format(range.from, 'MMM dd, yyyy')} - ${format(range.to, 'MMM dd, yyyy')}`;
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Date Range</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date-range-select">Select Period</Label>
            <Select onValueChange={handlePredefinedRange}>
              <SelectTrigger id="date-range-select">
                <SelectValue placeholder={getCurrentRangeLabel()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All available data</SelectItem>
                {PREDEFINED_RANGES.map((range) => (
                  <SelectItem key={range.label} value={range.label}>
                    {range.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom range...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Current Selection</Label>
              <div className="p-2 bg-gray-50 rounded-md text-sm">
                {formatDateRange(dateRange)}
              </div>
            </div>
          )}

          {availableRange && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Available Data</Label>
              <div className="p-2 bg-blue-50 rounded-md text-sm text-blue-800">
                {formatDateRange(availableRange)}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateRangeChange(availableRange)}
              disabled={!availableRange}
              className="flex-1"
            >
              Reset to All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePredefinedRange('Last 6 months')}
              className="flex-1"
            >
              Last 6M
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Date Range Picker Dialog */}
      {isCustomPickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Custom Date Range</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCustomDateCancel}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempDateRange?.from ? format(tempDateRange.from, 'PPP') : 'Select start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempDateRange?.from}
                      onSelect={(date) => {
                        if (date) {
                          setTempDateRange(prev => ({
                            from: date,
                            to: prev?.to || date
                          }));
                        }
                      }}
                      disabled={availableRange ? (date) => 
                        date < availableRange.from || date > availableRange.to
                      : undefined}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempDateRange?.to ? format(tempDateRange.to, 'PPP') : 'Select end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempDateRange?.to}
                      onSelect={(date) => {
                        if (date) {
                          setTempDateRange(prev => ({
                            from: prev?.from || date,
                            to: date
                          }));
                        }
                      }}
                      disabled={availableRange ? (date) => 
                        date < (tempDateRange?.from || availableRange.from) || 
                        date > availableRange.to
                      : (date) => tempDateRange?.from ? date < tempDateRange.from : false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {availableRange && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Available data: {formatDateRange(availableRange)}
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={handleCustomDateCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomDateApply}
                disabled={!tempDateRange?.from || !tempDateRange?.to}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
