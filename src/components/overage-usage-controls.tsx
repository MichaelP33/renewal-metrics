'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Plus, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { OverageUsageData, OverageUsageConfig, ForecastMethod } from '@/types';
import { generateMonthOptions, formatMonthDisplay, calculateMonthToMonthGrowthRates } from '@/lib/overage-usage-processing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/chart-utils';

interface OverageUsageControlsProps {
  data: OverageUsageData;
  config: OverageUsageConfig;
  onDataChange: (data: OverageUsageData) => void;
  onConfigChange: (config: OverageUsageConfig) => void;
}

export function OverageUsageControls({ 
  data, 
  config, 
  onDataChange, 
  onConfigChange 
}: OverageUsageControlsProps) {
  const monthOptions = generateMonthOptions(24, 12);

  // Safety checks: ensure data and config are always defined
  const safeData = data || [];
  const safeConfig = config || {
    showLabels: true,
    showForecast: false,
    forecastMonths: 3,
    forecastMethod: 'linear' as const,
    customGrowthRate: null
  };
  // Sort data for display
  const sortedData = [...safeData].sort((a, b) => a.month.localeCompare(b.month));

  // Local state for growth rate input to allow natural typing
  const [growthRateInput, setGrowthRateInput] = useState<string>('');
  const [isGrowthRateFocused, setIsGrowthRateFocused] = useState<boolean>(false);
  
  // State for growth rate breakdown collapse/expand
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState<boolean>(true);

  const handleAddMonth = () => {
    // Find the latest month in existing data, or use current month
    let startMonth: string;
    if (safeData.length > 0) {
      const sortedDesc = [...safeData].sort((a, b) => b.month.localeCompare(a.month));
      const latestMonth = sortedDesc[0].month;
      const [year, month] = latestMonth.split('-').map(Number);
      let nextYear = year;
      let nextMonth = month + 1;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      startMonth = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    } else {
      const now = new Date();
      startMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const newEntry = { month: startMonth, spend: 0 };
    const updatedData = [...safeData, newEntry];
    // Sort by month
    updatedData.sort((a, b) => a.month.localeCompare(b.month));
    console.log('[OverageUsageControls] handleAddMonth - calling onDataChange with:', updatedData);
    console.log('[OverageUsageControls] handleAddMonth - onDataChange is:', typeof onDataChange, onDataChange);
    if (onDataChange) {
      onDataChange(updatedData);
    } else {
      console.error('[OverageUsageControls] handleAddMonth - onDataChange is not defined!');
    }
  };

  const handleBulkAdd12Months = () => {
    // Find the latest month in existing data, or use current month
    let startMonth: string;
    if (safeData.length > 0) {
      const sortedData = [...safeData].sort((a, b) => b.month.localeCompare(a.month));
      startMonth = sortedData[0].month;
    } else {
      const now = new Date();
      startMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const [startYear, startMonthNum] = startMonth.split('-').map(Number);
    const newEntries: OverageUsageData = [];
    const existingMonths = new Set(safeData.map(d => d.month));

    for (let i = 1; i <= 12; i++) {
      let year = startYear;
      let month = startMonthNum + i;
      while (month > 12) {
        month -= 12;
        year += 1;
      }
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      if (!existingMonths.has(monthStr)) {
        newEntries.push({ month: monthStr, spend: 0 });
      }
    }

    if (newEntries.length > 0) {
      const updatedData = [...safeData, ...newEntries];
      updatedData.sort((a, b) => a.month.localeCompare(b.month));
      console.log('[OverageUsageControls] handleBulkAdd12Months - calling onDataChange with:', updatedData);
      console.log('[OverageUsageControls] handleBulkAdd12Months - onDataChange is:', typeof onDataChange, onDataChange);
      if (onDataChange) {
        onDataChange(updatedData);
      } else {
        console.error('[OverageUsageControls] handleBulkAdd12Months - onDataChange is not defined!');
      }
    } else {
      console.log('[OverageUsageControls] handleBulkAdd12Months - no new entries to add');
    }
  };

  const handleRemoveMonth = (index: number) => {
    const updatedData = safeData.filter((_, i) => i !== index);
    onDataChange(updatedData);
  };

  const handleMonthChange = (index: number, month: string) => {
    const updatedData = [...safeData];
    updatedData[index] = { ...updatedData[index], month };
    // Remove duplicates and sort
    const uniqueData = updatedData.filter((item, i, arr) => 
      arr.findIndex(t => t.month === item.month) === i
    );
    uniqueData.sort((a, b) => a.month.localeCompare(b.month));
    onDataChange(uniqueData);
  };

  const handleSpendChange = (index: number, value: string) => {
    const updatedData = [...safeData];
    const spend = Math.max(0, value === '' ? 0 : parseFloat(value) || 0);
    updatedData[index] = { ...updatedData[index], spend };
    onDataChange(updatedData);
  };

  const handleShowLabelsChange = (checked: boolean) => {
    onConfigChange({ ...safeConfig, showLabels: checked });
  };

  const handleShowForecastChange = (checked: boolean) => {
    onConfigChange({ ...safeConfig, showForecast: checked });
  };

  const handleForecastMonthsChange = (months: string) => {
    onConfigChange({ ...safeConfig, forecastMonths: parseInt(months, 10) });
  };

  const handleForecastMethodChange = (method: ForecastMethod) => {
    onConfigChange({ ...safeConfig, forecastMethod: method });
  };

  // Calculate default growth rate for display
  const calculateDefaultGrowthRate = (): number => {
    if (safeData.length < 2) return 0;
    const sortedData = [...safeData].sort((a, b) => a.month.localeCompare(b.month));
    const growthRates: number[] = [];
    for (let i = 1; i < sortedData.length; i++) {
      const prevSpend = sortedData[i - 1].spend;
      if (prevSpend > 0) {
        const growthRate = ((sortedData[i].spend - prevSpend) / prevSpend) * 100;
        growthRates.push(growthRate);
      }
    }
    if (growthRates.length === 0) return 0;
    return growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  };

  const defaultGrowthRate = calculateDefaultGrowthRate();

  // Calculate month-to-month growth rates for breakdown display
  const monthToMonthGrowthRates = calculateMonthToMonthGrowthRates(safeData);
  
  // Calculate summary statistics for growth rates
  const growthRateStats = (() => {
    if (monthToMonthGrowthRates.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    const validRates = monthToMonthGrowthRates
      .map(r => r.growthRate)
      .filter(r => isFinite(r)); // Filter out Infinity values
    
    if (validRates.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    const avg = validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
    const min = Math.min(...validRates);
    const max = Math.max(...validRates);
    
    return { avg, min, max, count: validRates.length };
  })();

  // Sync local input state with config when it changes externally
  useEffect(() => {
    if (!isGrowthRateFocused) {
      if (safeConfig.customGrowthRate === null) {
        setGrowthRateInput('');
      } else {
        // Format to 1 decimal place for display
        setGrowthRateInput((safeConfig.customGrowthRate * 100).toFixed(1));
      }
    }
  }, [safeConfig.customGrowthRate, isGrowthRateFocused]);

  // Initialize input value on mount or when method changes
  useEffect(() => {
    if (safeConfig.forecastMethod === 'growth_rate' && !isGrowthRateFocused) {
      if (safeConfig.customGrowthRate === null) {
        setGrowthRateInput('');
      } else {
        setGrowthRateInput((safeConfig.customGrowthRate * 100).toFixed(1));
      }
    }
  }, [safeConfig.forecastMethod, isGrowthRateFocused]);

  // Handle growth rate input change - update local state only
  const handleGrowthRateChange = (value: string) => {
    setGrowthRateInput(value);
  };

  // Handle growth rate input focus - sync current value
  const handleGrowthRateFocus = () => {
    setIsGrowthRateFocused(true);
    // When focusing, ensure we have the current value in the input
    if (safeConfig.customGrowthRate === null) {
      setGrowthRateInput('');
    } else {
      setGrowthRateInput((safeConfig.customGrowthRate * 100).toFixed(1));
    }
  };

  // Handle growth rate input blur - commit and validate
  const handleGrowthRateBlur = () => {
    setIsGrowthRateFocused(false);
    
    // If empty, reset to calculated rate
    if (growthRateInput.trim() === '') {
      onConfigChange({ ...safeConfig, customGrowthRate: null });
      setGrowthRateInput('');
      return;
    }

    // Parse and validate the input
    const parsedValue = parseFloat(growthRateInput);
    
    // If invalid number, reset to calculated rate
    if (isNaN(parsedValue)) {
      onConfigChange({ ...safeConfig, customGrowthRate: null });
      setGrowthRateInput('');
      return;
    }

    // Validate range (-50 to 200)
    if (parsedValue < -50 || parsedValue > 200) {
      // Invalid range - reset to calculated rate
      onConfigChange({ ...safeConfig, customGrowthRate: null });
      setGrowthRateInput('');
      return;
    }

    // Valid input - convert percentage to decimal and update config
    const rate = parsedValue / 100;
    onConfigChange({ ...safeConfig, customGrowthRate: rate });
    // Format for display
    setGrowthRateInput(parsedValue.toFixed(1));
  };

  // Handle reset button click
  const handleResetGrowthRate = () => {
    onConfigChange({ ...safeConfig, customGrowthRate: null });
    setGrowthRateInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Data Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Monthly Spend Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleBulkAdd12Months}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Bulk Add 12 Months
            </Button>
            <Button
              onClick={handleAddMonth}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Month
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sortedData.map((entry, index) => {
              const originalIndex = safeData.findIndex(d => d.month === entry.month);
              return (
                <div key={`${entry.month}-${originalIndex}`} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select
                      value={entry.month}
                      onValueChange={(value) => handleMonthChange(originalIndex, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.spend === 0 ? '' : entry.spend}
                        onChange={(e) => handleSpendChange(originalIndex, e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveMonth(originalIndex)}
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              );
            })}

            {sortedData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No months added yet.</p>
                <p className="text-sm mt-2">Click "Bulk Add 12 Months" or "Add Month" to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chart & Forecast Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chart Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Chart Settings</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showLabels"
                checked={safeConfig.showLabels}
                onCheckedChange={handleShowLabelsChange}
              />
              <Label htmlFor="showLabels">Show data labels on chart</Label>
            </div>
          </div>

          {/* Forecast Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Forecast Settings</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showForecast"
                checked={safeConfig.showForecast}
                onCheckedChange={handleShowForecastChange}
                disabled={safeData.length < 2}
              />
              <Label htmlFor="showForecast">
                Show forecast
                {safeData.length < 2 && (
                  <span className="text-xs text-gray-500 ml-1">(requires at least 2 months of data)</span>
                )}
              </Label>
            </div>

            {safeConfig.showForecast && safeData.length >= 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="forecastMonths">Forecast Duration (months)</Label>
                  <Select
                    value={safeConfig.forecastMonths.toString()}
                    onValueChange={handleForecastMonthsChange}
                  >
                    <SelectTrigger id="forecastMonths">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'month' : 'months'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forecastMethod">Forecast Method</Label>
                  <Select
                    value={safeConfig.forecastMethod}
                    onValueChange={handleForecastMethodChange}
                  >
                    <SelectTrigger id="forecastMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear Trend</SelectItem>
                      <SelectItem value="growth_rate">Growth Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {safeConfig.forecastMethod === 'growth_rate' && (
                  <div className="space-y-2">
                    <Label htmlFor="growthRate">
                      Growth Rate (%)
                      {safeConfig.customGrowthRate === null && (
                        <span className="text-xs text-gray-500 ml-1">(calculated: {defaultGrowthRate.toFixed(1)}%)</span>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="growthRate"
                        type="number"
                        step="0.1"
                        min="-50"
                        max="200"
                        value={growthRateInput}
                        onChange={(e) => handleGrowthRateChange(e.target.value)}
                        onFocus={handleGrowthRateFocus}
                        onBlur={handleGrowthRateBlur}
                        placeholder={defaultGrowthRate.toFixed(1)}
                        className="w-full pr-16"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2"
                        onClick={handleResetGrowthRate}
                        type="button"
                      >
                        Reset
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Leave blank to use calculated rate, or enter custom rate (-50% to +200%)
                    </p>
                    
                    {/* Growth Rate Breakdown */}
                    {safeData.length >= 2 && monthToMonthGrowthRates.length > 0 && (
                      <div className="mt-4 space-y-2 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-gray-900">
                            Growth Rate Breakdown
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                            className="h-7 px-2"
                            type="button"
                          >
                            {isBreakdownExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Expand
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="flex flex-col">
                            <span className="text-gray-500">Average</span>
                            <span className="font-medium text-gray-900">
                              {growthRateStats.avg.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Minimum</span>
                            <span className={`font-medium ${growthRateStats.min < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {growthRateStats.min.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-500">Maximum</span>
                            <span className={`font-medium ${growthRateStats.max >= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {growthRateStats.max.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Month-to-Month Table */}
                        {isBreakdownExpanded && (
                          <div className="mt-3">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">From</TableHead>
                                  <TableHead className="text-xs">To</TableHead>
                                  <TableHead className="text-xs text-right">Growth Rate</TableHead>
                                  <TableHead className="text-xs text-right">Change</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {monthToMonthGrowthRates.map((rate, idx) => {
                                  const isInfinite = !isFinite(rate.growthRate);
                                  const displayRate = isInfinite ? '—' : `${rate.growthRate.toFixed(1)}%`;
                                  const changeAmount = rate.toSpend - rate.fromSpend;
                                  
                                  return (
                                    <TableRow key={`${rate.fromMonth}-${rate.toMonth}-${idx}`} className="hover:bg-gray-50">
                                      <TableCell className="text-xs py-2">
                                        {formatMonthDisplay(rate.fromMonth)}
                                      </TableCell>
                                      <TableCell className="text-xs py-2">
                                        {formatMonthDisplay(rate.toMonth)}
                                      </TableCell>
                                      <TableCell className={`text-xs py-2 text-right font-medium ${
                                        isInfinite 
                                          ? 'text-gray-500' 
                                          : rate.growthRate >= 0 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                      }`}>
                                        {displayRate}
                                      </TableCell>
                                      <TableCell className={`text-xs py-2 text-right ${
                                        changeAmount >= 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {changeAmount >= 0 ? '+' : ''}{formatCurrency(changeAmount)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

