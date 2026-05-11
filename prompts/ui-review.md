---
description: Run parallel UI acceptance tests from YAML user stories
argument-hint: "[filename-filter]"
---

# UI Review Command

Parallel QA orchestrator. Auto-discovers YAML user stories, spawns one `playwright-qa-agent` per story simultaneously, aggregates PASS/FAIL results with screenshot evidence.

---

## Quick Reference

```bash
/ui-review                    # Run all stories
/ui-review auth               # Run stories from files matching "auth"
/ui-review chat-generation    # Run stories from files matching "chat-generation"
```

---

## Phase 1: Discover

### 1.1 Find Story Files

```
Glob: .project/user_stories/*.yaml
```

### 1.2 Apply Filter (if provided)

```
$ARGUMENTS
```

If arguments provided, filter filenames containing the argument substring.
If no arguments, use all discovered YAML files.

### 1.3 Parse Stories

Read each YAML file. Expected format:

```yaml
stories:
  - name: "Story name"
    url: "http://localhost:5173/path"
    workflow: |
      Step 1 instruction
      Step 2 instruction
      ...
```

Extract all individual stories into a flat list.

### 1.4 Generate Run Directory

```bash
RUN_DIR=".project/qa/runs/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$RUN_DIR"
```

### 1.5 Validate

- If no YAML files found: show error and suggest creating `.project/user_stories/` with example
- If no stories parsed: show error about YAML format
- Report: "Found {N} stories across {M} files"

---

## Phase 2: Spawn (Parallel)

### 2.1 Create Team

```
TeamCreate("ui-review")
```

### 2.2 Spawn Agents

**CRITICAL: Spawn ALL agents in a SINGLE message turn to guarantee parallel execution.**

For each story, use the Task tool:

```
Task(
  subagent_type: "general-purpose",
  name: "qa-{story-kebab}",
  team_name: "ui-review",
  prompt: """
    You are a playwright-qa-agent. Read the agent instructions at:
    .pi/base/agents/playwright-qa-agent.md

    Execute this user story:

    story_name: {story.name}
    story_url: {story.url}
    workflow: |
      {story.workflow}

    RUN_DIR: {RUN_DIR}

    Follow the agent protocol exactly. Return the structured report.
  """
)
```

All Task calls must be in the same message — do NOT spawn sequentially.

---

## Phase 3: Collect

1. Await all agent completions
2. Parse each agent's report:
   - Extract `STATUS: PASS|FAIL`
   - Extract step counts (total, passed, failed, skipped)
   - Extract `FAILURE_DETAILS` if present
3. Track results per story

---

## Phase 4: Cleanup & Report

### 4.1 Shutdown Team

Send shutdown requests to all teammates, then:
```
TeamDelete()
```

### 4.2 Generate Aggregate Report

Display to user:

```markdown
# UI Review Report

**Date**: {YYYY-MM-DD HH:MM}
**Stories**: {total}
**Screenshots**: {RUN_DIR}/

---

| Story | Source File | Status | Steps | Details |
|-------|-----------|--------|-------|---------|
| User login | auth.yaml | PASS | 5/5 | - |
| Chat session | chat-generation.yaml | FAIL | 3/5 | Step 3: SSE indicator not visible |
| Template gen | design-generation.yaml | PASS | 4/4 | - |

---

**Result: {passed}/{total} PASSED ({percentage}%)**

### Failures

1. **Chat session** (chat-generation.yaml)
   - Step 3: SSE indicator not visible
   - Screenshot: {RUN_DIR}/chat-session/02_verify-sse.png
     (e.g. .project/qa/runs/20260219_153000/chat-session/02_verify-sse.png)
```

---

## Error Handling

| Error | Action |
|-------|--------|
| No YAML files found | Show example YAML format and directory structure |
| `playwright-cli` not installed | Show install command and exit |
| Servers not running | Warn user to start servers first |
| Agent timeout | Mark story as FAIL with "Agent timeout" |
| All stories fail | Show full report, suggest checking server status |

---

## Prerequisites

1. `@playwright/cli` installed globally: `npm install -g @playwright/cli@latest`
2. Application servers running (backend + frontend)
3. YAML story files in `.project/user_stories/`

---

## Example

```bash
# First time: create a story file
# .project/user_stories/auth.yaml

# Run all stories
/ui-review

# Output:
# Found 3 stories across 1 file
# Spawning 3 agents in parallel...
# [Agent qa-user-login completed: PASS]
# [Agent qa-user-register completed: PASS]
# [Agent qa-password-reset completed: FAIL]
#
# UI Review Report
# Result: 2/3 PASSED (66%)
```
