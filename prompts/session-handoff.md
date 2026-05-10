---
description: Capture session learnings before context reset (handoff notes)
argument-hint: Optional - specific focus area (e.g., "API changes", "bug fixes")
---

# Session Handoff

Capture what you learned THIS SESSION before context compaction. This is NOT for generating docs from PRD (use `/project-doc-writer` for that).

## What This Command Does

| This Command (session-handoff) | project-doc-writer Skill |
|-------------------------------|--------------------------|
| Captures **session learnings** | Generates docs **from PRD** |
| Updates `.pi/docs/` | Updates `.pi-project/docs/` |
| Run **before context reset** | Run **when PRD changes** |
| Preserves **discoveries & fixes** | Creates **structured documentation** |

---

## Quick Checklist

Before context reset, capture:

### 1. What You Discovered

- [ ] New patterns or architecture insights
- [ ] Business rules clarified during work
- [ ] Integration points between systems
- [ ] Performance or security findings

### 2. What You Fixed

- [ ] Bugs and their root causes
- [ ] Error messages and solutions
- [ ] Workarounds (temporary or permanent)

### 3. What Changed

- [ ] New/modified API endpoints
- [ ] Database schema changes
- [ ] New entities or relationships

### 4. Handoff Notes

- [ ] Current work in progress (file:line)
- [ ] Uncommitted changes needing attention
- [ ] Next immediate steps
- [ ] Commands to run on restart

---

## Files to Update

Update these files in `.pi/docs/` (NOT `.pi-project/docs/`):

| File | What to Add |
|------|-------------|
| `TROUBLESHOOTING.md` | Bugs fixed, error solutions, debug tips |
| `BEST_PRACTICES.md` | New patterns, anti-patterns found |
| `PROJECT_KNOWLEDGE.md` | Architecture decisions, business rules |
| `PROJECT_API.md` | New endpoints, request/response changes |
| `PROJECT_DATABASE.md` | Schema changes, new entities |

---

## Example Session Capture

```markdown
## Session: 2024-01-15

### Discovered
- User entity needs `is_verified` flag for email verification flow
- Vote service has race condition when user votes rapidly

### Fixed
- Fixed N+1 query in idea listing (added eager loading)
- Resolved JWT refresh token not updating `last_login`

### Changed
- Added POST /api/auth/verify-email endpoint
- Added `verification_token` column to users table

### Handoff
- Working on: `backend/src/modules/auth/auth.service.ts:245`
- Next: Implement email verification flow
- Run on restart: `npm run migration:run`
```

---

## When to Use Each Command

| Scenario | Use |
|----------|-----|
| Context about to reset | `/session-handoff` |
| PRD was updated | `/project-doc-writer` |
| New feature from PRD | `/project-doc-writer` |
| Fixed a tricky bug | `/session-handoff` |
| Discovered a pattern | `/session-handoff` |
| Initial project setup | `/project-doc-writer` |

---

## Focus Area: $ARGUMENTS
