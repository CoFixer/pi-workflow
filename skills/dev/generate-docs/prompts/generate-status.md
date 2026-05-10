# Status File Generation Rules

Generate and update status files based on project folder scans.

---

## Template Locations

| Status Type | Template Path |
|-------------|---------------|
| API Implementation | `.pi/base/templates/claude-project/status/backend/API_IMPLEMENTATION_STATUS.template.md` |
| Screen Implementation | `.pi/base/templates/claude-project/status/frontend/SCREEN_IMPLEMENTATION_STATUS.template.md` |
| API Integration | `.pi/base/templates/claude-project/status/frontend/API_INTEGRATION_STATUS.template.md` |
| E2E QA Status | `.pi/base/templates/claude-project/status/frontend/E2E_QA_STATUS.template.md` |

---

## Status Determination Logic

### For API Endpoints (Backend)

| Condition | Status |
|-----------|--------|
| No controller method | Pending |
| Controller exists, no service | In Progress |
| Controller + service, no test | In Progress |
| Controller + service + E2E test | Complete |

### For Screens (Frontend)

| Condition | Status |
|-----------|--------|
| Expected but no file | Pending |
| File exists, missing components | In Progress |
| File complete, no E2E test | In Progress |
| File complete + E2E test | Complete |

### For API Integration (Frontend)

| Condition | Status |
|-----------|--------|
| Screen exists, no API calls | Pending |
| Service call exists, not wired to UI | In Progress |
| Service call wired + working | Complete |

---

## Output Format

### API_IMPLEMENTATION_STATUS.md

```markdown
## [Module] APIs

> **File:** `backend/src/modules/[module]/[module].controller.ts`

| Endpoint | Method | Status | Auth | Notes |
|----------|--------|--------|------|-------|
| `/[path]` | GET | Complete | Public | Description |
| `/[path]` | POST | In Progress | JWT | Missing E2E test |
```

### SCREEN_IMPLEMENTATION_STATUS.md

```markdown
## [Feature Area] Screens

| Screen | Route | Status | Components | Notes |
|--------|-------|--------|------------|-------|
| Login | `/login` | Complete | Form, Button | Has E2E |
| Dashboard | `/dashboard` | In Progress | Missing chart |
```

### API_INTEGRATION_STATUS.md

```markdown
## [Feature Area]

| Screen | Route | API Endpoint | Status | Service Method |
|--------|-------|--------------|--------|----------------|
| Login | `/login` | `POST /auth/login` | Complete | loginThunk (Redux) |
| My Ideas | `/dashboard/my-ideas` | `GET /ideas/my/ideas` | Pending | - |
```

---

## Update Strategy

### Merge with Existing

When updating existing status files:

1. **Preserve manual notes** - Keep any human-added notes in the Notes column
2. **Update status only** - Change status based on new scan
3. **Add new rows** - Append newly discovered items
4. **Mark removed items** - If endpoint/screen removed, mark as "Removed" don't delete

### Progress Calculation

At top of each status file, include:

```markdown
**Progress:** X/Y Complete (Z%)
**Last Scanned:** YYYY-MM-DD
```

---

## Cross-Reference Sources

| Status File | Cross-Reference With |
|-------------|---------------------|
| API_IMPLEMENTATION_STATUS | PROJECT_API.md (expected endpoints) |
| SCREEN_IMPLEMENTATION_STATUS | PROJECT_KNOWLEDGE.md (expected pages) |
| API_INTEGRATION_STATUS | API_IMPLEMENTATION_STATUS (available endpoints) |
| E2E_TEST_STATUS | All screens + endpoints |

---

## Warnings to Generate

After generation, report:

- **Missing from PRD**: Items found in code but not documented
- **Not implemented**: Items in PRD but not found in code
- **Test gaps**: Items without E2E test coverage
- **Stale items**: Items marked complete but code changed
