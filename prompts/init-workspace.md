---
description: Initialize .project folder with documentation templates
argument-hint: Optional project name (will auto-detect if not provided)
---

You are a project documentation initialization assistant. Your task is to create the `.project/` folder structure with all necessary templates for project tracking.

## Step 0: Check Prerequisites

### Check for existing .project folder

```bash
ls -la .project 2>/dev/null
```

If `.project/` already exists, use **AskUserQuestion** to ask:

**Options:**
1. **Skip** - Keep existing folder, don't overwrite
2. **Merge** - Add missing files only, don't overwrite existing
3. **Overwrite** - Remove existing and create fresh

Store the choice as `$OVERWRITE_MODE`.

### Verify templates exist

```bash
ls .pi/base/templates/claude-project/
```

If templates don't exist, report error and stop:
```
Error: Template directory not found at .pi/base/templates/claude-project/
Please ensure the claude-base submodule is properly initialized.
```

## Step 1: Auto-detect Project Information

### Get Project Name

If `$ARGUMENTS` is provided, use it as the project name.

Otherwise, auto-detect from git remote:
```bash
git remote get-url origin 2>/dev/null | sed 's/.*\/\([^\/]*\)\.git$/\1/' | sed 's/.*\/\([^\/]*\)$/\1/'
```

If git remote fails, use folder name:
```bash
basename "$PWD"
```

Store as `$PROJECT_NAME` (lowercase, hyphenated).

### Detect Tech Stack

Check for backend framework:
```bash
# Check for NestJS
grep -q '"@nestjs/core"' backend/package.json 2>/dev/null && echo "nestjs"

```

Store as `$BACKEND` = "NestJS" | "Unknown"

Check for frontend frameworks:
```bash
# Check for React in frontend/
grep -q '"react"' frontend/package.json 2>/dev/null && echo "react"

# Check for React Native
grep -q '"react-native"' mobile/package.json 2>/dev/null && echo "react-native"

# Check for dashboard
ls frontend-dashboard/package.json 2>/dev/null && echo "dashboard"
```

Store as `$FRONTENDS` = array of detected frameworks
Store as `$HAS_DASHBOARD` = true | false

## Step 2: Confirm Project Details

Use **AskUserQuestion** to confirm detected values:

**Project Name:** `$PROJECT_NAME`
- Confirm or provide different name

**Tech Stack:**
- Backend: `$BACKEND`
- Frontend(s): `$FRONTENDS`

Only prompt if auto-detection failed or user wants to change values.

## Step 3: Create Directory Structure

Based on `$OVERWRITE_MODE`:
- **Skip**: Exit with message "Keeping existing .project/ folder"
- **Overwrite**: `rm -rf .project`
- **Merge**: Continue (will skip existing files)

Create the folder structure:

```bash
# Create main directories
mkdir -p .project/docs
mkdir -p .project/memory
mkdir -p .project/status/backend
mkdir -p .project/status/frontend
mkdir -p .project/status/temp
mkdir -p .project/prd
mkdir -p .project/secrets
```

If `$HAS_DASHBOARD` is true:
```bash
mkdir -p .project/status/dashboard
```

Create .gitkeep files:
```bash
touch .project/status/temp/.gitkeep
touch .project/prd/.gitkeep
touch .project/secrets/.gitkeep
```

## Step 4: Process and Copy Templates

For each template file in `.pi/base/templates/claude-project/`:

1. Read the template content
2. Replace placeholders:
   - `$PROJECT_NAME` → actual project name
   - `$BACKEND` → detected backend framework
   - `$FRONTENDS` → comma-separated list of frontend frameworks
3. Write to `.project/` with `.template` removed from filename

### Template Mapping

| Template | Destination |
|----------|-------------|
| `docs/PROJECT_API.template.md` | `.project/docs/PROJECT_API.md` |
| `docs/PROJECT_DATABASE.template.md` | `.project/docs/PROJECT_DATABASE.md` |
| `docs/PROJECT_KNOWLEDGE.template.md` | `.project/docs/PROJECT_KNOWLEDGE.md` |
| `docs/PROJECT_API_INTEGRATION.template.md` | `.project/docs/PROJECT_API_INTEGRATION.md` |
| `docs/FRONTEND_AUTH_FLOW.template.md` | `.project/docs/FRONTEND_AUTH_FLOW.md` |
| `memory/DECISIONS.template.md` | `.project/memory/DECISIONS.md` |
| `memory/LEARNINGS.template.md` | `.project/memory/LEARNINGS.md` |
| `memory/PREFERENCES.template.md` | `.project/memory/PREFERENCES.md` |
| `status/backend/API_IMPLEMENTATION_STATUS.template.md` | `.project/status/backend/API_IMPLEMENTATION_STATUS.md` |
| `status/frontend/SCREEN_IMPLEMENTATION_STATUS.template.md` | `.project/status/frontend/SCREEN_IMPLEMENTATION_STATUS.md` |
| `status/frontend/API_INTEGRATION_STATUS.template.md` | `.project/status/frontend/API_INTEGRATION_STATUS.md` |

If `$HAS_DASHBOARD` is true, also copy:
| `status/frontend-dashboard/SCREEN_IMPLEMENTATION_STATUS.template.md` | `.project/status/dashboard/SCREEN_IMPLEMENTATION_STATUS.md` |
| `status/frontend-dashboard/API_INTEGRATION_STATUS.template.md` | `.project/status/dashboard/API_INTEGRATION_STATUS.md` |

**For merge mode**: Skip files that already exist.

## Step 5: Update .gitignore

Check if `.gitignore` contains `.project` entries:

```bash
grep -q "claude-project/secrets" .gitignore 2>/dev/null
```

If not present, append to `.gitignore`:

```
# Claude Code project documentation
.project/secrets/*
!.project/secrets/.gitkeep
.project/status/temp/*
!.project/status/temp/.gitkeep
```

## Step 6: Report Results

```
Created .project/ folder structure

Project: $PROJECT_NAME
Tech Stack:
  - Backend: $BACKEND
  - Frontend: $FRONTENDS

Created directories:
  - .project/docs/         (API, Database, Knowledge docs)
  - .project/memory/       (Decisions, Learnings, Preferences)
  - .project/status/        (Implementation status tracking)
  - .project/prd/          (Product requirements)
  - .project/secrets/      (Sensitive config - gitignored)

Files created:
  - docs/PROJECT_API.md
  - docs/PROJECT_DATABASE.md
  - docs/PROJECT_KNOWLEDGE.md
  - docs/PROJECT_API_INTEGRATION.md
  - memory/DECISIONS.md
  - memory/LEARNINGS.md
  - memory/PREFERENCES.md
  - plans/backend/API_IMPLEMENTATION_STATUS.md
  - plans/frontend/SCREEN_IMPLEMENTATION_STATUS.md
  - plans/frontend/API_INTEGRATION_STATUS.md
  [+ dashboard files if applicable]

Next steps:
1. Edit .project/docs/PROJECT_KNOWLEDGE.md with project overview
2. Review and customize .project/memory/PREFERENCES.md
3. Update implementation status files as you build features
```

## Error Handling

- If template directory not found: Report error with setup instructions
- If permission denied: Report error with permission fix suggestion
- If git operations fail: Continue with folder name detection
- If user cancels: Exit gracefully with partial work summary
