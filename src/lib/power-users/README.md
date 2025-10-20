# Power Users Data Layer

This module provides CSV parsing, validation, and aggregation for the Power Users feature. It unifies user data from three different CSV sources into a single `MasterUserRecord` representation.

## Architecture

### Components

1. **Types & Schemas** (`src/types/power-users.ts`)
   - Domain types: `AICodeMetrics`, `PowerUserFeatures`, `AgentRequests`, `MasterUserRecord`
   - Zod schemas for runtime CSV validation
   - Email normalization utility

2. **Parsers** (`src/lib/power-users/*-parser.ts`)
   - `ai-code-parser.ts` - Parses AI code metrics CSV
   - `power-user-features-parser.ts` - Parses power user features CSV
   - `agent-requests-parser.ts` - Parses agent requests CSV
   - Each parser exports: `parseCSV()`, `validateRow()`, `normalizeEmail()`

3. **Aggregator** (`src/lib/power-users/aggregator.ts`)
   - `aggregateUserData()` - Merges multiple datasets by normalized email
   - Handles duplicates, conflicts, and partial data

## CSV File Formats

### 1. AI Code Metrics (`users_lines_of_ai_code.csv`)

**Columns:**
- `team_id`, `team_name`, `user_id` - Team/user identifiers
- `email` - User email (unique key)
- `person_linkedin_url` - LinkedIn profile URL (optional)
- `total_lines_changed`, `ai_lines_changed`, `non_ai_lines_changed` - Line counts
- `pct_ai_lines_changed`, `pct_non_ai_lines_changed` - Percentages (0-100)
- `commit_count` - Number of commits

**Mapped to:** `AICodeMetrics` domain type

### 2. Power User Features (`power-user-features-examples.csv`)

**Columns:**
- `userid` - User identifier
- `email` - User email (unique key)
- `membership_length`, `membership_days` - Membership duration
- `is_mcp_user`, `is_rule_creator`, `is_rule_user`, `is_command_creator`, `is_command_user` - Boolean flags
- `num_products_used` - Number of products

**Mapped to:** `PowerUserFeatures` domain type

### 3. Agent Requests (`top-agent-requests-examples.csv`)

**Columns:**
- `email` - User email (unique key)
- `first_name`, `last_name` - User name (optional)
- `auth_id` - Authentication identifier
- `total_requests`, `total_sessions` - Usage metrics
- `combined_score` - Calculated score

**Mapped to:** `AgentRequests` domain type

## Field Mapping

| CSV Field | Domain Field | Notes |
|-----------|--------------|-------|
| `person_linkedin_url` | `linkedinUrl` | Optional, empty strings → undefined |
| `ai_lines_changed` | `aiLinesChanged` | Summed for duplicates |
| `pct_ai_lines_changed` | `pctAiCode` | Max for duplicates |
| `first_name` | `firstName` | Optional, empty strings → undefined |
| `last_name` | `lastName` | Optional, empty strings → undefined |
| `total_requests` | `totalAgentRequests` | Max for duplicates |
| `total_sessions` | `totalSessions` | Max for duplicates |
| `is_mcp_user` | `isMcpUser` | OR logic for duplicates |
| `is_rule_creator` | `isRuleCreator` | OR logic for duplicates |
| `is_rule_user` | `isRuleUser` | OR logic for duplicates |
| `is_command_creator` | `isCommandCreator` | OR logic for duplicates |
| `is_command_user` | `isCommandUser` | OR logic for duplicates |
| `num_products_used` | `numProductsUsed` | Max for duplicates |
| `membership_days` | `membershipDays` | Max for duplicates |

## Aggregation Rules

### Email Normalization
- Trim whitespace
- Convert to lowercase
- Used as unique join key across all datasets

### Duplicate Handling (within same dataset)

**AI Code Metrics:**
- Sum: `aiLinesChanged`, `totalLinesChanged`, `commitCount`
- Max: `pctAiCode`
- First non-empty: `linkedinUrl`

**Power User Features:**
- OR: All boolean fields (`isMcpUser`, `isRuleCreator`, etc.)
- Max: `numProductsUsed`, `membershipDays`

**Agent Requests:**
- First non-empty: `firstName`, `lastName`
- Max: `totalSessions`, `totalRequests`

### Merge Strategy (across datasets)

**Identity Fields:**
- First non-empty value wins: `firstName`, `lastName`, `linkedinUrl`

**Boolean Fields:**
- OR logic: `isMcpUser`, `isRuleCreator`, `isRuleUser`, `isCommandCreator`, `isCommandUser`

**Numeric Fields:**
- Sum: `aiLinesChanged`, `totalLinesChanged`, `commitCount`
- Max: `pctAiCode`, `totalSessions`, `totalAgentRequests`, `numProductsUsed`, `membershipDays`

### Sorting

Results are sorted by:
1. `totalSessions` descending
2. `aiLinesChanged` descending (fallback)

## Usage

### Basic Example

```typescript
import { parseCSV as parseAICode } from '@/lib/power-users/ai-code-parser';
import { parseCSV as parseFeatures } from '@/lib/power-users/power-user-features-parser';
import { parseCSV as parseAgent } from '@/lib/power-users/agent-requests-parser';
import { aggregateUserData } from '@/lib/power-users/aggregator';

// Parse CSV files
const aiCode = await parseAICode(aiCodeCsvText);
const features = await parseFeatures(featuresCsvText);
const agent = await parseAgent(agentCsvText);

// Aggregate into master records
const masterUsers = aggregateUserData(aiCode, features, agent);

// Use masterUsers array
console.log(`Total users: ${masterUsers.length}`);
console.log(`First user:`, masterUsers[0]);
```

### Partial Data

All datasets are optional:

```typescript
// Only AI code data
const masterUsers = aggregateUserData(aiCode);

// AI code + features
const masterUsers = aggregateUserData(aiCode, features);

// All three
const masterUsers = aggregateUserData(aiCode, features, agent);
```

### Accessing Source Flags

Each `MasterUserRecord` includes `sourceFlags` to track which datasets contributed:

```typescript
const user = masterUsers[0];

if (user.sourceFlags.aiCode) {
  console.log('Has AI code data');
}
if (user.sourceFlags.features) {
  console.log('Has power features data');
}
if (user.sourceFlags.agentRequests) {
  console.log('Has agent requests data');
}
```

## Error Handling

- Invalid CSV rows are logged and skipped (not thrown)
- Empty strings in optional fields are converted to `undefined`
- Missing datasets are handled gracefully
- Duplicate emails within a dataset are merged according to rules

## Testing

Run tests with:
```bash
pnpm test
```

Test coverage includes:
- CSV parsing with valid/invalid/edge-case data
- Email normalization
- Duplicate handling
- Aggregation with partial datasets
- Merge strategy correctness
- Deterministic output

## Performance

- Parse 2,600-row CSV: < 500ms
- Aggregate 3 datasets (2,600 users): < 200ms
- Total processing time: < 1 second

## Adding New Datasets

To add a new CSV source:

1. Create a new domain type in `src/types/power-users.ts`
2. Create a Zod schema for CSV validation
3. Create a parser in `src/lib/power-users/` with `parseCSV()` and `validateRow()`
4. Update `MasterUserRecord` with new fields
5. Update `aggregateUserData()` to handle the new dataset
6. Add tests in `__tests__/`

## Phase 4 Enhancements

### User Detail Drawer
- Click any row in the Master Table to view detailed user information
- Press Enter or Space on a focused row to open the drawer
- Displays all user data organized by sections: Identity, AI Code Metrics, Agent Activity, Power Features, and Data Sources
- Keyboard accessible with proper focus management

### Keyboard Shortcuts
- Press `/` to focus the search input (when on table tab)
- Press `?` to show keyboard shortcuts dialog
- Press `Esc` to close dialogs or clear focus
- Shortcuts are disabled when typing in input fields

### Accessibility Improvements
- All filter controls have proper ARIA labels
- Table rows are keyboard accessible with role="button"
- Focus management in dialogs
- Screen reader friendly announcements
- WCAG AA compliant color contrast

### Performance
- Memoized filtering and sorting operations
- Debounced text search (300ms)
- Efficient pagination (50 rows per page)
- Optimized re-renders with React.useCallback and React.useMemo

## Phase 5: Advanced Analytics

### Engagement Scoring
- **Engagement Score**: Calculated 0-100 score based on multiple factors
  - Sessions (0-40 points): Based on total sessions
  - Requests (0-25 points): Based on total agent requests
  - AI Code % (0-20 points): Based on percentage of AI-generated code
  - Power Features (0-10 points): Based on number of power features enabled
  - Tenure (0-5 points): Based on membership days
- **Engagement Percentile**: 0-100 percentile ranking among all users
- **User Segmentation**: Automatic categorization into segments
  - Power Users: Score ≥ 70
  - Active Users: Score ≥ 50
  - Casual Users: Score ≥ 30
  - At Risk: Score < 30

### Analytics Utilities (`engagement-score.ts`)
- `calculateEngagementScore(user)`: Calculate engagement score for a user
- `segmentUser(score)`: Determine user segment from score
- `calculatePercentiles(scores)`: Calculate percentile rankings
- `calculateCorrelation(x, y)`: Calculate Pearson correlation coefficient
- `countPowerFeatures(user)`: Count enabled power features

### Enhanced Visualizations
- **AI Code Distribution Chart**: Horizontal bar chart showing AI code usage by user
- **User Segmentation**: Pie chart showing distribution of user segments
- **Top Contributors Dashboard**: Leaderboards for sessions, requests, and AI code
- **Trend Analysis**: Scatter plots with correlation analysis
  - Sessions vs AI Code %
  - Requests vs AI Code %
  - Products Used vs Sessions
- **Feature Adoption Matrix**: Table showing feature combination patterns

### Master Table Enhancements
- New columns: Engagement Score, Engagement Percentile, Segment
- Sortable by all engagement metrics
- Color-coded segment badges
- CSV export includes engagement data

### Usage Example

```typescript
import { usePowerUsers } from '@/contexts/PowerUsersContext';

function MyComponent() {
  const { enhancedUsers } = usePowerUsers();
  
  // enhancedUsers includes computed engagement scores
  enhancedUsers.forEach(user => {
    console.log(`${user.email}: ${user.engagementScore} (${user.segment})`);
  });
}
```

## Handoff to Phase 2

Phase 2 will consume:
- `aggregateUserData()` function
- `MasterUserRecord[]` type
- Sample fixture in `__fixtures__/master-users.sample.json`

Phase 2 should NOT re-implement parsing or aggregation logic.

