# Agent-to-Framework Automatic Resource Mapping System

Comprehensive guide for the agent type classification and framework resource auto-injection system.

---

## Overview

This system automatically provides agents with framework-specific resources (guides, skills, agents, commands) based on their type. When a typed agent is invoked, it receives context from its assigned framework repositories.

**Benefits:**
- Agents automatically access relevant framework patterns and best practices
- No manual resource lookups needed
- Consistent resource discovery across all agents
- Easy to extend with new frameworks and agent types

---

## Agent Type Classification

### Agent Types

| Type | Purpose | Frameworks | When to Use |
|------|---------|------------|-------------|
| **backend** | Backend API development | nestjs | Building APIs, services, database logic |
| **frontend** | Web frontend development | react | Building web UI components, pages, routing |
| **mobile** | Mobile app development | react-native | Building mobile apps with React Native |
| **cross-stack** | Full-stack development | nestjs, react | Working across backend and frontend |
| **generic** | Framework-agnostic | none | Code review, refactoring, documentation, research |

### Current Agent Mappings

#### Backend Agents
- **backend-developer** → nestjs
  - NestJS four-layer architecture
  - TypeORM

- **database-designer** → nestjs
  - TypeORM entity design
  - Database migrations

#### Frontend Agents
- **frontend-developer** → react
  - React 19 patterns
  - TailwindCSS styling
  - React Router v7

#### Mobile Agents
- **mobile-developer** → react-native
  - React Native components
  - NativeWind styling
  - React Navigation

#### Cross-Stack Agents
- **ticket-fixer** → nestjs + react
  - Full-stack ticket resolution
  - Both backend and frontend patterns

#### Generic Agents (No Framework Context)
- reviewer
- auto-error-resolver
- refactorer
- documentation-architect
- web-research-specialist
- prd-converter

---

## Framework Resource Discovery

### What Gets Discovered

For each framework assigned to an agent type, the system discovers:

**1. Guides** ([.pi/{framework}/guides/](.pi/{framework}/guides/))
- Comprehensive patterns and best practices
- Architecture overviews
- Step-by-step tutorials
- Examples: `architecture-overview.md`, `routing-and-controllers.md`, `database-integration.md`

**2. Skills** ([.pi/{framework}/skills/](.pi/{framework}/skills/))
- Specialized framework skills
- Task automation
- Examples: `database-schema-designer`, `api-docs-generator`, `e2e-test-generator`

**3. Agents** ([.pi/{framework}/agents/](.pi/{framework}/agents/))
- Framework-specific subagents
- Deep expertise agents
- Examples: `nestjs-expert`, `auth-route-debugger`

**4. Commands** ([.pi/{framework}/commands/](.pi/{framework}/commands/))
- Framework-specific slash commands
- Examples: `/nestjs-scaffold`, `/db-migrate`

### Discovery Process

```
1. Agent is invoked (e.g., backend-developer)
2. System loads agent-registry.json
3. Resolves frameworks for agent type (backend → nestjs)
4. Scans each framework directory for resources
5. Builds formatted context string
6. Prepends context to agent's system prompt
```

---

## Context Injection Format

When an agent receives framework context, it's formatted like this:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 FRAMEWORK RESOURCES AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Assigned Frameworks: nestjs

📚 NESTJS RESOURCES:

Guides (.pi/nestjs/guides/):
  → architecture-overview.md - NestJS four-layer architecture
  → routing-and-controllers.md - Route handling and decorators
  → services-and-repositories.md - Service patterns and data access
  → database-integration.md - TypeORM setup and patterns
  → authentication-authorization.md - JWT guards and decorators
  (+ 7 more guides)

Skills (.pi/nestjs/skills/):
  → database-schema-designer - Design TypeORM entities
  → api-docs-generator - Generate Swagger documentation
  → e2e-test-generator - Create E2E tests

Agents (.pi/nestjs/agents/):
  → nestjs-expert - Deep NestJS expertise
  → auth-route-debugger - Authentication debugging

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT: Use these resources when implementing features.
Reference guides for patterns, invoke skills for specialized tasks.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Configuration

### agent-registry.json

Central registry at [.pi/agents/agent-registry.json](.pi/agents/agent-registry.json):

```json
{
  "version": "1.0",
  "agentTypes": {
    "backend": {
      "description": "Backend development agents",
      "frameworks": ["nestjs"]
    },
    "frontend": {
      "description": "Frontend web development agents",
      "frameworks": ["react"]
    }
  },
  "agents": {
    "backend-developer": {
      "type": "backend",
      "description": "NestJS backend implementation",
      "frameworkOverrides": null
    }
  }
}
```

### Agent Frontmatter

Each agent markdown file includes metadata:

```yaml
---
name: backend-developer
agent-type: backend
frameworks: ["nestjs"]
description: ...
model: opus
color: green
tools: Read, Write, Edit, MultiEdit, Bash, Glob, Grep
---
```

---

## How Agents Use Framework Resources

### 1. Reference Guides for Patterns

When implementing features, agents reference framework guides:

```typescript
// Agent reads .pi/nestjs/guides/routing-and-controllers.md
// Then implements following the patterns:
@Controller('users')
export class UsersController extends BaseController<UsersService> {
  constructor(protected readonly service: UsersService) {
    super(service);
  }
}
```

### 2. Invoke Skills for Specialized Tasks

Agents can invoke framework-specific skills:

```
Backend-developer implementing new module:
1. Reads .pi/nestjs/guides/architecture-overview.md
2. Invokes database-schema-designer skill to create entities
3. Implements service layer following guide patterns
4. Invokes api-docs-generator skill to create Swagger docs
```

### 3. Delegate to Framework Agents

Agents can call framework-specific subagents:

```
Backend-developer encounters auth issue:
→ Delegates to nestjs/agents/auth-route-debugger
→ Auth debugger uses NestJS-specific knowledge to fix
```

---

## Adding New Agents

### Step 1: Create Agent Markdown File

Create `.pi/agents/your-agent.md`:

```markdown
---
name: your-agent
agent-type: backend  # or frontend, mobile, cross-stack, generic
frameworks: ["nestjs"]
description: ...
model: opus
color: green
tools: Read, Write, Edit, Bash, Glob, Grep
---

# Your Agent

## Framework Resources Available

This agent automatically receives context from:
- **NestJS**: .pi/nestjs/guides/, .pi/nestjs/skills/

Refer to these resources when implementing features.

## Core Responsibilities
...
```

### Step 2: Register in agent-registry.json

Add to `.pi/agents/agent-registry.json`:

```json
{
  "agents": {
    "your-agent": {
      "type": "backend",
      "description": "Your agent description",
      "frameworkOverrides": null
    }
  }
}
```

### Step 3: Document in agent-registry.json

Add entry to [.pi/agents/agent-registry.json](.pi/agents/agent-registry.json):

```json
{
  "name": "your-agent",
  "specialty": "...",
  "bestFor": "...",
  "typicalCallers": ["..."]
}
**Invocation pattern:** ...
**Output:** ...
```

---

## Adding New Frameworks

### Step 1: Add Framework Submodule

```bash
cd .claude
git submodule add https://github.com/yourorg/claude-yourframework.git yourframework
git submodule update --init --recursive
```

### Step 2: Organize Framework Resources

Create structure in submodule:

```
yourframework/
├── guides/
│   ├── architecture-overview.md
│   ├── routing.md
│   └── ...
├── skills/
│   ├── your-skill/
│   │   └── SKILL.md
│   └── skill-rules.json
├── agents/
│   └── framework-expert.md
└── commands/
    └── your-command.md
```

### Step 3: Update Agent Registry

Add to `.pi/agents/agent-registry.json`:

```json
{
  "agentTypes": {
    "your-type": {
      "description": "Your framework agents",
      "frameworks": ["yourframework"]
    }
  }
}
```

### Step 4: Map Agents to Framework

Update existing agents or create new ones:

```json
{
  "agents": {
    "your-agent": {
      "type": "your-type",
      "frameworkOverrides": ["yourframework"]
    }
  }
}
```

---

## Implementation Details

### Framework Context Builder

Located at [.pi/hooks/lib/framework-context-builder.ts](.pi/hooks/lib/framework-context-builder.ts):

**Key Functions:**
- `discoverFrameworks(claudeDir)` - Lists available framework directories
- `scanFrameworkResources(framework)` - Discovers resources in framework
- `buildContextString(frameworks)` - Formats context for injection
- `getFrameworkContext(claudeDir, frameworks)` - Main entry point

### Agent Context Injector

Located at [.pi/hooks/lib/agent-context-injector.ts](.pi/hooks/lib/agent-context-injector.ts):

**Key Functions:**
- `loadAgentRegistry()` - Loads agent-registry.json
- `resolveFrameworks(agentName)` - Gets frameworks for agent
- `injectContext(agentName, prompt)` - Prepends context to prompt
- `getAgentMetadata(agentName)` - Gets agent type and frameworks

---

## Troubleshooting

### Agent Not Receiving Framework Context

**Symptoms:** Agent doesn't reference framework guides or patterns

**Solutions:**
1. Check agent frontmatter has correct `agent-type` and `frameworks`
2. Verify agent is in [agent-registry.json](agent-registry.json)
3. Ensure framework submodules are initialized:
   ```bash
   git submodule update --init --recursive
   ```
4. Verify framework directory exists in `.pi/`

### Framework Not Discovered

**Symptoms:** Context shows no resources from a framework

**Solutions:**
1. Check framework directory exists: `.pi/nestjs/`, `.pi/react/`, etc.
2. Verify framework has correct structure:
   ```
   nestjs/
   ├── guides/
   ├── skills/
   ├── agents/
   └── commands/
   ```
3. Check file permissions (must be readable)

### Wrong Frameworks Assigned

**Symptoms:** Agent receives context from incorrect frameworks

**Solutions:**
1. Check `agent-registry.json` has correct type mapping
2. Verify agent frontmatter `frameworks` array
3. Use `frameworkOverrides` if custom mapping needed:
   ```json
   {
     "your-agent": {
       "type": "backend",
       "frameworkOverrides": ["nestjs"]
     }
   }
   ```

### Context Injection Not Working

**Symptoms:** No framework context appears in agent prompts

**Solutions:**
1. Verify TypeScript hooks are compiled:
   ```bash
   cd .pi/hooks
   npm install
   npx tsc
   ```
2. Check [.pi/hooks/package.json](.pi/hooks/package.json) has dependencies
3. Test resource discovery manually:
   ```typescript
   import { getFrameworkContext } from './lib/framework-context-builder';
   console.log(getFrameworkContext('.claude', ['nestjs']));
   ```

---

## Best Practices

### For Agent Creators

1. **Choose the Right Type**
   - Use `backend` for API/database work
   - Use `frontend` for UI components
   - Use `mobile` for React Native
   - Use `generic` for framework-agnostic tasks

2. **Document Framework Usage**
   - Add "Framework Resources Available" section
   - Reference specific guides in agent instructions
   - Show examples of using framework patterns

3. **Test with Frameworks**
   - Verify agent receives correct context
   - Test with and without framework submodules
   - Ensure graceful degradation if frameworks missing

### For Framework Maintainers

1. **Organize Resources Clearly**
   - Group guides by topic
   - Name files descriptively
   - Add descriptions in frontmatter

2. **Keep Guides Updated**
   - Update for new framework versions
   - Add new patterns as they emerge
   - Remove deprecated patterns

3. **Document Skills Thoroughly**
   - Clear skill descriptions
   - Examples of when to use
   - Integration with guides

### For Project Teams

1. **Add Frameworks as Needed**
   - Start with core frameworks (backend, frontend)
   - Add mobile/marketing/operations when needed
   - Keep framework submodules updated

2. **Customize Agent Mappings**
   - Override frameworks for project-specific agents
   - Create custom agent types if needed
   - Document custom mappings

3. **Maintain Registry**
   - Keep agent-registry.json up-to-date
   - Document agent types and purposes
   - Review and update mappings as project evolves

---

## Examples

### Example 1: Backend Agent Using Framework Context

```markdown
User: "Create a new Products API endpoint"

System invokes: backend-developer
Framework context injected: nestjs guides

Agent process:
1. Reads .pi/nestjs/guides/architecture-overview.md
2. Follows four-layer architecture pattern
3. Creates:
   - products.entity.ts (Entity layer)
   - products.repository.ts (Repository layer)
   - products.service.ts (Service layer)
   - products.controller.ts (Controller layer)
   - DTOs for request/response
4. Generates migration
5. Adds Swagger documentation
```

### Example 2: Frontend Agent Using Framework Context

```markdown
User: "Convert this HTML landing page to React"

System invokes: frontend-developer
Framework context injected: react guides

Agent process:
1. Reads .pi/react/guides/component-patterns.md
2. Analyzes HTML structure
3. Creates React components:
   - LandingPage.tsx (main page)
   - Hero.tsx (hero section)
   - Features.tsx (features section)
4. Applies TailwindCSS from .pi/react/guides/styling-guide.md
5. Sets up routing with React Router v7
```

### Example 3: Mobile Agent Using Framework Context

```markdown
User: "Build a user profile screen for mobile"

System invokes: mobile-developer
Framework context injected: react-native guides

Agent process:
1. Reads .pi/react-native/guides/component-patterns.md
2. Creates ProfileScreen.tsx
3. Implements NativeWind styling from guides
4. Adds navigation from .pi/react-native/guides/navigation.md
5. Handles platform-specific code (iOS/Android)
6. Integrates native APIs (camera, image picker)
```

---

## Performance Considerations

### Resource Discovery Caching

- Framework resources are discovered once per session
- Cached in memory for subsequent agent invocations
- Reduces filesystem operations

### Context Size Management

- Shows up to 5 guides per framework
- Lists all skills (typically < 10 per framework)
- Summarizes commands count if many
- Keeps context under 2KB per framework

### Lazy Loading

- Resources only discovered for invoked agents
- Generic agents skip framework discovery entirely
- Frameworks loaded on-demand, not at startup

---

## Future Enhancements

### Planned Features

1. **Dynamic Framework Selection**
   - Agents request additional frameworks mid-execution
   - User can override frameworks for specific tasks

2. **Skill Auto-Invocation**
   - Agents automatically invoke relevant framework skills
   - Smart suggestions based on task context

3. **Framework Versioning**
   - Track framework submodule versions
   - Include version in context
   - Handle breaking changes

4. **Resource Filtering**
   - Filter guides by relevance to current task
   - Show only applicable skills
   - Prioritize frequently used resources

5. **Cross-Framework Patterns**
   - Identify similar patterns across frameworks
   - Suggest framework-agnostic solutions
   - Enable easier framework migration

---

## Related Documentation

- [agent-registry.json](../agents/agent-registry.json) - Complete agent catalog
- [agent-registry.json](../agents/agent-registry.json) - Agent-to-framework mappings
- [setup-claude.md](../commands/dev/setup-claude.md) - Adding framework submodules
- [PROJECT_KNOWLEDGE.md](./PROJECT_KNOWLEDGE.md) - Project-specific patterns

---

## Support

For issues or questions:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review [agent-registry.json](../agents/agent-registry.json) configuration
3. Verify framework submodules are initialized
4. Test with simplified agent/framework setup
