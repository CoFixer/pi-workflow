---
name: skills
description: Overview of available Claude Code skills and their directory structure.
---

# Skills

Production-tested skills for Claude Code that auto-activate based on context.

---

## What Are Skills?

Skills are modular knowledge bases that Claude loads when needed. They provide:

- Domain-specific guidelines
- Best practices
- Code examples
- Anti-patterns to avoid

**How it works:** Skills activate automatically via hooks + `skill-rules.json` configuration.

---

## Directory Structure

```
skills/
├── skill-rules.json          # Central activation config
├── dev/                      # Development & workflow skills
│   ├── create-dev-pr/        # Git PR workflow automation
│   ├── develop-skills/       # Meta-skill for creating skills
│   ├── find-gaps/            # Gap detection methodology
│   ├── fix-gaps/             # Fix implementation gaps
│   ├── generate-docs/        # Project documentation generator
│   ├── generate-ouroboros/   # PRD spec validation
│   ├── meta/reflect/         # Self-improvement & learning
│   ├── review-tickets/       # Notion ticket management
│   └── run-fullstack/        # Fullstack pipeline orchestrator
├── operation/                # Business & content generation
│   ├── generate-invoice/     # Invoice/quotation PDF generator
│   ├── generate-ppt/         # HTML presentation generator
│   ├── generate-prd/         # Product requirements documents
│   └── generate-proposal/    # Client proposal generator
└── qa/                       # Quality assurance
    └── run-playwright/       # Browser automation via Playwright CLI
```

---

## Dev Skills

### develop-skills (Meta-Skill)

Creating and managing Claude Code skills, hooks, and skill-rules configuration.

**Files:** SKILL.md + 6 reference docs (ADVANCED.md, HOOK_MECHANISMS.md, TRIGGER_TYPES.md, etc.)

**[View Skill →](dev/develop-skills/)**

### create-dev-pr

Git and PR workflow automation for creating pull requests to dev branch.

**[View Skill →](dev/create-dev-pr/)**

### find-gaps

Methodology and checklists for finding implementation gaps across the full stack.

**[View Skill →](dev/find-gaps/)**

### fix-gaps

Fix implementation gaps found by find-gaps, syncing results to dev/STATUS.md.

**[View Skill →](dev/fix-gaps/)**

### generate-docs

Generate and update project documentation (PROJECT_KNOWLEDGE, PROJECT_DATABASE, PROJECT_API, CLAUDE.md).

**Files:** SKILL.md + prompts/

**[View Skill →](dev/generate-docs/)**

### generate-ouroboros

Validate PRD features through Ouroboros Socratic interview and ambiguity scoring before building.

**[View Skill →](dev/generate-ouroboros/)**

### review-tickets

Fetch, analyze, fix, and update tickets from Notion database using Claude Code.

**Files:** SKILL.md + prompts/ + databases/

**[View Skill →](dev/review-tickets/)**

### run-fullstack

Full development lifecycle pipeline orchestrator - from project setup to deployment.

**Files:** SKILL.md + deployment.md, iteration-manager.md, project-init.md

**[View Skill →](dev/run-fullstack/)**

### reflect

Analyze conversation for learnings and update skill/memory files.

**[View Skill →](dev/meta/reflect/)**

---

## Operation Skills

### generate-ppt

Generate HTML presentations with reveal.js and brand-consistent slide design.

**[View Skill →](operation/generate-ppt/)**

### generate-prd

Generate comprehensive Product Requirements Documents from client input.

**Files:** SKILL.md + resources/

**[View Skill →](operation/generate-prd/)**

### generate-proposal

Generate interactive HTML slide proposals (PPT-style) with bilingual support.

**Files:** SKILL.md + prompts/ + templates/ + images/

**[View Skill →](operation/generate-proposal/)**

### generate-invoice

Generate software development invoices and quotations as PDF (Korean/English).

**[View Skill →](operation/generate-invoice/)**

---

## QA Skills

### run-playwright

Token-efficient browser automation via @playwright/cli with named sessions for parallel isolation.

**[View Skill →](qa/run-playwright/)**

---

## Guardrails

Guardrail skills enforce coding standards automatically (no skill file — config only in `skill-rules.json`):

| Guardrail | Enforcement | Purpose |
|-----------|-------------|---------|
| `type-organization` | warn | Types must be in `types/*.d.ts`, not inline |
| `mutation-thunk-guardrail` | warn | createAsyncThunk only for reads, not mutations |
| `modal-submitting-guardrail` | warn | Modals must not own submitting state |

---

## Stack-Specific Skills

Additional skills are available in stack-specific submodules:

| Submodule | Skills |
|-----------|--------|
| `nestjs/` | backend-dev-guidelines, error-tracking |
| `react/` | frontend-dev-guidelines |
| `react-native/` | mobile-dev-guidelines |

---

## skill-rules.json Configuration

Defines when skills should activate based on:

- **Keywords** in user prompts
- **Intent patterns** (regex matching user intent)
- **File path patterns** (editing specific files)

```json
{
  "skill-name": {
    "type": "domain",
    "enforcement": "suggest",
    "priority": "high",
    "file": "dev/skill-folder/SKILL.md",
    "promptTriggers": {
      "keywords": ["list", "of", "keywords"],
      "intentPatterns": ["regex patterns"]
    },
    "fileTriggers": {
      "pathPatterns": ["path/to/files/**/*.ts"]
    }
  }
}
```

### Enforcement Levels

- **suggest**: Skill appears as suggestion (domain skills)
- **warn**: Advisory warning shown (guardrails)
- **block**: Must comply before proceeding (guardrails)

---

## Creating Your Own Skills

See the **develop-skills** skill for complete guide on:

- Skill structure and frontmatter
- Resource file organization
- Trigger pattern design
- Testing skill activation

**Quick template:**

```markdown
---
name: my-skill
description: What this skill does
---

# My Skill Title

## Purpose
[Why this skill exists]

## When to Use This Skill
[Auto-activation scenarios]

## Quick Reference
[Key patterns and examples]
```
