'use client';

import React, { useMemo } from 'react';
import { MultiCohortStats } from '@/lib/power-users/multi-cohort-stats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { COHORT_COLOR_ARRAY } from '@/types';

interface FeatureAdoptionHeatmapProps {
  stats: MultiCohortStats;
}

/**
 * Features to display in the heatmap
 */
const FEATURES = [
  { key: 'isMcpUser', label: 'MCP' },
  { key: 'isRuleCreator', label: 'Rules (Creator)' },
  { key: 'isRuleUser', label: 'Rules (User)' },
  { key: 'isCommandCreator', label: 'Commands (Creator)' },
  { key: 'isCommandUser', label: 'Commands (User)' },
] as const;

/**
 * Converts a percentage (0-100) to a color intensity
 * Uses gradient from white to Cursor orange (#f54e00)
 */
function getColorIntensity(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, percentage));
  const intensity = clamped / 100;
  
  // Base color: Cursor orange #f54e00
  const r = parseInt('f5', 16);
  const g = parseInt('4e', 16);
  const b = parseInt('00', 16);
  
  // Blend with white (255, 255, 255)
  const blendR = Math.round(r + (255 - r) * (1 - intensity));
  const blendG = Math.round(g + (255 - g) * (1 - intensity));
  const blendB = Math.round(b + (255 - b) * (1 - intensity));
  
  return `rgb(${blendR}, ${blendG}, ${blendB})`;
}

/**
 * Gets text color (black or white) based on background intensity
 */
function getTextColor(percentage: number): string {
  return percentage > 50 ? 'text-white' : 'text-gray-900';
}

export function FeatureAdoptionHeatmap({ stats }: FeatureAdoptionHeatmapProps) {
  const heatmapData = useMemo(() => {
    return stats.cohorts.map(({ cohort, metrics }) => ({
      cohortName: cohort.name,
      cohortColor: cohort.color,
      features: FEATURES.map(feature => ({
        label: feature.label,
        percentage: metrics.featureAdoption[feature.key as keyof typeof metrics.featureAdoption] || 0,
      })),
    }));
  }, [stats.cohorts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Feature Adoption Heatmap</CardTitle>
        <CardDescription>
          Percentage of users in each cohort using each power feature
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Header row */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="font-medium text-sm text-gray-600">Cohort</div>
              {FEATURES.map(feature => (
                <div key={feature.key} className="font-medium text-sm text-gray-600 text-center">
                  {feature.label}
                </div>
              ))}
            </div>
            
            {/* Data rows */}
            {heatmapData.map((row, index) => (
              <div key={row.cohortName} className="grid grid-cols-6 gap-2 mb-2">
                {/* Cohort name with color indicator */}
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COHORT_COLOR_ARRAY[index % COHORT_COLOR_ARRAY.length] }}
                  />
                  <span className="text-sm font-medium truncate">{row.cohortName}</span>
                </div>
                
                {/* Feature cells */}
                {row.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="text-center rounded px-2 py-2 flex items-center justify-center"
                    style={{ backgroundColor: getColorIntensity(feature.percentage) }}
                  >
                    <span className={`text-xs font-semibold ${getTextColor(feature.percentage)}`}>
                      {feature.percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>0%</span>
          <div className="flex-1 mx-2 h-3 rounded" style={{ 
            background: 'linear-gradient(to right, rgb(255, 255, 255), rgb(245, 78, 0))' 
          }} />
          <span>100%</span>
        </div>
      </CardContent>
    </Card>
  );
}

