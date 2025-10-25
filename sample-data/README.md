# Sample Data - 1000 Users

This directory contains sample data for testing the Power Users Analytics cohort comparison features.

## Files

### `sample-ai-code-1000-users.csv` (132KB, 1001 lines)
AI code metrics for 1000 developers.

**Columns:**
- `team_id`, `team_name` - Team identifiers
- `user_id`, `email` - User identifiers
- `person_linkedin_url` - LinkedIn profile
- `total_lines_changed` - Total code lines changed
- `ai_lines_changed` - AI-generated code lines
- `non_ai_lines_changed` - Manually written code lines
- `pct_ai_lines_changed` - Percentage of AI code (0-100)
- `pct_non_ai_lines_changed` - Percentage of manual code (0-100)
- `commit_count` - Number of commits

### `sample-power-features-1000-users.csv` (77KB, 1001 lines)
Power feature adoption metrics.

**Columns:**
- `userid`, `email` - User identifiers
- `membership_length` - Human-readable tenure (e.g., "3mo3w3d")
- `membership_days` - Numeric tenure in days
- `is_mcp_user` - Boolean: Uses MCP features
- `is_rule_creator` - Boolean: Created rules
- `is_rule_user` - Boolean: Uses rules
- `is_command_creator` - Boolean: Created commands
- `is_command_user` - Boolean: Uses commands
- `num_products_used` - Count of products used (1-3)

### `sample-agent-requests-1000-users.csv` (76KB, 1001 lines)
Agent usage and session metrics.

**Columns:**
- `email` - User identifier
- `first_name`, `last_name` - User names
- `auth_id` - Authentication identifier
- `total_requests` - Total agent requests
- `total_sessions` - Total sessions
- `combined_score` - Pre-calculated score (0-1)

## Usage

1. **Navigate to Power Users page** in the app
2. **Upload Data tab**: Upload all three CSV files
3. **Master Table tab**: View aggregated user data
4. **Visualizations tab**: See analytics and comparisons

## Data Characteristics

- **Total Users:** 1,000
- **Distribution:** Realistic Pareto distribution (few high-performers, many casual users)
- **Power Features:**
  - ~15% MCP users
  - ~20% Rule creators
  - ~25% Rule users
  - ~15% Command creators
  - ~20% Command users
- **Engagement Range:**
  - Sessions: 1-2000+ per user
  - Requests: 10-10,000+ per user
  - AI Code %: 0-90%

## Use Cases for Testing

### Example Cohort Definitions

1. **Power Users (High Engagement)**
   - Engagement Score >= 70
   - Expected: ~50-100 users

2. **Rule Users**
   - `is_rule_user = true` OR `is_rule_creator = true`
   - Expected: ~300 users

3. **Command Users**
   - `is_command_user = true` OR `is_command_creator = true`
   - Expected: ~250 users

4. **MCP Adopters**
   - `is_mcp_user = true`
   - Expected: ~150 users

5. **High AI Code Users**
   - AI Code % >= 60%
   - Expected: ~200 users

6. **Casual Users**
   - Engagement Score < 30
   - Expected: ~400 users

## Comparison Scenarios to Test

1. **Rule Users vs Non-Rule Users**
2. **MCP Adopters vs Non-Adopters**
3. **High Engagement vs Low Engagement**
4. **Multi-Feature Users vs Single-Feature Users**
5. **Three-way: MCP vs Rules vs Commands**
6. **Six-way: All engagement segments**

## Notes

- All data is synthetic and generated for testing purposes
- Email addresses use `@acmecorp.com` domain
- Names are randomly generated
- LinkedIn URLs are fictional
- Metrics follow realistic distributions based on actual user behavior patterns

