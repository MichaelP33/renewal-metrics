'use client';

import React from 'react';
import { Settings2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  ModelCategory, 
  ModelCategoryConfig, 
  CATEGORY_ORDER, 
  MODEL_COLORS 
} from '@/types';
import { getCategoryDescription } from '@/lib/model-categorization';

interface ModelSelectorProps {
  enabledCategories: Set<ModelCategory>;
  onCategoriesChange: (categories: Set<ModelCategory>) => void;
  categoryCounts?: Record<ModelCategory, number>;
}

export function ModelSelector({ 
  enabledCategories, 
  onCategoriesChange, 
  categoryCounts = {} as Record<ModelCategory, number> 
}: ModelSelectorProps) {
  const handleCategoryToggle = (category: ModelCategory) => {
    const newCategories = new Set(enabledCategories);
    
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    
    onCategoriesChange(newCategories);
  };

  const handleSelectAll = () => {
    onCategoriesChange(new Set(CATEGORY_ORDER));
  };

  const handleSelectNone = () => {
    onCategoriesChange(new Set());
  };

  const handleSelectMainModels = () => {
    const mainModels: ModelCategory[] = ['Opus', 'Sonnet', 'GPT-5', 'Gemini', 'Auto'];
    onCategoriesChange(new Set(mainModels));
  };

  const getEnabledCount = () => enabledCategories.size;
  const getTotalCount = () => CATEGORY_ORDER.length;

  const getCategoryDisplayName = (category: ModelCategory): string => {
    const count = categoryCounts[category] || 0;
    const countText = count > 0 ? ` (${count})` : '';
    return `${category}${countText}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings2 className="h-4 w-4" />
            <span>Model Categories</span>
          </div>
          <div className="text-sm font-normal text-gray-500">
            {getEnabledCount()} of {getTotalCount()} selected
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectNone}
            className="text-xs"
          >
            None
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectMainModels}
            className="text-xs"
          >
            Main Models
          </Button>
        </div>

        <Separator />

        {/* Category List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {CATEGORY_ORDER.map((category) => {
            const isEnabled = enabledCategories.has(category);
            const count = categoryCounts[category] || 0;
            
            return (
              <div
                key={category}
                className={`
                  flex items-start space-x-3 p-2 rounded-md transition-colors
                  ${isEnabled ? 'bg-gray-50' : 'bg-white hover:bg-gray-25'}
                `}
              >
                <Checkbox
                  id={`category-${category}`}
                  checked={isEnabled}
                  onCheckedChange={() => handleCategoryToggle(category)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {/* Color indicator */}
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: MODEL_COLORS[category] }}
                    />
                    
                    <Label
                      htmlFor={`category-${category}`}
                      className={`
                        text-sm font-medium cursor-pointer
                        ${isEnabled ? 'text-gray-900' : 'text-gray-600'}
                      `}
                    >
                      {getCategoryDisplayName(category)}
                    </Label>
                    
                    {isEnabled ? (
                      <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {getCategoryDescription(category)}
                  </p>
                  
                  {count === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      No data available
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Summary */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <strong>Note:</strong> Deselected categories will be grouped into "Other"
          </p>
          <p>
            Categories with no data will show as empty in charts
          </p>
        </div>

        {/* Legend Preview */}
        {getEnabledCount() > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">
              Chart Colors Preview
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {Array.from(enabledCategories).map((category) => (
                <div
                  key={category}
                  className="flex items-center space-x-2 text-xs"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: MODEL_COLORS[category] }}
                  />
                  <span className="truncate">{category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
