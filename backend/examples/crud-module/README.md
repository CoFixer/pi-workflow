# CRUD Module Example - Product

This directory contains a complete, working example of a NestJS CRUD module following the three-layer architecture pattern.

## Files

1. **product.entity.ts** - TypeORM entity extending BaseEntity
2. **product.repository.ts** - Custom repository with type-safe queries
3. **product.service.ts** - Business logic with CRUD operations
4. **product.controller.ts** - HTTP endpoints with Swagger documentation
5. **create-product.dto.ts** - DTO for creating products with validation
6. **update-product.dto.ts** - DTO for updating products (PartialType)
7. **product-response.dto.ts** - Standardized response wrapper
8. **product.module.ts** - NestJS module configuration

## Architecture

```
ProductController (HTTP Layer)
    ↓
ProductService (Business Logic)
    ↓
ProductRepository (Data Access)
    ↓
TypeORM → PostgreSQL
```

## Usage

Copy these files to your NestJS project and adapt as needed:

1. Copy to `src/modules/products/`
2. Update import paths (@/core/... to your actual core module path)
3. Register ProductModule in AppModule
4. Run migrations if using TypeORM migrations
5. Test endpoints via Swagger UI at `/api`

## Patterns Demonstrated

- **BaseEntity Pattern** - UUID, timestamps, soft delete
- **Repository Pattern** - Type-safe queries with TypeORM
- **Service Pattern** - Business logic separation
- **Controller Pattern** - RESTful endpoints
- **DTO Pattern** - Validation and transformation
- **Response Wrapper** - Consistent API responses
- **Swagger Documentation** - Complete OpenAPI specs

## Key Features

- UUID primary keys
- Soft delete (deletedAt)
- Timestamp tracking (createdAt, updatedAt)
- Input validation with class-validator
- Swagger documentation on all endpoints
- Type-safe throughout

## See Also

- [crud-module-generator SKILL](../../skills/crud-module-generator/SKILL.md) - Auto-generate modules like this
- [NestJS Guides](../../guides/README.md) - Comprehensive NestJS documentation
