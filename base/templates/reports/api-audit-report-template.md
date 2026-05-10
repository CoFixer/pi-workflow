# API Audit Report Template

> This template is loaded by the `api-integration-agent` during Phase 3 (Report Generation).
> Contains the standard report format and parameter checklist template.
>
> **Source**: Extracted from `agents/api-integration-agent.md` for context window optimization.

---

## Audit Summary Report

```markdown
# API Integration Audit Report

**Generated:** YYYY-MM-DD
**Project:** {project-name}
**Frontend Apps:** {list all detected frontend applications}

## Executive Summary

| Metric | Value |
|--------|-------|
| Backend Endpoints | X |
| Frontend Integrations | Y |
| Coverage | Z% |
| Gaps Identified | N |

## Coverage by Module

| Module | Backend Endpoints | Frontend Integrated | Coverage | Status |
|--------|-------------------|---------------------|----------|--------|
| {Module1} | X | X | 100% | Complete |
| {Module2} | Y | Z | XX% | Gaps Found |
| {Module3} | N | M | XX% | Gaps Found |
| ... | ... | ... | ... | ... |

## Critical Gaps

### Missing Backend APIs
| Frontend Feature | Expected Endpoint | Priority |
|-----------------|-------------------|----------|
| {Feature description} | {HTTP method} /{entity}/{path} | {High/Medium/Low} |
| (none found) | - | - |

### Missing Frontend Integrations
| Backend Endpoint | Recommended Consumer | Priority |
|-----------------|---------------------|----------|
| {HTTP method} /{entity}/:id/{action} | {frontend-app} | {High/Medium/Low} |
| ... | ... | ... |

### Parameter Gaps
| Endpoint | Missing | Impact |
|----------|---------|--------|
| GET /{entities} | {missing params} | {High/Medium/Low} |
| ... | ... | ... |

## Detailed Findings

### {Module} Module

**Backend Endpoints:**
- GET /{entities} - List {entities} with filters
- GET /{entities}/featured - Featured {entities}
- GET /{entities}/:id - {Entity} details
- GET /{entities}/:id/{sub-resource} - Related {sub-resources}
- POST /{entities} - Create {entity}
- PATCH /{entities}/:id - Update {entity}
- POST /{entities}/:id/{action} - Perform {action} on {entity}
- DELETE /{entities}/:id - Delete {entity}

**Frontend Integration Status:**

| Endpoint | {frontend-app-1} | {frontend-app-2} | Parameters Complete |
|----------|------------------|------------------|---------------------|
| GET /{entities} | Yes | No | Missing: {params} |
| GET /{entities}/featured | Yes | No | Complete |
| GET /{entities}/:id | Yes | Yes | Complete |
| POST /{entities} | No | Yes | Complete |
| PATCH /{entities}/:id | No | Yes | Complete |
| POST /{entities}/:id/{action} | No | No | Not Integrated |
| DELETE /{entities}/:id | No | Yes | Complete |

### Action Items

| Priority | Task | Module | Complexity |
|----------|------|--------|------------|
| High | Integrate {action} endpoint in {frontend-app} | {Module} | {Low/Medium/High} |
| Medium | Add {missing params} to {entities} filters | {Module} | {Low/Medium/High} |
| ... | ... | ... | ... |

## Recommendations

1. **Immediate:** {High priority actions based on audit findings}
2. **Short-term:** {Medium priority improvements}
3. **Medium-term:** {Lower priority enhancements}
```

---

## Parameter Checklist Template

```markdown
## Parameter Completeness Checklist: {Endpoint}

### Pagination
- [ ] Frontend passes `page` parameter
- [ ] Frontend passes `limit` parameter
- [ ] Backend DTO accepts pagination params
- [ ] Response includes `total`, `totalPages`
- [ ] Frontend handles paginated response
- [ ] "Load More" / infinite scroll works

### Search
- [ ] Frontend has search input
- [ ] Search value passed to API
- [ ] Backend implements search logic
- [ ] Search debounced (300ms+)
- [ ] Empty search handled

### Filters
- [ ] Filter UI matches backend DTO fields
- [ ] Filters passed as query params
- [ ] Multiple filters can combine
- [ ] Filter reset works
- [ ] URL reflects filter state

### Sorting
- [ ] Sort dropdown/buttons exist
- [ ] `sortBy` passed to API
- [ ] `sortOrder` passed to API
- [ ] Default sort specified
- [ ] UI reflects current sort
```

---

## Phase 2.5 Findings Report Template

```markdown
## Phase 2.5 Findings: Runtime Safety & API Validation

### Response Shape Validation
| Endpoint | Backend Type | Frontend Type | Mismatch | Auto-Fix |
|----------|-------------|---------------|----------|----------|

### Runtime TypeError Risks
| File | Line | Unsafe Operation | Risk Level | Fix | Auto-Fix |
|------|------|-----------------|------------|-----|----------|

### 500 Error Vulnerabilities
| Endpoint | Missing Handling | Current Behavior | Should Return | Auto-Fix |
|----------|-----------------|------------------|---------------|----------|

### End-to-End Integration Status
| Page | API Calls | Loading | Error | Empty | Overall |
|------|-----------|---------|-------|-------|---------|

### Auto-Fix Action Plan
- **Frontend fixes** (frontend-developer): X issues
- **Backend fixes** (backend-developer): Y issues
- **Type fixes** (auto-error-resolver): Z issues
- **Manual review**: N issues flagged
```
