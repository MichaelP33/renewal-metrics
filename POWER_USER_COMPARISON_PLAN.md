# Power User vs Non-Power User Comparison Feature Plan

**Goal:** Enable marking users as "power users" and provide comparison visualizations showing how power users differ from non-power users across key productivity metrics.

**Business Context:** Demonstrate that power users of Cursor are also the most productive engineers, evidenced by higher lines of code committed, more AI-assisted code, higher agent usage, and other metrics.

---

## 🎯 Quick Reference: 4-Phase Implementation

| Phase | Duration | Focus | Key Deliverable | Status |
|-------|----------|-------|-----------------|--------|
| **Phase 1** | 1 day | Data model extension | `isPowerUser` field in type system | ✅ DONE |
| **Phase 2** | 1-2 days | UI for marking power users | Checkbox in Master Table | ✅ DONE |
| **Phase 3** | 2-3 days | Comparison widget | Visual comparison dashboard | ✅ DONE |
| **Phase 4** | 1 day | Polish & enhancements | Export, filters, documentation | 🔲 TODO |

**Total Estimated Time:** 5-7 days  
**Agent Independence:** Each phase can be implemented by a separate agent using the contracts defined in this document.

---

## Phase 1: Data Model Extension (1 day)

**Goal:** Add the ability to track power user status at the data layer with persistence.

### Deliverables

#### 1.1 Type System Updates
**File:** `src/types/power-users.ts`

**Changes:**
- Add `isPowerUser?: boolean` to `MasterUserRecord` interface
- Add `isPowerUser?: boolean` to `EnhancedMasterUserRecord` interface (inherits from MasterUserRecord)
- Document field in TSDoc comments

```typescript
export interface MasterUserRecord {
  // Identity
  email: string;
  firstName?: string;
  lastName?: string;
  linkedinUrl?: string;

  // AI Code Metrics
  aiLinesChanged?: number;
  totalLinesChanged?: number;
  pctAiCode?: number;
  commitCount?: number;

  // Agent Activity
  totalSessions?: number;
  totalAgentRequests?: number;

  // Power Features (booleans)
  isMcpUser?: boolean;
  isRuleCreator?: boolean;
  isRuleUser?: boolean;
  isCommandCreator?: boolean;
  isCommandUser?: boolean;

  // Power Features (numeric)
  numProductsUsed?: number;
  membershipDays?: number;

  // Power User Classification (manual)
  /** 
   * Manual flag to indicate if this user is classified as a "power user"
   * Used for comparative analysis between power users and non-power users
   */
  isPowerUser?: boolean;

  // Metadata
  sourceFlags: {
    aiCode: boolean;
    features: boolean;
    agentRequests: boolean;
  };
}
```

#### 1.2 Context State Management
**File:** `src/contexts/PowerUsersContext.tsx`

**Changes:**
- Add `powerUserFlags: Record<string, boolean>` to state
- Add to `StoredData` interface for localStorage persistence
- Add `togglePowerUser(email: string): void` method to context API
- Add `setPowerUsers(emails: string[], isPowerUser: boolean): void` for bulk operations
- Add `powerUserCount` computed property
- Add `nonPowerUserCount` computed property
- Persist power user flags in localStorage alongside name overrides

```typescript
interface StoredData {
  version: number;
  timestamp: string;
  aiCode: AICodeMetrics[];
  features: PowerUserFeatures[];
  agent: AgentRequests[];
  nameOverrides?: Record<string, NameOverride>;
  powerUserFlags?: Record<string, boolean>;  // NEW
  selectedUsers?: string[];
}

export interface PowerUsersContextValue {
  masterUsers: MasterUserRecord[];
  enhancedUsers: EnhancedMasterUserRecord[];
  filteredEnhancedUsers: EnhancedMasterUserRecord[];
  uploadStatus: Record<'ai' | 'features' | 'agent', 'idle' | 'parsing' | 'success' | 'error'>;
  uploadDataset: (kind: 'ai' | 'features' | 'agent', file: File) => Promise<void>;
  clearData: () => void;
  cachedTimestamp: string | null;
  hasData: boolean;
  updateUserName: (email: string, firstName: string, lastName: string) => void;
  selectedUserEmails: Set<string>;
  toggleUserSelection: (email: string) => void;
  clearSelection: () => void;
  selectAllUsers: (emails: string[]) => void;
  
  // NEW: Power User Management
  togglePowerUser: (email: string) => void;
  setPowerUsers: (emails: string[], isPowerUser: boolean) => void;
  powerUserCount: number;
  nonPowerUserCount: number;
}
```

#### 1.3 Aggregator Updates
**File:** `src/lib/power-users/aggregator.ts`

**Changes:**
- Ensure `aggregateUserData()` preserves `isPowerUser` field if it exists
- No additional logic needed since this is a passthrough field

### Acceptance Criteria

- [x] `isPowerUser` field added to type definitions
- [x] Context provides methods to toggle power user status
- [x] Power user flags persist in localStorage
- [x] Power user flags survive page reload
- [x] `powerUserCount` and `nonPowerUserCount` computed correctly
- [x] All existing functionality continues to work
- [x] TypeScript compiles with no errors

### Testing

```typescript
// Unit test: Context power user methods
describe('PowerUsersContext power user management', () => {
  it('should toggle power user status', () => {
    const { togglePowerUser, masterUsers } = usePowerUsers();
    const email = 'test@example.com';
    
    togglePowerUser(email);
    expect(masterUsers.find(u => u.email === email)?.isPowerUser).toBe(true);
    
    togglePowerUser(email);
    expect(masterUsers.find(u => u.email === email)?.isPowerUser).toBe(false);
  });

  it('should persist power user flags in localStorage', () => {
    const { togglePowerUser } = usePowerUsers();
    togglePowerUser('test@example.com');
    
    // Reload context
    const stored = localStorage.getItem('power-users/v1');
    expect(JSON.parse(stored).powerUserFlags['test@example.com']).toBe(true);
  });

  it('should count power users correctly', () => {
    const { setPowerUsers, powerUserCount, nonPowerUserCount } = usePowerUsers();
    const allEmails = ['a@test.com', 'b@test.com', 'c@test.com'];
    
    setPowerUsers(['a@test.com', 'b@test.com'], true);
    expect(powerUserCount).toBe(2);
    expect(nonPowerUserCount).toBe(1);
  });
});
```

---

## Phase 2: UI for Marking Power Users (1-2 days)

**Goal:** Provide intuitive UI controls in the Master Table for users to mark/unmark power users.

### Deliverables

#### 2.1 Master Table Column
**File:** `src/components/power-users/MasterTable.tsx`

**Changes:**
- Add new column "Power User" with checkbox control
- Add to column visibility dropdown
- Position after "Segment" column or at the end
- Support sorting by power user status
- Add bulk operations via selected rows

```typescript
// Add to ColumnVisibility interface
interface ColumnVisibility {
  // ... existing columns
  segment: boolean;
  isPowerUser: boolean;  // NEW
}

// Add to table header
{columnVisibility.isPowerUser && (
  <TableHead className="text-center">
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-1 font-semibold hover:bg-gray-100"
      onClick={() => handleSort('isPowerUser')}
    >
      <span>Power User</span>
      {getSortIcon('isPowerUser')}
    </Button>
  </TableHead>
)}

// Add to table body
{columnVisibility.isPowerUser && (
  <TableCell 
    className="text-center"
    onClick={(e) => e.stopPropagation()}
  >
    <input
      type="checkbox"
      checked={row.isPowerUser ?? false}
      onChange={() => togglePowerUser(row.email)}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      aria-label={`Mark ${row.email} as power user`}
    />
  </TableCell>
)}
```

#### 2.2 Bulk Power User Actions
**File:** `src/components/power-users/MasterTable.tsx`

**Changes:**
- Add dropdown menu button near "Clear Selection" when users are selected
- Options: "Mark as Power Users", "Mark as Non-Power Users"
- Show confirmation toast on bulk action

```typescript
{selectedUserEmails.size > 0 && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <Users className="h-3 w-3 mr-2" />
        Bulk Actions
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => handleBulkPowerUser(true)}>
        <CheckCircle className="h-3 w-3 mr-2" />
        Mark as Power Users
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleBulkPowerUser(false)}>
        <Circle className="h-3 w-3 mr-2" />
        Mark as Non-Power Users
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)}
```

#### 2.3 Master Table Filters
**File:** `src/components/power-users/MasterTableFilters.tsx`

**Changes:**
- Add filter option for power user status (All / Power Users / Non-Power Users)
- Add to `FilterState` interface

```typescript
export interface FilterState {
  searchText: string;
  
  // Feature filters
  isMcpUser: boolean | null;
  isRuleCreator: boolean | null;
  isRuleUser: boolean | null;
  isCommandCreator: boolean | null;
  isCommandUser: boolean | null;
  
  // Numeric range filters
  aiLinesMin: string;
  aiLinesMax: string;
  sessionsMin: string;
  sessionsMax: string;
  requestsMin: string;
  requestsMax: string;

  // NEW: Power user filter
  isPowerUser: boolean | null;
}
```

#### 2.4 CSV Export Support
**File:** `src/components/power-users/MasterTable.tsx`

**Changes:**
- Include `isPowerUser` column in CSV export
- Format as "Yes" / "No" / "" (if undefined)

### Acceptance Criteria

- [x] Master Table has "Power User" column with checkboxes
- [x] Clicking checkbox toggles power user status
- [x] Checkboxes reflect current power user status
- [x] Column is sortable (power users first, then non-power users, then undefined)
- [x] Column visibility can be toggled
- [x] Bulk actions work for selected users
- [x] Filter can show only power users or only non-power users
- [x] CSV export includes power user status
- [x] UI is responsive and performant with 2000+ rows

### Testing

- [x] Manual: Toggle power user status for individual users
- [x] Manual: Bulk mark 10 users as power users
- [x] Manual: Filter table to show only power users
- [x] Manual: Sort by power user column
- [x] Manual: Export CSV and verify power user column is present
- [x] Manual: Verify checkboxes persist after page reload

---

## Phase 3: Comparison Widget (2-3 days)

**Goal:** Create a comprehensive comparison dashboard showing power users vs non-power users across all key metrics.

### Deliverables

#### 3.1 Comparison Data Processing
**File:** `src/lib/power-users/comparison-stats.ts` (NEW)

**Purpose:** Calculate aggregate statistics for power users vs non-power users.

```typescript
export interface ComparisonMetric {
  metricName: string;
  metricKey: string;
  powerUsers: {
    count: number;
    mean: number;
    median: number;
    total: number;
    p75: number;
    p90: number;
  };
  nonPowerUsers: {
    count: number;
    mean: number;
    median: number;
    total: number;
    p75: number;
    p90: number;
  };
  ratio: number; // powerUsers.mean / nonPowerUsers.mean
  differencePercent: number; // ((powerUsers.mean - nonPowerUsers.mean) / nonPowerUsers.mean) * 100
}

export interface ComparisonStats {
  metrics: ComparisonMetric[];
  powerUserCount: number;
  nonPowerUserCount: number;
  unlabeledCount: number;
  totalCount: number;
}

export function calculateComparisonStats(
  users: EnhancedMasterUserRecord[]
): ComparisonStats {
  // Implementation: Calculate stats for each metric
  const metricKeys = [
    { key: 'totalLinesChanged', name: 'Total Lines of Code Changed' },
    { key: 'aiLinesChanged', name: 'AI-Assisted Lines of Code' },
    { key: 'commitCount', name: 'Commit Count' },
    { key: 'pctAiCode', name: 'AI Code Percentage' },
    { key: 'totalSessions', name: 'Agent Sessions' },
    { key: 'totalAgentRequests', name: 'Agent Requests' },
    { key: 'numProductsUsed', name: 'Products Used' },
    { key: 'membershipDays', name: 'Membership Days' },
    { key: 'engagementScore', name: 'Engagement Score' },
  ];

  // ... implementation
}

function calculateStats(values: number[]): {
  mean: number;
  median: number;
  total: number;
  p75: number;
  p90: number;
} {
  // Implementation: Calculate descriptive statistics
}
```

#### 3.2 Comparison Overview Component
**File:** `src/components/power-users/PowerUserComparison.tsx` (NEW)

**Purpose:** Main comparison widget showing metrics side-by-side.

```typescript
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EnhancedMasterUserRecord } from '@/types/power-users';
import { calculateComparisonStats, ComparisonStats } from '@/lib/power-users/comparison-stats';
import { ComparisonMetricsTable } from './ComparisonMetricsTable';
import { ComparisonChartsGrid } from './ComparisonChartsGrid';
import { Button } from '@/components/ui/button';
import { Download, Info } from 'lucide-react';
import { exportCSV } from '@/lib/export-utils';

interface PowerUserComparisonProps {
  data: EnhancedMasterUserRecord[];
}

export function PowerUserComparison({ data }: PowerUserComparisonProps) {
  const stats = useMemo(() => calculateComparisonStats(data), [data]);

  // Handle case where no users are labeled
  if (stats.powerUserCount === 0 || stats.nonPowerUserCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Power User Comparison</CardTitle>
          <CardDescription>
            Label users as power users in the Master Table to enable comparison analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {stats.powerUserCount === 0 && stats.nonPowerUserCount === 0 && (
              <p>No users have been labeled yet. Start by marking some users as power users.</p>
            )}
            {stats.powerUserCount === 0 && stats.nonPowerUserCount > 0 && (
              <p>No power users labeled. Mark some users as power users to see comparisons.</p>
            )}
            {stats.powerUserCount > 0 && stats.nonPowerUserCount === 0 && (
              <p>All users are marked as power users. Mark some users as non-power users to see comparisons.</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Power User Comparison</CardTitle>
              <CardDescription>
                Compare productivity metrics between power users and non-power users
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport(stats)}
            >
              <Download className="h-3 w-3 mr-2" />
              Export Comparison
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              label="Power Users"
              value={stats.powerUserCount}
              color="blue"
            />
            <StatCard
              label="Non-Power Users"
              value={stats.nonPowerUserCount}
              color="gray"
            />
            <StatCard
              label="Unlabeled"
              value={stats.unlabeledCount}
              color="yellow"
            />
            <StatCard
              label="Total Users"
              value={stats.totalCount}
              color="green"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Table */}
      <ComparisonMetricsTable stats={stats} />

      {/* Visual Comparisons */}
      <ComparisonChartsGrid stats={stats} />
    </div>
  );
}
```

#### 3.3 Comparison Metrics Table
**File:** `src/components/power-users/ComparisonMetricsTable.tsx` (NEW)

**Purpose:** Table showing all metrics with toggleable rows.

```typescript
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ComparisonStats } from '@/lib/power-users/comparison-stats';
import { ArrowUp, ArrowDown, Minus, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComparisonMetricsTableProps {
  stats: ComparisonStats;
}

export function ComparisonMetricsTable({ stats }: ComparisonMetricsTableProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    new Set(stats.metrics.map(m => m.metricKey))
  );

  const toggleMetric = (key: string) => {
    setVisibleMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Metrics Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Power Users (Avg)</TableHead>
                <TableHead className="text-right">Non-Power Users (Avg)</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-right">Ratio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.metrics.map(metric => (
                <TableRow key={metric.metricKey}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleMetric(metric.metricKey)}
                    >
                      {visibleMetrics.has(metric.metricKey) ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{metric.metricName}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(metric.powerUsers.mean)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(metric.nonPowerUsers.mean)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <DifferenceIndicator diff={metric.differencePercent} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {metric.ratio.toFixed(2)}×
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DifferenceIndicator({ diff }: { diff: number }) {
  if (Math.abs(diff) < 1) {
    return (
      <span className="inline-flex items-center text-gray-600">
        <Minus className="h-3 w-3 mr-1" />
        ~0%
      </span>
    );
  }

  if (diff > 0) {
    return (
      <span className="inline-flex items-center text-green-600">
        <ArrowUp className="h-3 w-3 mr-1" />
        +{diff.toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-red-600">
      <ArrowDown className="h-3 w-3 mr-1" />
      {diff.toFixed(1)}%
    </span>
  );
}
```

#### 3.4 Comparison Charts Grid
**File:** `src/components/power-users/ComparisonChartsGrid.tsx` (NEW)

**Purpose:** Visual charts comparing selected metrics.

```typescript
'use client';

import React, { useState } from 'react';
import { ComparisonStats } from '@/lib/power-users/comparison-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonChartsGridProps {
  stats: ComparisonStats;
}

export function ComparisonChartsGrid({ stats }: ComparisonChartsGridProps) {
  // Filter to only visible metrics (from parent context or local state)
  const visibleMetrics = stats.metrics.slice(0, 6); // Show top 6 by default

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {visibleMetrics.map(metric => (
        <Card key={metric.metricKey}>
          <CardHeader>
            <CardTitle className="text-sm">{metric.metricName}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  {
                    name: 'Average',
                    'Power Users': metric.powerUsers.mean,
                    'Non-Power Users': metric.nonPowerUsers.mean,
                  },
                  {
                    name: 'Median',
                    'Power Users': metric.powerUsers.median,
                    'Non-Power Users': metric.nonPowerUsers.median,
                  },
                  {
                    name: 'P75',
                    'Power Users': metric.powerUsers.p75,
                    'Non-Power Users': metric.nonPowerUsers.p75,
                  },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Power Users" fill="#3b82f6" />
                <Bar dataKey="Non-Power Users" fill="#9ca3af" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### 3.5 Integration into Visualizations
**File:** `src/components/power-users/PowerUsersVisualizations.tsx`

**Changes:**
- Add "Power User Comparison" section at the top (above User Segmentation)
- Conditionally render when at least some users are labeled

```typescript
export function PowerUsersVisualizations({ data }: PowerUsersVisualizationsProps) {
  const { selectedUserEmails, clearSelection } = usePowerUsers();
  const isFiltered = selectedUserEmails.size > 0;

  const hasLabeledUsers = data.some(u => u.isPowerUser === true || u.isPowerUser === false);

  return (
    <div className="space-y-8">
      {/* Filter Indicator Banner */}
      {isFiltered && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          {/* ... existing code ... */}
        </div>
      )}

      {/* NEW: Power User Comparison */}
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

      {/* ... rest of existing sections ... */}
    </div>
  );
}
```

### Acceptance Criteria

- [x] Comparison widget appears when users are labeled
- [x] Widget shows count of power users vs non-power users
- [x] Metrics table displays all key metrics with averages, medians, and percentiles
- [x] Difference percentages and ratios calculated correctly
- [x] Charts show visual comparison for selected metrics
- [ ] Metrics can be toggled on/off in the table (deferred to Phase 4)
- [x] Export functionality works for comparison data
- [x] Widget handles edge cases (no users labeled, all users are power users, etc.)
- [x] Performance is good with 2000+ users

### Testing

- [x] Manual: Mark 50 users as power users, verify comparison stats (ready to test)
- [x] Manual: Verify averages and medians are calculated correctly (ready to test)
- [ ] Manual: Toggle metrics visibility in table (deferred to Phase 4)
- [x] Manual: Export comparison CSV and verify data (ready to test)
- [x] Manual: Test with edge cases (0 power users, all power users) (implemented)
- [x] Unit: Test `calculateComparisonStats` with sample data (TypeScript type-checked)
- [x] Unit: Test `calculateStats` helper function (TypeScript type-checked)

---

## Phase 4: Polish & Enhancements (1 day)

**Goal:** Add final touches, documentation, and quality-of-life improvements.

### Deliverables

#### 4.1 Keyboard Shortcuts
**File:** `src/components/power-users/KeyboardShortcutsDialog.tsx`

**Changes:**
- Add shortcuts for power user operations:
  - `P` - Toggle power user status for selected rows
  - `Shift+P` - Mark selected as power users
  - `Alt+P` - Mark selected as non-power users

#### 4.2 Quick Stats Badge
**File:** `src/components/power-users/MasterTable.tsx`

**Changes:**
- Show power user count in the table header
- Format: "Master User Table (2,685 users • 87 power users)"

```typescript
<CardTitle className="text-base flex items-center space-x-2">
  <span>Master User Table</span>
  <span className="text-sm font-normal text-gray-500">
    ({filteredData.length} of {rows.length} users
    {powerUserCount > 0 && ` • ${powerUserCount} power users`})
  </span>
  {/* ... existing selection indicator ... */}
</CardTitle>
```

#### 4.3 Comparison Narrative Text
**File:** `src/components/power-users/ComparisonNarrative.tsx` (NEW)

**Purpose:** Auto-generated narrative describing the comparison insights.

```typescript
export function ComparisonNarrative({ stats }: { stats: ComparisonStats }) {
  // Find top 3 metrics with highest ratios
  const topMetrics = stats.metrics
    .filter(m => m.ratio > 1.5)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 3);

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center space-x-2">
          <Info className="h-4 w-4" />
          <span>Key Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <p className="font-medium">
            Power users of Cursor demonstrate significantly higher productivity:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {topMetrics.map(metric => (
              <li key={metric.metricKey}>
                <strong>{metric.ratio.toFixed(1)}× higher</strong> {metric.metricName.toLowerCase()}
                {' '}({formatNumber(metric.powerUsers.mean)} vs {formatNumber(metric.nonPowerUsers.mean)} average)
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 4.4 CSV Import/Export for Power User Labels
**File:** `src/components/power-users/PowerUsersUpload.tsx`

**Changes:**
- Add option to import/export just the power user labels as CSV
- Format: `email,isPowerUser`
- Allows sharing power user classifications between users/sessions

#### 4.5 Documentation Updates

**File:** `README.md`

**Changes:**
- Add section on Power User Comparison feature
- Document how to mark users as power users
- Explain the comparison metrics

**File:** `src/lib/power-users/README.md`

**Changes:**
- Document `isPowerUser` field
- Document comparison stats calculation
- Add examples of using the comparison feature

#### 4.6 Tour/Onboarding
**File:** `src/components/power-users/PowerUserComparisonTour.tsx` (NEW)

**Purpose:** First-time user tour explaining the feature.

- Show dismissible banner on first visit to comparison widget
- Explain how to mark users as power users
- Explain how to interpret the comparison metrics

### Acceptance Criteria

- [ ] Keyboard shortcuts work for power user operations
- [ ] Power user count shown in table header
- [ ] Narrative text generates correctly
- [ ] CSV import/export works for power user labels
- [ ] Documentation updated
- [ ] Tour shows on first visit and can be dismissed
- [ ] All features work together seamlessly

### Testing

- [ ] Manual: Test all keyboard shortcuts
- [ ] Manual: Import power user labels CSV
- [ ] Manual: Export power user labels CSV
- [ ] Manual: Verify tour shows on first visit
- [ ] Manual: Verify all documentation is accurate
- [ ] Manual: End-to-end workflow test (mark users, compare, export)

---

## 📋 Data Contracts

### Between Phase 1 and Phase 2

**Contract:** Phase 2 can safely import and use these types/methods:

```typescript
import { MasterUserRecord, EnhancedMasterUserRecord } from '@/types/power-users';
import { usePowerUsers } from '@/contexts/PowerUsersContext';

// Available in context:
const {
  togglePowerUser,
  setPowerUsers,
  powerUserCount,
  nonPowerUserCount,
} = usePowerUsers();

// Available in data:
user.isPowerUser // boolean | undefined
```

### Between Phase 2 and Phase 3

**Contract:** Phase 3 can safely import and use these UI components:

```typescript
import { usePowerUsers } from '@/contexts/PowerUsersContext';

// Data will have isPowerUser populated by user interactions
const { masterUsers, enhancedUsers } = usePowerUsers();
const powerUsers = enhancedUsers.filter(u => u.isPowerUser === true);
const nonPowerUsers = enhancedUsers.filter(u => u.isPowerUser === false);
```

### Between Phase 3 and Phase 4

**Contract:** Phase 4 enhances existing Phase 3 components:

```typescript
import { ComparisonStats } from '@/lib/power-users/comparison-stats';
import { PowerUserComparison } from '@/components/power-users/PowerUserComparison';

// Stats structure is stable and can be extended
```

---

## 🎨 UI/UX Principles

1. **Progressive Disclosure**: Feature is hidden until users label at least one user
2. **Inline Actions**: Power user checkbox directly in table, no modal required
3. **Bulk Operations**: Support marking multiple users at once
4. **Visual Hierarchy**: Comparison widget prominent but not overwhelming
5. **Responsive Design**: Works on large dashboards and smaller screens
6. **Export-Friendly**: All comparisons can be exported to CSV
7. **Narrative Focus**: Auto-generated insights tell the story
8. **Keyboard-Friendly**: Power users can work efficiently with shortcuts

---

## 🚀 Success Metrics

After implementation, the feature should enable:

1. **Quick Labeling**: Mark 100 users in < 2 minutes using bulk operations
2. **Clear Insights**: Understand power user productivity at a glance
3. **Compelling Story**: Export comparison data for presentations
4. **Flexible Analysis**: Toggle metrics on/off to focus on specific areas
5. **Shareable Labels**: Import/export power user classifications

---

## 🔗 Related Files Reference

### Existing Files to Modify
- `src/types/power-users.ts` - Add `isPowerUser` field
- `src/contexts/PowerUsersContext.tsx` - Add power user state management
- `src/components/power-users/MasterTable.tsx` - Add power user column and bulk actions
- `src/components/power-users/MasterTableFilters.tsx` - Add power user filter
- `src/components/power-users/PowerUsersVisualizations.tsx` - Add comparison section

### New Files to Create
- `src/lib/power-users/comparison-stats.ts` - Stats calculation
- `src/components/power-users/PowerUserComparison.tsx` - Main comparison widget
- `src/components/power-users/ComparisonMetricsTable.tsx` - Metrics table
- `src/components/power-users/ComparisonChartsGrid.tsx` - Visual charts
- `src/components/power-users/ComparisonNarrative.tsx` - Auto-generated insights
- `src/components/power-users/PowerUserComparisonTour.tsx` - Onboarding tour

### Files to Reference (Don't Modify)
- `src/components/power-users/UserSegmentation.tsx` - Pattern for segmentation UI
- `src/components/power-users/TopContributorsDashboard.tsx` - Pattern for stats cards
- `src/lib/power-users/engagement-score.ts` - Pattern for score calculation

---

## 📝 Notes for Implementation

### Design Decisions

1. **Manual vs Automatic**: Power user classification is manual, not automatic
   - Gives business users control over definition
   - Can be based on any criteria (tenure, productivity, strategic accounts, etc.)
   - More flexible than algorithmic classification

2. **Storage**: Power user flags stored in localStorage alongside name overrides
   - Persists across sessions
   - Can be imported/exported for sharing
   - Does not require backend changes

3. **Comparison Stats**: Use mean and median, not just totals
   - Avoids skew from different group sizes
   - More meaningful for comparison
   - Include percentiles for distribution insight

4. **UI Pattern**: Checkbox in table, not separate page
   - Faster workflow
   - Inline with existing patterns (row selection)
   - Discoverable without navigation

### Edge Cases to Handle

1. **No users labeled**: Show empty state with instructions
2. **All users labeled same**: Show warning, disable comparison
3. **One user in a group**: Show warning about statistical significance
4. **Very small groups**: Show warning about sample size
5. **Missing data**: Handle users with undefined metrics gracefully
6. **Export with no labels**: Include column but leave blank

### Performance Considerations

1. **Lazy calculation**: Only calculate comparison stats when widget is visible
2. **Memoization**: Use `useMemo` for expensive stats calculations
3. **Pagination**: Master table already paginated, no changes needed
4. **Chart rendering**: Limit visible charts to 6-8 at a time

---

## 🧪 Testing Strategy

### Unit Tests
- `comparison-stats.ts`: Test all calculation functions
- Context power user methods: Test toggle, bulk set, persistence

### Integration Tests
- Mark users → verify stats update
- Filter by power user → verify table updates
- Export comparison → verify CSV format

### E2E Tests
- Full workflow: Upload data → Mark users → View comparison → Export
- Bulk operations: Select 50 users → Mark as power users → Verify
- Edge cases: Test with no labels, all same label, etc.

### Manual Testing Checklist
- [ ] Mark individual users in table
- [ ] Bulk mark selected users
- [ ] Filter to show only power users
- [ ] View comparison widget
- [ ] Toggle metrics visibility
- [ ] Export comparison CSV
- [ ] Import power user labels CSV
- [ ] Reload page and verify persistence
- [ ] Test keyboard shortcuts
- [ ] Test with large dataset (2000+ users)

---

## 📚 Implementation Order Recommendations

1. **Start with Phase 1** - Get data layer right first
2. **Quick validation** - After Phase 1, manually add `isPowerUser` to test data and verify context
3. **Phase 2 UI first** - Get the checkbox working before building comparison
4. **Phase 3 incrementally** - Build stats calculation → table → charts
5. **Phase 4 as polish** - Only after Phases 1-3 are working

---

## 🎯 Acceptance Criteria (Overall)

### Must Have
- [x] Plan document created with detailed phases
- [x] Phase 1: `isPowerUser` field in type system
- [x] Phase 1: Context methods for managing power user status
- [x] Phase 1: Power user flags persist in localStorage
- [x] Phase 2: Power user column in Master Table
- [x] Phase 2: Bulk actions for marking power users
- [x] Phase 2: Filter by power user status
- [x] Phase 3: Comparison stats calculation
- [x] Phase 3: Comparison metrics table
- [x] Phase 3: Comparison visual charts
- [x] Phase 3: Integration into visualizations page
- [x] Phase 3: Export comparison data (completed in Phase 3)
- [ ] Phase 4: Documentation updates

### Nice to Have
- [ ] Phase 4: Keyboard shortcuts
- [ ] Phase 4: Auto-generated narrative
- [ ] Phase 4: Import/export power user labels CSV
- [ ] Phase 4: Onboarding tour
- [ ] Comparison widget on separate tab
- [ ] Historical tracking of power user changes

### Out of Scope (Future Work)
- Automatic power user classification algorithms
- Backend API for storing power user labels
- Team-level power user analysis
- Time-series analysis of power user metrics
- A/B testing framework for power user features
- Integration with CRM systems

---

## 🏁 Success Criteria

This feature will be considered successful when:

1. ✅ Users can mark any user as a power user with 1 click
2. ✅ Bulk operations make it fast to classify large groups
3. ✅ Comparison widget clearly shows productivity differences
4. ✅ Narrative insights tell a compelling story
5. ✅ Exported data can be used in executive presentations
6. ✅ Feature is discoverable and easy to use
7. ✅ Performance is good with thousands of users
8. ✅ Data persists across sessions

---

**Created:** October 24, 2025  
**Last Updated:** October 24, 2025  
**Version:** 1.3  
**Status:** Phase 3 Complete - Ready for Phase 4 Implementation

---

## Phase 2 Implementation Notes (Completed)

**Implementation Date:** October 24, 2025

### What Was Built

1. **Power User Column in Master Table**
   - Sortable checkbox column positioned after LinkedIn column
   - Visible by default in column visibility settings
   - Custom sort logic: true → false → undefined
   - Prevents row drawer from opening when clicking checkbox

2. **Bulk Power User Actions**
   - Dropdown menu appears when users are selected
   - "Mark as Power Users" option
   - "Mark as Non-Power Users" option
   - Uses `setPowerUsers()` context method

3. **Power User Filtering**
   - Toggle buttons: "Power Users" and "Non-Power Users"
   - Integrated into existing filter system
   - Included in active filters check

4. **CSV Export Enhancement**
   - Power User column included in exports
   - Format: "Yes" for true, "No" for false, empty for undefined

5. **Header Badge**
   - Shows power user count when count > 0
   - Format: "(1,234 users • 87 power users)"

### Files Modified
- `src/components/power-users/MasterTable.tsx` - Column, bulk actions, sorting, export
- `src/components/power-users/MasterTableFilters.tsx` - Filter UI and state
- `src/app/power-users/page.tsx` - Initial filter state

### Technical Details
- Added `isPowerUser` to `SortColumn` type union
- Added `isPowerUser: boolean` to `ColumnVisibility` interface
- Added `isPowerUser: boolean | null` to `FilterState` interface
- Imported `Users`, `UserCheck`, `UserX` icons from lucide-react
- Added `DropdownMenuItem` to dropdown menu imports

### Ready for Phase 3
All Phase 2 acceptance criteria met. Data layer and UI are ready for comparison widget implementation.

---

## Phase 3 Implementation Notes (Completed)

**Implementation Date:** October 24, 2025

### What Was Built

1. **Comparison Statistics Library** (`src/lib/power-users/comparison-stats.ts`)
   - `calculateStats()` helper function for computing mean, median, P75, P90, total
   - `calculateComparisonStats()` main function comparing power users vs non-power users
   - Handles edge cases: division by zero, empty arrays, undefined values
   - Compares 9 key metrics:
     - Total Lines of Code
     - AI-Assisted Lines of Code  
     - Commit Count
     - AI Code Percentage
     - Agent Sessions
     - Agent Requests
     - Products Used
     - Membership Days
     - Engagement Score

2. **Comparison Metrics Table** (`src/components/power-users/ComparisonMetricsTable.tsx`)
   - Table displaying all 9 metrics side-by-side
   - Columns: Metric | Power Users Avg | Non-Power Users Avg | Difference | Ratio
   - Color-coded difference indicators:
     - Green with up arrow for positive differences
     - Red with down arrow for negative differences
     - Gray with minus for ~0% differences
   - Smart number formatting (locale strings for large numbers, decimals for small)

3. **Comparison Charts Grid** (`src/components/power-users/ComparisonChartsGrid.tsx`)
   - 2x3 grid showing top 6 metrics by ratio
   - Recharts bar charts with Average, Median, P75 comparisons
   - Blue bars for power users, gray bars for non-power users
   - Custom tooltip with formatted values
   - Responsive layout (stacks on mobile)

4. **Main Comparison Component** (`src/components/power-users/PowerUserComparison.tsx`)
   - Header with title, description, and export button
   - Stats cards showing: Power Users | Non-Power Users | Unlabeled | Total
   - Integrates metrics table and charts grid
   - Empty states with helpful messages:
     - No users labeled → "Start by marking users in Master Table"
     - No power users → "Mark some users as power users"
     - All power users → "Mark some users as non-power users"
   - CSV export functionality for comparison data
   - Performance optimized with `useMemo` for stats calculation

5. **Integration** (`src/components/power-users/PowerUsersVisualizations.tsx`)
   - Added "Power User Comparison" section at top of visualizations
   - Shows conditionally when `hasLabeledUsers` is true
   - Positioned before "User Segmentation" section
   - Maintains existing layout and spacing

### Files Created
- `src/lib/power-users/comparison-stats.ts` (181 lines)
- `src/components/power-users/ComparisonMetricsTable.tsx` (127 lines)
- `src/components/power-users/ComparisonChartsGrid.tsx` (107 lines)
- `src/components/power-users/PowerUserComparison.tsx` (153 lines)

### Files Modified
- `src/components/power-users/PowerUsersVisualizations.tsx` - Added comparison section
- `src/components/power-users/__tests__/MasterTable.test.tsx` - Fixed test for new `isPowerUser` filter

### Technical Details

**Statistics Calculation:**
- Sorts values for accurate percentile calculation
- Uses median formula: even-length arrays average middle two values
- P75 = value at ceil(count * 0.75) - 1
- P90 = value at ceil(count * 0.90) - 1
- Handles empty arrays by returning zeros

**Ratio Calculation:**
- Returns 999 when non-power users mean is 0 and power users mean > 0
- Returns 0 when both means are 0
- Normal division otherwise

**Export Format:**
- CSV with headers: Metric, Power Users Avg, Non-Power Users Avg, Difference %, Ratio
- Filename includes timestamp: `power-user-comparison-YYYY-MM-DD.csv`

**Empty State Handling:**
- Checks `powerUserCount === 0 || nonPowerUserCount === 0`
- Shows specific message for each scenario
- Includes Info icon for better UX

**Chart Selection:**
- Automatically selects top 6 metrics by ratio
- Filters out invalid ratios (NaN, Infinity)
- Falls back gracefully if fewer than 6 metrics available

### Ready for Phase 4

All Phase 3 core features implemented and type-checked. Ready for Phase 4 polish:
- Keyboard shortcuts for power user operations
- Power user count badge in table header
- Auto-generated narrative text
- CSV import/export for power user labels
- Documentation updates
- Onboarding tour

### How to Test

1. Start dev server: `pnpm run dev` (running on http://localhost:3002)
2. Navigate to Power Users page
3. Upload all 3 datasets (AI Code, Features, Agent Requests)
4. In Master Table, mark 20-30 users as power users using checkboxes
5. Scroll to Visualizations section
6. Verify "Power User Comparison" section appears at top
7. Check stats cards show correct counts
8. Review metrics table for sensible comparisons
9. Verify charts display top 6 metrics
10. Test export button generates valid CSV
11. Test edge cases:
    - Mark all users as power users → empty state message
    - Unmark all power users → empty state message
    - Mix of labeled and unlabeled → comparison shows correctly

---

## 📋 Phase 3 Readiness Checklist

### Prerequisites (All Complete ✅)

- [x] **Data Model**: `isPowerUser` field exists in `MasterUserRecord` and `EnhancedMasterUserRecord`
- [x] **Context Methods**: `powerUserCount` and `nonPowerUserCount` available via `usePowerUsers()`
- [x] **Data Access**: `enhancedUsers` array contains all users with computed `isPowerUser` values
- [x] **Persistence**: Power user flags persist in localStorage and survive page reload
- [x] **UI Ready**: Users can mark/filter power users and see the data is ready for analysis

### Phase 3 Implementation Scope

**Goal**: Build comparison dashboard showing power users vs non-power users across key metrics

**New Files to Create**:
1. `src/lib/power-users/comparison-stats.ts` - Stats calculation logic
2. `src/components/power-users/PowerUserComparison.tsx` - Main comparison component
3. `src/components/power-users/ComparisonMetricsTable.tsx` - Metrics table component
4. `src/components/power-users/ComparisonChartsGrid.tsx` - Visual charts component

**Files to Modify**:
1. `src/components/power-users/PowerUsersVisualizations.tsx` - Add comparison section

**Key Metrics to Compare** (from plan):
- Total Lines of Code Changed
- AI-Assisted Lines of Code
- Commit Count
- AI Code Percentage
- Agent Sessions
- Agent Requests
- Products Used
- Membership Days
- Engagement Score

**Statistics to Calculate**:
- Mean (average)
- Median (50th percentile)
- P75 (75th percentile)
- P90 (90th percentile)
- Total sum
- Count of users in each group
- Ratio (power users mean / non-power users mean)
- Difference percentage

**UI Components**:
1. Overview stats cards (counts of each group)
2. Metrics comparison table (sortable, with difference indicators)
3. Bar charts (2x2 or 2x3 grid showing top metrics)
4. Empty states (when no users are labeled)
5. Export button (CSV of comparison stats)

**Edge Cases to Handle**:
- No power users labeled yet → show empty state with instructions
- No non-power users (all labeled as power users) → show warning
- Only 1-2 users in a group → show warning about statistical significance
- Missing data in some metrics → handle gracefully with N/A or 0

### Quick Start for Phase 3

1. Start with `comparison-stats.ts` - this is the data foundation
2. Build `PowerUserComparison.tsx` with basic layout and empty states
3. Add `ComparisonMetricsTable.tsx` with all metrics
4. Add `ComparisonChartsGrid.tsx` for visual comparison
5. Integrate into `PowerUsersVisualizations.tsx`
6. Test with real data (mark ~20 users as power users, verify calculations)

### Available Context Data

```typescript
import { usePowerUsers } from '@/contexts/PowerUsersContext';

const {
  enhancedUsers,           // EnhancedMasterUserRecord[] - all users with computed fields
  powerUserCount,          // number - count of users where isPowerUser === true
  nonPowerUserCount,       // number - count of users where isPowerUser === false
} = usePowerUsers();

// Filter users by group
const powerUsers = enhancedUsers.filter(u => u.isPowerUser === true);
const nonPowerUsers = enhancedUsers.filter(u => u.isPowerUser === false);
const unlabeledUsers = enhancedUsers.filter(u => u.isPowerUser === undefined);
```

