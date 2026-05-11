---
name: generate-ouroboros
description: Validate PRD features through Ouroboros Socratic interview and ambiguity scoring before building
---

# Ouroboros Spec Validation

Validate PRD features through Socratic interview and ambiguity scoring before building. Validated specs are written back into the PRD as the single source of truth.

**Prerequisite**: Install Ouroboros CLI (`pip install ouroboros-ai` or `uvx ouroboros-ai`). Falls back to manual interview if CLI is unavailable.

---

## Purpose

Each PRD feature/story goes through:

1. **Socratic Interview** — expose hidden assumptions via targeted questions
2. **Ambiguity Scoring** — quantify requirement clarity (0.0 = crystal clear, 1.0 = fully ambiguous)
3. **PRD Update** — write validated goal, constraints, and acceptance criteria back into the PRD

A feature PASSES when ambiguity score is **<= 0.2**.

---

## Quick Start

```bash
/ralph spec my-project
/ralph spec my-project --category auth
/ralph spec my-project --incremental
```

---

## Per-Item Workflow (Ralph Loop)

For each item in the status file:

### Step 1: Read Feature Context

Read the PRD section for this feature from `.project/prd/`.

Extract:
- Feature name and description
- User stories / acceptance criteria (if any)
- Related entities and dependencies

### Step 2: Run Ouroboros Interview

```bash
ooo interview "<feature description from PRD>"
```

The interview asks clarifying questions about:
- Who uses this feature and why
- Edge cases and error states
- Data boundaries and validation rules
- Dependencies on other features
- Success criteria

If `ooo` CLI is not available, perform the interview manually:

1. List 5-8 assumptions hidden in the feature description
2. For each assumption, generate a clarifying question
3. Answer each question using PRD context, codebase context, or mark as "UNCLEAR"
4. Score clarity per dimension:
   - **Goal clarity** (weight: 0.40) — Is the purpose unambiguous?
   - **Constraint clarity** (weight: 0.30) — Are boundaries defined?
   - **Success criteria clarity** (weight: 0.30) — Can we verify completion?

### Step 3: Score Ambiguity

Calculate: `ambiguity = 1 - (goal_clarity * 0.40 + constraint_clarity * 0.30 + success_clarity * 0.30)`

Each dimension scored 0.0 (unclear) to 1.0 (crystal clear).

| Score | Verdict |
|-------|---------|
| <= 0.2 | PASS — requirements are clear enough to build |
| 0.2 - 0.5 | FAIL — needs more clarification |
| > 0.5 | FAIL — too vague, needs significant rework |

### Step 4: Update PRD (if PASS)

If ambiguity <= 0.2, update the feature's section in the PRD file directly. Append or replace with validated spec:

```markdown
### {Feature Name}

> Ambiguity: {score} | Validated: {date}

**Goal**: {One sentence: what this feature does and why}

**Constraints**:
- {Boundary 1}
- {Boundary 2}

**Acceptance Criteria**:
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}
```

Rules:
- Preserve existing PRD content that is already clear
- Add missing constraints and acceptance criteria discovered during interview
- Mark the section as validated with the ambiguity score and date
- Do NOT create separate spec files — the PRD is the single source of truth

### Step 5: Update Status File

- **PASS**: Set status to :white_check_mark:, record ambiguity score in Notes
- **FAIL**: Set status to :x:, add unclear dimensions to "Needs Manual Review"

---

## Discovery Phase

When the status file has no items, discover features from the PRD:

1. Read all files in `.project/prd/`
2. Extract distinct features/stories/modules
3. Group by category (e.g., auth, payments, messaging, admin)
4. Populate the status file with one row per feature

---

## Completion Criteria

- All features have status != Pending
- All PASS features have validated specs written back into the PRD
- FAIL features are documented in "Needs Manual Review" with specific unclear dimensions

---

## Output

- PRD files updated in-place at `.project/prd/` (single source of truth)
- Status file: `.project/status/{project}/SPEC_STATUS.md`
- Completion promise: `<promise>SPEC_COMPLETE</promise>`

---

**Skill Status**: COMPLETE
