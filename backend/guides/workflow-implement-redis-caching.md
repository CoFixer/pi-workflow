# Redis Caching Guide

Complete guide to implementing Redis caching in NestJS applications using the @Cacheable and @CacheInvalidate decorators.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [@Cacheable Decorator](#cacheable-decorator)
- [@CacheInvalidate Decorator](#cacheinvalidate-decorator)
- [TTL Strategy](#ttl-strategy)
- [Cache Key Patterns](#cache-key-patterns)
- [Manual Cache Operations](#manual-cache-operations)
- [Anti-Patterns](#anti-patterns)
- [Complete Examples](#complete-examples)

---

## Overview

Redis caching is implemented using a decorator-based approach that automatically handles cache operations for GET endpoints and cache invalidation for mutation operations.

### Architecture

```
HTTP Request → @Cacheable → CacheService → Redis
                    ↓
                 Cache Hit? → Return cached data
                    ↓ No
               Execute Handler → Cache result → Return data
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| CacheModule | `backend/src/modules/cache/` | Global module providing CacheService |
| CacheService | `backend/src/modules/cache/cache.service.ts` | Redis operations (get, set, delete) |
| @Cacheable | `backend/src/core/decorators/cacheable.decorator.ts` | Decorator for caching GET responses |
| @CacheInvalidate | `backend/src/core/decorators/cache-invalidate.decorator.ts` | Decorator for invalidating cache |
| CACHE_TTL | `backend/src/core/constants/cache-ttl.constants.ts` | TTL type definitions and values |

---

## Configuration

### Environment Variables

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_PREFIX=cc:
REDIS_DB=0
```

**Note:** TTL values are now defined in code at `backend/src/core/constants/cache-ttl.constants.ts` instead of environment variables for better type safety.

### TTL Types

| Type | Duration | Use Case |
|------|----------|----------|
| `'default'` | 5 minutes | General purpose, frequently updated data |
| `'catalog'` | 1 hour | Static catalogs (categories, items, users, expense categories) |
| `'list'` | 30 minutes | Entity lists (customers, discounts, tables) |
| `'stats'` | 15 minutes | Computed statistics (dashboard, reports) |
| `'session'` | 1 hour | User sessions and profiles |
| `number` | Custom milliseconds | Specific TTL in milliseconds (e.g., 60000 = 60 seconds) |

**Defined in:** `backend/src/core/constants/cache-ttl.constants.ts`

---

## @Cacheable Decorator

Use `@Cacheable` on GET endpoints to automatically cache responses.

### Basic Usage

```typescript
import { Cacheable } from 'src/core/decorators';

@Get()
@Cacheable({ key: 'categories:all', ttl: 'catalog' })
async findAll() {
    return this.categoryService.findAll();
}
```

### Options

```typescript
interface CacheableOptions {
    key?: string;                    // Static cache key
    keyGenerator?: (req) => string;  // Dynamic key generator
    ttl?: CacheTTLType;             // TTL type or seconds
    userAware?: boolean;             // Include user ID in key
}
```

### With Dynamic Key Generator

```typescript
@Get('search')
@Cacheable({
    keyGenerator: (req) => `items:search:${req.query?.q || 'all'}`,
    ttl: 'catalog',
})
async search(@Query('q') query: string) {
    return this.itemService.searchItems(query);
}
```

### With URL Parameters

```typescript
@Get(':id')
@Cacheable({
    keyGenerator: (req) => `categories:${req.params?.id}`,
    ttl: 'catalog',
})
async findOne(@Param('id') id: string) {
    return this.categoryService.findByIdOrFail(id);
}
```

### User-Aware Caching

For user-specific data, include user ID in the cache key:

```typescript
@Get('my-data')
@Cacheable({
    key: 'user:profile',
    ttl: 'default',
    userAware: true,  // Cache key becomes: user:{userId}:user:profile
})
async getMyProfile(@CurrentUser() user: IJwtPayload) {
    return this.userService.getProfile(user.id);
}
```

---

## @CacheInvalidate Decorator

Use `@CacheInvalidate` on mutation endpoints (POST, PATCH, DELETE) to clear related caches.

### Basic Usage

```typescript
import { CacheInvalidate } from 'src/core/decorators';

@Post()
@CacheInvalidate({ patterns: ['categories:*'] })
async create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
}
```

### Options

```typescript
interface CacheInvalidateOptions {
    patterns: string[];  // Array of cache key patterns to invalidate
    before?: boolean;    // Invalidate before handler (default: after)
}
```

### Multiple Patterns

```typescript
@Patch(':id')
@CacheInvalidate({
    patterns: [
        'categories:*',   // All category caches
        'items:*',        // Related item caches (items belong to categories)
    ]
})
async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
}
```

### Invalidate Before Handler

```typescript
@Delete(':id')
@CacheInvalidate({
    patterns: ['categories:*'],
    before: true,  // Invalidate before deletion
})
async remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
}
```

---

## TTL Strategy

### Recommended TTL by Data Type

| Data Category | TTL | Examples |
|---------------|-----|----------|
| Static Catalogs | `'catalog'` (1h) | Categories, Items, Users, Expense Categories |
| Entity Lists | `'list'` (30m) | Customers, Discounts, Tables |
| Computed Stats | `'stats'` (15m) | Dashboard, Sales Reports, Aggregates |
| User Sessions | `'session'` (1h) | User Profiles, Authentication |
| Real-time Data | No Cache | Orders, Order Tokens, Kitchen Workflow, Table Availability |

### Configuring via Environment

```env
# Production (longer TTLs for stability)
REDIS_CATALOG_TTL=3600
REDIS_LIST_TTL=1800
REDIS_STATS_TTL=900

# Development (shorter TTLs for testing)
REDIS_CATALOG_TTL=300
REDIS_LIST_TTL=120
REDIS_STATS_TTL=60
```

---

## Cache Key Patterns

### Naming Convention

```
{prefix}:{entity}:{identifier}:{optional-filter}
```

### Examples

| Pattern | Description |
|---------|-------------|
| `cc:categories:all` | All categories |
| `cc:categories:123` | Single category by ID |
| `cc:items:search:burger` | Search results |
| `cc:items:category:food` | Items by category |
| `cc:customers:page:1:limit:10` | Paginated customers |
| `cc:reports:dashboard` | Dashboard stats |
| `cc:user:456:profile` | User-specific profile |

### Wildcard Patterns for Invalidation

```typescript
// Invalidate all category-related caches
patterns: ['categories:*']

// Invalidate specific user's caches
patterns: ['user:456:*']

// Invalidate multiple patterns
patterns: ['categories:*', 'items:*', 'reports:dashboard']
```

---

## Manual Cache Operations

For complex scenarios, use CacheService directly:

```typescript
import { CacheService } from 'src/infrastructure/cache';

@Injectable()
export class SomeService {
    constructor(private readonly cacheService: CacheService) {}

    async getWithManualCache(id: string) {
        const cacheKey = this.cacheService.generateKey('custom', id);

        // Try cache first
        const cached = await this.cacheService.get<MyEntity>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch and cache
        const data = await this.repository.findById(id);
        await this.cacheService.set(cacheKey, data, 'default');
        return data;
    }

    async invalidateCustomCache(pattern: string) {
        await this.cacheService.deletePattern(pattern);
    }
}
```

### CacheService Methods

| Method | Description |
|--------|-------------|
| `get<T>(key)` | Get cached value |
| `set(key, value, ttl)` | Set cached value with TTL |
| `delete(key)` | Delete single key |
| `deletePattern(pattern)` | Delete keys matching pattern |
| `generateKey(...parts)` | Generate prefixed cache key |
| `isReady()` | Check if Redis is connected |
| `getStats()` | Get cache statistics |
| `flushAll()` | Clear all application caches |

---

## Anti-Patterns

### What NOT to Cache

1. **Real-time Data**
   - Notifications, unread counts
   - Live status indicators
   - WebSocket data

2. **User Authentication**
   - Session tokens
   - Login status
   - Current user info

3. **Frequently Mutating Data**
   - Chat messages (use short TTL if needed)
   - Today's dynamic data

4. **Sensitive Data**
   - Passwords, tokens
   - Personal identifiable information

### Common Mistakes

```typescript
// ❌ BAD: Caching mutation endpoint
@Post()
@Cacheable({ key: 'create:result' })  // Don't cache POST!
async create(@Body() dto: CreateDto) { ... }

// ❌ BAD: Not invalidating related caches
@Post()
// Missing @CacheInvalidate!
async create(@Body() dto: CreateDto) { ... }

// ❌ BAD: Too long TTL for dynamic data
@Cacheable({ key: 'notifications', ttl: 3600 })  // 1 hour is too long!
async getNotifications() { ... }

// ✅ GOOD: Proper invalidation
@Post()
@CacheInvalidate({ patterns: ['exercises:*'] })
async create(@Body() dto: CreateDto) { ... }
```

---

## Complete Examples

### Category Controller with Caching (Coffee Club Example)

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { Cacheable, CacheInvalidate } from 'src/core/decorators';
import { CategoryService } from './providers/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    @Cacheable({ key: 'categories:all', ttl: 'catalog' })
    async findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    @Cacheable({
        keyGenerator: (req) => `categories:${req.params?.id}`,
        ttl: 'catalog',
    })
    async findOne(@Param('id') id: string) {
        return this.categoryService.findByIdOrFail(id);
    }

    @Get('slug/:slug')
    @Cacheable({
        keyGenerator: (req) => `categories:slug:${req.params?.slug}`,
        ttl: 'catalog',
    })
    async findBySlug(@Param('slug') slug: string) {
        return this.categoryService.findBySlug(slug);
    }

    @Post()
    @CacheInvalidate({ patterns: ['categories:*'] })
    async create(@Body() dto: CreateCategoryDto) {
        return this.categoryService.create(dto);
    }

    @Patch(':id')
    @CacheInvalidate({ patterns: ['categories:*', 'items:*'] }) // Also invalidate items
    async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoryService.update(id, dto);
    }

    @Delete(':id')
    @CacheInvalidate({ patterns: ['categories:*', 'items:*'] })
    async remove(@Param('id') id: string) {
        return this.categoryService.remove(id);
    }
}
```

### Item Controller with Caching (Coffee Club Example)

```typescript
import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { Cacheable, CacheInvalidate } from 'src/core/decorators';
import { ItemService } from './providers/item.service';
import { CreateItemDto, UpdateItemDto } from './dto';

@Controller('items')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Get()
    @Cacheable({ key: 'items:all', ttl: 'catalog' })
    async findAll() {
        return this.itemService.findAll();
    }

    @Get(':id')
    @Cacheable({
        keyGenerator: (req) => `items:${req.params?.id}`,
        ttl: 'catalog',
    })
    async findOne(@Param('id') id: string) {
        return this.itemService.findByIdOrFail(id);
    }

    @Get('slug/:slug')
    @Cacheable({
        keyGenerator: (req) => `items:slug:${req.params?.slug}`,
        ttl: 'catalog',
    })
    async findBySlug(@Param('slug') slug: string) {
        return this.itemService.findBySlug(slug);
    }

    @Post()
    @CacheInvalidate({ patterns: ['items:*'] })
    async create(@Body() dto: CreateItemDto) {
        return this.itemService.create(dto);
    }

    @Patch(':id')
    @CacheInvalidate({ patterns: ['items:*'] })
    async update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
        return this.itemService.update(id, dto);
    }
}
```

---

## Docker Setup

### docker-compose.yml

```yaml
redis:
    image: redis:7-alpine
    container_name: coffee-club-redis
    restart: unless-stopped
    ports:
        - '${REDIS_PORT:-6379}:6379'
    volumes:
        - redis_data:/data
    command: redis-server --appendonly yes
    networks:
        - nestjs-network
    healthcheck:
        test: ['CMD', 'redis-cli', 'ping']
        interval: 10s
        timeout: 5s
        retries: 5
```

---

## Monitoring

### Check Redis Connection

```typescript
// In a health check endpoint or startup
const stats = await cacheService.getStats();
console.log(stats);
// { connected: true, keyCount: 42, memoryUsage: '1.2MB' }
```

### Flush All Caches (Development)

```typescript
await cacheService.flushAll();
```

---

**Related Files:**

- [REDIS-CACHING-DECISION-GUIDE.md](REDIS-CACHING-DECISION-GUIDE.md) - Decision guide for when to cache
- [backend/src/core/decorators/cacheable.decorator.ts](../../../backend/src/core/decorators/cacheable.decorator.ts) - @Cacheable decorator implementation
- [backend/src/core/decorators/cache-invalidate.decorator.ts](../../../backend/src/core/decorators/cache-invalidate.decorator.ts) - @CacheInvalidate decorator implementation
- [backend/src/core/constants/cache-ttl.constants.ts](../../../backend/src/core/constants/cache-ttl.constants.ts) - TTL constants
- [backend/src/modules/cache/cache.service.ts](../../../backend/src/modules/cache/cache.service.ts) - CacheService implementation
- [CLAUDE.md](../../../CLAUDE.md) - Project documentation

---

**Last Updated:** 2026-01-19
**Version:** 1.0