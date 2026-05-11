# claude.md Generation Rules

## Overview

This prompt guides the generation of the `claude.md` file in the project root, which serves as the project configuration and quick reference for Claude Code sessions.

**Key Principle**: `claude.md` is a **concise summary** (~200 lines) that references detailed docs in `.project/docs/`.

---

## Document Structure

```markdown
# {PROJECT_NAME} - Project Configuration

## Overview
## Tech Stack
## Project Structure
## Key Documentation
## User Roles
## Core Enums
## Development Conventions
## Available Commands
## Enabled MCP Servers
## Design System
## API Base URLs
## Quick Reference
```

---

## Data Sources

| Section | Primary Source | Fallback |
|---------|----------------|----------|
| Overview | PRD metadata | Ask user |
| Tech Stack | PRD + package.json scan | Infer from folders |
| Project Structure | Filesystem scan | Standard templates |
| Key Documentation | Hardcoded paths | Check file existence |
| User Roles | PROJECT_KNOWLEDGE.md | PRD user types |
| Core Enums | PROJECT_DATABASE.md | PRD enums |
| Development Conventions | PRD or PREFERENCES.md | Framework defaults |
| Available Commands | Scan .pi/commands/ | List known commands |
| MCP Servers | .mcp.json or settings | Empty section |
| Design System | PRD design section | Primary color only |
| API Base URLs | PROJECT_API.md | Standard patterns |
| Quick Reference | DECISIONS.md + PRD | Key highlights |

---

## Section Generation Rules

### 1. Overview Section

**Format:**

```markdown
## Overview

**Project**: {project_name}
**Type**: {project_type}
**Status**: {status}
**Version**: {version}

{description}

**Key Differentiator**: {differentiator}
```

**Rules:**
- Project type: "Web Application", "Mobile App", "Full Stack Application"
- Status: "Development", "Staging", "Production"
- Description: 2-3 sentences max
- Differentiator: One sentence unique value proposition

---

### 2. Tech Stack Section

**Format:**

```markdown
## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | {backend} |
| Frontend | {frontend} |
| Admin Dashboard | {admin_dashboard} |
| Database | {database} |
| ORM | {orm} |
| Authentication | {auth} |
| Push Notifications | {push} |
| Deployment | {deployment} |
```

**Detection Rules:**

| Tech | Detection Method |
|------|------------------|
| NestJS | `backend/package.json` contains `@nestjs/core` |
| React | `frontend/package.json` contains `react` |
| React Native | `mobile/` folder exists |
| PostgreSQL | PRD or docker-compose.yml |
| TypeORM | `backend/package.json` contains `typeorm` |
| JWT | Auth module exists |

**Rules:**
- Only include rows for detected technologies
- Omit rows with "N/A" or unknown values
- Use comma-separated for multiple values (e.g., "JWT, Google OAuth")

---

### 3. Project Structure Section

**Format:**

```markdown
## Project Structure

```
{project_name}/
├── backend/                      # {backend_framework} API
│   ├── src/
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/            # Authentication
│   │   │   ├── users/           # User management
│   │   │   └── ...              # Other modules
│   │   ├── shared/              # Shared utilities
│   │   └── database/            # Migrations, seeds
│   └── test/                    # E2E tests
├── frontend/                    # React user application
├── frontend-admin-dashboard/    # React admin dashboard
├── .pi/                     # Claude Code configuration
├── .project/             # Project documentation
└── docker-compose.yml           # Docker configuration
```
```

**Rules:**
- Scan actual filesystem for existing folders
- Include only folders that exist
- Add inline comments explaining each folder
- List key modules under `modules/` if they exist

---

### 4. Key Documentation Section

**Format:**

```markdown
## Key Documentation

| Document | Path | Description |
|----------|------|-------------|
| Project Knowledge | [.project/docs/PROJECT_KNOWLEDGE.md](.project/docs/PROJECT_KNOWLEDGE.md) | Core project info, features, roles |
| API Documentation | [.project/docs/PROJECT_API.md](.project/docs/PROJECT_API.md) | API endpoints and specifications |
| Database Schema | [.project/docs/PROJECT_DATABASE.md](.project/docs/PROJECT_DATABASE.md) | Entity definitions and relationships |
| API Integration | [.project/docs/PROJECT_API_INTEGRATION.md](.project/docs/PROJECT_API_INTEGRATION.md) | Frontend-backend integration |

### Status Tracking

| Status File | Path |
|-------------|------|
| Backend API Status | [.project/status/backend/API_IMPLEMENTATION_STATUS.md](.project/status/backend/API_IMPLEMENTATION_STATUS.md) |
| Frontend Screens | [.project/status/frontend/SCREEN_IMPLEMENTATION_STATUS.md](.project/status/frontend/SCREEN_IMPLEMENTATION_STATUS.md) |
| Frontend API Integration | [.project/status/frontend/API_INTEGRATION_STATUS.md](.project/status/frontend/API_INTEGRATION_STATUS.md) |

### Memory (Persistent Context)

| File | Purpose |
|------|---------|
| [DECISIONS.md](.project/memory/DECISIONS.md) | Architecture decisions log |
| [LEARNINGS.md](.project/memory/LEARNINGS.md) | Patterns and insights |
| [PREFERENCES.md](.project/memory/PREFERENCES.md) | Coding style preferences |
```

**Rules:**
- Use markdown link format: `[text](path)`
- Only include files that exist
- Check each path before including
- Status tracking section based on detected project folders

---

### 5. User Roles Section

**Format:**

```markdown
## User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| Guest | Unauthenticated visitor | View public pages, Login, Signup |
| User | Registered user | {user_permissions} |
| Admin | Platform administrator | {admin_permissions} |
```

**Rules:**
- Extract from PROJECT_KNOWLEDGE.md "User Roles & Permissions" section
- Keep descriptions to one sentence
- Permissions as comma-separated list (max 5 items)
- Order: Guest → User → Admin → Super Admin

---

### 6. Core Enums Section

**Format:**

```markdown
## Core Enums

| Enum | Values |
|------|--------|
| RoleEnum | `user`, `admin` |
| UserStatusEnum | `active`, `suspended` |
| TransactionTypeEnum | `income`, `expense` |
```

**Rules:**
- Extract from PROJECT_DATABASE.md "Enum Definitions" section
- Values in backticks, comma-separated
- Only include enums used in the project
- Max 10 most important enums

---

### 7. Development Conventions Section

**Format:**

```markdown
## Development Conventions

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `UserResponse` |

### Import Order

1. External packages
2. Internal aliases (@/)
3. Relative imports
4. Styles

### TypeScript Guidelines

- Strict mode enabled
- Prefer `interface` over `type` for objects
- Use `unknown` over `any`
- Explicit types over type inference
```

**Rules:**
- Check PREFERENCES.md for existing conventions
- Use framework-standard conventions as defaults
- Keep guidelines actionable and concise

---

### 8. Available Commands Section

**Format:**

```markdown
## Available Commands

| Command | Description |
|---------|-------------|
| `/commit` | Smart git commit with branch and PR management |
| `/pull` | Pull latest changes for all submodules |
| `/ralph <workflow> <project>` | Run autonomous QA/testing loops |
| `/new-project <name>` | Create complete new project with Claude config |

### Ralph Workflows

| Workflow | Stack | Purpose |
|----------|-------|---------|
| `design-qa` | react | Compare UI against Figma designs |
| `e2e-tests` | react | Generate Playwright E2E tests |
| `backend-qa` | nestjs | Validate API endpoints |
| `api-docs` | nestjs | Update Swagger documentation |
```

**Detection Rules:**
- Scan `.pi/commands/` for command files
- Read `description` from command frontmatter
- Include only relevant commands for the tech stack

---

### 9. Enabled MCP Servers Section

**Format:**

```markdown
## Enabled MCP Servers

- **mysql** - Database queries
- **sequential-thinking** - Step-by-step reasoning
- **playwright** - Browser automation and E2E testing
- **notion** - Notion integration
```

**Detection Rules:**
- Read `.mcp.json` in project root
- Read `~/.pi/claude_desktop_config.json` for global servers
- Format: `**{server_name}** - {description}`

**Rules:**
- Only include servers that are configured
- Skip if no MCP configuration found
- Brief description (3-5 words)

---

### 10. Design System Section

**Format:**

```markdown
## Design System

### Primary Color
- **{color_name}**: {hex_code}

### Status Colors
- **Under Budget (< 80%)**: Green
- **Near Limit (80-100%)**: Yellow
- **Over Budget (> 100%)**: Red

### Transaction Colors
- **Income**: Green
- **Expense**: Red
```

**Rules:**
- Extract from PRD design section
- Include primary color at minimum
- Add domain-specific color meanings if applicable
- Omit section if no design info available

---

### 11. API Base URLs Section

**Format:**

```markdown
## API Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Staging | `https://staging.{project}.app/api` |
| Production | `https://api.{project}.app/api` |
```

**Rules:**
- Extract from PROJECT_API.md "Base URL" section
- Use project name in domain if unknown
- Port 3000 for NestJS

---

### 12. Quick Reference Section

**Format:**

```markdown
## Quick Reference

### Authentication Flow
- JWT Bearer tokens for API authentication
- Access Token: {access_expiry} expiry
- Refresh Token: {refresh_expiry} expiry
- {social_auth} supported for social login

### Database Design Decisions
- **UUID primary keys** for security and distributed system support
- **Soft deletes** with `deleted_at` timestamp
- **Decimal(12,2)** for all monetary values
- {additional_decisions}
```

**Rules:**
- Extract key decisions from DECISIONS.md
- Summarize auth flow from PROJECT_API.md
- Include 3-5 most important database decisions
- Keep each point to one line

---

## Footer

Always end with:

```markdown
---

*Last Updated: {timestamp}*
```

**Rules:**
- Use ISO date format: YYYY-MM-DD
- No source reference (claude.md is a summary, not generated from single source)

---

## Validation Checklist

Before finalizing claude.md, verify:

- [ ] All linked documentation files exist
- [ ] Project structure matches actual filesystem
- [ ] Tech stack matches package.json dependencies
- [ ] Enums match PROJECT_DATABASE.md
- [ ] User roles match PROJECT_KNOWLEDGE.md
- [ ] Commands listed are implemented in .pi/commands/
- [ ] MCP servers are actually configured
- [ ] Total length is under 250 lines

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Missing PRD | Use existing docs or ask user for info |
| Missing PROJECT_KNOWLEDGE.md | Generate from PRD first |
| Missing PROJECT_DATABASE.md | Generate from PRD first |
| Empty section | Omit section with comment |
| File not found | Remove from documentation links |

---

*This prompt is part of the project-doc-writer skill*
