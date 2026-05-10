---
description: Generate daily work notes from git commits and Notion tasks
argument-hint: [git|notion] (optional - defaults to both)
---

# Daily Note Generator

Generate a concise numbered list of today's work items by pulling from git commits and Notion tasks.

---

## Source Routing

**Argument received:** `$ARGUMENTS`

**Determine source mode based on the argument above:**
- Argument is `git` → **GIT-ONLY mode**: Execute ONLY Step 3, then Step 6. Skip Steps 1, 2, 4, 5 entirely. Do NOT read .env or ask about Notion credentials.
- Argument is `notion` → **NOTION-ONLY mode**: Execute Steps 1, 2, 4, then Step 6. Skip Steps 3 and 5.
- Argument is empty or anything else → **BOTH mode**: Execute all Steps 1–6.

**IMPORTANT:** Follow the mode strictly. If GIT-ONLY mode, do NOT execute any Notion-related steps or ask for Notion keys.

---

## Step 1: Load Environment (NOTION-ONLY or BOTH mode — skip entirely in GIT-ONLY mode)

> **IMPORTANT**: Use the **Read tool** to read the `.env` file from the **project root directory**.
> Do NOT use bash commands (like `grep`, `cat`, or `source`) to access `.env` files — they are blocked by the bash validation hook.
> The root `.env` is located at the project root (same level as `backend/` and `frontend/`), NOT inside `backend/.env` or `frontend/.env`.

1. Use the Read tool to open the file `.env` in the project root directory
2. Parse the file contents line by line:
   - Skip lines starting with `#` (comments) and empty lines
   - Extract `NOTION_API_KEY` — the value after `NOTION_API_KEY=`
   - Extract `NOTION_DATABASE_ID` — the value after `NOTION_DATABASE_ID=`
   - Extract `NOTION_PROJECT_ID` — the value after `NOTION_PROJECT_ID=`
   - If a key exists but the value is empty (e.g., `NOTION_API_KEY=`), treat it as **not set**
3. If the `.env` file does not exist, treat all three values as not set

### If Notion source is needed, ALL THREE Notion credentials are required: `NOTION_API_KEY`, `NOTION_DATABASE_ID`, and `NOTION_PROJECT_ID`.

> **CRITICAL**: If in BOTH mode, do NOT silently skip or fall back to git-only mode without asking the user first. You MUST prompt the user for missing keys before proceeding. However, if in GIT-ONLY mode, this entire step is skipped — do NOT ask for any Notion credentials.

**Check all three keys in `.env`, then ask for all missing ones in a single popup:**

1. Check which of the three keys have non-empty values in `.env`
2. If **all three** are present → proceed directly to Step 2
3. If **any** keys are missing → use `AskUserQuestion` with **one question per missing key** in a **single call** (all missing keys appear in one popup). Only include questions for keys that are actually missing.

**AskUserQuestion format** — for each missing key, add a question:

| Missing Key | Question | Header | Options |
|---|---|---|---|
| `NOTION_API_KEY` | "NOTION_API_KEY is not set in .env. Paste your key using 'Other':" | "API Key" | Option 1: `label: "Skip Notion"`, `description: "Don't fetch Notion tasks, use git commits only"` / Option 2: `label: "Add to .env later"`, `description: "Skip for now, I'll configure .env later"` |
| `NOTION_DATABASE_ID` | "NOTION_DATABASE_ID is not set in .env. Paste your database ID using 'Other':" | "Database ID" | Same 2 options as above |
| `NOTION_PROJECT_ID` | "NOTION_PROJECT_ID is not set in .env. Paste your project ID using 'Other':" | "Project ID" | Same 2 options as above |

**After the user responds:**
- If the user typed a value via "Other" for a key → use that value
- If the user selected "Skip Notion" or "Add to .env later" for **any** key → fall back to git-only mode, skip Steps 2–4, and append:
  ```
  Note: Notion credentials not provided. Showing git commits only.
  ```
- If the user provided **all** missing keys → proceed to Step 2

---

## Step 2: Determine Project Filter (NOTION-ONLY or BOTH mode — skip entirely in GIT-ONLY mode)

Determine how to filter Notion tickets to this project only:

1. **Primary (recommended):** Use `NOTION_PROJECT_ID` obtained from Step 1 (either from `.env` or provided by user)
   - If available → use it in Step 4 to filter by the `Project` relation property (most accurate, uses unique Notion page ID)
2. **Fallback** (only if `NOTION_PROJECT_ID` was not provided despite being asked):
   - Derive the project name from the working directory folder name:
     - Get the last segment of the path (e.g., `activitycoaching`)
     - Split on camelCase boundaries and common separators (hyphens, underscores)
     - Capitalize each word and join with spaces
     - Example: `activitycoaching` → `Activity Coaching`, `my-project` → `My Project`
   - Use this name in Step 4 to filter by `App / Dashboard` multi_select (less accurate — multiple projects may share the same tag)

---

## Step 3: Collect Git Commits (GIT-ONLY or BOTH mode — skip entirely in NOTION-ONLY mode)

Run this command to get today's commits by the current git user:

```bash
git log --oneline --after="$(date +%Y-%m-%dT00:00:00)" --before="$(date +%Y-%m-%dT23:59:59)" --author="$(git config user.name)" --pretty=format:"%s"
```

Parse each commit message:
- Strip conventional commit prefixes (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, etc.)
- Strip scope like `(frontend)`, `(backend)`, etc.
- Capitalize the first letter of the remaining text
- Trim whitespace

Store as a list of cleaned task descriptions.

---

## Step 4: Collect Notion Tasks (NOTION-ONLY or BOTH mode — skip entirely in GIT-ONLY mode)

Query the Notion database for tasks that match ALL of:
- **Project**: filtered by Project relation ID or App / Dashboard (from Step 2)
- **Status**: "Ready for Test"
- **Last edited**: Today

Replace `<DATABASE_ID>`, `<NOTION_API_KEY>`, and `<TODAY_START_ISO>` (today's date in `YYYY-MM-DDT00:00:00Z` format).

### If `NOTION_PROJECT_ID` is set (primary — filter by Project relation):

Replace `<PROJECT_ID>` with the value from `.env`.

```bash
curl -s -X POST "https://api.notion.com/v1/databases/<DATABASE_ID>/query" \
  -H "Authorization: Bearer <NOTION_API_KEY>" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {
          "property": "Project",
          "relation": {
            "contains": "<PROJECT_ID>"
          }
        },
        {
          "property": "Status",
          "status": {
            "equals": "Ready for Test"
          }
        },
        {
          "timestamp": "last_edited_time",
          "last_edited_time": {
            "on_or_after": "<TODAY_START_ISO>"
          }
        }
      ]
    }
  }'
```

### Fallback — if `NOTION_PROJECT_ID` is not set (filter by App / Dashboard):

Replace `<PROJECT_NAME>` with the folder-derived name from Step 2.

```bash
curl -s -X POST "https://api.notion.com/v1/databases/<DATABASE_ID>/query" \
  -H "Authorization: Bearer <NOTION_API_KEY>" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "and": [
        {
          "property": "App / Dashboard",
          "multi_select": {
            "contains": "<PROJECT_NAME>"
          }
        },
        {
          "property": "Status",
          "status": {
            "equals": "Ready for Test"
          }
        },
        {
          "timestamp": "last_edited_time",
          "last_edited_time": {
            "on_or_after": "<TODAY_START_ISO>"
          }
        }
      ]
    }
  }'
```

Extract the task title from each result's `properties.Name.title[0].plain_text` (or the first title-type property found).

---

## Step 5: Deduplicate (BOTH mode only — skip in GIT-ONLY and NOTION-ONLY modes)

Combine tasks from both sources into a single list. Remove duplicates by:
1. Normalize each task: lowercase, trim whitespace, remove punctuation
2. Use fuzzy matching — if two task descriptions share 70%+ similarity (e.g., "finish auth module" and "feat(backend): finish auth module"), keep only one
3. Prefer the Notion task title (cleaner) over the git commit message when deduplicating

---

## Step 6: Output (ALL modes)

Output a plain numbered list:

```
1. Setup activity coaching project
2. Design login page
3. Finish auth module
```

If no tasks found from either source, output:
```
No work items found for today.
```

If one source had no results, mention it briefly:
```
Note: No git commits found for today. Showing Notion tasks only.
```
or
```
Note: No Notion tasks found for today. Showing git commits only.
```

---

## Error Handling

**.env file not found:**
Treat as if no Notion credentials are configured. Fall back to git-only if Notion was requested.

**Git not available:**
```
Error: Not a git repository or git is not installed.
```

**Notion API authentication error (401/403):**
Fall back to git-only results and append:
```
Note: Notion API key is invalid or expired. Showing git commits only.
```

**Notion API fails (network/5xx):**
Fall back to git-only results and append:
```
Note: Notion API request failed. Showing git commits only.
```

**No matching project tickets found:**
If the Notion query returns no results, append:
```

Note: No Notion tasks found matching the project filter. Showing git commits only.
```
