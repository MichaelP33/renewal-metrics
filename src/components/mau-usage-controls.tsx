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
  const [agentUsersInput, setAgentUsersInput] = useState<string>('');
  const [tabUsersInput, setTabUsersInput] = useState<string>('');

  // Sync local inputs if parent resets data
  useEffect(() => {
    if (data.activeUsers === 0 && data.agentUsers === 0 && data.tabUsers === 0) {
      setActiveUsersInput('');
      setAgentUsersInput('');
      setTabUsersInput('');
    }
  }, [data.activeUsers, data.agentUsers, data.tabUsers]);

  const handleActiveUsersChange = (value: string) => {
    setActiveUsersInput(value);
    const activeUsers = Math.max(0, value === '' ? 0 : parseInt(value) || 0);
    // Recalculate percentages based on current user counts
    const agentPercentage = activeUsers > 0 ? (data.agentUsers / activeUsers) * 100 : 0;
    const tabPercentage = activeUsers > 0 ? (data.tabUsers / activeUsers) * 100 : 0;
    onDataChange({ ...data, activeUsers, agentPercentage, tabPercentage });
  };

  const handleAgentUsersChange = (value: string) => {
    setAgentUsersInput(value);
    const agentUsers = Math.max(0, value === '' ? 0 : parseInt(value) || 0);
    // Cap agent users at total active users
    const cappedAgentUsers = Math.min(agentUsers, data.activeUsers);
    const agentPercentage = data.activeUsers > 0 ? (cappedAgentUsers / data.activeUsers) * 100 : 0;
    onDataChange({ ...data, agentUsers: cappedAgentUsers, agentPercentage });
  };

  const handleTabUsersChange = (value: string) => {
    setTabUsersInput(value);
    const tabUsers = Math.max(0, value === '' ? 0 : parseInt(value) || 0);
    // Cap tab users at total active users
    const cappedTabUsers = Math.min(tabUsers, data.activeUsers);
    const tabPercentage = data.activeUsers > 0 ? (cappedTabUsers / data.activeUsers) * 100 : 0;
    onDataChange({ ...data, tabUsers: cappedTabUsers, tabPercentage });
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
              <Label htmlFor="agentUsers">Users that use agent</Label>
              <Input
                id="agentUsers"
                type="number"
                min="0"
                value={agentUsersInput}
                onChange={(e) => handleAgentUsersChange(e.target.value)}
                placeholder="Enter agent users"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tabUsers">Users that use tab</Label>
              <Input
                id="tabUsers"
                type="number"
                min="0"
                value={tabUsersInput}
                onChange={(e) => handleTabUsersChange(e.target.value)}
                placeholder="Enter tab users"
                className="w-full"
              />
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
                <span className="font-medium">{data.agentUsers.toLocaleString()} ({data.agentPercentage.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tab users:</span>
                <span className="font-medium">{data.tabUsers.toLocaleString()} ({data.tabPercentage.toFixed(1)}%)</span>
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
