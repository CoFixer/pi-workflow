# NestJS Guides

Comprehensive guides for NestJS backend development in the Coffee Club project.

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

---

## Guide Catalog

### Foundation & Core Patterns
1. [Authentication Guide](AUTHENTICATION-GUIDE.md) - JWT authentication implementation
2. [Base Controller Guide](BASE-CONTROLLER-GUIDE.md) - Base controller patterns and inheritance
3. [One Decorator Guide](ONE-DECORATOR-GUIDE.md) - Custom decorator patterns

### Error Handling & Responses
4. [Error Handling Guide](ERROR-HANDLING-GUIDE.md) - Error handling strategies
5. [Exception Handling Guide](EXCEPTION-HANDLING-GUIDE.md) - Exception handling patterns
6. [Response Layout Guide](RESPONSE-LAYOUT-GUIDE.md) - Response structure patterns
7. [Transform Interceptor Guide](TRANSFORM-INTERCEPTOR-GUIDE.md) - Interceptor patterns

### Development & Deployment
8. [Features Demo Guide](FEATURES-DEMO-GUIDE.md) - Feature demonstration examples
9. [Git Workflow Guide](GIT-WORKFLOW-GUIDE.md) - Git workflow patterns
10. [I18N Migration Guide](I18N-MIGRATION-GUIDE.md) - Internationalization migration
11. [Production Mode Guide](PRODUCTION-MODE-GUIDE.md) - Production deployment

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
- [Best Practices](../docs/BEST_PRACTICES.md) - Framework-specific best practices

---

**Guide Source**: [nestjs-starter-kit](https://github.com/CoFixer/nestjs-starter-kit)
**Last Updated**: 2026-01-19
**Total Guides**: 11
