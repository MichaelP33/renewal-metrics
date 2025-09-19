'use client';

import React from 'react';
import { BarChart3, Tag, Eye, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartConfig, TimePeriod } from '@/types';

interface ChartControlsProps {
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
}

const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string; description: string }[] = [
  {
    value: 'MoM',
    label: 'Month over Month',
    description: 'Compare monthly spending'
  },
  {
    value: 'QoQ',
    label: 'Quarter over Quarter',
    description: 'Compare quarterly spending'
  }
];

export function ChartControls({ config, onConfigChange }: ChartControlsProps) {
  const handleTimePeriodChange = (value: TimePeriod) => {
    onConfigChange({
      ...config,
      timePeriod: value
    });
  };

  const handleShowDataLabelsChange = (checked: boolean) => {
    onConfigChange({
      ...config,
      showDataLabels: checked
    });
  };

  const handleShowLegendChange = (checked: boolean) => {
    onConfigChange({
      ...config,
      showLegend: checked
    });
  };

  const getCurrentPeriodOption = () => {
    return TIME_PERIOD_OPTIONS.find(option => option.value === config.timePeriod);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Chart Settings</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Period Selection */}
        <div className="space-y-2">
          <Label htmlFor="time-period" className="text-sm font-medium flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span>Time Period</span>
          </Label>
          <Select 
            value={config.timePeriod} 
            onValueChange={handleTimePeriodChange}
          >
            <SelectTrigger id="time-period">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {getCurrentPeriodOption() && (
            <p className="text-xs text-gray-600">
              {getCurrentPeriodOption()?.description}
            </p>
          )}
        </div>

        <Separator />

        {/* Display Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Eye className="h-3 w-3" />
            <span>Display Options</span>
          </Label>
          
          <div className="space-y-3">
            {/* Show Data Labels */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label 
                  htmlFor="show-data-labels" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Show Data Labels
                </Label>
                <p className="text-xs text-gray-500">
                  Display values on chart data points
                </p>
              </div>
              <Switch
                id="show-data-labels"
                checked={config.showDataLabels}
                onCheckedChange={handleShowDataLabelsChange}
              />
            </div>

            {/* Show Legend */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label 
                  htmlFor="show-legend" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Show Legend
                </Label>
                <p className="text-xs text-gray-500">
                  Display category legend below charts
                </p>
              </div>
              <Switch
                id="show-legend"
                checked={config.showLegend}
                onCheckedChange={handleShowLegendChange}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Current Settings Summary */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">
            Current Settings
          </Label>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Time Period:</span>
              <span className="font-medium">{config.timePeriod}</span>
            </div>
            <div className="flex justify-between">
              <span>Data Labels:</span>
              <span className={config.showDataLabels ? 'text-green-600' : 'text-gray-400'}>
                {config.showDataLabels ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Legend:</span>
              <span className={config.showLegend ? 'text-green-600' : 'text-gray-400'}>
                {config.showLegend ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex items-start space-x-2">
            <Tag className="h-3 w-3 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="space-y-1">
                <li>• Hide data labels for cleaner charts with many data points</li>
                <li>• Use MoM for most business reporting</li>
                <li>• QoQ is useful for quarterly reviews</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
