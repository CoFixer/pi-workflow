# Fullstack Pipeline Status - {PROJECT_NAME}

## Progress

| Phase | Skill | Tier | Status | Prerequisites | Output | Notes |
|-------|-------|------|--------|---------------|--------|-------|
| scan | (inline) | base | :clipboard: | - | - | - |
| consolidate | (inline) | base | :clipboard: | scan | - | - |
| contracts | (inline) | base | :clipboard: | consolidate | - | - |
| plan | (inline) | base | :clipboard: | contracts | - | - |
| init | project-init.md | base | :clipboard: | - | - | - |
| prd | convert-prd-to-knowledge.md | $BACKEND | :clipboard: | init | - | - |
| database | database-schema-designer.md | $BACKEND | :clipboard: | prd | - | - |
| backend | (composite) | $BACKEND | :clipboard: | database | - | - |
| frontend | (user choice) | $FRONTEND | :clipboard: | prd | - | - |
| integrate | api-integration.md | $FRONTEND | :clipboard: | backend, frontend | - | - |
| test | e2e-test-generator.md | $STACK | :clipboard: | integrate | - | - |
| qa | design-qa-patterns.md | $FRONTEND | :clipboard: | test | - | - |
| validate | api-integration-agent | $FRONTEND | :clipboard: | integrate | - | - |
| audit | (inline) | base | :clipboard: | qa, validate | - | - |
| ship | deployment.md | base | :clipboard: | audit | - | - |

## Contracts

| Contract | Path | Status | Hash |
|----------|------|--------|------|
| API | - | :clipboard: | - |
| DB Schema | - | :clipboard: | - |
| Frontend Data | - | :clipboard: | - |

## Snapshot

| Dimension | Key | Stored Value | Captured At |
|-----------|-----|-------------|-------------|
| .claude submodule | claude_submodule_hash | - | never |
| .project/docs | docs_composite_hash | - | never |
| .project/memory | memory_composite_hash | - | never |
| Contract: API | contract_api_hash | - | never |
| Contract: DB Schema | contract_db_hash | - | never |
| Contract: Frontend Data | contract_fe_hash | - | never |

### Drift Log

| Date | Dimensions Changed | Action Taken | User Selection |
|------|-------------------|-------------|----------------|

## Skill Paths by Tier

| Tier | Base Path | Description |
|------|-----------|-------------|
| base | `.pi/base/skills/dev/run-fullstack/` | Generic orchestration (init, ship) |
| $BACKEND | `.pi/$BACKEND/skills/` | Backend skills (prd, database, backend) |
| $FRONTEND | `.pi/$FRONTEND/skills/` + `guides/` | Frontend skills (frontend, dashboard, integrate, qa) |
| $STACK | `.pi/{context}/skills/` | Context-dependent (backend or frontend) |

## Execution Log

| Date | Phase | Duration | Result | Notes |
|------|-------|----------|--------|-------|

## Configuration

```yaml
project: {PROJECT_NAME}
created: {DATE}
last_run: null
tech_stack:
  backend: null          # nestjs
  frontends: []          # [react] | [react-native] | [react, react-native]
  dashboards: []         # [admin] | [coach] | [admin, coach]
has_html_prototypes: false
has_prd: false
```

## Tech Stack Resolution

The `$BACKEND`, `$FRONTEND`, and `$STACK` variables are resolved from the `tech_stack` configuration above:

- `$BACKEND` = tech_stack.backend (e.g., "nestjs")
- `$FRONTEND` = tech_stack.frontends[0] (primary frontend, e.g., "react")
- `$STACK` = Resolved based on phase context (backend phases use $BACKEND, frontend phases use $FRONTEND)

**Supported Tech Stacks:**

| Category | Options | Submodule URL |
|----------|---------|---------------|
| Backend | nestjs | github.com/CoFixer/claude-{backend} |
| Frontend | react, react-native | github.com/CoFixer/claude-{frontend} |
