---
description: Send weekly activity report with commit stats, communication scores, and letter grades to Slack
argument-hint: Optional - Slack webhook URL (uses SLACK_WEBHOOK_URL env var if not provided)
---

# Notify Slack Command

Collects **commit statistics** from GitHub repositories and **communication scores** from Slack #ai-workflow channel, calculates weighted scores with letter grades, then sends a **weekly** activity report to Slack.

---

## Overview

```
/notify-slack
        |
        v
1. Collect GitHub commit stats (4 repos, last 7 days)
        |
        v
2. Query Slack #ai-workflow channel messages
        |
        v
3. Calculate weighted scores (commits + communication + bonuses)
        |
        v
4. Assign letter grades and format weekly report
        |
        v
5. Send to Slack webhook
        |
        v
6. Write to Google Sheets (historical tracking by week)
```

---

## Prerequisites Check

```bash
gh auth status
which curl
```

If `gh auth status` fails, instruct user to run `gh auth login` and **STOP**.

---

## Configuration

### Environment Variables Required

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_BOT_TOKEN` | Yes | Slack Bot Token (xoxb-...) for reading messages |
| `SLACK_WEBHOOK_URL` | Yes* | Webhook URL for sending notifications |

*Can also be provided as `$ARGUMENTS`

### Slack Bot Token Scopes Required
- `channels:history` - Read messages from public channels
- `channels:read` - List channels to find channel ID
- `users:read` - Get user display names
- `reactions:read` - Read emoji reactions on messages

### Target Repositories
- `potentialInc/claude-base`
- `potentialInc/claude-nestjs`
- `potentialInc/claude-react`
- `potentialInc/claude-django`

### Slack Configuration
- **Query Channel**: `ai-workflow` (ONLY this channel is counted)
- **Time Range**: Last 7 days

---

## Step 1: Collect GitHub Commit Statistics

### 1.1 Fetch Recent Commits (Last 7 Days)

```bash
SINCE_DATE=$(date -v-7d +%Y-%m-%dT00:00:00Z 2>/dev/null || date -d '7 days ago' +%Y-%m-%dT00:00:00Z)

# For each repo
gh api repos/potentialInc/claude-base/commits -X GET -F since="$SINCE_DATE" --jq '.[] | {sha: .sha[0:7], author: .commit.author.name, date: .commit.author.date}'
gh api repos/potentialInc/claude-nestjs/commits -X GET -F since="$SINCE_DATE" --jq '.[] | {sha: .sha[0:7], author: .commit.author.name, date: .commit.author.date}'
gh api repos/potentialInc/claude-react/commits -X GET -F since="$SINCE_DATE" --jq '.[] | {sha: .sha[0:7], author: .commit.author.name, date: .commit.author.date}'
gh api repos/potentialInc/claude-django/commits -X GET -F since="$SINCE_DATE" --jq '.[] | {sha: .sha[0:7], author: .commit.author.name, date: .commit.author.date}'
```

### 1.2 Count Commits Per Person

Aggregate commits by author name across all repos.

---

## Step 2: Query Slack #ai-workflow Channel

### 2.1 Get Channel ID

```bash
curl -s "https://slack.com/api/conversations.list?types=public_channel&limit=1000" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" | jq -r '.channels[] | select(.name=="ai-workflow") | .id'
```

### 2.2 Fetch Messages (Last 7 Days)

```bash
OLDEST=$(date -v-7d +%s 2>/dev/null || date -d '7 days ago' +%s)

curl -s "https://slack.com/api/conversations.history?channel=$CHANNEL_ID&oldest=$OLDEST&limit=500" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN"
```

### 2.3 Extract Message Data

For each message, extract:
- `user_id` - Slack user ID
- `text` - Message content
- `char_count` - Character length
- `reactions` - Array of reactions with counts
- `total_reactions` - Sum of all reaction counts

### 2.4 Get All Workspace Members

```bash
curl -s "https://slack.com/api/users.list" \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" | jq '.members[] | select(.deleted == false and .is_bot == false) | {id, name: .real_name}'
```

---

## Step 3: Calculate Weighted Scores

### 3.1 Scoring Formula

```
Total Score = Commit Points + Communication Points + Bonus Points

Where:
- Commit Points = commits × 3 (capped at 50 pts max)
- Communication Points = Base + Length Bonus + Emoji Bonus (capped at 50 pts max)
- Bonus Points = Manual recognition for special contributions
```

### 3.2 Commit Points

| Commits | Points | Note |
|---------|--------|------|
| 1 | 3 pts | |
| 5 | 15 pts | |
| 10 | 30 pts | |
| 15 | 45 pts | |
| 17+ | 50 pts | **CAPPED** |

**Formula**: `min(50, commits × 3)`

### 3.3 Communication Points (ai-workflow ONLY)

For each message in #ai-workflow:

```
Message Score = Base + Length Bonus + Emoji Bonus

Where:
- Base = 2 pts per message
- Length Bonus = min(3, floor(char_count / 200))
  - < 200 chars: 0 bonus
  - 200-399 chars: +1 bonus
  - 400-599 chars: +2 bonus
  - 600+ chars: +3 bonus (max)
- Emoji Bonus = min(5, total_reactions)
  - Each reaction = +1 point (max 5)
```

**Total Communication Cap**: 50 pts max per person

### 3.4 Bonus Points (Manual Recognition)

When a message contains special recognition like "Nicely done [achievement]", add:
- +10 bonus points for the recognized person

Look for patterns like:
- "nicely done"
- "great job"
- "well done"
- "kudos to"
- "shoutout to"

Extract the achievement description for the report.

### 3.5 Example Calculations

**High Performer (Siam)**:
```
Commits: 24 × 3 = 72 → capped to 50 pts
Communication: 35 pts (under cap)
Total: 50 + 35 = 85 pts → A+
```

**Good Communicator (Lukas)**:
```
Commits: 5 × 3 = 15 pts
Communication: 55 → capped to 50 pts
Total: 15 + 50 = 65 pts → A+
```

**Bonus Recipient (Nomaan)**:
```
Commits: 0 × 3 = 0 pts
Communication: 8 pts
Bonus: 10 pts (frontend-knowledge-session)
Total: 0 + 8 + 10 = 18 pts → B
```

---

## Step 4: Assign Letter Grades

### 4.1 Grade Thresholds

| Grade | Points Range | Description |
|-------|--------------|-------------|
| A+ | 50+ pts | Exceptional contributor |
| A | 35-49 pts | Strong contributor |
| B+ | 25-34 pts | Good contributor |
| B | 15-24 pts | Solid contributor |
| B- | 10-14 pts | Moderate contributor |
| C+ | 7-9 pts | Light contributor |
| C | 4-6 pts | Minimal contributor |
| C- | 1-3 pts | Very light contributor |
| D- | 0 pts | Inactive |

### 4.2 Calculate Average Grade

Convert grades to GPA and average:
- A+ = 4.3, A = 4.0, B+ = 3.3, B = 3.0, B- = 2.7
- C+ = 2.3, C = 2.0, C- = 1.7, D- = 0

Report as letter grade equivalent.

---

## Step 5: Format Report

### 5.1 Report Structure

```
Weekly Activity Report (Jan Week 3)

Summary: {member_count} members | {total_commits} commits | {total_comm_pts} comm pts | Avg Grade: {avg_grade}

@{name}  {grade}
• Commits: {count} ({pts} pts{" capped to 50" if capped})
• Communication: {comm_pts} pts{" (capped to 50)" if capped}
{• Bonus: {bonus_pts} pts ({reason}) - if applicable}
• Total: {total_pts} pts

... (sorted by total points descending)

---

*Inactive Members (D-) - 0 pts*
No commits or communication activity detected this week:
@{name1}, @{name2}, @{name3}, ...

:warning: Please reach out to inactive members to ensure they are engaged.
```

### 5.3 Inactive Members Detection

To identify inactive members:
1. Get all workspace members from Slack API (`users.list`)
2. Filter out bots and deleted accounts
3. Compare with members who have commits OR communication activity
4. List all members with 0 total points as "Inactive (D-)"

### 5.2 Slack Block Kit Format

```json
{
  "blocks": [
    {
      "type": "header",
      "text": {"type": "plain_text", "text": "Weekly Activity Report (Jan Week 3)"}
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Summary:* 30 members | 37 commits | 172 comm pts | Avg Grade: C+"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "<@U123ABC>  *A+*\n• Commits: 24 (72 pts capped to 45)\n• Communication: 18 pts\n• Total: 63 pts"
      }
    }
  ]
}
```

### 5.3 User Mentions

Use Slack user IDs for mentions: `<@USER_ID>`
- Match GitHub author names to Slack users by name similarity
- If no match, use display name without mention

---

## Step 6: Send to Slack

```bash
curl -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD"
```

---

## Step 7: Write to Google Sheets (Historical Tracking)

After sending the Slack report, write the data to Google Sheets for historical tracking.

### 7.1 Spreadsheet Configuration

- **Spreadsheet ID**: `1ru88-pKjJ8NbdG6uBAWpo7SAfWUagc6gq-92pRcK0tU`
- **Spreadsheet Name**: AI Proficiency Evaluation
- **Structure**: Each team member has their own sheet (tab)
- **Credentials**: `.pi/config/google-service-account.json`

### 7.2 Sheet Columns

| Column | Description | Example |
|--------|-------------|---------|
| Name | Person's name | Siam Maruf |
| Week | Week identifier | Jan W3 |
| Date | Report date | 2026-01-19 |
| Grade | Letter grade | A+ |
| Commits | Commit count | 63 |
| Comm Pts | Communication points | 25 |
| Total | Total score | 70 |

### 7.3 Write Data Using Helper Script

```bash
# From .claude directory
node scripts/sheets-helper.js write-weekly '[
  {"name":"Siam Maruf","grade":"A+","commits":63,"commPts":25,"total":70},
  {"name":"Lukas","grade":"A+","commits":11,"commPts":25,"total":58},
  {"name":"Jayden","grade":"A","commits":4,"commPts":25,"total":37}
]'
```

The script automatically:
- Maps names to correct sheet tabs (e.g., "Md Siam Maruf" → "Siam" sheet)
- Adds week label (e.g., "Jan W3")
- Adds current date
- Appends row to person's sheet

### 7.4 Helper Script Commands

```bash
# Test connection
node scripts/sheets-helper.js test

# Write weekly report (array of all members)
node scripts/sheets-helper.js write-weekly '[{...},...]'

# Read person's historical data
node scripts/sheets-helper.js read Siam

# List all sheets
node scripts/sheets-helper.js list-sheets

# Get current week label
node scripts/sheets-helper.js week-label
```

---

## Scoring Quick Reference

| Activity | Points | Cap |
|----------|--------|-----|
| 1 commit | 3 pts | 50 max |
| 1 message (base) | 2 pts | 50 max total |
| Long message (200+ chars) | +1-3 pts | included in 50 cap |
| Each emoji reaction received | +1 pt | +5 max per msg |
| Special recognition | +10 pts | no cap |

### Why This Scoring?

- **Commit points (3×)**: Direct work contribution
- **Communication cap (50)**: Equal weight to commits and communication
- **Length bonus**: Rewards detailed, thoughtful updates
- **Emoji bonus**: Content that others found valuable
- **ai-workflow only**: Focuses on work-related communication

---

## Error Handling

| Error | Resolution |
|-------|------------|
| `gh auth` fails | Run `gh auth login` |
| Repository not found | Skip with warning |
| `not_authed` | Regenerate Slack bot token |
| `missing_scope` | Add required OAuth scopes |
| `channel_not_found` | Verify #ai-workflow exists |

---

## Example Usage

```bash
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ"
/notify-slack
```

---

## Important Notes

- **ai-workflow only**: Only #ai-workflow messages count for communication
- **7-day window**: Both commits and messages from last 7 days
- **Inactive tracking**: Members with 0 commits AND 0 communication = D-
- **Capping displayed**: Show original calculation when capped (e.g., "72 pts capped to 45")
- **Token security**: Never log tokens or webhook URLs
