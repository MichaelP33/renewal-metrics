'use client';

import React from 'react';
import { EnhancedMasterUserRecord } from '@/types/power-users';
import { CombinedActivityChart } from './CombinedActivityChart';
import { PowerFeaturesMatrix } from './PowerFeaturesMatrix';
import { AICodeDistributionChart } from './AICodeDistributionChart';
import { UserSegmentation } from './UserSegmentation';
import { TopContributorsDashboard } from './TopContributorsDashboard';
import { FeatureAdoptionMatrix } from './FeatureAdoptionMatrix';
import { PowerUserComparison } from './PowerUserComparison';
import { ComparisonBuilder } from './ComparisonBuilder';
import { usePowerUsers } from '@/contexts/PowerUsersContext';
import { XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PowerUsersVisualizationsProps {
  data: EnhancedMasterUserRecord[];
}

export function PowerUsersVisualizations({ data }: PowerUsersVisualizationsProps) {
  const { selectedUserEmails, clearSelection, savedCohorts, selectedCohortIds } = usePowerUsers();
  const isFiltered = selectedUserEmails.size > 0;

  // Check if any users are labeled as power users or non-power users
  const hasLabeledUsers = data.some(u => u.isPowerUser === true || u.isPowerUser === false);

  return (
    <div className="space-y-8">
      {/* Filter Indicator Banner */}
      {isFiltered && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Showing {selectedUserEmails.size} selected user{selectedUserEmails.size !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Visualizations are filtered to selected users only
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            className="flex items-center space-x-2 bg-white hover:bg-blue-50"
          >
            <span>View All Users</span>
          </Button>
        </div>
      )}

      {/* Cohort Comparison Section */}
      {savedCohorts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Cohort Comparison</h2>
          <div className="space-y-4">
            <ComparisonBuilder />
            
            {/* Comparison View or Placeholder */}
            {selectedCohortIds.length >= 2 ? (
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                <CardContent className="p-8 text-center">
                  <Info className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Multi-Cohort Comparison Ready
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {selectedCohortIds.length} cohorts selected for comparison
                  </p>
                  <p className="text-sm text-gray-500">
                    Phase 5 & 6: Advanced comparison visualizations will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select Cohorts to Compare
                  </h3>
                  <p className="text-gray-600">
                    Choose at least 2 cohorts from the builder above to see detailed comparisons
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Power User Comparison */}
      {hasLabeledUsers && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Power User Comparison</h2>
          <PowerUserComparison data={data} />
        </section>
      )}

      {/* User Segmentation */}
      <section>
        <h2 className="text-lg font-semibold mb-4">User Segmentation</h2>
        <UserSegmentation data={data} />
      </section>

      {/* Top Contributors */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Top Contributors</h2>
        <TopContributorsDashboard data={data} />
      </section>

      {/* AI Code Distribution */}
      <section>
        <h2 className="text-lg font-semibold mb-4">AI Code Distribution</h2>
        <AICodeDistributionChart data={data} />
      </section>

      {/* User Activity */}
      <section>
        <h2 className="text-lg font-semibold mb-4">User Activity</h2>
        <CombinedActivityChart data={data} />
      </section>

      {/* Feature Adoption */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Feature Adoption</h2>
        <div className="space-y-6">
          <PowerFeaturesMatrix data={data} />
          <FeatureAdoptionMatrix data={data} />
        </div>
      </section>
    </div>
  );
}

