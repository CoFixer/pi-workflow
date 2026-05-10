---
name: response-dto-factory
description: Generate standardized response wrappers for NestJS API endpoints.
---

# Response DTO Factory

Generate standardized response wrappers for NestJS API endpoints.

---

## Overview

This skill generates consistent response DTOs:
1. **CreatedResponseDto** - For POST endpoints (201 status)
2. **SuccessResponseDto** - For GET endpoints (200 status)
3. **UpdatedResponseDto** - For PATCH/PUT endpoints (200 status)
4. **DeletedResponseDto** - For DELETE endpoints (200 status)
5. **PaginatedResponseDto** - For paginated list endpoints

---

## Quick Start

### Generate Response Wrapper

User prompt:
```
Generate response DTO for Product entity
```

Claude generates:
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/product.entity';

export class ProductResponseDto {
  @ApiProperty()
  data: Product;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Product retrieved successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  constructor(data: Product, message: string = 'Success') {
    this.data = data;
    this.status = 'success';
    this.message = message;
    this.statusCode = 200;
  }
}
```

---

## Patterns

### CreatedResponseDto (201)

```typescript
export class CreatedResponseDto<T> {
  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Resource created successfully' })
  message: string;

  @ApiProperty({ example: 201 })
  statusCode: number;

  constructor(data: T, message: string = 'Created successfully') {
    this.data = data;
    this.status = 'success';
    this.message = message;
    this.statusCode = 201;
  }
}
```

### SuccessResponseDto (200)

```typescript
export class SuccessResponseDto<T> {
  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  constructor(data: T, message: string = 'Success') {
    this.data = data;
    this.status = 'success';
    this.message = message;
    this.statusCode = 200;
  }
}
```

### UpdatedResponseDto (200)

```typescript
export class UpdatedResponseDto<T> {
  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Resource updated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  constructor(data: T, message: string = 'Updated successfully') {
    this.data = data;
    this.status = 'success';
    this.message = message;
    this.statusCode = 200;
  }
}
```

### DeletedResponseDto (200)

```typescript
export class DeletedResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Resource deleted successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  constructor(message: string = 'Deleted successfully') {
    this.status = 'success';
    this.message = message;
    this.statusCode = 200;
  }
}
```

### PaginatedResponseDto

```typescript
export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: 'success' })
  status: string;

  constructor(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.status = 'success';
  }
}
```

---

## Usage in Controllers

```typescript
@Controller('products')
export class ProductController {
  @Post()
  @ApiResponse({ status: 201, type: CreatedResponseDto })
  async create(@Body() dto: CreateProductDto): Promise<CreatedResponseDto<Product>> {
    const product = await this.productService.create(dto);
    return new CreatedResponseDto(product, 'Product created successfully');
  }

  @Get()
  @ApiResponse({ status: 200, type: PaginatedResponseDto })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResponseDto<Product>> {
    const [data, total] = await this.productService.findAll(page, limit);
    return new PaginatedResponseDto(data, total, page, limit);
  }

  @Get(':id')
  @ApiResponse({ status: 200, type: SuccessResponseDto })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<Product>> {
    const product = await this.productService.findById(id);
    return new SuccessResponseDto(product, 'Product retrieved successfully');
  }

  @Patch(':id')
  @ApiResponse({ status: 200, type: UpdatedResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<UpdatedResponseDto<Product>> {
    const product = await this.productService.update(id, dto);
    return new UpdatedResponseDto(product, 'Product updated successfully');
  }

  @Delete(':id')
  @ApiResponse({ status: 200, type: DeletedResponseDto })
  async remove(@Param('id') id: string): Promise<DeletedResponseDto> {
    await this.productService.softDelete(id);
    return new DeletedResponseDto('Product deleted successfully');
  }
}
```

---

## Skill Invocation

### Trigger Patterns

User can invoke this skill with:
- "generate response dto for [Entity]"
- "create response wrapper for [Entity]"
- "add success response dto"
- "generate paginated response"

### Required Information

Claude should ask for:
1. **Entity Name** (singular, PascalCase) - e.g., "Product"
2. **Response Types** - Created, Success, Updated, Deleted, Paginated?

---

## Checklist

When generating response DTOs, ensure:

- [ ] All response DTOs have @ApiProperty decorators
- [ ] Generic type parameter `<T>` used for flexibility
- [ ] Constructor accepts data and optional message
- [ ] Status field always 'success'
- [ ] StatusCode matches HTTP status (201, 200, etc.)
- [ ] PaginatedResponseDto calculates totalPages correctly
- [ ] Controllers use appropriate response type per endpoint

---

## Related Skills

- [crud-module-generator](../crud-module-generator/SKILL.md) - Generate complete CRUD modules
- [swagger-doc-generator](../swagger-doc-generator/SKILL.md) - Add Swagger decorators

---

**Skill Status**: READY
**Automation Level**: 90%
**Complexity**: Medium
