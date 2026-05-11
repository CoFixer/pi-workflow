---
description: Show current auto-reflection status and learning history
argument-hint: (no arguments)
---

# Reflection Status

Show the current status of the reflection system including auto-reflection state, memory files, and recent commits.

---

## What To Check

1. Read `.project/state/reflect-enabled.json` for enabled status
2. Count entries in `.project/memory/LEARNINGS.md`
3. Check if PREFERENCES.md and CORRECTIONS.md exist
4. Show recent git commits with "reflect" in message

---

## Step 1: Check Auto-Reflection State

Read `.project/state/reflect-enabled.json`:

```json
{
  "enabled": true|false,
  "lastReflection": "ISO date string or null",
  "totalReflections": number
}
```

If file doesn't exist, report as "Not configured (disabled by default)".

---

## Step 2: Count Memory Entries

For each memory file in `.project/memory/`:

**LEARNINGS.md:**
- Count entries by counting `### ` headings after "## Entries"
- Report: "X entries"

**PREFERENCES.md:**
- Check if file exists
- Count entries if present

**CORRECTIONS.md:**
- Check if file exists
- Count entries if present

---

## Step 3: Recent Reflect Commits

Run:
```bash
git log --oneline --grep="reflect" -n 5
```

Show last 5 commits related to reflection.

---

## Output Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 REFLECTION STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auto-Reflection: [ENABLED | DISABLED | NOT CONFIGURED]
Last Reflection: [date or "Never"]
Total Auto-Reflections: [count]

---

Memory Files (.project/memory/):

  LEARNINGS.md      [X entries | Not created]
  PREFERENCES.md    [X entries | Not created]
  CORRECTIONS.md    [X entries | Not created]

---

Recent Reflect Commits:

  abc1234 reflect: capture session learnings (2 days ago)
  def5678 reflect(auto): 1 correction captured (5 days ago)
  [or "No reflection commits found"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands:
  /reflect-on   Enable automatic reflection
  /reflect-off  Disable automatic reflection
  /reflect      Manual reflection (analyze current session)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 REFLECTION STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auto-Reflection: ENABLED
Last Reflection: 2026-01-28
Total Auto-Reflections: 5

---

Memory Files (.project/memory/):

  LEARNINGS.md      12 entries
  PREFERENCES.md    3 entries
  CORRECTIONS.md    Not created

---

Recent Reflect Commits:

  a1b2c3d reflect: use Tailwind not styled-components (today)
  e4f5g6h reflect(auto): import ordering preference (2 days ago)
  i7j8k9l reflect: API error handling pattern (1 week ago)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands:
  /reflect-on   Enable automatic reflection
  /reflect-off  Disable automatic reflection
  /reflect      Manual reflection (analyze current session)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
