'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings } from 'lucide-react';
import { MAUUsageData, MAUUsageConfig } from '@/types';

interface MAUUsageControlsProps {
  data: MAUUsageData;
  config: MAUUsageConfig;
  onDataChange: (data: MAUUsageData) => void;
  onConfigChange: (config: MAUUsageConfig) => void;
}

export function MAUUsageControls({ 
  data, 
  config, 
  onDataChange, 
  onConfigChange 
}: MAUUsageControlsProps) {
  // Local input state to allow blank fields
  const [activeUsersInput, setActiveUsersInput] = useState<string>('');
  const [agentPctInput, setAgentPctInput] = useState<string>('');
  const [tabPctInput, setTabPctInput] = useState<string>('');

  // Sync local inputs if parent resets data
  useEffect(() => {
    if (data.activeUsers === 0 && data.agentPercentage === 0 && data.tabPercentage === 0) {
      setActiveUsersInput('');
      setAgentPctInput('');
      setTabPctInput('');
    }
  }, [data.activeUsers, data.agentPercentage, data.tabPercentage]);

  const handleActiveUsersChange = (value: string) => {
    setActiveUsersInput(value);
    const activeUsers = Math.max(0, value === '' ? 0 : parseInt(value) || 0);
    const agentUsers = Math.round((activeUsers * data.agentPercentage) / 100);
    const tabUsers = Math.round((activeUsers * data.tabPercentage) / 100);
    onDataChange({ ...data, activeUsers, agentUsers, tabUsers });
  };

  const handleAgentPercentageChange = (value: string) => {
    setAgentPctInput(value);
    const percentage = value === '' ? 0 : Math.max(0, Math.min(100, parseFloat(value) || 0));
    const agentUsers = Math.round((data.activeUsers * percentage) / 100);
    onDataChange({ ...data, agentPercentage: percentage, agentUsers });
  };

  const handleTabPercentageChange = (value: string) => {
    setTabPctInput(value);
    const percentage = value === '' ? 0 : Math.max(0, Math.min(100, parseFloat(value) || 0));
    const tabUsers = Math.round((data.activeUsers * percentage) / 100);
    onDataChange({ ...data, tabPercentage: percentage, tabUsers });
  };

  const handleShowLabelsChange = (checked: boolean) => {
    onConfigChange({
      ...config,
      showLabels: checked
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>MAU Usage Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="activeUsers">Active Users (last 30 days)</Label>
            <Input
              id="activeUsers"
              type="number"
              min="0"
              value={activeUsersInput}
              onChange={(e) => handleActiveUsersChange(e.target.value)}
              placeholder="Enter total active users"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentPercentage">% that use agent</Label>
              <div className="relative">
                <Input
                  id="agentPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={agentPctInput}
                  onChange={(e) => handleAgentPercentageChange(e.target.value)}
                  placeholder="0-100"
                  className="pr-8"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tabPercentage">% that use tab</Label>
              <div className="relative">
                <Input
                  id="tabPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tabPctInput}
                  onChange={(e) => handleTabPercentageChange(e.target.value)}
                  placeholder="0-100"
                  className="pr-8"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chart Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showLabels"
                checked={config.showLabels}
                onCheckedChange={handleShowLabelsChange}
              />
              <Label htmlFor="showLabels">Show data labels on chart</Label>
            </div>
          </div>

          {/* Calculated Values Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Calculated Values</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Agent users:</span>
                <span className="font-medium">{data.agentUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tab users:</span>
                <span className="font-medium">{data.tabUsers.toLocaleString()}</span>
              </div>
            </div>
            {data.activeUsers > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                Note: Users may use both agent and tab, so totals may overlap.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
