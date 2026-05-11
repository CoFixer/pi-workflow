---
description: Install Harness Engineering setup into any project — session memory, auto-reflect, agent-oriented CLAUDE.md
argument-hint: Optional project name (will auto-detect)
---

You are a harness engineering setup assistant. Your task is to retrofit the compounding memory system into an existing project — enabling session continuity, auto-reflection, and an agent-oriented CLAUDE.md.

This command is safe to run multiple times (idempotent). It only adds missing pieces, never overwrites existing content.

---

## Step 0: Verify Prerequisites

Check that the .claude submodule is initialized:

```bash
ls .pi/base/hooks/auto-reflect.sh 2>/dev/null && echo "OK" || echo "MISSING"
```

If MISSING, stop and report:
```
Error: .pi/base submodule not found.
Run: git submodule update --init --recursive
```

Check for .project/ directory:

```bash
ls .project/ 2>/dev/null && echo "OK" || echo "MISSING"
```

If MISSING, suggest running `/dev:init-workspace` first, then stop.

---

## Step 1: Auto-detect Project Name

If `$ARGUMENTS` is provided, use it.

Otherwise detect from git:
```bash
git remote get-url origin 2>/dev/null | sed 's/.*\/\([^\/]*\)\.git$/\1/' | sed 's/.*\/\([^\/]*\)$/\1/'
```

Fallback to folder name:
```bash
basename "$PWD"
```

Store as `$PROJECT_NAME`.

---

## Step 2: Create Session Archiving

Create the sessions directory and CURRENT.md if they don't exist:

```bash
mkdir -p .project/sessions
```

If `.project/sessions/CURRENT.md` does NOT exist, create it:

```markdown
# Current Session — $DATE

## Last updated
$DATE

## What was completed
(Fill in before ending session)

## Still in progress
(Half-done tasks that need picking up next session)

## Blocked on
(Anything waiting on external input or decisions)

## Decisions made this session
(Add to DECISIONS.md too)

## New gotchas discovered
(Add to LEARNINGS.md too)
```

Replace `$DATE` with today's date (YYYY-MM-DD format).

If it already exists, skip — do not overwrite.

---

## Step 3: Enable Auto-Reflect

Check current state:

```bash
cat .project/state/reflect-enabled.json 2>/dev/null || echo "NOT_EXISTS"
```

If NOT_EXISTS or `enabled: false`:

```bash
mkdir -p .project/state
```

Read existing file if it exists to preserve `lastReflection` and `totalReflections` values.

Write `.project/state/reflect-enabled.json`:
```json
{
  "enabled": true,
  "lastReflection": $EXISTING_LAST_REFLECTION_OR_NULL,
  "totalReflections": $EXISTING_TOTAL_OR_0
}
```

If already `enabled: true`, skip with message: "Auto-reflect already enabled ✓"

---

## Step 4: Update CLAUDE.md

### 4a: Check if CLAUDE.md exists

```bash
ls CLAUDE.md 2>/dev/null && echo "EXISTS" || echo "MISSING"
```

**If MISSING**: Create a minimal CLAUDE.md:

```markdown
# $PROJECT_NAME

## Overview

**Project**: $PROJECT_NAME
**Status**: Development

(Add project description here)

---
```

**If EXISTS**: Check if it already has a `## For AI Agents` section:

```bash
grep -q "## For AI Agents" CLAUDE.md && echo "HAS_SECTION" || echo "MISSING_SECTION"
```

### 4b: Add the agent section

**If `## For AI Agents` section is MISSING** (in both new and existing CLAUDE.md):

Find the first `---` separator in CLAUDE.md (end of the Overview/header section) and insert after it:

```markdown
## For AI Agents

### Start every session by checking (if files exist):
- `.project/sessions/CURRENT.md` — what was in progress last session
- `.project/memory/LEARNINGS.md` — known pitfalls and patterns
- `.project/memory/DECISIONS.md` — architectural decisions already made

### Deep reference (load only when relevant):
- API endpoints → `.project/docs/PROJECT_API.md`
- DB schema → `.project/docs/PROJECT_DATABASE.md`
- Full knowledge → `.project/docs/PROJECT_KNOWLEDGE.md`

### Always confirm before doing:
- Any file matching `**/migrations/**` → read existing migrations first
- `.env` files → never commit, never log values
- `git push` to `main` → always confirm
- Destructive operations (drop table, rm -rf, reset --hard) → always confirm

### Known pitfalls — don't repeat these:
(Fill in project-specific gotchas here)

### Before ending any session:
Update `.project/sessions/CURRENT.md` with:
- What was completed this session
- What's still in progress (half-done tasks)
- Any blockers
- Any decisions made (also add to `DECISIONS.md`)
- Any new gotchas (also add to `LEARNINGS.md`)

---
```

**If section already EXISTS**: Skip with message: "## For AI Agents section already present ✓"

---

## Step 5: Seed LEARNINGS.md

Check if LEARNINGS.md has real entries (beyond the template skeleton):

```bash
grep -c "^#### Issue:" .project/memory/LEARNINGS.md 2>/dev/null || echo "0"
```

If count is 0 (still empty template), add a starter entry to the `### Common Issues & Solutions` section:

```markdown
#### Issue: [Replace with first real issue you encounter]
**Symptoms**: [What you observed]
**Root Cause**: [What was actually wrong]
**Solution**: [How to fix it]
**Prevention**: [How to avoid in future]
```

And add a starter row to the `### Third-Party Libraries` table:

```markdown
| [Library name] | [Quirk or gotcha] | [Workaround] |
```

Add a session note at the bottom:

```markdown
### $DATE: Harness Engineering setup
- Initialized compounding memory system via /dev:init-harness
- Auto-reflect enabled — HIGH confidence corrections will auto-capture on session end
- Fill in project-specific pitfalls as you discover them
```

If LEARNINGS.md already has real entries (count > 0), skip with message: "LEARNINGS.md already has content ✓"

---

## Step 6: Seed DECISIONS.md

Check if DECISIONS.md has real entries:

```bash
grep -c "^## 20" .project/memory/DECISIONS.md 2>/dev/null || echo "0"
```

If count is 0 (still empty template), add a starter entry under `## Decisions`:

```markdown
## $DATE: [Replace with your first architectural decision]

**Context**: [Why this decision was needed]

**Decision**: [What was decided]

**Rationale**: [Why this choice was made]

**Alternatives Considered**:
- [Alternative 1]: [Why not chosen]

**Consequences**: [What this means going forward]
```

If already has real entries (count > 0), skip with message: "DECISIONS.md already has content ✓"

---

## Step 7: Prompt for Project-Specific Gotchas

Use **AskUserQuestion** to ask:

**"Any known pitfalls in this project that Claude should never repeat?"**

Options:
1. **Skip for now** — I'll fill these in as I discover them
2. **Yes, let me add them** — Open LEARNINGS.md and CLAUDE.md to fill in

If user selects option 2, open both files and wait for them to add project-specific content before continuing.

---

## Step 8: Report Results

```
Harness Engineering setup complete for: $PROJECT_NAME

What was installed:
  ✅ sessions/CURRENT.md     — session continuity (picks up where you left off)
  ✅ auto-reflect enabled     — corrections auto-captured to LEARNINGS.md on Stop
  ✅ CLAUDE.md updated        — agent navigation + guardrails + gotchas section added
  ✅ LEARNINGS.md seeded      — ready for compounding pitfall capture
  ✅ DECISIONS.md seeded      — ready for architecture decision logging

How it compounds:
  Session start  → Claude checks CURRENT.md + LEARNINGS.md
  During session → Corrections auto-captured to LEARNINGS.md
  Session end    → Claude updates CURRENT.md with what's done + what's next
  Next session   → Picks up with full context, avoids known mistakes

Next steps:
  1. Add project-specific gotchas to CLAUDE.md "Known pitfalls" section
  2. Add project-specific dangers to CLAUDE.md "Always confirm" section
  3. Run /reflect-status to verify auto-reflect is working
  4. At end of each session: update .project/sessions/CURRENT.md
```

---

## Error Handling

- **Template dir missing**: Report "Run git submodule update --init --recursive"
- **.project missing**: Report "Run /dev:init-workspace first"
- **CLAUDE.md write fails**: Report file path and permissions issue
- **reflect-enabled.json write fails**: Create state/ directory first, retry once
- **User cancels at Step 7**: Continue with "Skip for now" behavior, report partial completion
