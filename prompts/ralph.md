---
description: Run autonomous workflow loops (design-qa, e2e-tests, backend-qa, api-docs, gap-finder, fix-gaps, rule-check) — supports parallel execution
argument-hint: "<workflow> <project> [--incremental] [--category <name>] [--dry-run] [--list]"
---

# Ralph Workflow Launcher

Run autonomous, iterative tasks using the Ralph Wiggum plugin. This command launches a continuous feedback loop that processes items until completion.

## Prerequisites

Install the Ralph Wiggum plugin:
```bash
/plugin marketplace add anthropics/claude-code
/plugin install ralph-wiggum@claude-plugins-official
```

## Usage

```bash
/ralph <workflow> <project> [options]
/ralph <workflow1>+<workflow2> <project> [options]   # parallel execution
```

### Available Workflows

| Workflow | Stack | Skill | Status File | Description |
|----------|-------|-------|-------------|-------------|
| `design-qa` | react | design-qa.md | SCREEN_IMPLEMENTATION_STATUS.md | Compare UI with Figma designs |
| `e2e-tests` | react | e2e-test-generator.md | E2E_TEST_STATUS.md | Generate Playwright E2E tests |
| `backend-qa` | nestjs | e2e-test-generator.md | API_QA_STATUS.md | Validate API endpoints |
| `api-docs` | nestjs | update-swagger.md | API_DOCS_STATUS.md | Update Swagger documentation |
| `gap-finder` | all | gap-finder.md | GAP_FINDER_STATUS.md | Scan for implementation gaps across all detected stacks |
| `fix-gaps` | all | fix-gaps.md | FIX_GAPS_STATUS.md | Fix implementation gaps from dev/STATUS.md using file-based batching |
| `fix-tickets` | all | batch-fix.md | TICKET_STATUS.md | Fetch & fix Notion bug tickets by project |
| `rule-check-backend` | nestjs | compliance-check.md | COMPLIANCE_BACKEND_STATUS.md | Audit backend modules for mandatory rule violations |
| `rule-check-frontend` | react | compliance-check.md | COMPLIANCE_FRONTEND_STATUS.md | Audit frontend pages/components for mandatory rule violations |

### Options

| Option | Description |
|--------|-------------|
| `--incremental` | Only process items with status 'Pending' or 'Failed' |
| `--category <name>` | Process only items in a specific category |
| `--max-iterations <n>` | Override default iteration limit (default: 100) |
| `--dry-run` | Show what would be executed without running |
| `--list` | List all available workflows |

## Examples

### Design QA - All Screens
```bash
/ralph design-qa frontend-coach-dashboard
```

### E2E Tests - Incremental
```bash
/ralph e2e-tests frontend-coach-dashboard --incremental
```

### Backend API QA - Auth Category Only
```bash
/ralph backend-qa backend --category auth
```

### Parallel Workflows - Rule Check Both Stacks
```bash
/ralph rule-check-backend+rule-check-frontend buffalo-agro
```

### Parallel - Gap Finder + API Docs
```bash
/ralph gap-finder+api-docs buffalo-agro
```

### List Available Workflows
```bash
/ralph --list
```

---

## Execution Instructions

When the user runs `/ralph <workflow> <project>`, follow these steps:

### Step 0: Detect Parallel Workflows

If the workflow argument contains `+` (e.g., `rule-check-backend+rule-check-frontend`):

1. Split on `+` to get individual workflow names
2. Validate each workflow exists in the registry (Step 2 lookup)
3. If `--dry-run`: show a dry run block for each workflow, then **stop**
4. Launch each workflow as a **separate Agent** in parallel:
   - Use `subagent_type` matching the stack (`backend-developer` for nestjs, `frontend-developer` for react, `general-purpose` for all)
   - Each agent receives: `Run /ralph <single-workflow> <project> [options]` as its prompt
   - All agents run simultaneously — use a single message with multiple Agent tool calls
5. When all agents complete, output a combined summary:
   ```
   Parallel Ralph Summary
   ======================
   - {workflow-1}: {PASS/FAIL} ({X} items processed)
   - {workflow-2}: {PASS/FAIL} ({Y} items processed)
   ```
6. **Return early** — do not continue to Step 1

### Step 1: Parse Arguments

```
workflow = $1 (e.g., "design-qa")
project = $2 (e.g., "frontend-coach-dashboard")
options = remaining args
```

### Step 2: Workflow Registry Lookup

```yaml
workflows:
  design-qa:
    stack: react
    skill: design-qa.md
    status_file: SCREEN_IMPLEMENTATION_STATUS.md
    completion_promise: "DESIGN_QA_COMPLETE"
    default_iterations: 100

  e2e-tests:
    stack: react
    skill: e2e-test-generator.md
    status_file: E2E_TEST_STATUS.md
    completion_promise: "E2E_TESTS_COMPLETE"
    default_iterations: 100

  backend-qa:
    stack: nestjs
    skill: e2e-test-generator.md
    status_file: API_QA_STATUS.md
    completion_promise: "API_QA_COMPLETE"
    default_iterations: 100

  api-docs:
    stack: nestjs
    skill: update-swagger.md
    status_file: API_DOCS_STATUS.md
    completion_promise: "API_DOCS_COMPLETE"
    default_iterations: 50

  gap-finder:
    stack: all
    skill: gap-finder.md
    status_file: GAP_FINDER_STATUS.md
    completion_promise: "GAP_FINDER_COMPLETE"
    default_iterations: 150

  fix-gaps:
    stack: all
    skill: fix-gaps.md
    status_file: FIX_GAPS_STATUS.md
    completion_promise: "FIX_GAPS_COMPLETE"
    default_iterations: 100

  fix-tickets:
    stack: all
    skill: notion-ticket-reviewer/prompts/batch-fix.md
    status_file: TICKET_STATUS.md
    completion_promise: "FIX_TICKETS_COMPLETE"
    default_iterations: 100

  rule-check-backend:
    stack: nestjs
    skill: compliance-check.md
    status_file: COMPLIANCE_BACKEND_STATUS.md
    completion_promise: "RULE_CHECK_BACKEND_COMPLETE"
    default_iterations: 50

  rule-check-frontend:
    stack: react
    skill: compliance-check.md
    status_file: COMPLIANCE_FRONTEND_STATUS.md
    completion_promise: "RULE_CHECK_FRONTEND_COMPLETE"
    default_iterations: 50
```

### Step 3: Resolve Paths

```
skill_path = .pi/{stack}/skills/{skill}

# Special case: when stack = "all", resolve to root-level skills
if stack == "all":
    skill_path = .pi/skills/{skill}

# Special case: fix-tickets uses nested skill path
if workflow == "fix-tickets":
    skill_path = .pi/skills/notion-ticket-reviewer/prompts/batch-fix.md
    status_path = .project/status/tickets/TICKET_STATUS.md

status_path = .project/status/{project}/{status_file}
```

### Step 4: Load Skill Content

Read the skill file to get workflow instructions.

### Step 5: Check/Create Status File

If status file doesn't exist:
1. Create from template at `.pi/base/templates/ralph/status-file.template.md`
2. Populate with discovered items for the workflow

### Step 6: Build Ralph Loop Prompt

Generate the prompt for `/ralph-loop`:

```markdown
# {WORKFLOW_NAME} Task - Ralph Autonomous Loop

## Context
- Project: {PROJECT}
- Skill: .pi/{STACK}/skills/{SKILL}
- Status File: .project/status/{PROJECT}/{STATUS_FILE}

## Instructions

You are running in Ralph mode - an autonomous loop that continues until completion.

### Step 1: Load Status File
Read the status file at {STATUS_PATH} to identify items needing processing.
{IF INCREMENTAL}Filter by: status = 'Pending' or 'Failed'{/IF}
{IF CATEGORY}Filter by: category = '{CATEGORY}'{/IF}

### Step 2: Load Skill
Read and follow the skill instructions at {SKILL_PATH}.

### Step 3: For Each Item
Process each item following the skill's per-item workflow.

### Step 4: Record Results
After processing each item:
1. Update the status file with result (PASS/FAIL)
2. Add timestamp to "Last Run" column
3. If FAIL, add to "Needs Manual Review" section with reason

### Step 5: Progress Check
Every 5 items, output progress summary:
- Items processed: X/{TOTAL}
- Pass rate: Y%
- Current item: {NAME}

### Completion Criteria
- ALL items in status file have been processed, OR
- All remaining items are in "Needs Manual Review"

### When Complete
Output: <promise>{COMPLETION_PROMISE}</promise>

### If Blocked
After 3 consecutive failures on same item:
- Add to "Needs Manual Review" with detailed blocker
- Skip to next item
- Continue processing remaining items
```

### Step 7: Execute Ralph Loop

If not `--dry-run`:
```bash
/ralph-loop "<prompt>" --completion-promise "{COMPLETION_PROMISE}" --max-iterations {MAX_ITERATIONS}
```

---

## Dry Run Output

When `--dry-run` is specified, output:

```
Ralph Workflow Dry Run
======================

Workflow: {workflow}
Project: {project}
Stack: {stack}

Skill Path: .pi/{stack}/skills/{skill}
Status File: .project/status/{project}/{status_file}

Completion Promise: {completion_promise}
Max Iterations: {max_iterations}

Options:
- Incremental: {yes/no}
- Category Filter: {category or 'all'}

Items to Process: {count}

Would execute:
/ralph-loop "<prompt>" --completion-promise "{completion_promise}" --max-iterations {max_iterations}
```

---

## Workflow List Output

When `--list` is specified:

```
Available Ralph Workflows
=========================

Frontend (React):
  design-qa     - Compare UI screens against Figma designs
  e2e-tests     - Generate Playwright E2E tests for pages

Backend (NestJS):
  backend-qa    - Validate API endpoints against specification
  api-docs      - Update Swagger/OpenAPI documentation

Full Stack:
  gap-finder    - Scan for implementation gaps across all detected stacks
  fix-gaps      - Fix implementation gaps using file-based batching
  fix-tickets   - Fetch & fix Notion bug tickets by project

Rule Checking:
  rule-check-backend  - Audit backend modules for mandatory rule violations
  rule-check-frontend - Audit frontend pages/components for mandatory rule violations

Usage: /ralph <workflow> <project> [options]

Parallel: Use + to combine workflows:
  /ralph rule-check-backend+rule-check-frontend buffalo-agro

Options:
  --incremental      Only process pending/failed items
  --category <name>  Process specific category only
  --max-iterations   Override iteration limit (default: 100)
  --dry-run          Show what would run without executing
```

---

## Status File Format

All workflows use this status file format:

```markdown
# {Workflow Name} Status - {Project Name}

## Quick Summary

| Category | Completed | In Progress | Pending | Total |
|----------|-----------|-------------|---------|-------|
| {Cat 1}  | 0         | 0           | 10      | 10    |

## Item Tracking

| Item Name | Source Ref | Status | Last Run | Result | Notes |
|-----------|------------|--------|----------|--------|-------|
| {Item}    | {ref}      | :clipboard: | - | - | - |

## Execution Log

| Date | Items Processed | Pass | Fail | Skipped | Duration |
|------|-----------------|------|------|---------|----------|

## Needs Manual Review

Items that couldn't be processed automatically.

## Changelog

- {date}: Initial status file created
```

### Status Icons

| Icon | Meaning |
|------|---------|
| :white_check_mark: | Completed/Pass |
| :construction: | In Progress |
| :clipboard: | Pending |
| :x: | Failed |
| :warning: | Needs Review |

---

## Cancelling a Loop

To cancel an active Ralph loop:
```bash
/cancel-ralph
```

---

## Cost Considerations

| Workflow | Est. Items | Iterations/Item | Default Max |
|----------|------------|-----------------|-------------|
| Design QA | 48 screens | 2 | 100 |
| E2E Tests | 30 pages | 3 | 100 |
| Backend QA | 50 endpoints | 2 | 100 |
| API Docs | 50 endpoints | 1 | 50 |
| Gap Finder | ~22 items (pages+modules+cross-stack) | 5 | 150 |
| Fix Gaps | ~15-20 batches | 3 | 100 |
| Fix Tickets | ~10-30 tickets | 5 | 100 |

**Tip:** Start with `--max-iterations 50` for initial runs.

---

## Related

- [Ralph Wiggum Plugin - GitHub](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)
- Design QA Skill: `.pi/react/skills/design-qa-patterns.md`
- E2E Test Generator: `.pi/react/skills/e2e-test-generator.md`
- Backend E2E Tests: `.pi/nestjs/skills/e2e-test-generator.md`
- Gap Finder Skill: `.pi/skills/gap-finder.md`
- Fix Gaps Skill: `.pi/skills/fix-gaps.md`
- Fix Tickets Skill: `.pi/skills/notion-ticket-reviewer/prompts/batch-fix.md`
