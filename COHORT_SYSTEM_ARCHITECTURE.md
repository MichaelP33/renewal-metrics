# Cohort System Architecture

## Overview

The Cohort Comparison System enables flexible analysis of user groups through complex filter criteria and side-by-side metric comparisons. This document provides a technical overview of the system architecture, data flows, and extension points.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PowerUsersContext                         │
│  (State Management & Orchestration)                          │
└───────────────┬──────────────────────────┬──────────────────┘
                │                          │
    ┌───────────▼─────────┐    ┌──────────▼──────────┐
    │   Cohort Manager    │    │   Filter Utilities  │
    │  (CRUD Operations)  │    │  (User Filtering)   │
    └─────────────────────┘    └─────────────────────┘
                │                          │
    ┌───────────▼──────────────────────────▼──────────┐
    │           localStorage (Persistence)             │
    └──────────────────────────────────────────────────┘
                          │
    ┌─────────────────────▼────────────────────────────┐
    │           Data Processing Layer                   │
    │  - cohort-filtering.ts                           │
    │  - cohort-aggregation.ts                         │
    │  - multi-cohort-stats.ts                         │
    └──────────────────────────────────────────────────┘
                          │
    ┌─────────────────────▼────────────────────────────┐
    │        Visualization Components                   │
    │  - ComparisonMetricsTable                        │
    │  - FeatureAdoptionHeatmap                        │
    │  - RadarChartComparison                          │
    │  - ComparisonChartsGrid                          │
    └──────────────────────────────────────────────────┘
```

## Data Flow

### 1. Cohort Creation Flow

```
User applies filters in Master Table
    ↓
Filters captured in FilterState
    ↓
User clicks "Save as Cohort"
    ↓
SaveCohortDialog validates name
    ↓
createCohort() generates cohort with:
    - Unique ID
    - Assigned color
    - Timestamp
    - Filter criteria
    ↓
saveCohort() persists to localStorage
    ↓
PowerUsersContext updates savedCohorts state
    ↓
SavedCohortsPanel displays new cohort
```

### 2. Multi-Cohort Comparison Flow

```
User selects 2-6 cohorts in ComparisonBuilder
    ↓
Context tracks selectedCohortIds
    ↓
On "Compare" click:
    ↓
getUsersForCohorts() filters users for each cohort
    ↓
calculateCohortMetrics() aggregates statistics per cohort
    ↓
calculateMultiCohortStats() generates comparison data
    ↓
Visualizations render with cohort colors and data
```

## Key Data Types

### Cohort

```typescript
interface Cohort {
  id: string;                    // UUID
  name: string;                  // User-provided name
  color: string;                 // Hex color from palette
  createdAt: string;             // ISO timestamp
  filterCriteria: FilterState;   // Filter definition
}
```

### FilterState

```typescript
interface FilterState {
  searchText: string;
  isMcpUser: boolean | null;
  isRuleCreator: boolean | null;
  isRuleUser: boolean | null;
  isCommandCreator: boolean | null;
  isCommandUser: boolean | null;
  aiLinesMin: string;
  aiLinesMax: string;
  sessionsMin: string;
  sessionsMax: string;
  requestsMin: string;
  requestsMax: string;
  engagementScoreMin: string;
  engagementScoreMax: string;
  isPowerUserFilter: string[];
}
```

### MultiCohortStats

```typescript
interface MultiCohortStats {
  cohorts: Array<{
    cohort: Cohort;
    metrics: CohortMetrics;
  }>;
  comparisonMetrics: Array<{
    metricName: string;
    metricKey: string;
    values: Record<string, number>;
    range: { min: number; max: number };
    spread: number;
  }>;
}
```

### CohortMetrics

```typescript
interface CohortMetrics {
  userCount: number;
  metrics: Record<MetricKey, {
    mean: number;
    median: number;
    p75: number;
    p90: number;
    min: number;
    max: number;
    total: number;
  }>;
  featureAdoption: Record<FeatureKey, number>;
}
```

## Component Hierarchy

```
PowerUsersPage
├── PowerUsersUpload
├── MasterTable
│   ├── MasterTableFilters
│   │   ├── SaveCohortDialog
│   │   └── SavedCohortsPanel
│   │       ├── CohortBadge
│   │       ├── EditCohortDialog
│   │       └── DeleteCohortDialog
│   └── [Table rows]
├── PowerUsersVisualizations
│   ├── ComparisonBuilder
│   │   └── CohortSelector (x6 slots)
│   └── PowerUserComparison
│       ├── ComparisonMetricsTable
│       ├── ComparisonChartsGrid
│       ├── FeatureAdoptionHeatmap
│       └── RadarChartComparison
└── CohortWorkflowGuide
```

## Core Utilities

### Cohort Management (`cohort-manager.ts`)

- **createCohort()**: Creates new cohort with UUID and color assignment
- **saveCohort()**: Persists to localStorage with update/insert logic
- **loadCohorts()**: Retrieves all cohorts from localStorage
- **deleteCohort()**: Removes cohort by ID
- **updateCohort()**: Updates cohort properties
- **getCohortById()**: Retrieves single cohort by ID
- **assignCohortColor()**: Cycles through 8-color palette

### Filter Processing (`filter-utils.ts`)

- **applyFilters()**: Filters user array by FilterState criteria
- **getFilterSummary()**: Generates human-readable filter description

### Cohort Filtering (`cohort-filtering.ts`)

- **getUsersForCohort()**: Filters users for single cohort
- **getUsersForCohorts()**: Filters users for multiple cohorts (returns Map)

### Statistical Aggregation (`cohort-aggregation.ts`)

- **calculateCohortMetrics()**: Computes comprehensive statistics for a user group
  - Mean, median, p75, p90, min, max, total for all metrics
  - Feature adoption percentages

### Multi-Cohort Analysis (`multi-cohort-stats.ts`)

- **calculateMultiCohortStats()**: Main entry point for comparison analysis
  - Orchestrates filtering and aggregation for N cohorts
  - Computes comparison metrics (min, max, spread)

### Export/Import (`cohort-export-utils.ts`)

- **exportCohortComparison()**: Exports comparison as CSV
- **exportCohortDefinitions()**: Exports cohorts as JSON
- **importCohortDefinitions()**: Imports and validates cohorts from JSON
- **exportCohortUserList()**: Exports users for single cohort as CSV

## Context API (PowerUsersContext)

### State

- `savedCohorts`: Array of all saved cohorts
- `selectedCohortIds`: Array of cohort IDs in current comparison
- `enhancedUsers`: User data with engagement scores

### Cohort Operations

- `createCohort(name, filterCriteria)`
- `deleteCohort(id)`
- `updateCohort(id, updates)`
- `selectCohortForComparison(id)`
- `deselectCohortForComparison(id)`
- `clearComparisonCohorts()`
- `getSelectedCohorts()`: Returns full cohort objects for selected IDs
- `getMultiCohortStats(cohortIds)`: Generates comparison statistics

## Storage Schema

### localStorage Keys

- **`power-users-cohorts/v1`**: Array of stored cohorts
- **`cohort-workflow-guide-dismissed`**: Boolean flag for guide dismissal

### Cohort Storage Format

```json
[
  {
    "id": "cohort_1640000000000_abc123",
    "name": "Power Users",
    "color": "#f54e00",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "filterCriteria": {
      "searchText": "",
      "isMcpUser": true,
      "engagementScoreMin": "70",
      ...
    }
  }
]
```

## Color Palette

```typescript
const COHORT_COLORS = [
  '#f54e00',  // Cursor orange
  '#526070',  // Muted slate
  '#D4A27F',  // Tan/beige
  '#7C9885',  // Muted sage green
  '#9B7E6B',  // Muted brown
  '#6B8E9F',  // Muted blue-gray
  '#B4846C',  // Muted terracotta
  '#8A9BA8',  // Muted steel blue
];
```

Colors assigned sequentially based on cohort creation order. After 8 cohorts, colors cycle back.

## Extension Guidelines

### Adding a New Filter Type

1. **Update FilterState** in `MasterTableFilters.tsx`
2. **Add filter UI** in `MasterTableFilters.tsx`
3. **Update filter logic** in `filter-utils.ts` (`applyFilters()`)
4. **Update filter summary** in `filter-utils.ts` (`getFilterSummary()`)
5. **Test filtering** with cohort creation and comparison

### Adding a New Metric

1. **Add metric to data types** in `types/power-users.ts`
2. **Update aggregation** in `cohort-aggregation.ts`:
   - Add to `NUMERIC_METRICS` array
   - Ensure type includes new metric
3. **Update comparison display names** in `multi-cohort-stats.ts`
4. **Update visualizations** to include new metric
5. **Update export formats** in `cohort-export-utils.ts`

### Adding a New Visualization

1. **Create component** in `components/power-users/`
2. **Accept `MultiCohortStats` as prop**
3. **Use cohort colors** from `cohort.color`
4. **Add to `PowerUserComparison.tsx`**
5. **Ensure responsive design** (mobile/tablet/desktop)
6. **Add to export** if applicable

## Performance Considerations

- **Filtering**: O(n) where n = number of users
- **Aggregation**: O(n) per cohort
- **Multi-cohort comparison**: O(n * c) where c = number of cohorts
- **Target performance**: <1s for 6 cohorts with 1000 users

### Optimization Strategies

- Use `useMemo` for expensive calculations
- Debounce filter inputs (300ms)
- Lazy load visualizations if needed
- Consider pagination for 10,000+ users

## Error Handling

- **localStorage quota exceeded**: Graceful degradation, warn user
- **Invalid JSON import**: Validate and report specific errors
- **Missing data**: Safe defaults (empty arrays, 0 values)
- **Type mismatches**: Runtime validation with TypeScript guards

## Testing Strategy

- **Unit tests**: All utility functions (100% coverage target)
- **Component tests**: Key interactions and rendering
- **Integration tests**: End-to-end workflows
- **Manual testing**: Full user journeys with sample data

## Browser Compatibility

- **Minimum**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **localStorage**: Required (no fallback)
- **FileReader API**: Required for import/export
- **Recharts**: Modern browser SVG support

## Future Enhancements

1. **Backend persistence**: Save cohorts to database
2. **Collaboration**: Share cohorts via URL
3. **Time-based analysis**: Track cohort evolution
4. **Advanced visualizations**: Sankey diagrams, funnel charts
5. **Custom metrics**: User-defined calculations
6. **A/B testing**: Compare experiment cohorts

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Development Team

