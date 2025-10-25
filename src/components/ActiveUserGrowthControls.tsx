'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DateRangePicker } from './DateRangePicker';
import { ActiveUserGrowthConfig, DateRange } from '@/types';

interface ActiveUserGrowthControlsProps {
  config: ActiveUserGrowthConfig;
  onConfigChange: (config: ActiveUserGrowthConfig) => void;
  availableRange: DateRange | null;
}

export function ActiveUserGrowthControls({
  config,
  onConfigChange,
  availableRange
}: ActiveUserGrowthControlsProps) {
  const handleLineToggle = (lineName: 'agent_wau' | 'agent_l4' | 'agent_power_user') => {
    const newVisibleLines = new Set(config.visibleLines);
    
    if (newVisibleLines.has(lineName)) {
      newVisibleLines.delete(lineName);
    } else {
      newVisibleLines.add(lineName);
    }
    
    onConfigChange({
      ...config,
      visibleLines: newVisibleLines
    });
  };

  const handleDateRangeChange = (dateRange: DateRange | null) => {
    onConfigChange({
      ...config,
      dateRange
    });
  };

  const handleShowDataLabelsChange = (showDataLabels: boolean) => {
    onConfigChange({
      ...config,
      showDataLabels
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Visibility Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Line Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="toggle-agent-wau"
                checked={config.visibleLines.has('agent_wau')}
                onCheckedChange={() => handleLineToggle('agent_wau')}
              />
              <Label htmlFor="toggle-agent-wau" className="text-sm font-medium cursor-pointer">
                Agent WAU
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="toggle-agent-l4"
                checked={config.visibleLines.has('agent_l4')}
                onCheckedChange={() => handleLineToggle('agent_l4')}
              />
              <Label htmlFor="toggle-agent-l4" className="text-sm font-medium cursor-pointer">
                Daily User
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="toggle-agent-power-user"
                checked={config.visibleLines.has('agent_power_user')}
                onCheckedChange={() => handleLineToggle('agent_power_user')}
              />
              <Label htmlFor="toggle-agent-power-user" className="text-sm font-medium cursor-pointer">
                Agent Power User
              </Label>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-data-labels"
                checked={config.showDataLabels}
                onCheckedChange={handleShowDataLabelsChange}
              />
              <Label htmlFor="show-data-labels" className="text-sm font-medium cursor-pointer">
                Show data labels
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Range Picker */}
      <DateRangePicker
        dateRange={config.dateRange}
        onDateRangeChange={handleDateRangeChange}
        availableRange={availableRange}
      />
    </div>
  );
}

