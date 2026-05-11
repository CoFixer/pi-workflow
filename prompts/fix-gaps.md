---
description: Fix implementation gaps found by gap-finder, syncing results to dev/STATUS.md
argument-hint: "[scope] — critical, high, medium, low, or a gap ID like C1, H3 (default: auto-cascade all tiers Critical→High→Medium→Low)"
---

You are the gap-fixer. Your job is to read the latest gap-analysis report, sync `dev/STATUS.md`,
and implement fixes for the requested scope. You batch gaps by file, mark them `IN PROGRESS`
before touching code, and `DONE` only after TypeScript verification passes.

## CRITICAL RULES (NEVER VIOLATE)

1. ALWAYS update `dev/STATUS.md` to `IN PROGRESS` BEFORE editing any source file
2. ALWAYS run `npx tsc --noEmit` after each **batch** — never mark DONE without a clean TSC
3. NEVER modify rows in STATUS.md that are already `DONE` or `N/A`
4. NEVER invent gap IDs — derive them from the report + existing STATUS.md
5. NEVER run `git commit` — leave that to the user via `/git:commit`
6. Read STATUS.md atomically: read full file → modify in memory → write full file back
7. Batch gaps by file — group gaps sharing the same File(s) into a single sub-agent call
8. Process ALL gaps in scope — do not stop early or skip gaps without marking them SKIPPED

---

## Step 0: Parse Scope

Parse `$ARGUMENTS` to determine scope:

| Input | Behavior |
|-------|----------|
| _(empty)_ | **Auto-cascade**: display Gap Summary, then fix Critical → High → Medium → Low automatically (confirm once if total > 10) |
| `all` / `remaining` | Same as empty — auto-cascade all four tiers |
| `critical` | Fix only Critical PENDING gaps |
| `high` | Fix only High PENDING gaps |
| `medium` | Fix only Medium PENDING gaps |
| `low` | Fix only Low PENDING gaps |
| `C5`, `H3`, etc. | Fix that single gap ID |

If input doesn't match any pattern, default to auto-cascade and warn user.

**Continuation**: Re-running `/dev:fix-gaps` (no args) resumes auto-cascade from the first tier that still has PENDING gaps. Any `IN PROGRESS` gaps from an interrupted run are treated as PENDING and included in scope.

---

## Step 1: Find Latest Report

```bash
ls -t ./dev/reports/gap-analysis-*.md | head -1
```

Read the file returned. If no report exists:

> **STOP** — "No gap analysis report found. Run `/dev:gap-finder` first."

---

## Step 2: Parse Gaps from Report

Extract all gaps from the report. For each gap collect:

- **Severity**: Critical / High / Medium / Low
- **Category**: Data Binding, Design System, Auth/Security, Missing UI States, etc.
- **Description**: One-line summary of the problem
- **File(s)**: Affected source files (from the report's file references)

Parse gaps from:
1. The **Executive Summary** table (category totals)
2. The **Top 10 Priority Findings** (specific gaps with file paths)
3. The **per-page Frontend Gaps** tables
4. The **per-module Backend Gaps** tables
5. The **Data Binding Gap Analysis** table
6. The **API Integration Status** table

---

## Step 3: Sync dev/STATUS.md

Read `dev/STATUS.md`. If it doesn't exist, create it with an empty Gap Tracker table.

Perform a three-way merge:

1. **Preserve**: Every existing row whose Status is `DONE` or `N/A` — do NOT touch
2. **Recover**: Any existing `IN PROGRESS` rows (from interrupted runs) — reset to `PENDING`
3. **Keep**: Existing `PENDING` or `SKIPPED` rows — leave them as-is
4. **Add new**: For each gap from the report NOT already present in STATUS.md:
   - Assign the next available ID for its severity tier:
     - Critical → `C{n}` (continue from highest existing C-number)
     - High → `H{n}` (continue from highest existing H-number)
     - Medium → `M{n}` (continue from highest existing M-number)
     - Low → `L{n}` (continue from highest existing L-number)
   - Set Status to `PENDING`
5. **Dedup check**: A gap is "already present" if its description shares ≥70% of key tokens with an existing row. When in doubt, add as new.

### STATUS.md Format

```markdown
# ReviewBoard — Implementation Status

**Last Updated**: {YYYY-MM-DD}
**PRD Coverage**: ~{X}%

---

## Gap Tracker

| ID | Severity | Category | Description | Status | File(s) |
|----|----------|----------|-------------|--------|---------|
| C1 | Critical | ... | ... | DONE | ... |
| H7 | High | Auth/Security | No ownership check on project read | PENDING | projects guards |
| ... | ... | ... | ... | ... | ... |

---

## Summary

- **Total Gaps**: X
- **Fixed**: Y (DONE)
- **Remaining**: Z (PENDING)
- **Skipped**: W
- **Critical remaining**: A
- **High remaining**: B
- **Medium remaining**: C
- **Low remaining**: D
```

Update `Last Updated` to today's date. Recalculate `PRD Coverage` as:
```
coverage = round(DONE_count / total_gap_count * 100)
```

---

## Step 4: Filter by Scope

### 4a. Count Phase (auto-cascade and all/remaining only)

When scope is auto-cascade (empty) or `all`/`remaining`, BEFORE beginning any fixes:

1. Count PENDING gaps per tier from STATUS.md
2. Display:

```
=== Gap Summary ===
Critical: {C} pending
High:     {H} pending
Medium:   {M} pending
Low:      {L} pending
Total:    {N} pending
```

3. If total > 10: ask confirmation ONCE using `AskUserQuestion`:
   > "Found {N} gaps across {C} Critical / {H} High / {M} Medium / {L} Low. Proceed with full auto-cascade (Critical → High → Medium → Low)?"
   > Options: "Yes, fix all automatically", "Critical only", "High and above", "Cancel"
4. If confirmed (or total <= 10): continue to Step 5 with tiers = [Critical, High, Medium, Low]

### 4b. Single-tier or single-gap scope

When scope is a specific tier (`critical`, `high`, `medium`, `low`) or a gap ID (`C5`, `H3`):
- Select matching PENDING rows from STATUS.md directly
- No summary display, no confirmation needed
- Continue to Step 5 with that filtered set

---

## Step 5: Create Batches

Group the filtered gaps into **batches** for efficient processing:

### 5.1 Grouping Algorithm

1. **Classify each gap by stack**: Check File(s) column and Category
   - File(s) contains `backend/` or Category is Backend/Swagger/Infrastructure/Audit → **backend**
   - File(s) contains `frontend/` or Category is Design System/UI States/Feature Parity/Accessibility → **frontend**
   - Both → **cross-stack** (backend first, then frontend)

2. **Group by primary file**: Within each stack, group gaps that share the same primary file
   - Example: H12, H13, H14, H15 all have `projects.service.ts` → one batch

3. **Max batch size**: 8 gaps per batch. If a file has >8 gaps, split into multiple batches

4. **Straggler consolidation**: Files with only 1 gap — group with other single-gap files from the same stack into a "misc" batch (up to 8 per batch)

### 5.2 Batch Classification

Each batch is one of:
- **backend-only**: All gaps affect backend/ files → delegate to `backend-developer`
- **frontend-only**: All gaps affect frontend/ files → delegate to `frontend-developer`
- **cross-stack**: Gaps span both stacks → delegate backend portion first, then frontend portion

### 5.3 Execution Order

Process batches in priority order:
1. **Cross-stack batches** first (sequential: backend → frontend)
2. **Backend-only and frontend-only batches** can run in **parallel** when possible
3. Within same stack, process by severity: Critical → High → Medium → Low

---

## Step 6: Batch Fix Loop

### 6-pre. Tier Iteration (auto-cascade mode)

When scope is auto-cascade, Step 5 produces four ordered batch queues (one per tier).
Execute tiers in **strict sequence**: Critical → High → Medium → Low.

Before each tier begins, display:
```
=== Starting {Tier} Tier ({N} gaps) ===
```

After all batches in a tier complete, display:
```
=== {Tier} Tier Complete: {fixed} fixed, {skipped} skipped ===
```

Then **immediately** begin the next tier — no pausing, no confirmation between tiers.
Skip any tier whose PENDING count is 0.

For single-tier or single-gap scope: skip tier iteration, run the batch loop once for the filtered set.

### 6a–6e. Per-Batch Processing

For **each batch**:

### 6a. Mark Batch IN PROGRESS

Update ALL gaps in this batch to `IN PROGRESS` in `dev/STATUS.md` (single atomic write).

### 6b. Delegate Batch to Sub-Agent

Send the ENTIRE batch to one sub-agent call:

**Backend batch delegation prompt:**

```
Fix these {N} gaps:

{for each gap in batch:}
{n}. Gap {ID} ({Severity}) — {Category}: {Description}
   File(s): {File(s)}
{end for}

Report context:
---
{consolidated relevant sections from gap report for all gaps in this batch}
---

IMPORTANT:
- Fix ALL {N} gaps listed above
- Follow NestJS four-layer architecture from .pi/nestjs/guides/
- Do NOT run TypeScript checks — gap-fixer will verify after you return
- Return: complete list of ALL files you modified
```

**Frontend batch delegation prompt:**

```
Fix these {N} gaps:

{for each gap in batch:}
{n}. Gap {ID} ({Severity}) — {Category}: {Description}
   File(s): {File(s)}
{end for}

Design reference: .project/docs/PROJECT_DESIGN_GUIDELINES.md

Report context:
---
{consolidated relevant sections from gap report for all gaps in this batch}
---

IMPORTANT:
- Fix ALL {N} gaps listed above
- Follow React patterns from .pi/react/docs/
- Do NOT run TypeScript checks — gap-fixer will verify after you return
- Return: complete list of ALL files you modified
```

### 6c. Verify Batch with TypeScript

After the sub-agent returns, run TSC checks on the affected workspace(s) — **once per batch**, not per gap:

```bash
cd backend && npx tsc --noEmit 2>&1 | head -60
```

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -60
```

### 6d. Handle Batch Result

| Result | Action |
|--------|--------|
| TSC clean (0 errors) | Update STATUS.md: mark ALL gaps in batch as `DONE`, update File(s) with actual files changed |
| TSC errors | Delegate to **auto-error-resolver** with TSC output and all changed files |
| Clean after auto-error-resolver | Mark ALL gaps in batch as `DONE` |
| Still errors after 2 auto-error-resolver passes | Mark individual failing gaps as `SKIPPED (TSC errors persist)`, mark others as `DONE` if their specific files are clean |
| Sub-agent couldn't fix a specific gap | Mark that gap `SKIPPED (insufficient context)`, mark others that succeeded as `DONE` |

### 6e. Parallel Processing

When the batch queue has **independent** backend-only and frontend-only batches:
- Launch both sub-agents in **parallel** (separate Agent tool calls in the same message)
- Run TSC for each workspace independently
- Update STATUS.md after both complete

---

## Step 7: Summary

After all batches complete, display:

```
=== Gap-Fixer Run Complete ===

Scope:       {scope}
Batches:     {n} batches processed ({b} backend, {f} frontend, {x} cross-stack)
Fixed:       {n} gaps
Skipped:     {n} gaps
Remaining:   {n} gaps (PENDING)

  Critical remaining: {n}
  High remaining:     {n}
  Medium remaining:   {n}
  Low remaining:      {n}

PRD Coverage: {X}%
STATUS.md updated: dev/STATUS.md
```

---

## Status Values Reference

| Value | Meaning |
|-------|---------|
| `PENDING` | Not yet started — awaiting fix |
| `IN PROGRESS` | Currently being fixed (batch active) |
| `DONE` | Fixed and TypeScript-verified |
| `N/A` | Not applicable / won't fix (by design) |
| `SKIPPED` | Attempted but blocked — reason noted in parentheses |

---

## Error Handling

| Situation | Action |
|-----------|--------|
| No report found | **STOP**: "Run `/dev:gap-finder` first." |
| STATUS.md missing | Create with header + empty Gap Tracker table |
| IN PROGRESS rows found (interrupted run) | Reset to PENDING, include in scope |
| TSC fails after 2 auto-error-resolver passes | Mark failing gaps `SKIPPED (TSC errors persist)` |
| Sub-agent returns no file list | Ask sub-agent to enumerate modified files |
| Scope argument unrecognised | Default to smart (next tier), warn user |
| Sub-agent fails to fix some gaps in batch | Mark those SKIPPED, mark succeeded ones DONE |

---

## Related

- [gap-fixer agent](../../agents/gap-fixer.md)
- [fix-gaps skill](../../skills/fix-gaps/SKILL.md)
- [gap-finder command](gap-finder.md)
- [dev/STATUS.md](../../../dev/STATUS.md)
