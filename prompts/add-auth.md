---
description: Add JWT authentication and role-based authorization to module endpoints
argument-hint: Optional module path
---

# Add Authentication Command

Add JWT authentication and role-based authorization decorators to NestJS controller endpoints.

## Usage

```bash
/add-auth
/add-auth backend/src/modules/products
/add-auth products/product.controller.ts
```

## What This Command Does

Configures authentication and authorization for controller endpoints:
- Adds `@ApiBearerAuth()` to controller
- Adds `@Public()` decorator to public endpoints
- Adds `@Roles()` decorator to role-protected endpoints
- Creates decorator files if they don't exist

## Interactive Prompts

1. **Controller Selection** (if multiple controllers in module)
   - List all controllers found
   - Ask user to select

2. **Public Endpoints** (checkboxes)
   - List all endpoints
   - User selects which should be public (no auth required)
   - Example: GET endpoints are often public, DELETE usually protected

3. **Role Requirements** (for each protected endpoint)
   - ADMIN - Full access
   - MANAGER - Management access
   - STAFF - Basic staff access
   - Multiple roles can be selected per endpoint

4. **Generate Decorators** (y/n)
   - If @Public or @Roles decorators don't exist, offer to create them
   - Create in `backend/src/common/decorators/`

## Workflow

1. **Find Controller** - Locate controller file
2. **Parse Endpoints** - Extract all HTTP methods
3. **Prompt for Public Endpoints** - User selects public endpoints
4. **Prompt for Roles** - User assigns roles to protected endpoints
5. **Add Decorators** - Insert @Public, @Roles, @ApiBearerAuth
6. **Create Decorators** - If needed, create decorator files
7. **Update Imports** - Add import statements
8. **Save File** - Write updated controller

## Before/After Example

**BEFORE:**
```typescript
@Controller('products')
export class ProductController {
  @Get()
  async findAll() { ... }

  @Get(':id')
  async findOne(@Param('id') id: string) { ... }

  @Post()
  async create(@Body() dto: CreateProductDto) { ... }

  @Delete(':id')
  async remove(@Param('id') id: string) { ... }
}
```

**AFTER:**
```typescript
@Controller('products')
@ApiBearerAuth()
export class ProductController {
  @Get()
  @Public()  // No authentication required
  async findAll() { ... }

  @Get(':id')
  @Public()  // No authentication required
  async findOne(@Param('id') id: string) { ... }

  @Post()
  @Roles('ADMIN', 'MANAGER')  // Requires ADMIN or MANAGER role
  async create(@Body() dto: CreateProductDto) { ... }

  @Delete(':id')
  @Roles('ADMIN')  // Only ADMIN can delete
  async remove(@Param('id') id: string) { ... }
}
```

## Generated Decorator Files

If decorators don't exist, create:

**backend/src/common/decorators/public.decorator.ts:**
```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**backend/src/common/decorators/roles.decorator.ts:**
```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

## Expected Output

```
✅ Added authentication to ProductController

Updates made:
- @ApiBearerAuth() added to controller
- @Public() added to 2 endpoints:
  - GET / (findAll)
  - GET /:id (findOne)
- @Roles() added to 2 endpoints:
  - POST / (create) → ADMIN, MANAGER
  - DELETE /:id (remove) → ADMIN

Decorators created:
- backend/src/common/decorators/public.decorator.ts
- backend/src/common/decorators/roles.decorator.ts

Next steps:
1. Ensure JwtAuthGuard is registered globally in app.module.ts:

   import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

   @Module({
     providers: [
       {
         provide: APP_GUARD,
         useClass: JwtAuthGuard,
       },
     ],
   })

2. Ensure RolesGuard is registered:

   import { RolesGuard } from './common/guards/roles.guard';

   @Module({
     providers: [
       {
         provide: APP_GUARD,
         useClass: RolesGuard,
       },
     ],
   })

3. Test protected endpoints with Bearer token:
   Authorization: Bearer <your-jwt-token>

4. Test role-based access:
   - Try accessing POST /products with STAFF role → Should fail (403)
   - Try accessing POST /products with ADMIN role → Should succeed
```

## Error Handling

**STOP if:**
- Controller not found
- No endpoints detected

**Warnings:**
- If auth decorators already exist, offer to replace
- If JwtAuthGuard not configured, warn user

## Common Patterns

**Public Endpoints:**
- GET all (listing)
- GET by ID (single resource)
- Login/register endpoints

**ADMIN Only:**
- DELETE operations
- User management
- System configuration

**ADMIN + MANAGER:**
- POST (create)
- PATCH/PUT (update)
- Reports and analytics

**All Authenticated:**
- User profile operations
- Personal data access

## Related

- **Skill**: [guard-decorator-builder](../../skills/guard-decorator-builder/SKILL.md)
- **Guide**: [JWT Authentication](../../guides/AUTHENTICATION-GUIDE.md)

---

**Command Type**: Interactive
**Estimated Time**: 2 minutes
**Requires**: @nestjs/jwt, @nestjs/passport
