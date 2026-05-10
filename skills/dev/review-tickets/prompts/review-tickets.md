# Review Notion Tickets via Curl

## Prompt Template

```
Review notion tickets
```

## Description

Review all tickets from the Project Ticket Notion database using curl commands. This works independently of the MCP server and is compatible with any project.

## Database

| Field | Value |
|-------|-------|
| **Database ID** | `ba90177d-58a7-443f-8a59-87c589e48f58` |
| **Database Name** | Project Ticket |
| **API Key Location** | `backend/.env` → `NOTION_API_KEY` |

## Prerequisites

1. **NOTION_API_KEY** must be set in `backend/.env`
2. **Database must be shared** with your Notion integration

## Workflow

### Step 1: Get API Key

Read the API key from `backend/.env`:

```bash
NOTION_API_KEY=$(grep -E "^NOTION_API_KEY=" backend/.env | cut -d'=' -f2)
echo "API Key found: ${NOTION_API_KEY:0:10}..."
```

### Step 2: Test Connection

Verify the API key works:

```bash
curl -s -X GET "https://api.notion.com/v1/users/me" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

Expected response includes `"object": "user"` and workspace info.

### Step 3: Query Database

Fetch all tickets from the database:

```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"page_size": 100}'
```

### Step 4: Parse and Display

Save response to temp file and parse with Node.js:

```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/notion_tickets.json', 'utf8'));

const tickets = data.results.map(page => {
  const props = page.properties;
  return {
    id: page.id,
    ticketId: props['Ticket ID']?.unique_id?.number || '-',
    title: props['Title']?.title?.[0]?.plain_text || 'Untitled',
    status: props['Status']?.status?.name || 'Unknown',
    priority: props['Priority']?.select?.name || 'None',
    category: props['Category']?.multi_select?.map(t => t.name).join(', ') || '-',
    app: props['App / Dashboard']?.multi_select?.map(a => a.name).join(', ') || '-',
    sprint: props['Sprint']?.select?.name || '-',
    feature: props['Feature']?.rich_text?.[0]?.plain_text || '-',
    description: props['Description']?.rich_text?.[0]?.plain_text || '-',
    devComment: props["Dev's Comment"]?.rich_text?.[0]?.plain_text || '-',
    url: props['URL']?.rich_text?.[0]?.plain_text || '-'
  };
});

// Group by status
const byStatus = {};
tickets.forEach(t => {
  if (!byStatus[t.status]) byStatus[t.status] = [];
  byStatus[t.status].push(t);
});

console.log(`Total tickets: ${tickets.length}\n`);

// Display by status
['New', 'In Progress', 'Ready for test', 'Backlog', 'Close'].forEach(status => {
  const items = byStatus[status] || [];
  if (items.length) {
    console.log(`=== ${status} (${items.length}) ===`);
    items.forEach(t => {
      console.log(`  #${t.ticketId} [${t.app}] ${t.category} | ${t.priority}`);
      console.log(`       ${t.title}`);
      console.log(`       Sprint: ${t.sprint} | Feature: ${t.feature}`);
      if (t.description !== '-') console.log(`       ${t.description.substring(0, 80)}...`);
    });
    console.log();
  }
});
```

## Filter Options

### By Status

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
    "page_size": 100
  }'
```

### By Category

```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "Category",
      "multi_select": {"contains": "Bug"}
    },
    "page_size": 100
  }'
```

### By App

```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "App / Dashboard",
      "multi_select": {"contains": "APP"}
    },
    "page_size": 100
  }'
```

### By Sprint

```bash
curl -s -X POST "https://api.notion.com/v1/databases/ba90177d-58a7-443f-8a59-87c589e48f58/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "property": "Sprint",
      "select": {"equals": "Sprint 3"}
    },
    "page_size": 100
  }'
```

### Combined Filters

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

## Output Format

```
Total tickets: 12

=== New (6) ===
  #101 [APP] Bug | Urgent
       Login redirect issue
       Sprint: Sprint 3 | Feature: Authentication
       User should be redirected to dashboard after login...
  #102 [Admin Dashboard] Bug | High
       Widget loading issue
       Sprint: Sprint 3 | Feature: Dashboard
       Dashboard widgets take too long to load...

=== In Progress (2) ===
  #105 [APP] New Feature | Medium
       Dark mode toggle
       Sprint: Sprint 4 | Feature: Settings

=== Ready for test (4) ===
  ...
```

## Troubleshooting

### "API token is invalid"
- Check NOTION_API_KEY is set correctly in `backend/.env`
- Verify key starts with `ntn_` or `secret_`
- Regenerate key at notion.so/my-integrations

### "Database not found"
- Database ID: `ba90177d-58a7-443f-8a59-87c589e48f58`
- Ensure database is shared with your integration
- Go to database in Notion > ... > Add connections

### "Could not find property"
- Property names are case-sensitive
- Check exact property names: "Title", "Status", "Category", "App / Dashboard", "Feature", "Sprint", "Priority"

## Related

- [update-ticket.md](./update-ticket.md) - Update tickets via curl
- [fix-all-by-status.md](./fix-all-by-status.md) - Fix all tickets sequentially
- [fix-single.md](./fix-single.md) - Fix a single ticket
