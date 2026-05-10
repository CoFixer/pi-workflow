---
description: Generate a Standard Operating Procedure and create it in Notion
argument-hint: SOP topic (e.g., "How to onboard a new developer")
---

# Generate SOP Command

Generate a readable, step-by-step Standard Operating Procedure (SOP) document and create it in the Team SOP Notion database.

> **⚠️ CRITICAL WARNING**:
> - **NEVER skip Step 2 (Ask for Property Values)**
> - You MUST ask the user for Category, Type, Language, and Writer BEFORE creating the SOP
> - If you skip this step, the Notion page will be created without proper properties

## Usage

```
/generate-sop [SOP topic]
```

## Target Database

- **Database**: Team SOP
- **Database ID**: `15ab6d88-d2cf-8066-b853-d7587b375e2a`

---

## Workflow

### Step 1: Validate Input

Check that an SOP topic is provided in `$ARGUMENTS`.

**If missing**, output error and stop:
```
Error: SOP topic is required.
Usage: /generate-sop How to deploy to production
```

---

### Step 2: Ask for Property Values

Before creating the SOP, ask the user for the following property values using AskUserQuestion:

#### 2.1 Category
Ask user to select one:
- HR
- Client
- Sales
- Backend
- Fullstack
- Team Leader
- Onboarding Probation
- Onboarding
- All
- PM
- Design
- Mobile
- Self QA Check List
- Before Onboarding
- Routine Task
- Client Communication
- Quality Check / Review
- Offboarding / Closure
- Monitoring & Reporting
- Planning

#### 2.2 Type
Ask user to select one:
- Before Onboarding
- Onboarding
- Routine Task
- Client Communication
- Quality Check / Review
- Offboarding / Closure
- Monitoring & Reporting
- Planning
- Essential Knowledge
- Maintain

#### 2.3 Language
Ask user to select one:
- English
- Korean

#### 2.4 Writer
Ask user: "Who is the writer of this SOP?"

Then search the People database to find the person:
```
Use mcp__notionApi__API-post-search with query=[writer name] and filter for data_source
```

Store the person's page ID for later use in the Writer relation property.

---

### Step 3: Generate SOP Draft

Generate a clear, readable SOP based on the topic. Follow this structure:

```markdown
# [SOP Title]

## Task Description
[1-2 sentences explaining what this SOP is about and its purpose]

## Video Description

## Step By Step Instructions

### Step 1: [Action Title]
[Clear description of what to do]

### Step 2: [Action Title]
[Clear description of what to do]

### Step 3: [Action Title]
[Clear description of what to do]

[Continue with as many steps as needed...]

## Check List
- [ ] [First verification item]
- [ ] [Second verification item]
- [ ] [Third verification item]
[Add as many checklist items as needed]

## Training

## Example
[Provide a real-world example of this task being completed, or write "N/A" if not applicable]

## Other Important Links & Information
- [Related documentation or resources]
- [Or write "N/A" if none]

## Picture

## Definition of Done
[Clear criteria to know the task is complete. Example:]
- [Criterion 1]
- [Criterion 2]

## What To Do When Done
[Next steps after completing this SOP. Example:]
- [Notify someone]
- [Update a document]
- [Or write "N/A" if none]
```

**SOP Writing Guidelines**:

**Sections to WRITE** (7 sections):
1. Task Description - Purpose of the SOP
2. Step By Step Instructions - Detailed numbered steps
3. Check List - Verification checkboxes
4. Example - Real-world example if applicable
5. Other Important Links & Information - Related resources
6. Definition of Done - Completion criteria
7. What To Do When Done - Next steps

**Sections to SKIP** (3 sections - leave placeholder for user):
1. Video Description - User adds video link
2. Training - User adds training materials
3. Picture - User adds screenshots

**General Writing Rules**:
1. Use clear, simple language
2. Each step should be one action
3. Use numbered steps for sequential actions
4. Use bullet points for non-sequential items
5. Include specific details (file paths, URLs, command examples)
6. Write for someone who has never done this before

---

### Step 4: User Review

Display the generated SOP draft to the user:

```
## Generated SOP Draft

[Show the full SOP content here]

---

Please review the SOP above. Would you like to:
1. Approve and create in Notion
2. Request changes (please describe what to change)
```

If the user requests changes:
- Update the SOP based on feedback
- Show the updated draft again
- Repeat until user approves

---

### Step 5: Create Notion Page

Once approved, create the page in Notion:

#### 5.1 Create the Page

Use `mcp__notionApi__API-post-page` to create the page:

```json
{
  "parent": {
    "database_id": "15ab6d88-d2cf-8066-b853-d7587b375e2a"
  },
  "properties": {
    "title": [
      {
        "text": {
          "content": "[SOP Title]"
        }
      }
    ]
  }
}
```

Note: The Notion MCP `API-post-page` has limited property support. After creating the page, we'll update properties separately if needed.

#### 5.2 Add Content Blocks

Use `mcp__notionApi__API-patch-block-children` to add the SOP content as blocks:

- Use `paragraph` blocks for regular text
- Use `bulleted_list_item` blocks for bullet points

Example for adding content:
```json
{
  "block_id": "[page_id]",
  "children": [
    {
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Overview: [overview text]"
            }
          }
        ]
      }
    },
    {
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Step 1: [step description]"
            }
          }
        ]
      }
    }
  ]
}
```

**Important**: Break up long content into multiple paragraphs. Each block should be readable.

---

### Step 6: Return Result

After successful creation, display:

```
## SOP Created Successfully

**Title**: [SOP Title]
**Category**: [Selected Category]
**Type**: [Selected Type]
**Language**: [Selected Language]
**Writer**: [Writer Name]
**Status**: Writing

**Notion Page**: [Page URL]

The SOP has been created in the Team SOP database. You can view and edit it in Notion.
```

---

## Error Handling

### No Topic Provided
```
Error: SOP topic is required.
Usage: /generate-sop How to deploy to production
```

### Writer Not Found
```
Warning: Could not find "[name]" in the People database.
The SOP will be created without a Writer assigned. You can add the Writer manually in Notion.
```

### Notion API Error
```
Error: Failed to create SOP in Notion.
Error details: [error message]

Please try again or create the SOP manually in Notion.
```

---

## Examples

### Example 1: Basic Usage
```
/generate-sop How to set up local development environment
```

### Example 2: Specific Process
```
/generate-sop Weekly client status report process
```

### Example 3: Onboarding Task
```
/generate-sop New developer first day checklist
```

---

## Property Reference

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| Name | title | Yes | SOP title |
| Category | select | Yes | Team/area category |
| Type | select | Yes | SOP type/purpose |
| Status | select | Auto | Set to "Writing" |
| Language | select | Yes | English or Korean |
| Writer | relation | Yes | Person who wrote the SOP |
| Reviewer | relation | No | Not set by this command |
| Parent item | relation | No | Not set by this command |

---

## Known Issues & Solutions

### Issue: MCP Tool Object Parameter Error

**Problem**: The `mcp__notionApi__API-post-page` tool fails with `validation_error` when passing object parameters like `parent`.

**Error Message**:
```
body failed validation: body.parent should be an object or `undefined`, instead was `"{\"database_id\": ...`
```

**Root Cause**: The MCP tool incorrectly parses JSON object parameters as strings.

**Solution**: Use `curl` with the `$NOTION_API_KEY` environment variable instead.

---

### Issue: Markdown Tables Not Rendering

**Problem**: When you write markdown tables in SOP content like:
```
| Component | Description |
|-----------|-------------|
| Command   | Recipe      |
```

They appear as plain text in Notion, not as actual tables.

**Root Cause**: Notion API does not parse markdown tables. You must use the `table` block type with nested `table_row` children.

**Solution**: See "4. Add Table Block" section below for the correct JSON structure.

---

### Working curl Examples

#### 1. Create a Page in Database

```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "15ab6d88-d2cf-8066-b853-d7587b375e2a"},
    "properties": {
      "Name": {
        "title": [{"text": {"content": "YOUR SOP TITLE HERE"}}]
      }
    }
  }'
```

#### 2. Update Page Properties (Category, Type, Language, Writer)

```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/[PAGE_ID]" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "properties": {
      "Category": {
        "select": {"name": "All"}
      },
      "Type": {
        "select": {"name": "Essential Knowledge"}
      },
      "Language": {
        "select": {"name": "English"}
      },
      "Writer": {
        "relation": [{"id": "WRITER_PEOPLE_PAGE_ID"}]
      }
    }
  }'
```

#### 3. Add Content Blocks to Page

```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/[PAGE_ID]/children" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {
        "object": "block",
        "type": "heading_2",
        "heading_2": {
          "rich_text": [{"type": "text", "text": {"content": "Section Title"}}]
        }
      },
      {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
          "rich_text": [{"type": "text", "text": {"content": "Paragraph content here"}}]
        }
      },
      {
        "object": "block",
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [{"type": "text", "text": {"content": "Bullet point item"}}]
        }
      }
    ]
  }'
```

#### 4. Add Table Block (IMPORTANT!)

**Issue**: Markdown tables (`| Col1 | Col2 |`) do NOT render as tables in Notion. They become plain text.

**Solution**: Use `table` block type with `table_row` children.

```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/[PAGE_ID]/children" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {
        "object": "block",
        "type": "table",
        "table": {
          "table_width": 3,
          "has_column_header": true,
          "has_row_header": false,
          "children": [
            {
              "object": "block",
              "type": "table_row",
              "table_row": {
                "cells": [
                  [{"type": "text", "text": {"content": "Header 1"}}],
                  [{"type": "text", "text": {"content": "Header 2"}}],
                  [{"type": "text", "text": {"content": "Header 3"}}]
                ]
              }
            },
            {
              "object": "block",
              "type": "table_row",
              "table_row": {
                "cells": [
                  [{"type": "text", "text": {"content": "Row 1 Col 1"}}],
                  [{"type": "text", "text": {"content": "Row 1 Col 2"}}],
                  [{"type": "text", "text": {"content": "Row 1 Col 3"}}]
                ]
              }
            }
          ]
        }
      }
    ]
  }'
```

**Key Points**:
- `table_width`: Number of columns (must match cells count in each row)
- `has_column_header`: First row becomes header (different styling)
- `children`: Array of `table_row` blocks, each with `cells` array
- Each `cells` is array of arrays (one array per column with rich_text objects)

---

## Common People Database IDs (for Writer relation)

Search for the person using:
```bash
curl -s -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"query": "PERSON_NAME", "page_size": 5}'
```

Look for results where `parent.database_id` = `1c2b6d88-d2cf-804b-92fd-f8d446a8f239` (Team/People database).

---

## Checklist Before Creating SOP

- [ ] Step 1: Topic provided?
- [ ] Step 2: Asked user for Category? (DO NOT SKIP!)
- [ ] Step 2: Asked user for Type? (DO NOT SKIP!)
- [ ] Step 2: Asked user for Language? (DO NOT SKIP!)
- [ ] Step 2: Asked user for Writer? (DO NOT SKIP!)
- [ ] Step 3: Generated SOP draft?
- [ ] Step 4: User approved the draft?
- [ ] Step 5: Created page AND updated all properties?
- [ ] Step 6: Showed success message with URL?
