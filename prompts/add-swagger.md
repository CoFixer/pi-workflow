---
description: Add Swagger documentation decorators to existing NestJS controller
argument-hint: <controller-path> (e.g., "backend/src/modules/products/product.controller.ts")
---

# Add Swagger Documentation Command

Add comprehensive Swagger/OpenAPI documentation decorators to an existing NestJS controller.

## Usage

```bash
/add-swagger backend/src/modules/products/product.controller.ts
/add-swagger products/product.controller.ts
```

## What This Command Does

Analyzes an existing controller and automatically adds:
- `@ApiTags()` at controller level
- `@ApiOperation()` for each endpoint
- `@ApiResponse()` for success and error cases
- `@ApiParam()` for path parameters
- `@ApiQuery()` for query parameters
- `@ApiBearerAuth()` if authentication is detected

## Workflow

1. **Read Controller** - Parse existing controller file
2. **Detect Endpoints** - Identify GET, POST, PATCH, PUT, DELETE methods
3. **Analyze Parameters** - Find @Param, @Query, @Body decorators
4. **Add Decorators** - Insert Swagger decorators above each method
5. **Save File** - Write updated controller back to disk

## Before/After Example

**BEFORE:**
```typescript
@Controller('products')
export class ProductController {
  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return await this.service.create(dto);
  }
}
```

**AFTER:**
```typescript
@ApiTags('Products')
@Controller('products')
export class ProductController {
  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully', type: [Product] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return await this.service.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: Product })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  async create(@Body() dto: CreateProductDto) {
    return await this.service.create(dto);
  }
}
```

## Expected Output

```
✅ Added Swagger documentation to ProductController

Updates made:
- @ApiTags('Products') added to controller
- @ApiOperation added to 5 endpoints:
  - GET / (findAll)
  - GET /:id (findOne)
  - POST / (create)
  - PATCH /:id (update)
  - DELETE /:id (remove)
- @ApiResponse added to all endpoints (success + error cases)
- @ApiParam added to 3 parameterized endpoints
- Import statements updated

Next steps:
1. Start server: npm run start:dev
2. View Swagger UI: http://localhost:3000/api
3. Test endpoints in Swagger UI
```

## Error Handling

**STOP if:**
- Controller file not found
- File is not a valid TypeScript controller
- No endpoints detected

**Warnings:**
- If Swagger decorators already exist, offer to replace or skip
- If imports are missing, add them automatically

## Related

- **Skill**: [swagger-doc-generator](../../skills/swagger-doc-generator/SKILL.md)
- **Command**: [/generate-crud](generate-crud.md) - Includes Swagger by default

---

**Command Type**: Non-interactive
**Estimated Time**: 30 seconds
**Requires**: @nestjs/swagger
