---
description: Enable automatic reflection at session end
argument-hint: (no arguments)
---

# Enable Auto-Reflection

Enable automatic analysis and learning capture when sessions end.

---

## What This Does

1. Creates/updates `.pi-project/state/reflect-enabled.json`
2. Sets `enabled: true`
3. Future sessions will auto-capture HIGH confidence learnings on Stop

---

## Implementation

Create the state directory if needed and write the enabled state:

**Target file:** `.pi-project/state/reflect-enabled.json`

```json
{
  "enabled": true,
  "lastReflection": null,
  "totalReflections": 0
}
```

If the file already exists, preserve `lastReflection` and `totalReflections` values while setting `enabled: true`.

---

## Output

```
Auto-reflection ENABLED

What this means:
- Session learnings will be automatically captured on Stop
- Only HIGH confidence learnings are auto-applied
- Changes are committed to git automatically
- Learnings saved to .pi-project/memory/LEARNINGS.md

To disable: /reflect-off
To check status: /reflect-status
To manually reflect: /reflect
```

---

## Notes

- Auto-reflection only captures HIGH confidence corrections (explicit user corrections)
- MEDIUM and LOW confidence learnings require manual `/reflect` command
- All changes are version-controlled in git
- Use `SKIP_AUTO_REFLECT=1` environment variable to temporarily skip
