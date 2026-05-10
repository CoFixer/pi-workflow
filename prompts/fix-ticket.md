---
description: Fix Notion Bug Report tickets - single ticket or batch mode with project filtering
argument-hint: "[ticket-id-or-title] — or leave empty for batch mode (auto-fetch from Notion)"
---

# Fix Ticket Command

Fix Notion Bug Report tickets by analyzing requirements and implementing changes. Supports single ticket mode (by ID/title) and batch mode (auto-fetch all project tickets).

## Usage

### Single Ticket Mode
```
/fix-ticket [ticket-id-or-title]
```
or
```
Fix ticket: [ticket title or ID]
```

### Batch Mode (No Arguments)
```
/fix-ticket
```
Automatically fetches all project tickets from Notion, processes sequentially with status tracking and resume capability.

### Via Ralph Loop (Autonomous)
```
/ralph fix-tickets activitycoaching
/ralph fix-tickets activitycoaching --incremental
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| ticket-id-or-title | No | Notion page ID or ticket title. If omitted, runs in batch mode |

---

## Step 0: Mode Detection

Determine the execution mode based on arguments:

- **If `$ARGUMENTS` is non-empty** and looks like a UUID or ticket title → **Single Ticket Mode** (Step 2A)
- **If `$ARGUMENTS` is empty** → **Batch Mode** (Step 2B)

---

## Step 1: Load Environment

Read credentials from project root `.env` file:

```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" .env | cut -d'=' -f2)
NOTION_DATABASE_ID=$(grep -E "^NOTION_DATABASE_ID=" .env | cut -d'=' -f2)
NOTION_PROJECT_ID=$(grep -E "^NOTION_PROJECT_ID=" .env | cut -d'=' -f2)
```

**Validation:**
- Single Ticket Mode: `NOTION_API_KEY` and `NOTION_DATABASE_ID` are required
- Batch Mode: All three variables are required (`NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NOTION_PROJECT_ID`)
- If any required variable is missing, inform the user and stop

---

## Step 2A: Single Ticket Mode

Process a single ticket by ID or title. This is the original workflow, preserved for backward compatibility.

### 2A.1. Find Ticket
- Search by ID (UUID format) or title (partial match)
- Retrieve full ticket details from Notion API

### 2A.2. Update Status
- Set status to **"In Progress"**
- This signals to others that work has started

### 2A.3. Analyze Requirements
Extract from ticket:
- Title: What needs to be done
- Description: Detailed requirements
- Feature: Feature description / context
- App / Dashboard: Which application
- Category: Bug, New Feature, Change Request, Todo
- URL: Reference URL (if any)

### 2A.4. Explore Codebase
- Search for files matching the Feature/Description context
- Read existing implementations
- Understand current architecture

### 2A.5. Implement Fix
- Make necessary code changes
- Follow project coding standards
- Run tests if applicable

### 2A.6. Update Project Documentation

After implementing the fix, review whether any `.pi-project/docs/` files need updating based on the changes made:

- **`PROJECT_API.md`** — If new API endpoints were added or existing ones modified
- **`PROJECT_DATABASE.md`** — If database entities, columns, or relations were added or changed
- **`PROJECT_KNOWLEDGE.md`** — If architectural patterns or project conventions changed
- **`PROJECT_API_INTEGRATION.md`** — If frontend-backend integration points changed

**Rules:**
- Only update docs that are directly affected by the ticket changes
- Skip this step entirely if the fix was purely UI/styling with no API, schema, or architectural impact
- Read the relevant doc file first before modifying to preserve existing content and format

### 2A.7. Complete Ticket
- Set status to **"Ready for test"**
- Add Dev's Comment with:
  - Files modified
  - Changes made
  - Testing notes
  - Any notes for QA

### 2A.8. Optional: Create Commit
```
git commit -m "fix: [ticket title]

Notion Ticket: https://notion.so/[ticket-id]
"
```

---

## Step 2B: Batch Mode

Process all project tickets from Notion sequentially with status tracking and resume capability.

### 2B.1. Read Status File

Read existing status from `.pi-project/status/tickets/TICKET_STATUS.md`:
- If file exists → parse the Item Tracking table to get ticket statuses
- If not → will be created after fetching tickets

### 2B.2. Fetch Tickets from Notion

Query the database with project filter:

```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_DATABASE_ID/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {
          "property": "Project",
          "relation": { "contains": "'"$NOTION_PROJECT_ID"'" }
        },
        {
          "or": [
            { "property": "Status", "status": { "equals": "New" } },
            { "property": "Status", "status": { "equals": "Backlog" } }
          ]
        }
      ]
    },
    "sorts": [{ "property": "Priority", "direction": "ascending" }],
    "page_size": 100
  }'
```

**Pagination:** If response has `has_more: true`, make follow-up requests with `start_cursor` set to `next_cursor` from previous response.

### 2B.3. Merge with Status File

Compare fetched tickets against existing status file:
- Tickets with `:white_check_mark:` (Pass) → **skip** (already fixed)
- Tickets with `:x:` (Failed) → **re-attempt**
- Tickets with `:clipboard:` (Pending) → **process**
- Tickets with `:warning:` (Needs Review) → **skip** (needs manual attention)
- New tickets not in status file → **add as Pending** (:clipboard:)

### 2B.4. Display Overview

```
Found [N] tickets for project (Activity Coaching):

Previously Fixed: [X] (skipping)
Needs Review: [Z] (skipping)
To Process: [Y]

1. [Urgent] [APP] Title (page-id)
2. [High] [Dashboard] Title (page-id)
...

Proceed? (Y/n)
```

### 2B.5. Process Each Ticket Sequentially

For each ticket to process:

1. **Update status file** → set ticket to `:construction:` (In Progress)
2. **Update Quick Summary** table counts
3. **Execute single-ticket workflow** (Steps 2A.1 through 2A.7)
4. **On success:**
   - Update status file → `:white_check_mark:` (Pass)
   - Record Result, Last Run timestamp, increment Attempt count
5. **On failure:**
   - Update status file → `:x:` (Failed)
   - Record error in Notes column, Last Run timestamp, increment Attempt count
   - If 3+ consecutive failures on same ticket → move to "Needs Manual Review" section
6. **Show progress:** `[X/N] completed`

### 2B.6. Update Execution Log

Add a row to the Execution Log table:
```
| 2026-03-05 | 8 | 6 | 1 | 1 | ~45min | Batch run |
```

### 2B.7. Generate Summary Report

```
BATCH PROCESSING COMPLETE

Total: N tickets
Fixed: X | Failed: Y | Skipped: Z

Fixed:
  - Title (page-id)
  - Title (page-id)

Failed:
  - Title (page-id) - Error: ...

Skipped (already fixed):
  - Title (page-id)

Files Modified:
  - frontend/app/pages/auth/LoginPage.tsx
  - backend/src/modules/users/users.service.ts

Suggested commit:
  fix: resolve multiple bug tickets

  Notion Tickets:
  - https://notion.so/page-id-1
  - https://notion.so/page-id-2
```

---

## Status Flow

```
New / Backlog → In Progress → Ready for test → Close
```

---

## Examples

### Single Ticket by Title
```
Fix ticket: My profile detail page
```

### Single Ticket by ID
```
Fix ticket: 2e6b6d88-d2cf-8006-a54e-d420667b579f
```

### Single Ticket with Plan Mode
```
Enter plan mode - Fix ticket: Calendar gap between elements
```

### Batch Mode (All Project Tickets)
```
/fix-ticket
```

### Batch Mode via Ralph Loop
```
/ralph fix-tickets activitycoaching
/ralph fix-tickets activitycoaching --incremental
```

---

## Curl Commands

### Get Credentials from .env
```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" .env | cut -d'=' -f2)
NOTION_DATABASE_ID=$(grep -E "^NOTION_DATABASE_ID=" .env | cut -d'=' -f2)
NOTION_PROJECT_ID=$(grep -E "^NOTION_PROJECT_ID=" .env | cut -d'=' -f2)
```

### Search for Ticket by Title
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_DATABASE_ID/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"filter": {"property": "Title", "title": {"contains": "[SEARCH_TERM]"}}}'
```

### Fetch by Page ID
```bash
curl -s -X GET "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

### Fetch Project Tickets (Batch Mode)
```bash
curl -s -X POST "https://api.notion.com/v1/databases/$NOTION_DATABASE_ID/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        { "property": "Project", "relation": { "contains": "'"$NOTION_PROJECT_ID"'" } },
        { "or": [
          { "property": "Status", "status": { "equals": "New" } },
          { "property": "Status", "status": { "equals": "Backlog" } }
        ]}
      ]
    },
    "sorts": [{ "property": "Priority", "direction": "ascending" }],
    "page_size": 100
  }'
```

### Set Status to In Progress
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"status": {"name": "In Progress"}}}}'
```

### Set Status to Ready for test
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"status": {"name": "Ready for test"}}}}'
```

### Set Status to Close
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"status": {"name": "Close"}}}}'
```

### Add Dev's Comment
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Dev'\''s Comment": {"rich_text": [{"text": {"content": "[COMMENT_TEXT]"}}]}}}'
```

---

## Status File

**Path:** `.pi-project/status/tickets/TICKET_STATUS.md`

This file tracks ticket processing across runs. It follows the Ralph status file format.

### Template
```markdown
# Fix Tickets Status - activitycoaching

## Quick Summary

| Category | Completed | In Progress | Pending | Failed | Total |
|----------|-----------|-------------|---------|--------|-------|
| All Items | 0 | 0 | 0 | 0 | 0 |

## Configuration

workflow: fix-tickets
project: activitycoaching
skill: .pi/skills/notion-ticket-reviewer/prompts/batch-fix.md
database_id: <NOTION_DATABASE_ID>
project_id: <NOTION_PROJECT_ID>
created: <DATE>
last_run: null

## Item Tracking

| Item Name | Source Ref | Status | Last Run | Result | Attempt | Notes |
|-----------|------------|--------|----------|--------|---------|-------|

## Execution Log

| Date | Items Processed | Pass | Fail | Skipped | Duration | Notes |
|------|-----------------|------|------|---------|----------|-------|

## Needs Manual Review

*None yet*

## Changelog

- <DATE>: Initial status file created
```

---

## Related

- [notion-ticket-reviewer skill](../../skills/notion-ticket-reviewer/SKILL.md)
- [ticket-fixer agent](../../agents/ticket-fixer.md)
- [batch-fix prompt](../../skills/notion-ticket-reviewer/prompts/batch-fix.md)
- [Ralph workflow](./ralph.md)
