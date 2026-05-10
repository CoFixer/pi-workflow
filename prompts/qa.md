---
description: "Unified QA \u2014 design fidelity + acceptance stories"
argument-hint: "[design|acceptance]"
---

# Unified QA Command

Orchestrates all QA scopes: design fidelity and acceptance testing (YAML user stories).

---

## Quick Reference

```bash
/qa                    # Run both scopes
/qa design             # Design fidelity only (auto-detects Figma or HTML source)
/qa acceptance         # YAML user stories only
```

---

## Step 1: Parse Arguments

```
$ARGUMENTS
```

| Argument | Scope |
|----------|-------|
| (none) | Run all available scopes |
| `design` | Design fidelity only |
| `acceptance` | YAML user stories only |

---

## Step 2: Detect Available Scopes

### Design Scope

**Two design QA variants** — auto-detect which to use:

#### Variant A: Figma-based (`design-qa-figma`)

**Use when:**
- `SCREEN_IMPLEMENTATION_STATUS.md` exists with Figma node IDs (format `16297:113891`)
- Figma MCP is available

**Source of truth:** Figma designs via MCP tools
**Skill:** `.pi/react/skills/qa/design-qa-figma.md`
**Delegates to:** `/ralph design-qa {project} --incremental`

#### Variant B: HTML-based (`design-qa-html`)

**Use when:**
- HTML prototype files exist (e.g., `prototypes/*.html`, `designs/*.html`)
- No Figma node IDs in status file, OR HTML prototypes directory detected

**Source of truth:** Static HTML files
**Skill:** `.pi/react/skills/qa/design-qa-html.md`

#### Detection Logic

```
1. Glob: .pi-project/status/*/SCREEN_IMPLEMENTATION_STATUS.md
2. If found:
   a. Read the status file
   b. Check if entries contain Figma node IDs (pattern: digits:digits)
   c. If yes → Figma variant
   d. If no → look for HTML prototypes
3. If not found:
   a. Glob: prototypes/**/*.html OR designs/**/*.html
   b. If found → HTML variant
   c. If not found → Design scope unavailable
```

### Acceptance Scope

**Available when:**
- YAML story files exist:
  ```
  .pi-project/user_stories/*.yaml
  ```

### Validation

If a requested scope is not available, report why and continue with remaining scopes.

If no scopes are available:
```
No QA scopes available.

- Design (Figma): Needs SCREEN_IMPLEMENTATION_STATUS.md with Figma node IDs
- Design (HTML): Needs HTML prototype files in prototypes/ or designs/
- Acceptance: Needs .pi-project/user_stories/*.yaml files
```

---

## Step 3: Execute Scopes

### If both scopes requested (default)

Run in parallel using TeamCreate:

1. `TeamCreate("qa-run")`
2. Spawn agents simultaneously in a single message:
   - **Design agent**: Runs design QA (Figma or HTML variant)
   - **Acceptance agent**: Runs `/ui-review`
3. Await both completions
4. Shutdown teammates → `TeamDelete`

### If single scope requested

Run directly without team overhead:

- `design` → Execute design QA (auto-detected variant)
- `acceptance` → Execute `/ui-review`

### Design QA Execution

**Figma variant:**
```
/ralph design-qa {project} --incremental
```

**HTML variant:**
1. Load the design-qa-html skill
2. Glob for HTML prototype files
3. Compare each screen's React implementation against its HTML prototype
4. Produce fidelity scores per screen

---

## Step 4: Aggregate Report

After all scopes complete, display:

```markdown
# QA Report

**Date**: {YYYY-MM-DD HH:MM}
**Scopes**: {list of scopes run}
**Design Source**: Figma | HTML prototypes

---

## Results

| Scope | Status | Details |
|-------|--------|---------|
| Design ({source}) | {fidelity}% | {pass}/{total} screens |
| Acceptance | {pass_rate}% | {pass}/{total} stories passed |

---

## Design QA Summary

{Fidelity scores per screen, failing screens with discrepancies}

## Acceptance Summary

{Pass/fail per story, screenshot locations}

---

## Failures

{All failures with actionable fix suggestions}
```

---

## Error Handling

| Error | Action |
|-------|--------|
| No scopes available | Show setup instructions for each scope |
| Scope partially fails | Report failures, continue other scopes |
| `playwright-cli` not installed | Show: `npm install -g @playwright/cli@latest` |
| Figma MCP not responding | Show: "Ensure Figma desktop app is running with the file open" |
| No YAML stories found | Show: "Create stories in .pi-project/user_stories/*.yaml" |
| Servers not running | Show: "Start dev servers before running acceptance tests" |

---

## Examples

### Run everything
```bash
/qa
# → Detecting scopes...
# → Design: Available (Figma variant, frontend, 15 screens)
# → Acceptance: Available (5 files, 15 stories)
# → Running both in parallel...
# → QA Report generated
```

### Design only (auto-detects source)
```bash
/qa design
# → Detected: Figma node IDs in status file
# → Running design-qa-figma for frontend...
# → 12/15 screens pixel-perfect (92%)
```

### Acceptance only
```bash
/qa acceptance
# → Found 15 stories across 5 files
# → Spawning 15 agents in parallel...
# → 12/15 PASSED (80%)
```
