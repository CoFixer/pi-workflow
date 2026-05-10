# Agent Team Registry

Central catalog of all agents organized by teams and category folders, with invocation patterns and orchestration workflows.

---

## Organization Chart

```
                        project-coordinator (orchestration/)
                       /       |        |        \
                      /        |        |         \
         backend-developer  frontend-developer  quality-lead  documentation-architect
          (development/)     (development/)      (quality/)    (documentation/)
           |   |   |           |    |           |  |  |  |  |    |   |
           ns  db         mob  api         rev ref aer am gf   wr prd

    Cross-Team: ticket-fixer (development/)
    Specialists: car, crm, pr, gf-fix (analysis/)
    Testing: pqa (testing/)
    Meta: as, dc, fs, le (analysis/)
```

**Legend:** ns=nestjs-specialist, db=database-designer, mob=mobile-developer, rev=reviewer, ref=refactorer, aer=auto-error-resolver, am=agent-monitor, gf=gap-finder, api=api-integration-agent, wr=web-research-specialist, prd=prd-converter, car=code-architecture-reviewer, crm=code-refactor-master, pr=plan-reviewer, gf-fix=gap-fixer, pqa=playwright-qa-agent, as=automation-scout, dc=duplicate-checker, fs=followup-suggester, le=learning-extractor

## Folder Structure

| Folder | Agents | Purpose |
|--------|--------|---------|
| `development/` | 7 | Backend, frontend, mobile implementers + cross-stack |
| `quality/` | 6 | Review, refactoring, monitoring, gap analysis |
| `orchestration/` | 1 | Project coordination |
| `documentation/` | 4 | Docs, PRD conversion, research |
| `testing/` | 1 | QA and user story testing |
| `analysis/` | 7 | Specialist reviewers, meta-agents, gap fixing |

---

## Agent Type System

Agents are classified into types and automatically receive framework-specific resources when invoked.

| Type | Description | Frameworks | Color |
|------|-------------|------------|-------|
| **backend** | Backend development | nestjs | green |
| **frontend** | Frontend web development | react | blue |
| **mobile** | Mobile development | react-native | cyan |
| **cross-stack** | Full-stack agents | nestjs, react | green |
| **generic** | Framework-agnostic | none | blue |

### Framework Resource Auto-Injection

When a typed agent (backend, frontend, mobile, cross-stack) is invoked, it automatically receives:
- **Guides**: `.pi/{framework}/guides/`
- **Skills**: `.pi/{framework}/skills/`
- **Agents**: `.pi/{framework}/agents/`
- **Commands**: `.pi/{framework}/commands/`

Configuration in [agent-registry.json](agent-registry.json).

---

## Team: Backend Engineering (team-backend)

**Leader:** `backend-developer` | **Color:** green | **Domain:** APIs, database, business logic, migrations

### Leader: backend-developer

**Specialty:** NestJS backend implementation
**Model:** opus | **Type:** backend

**Invocation:**
```
Task(
  subagent_type='backend-developer',
  description='Implement [module] API',
  prompt='Implement [module] following four-layer architecture. Create entity, repository, service, controller, and DTOs.'
)
```

### Members

#### nestjs-specialist
**Specialty:** Advanced NestJS patterns (CQRS, microservices, GraphQL federation, complex TypeORM, caching)
**Called by:** backend-developer (for advanced NestJS tasks)

```
Task(
  subagent_type='nestjs-specialist',
  description='Optimize [module] queries',
  prompt='Team: team-backend, Leader: backend-developer. Optimize complex queries for [module] using advanced TypeORM patterns.'
)
```

#### database-designer
**Specialty:** Schema design, entity relationships, migrations, query optimization
**Called by:** backend-developer, project-coordinator, ticket-fixer

```
Task(
  subagent_type='database-designer',
  description='Design schema for [module]',
  prompt='Team: team-backend, Leader: backend-developer. Design database schema for [entities]. Define relationships, create entities, generate migrations.'
)
```

---

## Team: Frontend & Mobile (team-frontend)

**Leader:** `frontend-developer` | **Color:** blue | **Domain:** React web, React Native mobile, UI, routing

### Leader: frontend-developer

**Specialty:** React development, HTML-to-React conversion, state management, API integration
**Model:** opus | **Type:** frontend

**Invocation:**
```
Task(
  subagent_type='frontend-developer',
  description='Implement [feature/screen]',
  prompt='Implement [screen/feature] using React. Include routing, state management, and API integration.'
)
```

### Members

#### mobile-developer
**Specialty:** React Native mobile development, NativeWind, React Navigation, native APIs, Detox testing
**Called by:** frontend-developer (for React Native tasks)

```
Task(
  subagent_type='mobile-developer',
  description='Implement [mobile-feature]',
  prompt='Team: team-frontend, Leader: frontend-developer. Implement [feature] for React Native with navigation and native API integration.'
)
```

#### api-integration-agent
**Specialty:** API integration audit, frontend-backend validation, gap detection, parameter completeness
**Called by:** frontend-developer, ticket-fixer

```
Task(
  subagent_type='api-integration-agent',
  description='Audit API integration',
  prompt='Team: team-frontend, Leader: frontend-developer. Audit all frontends against backend endpoints. Identify gaps, missing parameters, generate report.'
)
```

**Output:** Audit report with coverage metrics, gap analysis, and prioritized action items

---

## Team: Quality & Architecture (team-quality)

**Leader:** `quality-lead` | **Color:** purple | **Domain:** Code review, refactoring, error resolution, plan validation, monitoring

### Leader: quality-lead

**Specialty:** Quality pipeline orchestration, code review coordination, refactoring management
**Model:** opus | **Type:** generic

**Invocation:**
```
Task(
  subagent_type='quality-lead',
  description='[Review/Refactor/Fix] [module]',
  prompt='Quality request: [review code / plan refactoring / fix errors / validate plan] for [module]. Files: [list].'
)
```

### Members

#### code-architecture-reviewer
**Specialty:** Code quality review, architectural consistency, NestJS patterns validation
**Called by:** quality-lead, backend-developer, frontend-developer, ticket-fixer

```
Task(
  subagent_type='code-architecture-reviewer',
  description='Review [feature] implementation',
  prompt='Team: team-quality, Leader: quality-lead. Review [files] for architectural consistency and best practices.'
)
```

**Output:** Review report saved to `./dev/active/[task-name]/[task-name]-code-review.md`

#### refactor-planner
**Specialty:** Refactoring strategy creation, code smell detection, plan creation
**Called by:** quality-lead, code-architecture-reviewer

```
Task(
  subagent_type='refactor-planner',
  description='Plan [module] refactoring',
  prompt='Team: team-quality, Leader: quality-lead. Analyze [module] and create comprehensive refactoring plan.'
)
```

**Output:** Plan saved to `.pi/docs/refactoring/[module]-refactor-plan.md`

#### code-refactor-master
**Specialty:** Refactoring execution, file reorganization, import management
**Called by:** quality-lead, refactor-planner

```
Task(
  subagent_type='code-refactor-master',
  description='Execute [module] refactoring',
  prompt='Team: team-quality, Leader: quality-lead. Execute refactoring plan at [plan-path]. Follow phases exactly.'
)
```

#### plan-reviewer
**Specialty:** Plan validation, risk assessment, gap analysis
**Called by:** quality-lead, refactor-planner

```
Task(
  subagent_type='plan-reviewer',
  description='Review [feature] plan',
  prompt='Team: team-quality, Leader: quality-lead. Review plan at [plan-path]. Assess risks, validate approach, identify gaps.'
)
```

#### auto-error-resolver
**Specialty:** TypeScript compilation error fixing, systematic error resolution
**Called by:** quality-lead, backend-developer, code-refactor-master

```
Task(
  subagent_type='auto-error-resolver',
  description='Fix TypeScript errors in [module]',
  prompt='Team: team-quality, Leader: quality-lead. Fix TypeScript compilation errors. Run tsc, fix systematically.'
)
```

#### agent-monitor
**Specialty:** Agent orchestration monitoring, health reporting, error pattern detection
**Called by:** quality-lead, project-coordinator

```
Task(
  subagent_type='agent-monitor',
  description='Generate [report-type] report',
  prompt='Team: team-quality, Leader: quality-lead. Analyze agent activity and generate [daily|error|health|chain] report.'
)
```

**Output:** Reports from `.pi/monitoring/` data

---

## Team: Documentation & Research (team-docs)

**Leader:** `documentation-architect` | **Color:** yellow | **Domain:** Documentation, PRD conversion, research

### Leader: documentation-architect

**Specialty:** Comprehensive documentation creation, API docs, architecture overviews
**Model:** inherit | **Type:** generic

**Invocation:**
```
Task(
  subagent_type='documentation-architect',
  description='Document [module/feature]',
  prompt='Create comprehensive documentation for [module] including API reference, usage examples, and architecture notes.'
)
```

### Members

#### web-research-specialist
**Specialty:** Online technical research, solution finding, best practices research
**Called by:** documentation-architect

```
Task(
  subagent_type='web-research-specialist',
  description='Research [topic/error]',
  prompt='Team: team-docs, Leader: documentation-architect. Research [issue]. Search GitHub, Stack Overflow, documentation.'
)
```

#### prd-converter
**Specialty:** PRD parsing, documentation generation, requirement extraction
**Called by:** documentation-architect, project-coordinator

```
Task(
  subagent_type='prd-converter',
  description='Convert PRD to documentation',
  prompt='Team: team-docs, Leader: documentation-architect. Parse PRD at [path] and generate project documentation.'
)
```

---

## Cross-Team Agents

### project-coordinator
**Role:** Top-level orchestrator for multi-team workflows
**Manages:** All 4 team leaders + cross-team agent (ticket-fixer)
**Model:** opus

```
Task(
  subagent_type='project-coordinator',
  description='Orchestrate [feature/project]',
  prompt='Coordinate multi-team implementation of [task]. Decompose into team-level work items and manage cross-team dependencies.'
)
```

### ticket-fixer
**Role:** Cross-team Notion ticket resolution
**Reports to:** project-coordinator
**Can delegate to:** backend-developer, frontend-developer, quality-lead, documentation-architect, database-designer, api-integration-agent

```
Task(
  subagent_type='ticket-fixer',
  description='Fix ticket [id]',
  prompt='Analyze and fix Notion ticket [id]. Update status and add Dev Comment.'
)
```

---

## Cross-Team Orchestration Patterns

### Pattern 1: PRD to Full Implementation
```
project-coordinator
  -> documentation-architect -> prd-converter (extract requirements)
  -> backend-developer -> database-designer (design schema)
  -> backend-developer (implement API)
  -> frontend-developer (build UI)
  -> frontend-developer -> api-integration-agent (verify integration)
  -> quality-lead -> code-architecture-reviewer (review all)
  -> documentation-architect (final docs)
```

### Pattern 2: Ticket Resolution
```
project-coordinator
  -> ticket-fixer (analyze ticket)
  -> backend-developer / frontend-developer (implement fix)
  -> quality-lead -> auto-error-resolver (fix errors)
  -> quality-lead -> code-architecture-reviewer (review)
  -> documentation-architect (update docs if needed)
```

### Pattern 3: Full Refactoring Pipeline
```
quality-lead
  -> refactor-planner (create plan)
  -> plan-reviewer (validate plan)
  -> code-refactor-master (execute)
  -> auto-error-resolver (fix errors)
  -> code-architecture-reviewer (final review)
```

### Pattern 4: Full-Stack Feature
```
project-coordinator
  -> backend-developer -> database-designer (schema)
  -> backend-developer (API)
  -> frontend-developer (web UI)
  -> frontend-developer -> mobile-developer (mobile UI, if needed)
  -> frontend-developer -> api-integration-agent (integration audit)
  -> quality-lead (quality review)
  -> documentation-architect (documentation)
```

---

## Agent Invocation Matrix

| From \ To | proj-coord | back-dev | front-dev | qual-lead | doc-arch | ticket-fix | api-integ | db-design | ns-spec | mob-dev | car | rp | crm | pr | aer | am | wr | prd |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **proj-coord** | - | T | T | T | T | T | - | - | - | - | - | - | - | - | - | - | - | T |
| **back-dev** | - | - | - | - | - | - | - | T | T | - | - | - | - | - | - | - | - | - |
| **front-dev** | - | - | - | - | - | - | T | - | - | T | - | - | - | - | - | - | - | - |
| **qual-lead** | - | - | - | - | - | - | - | - | - | - | T | T | T | T | T | T | - | - |
| **doc-arch** | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | - | T | T |
| **ticket-fix** | - | T | T | T | T | - | T | T | - | - | - | - | - | - | - | - | - | - |
| **api-integ** | - | T | T | - | T | - | - | - | - | - | - | - | - | - | - | - | - | - |
| **crm** | - | - | - | - | - | - | - | - | - | - | - | - | - | - | T | - | - | - |

T = Authorized delegation path

---

## Delegation Rules

### Within-Team Delegation
- Team leaders freely delegate to their members
- Members report results back to their leader
- Members should NOT call agents outside their team directly

### Cross-Team Delegation
- Team leaders can call other team leaders for cross-team work
- `project-coordinator` routes work to any team leader
- Cross-team agent (`ticket-fixer`) can call any team leader

### Direct Invocation
- Any agent can be invoked directly by the user
- When invoked directly, agents operate independently (bypass team hierarchy)
- Direct invocation is fine for single-domain tasks

### When to Delegate
- Task requires **deep specialized knowledge** beyond parent agent's expertise
- Task is **autonomous** with clear success criteria
- Task benefits from **fresh context** and focused attention
- Delegation overhead is **justified** by task complexity

### When NOT to Delegate
- Task is within parent agent's **core expertise**
- Task is **simple** (1-2 tool calls)
- Delegation overhead **exceeds task complexity**

---

## Context Passing Best Practices

Include in subagent prompts:
- **Team context**: `Team: [team-name], Leader: [leader-name]`
- **Parent agent**: `Called from [agent-name]`
- **Task context**: Background, requirements, success criteria
- **Files involved**: Paths of files to review/modify
- **Previous actions**: What has already been done
- **Expected output**: Format and location for results

**Example:**
```
Task(
  subagent_type='code-architecture-reviewer',
  description='Review auth module',
  prompt='Team: team-quality, Leader: quality-lead.
    Called from: backend-developer.
    Review authentication module for ticket #456.
    Files: [list]. Used JWT with passport.
    Verify: four-layer architecture, Swagger docs, error handling.
    Output: ./dev/active/auth-module/auth-module-code-review.md'
)
```

---

## Complete Agent Roster (18)

| # | Agent | Team | Role | Type | Model |
|---|-------|------|------|------|-------|
| 1 | project-coordinator | - | coordinator | cross-stack | opus |
| 2 | backend-developer | team-backend | leader | backend | opus |
| 3 | nestjs-specialist | team-backend | member | backend | opus |
| 4 | database-designer | team-backend | member | backend | opus |
| 5 | frontend-developer | team-frontend | leader | frontend | opus |
| 6 | mobile-developer | team-frontend | member | mobile | opus |
| 7 | quality-lead | team-quality | leader | generic | opus |
| 8 | code-architecture-reviewer | team-quality | member | generic | sonnet |
| 9 | refactor-planner | team-quality | member | generic | opus |
| 10 | code-refactor-master | team-quality | member | generic | opus |
| 11 | plan-reviewer | team-quality | member | generic | opus |
| 12 | auto-error-resolver | team-quality | member | generic | sonnet |
| 13 | agent-monitor | team-quality | member | generic | sonnet |
| 14 | documentation-architect | team-docs | leader | generic | inherit |
| 15 | web-research-specialist | team-docs | member | generic | sonnet |
| 16 | prd-converter | team-docs | member | generic | sonnet |
| 17 | ticket-fixer | - | cross-team | cross-stack | sonnet |
| 18 | api-integration-agent | team-frontend | member | cross-stack | opus |
