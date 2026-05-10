# NestJS Guides & Workflows

Comprehensive guides and step-by-step workflows for NestJS/TypeORM development in Coffee Club.

---

## Architecture Overview

Coffee Club backend follows a strict **3-layer architecture**:

```
Controller (HTTP endpoints)
    ↓
Service (Business logic + caching)
    ↓
Repository (TypeORM queries)
```

**Base Classes Pattern:**
- All entities extend `BaseEntity` (UUID, timestamps, soft delete)
- All controllers extend `BaseController` (automatic CRUD)
- All services use repositories (no direct TypeORM access)

---

## Guide Categories

### 🏗️ Architecture & Core Patterns (4 guides)
1. [Base Controller Guide](BASE-CONTROLLER-GUIDE.md) - Four-layer architecture and base classes
2. [Routing & Controllers](ROUTING-AND-CONTROLLERS-GUIDE.md) - Controller patterns and decorators
3. [Services & Repositories](SERVICES-AND-REPOSITORIES-GUIDE.md) - Business logic and data access patterns
4. [Database Patterns](DATABASE-PATTERNS-GUIDE.md) - TypeORM and database access patterns

### 🔒 Authentication & Authorization (2 guides)
1. [Authentication Guide](AUTHENTICATION-GUIDE.md) - JWT authentication implementation
2. [RBAC Guide](RBAC-GUIDE.md) - Role-based access control

### ⚠️ Error Handling & Validation (3 guides)
1. [Error Handling Guide](ERROR-HANDLING-GUIDE.md) - Error handling strategies
2. [Exception Handling Guide](EXCEPTION-HANDLING-GUIDE.md) - Exception handling patterns
3. [Validation Guide](VALIDATION-GUIDE.md) - DTO and class-validator patterns

### 📚 API Documentation & Testing (3 guides)
1. [One Decorator Guide](ONE-DECORATOR-GUIDE.md) - Swagger documentation with @ApiSwagger
2. [Testing Guide](TESTING-GUIDE.md) - Jest testing strategies
3. [Features Demo Guide](FEATURES-DEMO-GUIDE.md) - Feature demonstration examples

### 🛠️ Infrastructure & Tools (7 guides)
1. [Middleware Guide](MIDDLEWARE-GUIDE.md) - Guards, interceptors, pipes, filters
2. [Transform Interceptor Guide](TRANSFORM-INTERCEPTOR-GUIDE.md) - Interceptor patterns
3. [Response Layout Guide](RESPONSE-LAYOUT-GUIDE.md) - Response structure patterns
4. [Configuration Guide](CONFIGURATION-GUIDE.md) - Environment and configuration management
5. [Monitoring Guide](MONITORING-GUIDE.md) - Sentry and error tracking
6. [Redis Caching Decision Guide](REDIS-CACHING-DECISION-GUIDE.md) - When to cache, exceptions list, TTL recommendations
7. [Best Practices](BEST-PRACTICES.md) - NestJS coding standards

### 🚀 Development & Deployment (4 guides)
1. [I18N Migration Guide](I18N-MIGRATION-GUIDE.md) - Internationalization migration
2. [Production Mode Guide](PRODUCTION-MODE-GUIDE.md) - Production deployment
3. [Git Workflow Guide](GIT-WORKFLOW-GUIDE.md) - Git workflow patterns
4. [Best Practices](BEST-PRACTICES.md) - General development best practices

---

## 📋 Workflows

Step-by-step procedures for completing specific tasks.

| Workflow | Description |
|----------|-------------|
| [workflow-design-database.md](workflow-design-database.md) | Design database schema from requirements |
| [workflow-generate-api-docs.md](workflow-generate-api-docs.md) | Generate API documentation from controllers |
| [workflow-generate-e2e-tests.md](workflow-generate-e2e-tests.md) | Generate end-to-end tests |
| [workflow-implement-redis-caching.md](workflow-implement-redis-caching.md) | Implement Redis caching with @Cacheable and @CacheInvalidate decorators |
| [workflow-convert-prd-to-knowledge.md](workflow-convert-prd-to-knowledge.md) | Convert PRD to project knowledge |

---

## Quick Start

1. Read [Base Controller Guide](BASE-CONTROLLER-GUIDE.md) first for foundation patterns
2. Follow [Authentication Guide](AUTHENTICATION-GUIDE.md) for security implementation
3. Study real Coffee Club examples in `backend/src/modules/`

---

## Key Coffee Club Patterns

- **UUID Primary Keys** - All entities use `@PrimaryGeneratedColumn('uuid')`
- **3-Layer Architecture** - Strictly enforced across all 25 modules
- **Redis Caching** - Cache on read, invalidate on write
- **DTO Pattern** - Base/Create/Update/Response structure
- **No Raw SQL** - Only TypeORM repository methods or QueryBuilder
- **Swagger Documentation** - All endpoints documented with @ApiOperation and @ApiResponse

---

## Coffee Club Backend Modules

The backend consists of **25 feature modules** following consistent patterns:

### Order Management
- **orders** - Order CRUD with status management (PENDING → PREPARING → COMPLETED)
- **order-items** - Order line items with item relationships
- **order-tokens** - Kitchen and bar token generation (KITCHEN/BAR separation)

### Menu & Inventory
- **items** - Product catalog with variations
- **categories** - Item categorization (hierarchical)
- **discounts** - Discount management and application

### Customer & Loyalty
- **customers** - Customer management
- **loyalty-programs** - Points-based loyalty system

### Staff & Operations
- **users** - Staff/admin user management
- **attendances** - Staff attendance tracking
- **expenses** - Expense recording and reporting
- **reports** - Sales and operational reports

### Table Management
- **tables** - Restaurant table management
- **table-qr-codes** - QR code generation for tables

### Payments
- **payment-methods** - Payment type management
- **payments** - Payment processing and reconciliation

### Infrastructure
- **auth** - JWT authentication and authorization
- **cache** - Redis caching abstraction
- **cloudinary** - Image upload integration
- **mail** - Email notification system
- **sms** - SMS notification integration

---

## TypeORM Best Practices (Verified)

✅ **Coffee Club Backend Status:**
- **Zero raw SQL queries** - All modules use TypeORM repository methods
- **Type-safe queries** - QueryBuilder used for complex queries
- **Proper relationships** - @ManyToOne, @OneToMany, @ManyToMany decorators
- **UUID primary keys** - Consistent across all entities
- **Migrations** - Database schema versioning

**Example Query Pattern:**
```typescript
// ✅ GOOD - Type-safe TypeORM query
async findOrdersWithItems(status: OrderStatus): Promise<Order[]> {
  return await this.orderRepository.find({
    where: { status },
    relations: ['orderItems', 'customer', 'tables'],
    order: { created_at: 'DESC' },
  });
}

// ✅ GOOD - Complex query with QueryBuilder
async getOrderStats(startDate: Date, endDate: Date) {
  return await this.orderRepository
    .createQueryBuilder('order')
    .leftJoin('order.orderItems', 'items')
    .where('order.created_at BETWEEN :start AND :end', {
      start: startDate,
      end: endDate,
    })
    .select('COUNT(order.id)', 'total_orders')
    .addSelect('SUM(order.total_amount)', 'total_revenue')
    .getRawOne();
}

// ❌ AVOID - Raw SQL queries
// await this.connection.query('SELECT * FROM orders WHERE...')
```

---

## Related Documentation

- [CLAUDE.md](../../../CLAUDE.md) - Full project documentation
- [Backend Modules](../../../backend/src/modules/) - Source code
- [Best Practices](BEST-PRACTICES.md) - NestJS coding standards

---

**Guide Source**: Merged from [nestjs-starter-kit](https://github.com/CoFixer/nestjs-starter-kit) and activitycoaching project
**Last Updated**: 2026-01-19
**Total Guides**: 21 guides + 5 workflows
