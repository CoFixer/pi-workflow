# {PROJECT_NAME} - Claude Context

## Quick Stack Reference

- **Backend**: {BACKEND}
- **Frontend**: {FRONTENDS}
- **Database**: PostgreSQL
- **Deployment**: Docker

## Project Structure

```
{PROJECT_NAME}/
├── backend/                    # {BACKEND} API (port 3000)
[if react]
├── frontend/                   # React Web (port 5173)
[endif]
[if dashboard]
├── dashboard/                  # Admin Dashboard (port 5174)
[endif]
[if dashboard-admin]
├── dashboard-admin/            # Admin Dashboard (port 5174)
[endif]
[if dashboard-ops]
├── dashboard-ops/              # Ops Dashboard (port 5175)
[endif]
[if dashboard-organizer]
├── dashboard-organizer/        # Organizer Dashboard (port 5176)
[endif]
[if react-native]
├── mobile/                     # React Native App
[endif]
├── .pi/                    # Framework-specific skills & agents
└── docker-compose.yml          # Service orchestration
```

## Core BASH Tools (MANDATORY)

**Pattern Search - USE 'rg' ONLY:**
```bash
rg -n "pattern" --glob '!node_modules/*'  # Search with line numbers
rg -l "pattern"                            # List matching files
rg -t ts "pattern"                         # Search TypeScript files only
```

**File Finding - USE 'fd' ONLY:**
```bash
fd filename                  # Find by name
fd -e ts                     # Find TypeScript files
fd -H .env                   # Include hidden files
```

**Bulk Operations - ONE command > many edits:**
```bash
rg -l "old" | xargs sed -i '' 's/old/new/g'
```

**Preview - USE 'bat':**
```bash
bat -n filepath              # With line numbers
bat -r 10:50 file            # Lines 10-50
```

**JSON - USE 'jq':**
```bash
jq '.dependencies | keys[]' package.json
```

## Essential Commands

| Category | Command | Purpose |
|----------|---------|---------|
| **Git** | /commit | Commit main project, create PR to dev |
| | /commit-all | Commit all including submodules |
| | /pull | Pull latest from dev |
| **Dev** | /new-project | Create new project with boilerplate |
| | /fix-ticket | Analyze and fix Notion ticket |
| | /fullstack | Run autonomous dev loops |
| **Design** | /prd-to-design-prompts | Convert PRD to Aura prompts |
| | /prompts-to-aura | Execute prompts on Aura.build |

## Active Agents

| Agent | Location | Trigger Condition |
|-------|----------|-------------------|
| backend-developer | .pi/agents/ | Backend code changes |
| frontend-developer | .pi/agents/ | Frontend code changes |
[if react-native]
| mobile-developer | .pi/agents/ | Mobile code changes |
[endif]
| database-designer | .pi/agents/ | Schema design needed |
| design-qa-agent | .pi/react/agents/ | UI component work |

## Documentation Reference

| Document | Path | Purpose |
|----------|------|---------|
| Knowledge | .project/docs/PROJECT_KNOWLEDGE.md | Full architecture & tech stack |
| API | .project/docs/PROJECT_API.md | Endpoint specifications |
| Database | .project/docs/PROJECT_DATABASE.md | Schema & ERD |
| Integration | .project/docs/PROJECT_API_INTEGRATION.md | Frontend-API mapping |
| Design System | .project/docs/PROJECT_DESIGN_GUIDELINES.md | Component styling |
| PRD | .project/prd/prd.pdf | Original requirements |
| HTML Screens | .project/resources/HTML/ | Prototype screens |

## Framework Resources

| Framework | Path | Description |
|-----------|------|-------------|
| {BACKEND} | .pi/{BACKEND}/guides/ | 20+ development guides |
| React | .pi/react/guides/ | 22 React guides |
| React Native | .pi/react-native/guides/ | 20 mobile guides |

## Plan Mode Reference

When planning implementation, ALWAYS consult these resources:

[if react]
### Frontend Planning (React)
1. `.pi/react/guides/file-organization.md` — Directory structure, naming, imports
2. `.pi/react/guides/best-practices.md` — Coding standards
3. `.pi/react/guides/crud-operations.md` — Service/slice/mutation patterns
4. `.pi/agents/development/frontend-developer.md` — Full agent spec with quality checklist
[endif]

[if react-native]
### Mobile Planning (React Native)
1. `.pi/react-native/guides/file-organization.md` — Directory structure, naming
2. `.pi/react-native/guides/best-practices.md` — Coding standards
3. `.pi/agents/development/mobile-developer.md` — Full agent spec
[endif]

### Backend Planning ({BACKEND})
1. `.pi/{BACKEND}/guides/best-practices.md` — Critical rules, architecture
2. `.pi/{BACKEND}/guides/database-patterns.md` — ORM patterns
3. `.pi/{BACKEND}/guides/routing-and-controllers.md` — Controller patterns
4. `.pi/agents/development/backend-developer.md` — Full agent spec

### Always Reference
- `.project/docs/PROJECT_API.md` — API endpoints
- `.project/docs/PROJECT_API_INTEGRATION.md` — Frontend-API mapping
- `.project/docs/PROJECT_DESIGN_GUIDELINES.md` — Design system
- `.project/docs/PROJECT_DATABASE.md` — Database schema & ERD
- `.project/docs/PROJECT_KNOWLEDGE.md` — Architecture & tech stack
- `.project/prd/prd.pdf` — Source of truth

## Memory & Context System

### Memory Hierarchy (3 Levels)

| Level | Location | Scope | Contents |
|-------|----------|-------|----------|
| **Team** | `.pi/memory/` | All projects using this base config | CORRECTIONS.md, LEARNINGS.md, PREFERENCES.md |
| **Project** | `.project/memory/` | This project only | DECISIONS.md, LEARNINGS.md, PREFERENCES.md, agent-memory.json |
| **Agent** | `.pi/agent-memory/{agent-name}/` | Per-agent persistent state | MEMORY.md |

### Memory File Purposes

**Team Memory (`.pi/memory/`):**
- `CORRECTIONS.md` -- Anti-patterns and mistakes to avoid across ALL projects
- `LEARNINGS.md` -- Shared conventions, library gotchas, team patterns
- `PREFERENCES.md` -- Team-wide coding standards and process preferences

**Project Memory (`.project/memory/`):**
- `DECISIONS.md` -- Architecture Decision Records (ADR) for this project
- `LEARNINGS.md` -- Codebase-specific patterns, debugging insights, integration quirks
- `PREFERENCES.md` -- Project-specific coding style and organization preferences
- `agent-memory.json` -- Agent status tracking (active, idle, blocked, completed)
- `context/` -- Sprint context, session handoffs, architecture notes
- `tasks/` -- Task registry and archive
- `status/` -- Project status snapshots
- `logs/` -- Session activity logs
- `agents/` -- Per-agent project context

**Agent Memory (`.pi/agent-memory/{agent-name}/MEMORY.md`):**
- Per-agent persistent knowledge (conventions, theme details, known issues)
- Survives across sessions for that specific agent

### Memory Hooks

Memory is loaded and validated automatically via hooks:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `memory-loader.ts` | UserPromptSubmit | Loads agent-memory.json, displays agent status dashboard |
| `memory-persister.ts` | PostToolUse (Write/Edit) | Validates agent-memory.json after modifications |

### Memory Templates

Project memory files are generated from templates during `/new-project`:

| Template | Source | Destination |
|----------|--------|-------------|
| `DECISIONS.template.md` | `.pi/templates/claude-project/memory/` | `.project/memory/DECISIONS.md` |
| `LEARNINGS.template.md` | `.pi/templates/claude-project/memory/` | `.project/memory/LEARNINGS.md` |
| `PREFERENCES.template.md` | `.pi/templates/claude-project/memory/` | `.project/memory/PREFERENCES.md` |

---

**Last Updated:** {DATE}
