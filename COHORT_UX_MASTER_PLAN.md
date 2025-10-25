# Cohort UX Master Plan

## Overview
Transform the Power Users Analytics feature into a flexible multi-cohort comparison system that enables quick analysis of any user groups based on complex filter criteria.

## Progress Tracker

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Completed | Simplify and Enhance Engagement Score |
| Phase 2 | ✅ Completed | Cohort Data Model and Storage |
| Phase 3 | ✅ Completed | Cohort Management UI |
| Phase 4 | ✅ Completed | Multi-Cohort Comparison Builder |
| Phase 5 | ⏳ Pending | Multi-Cohort Data Processing |
| Phase 6 | ⏳ Pending | Enhanced Comparison Visualizations |
| Phase 7 | ⏳ Pending | UX Polish and Final Integration |
| Phase 8 | ⏳ Pending | Documentation and Testing |

## Design Principles
- **Progressive Enhancement**: Each phase adds value without breaking existing functionality
- **Validation Gates**: Complete testing before moving to next phase
- **Color Consistency**: Use Cursor brand colors (#f54e00, #526070, #D4A27F, etc.)
- **Performance**: Maintain fast filtering and visualization rendering

---

## Phase 1: Simplify and Enhance Engagement Score ✅ COMPLETED

### Goals
- Simplify engagement score calculation to focus on key metrics
- Add engagement score column to Master Table
- Enable filtering by engagement score

### Completion Summary
Phase 1 has been successfully implemented with all validation criteria met:
- Engagement score calculation simplified (Sessions: 45pts, Requests: 35pts, Features: 20pts)
- Power features scoring simplified to 3 categories (MCP, Rules, Commands)
- Engagement score column visible by default in Master Table
- Range filtering (min/max) added
- Quick segment filter buttons added (Power Users 70+, Active 50-69, Casual 30-49, At-Risk <30)
- Scores rounded to whole numbers (0-100)
- CSV export includes engagement scores

### Changes Required

#### 1.1 Update Engagement Score Calculation
**File**: `src/lib/power-users/engagement-score.ts`

**Changes**:
- Remove `aiCodePct` scoring (20 points)
- Remove `tenure` scoring (5 points)
- Redistribute weights:
  - Sessions: 45 points (was 40)
  - Agent Requests: 35 points (was 25)
  - Power Features: 20 points (was 10)
- Simplify power features scoring:
  - Each feature worth 4 points (5 features × 4 = 20 points max)
  - Features: isMcpUser, isRuleCreator OR isRuleUser, isCommandCreator OR isCommandUser
  - So actually 3 categories: MCP (4pts), Rules (4pts), Commands (4pts), plus bonus points for being both creator AND user
  
**Simplified Formula**:
```
Score = Sessions Score (45pts) + Requests Score (35pts) + Features Score (20pts)
```

#### 1.2 Add Engagement Score to Master Table
**Files**: 
- `src/components/power-users/MasterTableFilters.tsx`
- `src/components/power-users/MasterTable.tsx`

**Changes**:
- Add `engagementScoreMin` and `engagementScoreMax` to `FilterState` interface
- Add engagement score range inputs to filter panel
- Add engagement score filtering logic to `MasterTable`
- Show engagement score column by default (currently hidden)
- Add sorting capability for engagement score column
- Update CSV export to include engagement score

#### 1.3 Add Quick Filters for Engagement Segments
**File**: `src/components/power-users/MasterTableFilters.tsx`

**Changes**:
- Add quick filter buttons for segments:
  - "Power Users (70+)"
  - "Active Users (50-69)"
  - "Casual Users (30-49)"
  - "At-Risk (<30)"

### Validation Criteria
- [x] Engagement scores calculate correctly with new formula
- [x] All users have valid scores (0-100)
- [x] Engagement score column appears in Master Table
- [x] Engagement score filtering works correctly
- [x] Engagement score sorting works correctly
- [x] Quick filters for segments work correctly
- [x] CSV export includes engagement scores
- [x] No performance degradation with 1000+ users

### Testing Steps
1. Load sample data (1000 users)
2. Verify engagement scores calculate and display
3. Test filtering by engagement score range
4. Test sorting by engagement score
5. Test quick segment filters
6. Export CSV and verify engagement score column
7. Check all existing functionality still works

### Implementation Notes

**Files Modified:**
- `src/lib/power-users/engagement-score.ts` - Updated calculation formula, removed AI% and tenure scoring
- `src/components/power-users/MasterTableFilters.tsx` - Added engagement score filters and quick segment buttons
- `src/components/power-users/MasterTable.tsx` - Added filtering logic, enabled column visibility, updated CSV export
- `src/app/power-users/page.tsx` - Switched to use `enhancedUsers` instead of `masterUsers`, added engagement score filter state

**Key Changes:**
- Engagement scores now calculate as: Sessions (45) + Requests (35) + Power Features (20)
- Power features simplified to 3 categories with OR/AND logic for creator/user roles
- Scores rounded to whole numbers (0-100)
- Four quick filter buttons for segments: Power (70+), Active (50-69), Casual (30-49), At-Risk (<30)

---

## Phase 2: Cohort Data Model and Storage ✅ COMPLETED

### Goals
- Define cohort data structure
- Implement cohort storage system (localStorage)
- Create base cohort management utilities

### Completion Summary
Phase 2 has been successfully implemented with all validation criteria met:
- Cohort and CohortComparison types defined with proper typing
- StoredCohort interface created for localStorage compatibility
- Color palette defined with 8 distinct cohort colors
- Cohort manager utilities implemented (create, save, load, delete, update)
- PowerUsersContext extended with full cohort management functionality
- localStorage persistence implemented with error handling
- Max 6 cohorts limitation enforced for comparisons
- TypeScript compilation successful with no linter errors

### Prerequisites
- Phase 1 completed ✅
- Engagement scores calculating correctly
- Filter system working end-to-end

### Changes Required

#### 2.1 Define Cohort Type
**File**: `src/types/power-users.ts`

**Add**:
```typescript
export interface Cohort {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // User-provided name
  color: string;                 // Hex color code
  createdAt: string;             // ISO timestamp
  filterCriteria: FilterState;   // The filter state that defines this cohort
  userCount?: number;            // Cached count (optional)
}

export interface CohortComparison {
  cohorts: Cohort[];            // Selected cohorts to compare
  timestamp: string;             // When comparison was created
}
```

#### 2.2 Create Cohort Color Palette
**File**: `src/types/index.ts`

**Add**:
```typescript
export const COHORT_COLORS = {
  cohort1: '#f54e00',  // Cursor orange (primary)
  cohort2: '#526070',  // Muted slate
  cohort3: '#D4A27F',  // Tan/beige
  cohort4: '#7C9885',  // Muted sage green
  cohort5: '#9B7E6B',  // Muted brown
  cohort6: '#6B8E9F',  // Muted blue-gray
  cohort7: '#B4846C',  // Muted terracotta
  cohort8: '#8A9BA8',  // Muted steel blue
  default: '#9CA3AF'   // Cool gray
} as const;

export const COHORT_COLOR_ARRAY = Object.values(COHORT_COLORS).slice(0, -1); // Exclude default
```

#### 2.3 Create Cohort Management Utilities
**File**: `src/lib/power-users/cohort-manager.ts` (new file)

**Functions**:
- `createCohort(name: string, filterCriteria: FilterState): Cohort`
- `saveCohort(cohort: Cohort): void`
- `loadCohorts(): Cohort[]`
- `deleteCohort(id: string): void`
- `updateCohort(id: string, updates: Partial<Cohort>): void`
- `assignCohortColor(index: number): string`
- `generateCohortId(): string`

#### 2.4 Extend PowerUsersContext
**File**: `src/contexts/PowerUsersContext.tsx`

**Add to context**:
- `savedCohorts: Cohort[]`
- `selectedCohorts: Cohort[]` (for comparison)
- `createCohort: (name: string, filterCriteria: FilterState) => void`
- `deleteCohort: (id: string) => void`
- `selectCohortForComparison: (cohortId: string) => void`
- `deselectCohortForComparison: (cohortId: string) => void`
- `clearComparisonCohorts: () => void`

### Validation Criteria
- [x] Cohort type definitions compile without errors
- [x] Cohort color palette defined with 8+ colors
- [x] Cohort manager utilities work correctly
- [x] Cohorts persist to localStorage
- [x] Cohorts load from localStorage on page refresh
- [x] Context provides cohort management functions
- [x] No breaking changes to existing functionality

### Testing Steps
1. Create test cohorts programmatically
2. Verify cohorts save to localStorage
3. Refresh page and verify cohorts load
4. Delete cohorts and verify removal
5. Test color assignment logic
6. Verify context functions are accessible
7. Check TypeScript compilation

### Implementation Notes

**Files Created:**
- `src/lib/power-users/cohort-manager.ts` - Complete cohort management utilities with CRUD operations

**Files Modified:**
- `src/types/power-users.ts` - Added Cohort and CohortComparison interfaces
- `src/types/index.ts` - Added COHORT_COLORS and COHORT_COLOR_ARRAY color palette
- `src/contexts/PowerUsersContext.tsx` - Extended with cohort state and management functions

**Key Implementation Details:**
- Created `StoredCohort` interface separate from `Cohort` type for better localStorage compatibility
- Used `Record<string, unknown>` type for filterCriteria to avoid circular dependency issues
- Implemented automatic color assignment based on cohort creation order
- Added max 6 cohorts enforcement in comparison selection
- All cohort operations include error handling for localStorage failures
- Context functions memoized with useCallback for performance

---

## Phase 3: Cohort Management UI ✅ COMPLETED

### Goals
- Add "Save as Cohort" functionality to filters
- Display saved cohorts in UI
- Enable cohort deletion and editing

### Completion Summary
Phase 3 has been successfully implemented with all validation criteria met:
- "Save as Cohort" button appears only when filters are active
- SaveCohortDialog with validation, filter preview, and user count display
- SavedCohortsPanel displays cohorts with colors, names, counts, and dates
- Cohort CRUD operations: create, rename, delete all working
- Clicking cohort badge applies its filters to the table
- Cohort persistence via localStorage working correctly
- Empty state displays when no cohorts exist
- UI components are responsive and keyboard accessible
- All components use Cursor brand colors consistently
- Smooth animations and transitions throughout

### Changes Required

#### 3.1 Add Save Cohort Dialog
**File**: `src/components/power-users/SaveCohortDialog.tsx` (new file)

**Features**:
- Dialog/modal for naming new cohort
- Input validation (name required, no duplicates)
- Preview of current filters that will be saved
- Preview of user count matching current filters
- Cancel/Save actions

#### 3.2 Update Filter Panel
**File**: `src/components/power-users/MasterTableFilters.tsx`

**Changes**:
- Add "Save as Cohort" button (when filters are active)
- Display saved cohorts as chips/badges below filters
- Each chip shows: name, color indicator, user count
- Clicking chip applies its filters to the table
- Hover shows quick preview of filter criteria
- Delete icon on each chip

#### 3.3 Create Saved Cohorts Section
**File**: `src/components/power-users/SavedCohortsPanel.tsx` (new file)

**Features**:
- Collapsible section in filter panel
- List of all saved cohorts
- Each cohort shows: name, color, user count, created date
- Click to apply filters
- Edit icon (opens rename dialog)
- Delete icon (with confirmation)
- Empty state message when no cohorts saved

#### 3.4 Add Cohort Badge Component
**File**: `src/components/power-users/CohortBadge.tsx` (new file)

**Features**:
- Reusable component for displaying cohort
- Shows color indicator + name + count
- Optional close/delete button
- Optional click handler
- Styling consistent with Cursor brand

### Validation Criteria
- [x] "Save as Cohort" button appears when filters active
- [x] Save dialog opens and validates input
- [x] Cohorts save successfully
- [x] Saved cohorts display in panel
- [x] Clicking cohort applies its filters
- [x] Cohort deletion works with confirmation
- [x] Cohort colors display correctly
- [x] Empty state shows appropriately
- [x] UI is responsive and accessible

### Testing Steps
1. Apply filters and save as cohort
2. Verify cohort appears in saved list
3. Clear filters and click cohort to reapply
4. Verify correct filters and users show
5. Test editing cohort name
6. Test deleting cohort
7. Test with multiple saved cohorts
8. Test empty state (no saved cohorts)
9. Test responsive layout

### Implementation Notes

**Files Created:**
- `src/lib/power-users/filter-utils.ts` - Shared filter logic utilities (applyFilters, getFilterSummary)
- `src/components/power-users/CohortBadge.tsx` - Reusable cohort badge component
- `src/components/power-users/SaveCohortDialog.tsx` - Save cohort dialog with validation
- `src/components/power-users/EditCohortDialog.tsx` - Rename cohort dialog
- `src/components/power-users/DeleteCohortDialog.tsx` - Delete confirmation dialog
- `src/components/power-users/SavedCohortsPanel.tsx` - Collapsible saved cohorts display

**Files Modified:**
- `src/components/power-users/MasterTableFilters.tsx` - Added Save button, integrated SaveCohortDialog and SavedCohortsPanel
- `src/app/power-users/page.tsx` - Added onApplyCohortFilters callback
- `src/components/power-users/__tests__/MasterTable.test.tsx` - Updated test to include new FilterState properties

**Key Features:**
- Filter logic extracted to reusable utilities for cohort user count calculation
- Human-readable filter summaries in save dialog
- Dynamic user count calculation based on current dataset
- Cohorts sorted by creation date (newest first)
- Proper TypeScript typing throughout
- No linter errors or TypeScript compilation errors
- Smooth transitions and animations (150-200ms)
- Full keyboard accessibility with ARIA labels

---

## Phase 4: Multi-Cohort Comparison Builder ✅ COMPLETED

### Goals
- Create comparison builder UI
- Enable selection of multiple cohorts for comparison
- Show selected cohorts with clear visual indicators

### Completion Summary
Phase 4 has been successfully implemented with all validation criteria met:
- CohortSelector component created with dropdown for cohort selection
- ComparisonBuilder component created with slot-based selection interface
- Integration with PowerUsersContext for cohort state management
- Selected cohorts display as badges with remove functionality
- "Clear All" button to deselect all cohorts
- Compare button state management (disabled < 2, enabled >= 2)
- Maximum 6 cohorts enforcement
- Disabled state for already-selected cohorts in dropdowns
- Empty states for no saved cohorts
- Placeholder cards for comparison view (ready for Phase 5/6)
- Responsive layout (mobile/tablet/desktop)
- Full keyboard accessibility with ARIA labels

### Changes Required

#### 4.1 Create Comparison Builder Component
**File**: `src/components/power-users/ComparisonBuilder.tsx` (new file)

**Features**:
- Dropdown/select for each comparison slot (up to 6 cohorts)
- Shows: "Select Cohort..." placeholder
- Options include all saved cohorts
- Selected cohorts display as badges with colors
- Remove button for each selected cohort
- "Compare" button (primary action)
- "Clear All" button
- Disabled state when < 2 cohorts selected
- Info tooltip explaining comparison

#### 4.2 Update Visualizations Page
**File**: `src/app/power-users/page.tsx`

**Changes**:
- Add ComparisonBuilder above visualizations
- Only show PowerUserComparison when comparison active
- Show info message when no comparison selected
- Update visualizations to use selected cohorts

#### 4.3 Create Cohort Selection Dropdown
**File**: `src/components/power-users/CohortSelector.tsx` (new file)

**Features**:
- Dropdown menu showing all saved cohorts
- Each option shows cohort color + name + count
- Disabled options for already-selected cohorts
- Search/filter if many cohorts
- Keyboard navigation
- Accessible labels

#### 4.4 Update Context for Comparison State
**File**: `src/contexts/PowerUsersContext.tsx`

**Add**:
- `comparisonMode: boolean`
- `activateComparison: () => void`
- `deactivateComparison: () => void`
- Track which cohorts are in comparison view

### Validation Criteria
- [x] Comparison builder displays correctly
- [x] Can select multiple cohorts (2-6)
- [x] Selected cohorts display with correct colors
- [x] Can remove individual cohorts from comparison
- [x] "Compare" button enables when 2+ cohorts selected
- [x] "Clear All" clears all selections
- [x] Dropdown filters out already-selected cohorts
- [x] UI is intuitive and accessible

### Testing Steps
1. Navigate to visualizations tab
2. Verify comparison builder displays
3. Select first cohort from dropdown
4. Verify it displays with color badge
5. Select second cohort
6. Verify "Compare" button becomes enabled
7. Click "Compare" and verify action
8. Test removing a cohort
9. Test "Clear All"
10. Test with 6 cohorts selected

### Implementation Notes

**Files Created:**
- `src/components/power-users/CohortSelector.tsx` - Reusable dropdown component for cohort selection
- `src/components/power-users/ComparisonBuilder.tsx` - Main comparison builder with selection slots
- `PHASE_4_COMPLETION_SUMMARY.md` - Detailed completion documentation

**Files Modified:**
- `src/components/power-users/PowerUsersVisualizations.tsx` - Integrated ComparisonBuilder into visualizations page
- `src/components/power-users/__tests__/MasterTable.test.tsx` - Fixed pre-existing test type error

**Key Implementation Details:**
- CohortSelector displays all saved cohorts with color, name, and dynamic user count
- User counts calculated in real-time using existing applyFilters utility
- Already-selected cohorts automatically disabled in dropdowns
- ComparisonBuilder manages up to 6 cohort selection slots
- Selected cohorts rendered as CohortBadge components with remove functionality
- "Clear All" button resets all selections
- Status messaging updates dynamically based on selection count
- Responsive grid layout: 1 col (mobile), 2 cols (tablet), 3 cols (desktop)
- Two placeholder states: instructional card (<2 cohorts), ready card (≥2 cohorts)
- Full integration with PowerUsersContext for state management
- No TypeScript errors or linter warnings
- Full keyboard accessibility with ARIA labels

---

## Phase 5: Multi-Cohort Data Processing

### Goals
- Update comparison statistics to handle N cohorts
- Create cohort-based data filtering utilities
- Ensure efficient data processing

### Changes Required

#### 5.1 Create Multi-Cohort Filter Logic
**File**: `src/lib/power-users/filter-logic.ts`

**Add Functions**:
- `getUsersForCohort(allUsers: EnhancedMasterUserRecord[], cohort: Cohort): EnhancedMasterUserRecord[]`
- `getUsersForCohorts(allUsers: EnhancedMasterUserRecord[], cohorts: Cohort[]): Map<string, EnhancedMasterUserRecord[]>`
- Reuse existing filter logic but apply cohort's filter criteria

#### 5.2 Update Comparison Stats Calculator
**File**: `src/lib/power-users/comparison-stats.ts`

**Changes**:
- Rename to `multi-cohort-stats.ts`
- Accept array of cohorts instead of binary power user flag
- Calculate stats for each cohort
- Return structure:
  ```typescript
  {
    cohorts: Array<{
      cohort: Cohort,
      userCount: number,
      metrics: CohortMetrics
    }>,
    comparisonMetrics: Array<{
      metricName: string,
      values: Map<cohortId, number>
    }>
  }
  ```

#### 5.3 Create Cohort Aggregation Utilities
**File**: `src/lib/power-users/cohort-aggregation.ts` (new file)

**Functions**:
- `calculateCohortMetrics(users: EnhancedMasterUserRecord[]): CohortMetrics`
- `calculateCohortPercentiles(cohortData: Map<string, EnhancedMasterUserRecord[]>): PercentileData`
- `compareCohortMetrics(cohortMetrics: CohortMetrics[]): ComparisonResult`

### Validation Criteria
- [ ] Users correctly filtered for each cohort
- [ ] Stats calculate correctly for each cohort
- [ ] Multi-cohort comparison data structure correct
- [ ] Performance acceptable with 6 cohorts × 1000 users
- [ ] No errors in console
- [ ] TypeScript types are correct

### Testing Steps
1. Create 3 test cohorts with different filter criteria
2. Verify user counts match expected
3. Calculate metrics for each cohort
4. Verify metrics are accurate
5. Test with edge cases (empty cohort, 1 user, all users)
6. Performance test with 6 cohorts
7. Verify no memory leaks

---

## Phase 6: Enhanced Comparison Visualizations

### Goals
- Update existing charts to support multiple cohorts
- Add new visualization types
- Ensure color consistency across all charts

### Changes Required

#### 6.1 Update Comparison Charts Grid
**File**: `src/components/power-users/ComparisonChartsGrid.tsx`

**Changes**:
- Accept array of cohorts instead of binary comparison
- Render N bars per metric (one per cohort)
- Use cohort colors consistently
- Update legend to show cohort names
- Support 2-6 cohorts dynamically
- Responsive layout (2 cols on desktop, 1 on mobile)

#### 6.2 Create Feature Adoption Heatmap
**File**: `src/components/power-users/FeatureAdoptionHeatmap.tsx` (new file)

**Features**:
- Matrix layout: cohorts as rows, features as columns
- Features: MCP, Rules (Creator), Rules (User), Commands (Creator), Commands (User)
- Color intensity shows % adoption (0-100%)
- Tooltips show exact percentages
- Responsive design

#### 6.3 Create Distribution Comparison Chart
**File**: `src/components/power-users/DistributionComparisonChart.tsx` (new file)

**Features**:
- Box plot or violin plot for key metrics
- One plot per cohort, side-by-side
- Metrics: AI Lines, Sessions, Agent Requests, Engagement Score
- Shows min, Q1, median, Q3, max
- Outliers displayed as points
- Cohort colors applied consistently

#### 6.4 Create Radar Chart Comparison
**File**: `src/components/power-users/RadarChartComparison.tsx` (new file)

**Features**:
- Multi-axis radar chart
- Axes: Sessions, Requests, AI Code %, Feature Count, Engagement Score
- One polygon per cohort (up to 6)
- Semi-transparent fills with cohort colors
- Legend shows cohort names
- Normalized to 0-100 scale for all metrics

#### 6.5 Update Comparison Metrics Table
**File**: `src/components/power-users/ComparisonMetricsTable.tsx`

**Changes**:
- Support N cohorts (not just 2)
- One column per cohort
- Add "Best" indicator for highest values
- Add "Spread" column showing min-max range
- Sortable by any cohort's value
- Export includes all cohorts

#### 6.6 Update PowerUserComparison Container
**File**: `src/components/power-users/PowerUserComparison.tsx`

**Changes**:
- Accept `cohorts: Cohort[]` prop
- Remove dependency on `isPowerUser` flag
- Update stat cards to show each cohort's count
- Coordinate all child visualizations
- Add cohort legend at top
- Add "Export All Comparisons" button

### Validation Criteria
- [ ] All charts render with multiple cohorts
- [ ] Cohort colors consistent across all visualizations
- [ ] Charts are readable with 2-6 cohorts
- [ ] New visualizations display correctly
- [ ] Responsive layouts work on mobile
- [ ] No chart rendering errors
- [ ] Performance acceptable with large datasets
- [ ] Tooltips and legends are accurate
- [ ] Export functionality works

### Testing Steps
1. Select 2 cohorts and verify all charts
2. Add 3rd cohort and verify updates
3. Test with 6 cohorts maximum
4. Verify colors match across all charts
5. Test each new visualization individually
6. Test responsive layouts (mobile, tablet, desktop)
7. Test export functionality
8. Check tooltip accuracy
9. Performance test with full dataset

---

## Phase 7: UX Polish and Final Integration

### Goals
- Improve user guidance and empty states
- Add keyboard shortcuts
- Optimize performance
- Polish animations and transitions

### Changes Required

#### 7.1 Add Cohort Workflow Guide
**File**: `src/components/power-users/CohortWorkflowGuide.tsx` (new file)

**Features**:
- Collapsible help panel
- Step-by-step workflow:
  1. Filter users → 2. Save as cohort → 3. Repeat → 4. Compare
- Screenshots/illustrations (optional)
- "Got it" button to dismiss permanently (localStorage)
- Accessible info icon to reopen

#### 7.2 Enhance Empty States
**Files**: Various component files

**Updates**:
- Master Table: "No users match filters" with suggestions
- Visualizations: "Select cohorts to compare" with CTA
- Saved Cohorts: "Create your first cohort" with guide
- Comparison Builder: "Select at least 2 cohorts" with hint

#### 7.3 Add Keyboard Shortcuts
**File**: `src/app/power-users/page.tsx`

**Shortcuts**:
- `Cmd/Ctrl + K`: Focus cohort search
- `Cmd/Ctrl + S`: Save current filters as cohort
- `Cmd/Ctrl + E`: Clear all filters
- `Cmd/Ctrl + \`: Toggle comparison builder
- Update shortcuts dialog to include new shortcuts

#### 7.4 Add Loading States
**Files**: Various component files

**Updates**:
- Skeleton loaders for charts while calculating
- Spinner for cohort operations (save/delete)
- Progress indicators for large datasets
- Optimistic UI updates where appropriate

#### 7.5 Add Transitions and Animations
**Files**: Various component files

**Updates**:
- Smooth transitions when adding/removing cohorts
- Fade in/out for chart updates
- Slide in/out for panels
- Hover states for interactive elements
- Keep animations subtle and fast (<200ms)

#### 7.6 Performance Optimizations
**Files**: Various files

**Optimizations**:
- Memoize expensive calculations
- Debounce filter inputs
- Virtualize long lists if needed
- Lazy load chart libraries
- Code splitting for visualization components

#### 7.7 Add Export Improvements
**File**: `src/lib/power-users/export-utils.ts` (new file)

**Features**:
- Export comparison as CSV (all cohorts, all metrics)
- Export cohort definitions as JSON (backup/share)
- Import cohort definitions from JSON
- Export individual cohort user lists

### Validation Criteria
- [ ] Empty states are helpful and actionable
- [ ] Keyboard shortcuts work correctly
- [ ] Loading states appear appropriately
- [ ] Animations are smooth and subtle
- [ ] Performance is acceptable (< 500ms for most operations)
- [ ] Export/import works correctly
- [ ] Help documentation is clear
- [ ] Accessibility standards met (WCAG 2.1 AA)

### Testing Steps
1. Test all keyboard shortcuts
2. Verify empty states in each context
3. Test loading states with slow network throttling
4. Check animations on different browsers
5. Performance test with 1000 users
6. Test export/import workflows
7. Accessibility audit (screen reader, keyboard only)
8. Cross-browser testing (Chrome, Safari, Firefox)
9. Mobile testing (iOS, Android)

---

## Phase 8: Documentation and Testing

### Goals
- Document new features
- Create user guide
- Write comprehensive tests
- Update README

### Changes Required

#### 8.1 Update User Documentation
**File**: `POWER_USERS_PLAN.md` or similar

**Updates**:
- Document cohort management workflow
- Explain comparison builder usage
- List available visualizations
- Document keyboard shortcuts
- Add troubleshooting section

#### 8.2 Create Developer Documentation
**File**: `COHORT_SYSTEM_ARCHITECTURE.md` (new file)

**Content**:
- Architecture overview
- Data flow diagrams
- Type definitions reference
- Component hierarchy
- Utility function documentation
- Extension guidelines

#### 8.3 Write Unit Tests
**Files**: Various `*.test.ts` files

**Test Coverage**:
- Cohort manager utilities (100%)
- Filter logic with cohorts (100%)
- Engagement score calculation (100%)
- Multi-cohort stats calculation (100%)
- Cohort color assignment (100%)

#### 8.4 Write Integration Tests
**Files**: Various `*.test.tsx` files

**Test Coverage**:
- Save and load cohorts (E2E)
- Apply cohort filters (E2E)
- Comparison workflow (E2E)
- Export/import cohorts (E2E)

#### 8.5 Update README
**File**: `README.md`

**Updates**:
- Add cohort comparison feature description
- Update screenshots
- Document new dependencies (if any)
- Update getting started guide

### Validation Criteria
- [ ] All unit tests pass (>95% coverage)
- [ ] All integration tests pass
- [ ] Documentation is clear and complete
- [ ] README reflects current features
- [ ] No console errors or warnings
- [ ] Linter passes
- [ ] TypeScript compiles without errors

### Testing Steps
1. Run all unit tests: `npm test`
2. Run integration tests
3. Review test coverage report
4. Read through all documentation
5. Follow user guide as new user
6. Check for broken links in docs
7. Verify code examples work

---

## Rollout and Migration Strategy

### Backward Compatibility
- Keep `isPowerUser` flag functional during transition
- Existing "power user" data becomes a default cohort
- No breaking changes to existing exports
- Gradual deprecation warnings in UI

### Data Migration
1. On first load of new version:
   - Check for existing `powerUserFlags` in localStorage
   - Create default cohorts: "Power Users" and "Non-Power Users"
   - Populate with users matching flags
   - Keep flags for backward compatibility
2. Add migration version flag to localStorage
3. Handle missing data gracefully

### Feature Flags (Optional)
- `ENABLE_COHORT_SYSTEM`: Toggle new features
- `ENABLE_MULTI_COHORT_COMPARE`: Toggle comparison builder
- `ENABLE_NEW_VISUALIZATIONS`: Toggle new chart types

### Rollback Plan
- All changes in feature branches
- Each phase merged only after validation
- localStorage keys versioned for easy rollback
- No schema changes to prevent data loss

---

## Success Metrics

### User Experience
- Time to create cohort: < 10 seconds
- Time to compare 2 cohorts: < 5 seconds
- Max cohorts in comparison: 6
- Filter application: < 500ms
- Chart rendering: < 1 second

### Technical
- Test coverage: > 95%
- TypeScript strict mode: Enabled
- Bundle size increase: < 100KB
- Lighthouse performance score: > 90
- Zero accessibility violations

### Functional
- All existing features work unchanged
- Sample data (1000 users) loads and processes
- All visualizations render correctly
- Export/import maintains data integrity
- Responsive on mobile, tablet, desktop

---

## Known Limitations and Future Enhancements

### Current Limitations
- No time-based cohort evolution (planned for future)
- Max 6 cohorts in single comparison (UI constraint)
- No cohort sharing between users (localStorage only)
- No undo/redo for cohort operations

### Future Enhancements (Post-MVP)
1. **Time-Based Analysis**
   - Track cohort changes over time
   - Retention curves per cohort
   - Growth rate comparisons
   
2. **Advanced Features**
   - Cohort overlap analysis (Venn diagrams)
   - Predictive analytics (which users will become power users)
   - A/B test result visualization
   - Custom metric definitions

3. **Collaboration**
   - Share cohorts via URL
   - Export cohorts to team
   - Comments on cohorts
   - Version history

4. **Performance**
   - Server-side cohort calculation
   - Cached metrics
   - Incremental updates
   - Virtual scrolling for large datasets

---

## Appendix A: Color Palette Reference

```typescript
// Primary cohort colors (use in order)
const COHORT_COLORS = [
  '#f54e00', // Cursor orange (cohort 1)
  '#526070', // Muted slate (cohort 2)
  '#D4A27F', // Tan/beige (cohort 3)
  '#7C9885', // Muted sage green (cohort 4)
  '#9B7E6B', // Muted brown (cohort 5)
  '#6B8E9F', // Muted blue-gray (cohort 6)
  '#B4846C', // Muted terracotta (cohort 7)
  '#8A9BA8', // Muted steel blue (cohort 8)
];

// Default for unassigned/other
const DEFAULT_COLOR = '#9CA3AF'; // Cool gray
```

---

## Appendix B: Component Hierarchy

```
PowerUsersPage
├── PowerUsersUpload
├── MasterTable
│   ├── MasterTableFilters
│   │   ├── SaveCohortDialog
│   │   └── SavedCohortsPanel
│   │       └── CohortBadge
│   └── PowerUserStateButton
├── PowerUsersVisualizations
│   ├── ComparisonBuilder
│   │   └── CohortSelector
│   ├── PowerUserComparison (Multi-Cohort)
│   │   ├── ComparisonMetricsTable
│   │   ├── ComparisonChartsGrid
│   │   ├── FeatureAdoptionHeatmap (NEW)
│   │   ├── DistributionComparisonChart (NEW)
│   │   └── RadarChartComparison (NEW)
│   ├── UserSegmentation
│   ├── TopContributorsDashboard
│   └── ... (other visualizations)
└── CohortWorkflowGuide
```

---

## Appendix C: File Creation Checklist

### New Files to Create
- [x] `src/lib/power-users/cohort-manager.ts` (Phase 2)
- [x] `src/lib/power-users/filter-utils.ts` (Phase 3)
- [x] `src/components/power-users/CohortBadge.tsx` (Phase 3)
- [x] `src/components/power-users/SaveCohortDialog.tsx` (Phase 3)
- [x] `src/components/power-users/EditCohortDialog.tsx` (Phase 3)
- [x] `src/components/power-users/DeleteCohortDialog.tsx` (Phase 3)
- [x] `src/components/power-users/SavedCohortsPanel.tsx` (Phase 3)
- [x] `src/components/power-users/ComparisonBuilder.tsx` (Phase 4)
- [x] `src/components/power-users/CohortSelector.tsx` (Phase 4)
- [ ] `src/lib/power-users/cohort-aggregation.ts`
- [ ] `src/lib/power-users/multi-cohort-stats.ts`
- [ ] `src/lib/power-users/export-utils.ts`
- [ ] `src/components/power-users/FeatureAdoptionHeatmap.tsx`
- [ ] `src/components/power-users/DistributionComparisonChart.tsx`
- [ ] `src/components/power-users/RadarChartComparison.tsx`
- [ ] `src/components/power-users/CohortWorkflowGuide.tsx`
- [ ] `COHORT_SYSTEM_ARCHITECTURE.md`

### Files to Modify
- [x] `src/lib/power-users/engagement-score.ts` (Phase 1)
- [x] `src/types/power-users.ts` (Phase 2)
- [x] `src/types/index.ts` (Phase 2)
- [x] `src/contexts/PowerUsersContext.tsx` (Phase 2)
- [x] `src/components/power-users/MasterTableFilters.tsx` (Phase 1, Phase 3)
- [x] `src/components/power-users/MasterTable.tsx` (Phase 1)
- [x] `src/app/power-users/page.tsx` (Phase 1, Phase 3)
- [x] `src/components/power-users/PowerUsersVisualizations.tsx` (Phase 4)
- [ ] `src/components/power-users/ComparisonChartsGrid.tsx`
- [ ] `src/components/power-users/ComparisonMetricsTable.tsx`
- [ ] `src/components/power-users/PowerUserComparison.tsx`
- [ ] `README.md`

---

## Getting Started

1. Review this entire plan
2. Load sample data to establish baseline
3. Begin with Phase 1 (Engagement Score)
4. Complete validation for each phase before proceeding
5. Document any deviations or issues
6. Update this plan as needed

**Ready to begin implementation!** 🚀

