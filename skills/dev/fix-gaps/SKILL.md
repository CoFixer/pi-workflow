---
name: fix-gaps
description: Fix implementation gaps found by find-gaps, syncing results to dev/STATUS.md
---

# Fix Gaps

Systematic methodology for fixing implementation gaps discovered by `/dev:gap-finder`.
Reads the latest gap-analysis report, syncs `dev/STATUS.md`, then implements fixes
in **file-based batches** — delegating to backend-developer or frontend-developer as appropriate.

---

## Quick Start

```
/dev:fix-gaps               # Auto-cascade: count all tiers, fix Critical→High→Medium→Low automatically
/dev:fix-gaps all            # Same as no args — full auto-cascade
/dev:fix-gaps remaining      # Same as no args — full auto-cascade
/dev:fix-gaps critical       # Fix only Critical gaps
/dev:fix-gaps high           # Fix only High gaps
/dev:fix-gaps medium         # Fix only Medium gaps
/dev:fix-gaps low            # Fix only Low gaps
/dev:fix-gaps C5             # Fix a single gap by ID
```

**Continuation**: Re-running `/dev:fix-gaps` (no args) resumes auto-cascade from the first tier that still has PENDING gaps. Any `IN PROGRESS` gaps from an interrupted run are reset to PENDING and included in scope.

---

## Central Tracking: dev/STATUS.md

All state lives in `dev/STATUS.md`. The fix-gaps system owns this file during a fix run.

### Table Schema

```
| ID | Severity | Category | Description | Status | File(s) |
```

### ID Assignment Rules

| Severity | Prefix | Example |
|----------|--------|---------|
| Critical | C      | C1, C2, C5 |
| High     | H      | H1, H7, H12 |
| Medium   | M      | M1, M5 |
| Low      | L      | L1, L4 |

IDs are assigned sequentially, continuing from the highest existing number in each tier.
Once assigned, an ID **never changes** — even if a gap is later marked N/A or SKIPPED.

### Status Values

| Value | Meaning | Can transition to |
|-------|---------|-------------------|
| `PENDING` | Not yet started | IN PROGRESS |
| `IN PROGRESS` | Currently being fixed (batch active) | DONE, SKIPPED |
| `DONE` | Fixed and TSC-verified | _(terminal)_ |
| `N/A` | Out of scope by design | _(terminal)_ |
| `SKIPPED` | Attempted but blocked | IN PROGRESS (on retry) |

---

## Batching Strategy

The key to fixing ALL gaps efficiently is **file-based batching**:

### How It Works

1. **Group by file**: Gaps sharing the same `File(s)` value go into one batch
   - Example: H12, H13, H14, H15 all target `projects.service.ts` → 1 batch, 1 sub-agent call
   - Example: H31, H32, H33, H34, M37, M38 all target `AdminDashboard.tsx` → 1 batch

2. **Max batch size**: 8 gaps per sub-agent call. Split larger groups.

3. **Straggler consolidation**: Single-gap files merge into a "misc" batch per stack (up to 8)

4. **Stack classification**:
   - `backend/` files or Backend/Swagger/Infrastructure categories → backend-developer
   - `frontend/` files or Design System/UI States/Feature Parity categories → frontend-developer

### Why Batching Works

| Approach | 96 gaps | Sub-agent calls | TSC runs |
|----------|---------|-----------------|----------|
| One-at-a-time (old) | 96 | ~96 | ~192 |
| File-batched (new) | 96 | ~15-20 | ~30-40 |

**4-5x fewer tool calls** = fits within context window, completes reliably.

### Parallel Processing

Backend-only and frontend-only batches can run **in parallel**:
- Launch both sub-agents simultaneously
- Run TSC for each workspace independently
- Update STATUS.md after both complete

---

## Sync Algorithm

When syncing the gap-analysis report into STATUS.md:

```
1. Read current STATUS.md
2. Read latest gap-analysis report
3. Recovery: Reset any IN PROGRESS rows to PENDING (interrupted run)
4. For each gap in report:
     candidate_id = next_available_id(severity)
     if gap.description NOT similar to any existing STATUS row:
         append row: candidate_id | severity | category | description | PENDING | files
     else:
         skip (already tracked)
5. Write updated STATUS.md (full file, atomically)
```

**Similarity check**: A gap is "already present" if its description shares ≥70% of key tokens
(nouns, verbs, identifiers) with an existing STATUS row. When in doubt, add as new — duplicates
are safer than missed gaps.

---

## Fix Decision Tree

```
Batch selected
  │
  ├── All File(s) under backend/ ?
  │     └── Delegate entire batch to backend-developer
  │
  ├── All File(s) under frontend/ ?
  │     └── Delegate entire batch to frontend-developer
  │
  ├── Files in BOTH backend/ and frontend/ ?
  │     └── Fix backend portion first, then frontend portion
  │
  └── Category-based fallback:
        ├── Data Binding / Backend / Auth / Infrastructure / Swagger / Audit
        │     └── backend-developer
        └── Design System / Missing UI States / Feature Parity / Accessibility
              └── frontend-developer
```

---

## Delegation Protocol

### Backend Batch → backend-developer

```
Fix these {N} gaps:

{for each gap:}
{n}. Gap {ID} ({Severity}) — {Category}: {Description}
   File(s): {File(s)}
{end for}

Report context:
---
{consolidated context from gap report}
---

IMPORTANT:
- Fix ALL {N} gaps listed above
- Follow NestJS four-layer architecture from .pi/nestjs/guides/
- Do NOT run TypeScript checks — gap-fixer will verify
- Return: complete list of ALL files you modified
```

### Frontend Batch → frontend-developer

```
Fix these {N} gaps:

{for each gap:}
{n}. Gap {ID} ({Severity}) — {Category}: {Description}
   File(s): {File(s)}
{end for}

Design reference: .project/docs/PROJECT_DESIGN_GUIDELINES.md

Report context:
---
{consolidated context from gap report}
---

IMPORTANT:
- Fix ALL {N} gaps listed above
- Follow React patterns from .pi/react/guides/
- Do NOT run TypeScript checks — gap-fixer will verify
- Return: complete list of ALL files you modified
```

### TSC Error Recovery → auto-error-resolver

```
TypeScript errors after fixing gaps [{IDs}]. Resolve without reverting the intended fixes.

Modified files: {list}

TSC output:
---
{tsc_output}
---
```

---

## TypeScript Verification

**Mandatory** before marking any batch `DONE` — run **once per batch**, not per gap:

```bash
# Backend check
cd backend && npx tsc --noEmit 2>&1 | head -60

# Frontend check
cd frontend && npx tsc --noEmit 2>&1 | head -60
```

Both must return zero errors for the affected workspace. If either fails:
1. Delegate to `auto-error-resolver` with TSC output + modified files
2. Re-run TSC
3. If still failing after 2 passes → mark failing gaps `SKIPPED (TSC errors persist)`, mark clean gaps `DONE`

---

## Skip vs N/A

| Use `SKIPPED` when... | Use `N/A` when... |
|------------------------|-------------------|
| File doesn't exist in codebase | Gap is out of scope by PRD design |
| Fix requires migration agent can't perform | Feature deliberately not implemented |
| TSC errors persist after auto-resolver | User explicitly marks as won't-fix |
| Gap conflicts with another DONE fix | |

---

## STATUS.md Atomic Update Pattern

### Batch update (primary pattern):
```
1. Read entire dev/STATUS.md into memory
2. Find ALL target rows by ID (batch)
3. Update Status column for all rows in batch (IN PROGRESS or DONE)
4. Update File(s) column if marking DONE
5. Update Last Updated date
6. Recalculate Summary section counts
7. Write entire file back
```

**Never** append individual lines. **Never** modify DONE or N/A rows.

### Recovery pattern (at startup):
```
1. Read entire dev/STATUS.md
2. Find any IN PROGRESS rows
3. Reset them to PENDING
4. Write entire file back
```

---

## PRD Coverage Calculation

After each fix session:

```
coverage = round(DONE_count / total_count * 100)
```

Update the `PRD Coverage` header in STATUS.md.

---

## Related

- **Command**: [/dev:fix-gaps](../../../commands/dev/fix-gaps.md)
- **Agent**: [gap-fixer](../../../agents/analysis/gap-fixer.md)
- **Reports**: `./dev/reports/gap-analysis-*.md`
- **State file**: `dev/STATUS.md`
- **Gap finder**: [/dev:gap-finder](../../../commands/dev/gap-finder.md)
- **Skill methodology**: [find-gaps SKILL](../find-gaps/SKILL.md)
