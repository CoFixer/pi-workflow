# Agents

Specialized agents organized into teams and category folders for complex, multi-step tasks.

---

## What Are Agents?

Agents are autonomous Claude instances that handle specific complex tasks. Unlike skills (which provide inline guidance), agents:

- Run as separate sub-tasks
- Work autonomously with minimal supervision
- Have specialized tool access
- Return comprehensive reports when complete
- Are organized into **4 teams** with designated **team leaders**
- Are grouped into **6 category folders** by responsibility

**Key advantage:** Agents are **standalone** - just copy the `.md` file and use immediately!

---

## Folder Structure

```
agents/
├── development/          # 7 agents — implementers (backend, frontend, mobile, cross-stack)
│   ├── backend-developer.md
│   ├── nestjs-specialist.md
│   ├── database-designer.md
│   ├── frontend-developer.md
│   ├── mobile-developer.md
│   ├── api-integration-agent.md
│   └── ticket-fixer.md
│
├── quality/              # 6 agents — review, refactoring, monitoring (team-quality)
│   ├── quality-lead.md
│   ├── reviewer.md
│   ├── refactorer.md
│   ├── auto-error-resolver.md
│   ├── agent-monitor.md
│   └── gap-finder.md
│
├── orchestration/        # 1 agent — coordinator
│   └── project-coordinator.md
│
├── documentation/        # 4 agents — docs, PRD, research (team-docs)
│   ├── documentation-architect.md
│   ├── web-research-specialist.md
│   ├── prd-converter.md
│   └── doc-updater.md
│
├── testing/              # 1 agent — QA testing
│   └── playwright-qa-agent.md
│
├── analysis/             # 7 agents — specialists & meta-agents
│   ├── code-architecture-reviewer.md
│   ├── code-refactor-master.md
│   ├── plan-reviewer.md
│   ├── gap-fixer.md
│   ├── automation-scout.md
│   ├── duplicate-checker.md
│   ├── followup-suggester.md
│   └── learning-extractor.md
│
├── agent-manifest.json   # Agent metadata (non-team agents)
├── agent-registry.json   # Complete team structure & delegation rules
├── SUBAGENT_REGISTRY.md  # Detailed invocation patterns
└── README.md             # This file
```

---

## Team Structure (17 Core Agents)

```
                    project-coordinator
                   /       |        |        \
      backend-developer  frontend-developer  quality-lead  documentation-architect
       (team-backend)    (team-frontend)    (team-quality)  (team-docs)
        |  |               |    |          |  |  |  |  |     |  |
        ns db             mob  api        rev ref aer am gf  wr prd

    Cross-Team: ticket-fixer
```

| Team | Leader | Members | Domain | Folder |
|------|--------|---------|--------|--------|
| **Backend Engineering** | backend-developer | nestjs-specialist, database-designer | APIs, database, business logic | `development/` |
| **Frontend & Mobile** | frontend-developer | mobile-developer, api-integration-agent | React web, React Native mobile, API integration audit | `development/` |
| **Quality & Architecture** | quality-lead | reviewer, refactorer, auto-error-resolver, agent-monitor, gap-finder | Code review, refactoring, monitoring | `quality/` |
| **Documentation & Research** | documentation-architect | web-research-specialist, prd-converter | Docs, PRD conversion, research | `documentation/` |

See [agent-registry.json](agent-registry.json) for complete team details and invocation patterns.

---

## Available Agents (26)

### Development Agents (`development/`)

| Agent | Purpose | Integration |
|-------|---------|-------------|
| backend-developer | NestJS backend implementation | Copy as-is |
| nestjs-specialist | Advanced NestJS patterns (CQRS, microservices, GraphQL) | Copy as-is |
| database-designer | Database schema design, migrations, query optimization | Copy as-is |
| frontend-developer | React web development, HTML-to-React conversion | Copy as-is |
| mobile-developer | React Native development, NativeWind, navigation | Copy as-is |
| api-integration-agent | API integration audit, frontend-backend validation | Copy as-is |
| ticket-fixer | Analyze Notion Bug Report tickets and implement fixes | Requires Notion API |

### Quality Agents (`quality/`)

| Agent | Purpose | Integration |
|-------|---------|-------------|
| quality-lead | Orchestrates code review, refactoring, error resolution | Copy as-is |
| reviewer | Review code and plans for quality and best practices | Copy as-is |
| refactorer | Plan and execute comprehensive refactoring | Copy as-is |
| auto-error-resolver | Automatically fix TypeScript compilation errors | Copy as-is |
| agent-monitor | Agent orchestration monitoring and reporting | Copy as-is |
| gap-finder | Full-stack gap analysis and compliance auditing | Copy as-is |

### Orchestration Agents (`orchestration/`)

| Agent | Purpose | Integration |
|-------|---------|-------------|
| project-coordinator | Top-level orchestrator for multi-agent collaboration and cross-team coordination | Copy as-is |

### Documentation Agents (`documentation/`)

| Agent | Purpose | Integration |
|-------|---------|-------------|
| documentation-architect | Create comprehensive project documentation | Copy as-is |
| web-research-specialist | Research technical issues online | Copy as-is |
| prd-converter | Convert PRDs to structured project docs | Copy as-is |
| doc-updater | Analyze session and propose documentation updates | Copy as-is |

### Testing Agents (`testing/`)

| Agent | Purpose | Integration |
|-------|---------|-------------|
| playwright-qa-agent | Execute user stories via Playwright with PASS/FAIL reports | Copy as-is |

### Analysis Agents (`analysis/`)

| Agent | Purpose | Integration |
|-------|---------|-------------|
| code-architecture-reviewer | Architecture review and structural analysis | Copy as-is |
| code-refactor-master | Advanced refactoring patterns and execution | Copy as-is |
| plan-reviewer | Review implementation plans for feasibility and risks | Copy as-is |
| gap-fixer | Fix implementation gaps found by gap-finder | Copy as-is |
| automation-scout | Detect repetitive patterns and suggest automations | Copy as-is |
| duplicate-checker | Check proposals for duplicates against existing docs | Copy as-is |
| followup-suggester | Identify incomplete work and prioritize follow-ups | Copy as-is |
| learning-extractor | Extract learnings from session in TIL format | Copy as-is |

---

## How to Integrate an Agent

### Standard Integration (Most Agents)

**Step 1: Copy the file**

```bash
cp showcase/.pi/agents/category/agent-name.md \
   your-project/.pi/agents/category/
```

**Step 2: Verify (optional)**

```bash
# Check for hardcoded paths
grep -n "~/git/\|/root/git/\|/Users/" your-project/.pi/agents/category/agent-name.md
```

**Step 3: Use it**
Ask Claude: "Use the [agent-name] agent to [task]"

That's it! Agents work immediately.

---

## Agent Communication & Subagent Execution

Agents can delegate specialized tasks to other agents using the Task tool, enabling complex orchestration workflows.

### Invoking a Subagent

From within an agent, use the Task tool:

```typescript
Task(
  subagent_type='agent-name',
  description='Brief task summary',
  prompt='Detailed instructions with context'
)
```

### When to Delegate

**Delegate when:**
- Task requires deep specialized knowledge beyond your expertise
- Task is autonomous with clear success criteria
- Task benefits from fresh context and focused attention
- Task is orthogonal to your core responsibility

**Do NOT delegate:**
- Tasks within your core expertise
- Tasks requiring iterative parent involvement
- Simple tasks (1-2 tool calls)
- Tasks where delegation overhead exceeds complexity

### Context Passing

Include in your subagent prompt:
- Parent agent name
- Task context and background
- Files involved
- Previous actions taken
- Expected output format
- Success criteria

**Example:**
```typescript
Task(
  subagent_type='reviewer',
  description='Review auth module',
  prompt=`
    Review the authentication module for ticket #456.

    Context:
    - Parent: backend-developer
    - Files: [list]
    - Implementation: JWT with passport

    Verify: NestJS patterns, Swagger docs, error handling
  `
)
```

### Agent Registry

See [agent-registry.json](agent-registry.json) for:
- Complete list of all agents
- Agent specializations
- Common orchestration patterns
- Team hierarchy and delegation rules

---

## When to Use Agents vs Skills

| Use Agents When...                | Use Skills When...              |
| --------------------------------- | ------------------------------- |
| Task requires multiple steps      | Need inline guidance            |
| Complex analysis needed           | Checking best practices         |
| Autonomous work preferred         | Want to maintain control        |
| Task has clear end goal           | Ongoing development work        |
| Example: "Review all controllers" | Example: "Creating a new route" |

**Both can work together:**

- Skill provides patterns during development
- Agent reviews the result when complete

---

## Creating Your Own Agents

Agents are markdown files with optional YAML frontmatter:

```markdown
# Agent Name

## Purpose

What this agent does

## Instructions

Step-by-step instructions for autonomous execution

## Tools Available

List of tools this agent can use

## Expected Output

What format to return results in
```

**Tips:**

- Be very specific in instructions
- Break complex tasks into numbered steps
- Specify exactly what to return
- Include examples of good output
- List available tools explicitly
- Place in the appropriate category folder

---

## Troubleshooting

### Agent not found

**Check:**

```bash
# Is agent file present?
find .pi/agents/ -name "[agent-name].md"
```

### Agent fails with path errors

**Check for hardcoded paths:**

```bash
grep "~/\|/root/\|/Users/" .pi/agents/**/[agent-name].md
```

**Fix:**

```bash
sed -i 's|~/git/.*project|$CLAUDE_PROJECT_DIR|g' .pi/agents/category/[agent-name].md
```

---

## Next Steps

1. **Browse agents above** - Find ones useful for your work
2. **Copy what you need** - Just the .md file
3. **Ask Claude to use them** - "Use [agent] to [task]"
4. **Create your own** - Follow the pattern for your specific needs

**Questions?** See [CLAUDE_INTEGRATION_GUIDE.md](../../CLAUDE_INTEGRATION_GUIDE.md)
