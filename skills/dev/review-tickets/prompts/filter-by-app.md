# Filter by App / Dashboard

## Prompt Template

```
Review notion tickets
Filter: App = "APP", Status = "New"
```

## Description

Filter Project Ticket entries by App / Dashboard to see issues relevant to a specific application.

## Database

| Field | Value |
|-------|-------|
| **Database ID** | `ba90177d-58a7-443f-8a59-87c589e48f58` |
| **API Key Location** | `backend/.env` → `NOTION_API_KEY` |

## Available Apps

| App | Description |
|-----|-------------|
| **APP** | Main application |
| **Admin Dashboard** | Admin panel |
| **Nanny App** | Nanny-facing app |
| **Parent App** | Parent-facing app |
| **Teacher Dashboard** | Teacher panel |
| **Student Dashboard** | Student panel |
| **All Pages** | Affects all pages |
| **K Talk Live** | K Talk Live platform |
| **K Talk Live Landing Page** | Landing page |
| **K Talk Language Center** | Language center |
| **E-commerce Website** | E-commerce site |
| **Crypoo App** | Crypoo application |
| **Project Owner** | Project owner view |
| **Team Member** | Team member view |

## Example Usage

### Single App
```
Review notion tickets
Filter: App = "APP", Status = "New"
```

### Admin Dashboard
```
Review notion tickets
Filter: App = "Admin Dashboard"
```

### Multiple Apps
```
Review notion tickets
Filter: App = "APP" OR App = "Admin Dashboard"
```

### App + Category
```
Review notion tickets
Filter: App = "APP", Category = "Bug"
```

### App + Sprint
```
Review notion tickets
Filter: App = "APP", Sprint = "Sprint 3"
```

## Curl Commands

### Get API Key from backend/.env
```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" backend/.env | cut -d'=' -f2)
```

### Filter by Single App
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "App / Dashboard", "multi_select": {"contains": "APP"}},
        {"property": "Status", "status": {"equals": "New"}}
      ]
    },
    "page_size": 100
  }'
```

### Filter by Multiple Apps
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {
          "or": [
            {"property": "App / Dashboard", "multi_select": {"contains": "APP"}},
            {"property": "App / Dashboard", "multi_select": {"contains": "Admin Dashboard"}}
          ]
        },
        {"property": "Status", "status": {"equals": "New"}}
      ]
    },
    "page_size": 100
  }'
```

### Filter by App + Category
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "App / Dashboard", "multi_select": {"contains": "APP"}},
        {"property": "Category", "multi_select": {"contains": "Bug"}},
        {"property": "Status", "status": {"equals": "New"}}
      ]
    },
    "page_size": 100
  }'
```

## Output Format

```
Found [N] tickets for app APP:

### Bug (3 issues)
1. #101 Login redirect issue (Urgent) - Sprint 3
2. #102 Profile update error (High) - Sprint 3
3. #103 Form validation (Medium) - Sprint 4

### New Feature (1 issue)
4. #104 Dark mode toggle (Medium) - Sprint 4

### Change Request (2 issues)
5. #105 Theme toggle (Low) - Sprint 5
6. #106 Notification preferences (Low) - Sprint 5
```

## Common Use Cases

### Daily Bug Triage
```
Review notion tickets
Filter: App = "APP", Status = "New", Category = "Bug"
```

### Admin Dashboard Issues
```
Review notion tickets
Filter: App = "Admin Dashboard", Status = "New"
```

### All Frontend Issues
```
Review notion tickets
Filter: App = "APP" OR App = "Admin Dashboard" OR App = "Teacher Dashboard"
```

### Ready for Test Issues
```
Review notion tickets
Filter: App = "APP", Status = "Ready for test"
```

## Related

- [review-all.md](./review-all.md) - Review all tickets
- [filter-by-project.md](./filter-by-project.md) - Filter by project
