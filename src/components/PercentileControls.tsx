'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PercentileConfig } from '@/types';

interface PercentileControlsProps {
  config: PercentileConfig;
  onConfigChange: (config: PercentileConfig) => void;
}

export function PercentileControls({
  config,
  onConfigChange
}: PercentileControlsProps) {
  const handleShowDataLabelsChange = (showDataLabels: boolean) => {
    onConfigChange({
      ...config,
      showDataLabels
    });
  };

  const handleExclude100thPercentileChange = (exclude100thPercentile: boolean) => {
    onConfigChange({
      ...config,
      exclude100thPercentile
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Chart Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="exclude-100th-percentile"
            checked={config.exclude100thPercentile}
            onCheckedChange={handleExclude100thPercentileChange}
          />
          <Label htmlFor="exclude-100th-percentile" className="text-sm font-medium cursor-pointer">
            Exclude 100th percentile (outlier removal)
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}

