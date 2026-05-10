# NestJS Agents

Specialized autonomous agents for NestJS development, testing, debugging, and optimization.

---

## Directory Structure

Agents are organized by function:

- **[development/](development/)** - Code generation and feature implementation agents
- **[testing/](testing/)** - Testing and verification agents
- **[debugging/](debugging/)** - Issue diagnosis and troubleshooting agents
- **[optimization/](optimization/)** - Performance improvement agents

---

## Available Agents

### Development Agents

#### 1. module-scaffolder
**Location:** [`development/module-scaffolder.md`](development/module-scaffolder.md)
**Purpose:** Automatically scaffold complete NestJS CRUD modules
**Model:** Sonnet | **Automation:** 80%

**Use When:**
- Creating new features from scratch
- Generating boilerplate code quickly
- Need standard CRUD operations

**Output:** 8 files per module (entity, repository, service, controller, 3 DTOs, module)

**Example Triggers:**
- "Generate a CRUD module for Product"
- "Scaffold Order module with relationships to Customer and Items"

---

#### 2. backend-developer
**Location:** [`development/backend-developer.md`](development/backend-developer.md)
**Purpose:** End-to-end backend development from PRD to tested API
**Model:** Opus | **Automation:** 70%

**Use When:**
- Implementing features from PRD documents
- Updating APIs based on new requirements
- Need complete feature implementation (database + API + tests + docs)

**Workflow Phases:**
1. PRD Analysis
2. Documentation Update (CLAUDE.md)
3. Database Design (entities + migrations)
4. API Development (three-layer architecture)
5. Testing & Swagger Documentation

**Example Triggers:**
- "Implement the new table reservation feature from the PRD"
- "Update the order management API based on PRD changes"

---

### Testing Agents

#### 3. auth-route-tester
**Location:** [`testing/auth-route-tester.md`](testing/auth-route-tester.md)
**Purpose:** Test route functionality and verify database changes
**Model:** Sonnet | **Automation:** 85%

**Use When:**
- After creating or modifying routes
- Need to verify E2E functionality
- Want code review of implementation

**Testing Protocol:**
1. Identify routes created/modified
2. Test with Bearer token authentication
3. Verify database changes (PostgreSQL)
4. Review implementation for improvements

**Example Triggers:**
- "Test the new POST /orders/create route"
- "Verify the updated customer update endpoint works correctly"

---

### Debugging Agents

#### 4. auth-route-debugger
**Location:** [`debugging/auth-route-debugger.md`](debugging/auth-route-debugger.md)
**Purpose:** Diagnose authentication and routing issues
**Model:** Unspecified | **Automation:** 90%

**Use When:**
- Getting 401/403 errors on routes
- Routes returning 404 despite being defined
- JWT token issues
- Guard configuration problems

**Debugging Capabilities:**
- JWT Bearer token authentication issues
- Route registration and module imports
- Guard chain verification
- NestJS Passport.js integration

**Example Triggers:**
- "I'm getting 401 errors on /api/orders/:id"
- "The POST /auth/register route returns 404"
- "Test if /api/customers/profile works with authentication"

---

### Optimization Agents

#### 5. cache-manager
**Location:** [`optimization/cache-manager.md`](optimization/cache-manager.md)
**Purpose:** Implement and optimize Redis caching strategies
**Model:** Sonnet | **Automation:** 75%

**Use When:**
- Adding caching to existing endpoints
- Debugging cache invalidation issues
- Optimizing Redis memory usage
- Need performance improvements

**Caching Workflow:**
1. Analyze caching requirements
2. Design cache strategy (keys, TTL, invalidation)
3. Implement @Cacheable and @CacheInvalidate decorators
4. Test and validate cache behavior

**Example Triggers:**
- "Add Redis caching to the orders controller"
- "Debug why the item list isn't updating after adding new items"
- "Optimize cache TTLs to reduce memory usage"

---

## Agent Selection Guide

Quick reference for choosing the right agent:

| Scenario | Agent to Use | Category |
|----------|-------------|----------|
| Create new feature from PRD | backend-developer | Development |
| Generate CRUD module quickly | module-scaffolder | Development |
| Test newly created endpoints | auth-route-tester | Testing |
| Fix 401/403 authentication errors | auth-route-debugger | Debugging |
| Route returns 404 despite being defined | auth-route-debugger | Debugging |
| Add caching to endpoints | cache-manager | Optimization |
| Optimize slow endpoints | cache-manager | Optimization |
| Verify database changes after POST | auth-route-tester | Testing |
| Implement complete feature workflow | backend-developer | Development |

---

## Agent Guidelines

All NestJS agents in Coffee Club follow these conventions:

### Architecture Patterns
- **Three-Layer Architecture:** Controller → Service (in providers/) → Repository
- **Base Classes:** Extend BaseEntity, BaseService, BaseRepository, BaseController when appropriate
- **UUID Primary Keys:** Always use `@PrimaryGeneratedColumn('uuid')`
- **Soft Delete:** Use `@DeleteDateColumn()` for soft delete support
- **Timestamps:** Include `@CreateDateColumn()` and `@UpdateDateColumn()`
- **Table Prefix:** Use `cc_` prefix for all tables (e.g., `cc_orders`, `cc_customers`)

### Validation & Documentation
- **DTOs:** Use class-validator decorators (@IsString, @IsNumber, @IsEmail, etc.)
- **Swagger:** Use @ApiTags, @ApiOperation, @ApiResponse decorators
- **Error Handling:** Throw HTTP exceptions (NotFoundException, BadRequestException, etc.)

### Testing
- **E2E Tests:** Use Jest + Supertest in `backend/test/e2e/`
- **Fixtures:** Leverage test fixtures in `backend/test/fixtures/`
- **Authentication:** Use JWT Bearer tokens for protected endpoints

### Database
- **ORM:** TypeORM with PostgreSQL
- **Naming:** snake_case for columns (automatic), camelCase for properties
- **Migrations:** Always generate migrations for schema changes (`npm run migration:generate`)
- **Relationships:** Use TypeORM decorators (@ManyToOne, @OneToMany, @ManyToMany)

### Authentication
- **Pattern:** JWT Bearer token in Authorization header
- **Guards:** JwtAuthGuard for authentication, RolesGuard for authorization
- **Decorators:** @Public() for public routes, @CurrentUser() to access authenticated user

### Performance
- **Caching:** Redis with @Cacheable and @CacheInvalidate decorators
- **Cache Prefix:** Use `cc:` for all Coffee Club cache keys
- **TTL Strategy:** catalog (1h), list (30min), stats (15min), default (5min)

---

## Coffee Club Domain

**Core Entities:**
- **Orders:** Order management with status transitions (PENDING → PREPARING → COMPLETED)
- **OrderItems:** Order line items with item relationships
- **OrderTokens:** Kitchen and bar token generation
- **Items:** Menu items with variations and categories
- **Categories:** Item categorization (hierarchical)
- **Customers:** Customer management with loyalty points
- **Tables:** Restaurant table management and QR codes
- **Payments:** Payment methods and processing
- **Discounts:** Discount management and application
- **Users:** Staff/admin user management
- **Expenses:** Expense recording and reporting
- **Reports:** Sales and operational reports

---

## See Also

- **[Guides](../guides/README.md)** - Comprehensive NestJS development guides (21 guides)
- **[Workflows](../guides/workflow-*.md)** - Step-by-step workflow guides (5 workflows)
- **[Skills](../skills/README.md)** - NestJS skills for code generation
- **[Examples](../examples/README.md)** - Complete working code examples
- **[CLAUDE.md](../../../CLAUDE.md)** - Main project documentation

---

**Last Updated:** 2026-01-19
**Total Agents:** 5 (2 Development, 1 Testing, 1 Debugging, 1 Optimization)
**Coverage:** Full development lifecycle automation
