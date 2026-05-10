# Update Notion Tickets via Curl

## Prompt Template

```
Update ticket [PAGE_ID] status to [STATUS]
```

Or:

```
Add comment to ticket [PAGE_ID]: [COMMENT_TEXT]
```

## Description

Update ticket status and add comments to Project Ticket entries using curl commands. Works independently of the MCP server.

## Prerequisites

1. **NOTION_API_KEY** must be set in `backend/.env`
2. **Page ID** of the ticket to update

## Update Status

### Set to "In Progress"

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Status": {
        "status": {
          "name": "In Progress"
        }
      }
    }
  }'
```

### Set to "Ready for test"

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Status": {
        "status": {
          "name": "Ready for test"
        }
      }
    }
  }'
```

### Set to "Close"

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Status": {
        "status": {
          "name": "Close"
        }
      }
    }
  }'
```

### Set to "Backlog"

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Status": {
        "status": {
          "name": "Backlog"
        }
      }
    }
  }'
```

## Add Dev's Comment

### Update Dev's Comment Property

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Dev'\''s Comment": {
        "rich_text": [
          {
            "text": {
              "content": "Your developer comment here"
            }
          }
        ]
      }
    }
  }'
```

### Add Page Comment (Discussion)

```bash
curl -s -X POST "https://api.notion.com/v1/comments" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {
      "page_id": "[PAGE_ID]"
    },
    "rich_text": [
      {
        "text": {
          "content": "Your comment text here"
        }
      }
    ]
  }'
```

### Implementation Complete Comment

```bash
curl -s -X POST "https://api.notion.com/v1/comments" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {
      "page_id": "[PAGE_ID]"
    },
    "rich_text": [
      {
        "text": {
          "content": "Fix implemented.\n\nFiles modified:\n- file1.ts\n- file2.ts\n\nChanges:\n- Description of changes\n\nTesting:\n- Tested locally\n- Ready for QA"
        }
      }
    ]
  }'
```

## Update Multiple Properties

### Status + Dev's Comment

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Status": {
        "status": {
          "name": "Ready for test"
        }
      },
      "Dev'\''s Comment": {
        "rich_text": [
          {
            "text": {
              "content": "Fix implemented - ready for QA verification"
            }
          }
        ]
      }
    }
  }'
```

## Retrieve Comments

### Get All Comments on a Page

```bash
curl -s -X GET "https://api.notion.com/v1/comments?block_id=[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

## Workflow: Fix a Ticket

### Step 1: Start Work

```bash
# Set status to "In Progress"
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"status": {"name": "In Progress"}}}}'
```

### Step 2: Implement Changes

(Make code changes in the codebase)

### Step 3: Complete Work

```bash
# Set status to "Ready for test" and add Dev's Comment
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Status": {"status": {"name": "Ready for test"}},
      "Dev'\''s Comment": {"rich_text": [{"text": {"content": "Fixed navigation issue. Modified: frontend/app/pages/auth/"}}]}
    }
  }'
```

## Status Values Reference

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

## Troubleshooting

### "Could not find property"
- Ensure "Status" property exists and is type "status" (not "select")
- Property names are case-sensitive
- "Dev's Comment" includes an apostrophe

### "Validation error"
- Check status value matches exactly (e.g., "In Progress" not "in progress")
- Valid values: Backlog, New, In Progress, Ready for test, Close
- Verify page_id format (UUID with or without dashes)

### "Object not found"
- Verify page_id is correct
- Ensure integration has access to the page

## Related

- [review-tickets.md](./review-tickets.md) - Review tickets via curl
- [fix-all-by-status.md](./fix-all-by-status.md) - Fix all tickets sequentially
- [fix-single.md](./fix-single.md) - Fix a single ticket
