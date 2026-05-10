---
description: Generate copy-pastable n8n workflow JSON from natural language descriptions
argument-hint: "<description of workflow> [--template <name>] [--list-templates]"
---

# n8n Workflow Generator

Generate valid n8n workflow JSON that can be directly imported via clipboard paste.

## Usage

```bash
/n8n-generator <description>
/n8n-generator --template <template-name>
/n8n-generator --list-templates
```

### Examples

```bash
/n8n-generator When a webhook receives data, send a Slack message
/n8n-generator Every day at 9am, fetch data from API and save to Google Sheets
/n8n-generator --template webhook-slack
/n8n-generator --list-templates
```

## Arguments

- `$ARGUMENTS` - The workflow description or command flags

## Available Templates

| Template Name | Description |
|---------------|-------------|
| `webhook-slack` | Webhook trigger → Slack notification |
| `webhook-email` | Webhook trigger → Email notification |
| `cron-http` | Schedule trigger → HTTP Request |
| `cron-sheets` | Schedule trigger → Google Sheets append |
| `http-transform` | HTTP Request → Data transformation → Output |
| `webhook-condition` | Webhook → IF condition → Multiple outputs |
| `error-handler` | Workflow with error handling pattern |

---

## Execution Steps

### Step 1: Parse Request

**If `--list-templates` flag is present:**
Display the template table above and exit.

**If `--template <name>` flag is present:**
Use the specified template as the base workflow.

**Otherwise:**
Parse the natural language description to identify:
- Trigger type (webhook, cron, manual)
- Data sources (APIs, databases, services)
- Transformations needed
- Output destinations
- Conditional logic requirements

### Step 2: Design Workflow Flow

Map the requirements to n8n nodes:

| Requirement | n8n Node Type |
|-------------|---------------|
| Webhook trigger | `n8n-nodes-base.webhook` |
| Schedule/Cron | `n8n-nodes-base.scheduleTrigger` |
| Manual trigger | `n8n-nodes-base.manualTrigger` |
| HTTP request | `n8n-nodes-base.httpRequest` |
| Slack message | `n8n-nodes-base.slack` |
| Email | `n8n-nodes-base.emailSend` |
| Google Sheets | `n8n-nodes-base.googleSheets` |
| Set data | `n8n-nodes-base.set` |
| Code/Function | `n8n-nodes-base.code` |
| IF condition | `n8n-nodes-base.if` |
| Switch | `n8n-nodes-base.switch` |
| Merge | `n8n-nodes-base.merge` |
| Split In Batches | `n8n-nodes-base.splitInBatches` |
| Wait | `n8n-nodes-base.wait` |
| Error Trigger | `n8n-nodes-base.errorTrigger` |

### Step 3: Generate Workflow JSON

Build the workflow JSON with this structure:

```json
{
  "name": "<Workflow Name>",
  "nodes": [
    {
      "parameters": { /* node-specific parameters */ },
      "id": "<uuid>",
      "name": "<Node Display Name>",
      "type": "<node-type>",
      "typeVersion": 1,
      "position": [x, y]
    }
  ],
  "connections": {
    "<Source Node Name>": {
      "main": [
        [
          {
            "node": "<Target Node Name>",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "<uuid>",
  "meta": {
    "instanceId": "<uuid>"
  },
  "tags": []
}
```

### Step 4: Position Nodes

Arrange nodes visually with these guidelines:
- Start trigger at position `[250, 300]`
- Horizontal spacing: `250px` between nodes
- Vertical spacing: `150px` for branching paths
- Flow left to right

### Step 5: Output Result

Output the complete workflow JSON in a clearly marked code block:

```
## Generated n8n Workflow

**Workflow Name:** <name>
**Nodes:** <count> nodes
**Flow:** <brief description>

### How to Import
1. Copy the JSON below
2. In n8n, press `Ctrl+V` (or `Cmd+V` on Mac) anywhere on the canvas
3. The workflow will be pasted and ready to configure

### Workflow JSON

\`\`\`json
{
  // Complete workflow JSON here
}
\`\`\`

### Configuration Required
- List any credentials that need to be set up
- List any parameters that need user values
```

---

## Node Reference

### Webhook Trigger
```json
{
  "parameters": {
    "path": "webhook-path",
    "responseMode": "onReceived",
    "options": {}
  },
  "id": "uuid",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [250, 300],
  "webhookId": "uuid"
}
```

### Schedule Trigger (Cron)
```json
{
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "cronExpression",
          "expression": "0 9 * * *"
        }
      ]
    }
  },
  "id": "uuid",
  "name": "Schedule Trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [250, 300]
}
```

### HTTP Request
```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.example.com/data",
    "options": {}
  },
  "id": "uuid",
  "name": "HTTP Request",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [500, 300]
}
```

### Slack Message
```json
{
  "parameters": {
    "channel": "#general",
    "text": "={{ $json.message }}",
    "otherOptions": {}
  },
  "id": "uuid",
  "name": "Slack",
  "type": "n8n-nodes-base.slack",
  "typeVersion": 2.2,
  "position": [750, 300],
  "credentials": {
    "slackApi": {
      "id": "credential-id",
      "name": "Slack account"
    }
  }
}
```

### Set Node (Data Transform)
```json
{
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {
          "id": "uuid",
          "name": "fieldName",
          "value": "={{ $json.sourceField }}",
          "type": "string"
        }
      ]
    },
    "options": {}
  },
  "id": "uuid",
  "name": "Set",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [500, 300]
}
```

### IF Condition
```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "uuid",
          "leftValue": "={{ $json.status }}",
          "rightValue": "success",
          "operator": {
            "type": "string",
            "operation": "equals"
          }
        }
      ],
      "combinator": "and"
    },
    "options": {}
  },
  "id": "uuid",
  "name": "IF",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "position": [500, 300]
}
```

### Code Node
```json
{
  "parameters": {
    "jsCode": "// Process each item\nfor (const item of $input.all()) {\n  item.json.processed = true;\n}\n\nreturn $input.all();"
  },
  "id": "uuid",
  "name": "Code",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [500, 300]
}
```

### Google Sheets (Append)
```json
{
  "parameters": {
    "operation": "append",
    "documentId": {
      "__rl": true,
      "value": "spreadsheet-id",
      "mode": "list"
    },
    "sheetName": {
      "__rl": true,
      "value": "Sheet1",
      "mode": "list"
    },
    "columns": {
      "mappingMode": "autoMapInputData",
      "value": {}
    },
    "options": {}
  },
  "id": "uuid",
  "name": "Google Sheets",
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4.5,
  "position": [750, 300],
  "credentials": {
    "googleSheetsOAuth2Api": {
      "id": "credential-id",
      "name": "Google Sheets account"
    }
  }
}
```

---

## Connection Patterns

### Linear Flow (A → B → C)
```json
{
  "connections": {
    "Node A": {
      "main": [[{ "node": "Node B", "type": "main", "index": 0 }]]
    },
    "Node B": {
      "main": [[{ "node": "Node C", "type": "main", "index": 0 }]]
    }
  }
}
```

### Branching (IF node with true/false paths)
```json
{
  "connections": {
    "IF": {
      "main": [
        [{ "node": "True Branch", "type": "main", "index": 0 }],
        [{ "node": "False Branch", "type": "main", "index": 0 }]
      ]
    }
  }
}
```

### Merge (Multiple inputs to one node)
```json
{
  "connections": {
    "Branch A": {
      "main": [[{ "node": "Merge", "type": "main", "index": 0 }]]
    },
    "Branch B": {
      "main": [[{ "node": "Merge", "type": "main", "index": 1 }]]
    }
  }
}
```

---

## UUID Generation

Generate UUIDs in this format for node IDs and other identifiers:
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Use unique, sequential-looking UUIDs for readability:
- First node: `00000000-0000-0000-0000-000000000001`
- Second node: `00000000-0000-0000-0000-000000000002`
- etc.

---

## Error Handling

If the user's request is unclear:
1. Ask clarifying questions about the workflow requirements
2. Suggest the most likely interpretation
3. Offer to generate multiple variations

If a requested integration isn't supported:
1. Note that the node may require a community package
2. Suggest the HTTP Request node as an alternative
3. Provide the generic HTTP-based approach

---

## Output Checklist

Before outputting the workflow JSON, verify:

- [ ] All node IDs are unique UUIDs
- [ ] All node names are unique and descriptive
- [ ] Connections reference correct node names (exact match)
- [ ] Positions don't overlap (minimum 200px apart)
- [ ] Trigger node is present (webhook, cron, or manual)
- [ ] JSON is valid and properly formatted
- [ ] Credentials placeholders are marked for user configuration
