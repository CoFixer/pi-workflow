---
description: Launch multi-agent orchestration with composable modes (team/parallel/pipeline/solo/ticket)
argument-hint: "<mode> [--task <desc>] [--prd <path>] [--project <name>] [--status <filter>] [--sprint <name>] [--split-dev] [--autopilot] [--agents <list>] [--stop] [--status]"
---

# /dev:team — Multi-Agent Orchestration

Launch agents with the right coordination pattern. Each mode composes agents from the registry into a team, parallel workers, pipeline, solo specialist, or ticket-driven fixer.

## Quick Start

```bash
# Team mode: PM + Dev(s) + QA continuous loop
/dev:team team --prd .pi-project/prd/my-app-prd.md

# Ticket mode: PM + Dev + QA fixing Notion tickets automatically
/dev:team ticket --project "Design Flow"
/dev:team ticket --project "Design Flow" --status "New" --sprint "Sprint 3"
/dev:team ticket --status "New"   # all projects

# Parallel mode: independent agents on separate problems
/dev:team parallel --task "fix auth bug + fix payment form + update user docs"

# Pipeline mode: sequential phases with dependencies
/dev:team pipeline --prd .pi-project/prd/my-app-prd.md

# Solo mode: single specialist for focused task
/dev:team solo --task "review the user controller"

# Status / Stop (for team, pipeline, and ticket modes)
/dev:team --status
/dev:team --stop
```

---

## Execution Instructions

### Step 1: Parse Arguments

```
mode = $1 (team | parallel | pipeline | solo | ticket)
task = --task value (task description, used by parallel/solo)
prd = --prd value (PRD file path, used by team/pipeline)
project = --project value (Notion project name, used by ticket mode, e.g., "Design Flow")
status_filter = --status value (ticket mode: Notion status filter, e.g., "New", "Backlog")
sprint = --sprint value (ticket mode: sprint filter, e.g., "Sprint 3")
split_dev = --split-dev flag (team mode: spawn separate backend + frontend devs)
autopilot = --autopilot flag (team mode: persistent execution with auto-resume)
agents = --agents value (comma-separated agent name overrides)
stop = --stop flag (stop running team/pipeline/ticket)
status = --status flag (show current status)
```

**Recommend --autopilot for long tasks:**
- If mode is `team` or `pipeline` AND `--autopilot` is NOT set:
  - Count estimated backlog items (from PRD complexity)
  - If items > 3, warn: "This looks like a long task. Consider using `--autopilot` for automatic recovery from rate limits and session drops. Continue without autopilot? (y/n)"
  - If user chooses autopilot, add the flag and proceed below

> **Note on `--status` ambiguity:** If the value after `--status` is a known Notion status (`Backlog`, `New`, `In Progress`, `Ready for test`, `Close`), treat it as `status_filter` for ticket mode. If `--status` appears with no value, treat as the display flag.

**Handle --autopilot first:**
- If `--autopilot`:
  1. Check tmux is installed → error with install instructions if not
  2. Derive task slug from `--prd` filename or `--task` first words
  3. Launch `.pi/base/scripts/autopilot.sh` with remaining args
  4. Report: "Autopilot launched in tmux session: claude-autopilot"
  5. Show monitoring commands: `tmux attach`, `tail -f`, stop instructions
  6. Exit — the script handles everything from here

**Handle --stop and --status first:**
- If `--stop`: Find active team at `~/.pi/teams/team-*`, read config, send shutdown to all agents, TeamDelete, update status files, report.
- If `--status`: Find status files in `.pi-project/status/`, read and display them.

**Auto-detect mode if not provided:**
- Has `--project` (with or without other flags) → `ticket`
- Has `--prd` + complex multi-phase project → `pipeline`
- Has `--prd` + straightforward feature → `team`
- Has `--task` with `+` or `,` separating independent items → `parallel`
- Has `--task` with single focused request → `solo`
- Ambiguous → Ask using AskUserQuestion with options: team, parallel, pipeline, solo, ticket

### Step 2: Load Agent Registry

1. Read `.pi/stack-config.json` to get `enabledStacks` array
2. Read and merge `agent-manifest.json` files in this order (later overrides earlier):

```
.pi/base/agents/agent-manifest.json            # always loaded
.pi/{stack}/agents/agent-manifest.json         # for each enabled stack
.pi/agents/agent-manifest.json                 # project overrides (if exists)
```

3. Build merged agent map: `{ agentName: { file, model, tier, domain, roles, description } }`
4. For `file` paths, resolve relative to the manifest's directory:
   - Base agent file: `.pi/base/agents/{file}`
   - NestJS agent file: `.pi/nestjs/agents/{file}`
   - React agent file: `.pi/react/agents/{file}`
   - Project agent file: `.pi/agents/{file}`

### Step 3: Read Mode File

Read the mode's instruction file:

```
.pi/base/orchestration/modes/{mode}.md
```

This file contains:
- When to use the mode
- Agent role definitions
- Setup steps
- Execution loop
- Shutdown procedure

### Step 4: Execute Mode

Follow the mode file's instructions, using:
- **Merged agent registry** for agent selection
- **Agent `.md` files** read from registry paths as agent personas
- **Native tools**: TeamCreate, SendMessage, Task, TodoWrite
- **Templates** from `.pi/base/templates/` for status files

Key execution patterns by mode:

#### Team Mode
1. `TeamCreate` with team name
2. Initialize status files from templates
3. Build backlog from PRD
4. Spawn dev + QA agents via Task tool (with agent `.md` as prompt context)
5. Run cycle loop: PM specs → Dev builds → QA verifies → repeat

#### Parallel Mode
1. Split task into independent domains
2. Select best agent for each domain from registry
3. Dispatch ALL agents in a SINGLE message (parallel Task tool calls)
4. Wait for completion, review results, verify no conflicts

#### Pipeline Mode
1. Define phases with dependencies
2. Create PIPELINE_STATUS.md from template
3. Execute phases sequentially (or parallel when no dependencies)
4. Each phase gets its own agent from registry
5. Track completion promises in status file

#### Solo Mode
1. Parse task for domain signals
2. Select best agent from registry
3. Single Task tool call with agent persona

#### Ticket Mode
1. Read `NOTION_API_KEY` from `backend/.env`
2. Find project page ID via Notion Projects DB (if `--project` provided)
3. `TeamCreate` with `ticket-{project-slug}` name
4. Initialize `TICKET_STATUS.md` from template
5. Fetch "New" tickets → Dev Backlog, "Ready for test" → QA Queue
6. Spawn Dev + QA agents with inline Notion API commands
7. Run cycle: PM specs → Dev fixes (+ Notion sync) → QA verifies → repeat
8. QA also processes pre-existing "Ready for test" tickets in parallel

### Step 5: Status Tracking & Cleanup

- **Team mode**: Track in `.pi-project/status/{slug}/TEAM_STATUS.md` + `CYCLE_LOG.md`
- **Ticket mode**: Track in `.pi-project/status/ticket-{slug}/TICKET_STATUS.md` + `CYCLE_LOG.md`
- **Pipeline mode**: Track in `.pi-project/status/{slug}/PIPELINE_STATUS.md`
- **Parallel/Solo**: No persistent status (one-shot execution)
- On completion or stop: shut down agents, update status, clean up team

---

## Agent Override

Use `--agents` to override automatic agent selection:

```bash
# Force specific agents
/dev:team solo --task "fix the bug" --agents ticket-fixer

# Force team composition
/dev:team team --prd ./prd.md --agents "backend-developer,design-qa-agent"
```

---

## Model Routing

Each agent in the registry declares its preferred model (`haiku`/`sonnet`/`opus`). The orchestrator respects this:

| Tier | Model | Typical Agents |
|------|-------|----------------|
| high | opus | backend-developer, frontend-developer, plan-reviewer |
| medium | sonnet | code-architecture-reviewer, playwright-qa-agent, auto-error-resolver |
| low | haiku | duplicate-checker, automation-scout |

This saves cost: not every agent needs opus. Simple validation tasks use haiku, standard work uses sonnet, complex implementation uses opus.
