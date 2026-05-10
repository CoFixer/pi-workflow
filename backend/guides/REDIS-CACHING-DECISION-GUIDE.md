# Redis Caching Decision Guide

**Complete decision guide for implementing Redis caching in Coffee Club backend.**

---

## Table of Contents

- [Overview](#overview)
- [When to Cache - Decision Flowchart](#when-to-cache---decision-flowchart)
- [NEVER Cache - Explicit Exception List](#never-cache---explicit-exception-list)
- [SHOULD Cache - High-Priority Endpoints](#should-cache---high-priority-endpoints)
- [TTL Recommendations](#ttl-recommendations)
- [Cache Invalidation Patterns](#cache-invalidation-patterns)
- [Implementation Examples](#implementation-examples)
- [Common Pitfalls](#common-pitfalls)

---

## Overview

This guide provides clear guidelines for deciding when to implement Redis caching on GET endpoints in Coffee Club backend.

**Current Status:**
- Total GET Endpoints: 79
- Endpoints WITH Caching: 1 (1.27%)
- Endpoints WITHOUT Caching: 78 (98.73%)

**Key Principle:** Not all GET endpoints should be cached. Cache only when it improves performance without compromising data freshness.

---

## When to Cache - Decision Flowchart

```
START: GET Endpoint
  ↓
Is data real-time operational (orders, kitchen workflow)?
  ├─ YES → ❌ NEVER CACHE
  └─ NO  → Continue
       ↓
Is data user-specific and changes frequently (balances, attendance)?
  ├─ YES → ❌ NEVER CACHE or USE USER-AWARE CACHING
  └─ NO  → Continue
       ↓
Is data computed/aggregated and needs to be fresh (dashboard, reports)?
  ├─ YES → ⚠️ USE SHORT TTL (60 seconds) or NEVER CACHE
  └─ NO  → Continue
       ↓
Is data time-sensitive (discounts, expiration checks)?
  ├─ YES → ⚠️ USE SHORT TTL (60 seconds)
  └─ NO  → Continue
       ↓
Is data static or changes infrequently (categories, items, users)?
  ├─ YES → ✅ CACHE with 'catalog' TTL (1 hour)
  └─ NO  → Continue
       ↓
Is data a reference list with moderate changes (customers, discounts)?
  ├─ YES → ✅ CACHE with 'list' TTL (30 minutes)
  └─ NO  → ✅ CACHE with 'default' TTL (5 minutes)
```

---

## NEVER Cache - Explicit Exception List

These endpoints **MUST NOT** be cached due to real-time requirements, data sensitivity, or high mutation frequency.

### Category 1: Real-Time Operational Data ❌

**Data changes in real-time, stale data causes operational issues**

| Module | Endpoint | Reason |
|--------|----------|--------|
| Orders | `GET /orders` | Order status changes in real-time (PENDING → PREPARING → COMPLETED) |
| Order Tokens | `GET /order-tokens` | Active kitchen/bar tokens, need live status |
| Kitchen Orders | `GET /kitchen-orders` | Real-time kitchen workflow tracking |
| Tables | `GET /tables/available` | Real-time table availability for seating |
| Activities | `GET /activities` | Audit trail, must be real-time for compliance |
| Kitchen Stock | `GET /kitchen-stock` | Inventory changes with every order |
| Order Items | `GET /order-items` | Order line items change during order editing |

**Total: 7 endpoints**

---

### Category 2: User-Specific Dynamic Data ❌

**Highly personalized, frequent changes, privacy concerns**

| Module | Endpoint | Reason |
|--------|----------|--------|
| Leaves | `GET /leaves/user/:userId` | Personal leave records, frequently updated |
| Attendance | `GET /stuff-attendance/report/:userId` | Personal attendance tracking |
| Customers | `GET /customers/:id/balance` | Live balance calculations, transactional |
| Customers | `GET /customers/:id/can-redeem/:amount` | Real-time redemption eligibility check |
| Staff Salary | `GET /staff-salary/user/:userId/history` | Sensitive financial data |

**Total: 5 endpoints**

---

### Category 3: Computed/Aggregated Real-Time Data ⚠️

**Expensive computation but needs fresh data - Use 60-second TTL if performance is critical**

| Module | Endpoint | Reason | Alternative |
|--------|----------|--------|-------------|
| Sales Reports | `GET /sales-reports/dashboard` | Real-time sales metrics for operations | Use 60-second TTL if performance is critical |
| Sales Reports | `GET /sales-reports/financial-summary` | Live financial data | Use 60-second TTL |
| Expenses | `GET /expenses/summary` | Changes with every expense entry | Use 60-second TTL |
| Sales Reports | `GET /sales-reports/by-date/:date` | Today's data changes frequently | Use 60s for today, 1h for past dates |
| Activities | `GET /activities/stats` | Audit statistics | Use 60-second TTL |

**Total: 5 endpoints (consider short TTL instead of no cache)**

---

### Category 4: Time-Sensitive Data ⚠️

**Data has time-based validity - Use SHORT TTL ONLY (60 seconds)**

| Module | Endpoint | TTL | Reason |
|--------|----------|-----|--------|
| Discounts | `GET /discounts/not-expired` | 60s | Checks expiration timestamp |
| Sales Reports | `GET /sales-reports/charts/sales-progress` | 60s | Today's progress updates frequently |
| Kitchen Orders | `GET /kitchen-orders/stock/:stockId` | 60s | Stock depletion tracking |

**Total: 3 endpoints (use short TTL, not full caching)**

---

### Category 5: Authentication & Authorization 🔒

**Security-sensitive, session-based**

| Module | Endpoint | Current Implementation | Recommendation |
|--------|----------|------------------------|----------------|
| Auth | `GET /auth/me` | Manual caching, 1-hour TTL | Keep existing manual caching with user-aware key |

**Total: 1 endpoint (already has manual caching)**

---

### Summary: NEVER Cache List

**Total Endpoints That Should NOT Be Cached: 21 endpoints**

- Real-Time Operational: 7 endpoints
- User-Specific Dynamic: 5 endpoints
- Computed Real-Time (or use 60s TTL): 5 endpoints
- Time-Sensitive (use 60s TTL): 3 endpoints
- Authentication (special handling): 1 endpoint

---

## SHOULD Cache - High-Priority Endpoints

These endpoints **SHOULD HAVE** Redis caching implemented to improve performance.

### Tier 1: Static Catalogs ✅ (TTL: 'catalog' = 1 hour)

**Rarely change, frequently accessed, high read-to-write ratio**

| Module | Endpoint | TTL Type | Invalidate On |
|--------|----------|----------|---------------|
| Categories | `GET /categories` | `catalog` | POST/PATCH/DELETE categories |
| Categories | `GET /categories/:id` | `catalog` | PATCH/DELETE categories/:id |
| Categories | `GET /categories/slug/:slug` | `catalog` | PATCH/DELETE categories |
| Items | `GET /items` | `catalog` | POST/PATCH/DELETE items |
| Items | `GET /items/:id` | `catalog` | PATCH/DELETE items/:id |
| Items | `GET /items/slug/:slug` | `catalog` | PATCH/DELETE items |
| Users | `GET /users` | `catalog` | POST/PATCH/DELETE users |
| Users | `GET /users/:id` | `catalog` | PATCH/DELETE users/:id |
| Users | `GET /users/email/:email` | `catalog` | PATCH/DELETE users |
| Expense Categories | `GET /expense-categories` | `catalog` | POST/PATCH/DELETE expense-categories |
| Expense Categories | `GET /expense-categories/:id` | `catalog` | PATCH/DELETE expense-categories/:id |
| Expense Categories | `GET /expense-categories/slug/:slug` | `catalog` | PATCH/DELETE expense-categories |

**Total: 12 endpoints** (High Priority)

---

### Tier 2: Reference Data ✅ (TTL: 'list' = 30 minutes)

**Moderate change frequency, good read-to-write ratio**

| Module | Endpoint | TTL Type | Invalidate On |
|--------|----------|----------|---------------|
| Customers | `GET /customers` | `list` | POST/PATCH customers |
| Customers | `GET /customers/:id` | `list` | PATCH customers/:id |
| Customers | `GET /customers/email/:email` | `list` | PATCH customers |
| Discounts | `GET /discounts` | `list` | POST/PATCH/DELETE discounts |
| Discounts | `GET /discounts/:id` | `list` | PATCH/DELETE discounts/:id |
| Discounts | `GET /discounts/name/:name` | `list` | PATCH/DELETE discounts |
| Tables | `GET /tables` | `list` | POST/PATCH/DELETE tables |
| Tables | `GET /tables/:id` | `list` | PATCH/DELETE tables/:id |
| Tables | `GET /tables/location/:location` | `list` | POST/PATCH/DELETE tables |
| Tables | `GET /tables/number/:number` | `list` | PATCH/DELETE tables |
| Banks | `GET /banks/user/:userId` | `list` | POST/PATCH banks |
| Banks | `GET /banks/:id` | `list` | PATCH/DELETE banks |

**Total: 12 endpoints** (Medium Priority)

---

### Tier 3: Historical Data ✅ (TTL: 'stats' = 15 minutes)

**Historical reports don't change once date has passed**

| Module | Endpoint | TTL Type | Notes |
|--------|----------|----------|-------|
| Sales Reports | `GET /sales-reports/by-date/:date` | `stats` or `catalog` | Use `catalog` (1h) for past dates, `stats` (15m) for today |
| Sales Reports | `GET /sales-reports/charts/expenses` | `stats` | Historical expense charts |
| Expenses | `GET /expenses/category/:categoryId` | `stats` | Category-wise expense history |
| Expenses | `GET /expenses/status/:status` | `stats` | Expenses by status |

**Total: 4 endpoints** (Low Priority)

---

### Summary: SHOULD Cache List

**Total Endpoints That Should Have Caching: 28 endpoints**

- Tier 1 (Static Catalogs): 12 endpoints
- Tier 2 (Reference Data): 12 endpoints
- Tier 3 (Historical Data): 4 endpoints

---

## TTL Recommendations

### TTL Type Reference

| TTL Type | Duration (ms) | Duration (human) | Use Case |
|----------|---------------|------------------|----------|
| `catalog` | 3600000 | 1 hour | Static catalogs (categories, items, users) |
| `list` | 1800000 | 30 minutes | Reference data (customers, discounts, tables) |
| `stats` | 900000 | 15 minutes | Computed statistics, historical reports |
| `default` | 300000 | 5 minutes | General purpose, frequently updated |
| `session` | 3600000 | 1 hour | User sessions, profiles |
| Custom (60000) | 60000 | 60 seconds | Time-sensitive data |

### When to Use Each TTL

**`catalog` (1 hour):**
- Data changes very rarely (hours/days)
- High read-to-write ratio (100:1 or more)
- Examples: Categories, Items, Users, Expense Categories

**`list` (30 minutes):**
- Data changes occasionally (minutes/hours)
- Good read-to-write ratio (10:1 to 100:1)
- Examples: Customers, Discounts, Tables

**`stats` (15 minutes):**
- Computed/aggregated data
- Expensive to calculate
- Can tolerate 15-minute staleness
- Examples: Historical reports, dashboard statistics

**`default` (5 minutes):**
- General purpose data
- Moderate change frequency
- Use when unsure

**`session` (1 hour):**
- User-specific session data
- Doesn't change during session
- Examples: User profile, preferences

**Custom (60 seconds):**
- Time-sensitive data
- Needs freshness but benefits from brief caching
- Examples: Discount expiration checks, today's sales

---

## Cache Invalidation Patterns

### Pattern 1: Single Resource Invalidation

```typescript
@Post()
@CacheInvalidate({ patterns: ['categories:*'] })
async create(@Body() dto: CreateCategoryDto) {
  return this.service.create(dto);
}

@Patch(':id')
@CacheInvalidate({ patterns: ['categories:*'] })
async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
  return this.service.update(id, dto);
}

@Delete(':id')
@CacheInvalidate({ patterns: ['categories:*'] })
async remove(@Param('id') id: string) {
  return this.service.remove(id);
}
```

### Pattern 2: Multiple Resource Invalidation

```typescript
// When updating a category affects items (foreign key relationship)
@Patch(':id')
@CacheInvalidate({ patterns: ['categories:*', 'items:*'] })
async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
  return this.service.update(id, dto);
}
```

### Pattern 3: Specific Key Invalidation

```typescript
// Invalidate specific keys (no wildcards)
@Patch(':id/activate')
@CacheInvalidate({ patterns: ['categories:all', 'categories:active'] })
async activate(@Param('id') id: string) {
  return this.service.activate(id);
}
```

### Pattern 4: Invalidate Before Deletion

```typescript
// Invalidate before handler execution (useful for deletions)
@Delete(':id')
@CacheInvalidate({ patterns: ['categories:*'], before: true })
async remove(@Param('id') id: string) {
  return this.service.remove(id);
}
```

---

## Implementation Examples

### Example 1: Categories Controller (Static Catalog)

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { Cacheable, CacheInvalidate } from 'src/core/decorators';

@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  @Cacheable({ key: 'categories:all', ttl: 'catalog' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Cacheable({
    keyGenerator: (req) => `categories:${req.params.id}`,
    ttl: 'catalog',
  })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('slug/:slug')
  @Cacheable({
    keyGenerator: (req) => `categories:slug:${req.params.slug}`,
    ttl: 'catalog',
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post()
  @CacheInvalidate({ patterns: ['categories:*'] })
  async create(@Body() dto: CreateCategoryDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @CacheInvalidate({ patterns: ['categories:*'] })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @CacheInvalidate({ patterns: ['categories:*'] })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

### Example 2: Items Controller (Static Catalog with Relationships)

```typescript
@Controller('items')
export class ItemController {
  constructor(private readonly service: ItemService) {}

  @Get()
  @Cacheable({ key: 'items:all', ttl: 'catalog' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Cacheable({
    keyGenerator: (req) => `items:${req.params.id}`,
    ttl: 'catalog',
  })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @CacheInvalidate({ patterns: ['items:*', 'categories:*'] }) // Also invalidate categories
  async create(@Body() dto: CreateItemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @CacheInvalidate({ patterns: ['items:*', 'categories:*'] })
  async update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.service.update(id, dto);
  }
}
```

### Example 3: Discounts Controller (Time-Sensitive Data)

```typescript
@Controller('discounts')
export class DiscountController {
  constructor(private readonly service: DiscountService) {}

  @Get()
  @Cacheable({ key: 'discounts:all', ttl: 'list' })
  async findAll() {
    return this.service.findAll();
  }

  // Time-sensitive: Use short TTL
  @Get('not-expired')
  @Cacheable({ key: 'discounts:active', ttl: 60000 }) // 60 seconds
  async getNotExpired() {
    return this.service.getNotExpired();
  }

  @Post()
  @CacheInvalidate({ patterns: ['discounts:*'] })
  async create(@Body() dto: CreateDiscountDto) {
    return this.service.create(dto);
  }
}
```

---

## Common Pitfalls

### ❌ Pitfall 1: Caching Real-Time Data

```typescript
// WRONG: Caching order status (changes frequently)
@Get()
@Cacheable({ key: 'orders:all', ttl: 'catalog' })
async findAll() {
  return this.orderService.findAll();
}

// CORRECT: No caching for real-time operational data
@Get()
async findAll() {
  return this.orderService.findAll();
}
```

### ❌ Pitfall 2: Not Invalidating Cache on Mutations

```typescript
// WRONG: Creating/updating without invalidating cache
@Post()
async create(@Body() dto: CreateCategoryDto) {
  return this.service.create(dto);
}

// CORRECT: Invalidate related caches
@Post()
@CacheInvalidate({ patterns: ['categories:*'] })
async create(@Body() dto: CreateCategoryDto) {
  return this.service.create(dto);
}
```

### ❌ Pitfall 3: Too Long TTL for Dynamic Data

```typescript
// WRONG: 1-hour cache for frequently changing data
@Get('dashboard')
@Cacheable({ key: 'reports:dashboard', ttl: 'catalog' })
async getDashboard() {
  return this.service.getDashboardStats();
}

// CORRECT: Short TTL or no cache
@Get('dashboard')
@Cacheable({ key: 'reports:dashboard', ttl: 60000 }) // 60 seconds
async getDashboard() {
  return this.service.getDashboardStats();
}
```

### ❌ Pitfall 4: Forgetting Related Cache Invalidation

```typescript
// WRONG: Only invalidating items when category changes affect them
@Patch(':id')
@CacheInvalidate({ patterns: ['categories:*'] })
async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
  return this.service.update(id, dto);
}

// CORRECT: Invalidate related caches
@Patch(':id')
@CacheInvalidate({ patterns: ['categories:*', 'items:*'] }) // Items depend on categories
async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
  return this.service.update(id, dto);
}
```

---

## Quick Reference Checklist

Before implementing caching on a GET endpoint:

- [ ] Is data static or changes infrequently? → Use caching
- [ ] Is data real-time operational? → NO caching
- [ ] Is data user-specific and changes frequently? → NO caching or user-aware caching
- [ ] Is data computed and needs freshness? → Short TTL (60s) or NO caching
- [ ] Is data time-sensitive? → Short TTL (60s) only
- [ ] Have I added @CacheInvalidate to ALL mutation endpoints?
- [ ] Have I chosen the appropriate TTL type?
- [ ] Have I used wildcards correctly for invalidation?
- [ ] Have I considered related cache invalidation?

---

**Related Files:**
- [workflow-implement-redis-caching.md](workflow-implement-redis-caching.md) - Implementation workflow
- [CLAUDE.md](../../../CLAUDE.md) - Project documentation
- [backend/src/core/decorators/](../../../backend/src/core/decorators/) - Decorator implementations
- [backend/src/core/constants/cache-ttl.constants.ts](../../../backend/src/core/constants/cache-ttl.constants.ts) - TTL constants

---

**Last Updated:** 2026-01-19
**Version:** 1.0
