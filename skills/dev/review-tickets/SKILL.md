---
name: review-tickets
description: Fetch, analyze, fix, and update tickets from Notion database using Claude Code
---

# Notion Ticket Reviewer

Automatically fetch, analyze, fix, and update tickets from the Project Ticket Notion database using Claude Code.

---

## Overview

This skill enables Claude Code to:
1. **Fetch tickets** from the Project Ticket Notion database
2. **Filter** by status, priority, category, app, sprint, or project
3. **Analyze requirements** from ticket descriptions
4. **Implement fixes** in the codebase automatically
5. **Update ticket status** to "In Progress" → "Ready for test"
6. **Add comments** with implementation details

---

## Quick Start

### Review All Tickets
```
Review notion tickets
```

### Review New Tickets Only
```
Review notion tickets with status New
```

### Fix a Single Ticket
```
Fix ticket: <ticket title>
```
or
```
Fix ticket: <page-id>
```

### Filter by App
```
Review notion tickets
Filter: App = "APP", Status = "New"
```

### Filter by Sprint
```
Review notion tickets
Filter: Sprint = "Sprint 3"
```

---

## Database Configuration

| Field | Value |
|-------|-------|
| **Database ID** | `ba90177d-58a7-443f-8a59-87c589e48f58` |
| **Database Name** | Project Ticket |
| **Workspace** | Potential Inc |
| **API Key Location** | `backend/.env` → `NOTION_API_KEY` |

---

## Workflow: One-by-One Ticket Fixing

### Step 1: List Tickets
```
Review notion tickets
```
- Shows all "New" tickets
- Grouped by category (Bug, New Feature, etc.)
- Displays: Priority, App, Sprint, Feature, Title, Ticket ID

### Step 2: Select & Start Ticket
```
Fix ticket: [ticket title or ID]
```
- Sets status to **"In Progress"**
- Analyzes ticket requirements
- Explores relevant codebase files

### Step 3: Implement
Claude will:
- Read relevant files based on ticket description and feature
- Make necessary code changes
- Follow project coding standards
- Run tests if applicable

### Step 4: Complete
After implementation:
- Sets status to **"Ready for test"**
- Adds Dev's Comment with:
  - Files modified
  - Changes made
  - Testing notes
- Optionally creates git commit

### Step 5: Next Ticket
```
Fix next ticket
```
or select another ticket by name/ID

---

## Database Schema (Project Ticket)

### Core Properties

| Property | Type | Values |
|----------|------|--------|
| **Title** | title | Ticket name |
| **Status** | status | Backlog, New, In Progress, Ready for test, Close |
| **Priority** | select | Urgent, High, Medium, Low |
| **Category** | multi_select | Bug, New Feature, Change Request, Todo |
| **Description** | rich_text | Detailed ticket description |

### Context Properties

| Property | Type | Purpose |
|----------|------|---------|
| **App / Dashboard** | multi_select | Which app is affected |
| **Feature** | rich_text | Related feature name |
| **Sprint** | select | Sprint 1-6 |
| **URL** | rich_text | Related URL or reference |

### Assignment Properties

| Property | Type | Purpose |
|----------|------|---------|
| **Assignee** | relation | Person assigned to the ticket |
| **Client** | people | Client contact |
| **Project** | relation | Related project |

### Additional Properties

| Property | Type | Purpose |
|----------|------|---------|
| **Dev's Comment** | rich_text | Developer implementation notes |
| **Ticket ID** | unique_id | Auto-generated ticket number |
| **Image, Video** | files | Screenshots/attachments |
| **Due Date** | date | Deadline |
| **Created time** | created_time | When ticket was created |
| **Created by** | created_by | Who created the ticket |

---

## Status Values

### To-do Group
| Status | Description |
|--------|-------------|
| **Backlog** | Planned but not yet started |
| **New** | Newly reported, ready to be worked on |

### In Progress Group
| Status | Description |
|--------|-------------|
| **In Progress** | Currently being worked on |
| **Ready for test** | Fix complete, ready for QA |

### Complete Group
| Status | Description |
|--------|-------------|
| **Close** | Verified and closed |

---

## Priority Values

| Priority | Description |
|----------|-------------|
| **Urgent** | Critical, fix immediately |
| **High** | Fix this sprint |
| **Medium** | Fix when possible |
| **Low** | Nice to have |

---

## Category Values

| Category | Description |
|----------|-------------|
| **Bug** | Something is broken |
| **New Feature** | New functionality to implement |
| **Change Request** | Modification to existing behavior |
| **Todo** | General task |

---

## Sprint Values

Sprint 1, Sprint 2, Sprint 3, Sprint 4, Sprint 5, Sprint 6

---

## App / Dashboard Values

Nanny App, Parent App, Admin Dashboard, APP, Teacher Dashboard, All Pages, Student Dashboard, K Talk Live Landing Page, E-commerce Website, K Talk Live, K Talk Language Center, Crypoo App, Project Owner, Team Member

---

## Filter Examples

### By Status
```python
filter = {
    "property": "Status",
    "status": {"equals": "New"}
}
```

### By Priority
```python
filter = {
    "property": "Priority",
    "select": {"equals": "High"}
}
```

### By Category
```python
filter = {
    "property": "Category",
    "multi_select": {"contains": "Bug"}
}
```

### By App
```python
filter = {
    "property": "App / Dashboard",
    "multi_select": {"contains": "APP"}
}
```

### By Sprint
```python
filter = {
    "property": "Sprint",
    "select": {"equals": "Sprint 3"}
}
```

### Combined Filters
```python
filter = {
    "and": [
        {"property": "Status", "status": {"equals": "New"}},
        {"property": "Category", "multi_select": {"contains": "Bug"}},
        {"property": "App / Dashboard", "multi_select": {"contains": "APP"}}
    ]
}
```

---

## API Reference

### Query Database
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"filter": {"property": "Status", "status": {"equals": "New"}}}'
```

### Update Ticket Status
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"status": {"name": "In Progress"}}}}'
```

### Add Dev's Comment
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/PAGE_ID" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Dev'\''s Comment": {"rich_text": [{"text": {"content": "Fix implemented"}}]}}}'
```

### Add Page Comment
```bash
curl -s -X POST "https://api.notion.com/v1/comments" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"parent": {"page_id": "PAGE_ID"}, "rich_text": [{"text": {"content": "Implementation complete"}}]}'
```

---

## Prerequisites

### 1. Notion API Key
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create new integration
3. Copy the Internal Integration Secret (starts with `ntn_` or `secret_`)

### 2. Add to .env File
Add your API key to `backend/.env`:
```
NOTION_API_KEY=ntn_your_key_here
```

### 3. Share Database
1. Open your Notion database
2. Click "..." → "Add connections"
3. Select your integration

### 4. Test Connection
```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" backend/.env | cut -d'=' -f2)
curl -s -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

---

## Troubleshooting

### "API token is invalid"
1. Check `NOTION_API_KEY` in `backend/.env`
2. Verify key starts with `ntn_` or `secret_`
3. Regenerate key at notion.so/my-integrations if needed

### "Database not found"
1. Database ID: `ba90177d-58a7-443f-8a59-87c589e48f58`
2. Ensure integration has access to the database
3. Re-share database with integration

### "Status update failed"
1. Verify "Status" property exists
2. Check status option names match exactly: Backlog, New, In Progress, Ready for test, Close
3. Ensure property type is "Status" (not "Select")

### Test curl connection
```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" backend/.env | cut -d'=' -f2)
curl -s -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

---

## Related Files

- `databases/example-config.json` - Database configuration
- `prompts/review-tickets.md` - Review tickets via curl
- `prompts/update-ticket.md` - Update ticket status via curl
- `prompts/fix-single.md` - Fix single ticket prompt
- `prompts/fix-all-by-status.md` - Fix all tickets by status
- `prompts/filter-by-app.md` - Filter by app prompt
- `prompts/filter-by-project.md` - Filter by project prompt

---

## Example Session

```
User: Review notion tickets with status New

Claude: Found 6 tickets with "New" status:

### Bugs
1. #101 [APP] Login redirect issue (Urgent)
2. #102 [Admin Dashboard] Calendar gap between elements (High)

### New Features
3. #103 [APP] Add dark mode toggle (Medium)

### Change Requests
4. #104 [APP] Update notification preferences (Low)
...

User: Fix ticket: Login redirect issue

Claude:
1. Setting status to "In Progress"...
2. Reading ticket description: "After login, user should redirect to dashboard."
3. Feature: Authentication
4. Exploring codebase for login routing...
5. Found: frontend/app/pages/auth/...
6. Implementing fix...
7. Setting status to "Ready for test"
8. Adding Dev's Comment with implementation details

Done! Ticket ready for QA verification.
```
