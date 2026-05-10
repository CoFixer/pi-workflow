---
name: guard-decorator-builder
description: Generate authorization patterns including @Public(), @Roles(), and @CurrentUser() decorators with JWT guards.
---

# Guard & Decorator Builder

Generate authorization patterns including @Public(), @Roles(), and @CurrentUser() decorators with JWT guards.

---

## Overview

This skill generates:
1. **@Public() Decorator** - Bypass JWT authentication
2. **@Roles() Decorator** - Role-based access control (RBAC)
3. **@CurrentUser() Decorator** - Extract authenticated user
4. **JwtAuthGuard** - Global JWT authentication
5. **RolesGuard** - Role validation guard

---

## Quick Start

### Generate Authorization System

User prompt:
```
Add role-based authorization with manager and staff roles
```

Claude generates:
1. `public.decorator.ts` - @Public() decorator
2. `roles.decorator.ts` - @Roles() decorator
3. `current-user.decorator.ts` - @CurrentUser() decorator
4. `jwt-auth.guard.ts` - JWT guard
5. `roles.guard.ts` - Role guard

---

## Patterns

### @Public() Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Usage:**
```typescript
@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }
}
```

---

### @Roles() Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

**Usage:**
```typescript
@Controller('products')
export class ProductController {
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return await this.productService.create(dto);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.STAFF)
  @Get()
  async findAll() {
    return await this.productService.findAll();
  }
}
```

---

### @CurrentUser() Decorator

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

**Usage:**
```typescript
@Controller('profile')
export class ProfileController {
  @Get()
  async getProfile(@CurrentUser() user: User) {
    return await this.profileService.getProfile(user.id);
  }

  @Patch()
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    return await this.profileService.update(user.id, dto);
  }
}
```

---

### JWT Auth Guard

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

---

### Roles Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

---

### Global Guard Configuration

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

---

## Complete Example

### Protected Controller with Roles

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles, Role } from '@/decorators/roles.decorator';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { Public } from '@/decorators/public.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  // Public endpoint - no authentication required
  @Public()
  @Get()
  async findAll() {
    return await this.productService.findAll();
  }

  // Protected - any authenticated user
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productService.findById(id);
  }

  // Managers and admins only
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateProductDto,
  ) {
    return await this.productService.create(dto, user.id);
  }

  // Admins only
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productService.softDelete(id);
  }
}
```

---

## Skill Invocation

### Trigger Patterns

User can invoke this skill with:
- "add role-based authorization"
- "create @Public decorator"
- "generate roles guard"
- "add @CurrentUser decorator"

### Required Information

Claude should ask for:
1. **Roles** - What roles exist? (admin, manager, staff, etc.)
2. **Default Behavior** - All endpoints protected by default?
3. **Public Endpoints** - Which endpoints should be public?

---

## Checklist

When implementing authorization, ensure:

- [ ] @Public() decorator defined
- [ ] @Roles() decorator with Role enum
- [ ] @CurrentUser() decorator extracts user from request
- [ ] JwtAuthGuard respects @Public() decorator
- [ ] RolesGuard validates required roles
- [ ] Both guards registered globally in AppModule
- [ ] JWT strategy configured (Passport)
- [ ] User entity has role field
- [ ] Controllers use appropriate decorators

---

## Related Skills

- [crud-module-generator](../crud-module-generator/SKILL.md) - Generate complete CRUD modules

---

**Skill Status**: READY
**Automation Level**: 75%
**Complexity**: Medium
