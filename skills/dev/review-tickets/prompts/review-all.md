# Review All Tickets

## Prompt Template

```
Review notion tickets
```

## Description

Fetches all tickets from the Project Ticket Notion database and presents them grouped by category, app, or status.

## Database

| Field | Value |
|-------|-------|
| **Database ID** | `ba90177d-58a7-443f-8a59-87c589e48f58` |
| **API Key Location** | `backend/.env` → `NOTION_API_KEY` |

## Default Filter

- Status: **New** (ready to work on)
- Sorted by: Priority (Urgent → Low)

## Output Format

```
Found [N] tickets:

### [Category: Bug]
1. #101 [APP] Sprint 3 - Title (Urgent)
2. #102 [Admin Dashboard] Sprint 3 - Title (High)

### [Category: New Feature]
3. #103 [APP] Sprint 4 - Title (Medium)
...
```

## Example Usage

### Basic Review
```
Review notion tickets
```

### With Status Filter
```
Review notion tickets with status New
```

### With App Filter
```
Review notion tickets
Filter: App = "APP"
```

### With Category Filter
```
Review notion tickets
Filter: Category = "Bug"
```

### With Sprint Filter
```
Review notion tickets
Filter: Sprint = "Sprint 3"
```

## Curl Commands

### Get API Key from backend/.env
```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" backend/.env | cut -d'=' -f2)
```

### Query Database
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

### With Category Filter
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "Status", "status": {"equals": "New"}},
        {"property": "Category", "multi_select": {"contains": "Bug"}}
      ]
    },
    "page_size": 100
  }'
```

### With Sprint Filter
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
    "page_size": 100
  }'
```

## API Filter Reference

```json
{
  "filter": {
    "property": "Status",
    "status": {
      "equals": "New"
    }
  },
  "sorts": [
    {
      "property": "Priority",
      "direction": "ascending"
    }
  ]
}
```

## Next Steps After Review

After reviewing tickets, you can:
1. Fix a specific ticket: `Fix ticket: [title or ID]`
2. Filter further: Add app, category, or sprint filter
3. Fix all: `Fix all tickets with status "New"`
4. Export: Request a summary or export

## Related

- [fix-single.md](./fix-single.md) - Fix a single ticket
- [filter-by-app.md](./filter-by-app.md) - Filter by app
- [filter-by-project.md](./filter-by-project.md) - Filter by project
