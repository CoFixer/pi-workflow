# Incremental Update Workflow

## Overview

This prompt guides the interactive, section-by-section update process for project documentation. Used when the user wants more control over what gets updated.

---

## Workflow Steps

### Step 1: Compare Documents

For each document (PROJECT_KNOWLEDGE, PROJECT_DATABASE, PROJECT_API):

1. Read existing document content
2. Generate new content from PRD
3. Identify sections that would change

### Step 2: Present Changes Per Section

For each section with changes, use this format:

```markdown
## Section: {SECTION_NAME}

### Current Content:
{existing_content}

### Proposed Update:
{new_content_from_prd}

### Changes Summary:
- Added: {list of additions}
- Modified: {list of modifications}
- Removed: {list of removals}

---
Update this section?
```

Then use AskUserQuestion:

```yaml
question: "Update the {SECTION_NAME} section?"
options:
  - label: "Yes - Apply update"
    description: "Replace current content with proposed update"
  - label: "No - Keep current"
    description: "Skip this section, keep existing content"
  - label: "Merge - Combine both"
    description: "Merge new content with existing, keeping manual additions"
```

### Step 3: Handle Each Response

**If "Yes"**:
- Replace section content with proposed update
- Log change in update summary

**If "No"**:
- Keep existing content unchanged
- Note as "skipped" in update summary

**If "Merge"**:
- Attempt intelligent merge:
  - Keep existing manual additions
  - Add new items from PRD
  - Update modified items
- Present merged result for confirmation

### Step 4: Process Order

Update documents in this order:

1. **PROJECT_KNOWLEDGE.md**
   - Overview
   - Tech Stack
   - User Roles
   - Core Features
   - Page Breakdown
   - Enums

2. **PROJECT_DATABASE.md**
   - Entity Overview
   - ER Diagram
   - Entity Specifications (each entity)
   - Enum Definitions
   - Indexes

3. **PROJECT_API.md**
   - Authentication
   - Common Headers
   - Response Format
   - Endpoints (each module)
   - Admin Endpoints
   - Enum Reference

4. **claude.md** (Project Root)
   - Overview
   - Tech Stack
   - Project Structure
   - Key Documentation
   - User Roles
   - Core Enums
   - Development Conventions
   - Available Commands
   - MCP Servers
   - Design System
   - API Base URLs
   - Quick Reference

**Note**: claude.md is processed last as it aggregates from other docs.

---

## Section Identification Rules

### Detecting Sections

Sections are identified by:
- Level 2 headings (##)
- Level 3 headings (###) for subsections

### Section Boundaries

A section includes:
- The heading line
- All content until the next same-level or higher heading
- Nested subsections are included in parent section

### Example

```markdown
## Core Features          ← Section start

### Phase 1               ← Included in "Core Features"
- Feature 1
- Feature 2

### Phase 2               ← Included in "Core Features"
- Feature 3

## Page Breakdown         ← New section starts
```

---

## Merge Strategies

### For Lists

```yaml
strategy: union
- Keep all existing items
- Add new items from PRD
- Mark duplicates
```

### For Tables

```yaml
strategy: row_merge
- Match rows by key column (usually first column)
- Update matched rows with new values
- Add new rows
- Keep unmatched existing rows (with [custom] marker)
```

### For Descriptions

```yaml
strategy: prefer_new
- Use new description from PRD
- If existing has significant additions, ask user
```

### For Code Blocks

```yaml
strategy: replace
- Code blocks are replaced entirely
- Show diff to user before replacing
```

### For claude.md Sections

```yaml
# Overview, Tech Stack, API Base URLs
strategy: prefer_new
- Use values from generated docs
- PRD metadata takes precedence

# Project Structure
strategy: filesystem_scan
- Always regenerate from actual folder structure
- Ignore existing content

# Key Documentation, Memory Files
strategy: validate_paths
- Keep hardcoded paths
- Only update if files exist/don't exist
- Remove links to missing files

# User Roles, Core Enums
strategy: sync_from_docs
- Extract from PROJECT_KNOWLEDGE.md / PROJECT_DATABASE.md
- Replace entirely with source doc values

# Development Conventions
strategy: preserve_custom
- Keep existing conventions unless PRD specifies
- Only add new conventions from PRD

# Available Commands
strategy: scan_and_merge
- Scan .pi/commands/ for actual commands
- Keep custom commands added manually

# MCP Servers
strategy: config_scan
- Read from .mcp.json or config files
- Replace with detected servers

# Design System, Quick Reference
strategy: selective_merge
- Update colors/values from PRD
- Keep custom additions marked with [custom]
```

---

## Progress Tracking

Maintain progress state:

```yaml
update_progress:
  document: "PROJECT_KNOWLEDGE.md"
  total_sections: 6
  current_section: 3
  completed_sections:
    - name: "Overview"
      action: "updated"
    - name: "Tech Stack"
      action: "skipped"
  pending_sections:
    - "Core Features"
    - "Page Breakdown"
    - "Enums"
```

Display progress to user:

```
Progress: [████░░░░░░] 3/6 sections

✓ Overview - Updated
✓ Tech Stack - Skipped (no changes)
→ User Roles - Current section
○ Core Features
○ Page Breakdown
○ Enums
```

---

## Conflict Resolution

### When conflicts detected

If PRD content conflicts with existing content:

```yaml
question: "Conflict detected in {SECTION_NAME}"
details: |
  PRD says: {prd_value}
  Existing doc says: {existing_value}
options:
  - label: "Use PRD value"
    description: "Replace with value from PRD"
  - label: "Keep existing"
    description: "Preserve current documented value"
  - label: "Custom value"
    description: "Enter a different value manually"
```

### Common Conflicts

1. **Different entity names**: Ask which is canonical
2. **Missing fields**: Ask if intentionally removed
3. **Changed types**: Confirm migration is planned
4. **Role changes**: Verify permission model

---

## Summary Report

After all sections processed, generate summary:

```markdown
## Update Summary

**Document**: PROJECT_KNOWLEDGE.md
**Date**: {timestamp}

### Sections Updated (3)
- Overview: Added project version, updated description
- Core Features: Added 5 new features for Phase 2
- Enums: Added CategoryEnum values

### Sections Skipped (2)
- Tech Stack: No changes detected
- Page Breakdown: User chose to keep existing

### Sections Merged (1)
- User Roles: Merged new Admin permissions with existing

### Warnings
- Entity "Report" in PRD not found in DATABASE doc
- API endpoint POST /ideas missing in API doc

### claude.md Status
- ✓ Generated from updated docs
- Links validated: 8/8 exist
- Line count: 185 (under 250 limit)

### Next Steps
- [ ] Review merged sections for accuracy
- [ ] Add missing Report entity to DATABASE
- [ ] Document POST /ideas endpoint
- [ ] Verify claude.md links work correctly
```

---

## Error Handling

### If document doesn't exist

```yaml
question: "{DOCUMENT} doesn't exist. Create it?"
options:
  - label: "Yes - Generate from PRD"
    description: "Create new document from PRD content"
  - label: "No - Skip this document"
    description: "Continue to next document"
```

### If section is new

```yaml
question: "New section '{SECTION}' found in PRD. Add it?"
options:
  - label: "Yes - Add section"
    description: "Add new section to document"
  - label: "No - Skip"
    description: "Don't add this section"
```

### If section was removed from PRD

```yaml
question: "Section '{SECTION}' not in PRD. Keep it?"
options:
  - label: "Keep - It's custom content"
    description: "Preserve this section"
  - label: "Remove - It's outdated"
    description: "Delete this section"
```
