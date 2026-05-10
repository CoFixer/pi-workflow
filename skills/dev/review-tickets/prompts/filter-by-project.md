# Filter by Project

## Prompt Template

```
Review notion tickets
Filter: Project = "[PROJECT_NAME]"
```

## Description

Filter tickets by their related project to focus on work for a specific project. The Project field is a **relation** type pointing to the Projects database.

## Database

| Field | Value |
|-------|-------|
| **Ticket Database ID** | `ba90177d-58a7-443f-8a59-87c589e48f58` |
| **Projects Database ID** | `15ab6d88-d2cf-8030-86b5-f63311e2c98e` |
| **API Key Location** | `backend/.env` → `NOTION_API_KEY` |

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `PROJECT_NAME` | Yes | The project name to filter by |

## How Project Filtering Works

The "Project" property is a **relation** to the Projects database. To filter:

1. **First**: Look up the project page ID from the Projects database
2. **Then**: Filter tickets by the relation containing that page ID

## Example Usage

### Single Project
```
Review notion tickets
Filter: Project = "DesignFlow"
```

### Project + Status
```
Review notion tickets
Filter: Project = "DesignFlow", Status = "New"
```

### Project + Category
```
Review notion tickets
Filter: Project = "DesignFlow", Category = "Bug"
```

### Project + Sprint
```
Review notion tickets
Filter: Project = "DesignFlow", Sprint = "Sprint 3"
```

## Curl Commands

### Get API Key from backend/.env
```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" backend/.env | cut -d'=' -f2)
```

### Step 1: Find Project Page ID
```bash
curl -s -X POST "https://api.notion.com/v1/databases/15ab6d88-d2cf-8030-86b5-f63311e2c98e/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "title",
      "title": {"contains": "PROJECT_NAME"}
    }
  }'
```

### Step 2: Filter Tickets by Project Relation
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "Project",
      "relation": {
        "contains": "[PROJECT_PAGE_ID]"
      }
    },
    "page_size": 100
  }'
```

### Combined: Project + Status
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {
          "property": "Project",
          "relation": {"contains": "[PROJECT_PAGE_ID]"}
        },
        {
          "property": "Status",
          "status": {"equals": "New"}
        }
      ]
    },
    "page_size": 100
  }'
```

### Combined: Project + Status + Category
```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {"property": "Project", "relation": {"contains": "[PROJECT_PAGE_ID]"}},
        {"property": "Status", "status": {"equals": "New"}},
        {"property": "Category", "multi_select": {"contains": "Bug"}}
      ]
    },
    "page_size": 100
  }'
```

## Known Projects (Partial List)

| Project Name | Page ID |
|-------------|---------|
| Cliwant | 15ab6d88-d2cf-8008-83a6-cf4f1af2ab0d |
| K Talk | 16cb6d88-d2cf-8061-820a-cdaeac464f70 |
| Finly | 1c2b6d88-d2cf-8017-b428-ea2f6b2e2e3b |
| Momly | 1e4b6d88-d2cf-801e-b477-c7a3795d3754 |
| Omni | 232b6d88-d2cf-80ca-a0d9-ca1cb4349d4f |
| Rentiva | 238b6d88-d2cf-80b7-bcd8-fd53aa7592f8 |
| Serviqo | 242b6d88-d2cf-80db-8644-df471318f8f5 |
| Carvo | 253b6d88-d2cf-804e-a4f3-d6cfd3ede1ba |
| Silvara.ai | 264b6d88-d2cf-802d-8ea6-d97f201e29e0 |
| Trustix | 271b6d88-d2cf-80e1-ac31-dbdf268ee3d4 |

> **Note:** Run the "Find Project Page ID" curl command to discover all projects or find a specific one.

## Output Format

```
Found [N] tickets for project [PROJECT_NAME]:

### By Category
#### Bug (3)
1. #101 [APP] Login redirect issue (Urgent) - Sprint 3
2. #102 [Admin Dashboard] Widget loading (High) - Sprint 3
3. #103 [APP] Form validation (Medium) - Sprint 4

#### New Feature (2)
4. #104 [APP] Dark mode toggle (Medium) - Sprint 4
5. #105 [APP] Export functionality (Low) - Sprint 5

#### Change Request (1)
6. #106 [APP] Update notification format (Low) - Sprint 5
```

## Workflow Recommendations

### For Focused Development Sessions
1. **Start with project filter**: See all work for your project
2. **Narrow by priority**: Focus on Urgent/High first
3. **Pick a ticket**: `Fix ticket: [title]`
4. **Complete and move**: Update status, fix next ticket

### Example Session
```
User: Review notion tickets
      Filter: Project = "DesignFlow", Status = "New"

Claude: Found 15 DesignFlow tickets:
        [Lists tickets grouped by category]

User: Fix ticket: Login redirect issue

Claude: [Implements fix, updates status]

User: Fix next ticket

Claude: [Picks next high-priority ticket]
```

## Notes

- The "Project" property is a **relation** type
- Filtering requires a two-step process: find project ID, then filter tickets
- If the project doesn't exist in the Projects database, no tickets will match
- Use `title: {"contains": "..."}` for partial name matching

## Related

- [review-all.md](./review-all.md) - Review all tickets
- [filter-by-app.md](./filter-by-app.md) - Filter by app
- [fix-single.md](./fix-single.md) - Fix a single ticket
