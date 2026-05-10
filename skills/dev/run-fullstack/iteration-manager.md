---
name: iteration-manager
description: Manages iteration cycles across the fullstack pipeline
---

# Iteration Manager Skill

Manages iteration cycles across the fullstack pipeline, enabling continuous improvement of all phases.

## Overview

This skill transforms the fullstack pipeline from a "build once" tool to a **continuous improvement pipeline** by adding iteration awareness to all 10 phases.

## Concepts

### Iteration Cycle

An iteration represents one complete pass through the pipeline phases. Each iteration can:
- Improve specific phases from previous iterations
- Add new features identified in updated PRD
- Fix issues found during QA or production use

### Phase Versioning

Each phase tracks its own iteration history:
- `frontend v1` → `frontend v2` → `frontend v3`
- Iterations are additive, not destructive
- Previous iteration artifacts are preserved

### Cascade Updates

When a phase is re-iterated, downstream phases are marked pending:
- Iterate `database` → `backend`, `dashboard`, `integrate`, `test`, `qa`, `ship` become pending
- Iterate `frontend` → `dashboard`, `integrate`, `test`, `qa`, `ship` become pending
- Iterate `backend` → `dashboard`, `integrate`, `test`, `qa`, `ship` become pending

---

## Commands

### --new-iteration

Start a new iteration cycle.

**Execution Steps:**

1. **Read Status File**
   ```
   Read .pi-project/status/{project}/PIPELINE_STATUS.md
   Parse current iteration number
   ```

2. **Increment Iteration**
   ```
   new_iteration = current_iteration + 1
   ```

3. **Ask User**
   Use **AskUserQuestion**:
   ```
   Question: "Starting Iteration {N}. Which phases need improvement?"
   Header: "Iterate Phases"
   Options:
     - "All phases" - Re-run entire pipeline
     - "Frontend + downstream" - frontend, integrate, test, qa, ship
     - "Backend + downstream" - database, backend, integrate, test, qa, ship
     - "QA only" - test, qa, ship
   MultiSelect: false
   ```

4. **Update Status File**
   - Add new iteration row to each selected phase
   - Mark selected phases as `:clipboard:` (Pending)
   - Mark non-selected phases as `:fast_forward:` (Carried forward)
   - Update "Active Iteration" in Current State

5. **Create Iteration History Entry**
   ```markdown
   ### Iteration {N}
   - **Started**: {DATE}
   - **Target**: {ENVIRONMENT}
   - **Goal**: {USER_INPUT or "Improvement cycle"}
   - **Phases**: {SELECTED_PHASES}
   ```

6. **Output**
   ```
   Iteration {N} started.

   Phases to run:
   - frontend (pending)
   - integrate (pending)
   - test (pending)
   - qa (pending)
   - ship (pending)

   Phases carried forward:
   - init (from iteration 1)
   - prd (from iteration 1)
   - database (from iteration 1)
   - backend (from iteration 1)

   Run: /fullstack {project} --run
   ```

---

### --iterate <phase>

Re-run a specific phase in a new iteration.

**Execution Steps:**

1. **Validate Phase**
   ```
   Valid phases: init, prd, frontend, database, backend, integrate, test, qa, ship
   ```

2. **Check Prerequisites**
   - Phase must have at least one completed iteration
   - If not: "Cannot iterate {phase}: no previous iteration exists. Run --run first."

3. **Determine Cascade**
   ```
   Phase Cascade Map:
   - init: [prd, frontend, database, backend, integrate, test, qa, ship]
   - prd: [frontend, database, backend, integrate, test, qa, ship]
   - frontend: [integrate, test, qa, ship]
   - database: [backend, integrate, test, qa, ship]
   - backend: [integrate, test, qa, ship]
   - integrate: [test, qa, ship]
   - test: [qa, ship]
   - qa: [ship]
   - ship: []
   ```

4. **Update Status File**
   - Create new iteration row for target phase (`:construction:` In Progress)
   - Create new iteration row for cascade phases (`:clipboard:` Pending)
   - Increment "Active Iteration" if this creates the highest iteration

5. **Load Phase Skill**
   ```
   Look up phase in tier map:
   - init → .pi/base/skills/dev/run-fullstack/project-init.md
   - prd → .pi/nestjs/skills/convert-prd-to-knowledge.md
   - frontend → (user choice skill)
   - database → .pi/nestjs/skills/database-schema-designer.md
   - backend → (composite)
   - integrate → .pi/react/guides/api-integration.md
   - test → .pi/{stack}/skills/e2e-test-generator.md
   - qa → .pi/react/skills/design-qa-patterns.md
   - ship → .pi/base/skills/dev/run-fullstack/deployment.md
   ```

6. **Execute with Iteration Context**
   Pass to skill:
   ```
   iteration: {N}
   previous_iteration: {N-1}
   previous_output: {from status file}
   mode: "iterate"  # vs "initial"
   ```

7. **Update Status on Completion**
   - Success: `:white_check_mark:`, update Output column, add to Execution Log
   - Failure: `:x:`, add error to Notes, add to Execution Log

---

### --iterate all

Re-run all phases in a new iteration.

**Execution Steps:**

1. Same as `--new-iteration` with "All phases" selected
2. Execute phases in order: init → prd → frontend → database → backend → integrate → test → qa → ship

---

### --sync-prd

Compare all phases against current PRD to identify improvements.

**Execution Steps:**

1. **Read PRD**
   ```
   Read .pi-project/prd/prd.pdf (or prd.md)
   Extract:
   - User flows / screens
   - Data entities / fields
   - API endpoints
   - Business rules
   ```

2. **Read Current Implementation**
   ```
   Read .pi-project/docs/PROJECT_KNOWLEDGE.md
   Read .pi-project/docs/PROJECT_DATABASE.md
   Read .pi-project/docs/PROJECT_API.md
   Read .pi-project/docs/PROJECT_API_INTEGRATION.md
   ```

3. **Compare Each Phase**

   **prd → frontend**
   - PRD screens vs implemented screens
   - Missing screens
   - Extra screens (not in PRD)
   - Screens with different flows

   **prd → database**
   - PRD entities vs implemented entities
   - Missing columns/fields
   - Missing relationships
   - Schema mismatches

   **prd → backend**
   - PRD endpoints vs implemented endpoints
   - Missing endpoints
   - Endpoints with different signatures
   - Missing business rules

   **prd → integrate**
   - Required integrations vs implemented
   - Disconnected features

4. **Generate Recommendations**
   Create `.pi-project/status/{project}/IMPROVEMENT_RECOMMENDATIONS.md`:

   ```markdown
   # Improvement Recommendations - {project}

   Generated: {DATE}
   PRD Version: {VERSION}
   Current Iteration: {N}

   ## Summary

   | Phase | Alignment | Issues Found | Priority |
   |-------|-----------|--------------|----------|
   | frontend | 85% | 3 | High |
   | database | 92% | 2 | Medium |
   | backend | 78% | 5 | High |
   | integrate | 90% | 1 | Low |

   ## Frontend Issues

   | Issue | PRD Reference | Current State | Recommended Action |
   |-------|---------------|---------------|-------------------|
   | Missing metrics dashboard | Section 4.2 | Not implemented | Add in iteration 2 |

   ## Database Issues
   ...

   ## Backend Issues
   ...

   ## Suggested Iteration Plan

   ### Iteration {N+1} (Recommended)
   - Phase: frontend - Add metrics dashboard
   - Phase: database - Add analytics tables
   - Phase: backend - Add bulk import endpoints

   ### Iteration {N+2} (Future)
   - Phase: backend - Performance optimization
   ```

5. **Ask User**
   Use **AskUserQuestion**:
   ```
   Question: "Found {X} improvement opportunities. How would you like to proceed?"
   Header: "PRD Sync"
   Options:
     - "Start iteration now" - Create new iteration with recommendations
     - "Save for later" - Save recommendations file only
     - "Review details" - Show full comparison
   ```

---

### --compare <iter1> <iter2>

Compare two iterations.

**Execution Steps:**

1. **Read Both Iterations**
   Parse status file for iteration {iter1} and {iter2}

2. **Generate Diff Report**
   ```markdown
   # Iteration Comparison: {iter1} vs {iter2}

   ## Overview

   | Metric | Iteration {iter1} | Iteration {iter2} | Change |
   |--------|-------------------|-------------------|--------|
   | Screens | 12 | 15 | +3 |
   | Entities | 8 | 10 | +2 |
   | Endpoints | 24 | 30 | +6 |
   | E2E Tests | 45 | 52 | +7 |
   | QA Pass Rate | 88% | 94% | +6% |

   ## Phase Changes

   ### frontend
   - Added: MetricsDashboard, ReportsPage, SettingsPage
   - Modified: Navigation, UserProfile
   - Removed: (none)

   ### database
   - Added: analytics_events, user_metrics
   - Modified: users (added preferences column)
   - Migrations: 002-add-analytics, 003-user-preferences

   ### backend
   - Added: /metrics/*, /reports/*, /bulk/*
   - Modified: /users/:id (added preferences)
   - Deprecated: (none)

   ## Test Coverage

   | Category | Iter {iter1} | Iter {iter2} |
   |----------|--------------|--------------|
   | Auth flows | 100% | 100% |
   | CRUD operations | 85% | 92% |
   | New features | N/A | 78% |
   ```

3. **Output**
   Display comparison and save to `.pi-project/status/{project}/COMPARISON_{iter1}_vs_{iter2}.md`

---

### --rollback <iteration>

Rollback to a previous iteration state.

**Execution Steps:**

1. **Confirm Action**
   Use **AskUserQuestion**:
   ```
   Question: "Rollback to iteration {N}? This will mark all later iterations as superseded."
   Header: "Rollback"
   Options:
     - "Proceed with rollback"
     - "Cancel"
   ```

2. **Update Status File**
   - Set "Active Iteration" to {N}
   - Mark iterations > {N} as `:rewind:` (Rolled back)
   - Do NOT delete iteration history

3. **Database Rollback**
   If database phase affected:
   ```bash
   npm run migration:revert -- --to {iteration_N_migration}
   ```

4. **Output**
   ```
   Rolled back to iteration {N}.

   Active phases are now:
   - frontend v{N}
   - database v{N}
   - backend v{N}
   ...

   To restore later iterations, run:
   /fullstack {project} --new-iteration
   ```

---

## Iteration Behavior by Phase

Each phase skill should check for iteration context and behave accordingly:

### init
- **Iteration 1**: Full project setup
- **Iteration N**: Skip (one-time only)

### prd
- **Iteration 1**: Convert PRD to PROJECT_KNOWLEDGE
- **Iteration N**: Update PROJECT_KNOWLEDGE with PRD changes, mark what's new

### frontend
- **Iteration 1**: Full screen implementation
- **Iteration N**:
  - Read previous screens from status
  - Implement only new/changed screens
  - Update existing components minimally

### database
- **Iteration 1**: Full schema design + initial migration
- **Iteration N**:
  - Read previous schema
  - Generate incremental migration (never destructive)
  - Name: `{iteration_number}-{description}`

### backend
- **Iteration 1**: Full API implementation
- **Iteration N**:
  - Add new endpoints
  - Modify existing with backward compatibility
  - Use API versioning for breaking changes

### integrate
- **Iteration 1**: Connect all frontend to backend
- **Iteration N**:
  - Update only changed integrations
  - Verify existing integrations still work

### test
- **Iteration 1**: Generate all E2E tests
- **Iteration N**:
  - Keep existing passing tests
  - Add tests for new features
  - Update tests for modified features

### qa
- **Iteration 1**: Full QA pass
- **Iteration N**:
  - Incremental QA on changed components
  - Regression tests on core flows
  - Compare QA scores vs previous

### ship
- **Iteration 1**: Deploy to dev
- **Iteration 2**: Deploy to staging
- **Iteration 3+**: Deploy to production (with approval)

---

## Environment Progression

| Iteration Range | Default Environment |
|-----------------|---------------------|
| 1-2 | dev |
| 3-4 | staging |
| 5+ | production |

Override with: `/fullstack project --iterate ship --env production`

---

## Best Practices

1. **Complete iterations** - Finish all pending phases before starting new iteration
2. **Review recommendations** - Run `--sync-prd` before starting new iteration
3. **Incremental changes** - Iterate specific phases, not all at once
4. **Test thoroughly** - Higher iteration = more rigorous QA requirements
5. **Document goals** - Each iteration should have clear improvement goals
