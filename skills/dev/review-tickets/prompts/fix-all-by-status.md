# Fix All Tickets by Status

## Prompt Template

```
Fix all tickets with status "[STATUS]"
```

## Description

Processes and fixes all Project Tickets with a specific status, one by one sequentially. Each ticket goes through the full fix workflow before moving to the next.

## Database

| Field | Value |
|-------|-------|
| **Database ID** | `ba90177d-58a7-443f-8a59-87c589e48f58` |
| **API Key Location** | `backend/.env` → `NOTION_API_KEY` |

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `STATUS` | No | "New" | The status to filter tickets by |

## Workflow

```
1. FETCH TICKETS
   └── Query database with status filter
   └── Sort by Priority (Urgent → Low)
   └── Store ticket list

2. DISPLAY OVERVIEW
   └── Show total count
   └── List all tickets to be processed
   └── Confirm to proceed

3. FOR EACH TICKET (sequential):
   │
   ├── 3a. SET IN PROGRESS
   │   └── Update Status: "New" → "In Progress"
   │
   ├── 3b. ANALYZE
   │   └── Parse ticket title for intent
   │   └── Extract requirements from Description
   │   └── Check Feature context
   │   └── Review App / Dashboard context
   │   └── Check Sprint assignment
   │
   ├── 3c. EXPLORE CODEBASE
   │   └── Search for files matching feature context
   │   └── Read existing implementations
   │   └── Understand context
   │
   ├── 3d. IMPLEMENT
   │   └── Make targeted code changes
   │   └── Follow existing patterns
   │   └── Run tests if applicable
   │
   ├── 3e. COMPLETE
   │   └── Update Status: "In Progress" → "Ready for test"
   │   └── Add Dev's Comment with implementation details
   │
   └── 3f. LOG PROGRESS
       └── Mark ticket as done in progress tracker
       └── Show "[X/N] completed"

4. HANDLE ERRORS
   └── If blocked: Set status to "Backlog", add Dev's Comment
   └── Log error and continue to next ticket (or stop)
   └── User can resume with "Continue fixing tickets"

5. FINAL SUMMARY
   └── Show total processed
   └── List completed tickets
   └── List blocked/failed tickets
   └── Suggest git commit for all changes
```

## Example Usage

### Default (New)
```
Fix all tickets with status "New"
```

### Backlog Tickets
```
Fix all tickets with status "Backlog"
```

### With App Filter
```
Fix all tickets with status "New"
Filter: App = "APP"
```

### With Sprint Filter
```
Fix all tickets with status "New"
Filter: Sprint = "Sprint 3"
```

### Continue After Interruption
```
Continue fixing tickets
```

## Curl Commands

### Get API Key from backend/.env
```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" backend/.env | cut -d'=' -f2)
```

### Query Tickets by Status
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "Status",
      "status": {"equals": "New"}
    },
    "sorts": [{"property": "Priority", "direction": "ascending"}],
    "page_size": 100
  }'
```

### Query with App Filter
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "Status", "status": {"equals": "New"}},
        {"property": "App / Dashboard", "multi_select": {"contains": "APP"}}
      ]
    },
    "sorts": [{"property": "Priority", "direction": "ascending"}],
    "page_size": 100
  }'
```

### Query with Sprint Filter
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "Status", "status": {"equals": "New"}},
        {"property": "Sprint", "select": {"equals": "Sprint 3"}}
      ]
    },
    "sorts": [{"property": "Priority", "direction": "ascending"}],
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

### Set Status to Backlog
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"status": {"name": "Backlog"}}}}'
```

### Add Dev's Comment
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Dev'\''s Comment": {"rich_text": [{"text": {"content": "[COMMENT_TEXT]"}}]}}}'
```

## Output Format

### Starting
```
Found [N] tickets with status "New":

1. #101 [APP] Bug | Urgent - Login redirect issue
2. #102 [Admin Dashboard] Bug | High - Widget loading issue
3. #103 [APP] New Feature | Medium - Dark mode toggle

Starting sequential processing...
```

### Progress (Per Ticket)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1/6] Processing: Login redirect issue (#101)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: New → In Progress
Description: User should be redirected to dashboard after login.
Feature: Authentication
Sprint: Sprint 3
Analyzing...
Found relevant files: frontend/app/pages/auth/login.tsx
Implementing fix...
Status: In Progress → Ready for test
Dev's Comment added.

[1/6] COMPLETED
```

### Final Summary
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BATCH PROCESSING COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 6 tickets processed

Ready for test (5):
  - #101 Login redirect issue
  - #102 Widget loading issue
  - #103 Dark mode toggle
  - #104 Notification preferences
  - #105 Toast position

Backlog (1):
  - #106 API integration (needs external dependency)

Files Modified:
  - frontend/app/pages/auth/login.tsx
  - frontend/app/components/Dashboard.tsx
  - frontend/app/styles/theme.css

Suggested commit:
  fix: resolve multiple tickets (#101, #102, #103, #104, #105)
```

## Status Transitions

| From | To | Trigger |
|------|-----|---------|
| New | In Progress | Ticket picked for processing |
| Backlog | In Progress | Ticket picked for retry |
| In Progress | Ready for test | Implementation complete |
| In Progress | Backlog | Cannot proceed, needs more info |

## Options

### Stop on First Error
```
Fix all tickets with status "New"
Option: Stop on error
```

### Skip Confirmation
```
Fix all tickets with status "New"
Option: Auto-confirm
```

### Dry Run
```
Fix all tickets with status "New"
Option: Dry run (show plan only)
```

## Related

- [fix-single.md](./fix-single.md) - Fix a single ticket
- [review-all.md](./review-all.md) - Review all tickets first
- [filter-by-app.md](./filter-by-app.md) - Filter by app
- [filter-by-project.md](./filter-by-project.md) - Filter by project
