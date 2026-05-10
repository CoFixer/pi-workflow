---
description: Generate a complete CRUD module interactively following three-layer architecture
argument-hint: Optional entity name (e.g., "Product")
---

# Generate CRUD Module Command

Interactively generate a complete NestJS CRUD module with entity, repository, service, controller, DTOs, and module configuration.

## Usage

```bash
/generate-crud
/generate-crud Product
/generate-crud user
```

## What This Command Does

This command guides you through creating a full-featured NestJS module following the three-layer architecture pattern (Controller → Service → Repository). It generates 8 files with proper TypeORM entities, validation, Swagger documentation, and module configuration.

## Interactive Prompts

If entity name is not provided as an argument, you'll be asked:

1. **Entity Name** (required)
   - Example: Product, User, Order
   - Must be PascalCase
   - Will be converted automatically:
     - File names: kebab-case (`product.entity.ts`)
     - Table names: plural snake_case (`products`)
     - Class names: PascalCase (`Product`)

2. **Fields** (required)
   - Format: `name:type` separated by commas
   - Examples:
     - `name:string, price:number, description:string`
     - `email:string, age:number, isActive:boolean`
   - Supported types: string, number, boolean, date, uuid, text, decimal

3. **Field Validation** (optional)
   - For each field, specify constraints:
     - String fields: minLength, maxLength, pattern
     - Number fields: min, max
     - All fields: required (default: yes), nullable

4. **Relationships** (optional)
   - Format: `relationshipType TargetEntity`
   - Examples:
     - `belongsTo Category`  → ManyToOne
     - `hasMany Orders`      → OneToMany
     - `manyToMany Tags`     → ManyToMany

5. **Additional Features** (optional)
   - Caching? (y/n) - Add Redis caching to service
   - Custom methods? - Additional service/controller methods

## Step-by-Step Workflow

### Step 1: Validation

- Validate entity name is PascalCase
- Convert entity name to appropriate formats:
  - Entity class: `Product`
  - File base: `product`
  - Table name: `products`
  - Module name: `products`

### Step 2: Field Parsing

Parse fields and create field configurations:

```typescript
// Example parsed fields:
[
  { name: 'name', type: 'string', required: true, minLength: 3, maxLength: 255 },
  { name: 'price', type: 'number', required: true, min: 0 },
  { name: 'description', type: 'string', required: false, maxLength: 1000 },
  { name: 'categoryId', type: 'uuid', required: true }
]
```

### Step 3: Generate Files

Create all 8 files in the module directory:

**Directory structure:**
```
backend/src/modules/{module-name}/
├── entities/
│   └── {entity}.entity.ts
├── repositories/
│   └── {entity}.repository.ts
├── providers/
│   └── {entity}.service.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── {entity}-response.dto.ts
├── {entity}.controller.ts
└── {entity}.module.ts
```

**Files generated:**
1. Entity with TypeORM decorators
2. Repository extending BaseRepository
3. Service with CRUD methods
4. Controller with 5 endpoints
5. CreateDto with validation
6. UpdateDto (PartialType)
7. ResponseDto wrapper
8. Module configuration

### Step 4: TypeScript Compilation Check

Run TypeScript compiler to verify:
```bash
cd backend && npx tsc --noEmit
```

If errors found:
- Report errors to user
- Offer to fix automatically
- Re-run compilation

### Step 5: Provide Next Steps

Show success message with:
- List of created files
- Instructions to add module to `modules.config.ts`
- Commands to start server
- API endpoints to test
- Link to Swagger UI

## Expected Output

```
✅ Generated CRUD module for Product

Files created:
- backend/src/modules/products/entities/product.entity.ts
- backend/src/modules/products/repositories/product.repository.ts
- backend/src/modules/products/providers/product.service.ts
- backend/src/modules/products/product.controller.ts
- backend/src/modules/products/dto/create-product.dto.ts
- backend/src/modules/products/dto/update-product.dto.ts
- backend/src/modules/products/dto/product-response.dto.ts
- backend/src/modules/products/product.module.ts

Fields generated:
- name: string (required, 3-255 chars)
- price: number (required, min: 0)
- description: string (optional, max: 1000 chars)
- categoryId: uuid (required, foreign key)

Features included:
- ✅ TypeORM entity with soft delete
- ✅ Repository with TypeORM queries
- ✅ Service with validation
- ✅ Controller with Swagger docs
- ✅ DTOs with class-validator
- ✅ UUID primary keys
- ✅ Timestamps (createdAt, updatedAt)

Next steps:
1. Add ProductModule to backend/src/config/modules.config.ts:

   import { ProductModule } from './modules/products/product.module';

   export const featureModules = [
     // ... existing modules
     ProductModule,
   ];

2. Start the server:
   npm run start:dev

3. Test endpoints:
   - GET    http://localhost:3000/api/products
   - POST   http://localhost:3000/api/products
   - GET    http://localhost:3000/api/products/:id
   - PATCH  http://localhost:3000/api/products/:id
   - DELETE http://localhost:3000/api/products/:id

4. View Swagger docs:
   http://localhost:3000/api

5. Write tests:
   - Unit: backend/src/modules/products/providers/product.service.spec.ts
   - E2E: backend/test/products/product.e2e-spec.ts
```

## Error Handling

### STOP if:
- Entity name is not provided and user cancels prompt
- Entity name is not PascalCase after conversion attempt
- Module directory already exists (offer to overwrite)
- TypeScript compilation fails after generation

### Warnings:
- If no fields provided, warn that basic entity will be created
- If module directory exists, confirm overwrite
- If BaseEntity/BaseRepository/BaseService not found, warn but proceed

## Examples

### Example 1: Simple Product Module
```bash
/generate-crud Product
```
**Prompts:**
```
Fields (format: name:type, separated by comma):
> name:string, price:number, description:string

Validation for 'name' field:
- Min length (default: 3): [Enter]
- Max length (default: 255): [Enter]
- Required? (y/n, default: y): [Enter]

Validation for 'price' field:
- Min value (default: 0): [Enter]
- Max value (optional): [skip]
- Required? (y/n, default: y): [Enter]

Validation for 'description' field:
- Max length (default: 1000): [Enter]
- Required? (y/n, default: y): n

Add relationships? (y/n): n

Add caching? (y/n): n

Custom methods? (y/n): n
```

### Example 2: Order Module with Relationships
```bash
/generate-crud Order
```
**Prompts:**
```
Fields:
> orderNumber:string, totalAmount:decimal, status:string

Relationships:
> belongsTo Customer, hasMany OrderItems

Add caching? (y/n): y
```

## Related Commands

- **[/add-swagger](../add-swagger.md)** - Add Swagger documentation to existing controller
- **[/generate-dto](../generate-dto.md)** - Generate additional DTOs
- **[/add-auth](../add-auth.md)** - Add authentication to endpoints

## Related Skills

- **crud-module-generator** - Automated skill version of this command
- **response-dto-factory** - Generate response wrappers
- **swagger-doc-generator** - Add Swagger decorators

---

**Command Type**: Interactive
**Estimated Time**: 2-3 minutes
**Files Generated**: 8 per module
**Requires**: TypeORM, class-validator, @nestjs/swagger
