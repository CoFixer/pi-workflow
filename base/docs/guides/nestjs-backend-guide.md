# NestJS Backend Development Guide

> This guide is loaded by the `backend-developer` agent when working with NestJS projects.
> Contains detailed NestJS-specific patterns, rules, and implementation workflows.
>
> **Source**: Extracted from `agents/backend-developer.md` for context window optimization.

---

# NestJS Instructions

**Use these instructions when the detected stack is NestJS.**

## Pre-Implementation Requirements (READ FIRST)

### Mandatory Guide Reading

**Before writing ANY code, you MUST read these guides based on your task:**

#### For ALL Tasks (Always Read):
1. **`.pi/nestjs/guides/best-practices.md`** (CRITICAL RULES - MANDATORY)
   - I18nHelper usage (NEVER hardcode strings)
   - Check existing APIs first (ALWAYS grep before creating)
   - Base class requirements (ALWAYS extend base classes)
   - Controller, service, repository separation rules

#### For Database Work:
2. **`.pi/nestjs/guides/database-patterns.md`** - Entity design, migrations, TypeORM patterns
3. **`.pi/nestjs/guides/services-and-repositories.md`** - Repository patterns, service layer

#### For API Endpoints:
4. **`.pi/nestjs/guides/routing-and-controllers.md`** - Controller patterns, decorators
5. **`.pi/nestjs/guides/validation-patterns.md`** - DTO validation, class-validator

#### For Authentication:
6. **`.pi/nestjs/guides/authentication-cookies.md`** - Cookie-based auth (NO localStorage)
7. **`.pi/nestjs/guides/middleware-guide.md`** - Guards, interceptors, pipes

#### For Testing:
8. **`.pi/nestjs/guides/workflow-generate-e2e-tests.md`** - E2E testing patterns

### Critical Rules Enforcement

The following rules are **MANDATORY** and violations will cause implementation failure:

| Rule | Violation Check | Consequence |
|------|-----------------|-------------|
| **Use I18nHelper for messages** | ❌ Grep for hardcoded throw statements | Code rejected |
| **Check existing APIs first** | ❌ Did you run grep before creating? | Duplicate endpoint |
| **Extend base classes** | ❌ Check inheritance in all files | Non-standard code |
| **No business logic in controllers** | ❌ Controller methods > 5 lines (excluding decorators) | Tight coupling |
| **No direct TypeORM in services** | ❌ Grep for `@InjectRepository` in services | Bypassing repository layer |
| **No try/catch in controllers** | ❌ Grep for `try {` in controllers | Improper error handling |
| **Use HTTP-only cookies** | ❌ Check for localStorage references | Security vulnerability |
| **Use UnifiedConfig** | ❌ Grep for `process.env` direct access | Config mismanagement |

### Pre-Implementation Checklist

Before proceeding to implementation, confirm you understand:

- [ ] **I will read `best-practices.md` first** (MANDATORY for ALL tasks)
- [ ] **I will use I18nHelper** for ALL user-facing messages (NO hardcoding)
- [ ] **I will check existing APIs** using grep before creating new endpoints
- [ ] **I will extend base classes** (BaseController, BaseService, BaseRepository, BaseEntity)
- [ ] **I will NOT put business logic in controllers** (only routing & delegation)
- [ ] **I will NOT use try/catch in controllers** (let exception filters handle)
- [ ] **I will NOT use localStorage** for JWT tokens (use HTTP-only cookies)
- [ ] **I will NOT access process.env directly** (use UnifiedConfig)

**If you cannot check all boxes above, STOP and read the guides.**

---

## Core Responsibilities

### 1. Four-Layer Architecture Implementation

**Layer 1: Entity (Data Model)**
- Create entities extending `BaseEntity`
- Add TypeORM decorators (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.)
- Define relationships (`@OneToMany`, `@ManyToOne`, `@ManyToMany`)
- Add indexes for query optimization
- Include timestamps, soft deletes if needed

**Layer 2: Repository (Data Access)**
- Create repositories extending `BaseRepository<Entity>`
- Implement custom query methods
- Use QueryBuilder for complex queries
- Add transaction support when needed
- Implement proper error handling for database operations

**Layer 3: Service (Business Logic)**
- Create services extending `BaseService<Entity, Repository>`
- Implement business logic and validation
- Handle entity relationships and cascades
- Add proper error handling with HTTP exceptions
- Implement transaction management for multi-step operations

**Layer 4: Controller (API Endpoints)**
- Create controllers extending `BaseController<Service>`
- Define routes with proper HTTP methods
- Add Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`)
- Implement guards for authentication/authorization
- Add interceptors for logging, transformation
- Use pipes for validation

### 2. DTO (Data Transfer Object) Creation

**Request DTOs:**
- Create DTOs for create/update operations
- Add class-validator decorators (`@IsString`, `@IsEmail`, `@IsOptional`, etc.)
- Include class-transformer decorators for type conversion
- Add Swagger decorators (`@ApiProperty`) with examples
- Implement proper validation rules

**Response DTOs:**
- Create response DTOs for API responses
- Use `@Exclude()` for sensitive fields (passwords, tokens)
- Add `@Expose()` for fields to include
- Implement proper serialization

### 3. Database Integration

**Entity Design:**
- Reference `.pi/docs/PROJECT_DATABASE.md` for schema
- Follow database naming conventions
- Implement proper column types and constraints
- Add cascade options for relationships
- Include audit fields (createdAt, updatedAt, deletedAt)

**Migration Management:**
- Generate migrations for entity changes: `npm run migration:generate`
- Review migrations before running
- Test migrations with rollback
- Document breaking changes

**Query Optimization:**
- Use indexes for frequently queried fields
- Implement proper eager/lazy loading
- Use QueryBuilder for complex queries
- Add pagination for list endpoints

### 4. Authentication & Authorization

**JWT Implementation:**
- Create auth module with JWT strategy
- Implement login/register endpoints
- Add `@UseGuards(JwtAuthGuard)` to protected routes
- Create custom guards for role-based access
- Implement refresh token mechanism

**Guards & Decorators:**
- Create custom guards for specific permissions
- Implement role-based authorization
- Create custom decorators (e.g., `@CurrentUser()`)
- Add guard combinations for complex access control

### 5. API Documentation

**Swagger Integration:**
- Add `@ApiTags()` to controllers for grouping
- Use `@ApiOperation()` with summary and description
- Add `@ApiResponse()` for all status codes
- Include `@ApiBody()` and `@ApiParam()` documentation
- Add examples using `@ApiProperty()`

**Documentation Best Practices:**
- Document all endpoints comprehensively
- Include request/response examples
- Document error responses
- Add authentication requirements
- Keep Swagger UI up to date

### 6. Error Handling

**HTTP Exceptions:**
- Throw proper HTTP exceptions from services
- Use NestJS built-in exceptions (BadRequestException, NotFoundException, etc.)
- Create custom exceptions when needed
- Include meaningful error messages
- Add error codes for client handling

**Global Exception Filter:**
- Implement global exception filter if needed
- Format error responses consistently
- Log errors appropriately
- Return user-friendly error messages

## Quality Standards

### Code Quality
- All classes must have proper TypeScript types
- Use dependency injection properly
- Follow NestJS module organization
- Extract magic numbers/strings to constants/enums
- Add comments only for complex business logic

### Architecture
- Strictly follow four-layer pattern
- Controller → Service → Repository → Entity
- No business logic in controllers
- No direct entity access from controllers
- Services should be testable and independent

### API Design
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Return proper HTTP status codes
- Implement consistent response format
- Add pagination for list endpoints
- Use DTOs for all request/response data

### Security
- Validate all input with class-validator
- Sanitize user input
- Use guards for authentication/authorization
- Never expose sensitive data
- Implement rate limiting when needed
- Use environment variables for secrets

### Performance
- Add database indexes for frequently queried fields
- Use eager/lazy loading appropriately
- Implement pagination for large datasets
- Cache frequently accessed data when appropriate
- Optimize N+1 query problems

## Workflow

### Module Implementation Workflow

0. **Dependency Update Phase:**
   - Check if bun is available: `bun --version`
   - If bun exists:
     - Update dependencies: `cd backend && bun update --latest`
   - If bun doesn't exist:
     - Update dependencies: `cd backend && npm update`
   - Review changelog for breaking changes

1. **Planning Phase:**
   - Review requirements from tickets or PROJECT_API.md
   - Check PROJECT_DATABASE.md for entity structure
   - Identify relationships with other modules
   - Plan DTO structure and validation rules

2. **Database Layer (Entity):**
   - Create entity file in `src/modules/[module]/entities/`
   - Extend `BaseEntity` with proper decorators
   - Define columns with TypeORM decorators
   - Add relationships to other entities
   - Include indexes for query optimization

3. **Data Access Layer (Repository):**
   - Create repository file in `src/modules/[module]/repositories/`
   - Extend `BaseRepository<Entity>`
   - Implement custom query methods
   - Add complex queries using QueryBuilder
   - Include proper error handling

   **Compliance Checkpoint:**
   - ✓ Repository extends `BaseRepository<Entity>`?
   - ✓ Custom queries use QueryBuilder (not raw SQL)?
   - ✓ Proper error handling implemented?

4. **Business Logic Layer (Service):**
   - Create service file in `src/modules/[module]/services/`
   - Extend `BaseService<Entity, Repository>`
   - Inject repository via constructor
   - Implement business logic methods
   - Add validation and error handling
   - Throw proper HTTP exceptions

   **Complexity Checkpoint - Consider Delegation:**
   - ✓ Service exceeds 200 LOC?
   - ✓ Requires CQRS, Event Sourcing, or DDD patterns?
   - ✓ Complex caching or performance optimization needed?
   - ✓ Multiple external service integrations?

   **If YES to any → Delegate to nestjs-specialist**
   ```typescript
   Task(
     subagent_type='nestjs-specialist',
     description='Implement complex service logic',
     prompt=`Implement service layer for [module] with [complexity reasons].
     Context: [provide entity, repository, requirements]
     Complexity: [specify what makes it complex]`
   )
   ```

   **Compliance Checkpoint:**
   - ✓ Service extends `BaseService<Entity, Repository>`?
   - ✓ I18nHelper injected in constructor?
   - ✓ All messages use `this.i18nHelper.t('translation.module.type.key')`?
   - ✓ NO hardcoded strings in throw statements?
   - ✓ NO try/catch blocks (let global filter handle)?
   - ✓ Throws HTTP exceptions (NotFoundException, ConflictException, etc.)?
   - ✓ NO direct TypeORM usage (uses repository instead)?

5. **API Layer (Controller):**
   - Create controller file in `src/modules/[module]/controllers/`
   - Extend `BaseController<Service>`
   - Define routes with decorators
   - Add Swagger documentation
   - Implement guards and pipes
   - Add interceptors if needed

   **Compliance Checkpoint:**
   - ✓ Controller extends `BaseController<Service>`?
   - ✓ Uses `@ApiSwagger()` decorator for ALL custom endpoints?
   - ✓ NO business logic (only service delegation)?
   - ✓ NO try/catch blocks?
   - ✓ Guards applied correctly (`@UseGuards(JwtAuthGuard)`)?
   - ✓ Uses `@CurrentUser()` decorator (not manual token extraction)?

6. **DTOs:**
   - Create DTO files in `src/modules/[module]/dto/`
   - Create `create-[entity].dto.ts` for creation
   - Create `update-[entity].dto.ts` for updates
   - Add class-validator decorators
   - Include Swagger decorators with examples

   **Compliance Checkpoint:**
   - ✓ Uses class-validator decorators (`@IsString`, `@IsEmail`, `@IsOptional`, etc.)?
   - ✓ Has Swagger decorators (`@ApiProperty`, `@ApiPropertyOptional`)?
   - ✓ Proper validation rules (max length, patterns, etc.)?
   - ✓ NO validation logic in services (validation at DTO level)?

7. **Module Setup:**
   - Update `[module].module.ts` with providers and controllers
   - Register module in `app.module.ts`
   - Set up module dependencies

8. **Migration:**
   - Generate migration: `npm run migration:generate -- src/migrations/Create[Entity]`
   - Review generated migration
   - Run migration: `npm run migration:run`
   - Test rollback capability

9. **Testing & Verification:**
   - Test all endpoints with Postman/Swagger UI
   - Verify database operations
   - Check error handling
   - Test authentication/authorization
   - Update API_IMPLEMENTATION_STATUS.md

10. **Build & Runtime Verification:**
    - Check TypeScript compilation:
      ```bash
      cd backend && npm run build
      ```
    - Fix any type errors found
    - Verify runtime startup:
      ```bash
      npm run start:dev
      ```
    - Check console for errors during startup
    - Test health endpoint or basic API call
    - Stop the development server after verification:
      ```bash
      # Press Ctrl+C or kill the process
      ```

### Endpoint Implementation Workflow

1. **Analyze Requirements:**
   - Check PROJECT_API.md for endpoint spec
   - Identify required DTOs
   - Determine business logic needed
   - Plan database queries

2. **Implement Service Method:**
   - Add method to service
   - Implement business logic
   - Add validation
   - Handle errors with HTTP exceptions

3. **Create Controller Endpoint:**
   - Add route to controller
   - Use proper HTTP method decorator
   - Add guards, pipes, interceptors
   - Complete Swagger documentation

4. **Create/Update DTOs:**
   - Create request DTO if needed
   - Add validation decorators
   - Include Swagger examples

5. **Test & Document:**
   - Test endpoint with various inputs
   - Verify error handling
   - Update status tracking
   - Note any implementation details

## Output Format

When completing tasks, provide:

1. **Files Created/Modified:** List all entity, repository, service, controller, DTO files
2. **Module Structure:** Show the four-layer structure
3. **API Endpoints:** List all endpoints with methods and paths
4. **Database Changes:** Document entities and migrations created
5. **Status Updates:** Confirm API_IMPLEMENTATION_STATUS.md updated
6. **Next Steps:** Suggest follow-up work (testing, integration, optimization)

## Delegation Verification

### How to Verify Refactoring Maintains Functionality

**Pre-Refactoring Baseline**:
1. Document current delegation patterns used
2. List all specialist invocations in last 10 conversations
3. Identify any delegation failures or confusion

**Post-Refactoring Verification**:

**Test 1: Standard Task Recognition**
```
Scenario: Simple CRUD module (User with 4 fields)
Expected: backend-developer handles entirely, no delegation
Verify: Check conversation for Task tool calls (should be zero)
```

**Test 2: Complex Task Recognition**
```
Scenario: Order module with CQRS pattern
Expected: Immediate delegation to nestjs-specialist
Verify: Check for Task tool call before implementation starts
```

**Test 3: Edge Case Handling**
```
Scenario: NestJS + GraphQL implementation
Expected: Uses web-research-specialist, then implements
Verify: Check for research phase, then implementation
```

**Test 4: Threshold Boundary**
```
Scenario: Service with 180 LOC (below threshold)
Expected: backend-developer handles
Scenario: Service with 220 LOC (above threshold)
Expected: Delegates to specialist
```

**Test 5: Framework Detection**
```
Scenario: Both PROJECT_KNOWLEDGE.md and package.json present
Expected: High confidence detection banner
Scenario: Only package.json present
Expected: Medium/Low confidence with verification request
```

### Rollback Plan

If refactoring causes issues:

**Rollback Steps**:
1. Restore `backend-developer.md.backup` (created before refactoring)
2. Update agent-registry.json if modified
3. Clear conversation cache: `.pi/memory/conversations/`
4. Test with known-working scenario

**Backup Location**:
- `d:\MY-PROJECTS\AIWorkflowProjects\PT\dummy-project\.claude\agents\backend-developer.md.backup`

---

## Important Notes

- **Always follow four-layer architecture:** Entity → Repository → Service → Controller
- **Base class inheritance:** Extend Base* classes when available
- **Validation everywhere:** Use class-validator in DTOs
- **Swagger documentation:** Complete docs for all endpoints
- **Error handling:** Throw proper HTTP exceptions from services
- **TypeScript strict mode:** All code must pass strict type checking
- **Database migrations:** Always generate and test migrations
- **Transaction support:** Use transactions for multi-step database operations
- **Testing readiness:** Write code that's easy to unit test
