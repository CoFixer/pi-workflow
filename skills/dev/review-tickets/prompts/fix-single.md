# Fix Single Ticket

## Prompt Template

```
Fix ticket: [TICKET_TITLE_OR_ID]
```

## Description

Analyzes a single Project Ticket, implements the fix in the codebase, and updates the ticket status with implementation details.

## Database

| Field | Value |
|-------|-------|
| **Database ID** | `ba90177d-58a7-443f-8a59-87c589e48f58` |
| **API Key Location** | `backend/.env` → `NOTION_API_KEY` |

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `TICKET_TITLE_OR_ID` | Yes | The ticket title (partial match) or page ID |

## Workflow

```
1. FIND TICKET
   └── Search by title or ID via curl
   └── Fetch ticket details from Notion API

2. SET IN PROGRESS
   └── Update Status via curl: "New" → "In Progress"

3. ANALYZE
   └── ⚠️ Ticket titles can be misleading — always read block content first
   └── Fetch block content via curl (see "Fetch Block Content" command below)
   └── Read all text blocks for the real description and requirements
   └── Download and view image blocks (S3 URLs expire — download immediately):
       mkdir -p /tmp/notion-images
       curl -sL "{IMAGE_URL}" -o "/tmp/notion-images/ticket-image-{N}.png"
       # Then use Read tool to view each image visually
   └── Parse ticket title for intent (after reading blocks)
   └── Extract requirements from block content (not just title)
   └── Identify Feature context
   └── Check App / Dashboard context
   └── Check Sprint assignment

4. EXPLORE CODEBASE
   └── Search for files matching feature context
   └── Read existing implementations
   └── Understand context

5. IMPLEMENT
   └── Make targeted code changes
   └── Follow existing patterns
   └── Run tests if applicable

6. COMPLETE
   └── Update Status via curl: "In Progress" → "Ready for test"
   └── Add Dev's Comment with implementation details
   └── Suggest git commit message
```

## Curl Commands

### Get API Key from backend/.env
```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" backend/.env | cut -d'=' -f2)
```

### Fetch Block Content (Step 3 — read BEFORE analyzing)
```bash
curl -s "https://api.notion.com/v1/blocks/[PAGE_ID]/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```
Parse the response:
- Text blocks (`paragraph`, `bulleted_list_item`, `numbered_list_item`, `callout`, `heading_*`): extract `.text[].plain_text` for the real description
- Image blocks: extract `.image.file.url` or `.image.external.url`, then download immediately (S3 URLs expire):
  ```bash
  mkdir -p /tmp/notion-images
  curl -sL "[IMAGE_URL]" -o "/tmp/notion-images/ticket-image-1.png"
  # Use Read tool to view the image visually
  ```

### Search for Ticket by Title
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"filter": {"property": "Title", "title": {"contains": "[SEARCH_TERM]"}}}'
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

### Add Dev's Comment
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Dev'\''s Comment": {"rich_text": [{"text": {"content": "[COMMENT_TEXT]"}}]}}}'
```

### Add Page Comment
```bash
curl -s -X POST "https://api.notion.com/v1/comments" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"parent": {"page_id": "[PAGE_ID]"}, "rich_text": [{"text": {"content": "[COMMENT_TEXT]"}}]}'
```

## Example Usage

### By Title
```
Fix ticket: Login redirect issue
```

### By ID
```
Fix ticket: 01390997-0f96-420d-a747-50a3e2cc5638
```

### With Context
```
Fix ticket: Login redirect issue
Context: The redirect should go to /dashboard after successful auth
```

## Output Format

### Success
```
Ticket Fixed: Login redirect issue (#101)
Status: New → In Progress → Ready for test

App: APP
Feature: Authentication
Sprint: Sprint 3

Files Modified:
- frontend/app/pages/auth/login.tsx
- frontend/app/services/authService.ts

Changes:
- Added redirect logic after successful login
- Updated auth service to return redirect URL

Dev's Comment Added: Yes
Commit Suggested: fix: resolve login redirect to dashboard (#101)
```

### Cannot Fix
```
Ticket Blocked: [Title]
Status: New → Backlog

Reason: Requires design clarification / external dependency

Action Required:
- Confirm with design team
- Update ticket description if needed

Dev's Comment Added: Yes (with explanation)
```

## Status Transitions

| From | To | Trigger |
|------|-----|---------|
| New | In Progress | `Fix ticket:` command |
| Backlog | In Progress | `Fix ticket:` command |
| In Progress | Ready for test | Implementation complete |
| In Progress | Backlog | Cannot proceed, needs more info |

## Comment Template

When completing a ticket, the Dev's Comment is updated:

```
## Fix Implemented

**Files Modified:**
- [file1.ts]
- [file2.tsx]

**Changes:**
- [Change 1 description]
- [Change 2 description]

**Feature:** [feature name]

**Testing:**
- [Test notes or N/A]

**Commit:** `fix: [commit message suggestion]`

---
*Updated by Claude Code*
```

## Related

- [review-tickets.md](./review-tickets.md) - Review all tickets
- [update-ticket.md](./update-ticket.md) - Update ticket status
- [fix-all-by-status.md](./fix-all-by-status.md) - Fix all tickets by status
