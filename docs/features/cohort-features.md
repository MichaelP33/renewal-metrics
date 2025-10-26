# Cohort Comparison Features

## What are Cohorts?

**Cohorts** are named groups of users defined by specific filter criteria. They allow you to:

- Save complex filter combinations for quick access
- Compare different user segments side-by-side
- Track and analyze distinct user groups
- Share insights with your team

Think of cohorts as saved searches that you can reuse and compare.

## Getting Started

### Creating Your First Cohort

1. **Navigate to Power Users** page
2. **Apply filters** in the Master Table:
   - Search by name or email
   - Filter by features (MCP, Rules, Commands)
   - Set engagement score ranges
   - Apply numeric ranges (sessions, requests, AI lines)
3. **Click "Save as Cohort"** button
4. **Name your cohort** (e.g., "High-Engagement MCP Users")
5. **Save** - your cohort now appears in the Saved Cohorts panel

### Quick Example

**Goal**: Create a cohort of power users who use MCP and have high engagement.

**Steps**:
1. Set "MCP User" filter to "Yes"
2. Set "Engagement Score" minimum to "70"
3. Click "Save as Cohort"
4. Name it "Power MCP Users"
5. Done! The cohort is saved and ready to use.

## Comparing Cohorts

### Setting Up a Comparison

1. **Navigate to Visualizations** tab
2. **Find the Comparison Builder** section
3. **Select cohorts**:
   - Use dropdowns to select 2-6 cohorts
   - Each cohort appears as a colored badge
   - Already-selected cohorts are disabled in other dropdowns
4. **Click "Compare"** to generate visualizations

### Available Comparisons

#### 1. Metrics Table
- Side-by-side comparison of all metrics
- Trophy icon (🏆) indicates best-performing cohort per metric
- Spread column shows difference between min and max
- Sortable by any cohort's values

#### 2. Comparison Charts
- Bar charts for top 6 metrics with highest variance
- Each cohort represented by its assigned color
- Shows mean values for quick visual comparison

#### 3. Feature Adoption Heatmap
- Matrix view: cohorts (rows) × features (columns)
- Color intensity indicates adoption percentage (0-100%)
- Quickly identify feature usage patterns

#### 4. Radar Chart
- Multi-dimensional view of 5 key metrics
- One polygon per cohort
- Values normalized to 0-100 scale for fair comparison
- Great for overall performance overview

## Keyboard Shortcuts

Speed up your workflow with these shortcuts:

### Navigation
- **`Cmd/Ctrl + K`** or **`/`**: Focus search input

### Filters
- **`Cmd/Ctrl + S`**: Save current filters as cohort (when filters active)
- **`Cmd/Ctrl + E`**: Clear all filters

### Cohorts
- **`Cmd/Ctrl + \`**: Toggle comparison builder visibility

### General
- **`?`**: Show keyboard shortcuts dialog

## Saved Cohorts Panel

### Features

- **List view**: See all your saved cohorts
- **Color indicators**: Each cohort has a unique color
- **User counts**: Live count of matching users
- **Quick apply**: Click a cohort to apply its filters to the Master Table
- **Edit**: Rename cohorts
- **Delete**: Remove cohorts with confirmation

### Managing Cohorts

**Edit a cohort name**:
1. Click the edit icon (pencil) on the cohort badge
2. Enter new name
3. Save

**Delete a cohort**:
1. Click the delete icon (trash) on the cohort badge
2. Confirm deletion
3. Cohort is permanently removed

**Apply cohort filters**:
1. Click the cohort badge in the Saved Cohorts panel
2. Master Table automatically applies the cohort's filters
3. You can now see exactly which users are in that cohort

## Export & Import

### Exporting Data

**Export Comparison as CSV**:
1. After creating a comparison, click "Export" dropdown
2. Select "Export Comparison"
3. CSV includes all metrics and feature adoption for all cohorts

**Export Cohort Definitions**:
1. In Saved Cohorts panel, click "Export Cohorts"
2. JSON file contains all cohort configurations
3. Use this to back up or share cohorts with teammates

**Export Individual Cohort Users**:
1. Click the dropdown menu on a cohort badge
2. Select "Export Users"
3. CSV contains all users matching that cohort's filters

### Importing Cohorts

1. Click "Import Cohorts" in Saved Cohorts panel
2. Select a previously exported JSON file
3. Valid cohorts are imported; invalid ones generate error messages
4. Imported cohorts appear in your saved list

## Engagement Score

The **Engagement Score** (0-100) measures overall user activity:

### Score Breakdown
- **Sessions** (45 points): Based on total agent sessions
- **Agent Requests** (35 points): Based on total agent requests
- **Power Features** (20 points): Based on feature usage
  - MCP usage (4 points)
  - Rules (creator OR user: 4 points, both: 8 points)
  - Commands (creator OR user: 4 points, both: 8 points)

### Quick Filters

Use quick filter buttons to segment users by engagement:

- **Power Users (70+)**: Highly engaged, frequent users
- **Active Users (50-69)**: Regular users with good engagement
- **Casual Users (30-49)**: Occasional users
- **At-Risk (<30)**: Low engagement, may need attention

## Best Practices

### Cohort Naming

**Good names**:
- "High-Engagement MCP Users"
- "Rule Creators - Active"
- "New Users (Last 30 Days)"
- "At-Risk Non-MCP"

**Avoid**:
- "Cohort 1", "Test", "Group A" (not descriptive)
- Names longer than 50 characters

### Filter Combinations

**Effective combinations**:
- Feature + Engagement (e.g., MCP users with 70+ score)
- Activity Level + Tenure (e.g., High sessions + Long membership)
- Feature Mix (e.g., Rule creators who also use Commands)

**Tip**: Start with broader filters, then refine as needed.

### Comparison Strategy

**2-3 cohorts**: Best for detailed comparison

**4-6 cohorts**: Good for segmentation analysis, but can be visually crowded

**Use cases**:
- Compare power users vs. casual users
- Analyze MCP adopters vs. non-adopters
- Track engagement tiers (high, medium, low)
- Compare feature adoption patterns

## Troubleshooting

### "No users match filters"

**Problem**: Your filter combination is too restrictive.

**Solution**:
1. Remove one filter at a time to broaden results
2. Check numeric ranges aren't too narrow
3. Verify boolean filters aren't conflicting

### Cohorts not saving

**Problem**: localStorage is full or disabled.

**Solution**:
1. Clear browser cache
2. Delete unused cohorts
3. Check browser settings allow localStorage
4. Try a different browser

### Comparison not loading

**Problem**: Too many users or cohorts.

**Solution**:
1. Try with fewer cohorts (2-3 instead of 6)
2. Apply additional filters to reduce user count
3. Refresh the page
4. Check browser console for errors

### Import fails

**Problem**: JSON file is corrupted or invalid format.

**Solution**:
1. Verify file was exported from this tool
2. Check JSON is valid (use a validator)
3. Ensure all required fields are present
4. Try exporting again from source

### Colors look similar

**Problem**: Many cohorts make colors hard to distinguish.

**Solution**:
1. Limit comparisons to 3-4 cohorts at a time
2. Use the legend to identify cohorts
3. Check monitor color calibration
4. Consider comparing in smaller groups

## Workflow Guide

The system shows a 4-step workflow guide on first use:

### Step 1: Filter Users
Apply filters in the Master Table to find your target users.

### Step 2: Save as Cohort
Click "Save as Cohort" to create a named, reusable group.

### Step 3: Repeat
Create multiple cohorts with different filter criteria.

### Step 4: Compare
Select 2-6 cohorts in the Comparison Builder to analyze side-by-side.

**Tip**: Dismiss the guide with "Got it" once you understand the flow. You can reopen it anytime.

## FAQ

### How many cohorts can I create?

Unlimited! However, localStorage has limits (typically ~5MB). You can create hundreds of cohorts, but if you hit limits, consider exporting and deleting old ones.

### How many cohorts can I compare at once?

Maximum 6 cohorts per comparison for optimal visualization clarity.

### Do cohorts update automatically?

Yes! User counts and metrics update based on current data. Cohort definitions (filter criteria) remain fixed until you edit them.

### Can I share cohorts with my team?

Export cohort definitions as JSON and share the file. Teammates can import it to get the same cohorts.

### What happens if I delete a cohort?

It's permanently removed from your saved list. Users aren't affected, only the saved filter definition is deleted. There's no undo, so export important cohorts first.

### Can I edit a cohort's filters?

Not directly. Instead, apply the cohort's filters, modify them in the Master Table, and save as a new cohort. Then delete the old one if desired.

### Do cohorts work offline?

Cohort definitions are stored in localStorage and work offline. However, you need data loaded to use them.

### Can I duplicate a cohort?

Apply the cohort's filters, make no changes (or minor tweaks), and save with a new name.

### What's the difference between Cohort and Filter?

- **Filter**: Temporary criteria applied to Master Table
- **Cohort**: Saved, named filter combination you can reuse and compare

### Can I see which users are in multiple cohorts?

Yes! Users can belong to multiple cohorts. When you apply a cohort's filters, you see its users. Compare cohorts to analyze overlaps.

## Tips & Tricks

### Quick Cohort Creation

1. Use engagement score quick filters as starting points
2. Add one additional filter
3. Save immediately
4. Refine later if needed

### Color Coding Strategy

Cohorts are assigned colors automatically in order created. Plan your cohort creation order to group related cohorts by similar colors:

- Create all engagement tiers together (they'll have sequential colors)
- Create all feature-based cohorts together
- Create all time-based cohorts together

### Export Before Major Changes

Before reorganizing or deleting cohorts, export definitions as backup.

### Use Descriptive Names

Include key filters in cohort names:
- "MCP_HighEng_70+" (MCP users, engagement 70+)
- "Rules_Active_50s" (Rule users, 50-69 engagement)
- "AtRisk_NoMCP" (At-risk users without MCP)

### Leverage Comparison for Decision-Making

- **Product prioritization**: Compare feature adoption rates
- **User targeting**: Identify high-value segments
- **Trend analysis**: Track engagement over time
- **A/B testing**: Compare experiment groups

## Getting Help

### In-App Help

- Hover over info icons (ℹ️) for tooltips
- Use **`?`** to see keyboard shortcuts
- Check the workflow guide for step-by-step instructions

### Support Resources

- Check COHORT_SYSTEM_ARCHITECTURE.md for technical details
- Review README.md for project overview
- Contact your team lead for specific questions

---

**Happy analyzing!** 🚀

*Last updated: January 2025*

