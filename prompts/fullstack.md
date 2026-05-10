---
description: Multi-agent fullstack pipeline orchestrator — dispatches phases to specialized agents (v6)
argument-hint: "<project> [--run | --loop | --phase <name> | --reset <phase> | --run-all] [--yes] [--skip-spec] [--prd <path>] [--path <dir>] [--max-generations <n>]"
---

# Fullstack Pipeline Orchestrator (v6)

A true multi-agent orchestrator that runs the full development lifecycle from project setup to deployment.
Each phase dispatches to a specialized agent team (documentation-architect, backend-developer,
frontend-developer, quality-lead) via the Task() tool. Phases init and ship execute inline.

**Orchestration Model:**
```
/fullstack (coordinator) → pre-phase plan → Task(agent) → agent reads skill → PHASE_RESULT → status update
```

**History:** v1-v5 were sequential skill-chain executors (single context). v6 introduces true agent dispatch
while preserving all existing CLI behavior, skill paths, and PIPELINE_STATUS.md format.
See `workflow_v2/docs/FULLSTACK_ORCHESTRATOR_HISTORY.md` for architectural decisions.

## Quick Start

```bash
# Show pipeline status
/fullstack my-project

# Run next pending phase (asks Gate 2 confirmation before dispatch)
/fullstack my-project --run

# Run specific phase (asks Gate 2 confirmation before dispatch)
/fullstack my-project --phase backend

# Run all remaining phases (asks Gate 1 confirmation before starting)
/fullstack my-project --run-all

# Run all phases without any confirmation prompts (automation mode)
/fullstack my-project --run-all --yes

# INFINITE LOOP MODE - keep improving until quality converges
/fullstack my-project --loop
/fullstack my-project --loop --max-generations 10

# Skip specification phase (already have clear PRD)
/fullstack my-project --run-all --skip-spec

# Reset a phase to pending (asks Gate 3 confirmation — shows dependents)
/fullstack my-project --reset database

# Reset without confirmation prompt
/fullstack my-project --reset database --yes

# BUILD IN A DIFFERENT FOLDER (remote project)
# Uses .pi/ from current project, outputs to target path
/fullstack tirebank --path /Users/me/projects/tirebank --prd .pi-project/prd/ABCTire_PRD.md --run-all --skip-spec

# After first run, target project has its own .pi/ — can run natively:
# cd /Users/me/projects/tirebank && claude
# /fullstack tirebank --loop
```

---

## Pipeline Phases

| # | Phase | Skill | Tier | Prerequisites | Output |
|---|-------|-------|------|---------------|--------|
| 1 | init | project-init.md | base | - | .pi-project/, .pi/ |
| 2 | prd | convert-prd-to-knowledge.md | nestjs | init | PROJECT_KNOWLEDGE.md |
| 3 | database | database-schema-designer.md | nestjs | prd | Entities, migrations |
| 4 | backend | (composite skills) | nestjs | database | API endpoints |
| 5 | frontend | (user choice: design-scratch / figma / html) | react | prd | React screens |
| 6 | integrate | api-integration.md | react | backend, frontend | Connected UI |
| 7 | test | e2e-test-generator.md | stack | integrate | E2E test specs |
| 8 | qa | design-qa.md + Ralph | react | test | 95% pass rate |
| 9 | ship | deployment.md | base | qa | Live deployment |

### Tier Locations

| Tier | Path | Description |
|------|------|-------------|
| base | `.pi/base/skills/fullstack/` | Generic orchestration skills |
| nestjs | `.pi/nestjs/skills/` | NestJS backend skills |
| django | `.pi/django/skills/` | Django backend skills |
| react | `.pi/react/skills/` | React Web frontend skills |
| react-native | `.pi/react-native/skills/` | React Native mobile skills |
| stack | Auto-detected from tech_stack config | Framework-specific (resolves to $BACKEND or $FRONTEND) |

**Note:** The tier is determined by the `tech_stack` configuration in PIPELINE_STATUS.md. For mobile projects, `react-native` is used instead of `react` for frontend phases.

---

## Token Budgets (Per Agent Dispatch)

Each Task() dispatch has a target prompt size. Stay within these budgets to prevent "Prompt is too long" errors.

| Phase     | Agent Prompt | Skill File | Prior Context       | **Target Total** |
|-----------|-------------|------------|---------------------|-----------------|
| prd       | ~800 tok    | ~4KB       | none                | **≤ 3,000 tok** |
| database  | ~800 tok    | ~4KB       | 1 compact summary   | **≤ 3,500 tok** |
| backend   | ~1,000 tok  | ~6KB       | 1 compact summary   | **≤ 4,000 tok** |
| frontend  | ~1,000 tok  | ~6KB       | 1 compact summary   | **≤ 4,000 tok** |
| integrate | ~1,000 tok  | ~4KB       | 2 compact summaries | **≤ 4,500 tok** |
| test      | ~800 tok    | ~4KB       | 1 compact summary   | **≤ 3,500 tok** |
| qa        | ~1,000 tok  | ~6KB       | 1 compact summary   | **≤ 4,500 tok** |

**Compact summary = PHASE_RESULT counts + summary field only (≤ 300 tokens per prior phase).**
**Never embed full PROJECT_* doc contents in agent prompts — pass file paths instead.**

---

## Execution Instructions

### Step 1: Parse Arguments

```
project = $1 (e.g., "my-project")
action  = --run | --loop | --phase <name> | --reset <name> | --run-all | (none = status)
flags   = --yes              ← skip all confirmation gates (for automation)
max_generations = --max-generations <n> (default: 50, used with --loop)
skip_spec = --skip-spec flag (skip Phase 0 specification)
prd_path = --prd <path> (existing PRD file, skips PRD generation in Phase 2)
quality_threshold = --quality <n> (default: 0.95, convergence target for --loop)
target_path = --path <dir> (target project directory, default: current working directory)
```

If no project is provided, ask using **AskUserQuestion**:

```
Question: "What is the project name?"
Header: "Project Name"
Options: (free text — no preset options, user types the name)
```

**`--yes` flag:** When present, all confirmation gates (Gate 1, Gate 2, Gate 3) are skipped automatically. Useful for CI/automation contexts. Example: `/fullstack my-app --run-all --yes`

### Step 1.5: Resolve Target Project Directory

```
IF --path is provided:
  1. TARGET_DIR = resolve to absolute path (e.g., /Users/.../projects/tirebank)
  2. Verify TARGET_DIR exists → if not, mkdir -p TARGET_DIR
  3. ALL file operations below use TARGET_DIR as root (not cwd)
     - Status file:   TARGET_DIR/.pi-project/status/{project}/PIPELINE_STATUS.md
     - PRD:           TARGET_DIR/.pi-project/prd/
     - Skills/agents: still read from cwd's .pi/ (the source project)
     - Code output:   TARGET_DIR/backend/, TARGET_DIR/frontend/, etc.
  4. If --prd path is relative, resolve it from cwd (not TARGET_DIR)
ELSE:
  TARGET_DIR = cwd (current behavior, no change)
```

**Key principle:** `.pi/` (commands, skills, agents) is read from the **source project** (where you run the command). All generated output goes to **TARGET_DIR**.

#### Bootstrap .claude in Target Project (Phase 1)

During Phase 1 (init), if `--path` was used and TARGET_DIR has no `.pi/`:

```bash
cd TARGET_DIR
git init  # if not already a git repo
git submodule add -b dev https://github.com/potentialInc/claude-workflow.git .claude
git submodule update --init --recursive
```

This ensures the target project becomes self-sufficient — after the first run, it has its own `.claude` and can run `/fullstack` natively.

### Step 2: Locate or Create Status File

Status file path: `.pi-project/status/{project}/PIPELINE_STATUS.md`

**If status file doesn't exist:**
1. Copy template from `.pi/base/templates/PIPELINE_STATUS.template.md`
2. Replace `{PROJECT_NAME}` with actual project name
3. Set all phases to `Pending` status

### Step 2.5: Resolve and Validate Tech Stack

**CRITICAL**: Before executing any phase, validate that required submodules exist.

#### 2.5.1 Read Tech Stack from Configuration

Read the `tech_stack` section from PIPELINE_STATUS.md:

```yaml
tech_stack:
  backend: nestjs          # or django
  frontends: [react-native, react]  # one or more
  dashboards: [admin]      # optional
```

Set variables:
- `$BACKEND` = tech_stack.backend
- `$FRONTEND` = tech_stack.frontends[0] (primary)
- `$FRONTENDS` = tech_stack.frontends (array)

#### 2.5.2 Validate Required Submodules Exist

**For backend:**
```bash
if [ ! -d ".pi/$BACKEND" ]; then
  echo "ERROR: Missing backend submodule .pi/$BACKEND/"
  echo ""
  echo "This submodule is required for backend development. Install with:"
  echo ""
  echo "  cd .claude"
  echo "  git submodule add https://github.com/potentialInc/claude-$BACKEND.git $BACKEND"
  echo "  git submodule update --init --recursive"
  echo "  git add -A && git commit -m 'feat: Add claude-$BACKEND submodule'"
  echo "  git push"
  echo "  cd .."
  echo "  git add .claude && git commit -m 'chore: Update .claude submodule'"
  echo ""
  exit 1
fi
```

**For each frontend in $FRONTENDS:**
```bash
for frontend in "${FRONTENDS[@]}"; do
  if [ ! -d ".pi/$frontend" ]; then
    echo "ERROR: Missing frontend submodule .pi/$frontend/"
    echo ""
    echo "This submodule is required for frontend development. Install with:"
    echo ""
    echo "  cd .claude"
    echo "  git submodule add https://github.com/potentialInc/claude-$frontend.git $frontend"
    echo "  git submodule update --init --recursive"
    echo "  git add -A && git commit -m 'feat: Add claude-$frontend submodule'"
    echo "  git push"
    echo "  cd .."
    echo "  git add .claude && git commit -m 'chore: Update .claude submodule'"
    echo ""
    exit 1
  fi
done
```

**Common submodule URLs:**

| Framework | Submodule URL |
|-----------|---------------|
| nestjs | `https://github.com/potentialInc/claude-nestjs.git` |
| django | `https://github.com/potentialInc/claude-django.git` |
| react | `https://github.com/potentialInc/claude-react.git` |
| react-native | `https://github.com/potentialInc/claude-react-native.git` |

#### 2.5.3 Resolve Skill Paths

Based on phase tier, resolve the skill path:

| Phase Tier | Skill Base Path |
|------------|-----------------|
| base | `.pi/base/skills/fullstack/` |
| $BACKEND (nestjs/django) | `.pi/$BACKEND/skills/` |
| $FRONTEND (react/react-native) | `.pi/$FRONTEND/skills/` |
| stack | Determined by phase context |

### Step 3: Action Handler

#### Action: (none) - Show Status

Read the status file and display:

```
Fullstack Pipeline - {project}
==============================

Phase       | Status      | Output
------------|-------------|------------------
init        | Complete    | .pi-project/
prd         | Complete    | PROJECT_KNOWLEDGE.md
database    | In Progress | migrations/
backend     | Pending     | -
frontend    | Pending     | -
integrate   | Pending     | -
test        | Pending     | -
qa          | Pending     | -
ship        | Pending     | -

Next: database (run with --run)
```

#### Action: --run - Execute Next Pending Phase

1. Read status file
2. Find first phase where:
   - Status = `Pending` OR `Failed`
   - All prerequisites have Status = `Complete`
3. If no eligible phase found, report "Pipeline complete" or "Blocked"
4. **Gate 2 — Phase Confirmation** (skip if `--yes` flag present):

   Display the Phase Start format (from Phase Execution Display Format section) showing:
   the phase name, agent, skill path, and planned tasks. Then ask:

   ```
   AskUserQuestion(
     question="Execute Phase {N}/9: {phase_name}? Agent: {agent_name}",
     header="Confirm Phase",
     options=[
       "Yes, execute now (Recommended)",
       "No, skip for now",
       "Abort"
     ]
   )
   ```

   - "Yes": proceed to Step 4
   - "No, skip": return to prompt without marking phase as failed
   - "Abort": stop all execution

5. Execute the phase (see Step 4)
6. Evaluate the phase (see Step 5)
7. Report result

#### Action: --loop - Infinite Iteration Mode

See **Step 6: Infinite Loop Engine** below.

#### Action: --phase <name> - Execute Specific Phase

1. Validate phase name exists
2. Check prerequisites are complete
3. If prerequisites not met, show error with missing dependencies
4. **Gate 2 — Phase Confirmation** (skip if `--yes` flag present):

   Display the Phase Start format showing: the phase name, agent, skill path, and planned tasks. Then ask:

   ```
   AskUserQuestion(
     question="Execute Phase {N}/9: {phase_name}? Agent: {agent_name}",
     header="Confirm Phase",
     options=[
       "Yes, execute now (Recommended)",
       "No, skip for now",
       "Abort"
     ]
   )
   ```

   - "Yes": proceed to Step 4
   - "No, skip": return to prompt without marking phase as failed
   - "Abort": stop all execution

5. Execute the phase (see Step 4)

#### Action: --run-all - Execute All Remaining Phases

1. Collect all pending/failed eligible phases (prerequisites met)
2. **Gate 1 — Pipeline Confirmation** (skip if `--yes` flag present):

   Display a summary of what will execute, then ask:

   ```
   # Display first:
   Fullstack Pipeline — {project}
   ================================
   The following {N} phases will execute automatically:

     Phase {N}: {name}  →  {agent}
       Skill: {resolved_skill_path}
     ...

   Total: {N_agent_dispatches} agent dispatches + {N_direct} direct phases

   # Then ask:
   AskUserQuestion(
     question="Run {N} phases automatically? Agents will be dispatched without further confirmation.",
     header="Confirm --run-all",
     options=[
       "Yes, run all phases automatically (Recommended)",
       "No, I will run phases manually with --run"
     ]
   )
   ```

   - "Yes": proceed to the execution loop (no per-phase Gate 2 prompts inside the loop)
   - "No": abort, print `Use /fullstack {project} --run to execute phases one at a time.`

3. Loop while there are pending phases:
   - Run next eligible phase (no Gate 2 inside loop — Gate 1 already confirmed)
   - If phase fails, stop and report
   - If all phases complete, report success

#### Action: --reset <name> - Reset Phase to Pending

1. Identify the phase to reset
2. Find all dependent phases (phases whose prerequisites include the named phase)
3. **Gate 3 — Destructive Action Confirmation** (skip if `--yes` flag present):

   ```
   AskUserQuestion(
     question="Reset '{phase}' to Pending? This will clear its status, output notes, agent results, and change tracking checksum.",
     header="Confirm Reset",
     options=[
       "Yes, reset '{phase}' only",
       "Yes, reset '{phase}' and all dependent phases: {dependent_phase_list}",
       "No, cancel"
     ]
   )
   ```

   - "Yes, reset only": reset the named phase, leave dependents untouched
   - "Yes, reset + dependents": reset the named phase AND all listed dependent phases
   - "No, cancel": abort with no changes

4. For each phase being reset:
   - Set status to `Pending` (`:clipboard:`)
   - Clear the Notes column
   - Clear the Output column
   - Clear `change_tracking.skill_checksums.{phase}` in PIPELINE_STATUS.md
   - Clear the `Agent Results → {phase}` section (set back to `null`)

### Step 4: Execute a Phase

For each phase execution:

**4.0 Pre-Phase Change Detection**

Run the Change Detection Algorithm (see Section: Change Detection Algorithm).
Display results. If changes detected, prompt user before continuing (skip prompt if `--run-all` is active).

**4.1 Update Status to In Progress**

```
Set phase status = :construction: In Progress
Set phase Agent column = {agent_name for this phase}
```

**4.2 Display Pre-Phase Plan**

Display the Phase Start format (see Section: Phase Execution Display Format).
Show: phase number, agent, skill path, planned tasks, expected artifacts.

**4.3 Resolve Skill Path (Tier-Aware)**

Look up the skill path based on the phase-to-tier mapping. Use `$BACKEND` and `$FRONTEND` variables resolved from Step 2.5:

```
Phase → Tier → Skill Path (with resolved $BACKEND/$FRONTEND)
─────────────────────────────────────────────────────────────────
init      → base      → .pi/base/skills/fullstack/project-init.md
prd       → $BACKEND  → .pi/$BACKEND/skills/convert-prd-to-knowledge.md
database  → $BACKEND  → .pi/$BACKEND/skills/database-schema-designer.md
backend   → $BACKEND  → .pi/$BACKEND/guides/architecture-overview.md + services-and-repositories.md
frontend  → $FRONTEND → (multi-path - see "Frontend Phase: Multi-Path Selection")
                        ├─ design-scratch → /prd-to-design-prompts (command)
                        ├─ figma         → .pi/$FRONTEND/skills/*figma*.md
                        └─ html          → .pi/$FRONTEND/skills/*convert-html*.md
integrate → $FRONTEND → .pi/$FRONTEND/skills/api-integration.md (or guides/)
test      → $FRONTEND → .pi/$FRONTEND/skills/e2e-test-generator.md
qa        → $FRONTEND → .pi/$FRONTEND/skills/design-qa-patterns.md (+ /ralph for iteration)
ship      → base      → .pi/base/skills/fullstack/deployment.md
```

**Example resolution for `nestjs + react-native`:**
```
$BACKEND = nestjs
$FRONTEND = react-native

database → .pi/nestjs/skills/database-schema-designer.md
frontend → .pi/react-native/skills/frontend-dev-guidelines/resources/convert-html-to-react.md
test     → .pi/react-native/skills/frontend-dev-guidelines/resources/e2e-test-generator.md
```

**Validate skill path exists before proceeding.** If skill file not found, show the Missing Skill File error and abort.

**4.3.1 Ralph Loop (if applicable)**

After initial skill execution, run the phase's Ralph workflow for iterative improvement:

| Phase | Ralph Workflow | When to Run |
|-------|---------------|-------------|
| spec | `/ralph spec {project}` | If ambiguity > 0.2 |
| prd | `/ralph spec {project} --incremental` | If sections missing |
| design | `/ralph design-gen {project}` | If pages missing or QA fails |
| database | `/ralph database-qa {project}` | If schema issues found |
| backend | `/ralph backend-qa {project}` | If endpoints incomplete |
| backend | `/ralph backend-e2e {project}` | After endpoints done (Phase 5b: generate API tests) |
| frontend | `/ralph design-qa {project}` | After HTML-to-React conversion |
| integrate | `/ralph integration-qa {project}` | If APIs not connected |
| test | `/ralph frontend-e2e {project} --discover` | Phase 8a: generate frontend test cases |
| test | `/ralph frontend-e2e {project} --auto` | Phase 8a: implement test cases |
| test | `/ralph backend-e2e {project}` | Phase 8c: fix failing backend tests |
| test | `/ralph frontend-e2e {project} --incremental` | Phase 8c: fix failing frontend tests |
| qa | `/ralph design-qa + frontend-e2e + backend-e2e {project}` | Always (this IS the QA loop) |

Ralph runs are optional per phase in `--run` / `--run-all` mode but automatic in `--loop` mode.

**4.4 Dispatch or Execute Directly**

Based on the phase, either dispatch to a specialized agent via Task() or execute inline:

| Phase | Execution Mode | Agent | Notes |
|-------|---------------|-------|-------|
| init | **DIRECT** inline | (none) | Interactive setup, AskUserQuestion for tech stack |
| prd | Task() dispatch | `documentation-architect` | Uses Agent Dispatch Prompt for prd |
| database | Task() dispatch | `backend-developer` | Delegates to database-designer |
| backend | Task() dispatch | `backend-developer` | Composite skills referenced |
| frontend | Task() dispatch | `frontend-developer` | **Ask path BEFORE dispatch** (see Frontend Phase below) |
| integrate | Task() dispatch | `frontend-developer` | Includes api-integration-agent audit |
| test | Task() dispatch | `quality-lead` | E2E test generation |
| qa | Task() dispatch | `quality-lead` | gap-finder + gap-fixer + Ralph |
| ship | **DIRECT** inline | (none) | Infrastructure commands, bash sequences |

**For DIRECT phases:** Read the skill file from its resolved path and follow its instructions inline (existing behavior — no change).

**For Task() dispatch phases:** Use the prompt template from Section "Agent Dispatch Prompts". Pass the resolved skill path, tech stack variables, and PHASE_RESULT from prior phases.

**4.5 Process PHASE_RESULT**

After agent returns (or inline phase completes), process the result:

**On Success:**
```
Set phase status = :white_check_mark: Complete
Update Output column with files/metrics from PHASE_RESULT
Update Agent column with agent_name (or "direct")
Add to Execution Log: {date} | {phase} | {duration} | {agent} | ✓ | {PHASE_RESULT summary}
Update change_tracking checksums for this phase (see CD.5)
Display Phase Completion format
```

**On Failure:**
```
Set phase status = :x: Failed
Add error from PHASE_RESULT (or inline error) to Notes column
Add to Execution Log
Display Phase Failure format
In --run/--run-all: STOP execution (do not continue to next phase)
In --loop: mark for retry in next generation
```

**PHASE_RESULT not found (agent dispatch only):**
If the agent output does not contain a `PHASE_RESULT:` block, treat the phase as Failed with note: "Agent did not return PHASE_RESULT — retry phase or check agent output."

**4.6 Context Checkpoint (MANDATORY after every Task() dispatch)**

After extracting PHASE_RESULT from the agent output, immediately apply context hygiene:

```
1. Extract ONLY the PHASE_RESULT block from the agent's full output
2. Write the compact PHASE_RESULT to PIPELINE_STATUS.md → ## Agent Results → {phase}
3. DISCARD the full agent output — do not reference it again
4. For subsequent phases: read prior summaries from PIPELINE_STATUS.md using line-range reads,
   NOT from this conversation's context
5. If the Execution Log in PIPELINE_STATUS.md exceeds 20 entries, remove the oldest 10
   before appending the new entry
```

> **Why this matters:** The orchestrator runs in a single context across all 9 phases. Every
> Task() return value, every file read, every display block adds tokens. Without active
> cleanup, the orchestrator context overflows by phase 6–8. The checkpoint enforces that
> only compact metadata (not full agent output) survives into the next phase.

### PHASE_RESULT Compaction Schema

All agents dispatched by this orchestrator **MUST** return PHASE_RESULT in this compact format.
The full schema (with enforcement rules) is included in each agent's dispatch prompt.

```json
PHASE_RESULT: {
  "phase": "backend",
  "status": "complete | failed | partial",
  "summary": "Single sentence, max 200 chars describing what was done",
  "counts": {
    "files_created": 12,
    "endpoints_implemented": 34,
    "entities_created": 8,
    "tests_generated": 0,
    "gaps_found": 3
  },
  "top_issues": [
    "Max 3 items. Max 100 chars each. Only blockers or critical failures."
  ],
  "artifact_paths": [
    ".pi-project/status/{tier}/API_IMPLEMENTATION_STATUS.md"
  ],
  "next_phase_hints": "Max 300 chars. Only context the IMMEDIATELY next phase strictly needs."
}
```

**Size limit: ≤ 500 tokens total. Use `counts` instead of lists. Store all detail in `artifact_paths`.**

---

## Frontend Phase: Multi-Path Selection

The frontend phase supports three implementation paths.

> **IMPORTANT (v6 orchestration):** The path selection question (Step F1) MUST be asked in the
> orchestrator context BEFORE dispatching to frontend-developer via Task(). Agents running in
> subcontext cannot invoke AskUserQuestion with the outer user. Store the selected path in
> `PIPELINE_STATUS.md → phase_config.frontend_path` before dispatching.
>
> If `phase_config.frontend_path` is already set (from a prior run), skip Step F1 and dispatch
> directly using the stored path.

### Step F1: Present Options (orchestrator context only)

Use **AskUserQuestion** with:

```
Question: "How would you like to implement the frontend screens?"
Header: "Frontend Path"
Options:
  1. "Design from scratch" - Generate design prompts from PRD, create designs externally, then implement
  2. "Convert from Figma" - Implement from existing Figma designs using MCP tools
  3. "Convert from HTML" - Convert existing HTML/Tailwind templates to React
```

### Step F2: Execute Selected Path

#### Path A: Design from Scratch

1. Run `/prd-to-design-prompts {prd-path} --tool generic`
2. Update status: `frontend` | `Blocked` | `Awaiting external designs`
3. Report output location and next steps:
   - Prompts saved to `.pi-project/design-prompts/`
   - User should create designs using AI tools (Aura, v0, Gemini, etc.)
   - Re-run `/fullstack {project} --phase frontend` when designs are ready
4. **STOP** - User must create designs externally
5. On re-run: ask if designs are ready → proceed to Figma or HTML conversion

#### Path B: Convert from Figma

1. Ask for Figma URL(s) or use PROJECT_KNOWLEDGE.md figma links
2. Load skill: `.pi/react/skills/converters/figma-to-react-converter.md`
3. Execute per skill instructions
4. Update status on completion

#### Path C: Convert from HTML

1. Ask for HTML file path(s)
2. Load skill: `.pi/react/skills/convert-html-to-react.md`
3. Execute per skill instructions
4. Update status on completion

### Step F3: Status Updates

| Path | On Success Status | Notes |
|------|------------------|-------|
| Design from scratch (prompts) | Blocked | "Awaiting external designs - prompts at {path}" |
| Design from scratch (implement) | Complete | "Implemented from {source}" |
| Figma | Complete | "Converted from Figma" |
| HTML | Complete | "Converted from HTML templates" |

---

## Status File Format

```markdown
# Fullstack Pipeline Status - {PROJECT_NAME}

## Progress

| Phase | Skill | Tier | Status | Prerequisites | Output | Notes |
|-------|-------|------|--------|---------------|--------|-------|
| init | project-init.md | base | :clipboard: | - | - | - |
| prd | convert-prd-to-knowledge.md | nestjs | :clipboard: | init | - | - |
| database | database-schema-designer.md | nestjs | :clipboard: | prd | - | - |
| backend | (composite) | nestjs | :clipboard: | database | - | - |
| frontend | figma-to-react-converter.md | react | :clipboard: | prd | - | - |
| integrate | api-integration.md | react | :clipboard: | backend, frontend | - | - |
| test | e2e-test-generator.md | stack | :clipboard: | integrate | - | - |
| qa | design-qa.md | react | :clipboard: | test | - | - |
| ship | deployment.md | base | :clipboard: | qa | - | - |

## Execution Log

| Date | Phase | Duration | Result | Notes |
|------|-------|----------|--------|-------|

## Configuration

```yaml
project: {PROJECT_NAME}
created: {DATE}
last_run: null
tech_stack: nestjs+react  # Auto-detected or user-specified
```
```

---

## Prerequisites Validation

Before executing a phase, check prerequisites:

```
For phase = "backend":
  prerequisites = ["database"]

  For each prerequisite:
    Check status in Progress table
    If status != Complete:
      FAIL with message: "Cannot run 'backend': prerequisite 'database' is not complete"
```

---

## Hybrid Mode: Ralph for Item-Level Work

Some phases delegate to Ralph for item-level iteration:

| Phase | Items | Delegate To |
|-------|-------|-------------|
| frontend | 48 screens | `/ralph design-qa project --incremental` |
| test | 29 tests | E2E test generation skill |
| qa | Multiple checks | `/ralph e2e-tests`, `/ralph design-qa` |

The skill file determines when to delegate to Ralph.

Example from `qa-runner.md`:
```markdown
## Execution

1. Run: /ralph e2e-tests {project} --incremental
2. Run: /ralph design-qa {project} --incremental
3. Calculate combined pass rate from status files
4. If pass_rate >= 95%: mark qa as Complete
5. Else: mark qa as Failed, list failing items
```

---

## Error Handling

### Phase Fails

1. Mark phase status = Failed
2. Add error to Notes column
3. Add to Execution Log
4. **STOP** - do not continue to next phase
5. Report failure with suggested fix

### Missing Skill File

1. Report error: "Skill file not found: .pi/base/skills/fullstack/{phase}.md"
2. Suggest creating the skill or checking path

### Missing Prerequisites

1. Report which prerequisites are missing
2. Suggest running `--phase <prerequisite>` first

### Status File Corruption

1. If status file can't be parsed, offer to reset it
2. Never lose user's progress without confirmation

---

## Step 5: Evaluate a Phase (Quality Gates)

After each phase completes, run evaluation to score it (used primarily in `--loop` mode).

```yaml
spec:
  gate: ambiguity_score <= 0.2
  method: "Read seed YAML, score each field 0-1, average"

prd:
  gate: prd_exists AND all_sections_present AND feature_coverage >= 90%

design:
  gate: all_html_generated AND routing_score >= 95% AND shared_consistency == 100%
  scoring: page_coverage(30%) + routing_validity(25%) + shared_consistency(25%) + design_compliance(20%)

database:
  gate: schema_compiles AND no_orphans

backend:
  gate: endpoint_coverage >= 90% AND tests_generated

frontend:
  gate: screen_coverage >= 90% AND build_passes

integrate:
  gate: all_apis_wired AND no_critical_gaps

test:
  gate: all_tests_pass AND no_flaky AND coverage_adequate
  scoring: (total_passed / total_tests) * stability_factor

qa:
  gate: pass_rate >= 95%
```

---

## Step 6: Infinite Loop Engine

Used when `--loop` flag is present. Runs generation-over-generation improvement until quality converges.

```
Generation loop:
  WHILE pipeline_score < quality_threshold AND generation <= max_generations:
    1. Run all phases (--run-all logic, no Gate 1/2/3 prompts)
    2. Evaluate each phase (Step 5)
    3. Calculate pipeline_score = weighted average of phase scores
    4. Log generation result to Generation Log in PIPELINE_STATUS.md
    5. IF pipeline_score >= quality_threshold → CONVERGED, exit loop
    6. IF stagnation detected (score didn't improve for 3 generations) → run /ouroboros:unstuck
    7. Increment generation counter

  On convergence:
    Report: "Converged at generation {N} with score {S}. Ready to ship."

  On max_generations reached:
    Report: "Max generations ({N}) reached. Final score: {S}. Manual review recommended."
```

### Stagnation Handling

If pipeline score doesn't improve for 3 consecutive generations:
1. Run `/ouroboros:unstuck` to get new perspectives
2. Identify the lowest-scoring phase as the bottleneck
3. Reset bottleneck phase + its dependents
4. Resume loop from reset point

---

## Skill File Structure

Skills are located in their appropriate tier (see Tier Locations above).

**Base tier skills** (in `.pi/base/skills/fullstack/`) are orchestration-specific:
- `project-init.md` - Generic project initialization
- `deployment.md` - Generic deployment (Dokploy/AWS)

**Framework tier skills** (in `.pi/{nestjs|react}/skills/`) are comprehensive implementations:
- Already exist and are well-maintained
- Used by both standalone invocation AND /fullstack pipeline
- Single source of truth for each capability

Skill files follow this pattern:

```markdown
---
name: {phase-name}
phase: {phase-number}
prerequisites: [{list}]
---

# {Phase Name} Skill

## Context
- Project: {from status file}
- Previous phase output: {what to expect}
- Expected deliverables: {what this phase produces}

## Instructions

1. Step one...
2. Step two...
3. Step three...

## Completion Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## On Success

Update PIPELINE_STATUS.md:
- Status: :white_check_mark:
- Output: {deliverables}

## On Failure

Update PIPELINE_STATUS.md:
- Status: :x:
- Notes: {error details}
```

---

## Confirmation Protocol

All user-facing confirmation prompts use **AskUserQuestion**. Three gates exist, each triggered at a specific point in execution.

### Gate Summary

| Gate | Trigger | Skipped by `--yes`? | Purpose |
|------|---------|----------------------|---------|
| Gate 1 | Before `--run-all` loop starts | Yes | Confirm multi-phase autopilot |
| Gate 2 | Before each phase in `--run` / `--phase` | Yes | Confirm individual phase dispatch |
| Gate 3 | Before `--reset` modifies status file | Yes | Confirm destructive status clear |

### Gate 1 — Pipeline Confirmation (`--run-all`)

**When:** Before the `--run-all` execution loop begins.
**Scope:** One-time confirmation for the entire batch.
**Effect if "No":** Abort entirely — no phases run.

Displays the pending phase list with agent assignments, then prompts:
```
"Run {N} phases automatically? Agents will be dispatched without further confirmation."
Options: ["Yes, run all phases automatically", "No, I will run phases manually with --run"]
```

### Gate 2 — Phase Confirmation (`--run` / `--phase`)

**When:** After plan display (Step 4.2) and change detection (Step 4.0), before dispatch (Step 4.4).
**Scope:** Per-phase — shown once per `--run` invocation or `--phase` invocation.
**Effect if "No, skip":** Return to prompt; phase status unchanged (NOT marked failed).
**Effect if "Abort":** Stop all execution immediately.

**Not shown inside `--run-all` loop** — Gate 1 already obtained batch approval.

```
"Execute Phase {N}/9: {phase_name}? Agent: {agent_name}"
Options: ["Yes, execute now", "No, skip for now", "Abort"]
```

### Gate 3 — Reset Confirmation (`--reset`)

**When:** Before any status file modification in the `--reset` action handler.
**Scope:** Per-reset operation.
**Effect if "No, cancel":** Abort with zero changes to status file.

Also offers cascading reset — user can optionally reset all downstream dependent phases in one step.

```
"Reset '{phase}' to Pending? This will clear its status, output, agent results, and change checksum."
Options: ["Yes, reset {phase} only", "Yes, reset {phase} + dependents: {list}", "No, cancel"]
```

### `--yes` Flag

Suppresses all three gates. Use for automation, CI pipelines, or when you trust the current state.

```bash
/fullstack my-app --run-all --yes      # no Gate 1 prompt
/fullstack my-app --run --yes          # no Gate 2 prompt
/fullstack my-app --phase backend --yes
/fullstack my-app --reset database --yes  # no Gate 3 prompt — resets immediately
```

---

## Change Detection Algorithm

Runs before every phase dispatch (Step 4.0). Detects if dependencies have changed since the phase last ran.

### CD.1: Check Submodule Hashes

For each relevant submodule tier (base, $BACKEND, $FRONTEND):

```bash
# Run in orchestrator context before dispatching phase
current_hash=$(cd .pi/{tier} && git rev-parse HEAD 2>/dev/null)
stored_hash=$(read from PIPELINE_STATUS.md change_tracking.submodule_hashes.{tier})

if [ "$current_hash" != "$stored_hash" ] && [ -n "$stored_hash" ]; then
  CHANGED+=("submodule .pi/{tier}: $stored_hash -> $current_hash")
fi
```

### CD.2: Check Skill File Checksums

For phases that have already been completed:

```bash
# Resolve the skill path (same tier-aware resolution as Step 4.3)
skill_path=$(resolve_skill_path $phase $BACKEND $FRONTEND)
current_checksum=$(shasum -a 256 "$skill_path" | cut -d' ' -f1)
stored_checksum=$(read from PIPELINE_STATUS.md change_tracking.skill_checksums.$phase)

if [ "$current_checksum" != "$stored_checksum" ] && [ -n "$stored_checksum" ]; then
  CHANGED+=("skill file $phase: $skill_path modified")
fi
```

### CD.3: Check Project Doc Modification Times

```bash
for doc in PROJECT_KNOWLEDGE PROJECT_API PROJECT_DATABASE; do
  doc_path=".pi-project/docs/${doc}.md"
  if [ -f "$doc_path" ]; then
    current_mtime=$(stat -f %m "$doc_path" 2>/dev/null || stat -c %Y "$doc_path")
    stored_mtime=$(read from PIPELINE_STATUS.md change_tracking.doc_mtimes.$doc)
    if [ "$current_mtime" != "$stored_mtime" ] && [ -n "$stored_mtime" ]; then
      CHANGED+=("project doc: ${doc}.md modified externally")
    fi
  fi
done
```

### CD.4: Display and Confirm

If any changes detected:

```
Change Detection Warning
========================
The following have changed since this phase last ran:

{list each item from CHANGED[]}

These changes may affect phase output. Previous results may be stale.

Options:
  [1] Continue — proceed with current inputs (recommended if changes are improvements)
  [2] Abort — stop and re-run prerequisite phases first
```

Ask user to choose if changes were detected. Default to continue if `--run-all` is active.

If no changes detected: print `Change Detection: No changes detected.` and proceed.

### CD.5: Store Values After Phase Completion

After a phase completes successfully, update `PIPELINE_STATUS.md`:

```yaml
# Update change_tracking section
change_tracking:
  submodule_hashes:
    {tier}: "{current_git_hash}"
  skill_checksums:
    {phase}: "{current_sha256}"
  doc_mtimes:
    PROJECT_KNOWLEDGE: "{current_mtime}"   # if this phase touches PROJECT_KNOWLEDGE.md
    PROJECT_API: "{current_mtime}"
    PROJECT_DATABASE: "{current_mtime}"
  last_checked: "{ISO_TIMESTAMP}"
```

### Upgrade Existing Status Files

If `PIPELINE_STATUS.md` was created before v6 (missing `Change Tracking` section), silently add it with all null values. Never fail or prompt the user just because v6 sections are absent.

---

## Phase Execution Display Format

Use these formats during phase execution (Step 4.2, 4.5).

### Phase Start

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE {N}/9: {PHASE_NAME_UPPERCASE}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent:    {agent_name | direct}
Skill:    {resolved_skill_path}
Started:  {ISO_TIMESTAMP}

Planned Tasks:
  [  ] 1. {task_1_description}
  [  ] 2. {task_2_description}
  ...

Expected Output Artifacts:
  - {artifact_1}
  - {artifact_2}

Dispatching to {agent_name}... (or "Executing inline...")
```

### Phase Completion

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE {N}/9: {PHASE_NAME} — COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Duration:  {Xm Ys}
Agent:     {agent_name | direct}

Output Artifacts:
  ✓ {artifact_1}
  ✓ {artifact_2}

Metrics:   {phase-specific, e.g. "24 endpoints | 8 entities | 12 screens"}
Notes:     {notes from PHASE_RESULT, or "-"}

Pipeline Progress:
  {progress bar showing all 9 phases with ✓/→/○ icons}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase Failure

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE {N}/9: {PHASE_NAME} — FAILED ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent:    {agent_name | direct}
Error:    {error_summary}

Details:
  {detailed error}

To retry:
  /fullstack {project} --phase {phase_name}

To reset:
  /fullstack {project} --reset {phase_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase-Specific Planned Tasks

Show these task lists in the Phase Start display (Step 4.2):

```
init:
  1. Detect project state (new vs existing .pi-project/)
  2. Gather tech stack configuration (AskUserQuestion)
  3. Create Claude config repo on GitHub (if new)
  4. Clone boilerplate repositories
  5. Create PIPELINE_STATUS.md from template
  6. Validate all required submodules exist

prd:
  1. Locate PRD document in .pi-project/prd/
  2. Extract all PRD sections systematically
  3. Generate PROJECT_KNOWLEDGE.md
  4. Generate PROJECT_API.md (all endpoints)
  5. Generate PROJECT_DATABASE.md (entities + ERD)
  6. Create status tracking files

database:
  1. Read PROJECT_DATABASE.md for entity requirements
  2. Design normalized schema
  3. Create TypeORM entities / Django models
  4. Define relationships and indexes
  5. Generate and run migrations
  6. Update PROJECT_DATABASE.md with ERD

backend:
  1. Read all endpoints from PROJECT_API.md
  2. Implement each module (entity→repo→service→controller)
  3. Add Swagger documentation to all endpoints
  4. Run backend build
  5. Fix any TypeScript/Python errors

frontend:
  1. Pre-flight: read file-organization guidelines
  2. Implement all screens from PROJECT_KNOWLEDGE.md
  3. Set up routing for all screens
  4. Set up Redux slices and API services
  5. Run typecheck and build

integrate:
  1. Wire each screen to backend endpoints
  2. Implement pagination, search, filters end-to-end
  3. Run api-integration-agent audit
  4. Fix critical and high severity gaps
  5. Verify all builds pass

test:
  1. Identify all critical user flows
  2. Generate Playwright E2E tests per flow
  3. Run test suite
  4. Update E2E_TEST_STATUS.md

qa:
  1. Run gap-finder full analysis
  2. Fix Critical+High gaps via gap-fixer
  3. Run auto-error-resolver for compilation errors
  4. Iterate until pass rate >= 95%
  5. Final build verification

ship:
  1. Deploy to dev environment (Dokploy)
  2. Verify dev health checks pass
  3. Deploy to staging
  4. Run smoke tests on staging
  5. Deploy to production (AWS ECS)
  6. Verify production health
  7. Generate deployment documentation
```

---

## Agent Dispatch Prompts

These prompt templates are used in Step 4.4 when dispatching phases to agents.
Replace `{VARIABLE}` placeholders with resolved values from PIPELINE_STATUS.md.

### Phase 2: prd → documentation-architect

```
Task(
  subagent_type='documentation-architect',
  description='Convert PRD to project knowledge for {PROJECT}',
  prompt="""
Coordinator: project-coordinator. Pipeline: fullstack-pipeline. Phase: prd (2/9).

Project: {PROJECT}
Status file: .pi-project/status/{PROJECT}/PIPELINE_STATUS.md
Skill to follow: .pi/{BACKEND}/skills/convert-prd-to-knowledge.md

Read this skill file FIRST and follow its instructions exactly.

Context from init phase:
- Tech stack: backend={BACKEND}, frontend={FRONTEND}
- .pi-project/ structure is initialized
- All required submodules have been validated

Your task:
1. Read the skill file at .pi/{BACKEND}/skills/convert-prd-to-knowledge.md
2. Locate the PRD document in .pi-project/prd/
3. Follow skill instructions to generate all required knowledge documents
4. Delegate to prd-converter for the extraction and conversion work
5. Ensure all output files are complete before returning

Success criteria:
- .pi-project/docs/PROJECT_KNOWLEDGE.md — populated with architecture, tech stack, features
- .pi-project/docs/PROJECT_API.md — all API endpoints identified
- .pi-project/docs/PROJECT_DATABASE.md — entities and ERD described
- No critical information gaps from the PRD

Your FINAL output must include a PHASE_RESULT JSON block (≤ 500 tokens, use counts not lists):
PHASE_RESULT: {
  "phase": "prd",
  "status": "complete|failed|partial",
  "summary": "One sentence max 200 chars",
  "counts": { "endpoints_extracted": N, "entities_extracted": N, "screens_identified": N, "gaps_found": N },
  "top_issues": ["max 3 critical gaps or missing info items, 100 chars each"],
  "artifact_paths": [
    ".pi-project/docs/PROJECT_KNOWLEDGE.md",
    ".pi-project/docs/PROJECT_API.md",
    ".pi-project/docs/PROJECT_DATABASE.md"
  ],
  "next_phase_hints": "Max 300 chars — e.g. primary entity names, backend module list, key constraints"
}
"""
)
```

### Phase 3: database → backend-developer

```
Task(
  subagent_type='backend-developer',
  description='Design and implement database schema for {PROJECT}',
  prompt="""
Coordinator: project-coordinator. Pipeline: fullstack-pipeline. Phase: database (3/9).

Project: {PROJECT}
Status file: .pi-project/status/{PROJECT}/PIPELINE_STATUS.md
Skill to follow: .pi/{BACKEND}/skills/database-schema-designer.md

Read this skill file FIRST and follow its instructions exactly.

Context from prd phase (compact summary from PIPELINE_STATUS.md ## Agent Results → prd):
{INSERT prd next_phase_hints here — max 300 tokens, counts + summary only}
- For full entity/API details: read .pi-project/docs/PROJECT_DATABASE.md
- For architecture context: read .pi-project/docs/PROJECT_KNOWLEDGE.md
- Tech stack: backend={BACKEND}
- Backend codebase: ./backend/

CONTEXT BUDGET: ≤ 300 tokens for the above summary. Do NOT paste full file contents here.

Your task:
1. Read the skill file listed above
2. Read PROJECT_DATABASE.md for entity requirements
3. Delegate to database-designer for comprehensive schema design
4. Ensure all entities, relationships, migrations are created and runnable
5. Update PROJECT_DATABASE.md with final ERD

CRITICAL RULES (violations = implementation failure):
- ALL entities MUST extend BaseEntity from backend/src/core/base/base.entity.ts
- Use UnifiedConfig for environment — NEVER use process.env directly

Success criteria:
- All entities from PRD implemented as TypeORM/Django models
- Migrations generated and runnable (npm run migration:run or python manage.py migrate)
- PROJECT_DATABASE.md ERD is up to date
- Backend build passes (npm run build / python manage.py check)

Your FINAL output must include a PHASE_RESULT JSON block (≤ 500 tokens, use counts not lists):
PHASE_RESULT: {
  "phase": "database",
  "status": "complete|failed|partial",
  "summary": "One sentence max 200 chars",
  "counts": { "entities_created": N, "migrations_generated": N, "build_status": "pass|fail" },
  "top_issues": ["max 3 critical issues, 100 chars each"],
  "artifact_paths": [".pi-project/docs/PROJECT_DATABASE.md"],
  "next_phase_hints": "Max 300 chars — e.g. key entities or constraints the backend phase needs"
}
"""
)
```

### Phase 4: backend → backend-developer

```
Task(
  subagent_type='backend-developer',
  description='Implement all API endpoints for {PROJECT}',
  prompt="""
Coordinator: project-coordinator. Pipeline: fullstack-pipeline. Phase: backend (4/9).

Project: {PROJECT}
Status file: .pi-project/status/{PROJECT}/PIPELINE_STATUS.md

Skill resources (composite — read ALL):
- .pi/{BACKEND}/guides/architecture-overview.md
- .pi/{BACKEND}/guides/services-and-repositories.md

Context from previous phases (compact summary from PIPELINE_STATUS.md ## Agent Results → database):
{INSERT database next_phase_hints here — max 300 tokens, counts + summary only}
- For full schema details: read .pi-project/docs/PROJECT_DATABASE.md
- For endpoint requirements: read .pi-project/docs/PROJECT_API.md
- For architecture: read .pi-project/docs/PROJECT_KNOWLEDGE.md
- Tech stack: backend={BACKEND}
- Backend codebase: ./backend/

CONTEXT BUDGET: ≤ 300 tokens for the above summary. Do NOT paste full file contents here.

Your task:
1. Read the composite skill resources listed above
2. Read PROJECT_API.md to understand all required endpoints
3. For each module identified in the PRD:
   a. Check if controller/service/repository already exist
   b. If not, implement following four-layer architecture (entity→repo→service→controller)
   c. Add Swagger documentation to all endpoints
4. Update PROJECT_API.md with actually implemented endpoints
5. Run backend build and fix any errors

CRITICAL RULES (violations = implementation failure):
1. ALL classes extend base classes: BaseController, BaseService, BaseRepository, BaseEntity
2. ALL messages use I18nHelper.t() — success=".", error="!"
3. NO try/catch in controllers — global exception filter handles errors
4. NO business logic in controllers — delegate to services
5. NO direct TypeORM in services — use repository
6. HTTP-Only cookies for auth — NEVER localStorage
7. UnifiedConfig — NEVER process.env
8. Check existing APIs (grep) before creating new endpoints
9. Use shared enums from backend/src/shared/enums/ — NEVER hardcode enum strings

Success criteria:
- All endpoints from PROJECT_API.md are implemented
- Backend build passes with zero errors
- All endpoints have Swagger documentation
- Four-layer architecture respected throughout

Your FINAL output must include a PHASE_RESULT JSON block (≤ 500 tokens, use counts not lists):
PHASE_RESULT: {
  "phase": "backend",
  "status": "complete|failed|partial",
  "summary": "One sentence max 200 chars",
  "counts": { "modules_implemented": N, "endpoints_total": N, "build_status": "pass|fail" },
  "top_issues": ["max 3 critical issues, 100 chars each"],
  "artifact_paths": [".pi-project/status/{tier}/API_IMPLEMENTATION_STATUS.md"],
  "next_phase_hints": "Max 300 chars — e.g. auth strategy, base URL, key module names frontend needs"
}
"""
)
```

### Phase 5: frontend → frontend-developer

**IMPORTANT:** Ask the user for frontend path BEFORE dispatching (AskUserQuestion in orchestrator context).
Store the choice in `PIPELINE_STATUS.md → phase_config.frontend_path` before running Task().

```
# First: check if path already stored from a previous run
frontend_path = read PIPELINE_STATUS.md phase_config.frontend_path

# If not set, ask user in orchestrator context:
AskUserQuestion(
  question="How would you like to implement the frontend screens?",
  header="Frontend Path",
  options=[
    "Design from scratch — Generate design prompts from PRD",
    "Convert from Figma — Use MCP tools for existing Figma designs",
    "Convert from HTML — Convert HTML/Tailwind templates to React"
  ]
)
# Store answer in PIPELINE_STATUS.md phase_config.frontend_path before dispatch

# Then dispatch:
Task(
  subagent_type='frontend-developer',
  description='Implement frontend screens for {PROJECT} via {figma|html|scratch}',
  prompt="""
Coordinator: project-coordinator. Pipeline: fullstack-pipeline. Phase: frontend (5/9).

Project: {PROJECT}
Status file: .pi-project/status/{PROJECT}/PIPELINE_STATUS.md
Frontend implementation path: {FRONTEND_PATH}  ← already selected, do NOT ask user again
Skill to follow: .pi/{FRONTEND}/skills/{RESOLVED_SKILL_FILE}

Read this skill file FIRST and follow its instructions exactly.

Context from previous phases (compact summary from PIPELINE_STATUS.md ## Agent Results → prd):
{INSERT prd next_phase_hints here — max 300 tokens, counts + summary only}
- For screens list: read .pi-project/docs/PROJECT_KNOWLEDGE.md
- For API reference: read .pi-project/docs/PROJECT_API.md
- Tech stack: frontend={FRONTEND}
- Frontend directory: ./frontend/ (or ./mobile/ for react-native)
{If figma: "- Figma URLs: {figma_urls_from_phase_config}"}
{If html: "- HTML source path: {html_source_path_from_phase_config}"}

CONTEXT BUDGET: ≤ 300 tokens for the above summary. Do NOT paste full file contents here.

Your task:
1. Read the skill file listed above
2. Follow skill instructions for the {FRONTEND_PATH} path
3. Implement all screens and set up routing
4. {If react-native: delegate mobile-specific work to mobile-developer}
5. Run typecheck and build

CRITICAL RULES (violations = implementation failure):
1. ALL forms MUST use React Hook Form + Zod + shadcn Form — manual useState for form fields is FORBIDDEN
2. Components organized: ui/ (lowercase), atoms/, modals/ (Modal suffix), shared/, layouts/, guards/
3. ALL components have typed props interfaces — no untyped `props` parameter
4. CRUD reads: createAsyncThunk; mutations: direct service calls with FormHandleState
5. Use toast for feedback — NEVER console.log; Use ~/ imports — NEVER deep relative paths
6. NO raw HTML elements (button, input, select, textarea) — use shadcn components
7. Use shared enums from frontend/app/enums/ — NEVER hardcode enum strings; keep enums synced with backend
8. Types/interfaces in types/*.d.ts — NO inline interfaces in page/component files

Success criteria:
- All screens from PROJECT_KNOWLEDGE.md are implemented
- Routing connects all screens
- Frontend build passes with zero errors

Your FINAL output must include a PHASE_RESULT JSON block (≤ 500 tokens, use counts not lists):
PHASE_RESULT: {
  "phase": "frontend",
  "status": "complete|failed|partial",
  "summary": "One sentence max 200 chars",
  "counts": { "screens_implemented": N, "components_created": N, "build_status": "pass|fail" },
  "top_issues": ["max 3 critical issues, 100 chars each"],
  "artifact_paths": [".pi-project/status/{tier}/SCREEN_IMPLEMENTATION_STATUS.md"],
  "next_phase_hints": "Max 300 chars — e.g. state mgmt approach, API client setup integrate needs to know"
}
"""
)
```

### Phase 6: integrate → frontend-developer

```
Task(
  subagent_type='frontend-developer',
  description='Wire frontend to backend API for {PROJECT}',
  prompt="""
Coordinator: project-coordinator. Pipeline: fullstack-pipeline. Phase: integrate (6/9).

Project: {PROJECT}
Status file: .pi-project/status/{PROJECT}/PIPELINE_STATUS.md
Skill to follow: .pi/{FRONTEND}/skills/api-integration.md (or guides/ equivalent)

Read this skill file FIRST and follow its instructions exactly.

Context from previous phases (compact summaries from PIPELINE_STATUS.md ## Agent Results):
Backend: {INSERT backend next_phase_hints here — max 300 tokens}
Frontend: {INSERT frontend next_phase_hints here — max 300 tokens}
- For full endpoint list: read .pi-project/docs/PROJECT_API.md
- For implementation status: read .pi-project/status/{tier}/API_IMPLEMENTATION_STATUS.md
- Tech stack: backend={BACKEND}, frontend={FRONTEND}

CONTEXT BUDGET: ≤ 600 tokens total for the above (300 per prior phase). Do NOT paste file contents here.

Your task:
1. Read the skill file listed above
2. Wire each frontend screen to its backend endpoint
3. Implement pagination, search, and filter parameters end-to-end
4. Delegate to api-integration-agent for a gap audit after wiring is complete
5. Fix all Critical and High severity gaps from the audit
6. Verify all builds pass
7. Update `.pi-project/status/{FRONTEND}/API_INTEGRATION_STATUS.md` — mark each integrated
   endpoint row as Complete with the service method name used

Success criteria:
- All screens connected to backend endpoints
- No Critical or High severity integration gaps
- Builds pass for both frontend and backend
- API_INTEGRATION_STATUS.md reflects current integration state

Your FINAL output must include a PHASE_RESULT JSON block (≤ 500 tokens, use counts not lists):
PHASE_RESULT: {
  "phase": "integrate",
  "status": "complete|failed|partial",
  "summary": "One sentence max 200 chars",
  "counts": { "screens_integrated": N, "gaps_found": N, "gaps_fixed": N, "build_status": "pass|fail" },
  "top_issues": ["max 3 critical issues, 100 chars each"],
  "artifact_paths": [".pi-project/status/{tier}/API_INTEGRATION_STATUS.md"],
  "next_phase_hints": "Max 300 chars — e.g. remaining integration gaps, critical flows test phase needs"
}
"""
)
```

### Phase 7: test → quality-lead

```
Task(
  subagent_type='quality-lead',
  description='Generate E2E test suite for {PROJECT}',
  prompt="""
Coordinator: project-coordinator. Pipeline: fullstack-pipeline. Phase: test (7/9).

Project: {PROJECT}
Status file: .pi-project/status/{PROJECT}/PIPELINE_STATUS.md
Skill to follow: .pi/{FRONTEND}/skills/e2e-test-generator.md

Read this skill file FIRST and follow its instructions exactly.

Context from previous phases (compact summary from PIPELINE_STATUS.md ## Agent Results → integrate):
{INSERT integrate next_phase_hints here — max 300 tokens, counts + summary only}
- For user flows: read .pi-project/docs/PROJECT_KNOWLEDGE.md
- For API surface: read .pi-project/docs/PROJECT_API.md
- For integration coverage: read .pi-project/status/{tier}/API_INTEGRATION_STATUS.md
- Tech stack: backend={BACKEND}, frontend={FRONTEND}

CONTEXT BUDGET: ≤ 300 tokens for the above summary. Do NOT paste full file contents here.

Your task:
1. Read the skill file listed above
2. Identify all critical user flows from PROJECT_KNOWLEDGE.md
3. Generate Playwright E2E tests for each flow
4. Run the test suite
5. Document results in E2E_TEST_STATUS.md

Success criteria:
- E2E tests cover all critical user flows
- Test files created in the appropriate test directory
- Initial run results documented

Your FINAL output must include a PHASE_RESULT JSON block (≤ 500 tokens, use counts not lists):
PHASE_RESULT: {
  "phase": "test",
  "status": "complete|failed|partial",
  "summary": "One sentence max 200 chars",
  "counts": { "tests_generated": N, "tests_passing": N, "tests_failing": N },
  "top_issues": ["max 3 critical issues, 100 chars each"],
  "artifact_paths": [".pi-project/status/{tier}/E2E_QA_STATUS.md"],
  "next_phase_hints": "Max 300 chars — e.g. failing test patterns, coverage gaps qa phase must fix"
}
"""
)
```

### Phase 8: qa → quality-lead

```
Task(
  subagent_type='quality-lead',
  description='Run full QA pipeline for {PROJECT} until 95% pass rate',
  prompt="""
Coordinator: project-coordinator. Pipeline: fullstack-pipeline. Phase: qa (8/9).

Project: {PROJECT}
Status file: .pi-project/status/{PROJECT}/PIPELINE_STATUS.md
Skill to follow: .pi/{FRONTEND}/skills/design-qa-patterns.md

Read this skill file FIRST and follow its instructions exactly.

Context from previous phases (compact summary from PIPELINE_STATUS.md ## Agent Results → test):
{INSERT test next_phase_hints here — max 300 tokens, counts + summary only}
- For test details: read .pi-project/status/{tier}/E2E_QA_STATUS.md
- For quality gates: read .pi-project/docs/PROJECT_KNOWLEDGE.md
- Tech stack: backend={BACKEND}, frontend={FRONTEND}

CONTEXT BUDGET: ≤ 300 tokens for the above summary. Do NOT paste full file contents here.

Your task:
1. Read the skill file listed above
2. Run gap-finder for full analysis across all stacks
3. Fix all Critical and High severity gaps using gap-fixer
4. Run auto-error-resolver to fix any remaining compilation errors
5. Run /ralph e2e-tests {PROJECT} --incremental if skill instructs
6. Run /ralph design-qa {PROJECT} --incremental if skill instructs
7. Calculate combined pass rate from status files
8. Iterate until pass_rate >= 95%

Success criteria:
- Pass rate >= 95% across all QA checks
- No Critical or High severity gaps remaining
- All builds passing
- QA status files updated

Your FINAL output must include a PHASE_RESULT JSON block (≤ 500 tokens, use counts not lists):
PHASE_RESULT: {
  "phase": "qa",
  "status": "complete|failed|partial",
  "summary": "One sentence max 200 chars",
  "counts": { "pass_rate_pct": N, "critical_gaps_fixed": N, "iterations": N, "builds_passing": N },
  "top_issues": ["max 3 remaining blockers if status != complete, 100 chars each"],
  "artifact_paths": [".pi-project/status/{tier}/GAP_ANALYSIS_REPORT.md"],
  "next_phase_hints": "Max 300 chars — e.g. remaining known issues ship phase should note in deployment docs"
}
"""
)
```

---

## Orchestrator Context Hygiene Rules

These rules prevent the "Prompt is too long" error by keeping the orchestrator's own context lean across all 9 phases.

```
ENFORCE EVERY PHASE — NO EXCEPTIONS:

[READ]
- Read PIPELINE_STATUS.md at most ONCE per phase cycle
- Use line-range reads to fetch only the section you need:
    ## Progress table     → for status display
    ## Agent Results      → for prior PHASE_RESULT summaries
    ## Configuration      → for tech stack variables
- NEVER read PROJECT_KNOWLEDGE.md, PROJECT_API.md, or PROJECT_DATABASE.md inline
  (these are for agents to read via their own tools, not for the orchestrator)

[AFTER TASK() RETURNS]
- Extract the PHASE_RESULT block ONLY from the agent output
- Write it to PIPELINE_STATUS.md ## Agent Results → {phase}
- DISCARD the rest of the agent output immediately
- Do NOT store, quote, or reference full agent output in subsequent messages

[CONTEXT PASSED TO NEXT PHASE]
- Phases 2–5: pass only 1 prior compact summary (next_phase_hints field)
- Phases 6–8: pass only next_phase_hints from the immediately preceding phase
- NEVER re-paste summaries from phases more than 1 step back — agents read artifact_paths
- Compact summary budget: ≤ 300 tokens per prior phase

[LOGS]
- Before appending to Execution Log: if entries > 20, delete oldest 10
- Log format: date | phase | duration | agent | ✓/✗ | summary (one line, max 120 chars)
- Never read the full Execution Log inline (it is append-only historical data)
```

## Artifact Storage Convention

Each phase **MUST** store its primary output as a file artifact. The PHASE_RESULT then references that file via `artifact_paths`. Successor phases read the artifact directly using their own Read tool — they do NOT receive the data inline.

| Phase     | Primary Artifact File |
|-----------|----------------------|
| prd       | `.pi-project/docs/PROJECT_KNOWLEDGE.md`, `PROJECT_API.md`, `PROJECT_DATABASE.md` |
| database  | `.pi-project/docs/PROJECT_DATABASE.md` (updated ERD + schema) |
| backend   | `.pi-project/status/{tier}/API_IMPLEMENTATION_STATUS.md` |
| frontend  | `.pi-project/status/{tier}/SCREEN_IMPLEMENTATION_STATUS.md` |
| integrate | `.pi-project/status/{tier}/API_INTEGRATION_STATUS.md` |
| test      | `.pi-project/status/{tier}/E2E_QA_STATUS.md` |
| qa        | `.pi-project/status/{tier}/GAP_ANALYSIS_REPORT.md` |

> **Rule:** If information is too large to fit in a PHASE_RESULT field, it belongs in an artifact file — not in the PHASE_RESULT JSON and not in the agent's prompt.

---

## Related Commands

- `/new-project` - Create new project with Claude config (used by init phase)
- `/pdf-to-prd` - Convert PRD PDF to markdown (used by prd phase)
- `/ralph` - Run item-level workflows (used by qa phase)
- `/prd-to-design-guide` - Generate design guide for external designer (used by design phase, Path B)
- `/prd-to-design-prompts` - Generate design prompts from PRD (used by design phase)
- `/prompts-to-aura` - Execute design prompts on Aura.build (used by design phase)
- `/aura-to-git` - Deploy HTML to GitHub Pages (used by design phase)
- `/set-html-routing` - Fix navigation in HTML files (used by design phase)
- `/figma-extract-screens` - Extract Figma screen names (used by design phase, Path B)
- `/ouroboros:interview` - Socratic interview for requirements (used by spec phase)
- `/ouroboros:seed` - Generate specification seed (used by spec phase)
- `/ouroboros:unstuck` - Break through stagnation (used by loop engine)
- `/ouroboros:status` - Check drift from spec (used by ship phase)

---

## Examples

### Start New Project

```bash
/fullstack my-app --run
# Runs init phase, creates .pi-project/
```

### Build a New Product (Infinite Loop)

```bash
/fullstack my-saas --loop
# Keeps improving until score >= 0.95

/fullstack my-saas --loop --max-generations 5
# Stops after 5 generations max
```

### Quick Build (Skip Spec, Single Pass)

```bash
/fullstack my-app --run-all --skip-spec
# Skips spec phase, runs phases 1-10 once
```

### Build in a Different Folder

```bash
/fullstack tirebank --path /Users/me/projects/tirebank \
  --prd .pi-project/prd/ABCTire_PRD.md \
  --run-all --skip-spec
```

### Resume After Failure

```bash
/fullstack my-app
# Shows: database phase failed
# Notes: "Migration error - duplicate column"

# Fix the issue manually, then:
/fullstack my-app --phase database
# Retries the database phase
```

### Skip to Specific Phase

```bash
# Prerequisites must be complete
/fullstack my-app --phase frontend
# Error if database/backend not done
```

### Full Automated Run

```bash
/fullstack my-app --run-all
# Runs all phases until complete or failure
```
