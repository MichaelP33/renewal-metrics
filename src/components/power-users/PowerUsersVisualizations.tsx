'use client';

import React from 'react';
import { EnhancedMasterUserRecord } from '@/types/power-users';
import { SessionsByUserChart } from './SessionsByUserChart';
import { AgentRequestsByUserChart } from './AgentRequestsByUserChart';
import { PowerFeaturesMatrix } from './PowerFeaturesMatrix';
import { AICodeDistributionChart } from './AICodeDistributionChart';
import { UserSegmentation } from './UserSegmentation';
import { TopContributorsDashboard } from './TopContributorsDashboard';
import { FeatureAdoptionMatrix } from './FeatureAdoptionMatrix';

interface PowerUsersVisualizationsProps {
  data: EnhancedMasterUserRecord[];
}

export function PowerUsersVisualizations({ data }: PowerUsersVisualizationsProps) {
  return (
    <div className="space-y-8">
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

      {/* Sessions & Requests */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Sessions & Requests</h2>
        <div className="space-y-6">
          <SessionsByUserChart data={data} />
          <AgentRequestsByUserChart data={data} />
        </div>
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

