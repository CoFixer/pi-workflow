---
description: Disable automatic reflection at session end
argument-hint: (no arguments)
---

# Disable Auto-Reflection

Disable automatic analysis when sessions end.

---

## What This Does

1. Updates `.project/state/reflect-enabled.json`
2. Sets `enabled: false`
3. Session learnings will NOT be auto-captured

---

## Implementation

Update the state file while preserving history:

**Target file:** `.project/state/reflect-enabled.json`

Read existing file if it exists, then update:

```json
{
  "enabled": false,
  "lastReflection": "[preserved from existing]",
  "totalReflections": [preserved from existing]
}
```

If file doesn't exist, create with:

```json
{
  "enabled": false,
  "lastReflection": null,
  "totalReflections": 0
}
```

---

## Output

```
Auto-reflection DISABLED

Previous reflections are preserved in .project/memory/LEARNINGS.md

You can still manually reflect using: /reflect
To re-enable: /reflect-on
To check status: /reflect-status
```

---

## Notes

- Disabling does not delete existing learnings
- Manual `/reflect` command still works
- Re-enable anytime with `/reflect-on`
