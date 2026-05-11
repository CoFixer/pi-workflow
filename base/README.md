# claude-base

Shared Claude Code configuration, commands, and knowledge for all projects.

---

## Table of Contents

- [What is Claude Code?](#what-is-claude-code)
- [Core Concepts](#core-concepts)
  - [Skills](#skills)
  - [Agents](#agents)
  - [Hooks](#hooks)
  - [Skills vs Agents](#skills-vs-agents-comparison)
- [The 3-Tier Architecture](#the-3-tier-architecture)
- [Folder Structure](#folder-structure)
- [Documentation & Templates](#documentation--templates)
  - [Why Two Folders?](#why-two-folders-claude-vs-claude-project)
  - [How .project Gets Created](#how-claude-project-gets-created)
  - [Purpose of Each Folder](#purpose-of-each-folder)
- [How Skills Are Triggered](#how-skills-are-triggered)
- [Creating Custom Skills](#creating-custom-skills)
- [Quick Reference](#quick-reference)
- [Reference Management](#reference-management)
- [Getting Started for New Team Members](#getting-started-for-new-team-members)
- [Troubleshooting](#troubleshooting)
- [For Maintainers](#for-maintainers)
- [Configuring settings.json](#configuring-settingsjson)
- [Plugins](#plugins)
- [MCP Servers](#mcp-servers)
- [Ralph Autonomous Workflows](#ralph-autonomous-workflows)
- [Advanced Topics](#advanced-topics)

---

## What is Claude Code?

Claude Code is Anthropic's official CLI tool for AI-assisted software development. Unlike web-based chat interfaces, Claude Code:

- **Runs in your terminal** with full access to your codebase
- **Reads and writes files** directly (with your permission)
- **Executes commands** like git, npm, docker
- **Understands context** from your project structure and documentation

### How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Claude Code Workflow                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   You ──► Terminal ──► Claude Code ──► Claude API ──► Response          │
│                │              │              │              │            │
│                │              │              │              │            │
│                ▼              ▼              ▼              ▼            │
│           Your prompt    Reads your     Processes      Claude writes    │
│           "Add a new     .pi/       with custom    code, runs       │
│            endpoint"     config         knowledge      commands         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Use Claude Code?

| Feature | Benefit |
|---------|---------|
| **Project Context** | Claude understands YOUR codebase, not generic patterns |
| **Custom Knowledge** | Skills teach Claude your team's conventions |
| **Automation** | Hooks run automatically at key moments |
| **Autonomous Agents** | Complex multi-step tasks run without intervention |
| **Version Controlled** | All config lives in `.pi/` - shared across team |

### Project-Level Configuration (CLAUDE.md)

Every project can have a `CLAUDE.md` file in the **root directory**. This file provides project-specific context and custom skill definitions that Claude reads automatically.

```
my-project/
├── CLAUDE.md              ← Project-level config (Claude reads this first)
├── .pi/               ← System configuration (skills, hooks, agents)
├── .project/       ← Project documentation (PRD, status, memory)
├── backend/
└── frontend/
```

**What goes in CLAUDE.md:**

```markdown
# Project Configuration

## Custom Skills

### my-custom-skill
Description of what this skill does...

**Usage:**
/my-custom-skill <args>

**Command File:** `.pi/commands/my-custom-skill.md`

## Project Context
- Key business rules
- Architecture decisions
- Team conventions
```

**Relationship between files:**

| File | Purpose | Scope |
|------|---------|-------|
| `CLAUDE.md` | Quick reference, custom skill docs | This project only |
| `.pi/settings.json` | System configuration | This project only |
| `.pi/base/` | Shared skills/agents/hooks | All projects (submodule) |
| `.project/` | PRD, documentation, status | This project only |

**Key Point**: CLAUDE.md is for human-readable project context. The `.pi/` folder is for system configuration (hooks, agents, skills).

---

## Core Concepts

The `.pi/` system has three core building blocks:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         How They Work Together                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   User types prompt                                                      │
│         │                                                                │
│         ▼                                                                │
│   ┌─────────────┐     Matches keywords?     ┌─────────────┐             │
│   │    HOOKS    │ ────────────────────────► │   SKILLS    │             │
│   │ (Automation)│     Injects knowledge     │ (Knowledge) │             │
│   └─────────────┘                           └─────────────┘             │
│         │                                          │                     │
│         ▼                                          ▼                     │
│   ┌─────────────────────────────────────────────────────────┐           │
│   │                      CLAUDE                              │           │
│   │           (Processes with enhanced context)              │           │
│   └─────────────────────────────────────────────────────────┘           │
│         │                                                                │
│         ▼                                                                │
│   Complex task?                                                          │
│         │                                                                │
│         ▼                                                                │
│   ┌─────────────┐                                                        │
│   │   AGENTS    │     Runs autonomously                                  │
│   │(Specialists)│     until task complete                                │
│   └─────────────┘                                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Skills

**What:** Markdown files containing specialized knowledge that Claude uses while working.

**Analogy:** Think of skills as "cheat sheets" or "playbooks" that guide Claude's behavior.

**When Used:** Skills are suggested (or required) based on keywords in your prompt or files you're editing.

**Example Skills:**
- `backend-dev-guidelines` - NestJS patterns, four-layer architecture
- `frontend-dev-guidelines` - React patterns, component structure
- `design-qa` - How to compare UI against Figma designs
- `e2e-test-generator` - Playwright test patterns

**Skill File Structure:**

```markdown
---
skill_name: backend-dev-guidelines
applies_to_local_project_only: true
auto_trigger_regex: [nestjs, api, endpoint, controller, service]
tags: [backend, nestjs]
---

# Backend Development Guidelines

## Architecture
Use four-layer architecture:
1. Controller (handles HTTP)
2. Service (business logic)
3. Repository (data access)
4. Entity (data model)

## Patterns
...
```

---

### Agents

**What:** Autonomous task executors that handle complex, multi-step operations.

**Analogy:** Think of agents as "specialists" you can delegate entire tasks to.

**When Used:** For complex tasks requiring multiple steps, file searches, or iterative work.

**Available Agents:**

| Agent | Purpose |
|-------|---------|
| `backend-developer` | End-to-end backend implementation from PRD |
| `frontend-developer` | Frontend features with API integration |
| `frontend-error-fixer` | Debug build and runtime errors |
| `auth-route-debugger` | Fix authentication issues |
| `auth-route-tester` | Test routes with JWT auth |
| `code-architecture-reviewer` | Review code for best practices |
| `documentation-architect` | Create comprehensive documentation |
| `refactor-planner` | Plan large refactoring operations |

**How to Use:**
Agents are invoked automatically by Claude when appropriate, or you can request them:

```
You: "Use the backend-developer agent to implement the user module from the PRD"
```

---

### Hooks

**What:** Shell scripts that run automatically at key moments in the Claude workflow.

**Analogy:** Think of hooks as "event listeners" that trigger automation.

**Hook Events:**

| Event | When It Runs | Example Use |
|-------|--------------|-------------|
| `UserPromptSubmit` | Before Claude sees your prompt | Inject skill suggestions |
| `PreToolUse` | Before Edit/Write executes | Enforce guardrails |
| `PostToolUse` | After tool completes | Track file changes |
| `Stop` | When you press Escape | Run TypeScript checks |

**Example Hook Flow:**

```
You type: "Create a new user endpoint"
                  │
                  ▼
    ┌─────────────────────────────┐
    │   UserPromptSubmit Hook     │
    │   skill-activation-prompt   │
    └─────────────────────────────┘
                  │
                  ▼
    Matches "endpoint" keyword
                  │
                  ▼
    Suggests: backend-dev-guidelines
                  │
                  ▼
    Claude sees: [skill context] + your prompt
```

---

### Skills vs Agents Comparison

| Aspect | Skills | Agents |
|--------|--------|--------|
| **Purpose** | Provide knowledge/patterns | Execute complex tasks |
| **Autonomy** | Passive (Claude reads them) | Active (runs independently) |
| **Use Case** | "How should I do X?" | "Do X for me" |
| **Scope** | Single concept/pattern | Multi-step workflows |
| **Invocation** | Auto-triggered by keywords | Delegated by Claude or user |
| **Example** | "Use NestJS patterns for services" | "Implement entire user module" |

**Decision Guide:**

```
Need to teach Claude a pattern?     → Skill
Need Claude to do something complex? → Agent
Need automation at a specific event? → Hook
```

---

## The 3-Tier Architecture

The `.pi/` configuration uses a **3-tier inheritance model** via Git submodules:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         3-Tier Architecture                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │              TIER 3: Project-Specific (Highest Priority)         │   │
│   │                                                                   │   │
│   │   .pi/agents/          Your project's custom agents          │   │
│   │   .pi/skills/          Your project's custom skills          │   │
│   │   .pi/hooks/           Your project's custom hooks           │   │
│   │   .pi/settings.json    Project configuration                 │   │
│   │                                                                   │   │
│   │   ► Overrides lower tiers                                        │   │
│   │   ► Project-specific customizations                              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │            TIER 2: Framework-Specific (Medium Priority)          │   │
│   │                                                                   │   │
│   │   .pi/nestjs/          NestJS patterns, agents, skills       │   │
│   │   .pi/react/           React patterns, agents, skills        │   │
│   │                                                                   │   │
│   │   ► Framework best practices                                     │   │
│   │   ► Tech-stack specific knowledge                                │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │               TIER 1: Base (Lowest Priority)                     │   │
│   │                                                                   │   │
│   │   .pi/base/            Shared across ALL projects            │   │
│   │   ├── agents/              Generic agents (error-fixer, etc.)    │   │
│   │   ├── commands/            Slash commands (/commit, /ralph)      │   │
│   │   ├── docs/                Generic documentation                 │   │
│   │   ├── hooks/               Core hooks (skill-activation)         │   │
│   │   ├── skills/              Generic skills (error-tracking)       │   │
│   │   └── templates/           Project templates                     │   │
│   │                                                                   │   │
│   │   ► Foundation for all projects                                  │   │
│   │   ► Team-wide conventions                                        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### How Tiers Work Together

1. **Inheritance**: Higher tiers can override lower tiers
2. **Composition**: Each tier adds its own knowledge
3. **Git Submodules**: Tiers 1 & 2 are separate repos, pulled in as submodules

**Git Submodule Structure:**

```
.pi/
├── .gitmodules           # Defines submodule URLs
├── base/                 → github.com/CoFixer/claude-base (Tier 1)
├── nestjs/               → github.com/CoFixer/claude-nestjs (Tier 2)
├── react/                → github.com/CoFixer/claude-react (Tier 2)
├── agents/               # Project-specific (Tier 3)
├── skills/               # Project-specific (Tier 3)
├── hooks/                # Project-specific (Tier 3)
└── settings.json         # Project configuration
```

**Updating Submodules:**

```bash
# Initialize submodules after cloning
git submodule update --init --recursive

# Update to latest versions
git submodule update --remote

# Or use the /pull command
/pull
```

---

## Folder Structure

Complete annotated structure of the `.pi/` system:

```
.pi/
│
├── base/                           # TIER 1: Shared base (git submodule)
│   ├── README.md                   # This file
│   ├── agents/                     # Generic agents
│   │   ├── code-architecture-reviewer.md
│   │   ├── documentation-architect.md
│   │   ├── refactor-planner.md
│   │   └── README.md
│   ├── commands/                   # Slash commands (categorized)
│   │   ├── design/                 # Design workflow (/figma-extract-screens, /prd-to-design-prompts)
│   │   ├── dev/                    # Development (/ralph, /fullstack, /new-project)
│   │   ├── git/                    # Git operations (/commit, /pull, /git-create)
│   │   ├── operation/              # Operations (/generate-prd, /generate-ppt)
│   │   └── utility/                # Utilities (/md-to-pdf, /notify-slack)
│   ├── docs/                       # Generic documentation
│   │   ├── BEST_PRACTICES.md
│   │   └── NEW_PROJECT_SETUP_GUIDE.md
│   ├── hooks/                      # Core hooks
│   │   ├── skill-activation-prompt.sh   # Auto-suggest skills
│   │   ├── post-tool-use-tracker.sh     # Track file changes
│   │   └── README.md
│   ├── skills/                     # Generic skills
│   │   ├── skill-developer/        # Meta-skill for creating skills
│   │   ├── error-tracking/         # Sentry patterns
│   │   └── README.md
│   └── templates/                  # Project templates
│       └── claude-project/
│           ├── docs/               # Doc templates
│           ├── memory/             # Context templates
│           └── plans/              # Plan templates
│
├── nestjs/                         # TIER 2: NestJS (git submodule)
│   ├── agents/
│   │   ├── backend-developer.md
│   │   ├── auth-route-debugger.md
│   │   └── auth-route-tester.md
│   ├── guides/                     # 12 in-depth guides
│   │   ├── architecture-overview.md
│   │   ├── routing-and-controllers.md
│   │   └── ...
│   └── skills/
│       ├── database-schema-designer.md
│       ├── e2e-test-generator.md
│       └── api-docs-generator.md
│
├── react/                          # TIER 2: React (git submodule)
│   ├── agents/
│   │   ├── frontend-developer.md
│   │   └── frontend-error-fixer.md
│   ├── guides/                     # 13 in-depth guides
│   │   ├── component-patterns.md
│   │   ├── styling-guide.md
│   │   └── ...
│   └── skills/
│       ├── design-qa-patterns.md
│       ├── convert-figma-to-react.md
│       └── e2e-test-generator.md
│
├── agents/                         # TIER 3: Project-specific agents
│   ├── backend-developer.md        # Customized for this project
│   └── README.md
│
├── skills/                         # TIER 3: Project-specific skills
│   ├── skill-rules.json            # Trigger configuration
│   └── README.md
│
├── hooks/                          # TIER 3: Project-specific hooks
│   ├── tsc-check.sh                # TypeScript validation
│   └── README.md
│
├── settings.json                   # Main configuration
└── settings.local.json             # Local overrides (gitignored)
```

---

## Documentation & Templates

### Why Two Folders? `.pi/` vs `.project/`

The system separates **configuration** from **project knowledge**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Two-Folder Architecture                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   .pi/                          .project/                     │
│   ─────────                         ────────────────                     │
│   HOW Claude works                  WHAT Claude knows                    │
│                                                                          │
│   ├── Settings & config             ├── Project documentation            │
│   ├── Skills (patterns)             ├── PRD & requirements               │
│   ├── Agents (executors)            ├── Implementation status            │
│   ├── Hooks (automation)            ├── Decisions & learnings            │
│   └── Commands (workflows)          └── Secrets (gitignored)             │
│                                                                          │
│   SHARED via submodules             PROJECT-SPECIFIC content             │
│   (team-wide patterns)              (this project only)                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Insight**:
- `.pi/` = Reusable across projects (via git submodules)
- `.project/` = Unique to this project (committed to project repo)

---

### How `.project/` Gets Created

When you run `/new-project`, templates from `.pi/base/templates/claude-project/` are copied to the project root:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Template Copy Process                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   SOURCE (in claude-base)              DESTINATION (in your project)    │
│                                                                          │
│   .pi/base/templates/              my-project/                       │
│   └── claude-project/         ──►      └── .project/              │
│       ├── docs/                            ├── docs/                     │
│       │   └── *.template.md                │   └── *.md (variables replaced)
│       ├── memory/                          ├── memory/                   │
│       │   └── *.template.md                │   └── *.md                  │
│       ├── plans/                           ├── plans/                    │
│       └── prd/                             └── prd/                      │
│                                                                          │
│   $PROJECT_NAME, $BACKEND, $DATE are replaced with actual values        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**What Happens During `/new-project`:**

1. You run `/new-project my-app`
2. Templates are copied from `.pi/base/templates/claude-project/`
3. `.template.md` suffix is removed from filenames
4. Variables (`$PROJECT_NAME`, `$BACKEND`, etc.) are replaced with actual values
5. Result: A ready-to-use `.project/` folder in your project root

---

### `.project/` Folder Structure

Project documentation lives in `.project/` (separate from `.pi/`):

```
.project/
│
├── docs/                           # Technical documentation
│   ├── PROJECT_KNOWLEDGE.md        # Core project info for Claude
│   ├── PROJECT_API.md              # API endpoint documentation
│   ├── PROJECT_DATABASE.md         # Database schema docs
│   └── PROJECT_API_INTEGRATION.md  # Frontend-backend integration
│
├── memory/                         # Claude's memory/context
│   ├── DECISIONS.md                # Architecture decisions made
│   ├── LEARNINGS.md                # Patterns discovered
│   └── PREFERENCES.md              # User preferences
│
├── plans/                          # Implementation tracking
│   ├── SCREEN_IMPLEMENTATION_STATUS.md   # Frontend screens
│   ├── API_IMPLEMENTATION_STATUS.md      # Backend endpoints
│   └── E2E_TEST_STATUS.md               # Test coverage
│
├── prd/                            # Product requirements
│   └── prd.md                      # Converted from PDF
│
└── secrets/                        # Credentials (gitignored)
    └── .env.local
```

### Purpose of Each Folder

| Folder | Purpose | Who Updates It |
|--------|---------|----------------|
| `docs/` | Technical documentation that Claude reads for context | You & Claude |
| `memory/` | Persistent context across sessions (decisions, learnings) | Claude (primarily) |
| `plans/` | Implementation status tracking for /ralph workflows | Claude (automatically) |
| `prd/` | Product requirements document | You (via /pdf-to-prd) |
| `secrets/` | API keys, credentials (gitignored) | You |

### Key Files Explained

**PROJECT_KNOWLEDGE.md** - The most important file
- Claude reads this first to understand your project
- Contains: Tech stack, architecture, coding conventions, business context
- Update this when major decisions change

**DECISIONS.md** - Architecture decision record
- Claude logs important decisions here
- Helps maintain consistency across sessions
- Format: Date, decision, reasoning, alternatives considered

**LEARNINGS.md** - Patterns Claude has discovered
- Codebase-specific patterns and gotchas
- Helps Claude avoid repeating mistakes
- Updated as Claude works on your project

**Status Files (plans/)** - Workflow progress tracking
- Used by `/ralph` for autonomous loops
- Tracks: Item, status, result, date
- Auto-updated during QA workflows

### Template Variables

When creating new projects, templates use these placeholders:

| Variable | Description | Example |
|----------|-------------|---------|
| `$PROJECT_NAME` | Lowercase, hyphenated | `my-app` |
| `$BACKEND` | Backend framework | `nestjs` |
| `$FRONTENDS` | Frontend framework(s) | `react, react-native` |
| `$DATE` | Creation date | `2025-01-10` |

---

## How Skills Are Triggered

Skills are automatically suggested based on your prompts and actions.

### Trigger Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Skill Trigger Flow                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. You type: "I need to create a new API endpoint for users"          │
│                              │                                           │
│                              ▼                                           │
│   2. UserPromptSubmit hook fires                                         │
│      └── skill-activation-prompt.sh runs                                │
│                              │                                           │
│                              ▼                                           │
│   3. Hook reads .pi/skills/skill-rules.json                         │
│      └── Checks keywords: "endpoint", "api", "users"                    │
│      └── Checks patterns: "(create|add).*(endpoint|api)"                │
│                              │                                           │
│                              ▼                                           │
│   4. Match found: backend-dev-guidelines                                 │
│      └── Hook outputs: "Recommended skill: backend-dev-guidelines"      │
│                              │                                           │
│                              ▼                                           │
│   5. Claude sees: [skill suggestion] + your original prompt             │
│      └── Claude may invoke the Skill tool                               │
│      └── Or respond with skill-informed knowledge                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### skill-rules.json Configuration

The `skill-rules.json` file controls when skills are suggested:

```json
{
  "version": "1.0",
  "skills": {
    "backend-dev-guidelines": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "high",
      "promptTriggers": {
        "keywords": ["nestjs", "api", "endpoint", "controller", "service"],
        "intentPatterns": ["(create|add|implement).*(endpoint|api|route)"]
      },
      "fileTriggers": {
        "pathPatterns": ["backend/**/*.ts"]
      }
    }
  }
}
```

**Configuration Options:**

| Field | Values | Description |
|-------|--------|-------------|
| `type` | `domain`, `guardrail` | Domain = knowledge, Guardrail = enforcement |
| `enforcement` | `suggest`, `block`, `warn` | How strictly to enforce |
| `priority` | `critical`, `high`, `medium`, `low` | Order of suggestions |
| `keywords` | Array of strings | Case-insensitive substring matching |
| `intentPatterns` | Array of regex | Match implicit intent |
| `pathPatterns` | Array of globs | Match file paths |

<details>
<summary><b>Advanced: Creating Guardrail Skills</b></summary>

Guardrail skills can **block** tool execution until conditions are met:

```json
{
  "database-verification": {
    "type": "guardrail",
    "enforcement": "block",
    "priority": "critical",
    "fileTriggers": {
      "pathPatterns": ["**/schema.prisma", "**/*migration*"],
      "contentPatterns": ["prisma\\.", "\\.findMany\\("]
    },
    "blockMessage": "BLOCKED - Verify database structure first\nFile: {file_path}",
    "skipConditions": {
      "sessionSkillUsed": true,
      "fileMarkers": ["@verified"],
      "envOverride": "SKIP_DB_VERIFICATION"
    }
  }
}
```

**Exit Codes:**
- `0` = Allow (PreToolUse proceeds)
- `2` = Block (PreToolUse blocked, message shown to Claude)

**Skip Conditions:**
- `sessionSkillUsed`: Don't block again if skill was used this session
- `fileMarkers`: Skip if file contains comment like `// @verified`
- `envOverride`: Skip if environment variable is set

</details>

---

## Creating Custom Skills

Follow this step-by-step tutorial to create your own skills.

### Quick Start (5 Steps)

#### Step 1: Create Skill Directory

```bash
mkdir -p .pi/skills/my-new-skill
```

#### Step 2: Create SKILL.md

```markdown
---
skill_name: my-new-skill
applies_to_local_project_only: true
auto_trigger_regex: [keyword1, keyword2, 'multi word phrase']
tags: [category1, category2]
related_skills: []
---

# My New Skill

## Purpose
Describe what this skill helps with.

## When to Use
List the scenarios where this skill applies.

## Quick Start
Most important patterns and examples.

## Detailed Sections
More comprehensive information organized by topic.
```

#### Step 3: Add to skill-rules.json

Edit `.pi/skills/skill-rules.json`:

```json
{
  "skills": {
    "my-new-skill": {
      "type": "domain",
      "enforcement": "suggest",
      "priority": "medium",
      "promptTriggers": {
        "keywords": ["keyword1", "keyword2"],
        "intentPatterns": ["(create|add).*(thing)"]
      }
    }
  }
}
```

#### Step 4: Test Triggers

Test that your skill activates correctly:

```bash
# Start Claude and try prompts containing your keywords
claude
> "I need to create a new thing with keyword1"
# Should see skill suggestion in Claude's context
```

#### Step 5: Commit and Share

```bash
git add .pi/skills/my-new-skill/
git commit -m "feat: Add my-new-skill for X scenarios"
git push
```

<details>
<summary><b>Advanced: Multi-File Skills</b></summary>

For complex topics, split content across multiple files:

```
.pi/skills/backend-dev-guidelines/
├── SKILL.md                        # Main file (keep under 500 lines)
└── resources/
    ├── architecture-overview.md    # Deep dive topic 1
    ├── routing-and-controllers.md  # Deep dive topic 2
    ├── services-and-repositories.md
    └── testing-patterns.md
```

**In SKILL.md, reference resources:**

```markdown
## Architecture

See [Architecture Overview](./resources/architecture-overview.md) for details.

### Quick Reference
(Brief summary here, link to resource for depth)
```

</details>

<details>
<summary><b>Advanced: Skill Best Practices</b></summary>

**The 500-Line Rule:**
- Keep main SKILL.md under 500 lines
- Use progressive disclosure: essentials in main file, details in resources
- Add table of contents to files over 100 lines

**Keyword Selection:**
- Use specific, unique keywords (not "system" or "work")
- Prefer 3-5 strong keywords over many weak ones
- Test with real prompts to avoid false positives

**Intent Patterns:**
- Use patterns for implicit actions: `(create|add|implement).*(feature)`
- Keep patterns narrow to prevent over-matching
- Test edge cases

**Cross-References:**
- Link related skills in `related_skills` array
- Help users discover complementary knowledge
- Keep the knowledge graph connected

**Documentation:**
- Explain "why" not just "what"
- Include real examples from your codebase
- Update when patterns change

</details>

---

## Quick Reference

### Available Commands

| Command | Description |
|---------|-------------|
| `/new-project <name>` | Create complete new project with Claude config |
| `/commit` | Smart git commit with branch and PR management |
| `/pull` | Pull latest changes for all submodules |
| `/ralph <workflow> <project>` | Run autonomous QA/testing loops |
| `/pdf-to-prd <file>` | Convert PRD PDF to structured markdown |
| `/create-strategic-plan` | Create strategic plan with task breakdown |
| `/dev-docs-update` | Update dev documentation before context compaction |
| `/figma-extract-screens` | Extract Figma screen names and node IDs |
| `/init-claude-config` | Initialize Claude config only (advanced) |
| `/init-workspace` | Initialize .project folder with templates |
| `/validate-claude-config` | Validate .claude configuration structure |
| `/build-registry` | Build centralized registry of skills, commands, and cross-references |
| `/validate-references` | Check for broken or stale references in documentation |
| `/create-mono-repo` | Clone boilerplate repos into mono-repo (advanced) |
| `/sync-from-base` | Sync docs, skills, hooks, templates from base/ submodule |

### Ralph Workflows

| Workflow | Stack | Purpose |
|----------|-------|---------|
| `design-qa` | react | Compare UI against Figma designs |
| `e2e-tests` | react | Generate Playwright E2E tests |
| `backend-qa` | nestjs | Validate API endpoints |
| `api-docs` | nestjs | Update Swagger documentation |

**Usage:**
```bash
/ralph design-qa frontend-coach-dashboard --incremental
/ralph e2e-tests frontend --category auth
```

### Agent Quick Reference

| Agent | Use For |
|-------|---------|
| `backend-developer` | Full backend implementation from PRD |
| `frontend-developer` | Frontend features with API integration |
| `frontend-error-fixer` | Fix build/runtime errors |
| `auth-route-debugger` | Debug 401/403 errors |
| `auth-route-tester` | Test authenticated routes |
| `code-architecture-reviewer` | Review code quality |
| `documentation-architect` | Create comprehensive docs |
| `refactor-planner` | Plan large refactoring |

### Common Workflows

**Feature Development:**
```
1. Read PRD:  Read .project/prd/prd.md
2. Plan:      "Plan implementing X feature"
3. Implement: "Implement the X feature"
4. Test:      /ralph e2e-tests frontend
5. Commit:    /commit
```

**Bug Fixing:**
```
1. Reproduce: "I'm seeing error X when Y"
2. Debug:     Claude investigates with agents
3. Fix:       Claude proposes and implements fix
4. Verify:    "Run the tests for this component"
5. Commit:    /commit
```

**Design QA:**
```
1. Select screen in Figma
2. Run: /ralph design-qa frontend --incremental
3. Review: Check SCREEN_IMPLEMENTATION_STATUS.md
4. Fix:    Claude auto-fixes pixel-perfect issues
```

---

## Reference Management

As the `.pi/` configuration grows with more skills, commands, and agents, keeping track of cross-references becomes challenging. The Reference Management System solves this with a centralized registry.

### The Problem

When you add, update, or remove a skill/command:
1. **Finding references** - You need to manually search all docs that reference it
2. **Keeping docs in sync** - CLAUDE.md, README.md, skill files can get out of sync
3. **Detecting broken refs** - No way to know when removed/renamed skills leave dangling references

### The Solution: Centralized Registry

The system uses a `claude-registry.json` file that indexes all resources:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Reference Management Flow                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   /build-registry                                                        │
│         │                                                                │
│         ▼                                                                │
│   ┌─────────────────┐                                                    │
│   │ Scan .pi/   │  Discovers all commands, skills, agents           │
│   │ directories     │  from all tiers (base, react, nestjs, project)    │
│   └────────┬────────┘                                                    │
│            │                                                             │
│            ▼                                                             │
│   ┌─────────────────┐                                                    │
│   │ Parse skill-    │  Extracts triggers, descriptions, file paths      │
│   │ rules.json      │                                                    │
│   └────────┬────────┘                                                    │
│            │                                                             │
│            ▼                                                             │
│   ┌─────────────────┐                                                    │
│   │ Scan for refs   │  Finds where each resource is documented          │
│   │ in docs         │  (CLAUDE.md, README files, etc.)                  │
│   └────────┬────────┘                                                    │
│            │                                                             │
│            ▼                                                             │
│   ┌─────────────────┐                                                    │
│   │ Output registry │  claude-registry.json with full cross-refs        │
│   └─────────────────┘                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Registry Structure

The `claude-registry.json` contains:

```json
{
  "version": "1.0",
  "generated": "2026-01-10T00:00:00Z",
  "resources": {
    "commands": {
      "ralph": {
        "source": "base",
        "file": ".pi/base/commands/dev/ralph.md",
        "description": "Run autonomous workflow loops",
        "references": {
          "documentedIn": ["CLAUDE.md", ".pi/base/README.md"],
          "relatedSkills": ["design-qa-patterns", "e2e-test-generator"]
        }
      }
    },
    "skills": { ... },
    "agents": { ... },
    "guides": { ... }
  },
  "submodules": { ... }
}
```

### Commands

| Command | Purpose |
|---------|---------|
| `/build-registry` | Rebuild registry after adding/modifying resources |
| `/validate-references` | Check for broken or stale references |

### Workflow

**After adding/modifying a skill or command:**
```bash
/build-registry
git add .pi/claude-registry.json
git commit -m "chore: update claude registry"
```

**Before releasing or to check health:**
```bash
/validate-references
```

**To update CLAUDE.md generated sections:**
```bash
/build-registry --generate-docs
```

### Validation Report

Running `/validate-references` produces a report like:

```
=== Reference Validation Report ===

BROKEN REFERENCES:
  - CLAUDE.md:25 references "old-skill" (NOT IN REGISTRY)
  - .pi/base/README.md:84 links to "./missing-file.md" (NOT FOUND)

ORPHANED RESOURCES (in registry but not documented):
  - organize-types (react) - not in any README

STALE DOCUMENTATION:
  - design-qa-patterns listed as documented in CLAUDE.md but not found

Overall Status: ISSUES FOUND
```

### Generated Documentation

CLAUDE.md can include auto-generated sections using markers:

```markdown
<!-- BEGIN GENERATED: commands -->
## Custom Commands
...auto-generated content...
<!-- END GENERATED: commands -->
```

Run `/build-registry --generate-docs` to update these sections from the registry.

### Key Files

| File | Purpose |
|------|---------|
| `.pi/claude-registry.json` | Centralized index (committed to git) |
| `.pi/claude-registry.schema.json` | JSON Schema for validation |
| `.pi/base/commands/build-registry.md` | Registry builder command |
| `.pi/base/commands/validate-references.md` | Reference validator command |

---

## Getting Started for New Team Members

### Prerequisites

1. **Install Claude Code**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Install GitHub CLI**
   ```bash
   # macOS
   brew install gh

   # Ubuntu/Debian
   sudo apt install gh
   ```

3. **Authenticate**
   ```bash
   # GitHub
   gh auth login

   # Claude Code
   claude
   # Follow prompts to authenticate with Anthropic
   ```

### First-Day Checklist

- [ ] Install prerequisites (above)
- [ ] Clone project repository
- [ ] Initialize submodules:
  ```bash
  git submodule update --init --recursive
  ```
- [ ] Start Claude Code:
  ```bash
  cd your-project
  claude
  ```
- [ ] Try your first command:
  ```
  > What commands are available?
  ```

### First Skills to Try

**1. Pull latest changes:**
```
/pull
```

**2. Create a commit:**
```
/commit
```
(Make some changes first, then run this)

**3. Run design QA:**
```
/ralph design-qa frontend --list
```

**4. Ask about the project:**
```
> What is the architecture of this project?
> How does authentication work?
> What patterns does the backend use?
```

---

## Troubleshooting

### "Command not found" when running /new-project

**Cause**: You're not in a directory with `.pi/` folder.

**Solution**: Navigate to the project or `claude-base`:
```bash
cd ~/claude-base  # Or your project directory
claude
/new-project my-app
```

### "gh: command not found"

**Cause**: GitHub CLI is not installed.

**Solution**:
```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Then authenticate
gh auth login
```

### "Repository already exists"

**Cause**: A repo with that name already exists on GitHub.

**Solution**: Choose a different project name or delete the existing repo:
```bash
gh repo delete CoFixer/my-app-name-claude --yes
```

### Submodule Issues After Cloning

**Cause**: Submodules weren't initialized.

**Solution**:
```bash
git submodule update --init --recursive
```

### Skills Not Triggering

**Cause**: Keywords don't match or hook isn't configured.

**Solutions**:
1. Check keyword spelling in `skill-rules.json`
2. Verify hook is registered in `settings.json`
3. Test with explicit skill invocation:
   ```
   > Use skill: backend-dev-guidelines
   ```

### Agent Not Found

**Cause**: Agent file doesn't exist or isn't accessible.

**Solutions**:
1. Check that the agent file exists in `.pi/agents/`
2. Verify submodules are up to date: `git submodule update --remote`
3. Check file permissions

---

## For Maintainers

### Repository Structure

```
claude-base/
├── agents/           # Reusable agent definitions
├── commands/         # Slash commands
├── docs/             # Generic documentation
├── hooks/            # Git and Claude hooks
├── skills/           # Shared skills
└── templates/        # Project templates
    └── claude-project/  # .project folder templates
```

### Related Repositories

#### Claude Config Repos (Submodules)

| Repo | Purpose |
|------|---------|
| [claude-base](https://github.com/CoFixer/claude-base) | Shared base (this repo) |
| [claude-nestjs](https://github.com/CoFixer/claude-nestjs) | NestJS patterns |
| [claude-react](https://github.com/CoFixer/claude-react) | React patterns |
| [claude-react-native](https://github.com/CoFixer/claude-react-native) | React Native patterns |

#### Boilerplate Repos (Cloned by /new-project)

| Repo | Purpose |
|------|---------|
| [nestjs-starter-kit](https://github.com/CoFixer/nestjs-starter-kit) | NestJS backend |
| [react-starter-kit](https://github.com/CoFixer/react-starter-kit) | React frontend |
| [react-native-starter-kit](https://github.com/CoFixer/react-native-starter-kit) | React Native mobile |

### Syncing from Base Submodule

This repo uses a **hybrid sync approach**:

| Directory | Sync Method | Override Allowed |
|-----------|-------------|------------------|
| `commands/` | Direct tracking | No (always matches base/) |
| `docs/` | File copy | Yes (modify at root level) |
| `skills/` | File copy | Yes (modify at root level) |
| `hooks/` | File copy | Yes (modify at root level) |
| `templates/` | File copy | Yes (modify at root level) |

**To sync updates from base/:**
```bash
/sync-from-base              # Sync all
/sync-from-base --dry-run    # Preview changes
/sync-from-base docs         # Sync specific directory
```

Or run the script directly:
```bash
bash scripts/sync-from-base.sh
```

### Updating Commands

1. Edit files in `commands/` directory
2. Commit and push to this repo
3. All team members get updates via `git pull` or `/pull`

### Template Variables

Templates in `templates/claude-project/` use these placeholders:

| Variable | Description |
|----------|-------------|
| `$PROJECT_NAME` | Project name (lowercase, hyphenated) |
| `$BACKEND` | Selected backend framework |
| `$FRONTENDS` | Selected frontend frameworks |

### Adding New Agents

1. Create `agents/my-agent.md` following existing patterns
2. Add entry to `agents/README.md`
3. Update the Task tool's agent descriptions (if applicable)

### Adding New Skills

1. Create `skills/my-skill/SKILL.md`
2. Add entry to `skills/skill-rules.json`
3. Update `skills/README.md`
4. Test with sample prompts

### Adding New Commands

1. Create `commands/my-command.md`
2. Follow the format of existing commands
3. Update this README's command table
4. Test thoroughly before pushing

---

## Configuring settings.json

The `.pi/settings.json` file controls Claude Code's behavior for your project.

### Basic Structure

```json
{
  "permissions": {
    "allow": ["Edit:*", "Write:*", "Bash:*"],
    "defaultMode": "acceptEdits"
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": ["mysql", "playwright"],
  "hooks": { ... },
  "enabledPlugins": { ... }
}
```

### Permission Levels

| Mode | Description | Use Case |
|------|-------------|----------|
| `acceptEdits` | Claude can edit files without confirmation | Trusted development |
| `allowEdits` | Claude asks before each edit | More cautious workflow |
| `blockEdits` | Claude cannot make file changes | Read-only analysis |

**Permission patterns:**
```json
{
  "permissions": {
    "allow": [
      "Edit:*",              // Allow editing any file
      "Edit:backend/**",     // Allow editing only backend files
      "Write:*.md",          // Allow creating markdown files
      "Bash:npm *",          // Allow npm commands
      "Bash:git *"           // Allow git commands
    ],
    "deny": [
      "Bash:rm -rf *",       // Block dangerous commands
      "Edit:.env*"           // Protect environment files
    ]
  }
}
```

### Hook Registration

Hooks are registered in the `hooks` object by event type:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.pi/base/hooks/skill-activation-prompt.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|MultiEdit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.pi/base/hooks/post-tool-use-tracker.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.project/hooks/tsc-check.sh"
          }
        ]
      }
    ]
  }
}
```

**Hook events:**

| Event | When | Common Uses |
|-------|------|-------------|
| `UserPromptSubmit` | Before Claude sees prompt | Skill suggestions, context injection |
| `PreToolUse` | Before tool executes | Validation, guardrails |
| `PostToolUse` | After tool completes | File tracking, caching |
| `Stop` | When user presses Escape | TypeScript checks, cleanup |

**Matchers** (for PostToolUse): `"Edit|MultiEdit|Write"` filters which tools trigger the hook.

### MCP Server Configuration

MCP (Model Context Protocol) servers extend Claude's capabilities:

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "mysql",              // Database queries
    "sequential-thinking", // Step-by-step reasoning
    "playwright"          // Browser automation
  ]
}
```

| Server | Purpose |
|--------|---------|
| `mysql` | Query MySQL databases directly |
| `sequential-thinking` | Enhanced reasoning for complex tasks |
| `playwright` | Browser automation and testing |
| `figma` | Figma design file access |

### Plugin Management

Plugins add autonomous capabilities:

```json
{
  "enabledPlugins": {
    "ralph-wiggum@claude-code-plugins": true
  }
}
```

**Available plugins:**
- `ralph-wiggum` - Autonomous iterative loops for QA/testing workflows

<details>
<summary><b>Advanced: settings.local.json Overrides</b></summary>

Create `.pi/settings.local.json` for local-only overrides (gitignored):

```json
{
  "permissions": {
    "defaultMode": "allowEdits"
  },
  "enabledMcpjsonServers": [
    "mysql"
  ]
}
```

**Use cases:**
- Different permission levels for different team members
- Local-only MCP servers (database credentials)
- Disable hooks during debugging
- Override for specific machines

**Priority order:**
1. `settings.local.json` (highest)
2. `settings.json`
3. Default Claude Code settings (lowest)

</details>

---

## Plugins

Plugins extend Claude Code with autonomous capabilities.

### What Are Plugins?

Plugins are add-ons that give Claude new abilities beyond the standard tools. They can run autonomous loops, integrate with external services, or add specialized workflows.

### Available Plugins

| Plugin | Purpose | Enable Command |
|--------|---------|----------------|
| `ralph-wiggum` | Autonomous QA/testing loops | See settings.json |

### Enabling/Disabling Plugins

In `.pi/settings.json`:

```json
{
  "enabledPlugins": {
    "ralph-wiggum@claude-code-plugins": true,
    "another-plugin@source": false
  }
}
```

### Ralph Wiggum Plugin

The Ralph Wiggum plugin enables autonomous iterative workflows. Use it with the `/ralph` command:

```bash
/ralph design-qa frontend-coach-dashboard --incremental
```

See [Ralph Workflows](#ralph-autonomous-workflows) for detailed usage.

---

## MCP Servers

MCP (Model Context Protocol) servers extend Claude's capabilities with external integrations.

### What Is MCP?

MCP allows Claude to interact with external services like databases, browsers, and design tools. Each server provides specific tools that Claude can use during conversations.

### Available MCP Servers

| Server | Tools Provided | Use Case |
|--------|---------------|----------|
| `mysql` | Query, describe tables | Database exploration and queries |
| `sequential-thinking` | Think step-by-step | Complex problem solving |
| `playwright` | Browser automation | E2E testing, screenshots |
| `figma` | Design file access | Design-to-code workflows |

### Enabling MCP Servers

In `.pi/settings.json`:

```json
{
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "mysql",
    "playwright"
  ]
}
```

### When to Enable Each

| Server | Enable When |
|--------|-------------|
| `mysql` | Working with database queries or schema |
| `sequential-thinking` | Complex multi-step planning |
| `playwright` | E2E test generation or browser automation |
| `figma` | Design QA or Figma-to-code workflows |

**Note**: MCP servers may require additional configuration (e.g., database credentials in environment variables).

---

## Ralph Autonomous Workflows

Ralph is an autonomous workflow system that runs iterative tasks until completion.

### How Ralph Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Ralph Workflow Loop                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   /ralph design-qa frontend                                              │
│         │                                                                │
│         ▼                                                                │
│   ┌─────────────────┐                                                    │
│   │ Load Status File │  ← .project/plans/frontend/               │
│   │ & Skill          │    SCREEN_IMPLEMENTATION_STATUS.md                │
│   └────────┬────────┘                                                    │
│            │                                                             │
│            ▼                                                             │
│   ┌─────────────────┐                                                    │
│   │ Process Item #1  │  Compare screen to Figma                         │
│   │ Update Status    │  Record: ✅ PASS or ❌ FAIL                       │
│   └────────┬────────┘                                                    │
│            │                                                             │
│            ▼                                                             │
│   ┌─────────────────┐                                                    │
│   │ Process Item #2  │                                                   │
│   │ Update Status    │                                                   │
│   └────────┬────────┘                                                    │
│            │                                                             │
│            ▼                                                             │
│         ...                                                              │
│            │                                                             │
│            ▼                                                             │
│   ┌─────────────────┐                                                    │
│   │ All Items Done   │  OR max iterations reached                        │
│   │ Output Summary   │                                                   │
│   └─────────────────┘                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Available Workflows

| Workflow | Stack | Description | Status File |
|----------|-------|-------------|-------------|
| `design-qa` | react | Compare UI screens against Figma | SCREEN_IMPLEMENTATION_STATUS.md |
| `e2e-tests` | react | Generate Playwright E2E tests | E2E_TEST_STATUS.md |
| `backend-qa` | nestjs | Validate API endpoints | API_QA_STATUS.md |
| `api-docs` | nestjs | Update Swagger documentation | API_DOCS_STATUS.md |

### Usage Examples

**Full run (all items):**
```bash
/ralph design-qa frontend-coach-dashboard
```

**Incremental (only pending/failed):**
```bash
/ralph e2e-tests frontend --incremental
```

**Single category:**
```bash
/ralph backend-qa backend --category auth
```

**Dry run (preview without executing):**
```bash
/ralph design-qa frontend --dry-run
```

**List available workflows:**
```bash
/ralph --list
```

### Status File Format

All Ralph workflows track progress in status files:

```markdown
# Design QA Status - frontend-coach-dashboard

## Quick Summary

| Category | Completed | Pending | Total |
|----------|-----------|---------|-------|
| Auth     | 5         | 2       | 7     |
| Dashboard| 3         | 5       | 8     |

## Item Tracking

| Item Name | Source Ref | Status | Last Run | Result |
|-----------|------------|--------|----------|--------|
| LoginPage | Figma:123  | ✅     | 2025-01-10 | PASS |
| Dashboard | Figma:456  | 📋     | -        | -     |

## Execution Log

| Date | Items | Pass | Fail | Duration |
|------|-------|------|------|----------|
| 2025-01-10 | 5 | 4 | 1 | 15m |
```

**Status icons:**
- ✅ Completed/Pass
- 🔄 In Progress
- 📋 Pending
- ❌ Failed
- ⚠️ Needs Review

### Options Reference

| Option | Description |
|--------|-------------|
| `--incremental` | Only process Pending or Failed items |
| `--category <name>` | Filter to specific category |
| `--max-iterations <n>` | Override iteration limit (default: 100) |
| `--dry-run` | Show plan without executing |
| `--list` | List all available workflows |

### Cancelling a Loop

To stop an active Ralph loop:
```bash
/cancel-ralph
```

<details>
<summary><b>Advanced: Creating Custom Ralph Workflows</b></summary>

To add a new Ralph workflow:

1. **Create the skill file** in the appropriate stack folder:
   ```
   .pi/{stack}/skills/my-workflow.md
   ```

2. **Define the workflow** in ralph.md's workflow registry:
   ```yaml
   my-workflow:
     stack: react
     skill: my-workflow.md
     status_file: MY_WORKFLOW_STATUS.md
     completion_promise: "MY_WORKFLOW_COMPLETE"
     default_iterations: 100
   ```

3. **Create status file template**:
   ```
   .pi/base/templates/ralph/my-workflow-status.template.md
   ```

4. **Test with dry run**:
   ```bash
   /ralph my-workflow project --dry-run
   ```

</details>

---

## Advanced Topics

<details>
<summary><b>Deep Dive Documentation</b></summary>

For advanced use cases, refer to these detailed guides:

### Hook System
- **CONFIG.md**: Complete hook configuration guide
  - Location: `.pi/base/hooks/CONFIG.md`
  - Topics: All hook events, environment variables, exit codes

### Skill Development
- **HOOK_MECHANISMS.md**: How hooks process skills
  - Location: `.pi/base/skills/dev/develop-skills/HOOK_MECHANISMS.md`

- **TRIGGER_TYPES.md**: All trigger patterns explained
  - Location: `.pi/base/skills/dev/develop-skills/TRIGGER_TYPES.md`

- **SKILL_RULES_REFERENCE.md**: Complete skill-rules.json schema
  - Location: `.pi/base/skills/dev/develop-skills/SKILL_RULES_REFERENCE.md`

- **PATTERNS_LIBRARY.md**: Common skill patterns
  - Location: `.pi/base/skills/dev/develop-skills/PATTERNS_LIBRARY.md`

</details>

---

## Need Help?

- **Documentation**: Check the `docs/` folder for detailed guides
- **Questions**: Ask Claude! It knows this system.
- **Issues**: Report at your project's issue tracker
