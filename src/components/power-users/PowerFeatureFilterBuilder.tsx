'use client';

import React from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NestedFilterGroups, FilterGroup, FilterCondition, PowerFeatureField } from '@/types/power-users';

interface PowerFeatureFilterBuilderProps {
  filters: NestedFilterGroups;
  onChange: (filters: NestedFilterGroups) => void;
}

const FIELD_LABELS: Record<PowerFeatureField, string> = {
  isMcpUser: 'MCP User',
  isRuleCreator: 'Rule Creator',
  isRuleUser: 'Rule User',
  isCommandCreator: 'Command Creator',
  isCommandUser: 'Command User',
};

export function PowerFeatureFilterBuilder({ filters, onChange }: PowerFeatureFilterBuilderProps) {
  const handleAddGroup = (groupNum: 1 | 2) => {
    const newGroup: FilterGroup = {
      operator: 'OR',
      conditions: [],
    };

    if (groupNum === 1) {
      onChange({ ...filters, group1: newGroup });
    } else {
      onChange({ ...filters, group2: newGroup });
    }
  };

  const handleRemoveGroup = (groupNum: 1 | 2) => {
    if (groupNum === 1) {
      onChange({ ...filters, group1: null });
    } else {
      onChange({ ...filters, group2: null });
    }
  };

  const handleAddCondition = (groupNum: 1 | 2) => {
    const group = groupNum === 1 ? filters.group1 : filters.group2;
    if (!group) return;

    const newCondition: FilterCondition = {
      field: 'isMcpUser',
      value: true,
    };

    const updatedGroup: FilterGroup = {
      ...group,
      conditions: [...group.conditions, newCondition],
    };

    if (groupNum === 1) {
      onChange({ ...filters, group1: updatedGroup });
    } else {
      onChange({ ...filters, group2: updatedGroup });
    }
  };

  const handleRemoveCondition = (groupNum: 1 | 2, conditionIndex: number) => {
    const group = groupNum === 1 ? filters.group1 : filters.group2;
    if (!group) return;

    const updatedGroup: FilterGroup = {
      ...group,
      conditions: group.conditions.filter((_, i) => i !== conditionIndex),
    };

    if (groupNum === 1) {
      onChange({ ...filters, group1: updatedGroup });
    } else {
      onChange({ ...filters, group2: updatedGroup });
    }
  };

  const handleConditionFieldChange = (groupNum: 1 | 2, conditionIndex: number, field: PowerFeatureField) => {
    const group = groupNum === 1 ? filters.group1 : filters.group2;
    if (!group) return;

    const updatedConditions = group.conditions.map((condition, i) =>
      i === conditionIndex ? { ...condition, field } : condition
    );

    const updatedGroup: FilterGroup = {
      ...group,
      conditions: updatedConditions,
    };

    if (groupNum === 1) {
      onChange({ ...filters, group1: updatedGroup });
    } else {
      onChange({ ...filters, group2: updatedGroup });
    }
  };

  const handleConditionValueChange = (groupNum: 1 | 2, conditionIndex: number, value: boolean) => {
    const group = groupNum === 1 ? filters.group1 : filters.group2;
    if (!group) return;

    const updatedConditions = group.conditions.map((condition, i) =>
      i === conditionIndex ? { ...condition, value } : condition
    );

    const updatedGroup: FilterGroup = {
      ...group,
      conditions: updatedConditions,
    };

    if (groupNum === 1) {
      onChange({ ...filters, group1: updatedGroup });
    } else {
      onChange({ ...filters, group2: updatedGroup });
    }
  };

  const handleOperatorChange = (groupNum: 1 | 2, operator: 'AND' | 'OR') => {
    const group = groupNum === 1 ? filters.group1 : filters.group2;
    if (!group) return;

    const updatedGroup: FilterGroup = {
      ...group,
      operator,
    };

    if (groupNum === 1) {
      onChange({ ...filters, group1: updatedGroup });
    } else {
      onChange({ ...filters, group2: updatedGroup });
    }
  };

  const renderGroup = (groupNum: 1 | 2) => {
    const group = groupNum === 1 ? filters.group1 : filters.group2;

    if (!group) {
      return (
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddGroup(groupNum)}
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Group {groupNum}
          </Button>
        </div>
      );
    }

    return (
      <div className="border rounded-lg p-3 bg-gray-50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Label className="text-xs font-medium text-gray-700">Group {groupNum}</Label>
            <Select
              value={group.operator}
              onValueChange={(value: 'AND' | 'OR') => handleOperatorChange(groupNum, value)}
            >
              <SelectTrigger className="h-7 w-20 text-xs border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-gray-500 italic">
              ({group.operator === 'AND' ? 'all' : 'any'} must match)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveGroup(groupNum)}
            className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
            title="Remove group"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          {group.conditions.map((condition, index) => (
            <div key={index} className="flex items-center space-x-2 bg-white rounded border border-gray-200 p-2 hover:border-gray-300 transition-colors">
              <Select
                value={condition.field}
                onValueChange={(value: PowerFeatureField) =>
                  handleConditionFieldChange(groupNum, index, value)
                }
              >
                <SelectTrigger className="h-8 flex-1 text-xs border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FIELD_LABELS).map(([field, label]) => (
                    <SelectItem key={field} value={field}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={condition.value ? 'Yes' : 'No'}
                onValueChange={(value) =>
                  handleConditionValueChange(groupNum, index, value === 'Yes')
                }
              >
                <SelectTrigger className="h-8 w-20 text-xs border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveCondition(groupNum, index)}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                title="Remove condition"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddCondition(groupNum)}
            className="h-8 w-full text-xs border-dashed border-gray-300 hover:border-gray-400"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Condition
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Advanced Filters</Label>
      
      <div className="space-y-3">
        {renderGroup(1)}
        
        {filters.group1 && filters.group2 && (
          <div className="flex items-center justify-center py-1">
            <div className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded border border-gray-300">
              AND (between groups)
            </div>
          </div>
        )}
        
        {renderGroup(2)}
      </div>
    </div>
  );
}

