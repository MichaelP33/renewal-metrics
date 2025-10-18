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
      </CardContent>
    </Card>
  );
}

