---
name: run-fullstack
description: Full development lifecycle pipeline orchestrator - from project setup to deployment
---

# Fullstack Pipeline Orchestrator

A skill-chain orchestrator that runs the full development lifecycle from project setup to deployment.

## When to Use This Skill

Automatically activates when you mention:

- Setting up a fullstack project
- Running the development pipeline
- Project initialization workflow
- Running all phases (backend, frontend, testing, QA)
- Deployment pipeline

## Quick Start

```bash
# Show pipeline status
/dev:fullstack my-project

# Run next pending phase
/dev:fullstack my-project --run

# Run specific phase
/dev:fullstack my-project --phase backend

# Run all remaining phases
/dev:fullstack my-project --run-all

# Reset a phase to pending
/dev:fullstack my-project --reset database
```

## Pipeline Phases

| # | Phase | Tier | Prerequisites | Output |
|---|-------|------|---------------|--------|
| 1 | init | base | - | .pi-project/, .pi/ |
| 2 | prd | backend | init | PROJECT_KNOWLEDGE.md |
| 3 | database | backend | prd | Entities, migrations |
| 4 | backend | backend | database | API endpoints |
| 5 | frontend | frontend | prd | React screens |
| 6 | integrate | frontend | backend, frontend | Connected UI |
| 7 | test | stack | integrate | E2E test specs |
| 8 | qa | frontend | test | 95% pass rate |
| 9 | ship | base | qa | Live deployment |

## Related

- **Command:** [/dev:fullstack](../../commands/dev/fullstack.md) — Full execution instructions
- **Sub-skills:** [project-init.md](project-init.md), [deployment.md](deployment.md), [iteration-manager.md](iteration-manager.md)
