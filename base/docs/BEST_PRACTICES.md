# Best Practices

Generic, framework-agnostic coding standards and framework resource guide for all projects using the `.pi/` configuration system.

---

## How to Use This Document

| Agent Type | Usage |
|------------|-------|
| **Generic agents** (reviewer, refactorer, documentation-architect) | Use cross-cutting practices below directly for reviews and planning |
| **Typed agents** (backend-developer, frontend-developer, mobile-developer) | Read framework-specific guides first (see [Framework Resources](#framework-specific-resources)), then use this for general standards |
| **Commands** (create-strategic-plan, session-handoff) | Reference for coding standards context |

---

## Cross-Cutting Best Practices

### Naming Conventions

| Context | Convention | Examples |
|---------|-----------|----------|
| Variables, Functions | camelCase | `getUserById`, `isAuthenticated`, `handleSubmit` |
| Classes, Components, Types | PascalCase | `UserService`, `AuthController`, `CreateUserDto` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `API_BASE_URL` |
| Files, Directories | kebab-case | `user-service.ts`, `auth-controller.tsx`, `api-utils/` |
| Database columns/tables | snake_case | `user_id`, `created_at`, `order_items` |
| Boolean variables | Prefix: is/has/can/should | `isActive`, `hasPermission`, `canEdit` |
| Event handlers | Prefix: handle/on | `handleClick`, `onSubmit`, `handleUserCreate` |

### Code Organization

**Layered Architecture** (backend):
```
Controllers (HTTP only) -> Services (business logic) -> Repositories (data access) -> Models (schema)
```

**Rules**:
- Feature-based modules over technical grouping
- No circular dependencies between modules
- Use dependency injection for all service dependencies
- Controllers: HTTP concerns only (request parsing, response formatting)
- Services: all business logic, validation, and orchestration
- Keep files focused: Controllers < 200 lines, Services < 300 lines, refactor at 500+

**Frontend**:
- Components: presentational vs container separation
- Colocate related files (component + styles + tests + types)
- Shared utilities in `utils/`, not scattered across features
- `lib/` is reserved for third-party wrappers only (e.g., `cn()` from shadcn)

**Utility Functions**:
- **Arrow function syntax only**: All reusable utility/helper functions MUST use `export const fn = (...): ReturnType => { ... }` syntax — never `function` declarations
- **Location**: All utility functions MUST live in `app/utils/` organized by domain:
  - `utils/formatting.ts` — Date/time, number, and string formatting
  - `utils/badges.ts` — CSS class mapping for badges, status indicators, role colors
  - `utils/avatar.ts` — Avatar color generation, initials extraction
  - `utils/pagination.ts` — Page number calculation, pagination helpers
  - `utils/csv.ts` — CSV export/download utilities
  - `utils/activity.ts` — Activity icon/color mapping
  - `utils/dates.ts` — Date arithmetic (days remaining, date filling, trend calculations)
  - `utils/password.ts` — Password validation hint helpers
- **Never inline**: Helper functions that are not React components or hooks MUST NOT be defined inside page/component files
- **Named exports only**: Use `export const`, never `export default` for utility functions
- **Related constants**: Constants used by a utility (e.g., color arrays, config maps) MUST be co-located in the same utils file
- **TypeScript types**: All utility parameters and return types must be explicitly typed
- **Deduplication**: If the same utility is needed in multiple files, it MUST be extracted to `utils/` and imported — never copy-pasted

### Error Handling

- Use framework exception classes (`HttpException`, `Http404`, `NotFoundException`)
- Never swallow errors silently - always log or propagate
- Bubble exceptions to global error handlers; avoid catch-and-rethrow without adding context
- Return structured error responses: `{ statusCode, message, error, details? }`
- Log levels:
  - **ERROR**: System failures requiring attention
  - **WARN**: Recoverable issues, degraded functionality
  - **INFO**: Significant business events (user created, order placed)
  - **DEBUG**: Development troubleshooting only

### Security

**Authentication & Authorization**:
- Store tokens in HTTP-only cookies (never localStorage/sessionStorage)
- Validate JWTs server-side on every request
- Implement RBAC (Role-Based Access Control) with guards/permissions
- Protect all non-public endpoints with auth middleware

**Input Validation**:
- Always validate server-side (client validation is UX only)
- Use schema validation libraries: Zod (TypeScript), class-validator (NestJS)
- Sanitize user input before database operations
- Parameterized queries only - never string concatenation for SQL

**Secrets Management**:
- Never commit `.env`, credentials, or API keys
- Use environment variables for all configuration
- Different credentials per environment (dev/staging/prod)
- Add sensitive patterns to `.gitignore`

### Performance

**Database**:
- Add indexes on frequently queried columns and foreign keys
- Use eager loading / `select_related` / `join` to prevent N+1 queries
- Always paginate list endpoints (default limit: 20, max: 100)
- Use connection pooling in production
- Cache expensive queries with appropriate TTL

**API**:
- Enable response compression (gzip/brotli)
- Set appropriate HTTP caching headers for static/semi-static responses
- Implement rate limiting on public endpoints
- Use pagination, filtering, and field selection to minimize payload size
- Timeout long-running operations (default: 30s)

### Testing Standards

| Metric | Target |
|--------|--------|
| Critical business logic | 100% coverage |
| Services / Use cases | > 80% coverage |
| Controllers / Endpoints | > 70% coverage |
| Overall project | > 70% coverage |

**Test Types**:
- **Unit**: Isolate single function/class, mock all external dependencies
- **Integration**: Test module interactions, use test database
- **E2E**: Full user flows via Playwright/Detox, Page Object Model pattern
- **Contract**: API contract validation between frontend and backend

**Conventions**:
- Mirror source directory structure in test directories
- Descriptive test names: `should return 404 when user not found`
- Arrange-Act-Assert pattern in every test
- Mock only external dependencies (APIs, databases), not internal code
- See `.pi/docs/E2E_TESTING.md` for Playwright patterns

### Git Workflow

**Branch Strategy**:
- `main` - production-ready, protected
- `dev` - integration branch, PR target
- Personal branches: `feature/`, `fix/`, `refactor/` prefixes

**Commit Format**:
```
<type>(<scope>): <description>

Co-Authored-By: Claude <noreply@anthropic.com>
```
Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`

**Pull Requests**:
- Always target `dev` branch (never direct to `main`)
- Include summary, test plan, and screenshots where applicable
- Require code review before merge

**Details**: See `.pi/docs/COMMIT_WORKFLOW_GUIDE.md` for full workflow.

### Code Review Checklist

**Functionality**: Fulfills requirements, handles edge cases, proper error handling
**Quality**: Clear naming, DRY (no duplication), Single Responsibility, separation of concerns
**Security**: Input validated, no hardcoded secrets, auth checks on protected routes, no injection vulnerabilities
**Performance**: No N+1 queries, proper indexes, efficient algorithms, no memory leaks
**Testing**: New features have tests, existing tests pass, edge cases covered

---

## Framework-Specific Resources

### Framework Detection

To identify the project's tech stack:

1. **Check** `PROJECT_KNOWLEDGE.md` → "Tech Stack" section
2. **Verify** with package files:

| Framework | Detection File | Look For |
|-----------|---------------|----------|
| NestJS | `backend/package.json` | `@nestjs/core` |
| React | `frontend*/package.json` or `dashboard*/package.json` | `react` |
| React Native | `mobile/package.json` | `react-native` |

### Available Modules

Install via `/setup-claude` (interactive) or `/migrate-submodules` (flags).

#### Development Frameworks

| Module | Path | Repository | Content |
|--------|------|-----------|---------|
| **NestJS** | `.pi/nestjs/` | [claude-nestjs](https://github.com/CoFixer/claude-nestjs) | Controllers, Services, DTOs, TypeORM, Swagger, Socket.IO |
| **React** | `.pi/react/` | [claude-react](https://github.com/CoFixer/claude-react) | React 19, TailwindCSS, shadcn/ui, React Router, Playwright |
| **React Native** | `.pi/react-native/` | [claude-react-native](https://github.com/CoFixer/claude-react-native) | NativeWind, React Navigation, Detox, Native Modules |

#### Department Modules

| Module | Path | Repository | Content |
|--------|------|-----------|---------|
| **Marketing** | `.pi/marketing/` | [claude-marketing](https://github.com/CoFixer/claude-marketing) | CRO, copywriting, SEO, analytics |
| **Operations** | `.pi/operations/` | [claude-operations](https://github.com/CoFixer/claude-operations) | Process automation, workflows, documentation |
| **Content** | `.pi/content/` | [claude-content](https://github.com/CoFixer/claude-content) | Content strategy, blog posts, video scripts |

### Resource Structure

Each framework submodule follows a consistent structure:

```
.pi/{framework}/
├── guides/      # Patterns and best practices (Read first)
├── skills/      # Specialized framework skills
├── agents/      # Framework-specific subagents
└── commands/    # Framework slash commands
```

### Read Directives by Framework

**BEFORE WRITING ANY CODE**, read the relevant guides for your detected framework:

#### NestJS Backend
```
1. Read `.pi/nestjs/guides/best-practices.md` (CRITICAL - MANDATORY)
2. Read task-specific guides from `.pi/nestjs/guides/`:
   - database-patterns.md (entities, migrations, relations)
   - routing-and-controllers.md (endpoints, DTOs)
   - validation-patterns.md (class-validator, pipes)
   - authentication-cookies.md (JWT, guards)
   - middleware-guide.md (interceptors, filters)
3. Read `.pi/docs/guides/nestjs-backend-guide.md` (detailed workflows)
```

#### React Frontend
```
1. Read `.pi/react/guides/file-organization.md` (MANDATORY - directory structure)
2. Read `.pi/react/guides/best-practices.md` (MANDATORY - coding standards)
3. Read `.pi/docs/guides/frontend-alignment-assessment.md` (codebase alignment)
```

#### React Native Mobile
```
1. Read relevant guides from `.pi/react-native/guides/`
2. Read relevant skills from `.pi/react-native/skills/`
```

### If Framework Submodules Are Not Installed

If the framework paths above don't exist:
1. Use the **cross-cutting practices** in this document as your baseline
2. Check `.pi/docs/guides/` for extracted framework guides (available without submodules)
3. Run **`/setup-claude`** to interactively add framework submodules

---

## Related Documentation

| Document | Path | Purpose |
|----------|------|---------|
| Agent Framework Mapping | `.pi/docs/AGENT_FRAMEWORK_MAPPING.md` | How agents auto-receive framework resources |
| Commit Workflow | `.pi/docs/COMMIT_WORKFLOW_GUIDE.md` | Git branching, commit format, PR process |
| E2E Testing | `.pi/docs/E2E_TESTING.md` | Playwright Page Object Model, test fixtures |
| Troubleshooting | `.pi/docs/TROUBLESHOOTING.md` | Common issues and solutions |
| Setup Command | `/setup-claude` | Add framework submodules interactively |
| Submodule Check | `/submodule-check` | Validate submodule health and sync |
