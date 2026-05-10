---
name: swagger-doc-generator
description: Auto-generate @ApiOperation, @ApiResponse, and @ApiProperty decorators for NestJS controllers and DTOs.
---

# Swagger Documentation Generator

Auto-generate @ApiOperation, @ApiResponse, and @ApiProperty decorators for NestJS controllers and DTOs.

---

## Overview

This skill adds comprehensive Swagger documentation:
1. **Controller Decorators** - @ApiTags, @ApiOperation, @ApiResponse
2. **DTO Decorators** - @ApiProperty with examples
3. **Authentication Decorators** - @ApiBearerAuth
4. **Pagination Decorators** - @ApiQuery

---

## Quick Start

### Document a Controller

User prompt:
```
Add Swagger documentation to ProductController
```

Claude adds:
- @ApiTags at controller level
- @ApiOperation for each endpoint
- @ApiResponse for success and error cases
- @ApiBearerAuth for protected endpoints
- @ApiParam for route parameters

---

## Patterns

### Controller Documentation

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve paginated list of products with optional filtering'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [Product]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: string,
  ): Promise<Product[]> {
    return await this.productService.findAll(page, limit, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: Product
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return await this.productService.findById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create product',
    description: 'Create a new product with validation'
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: ['name must be a string', 'price must be a number'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return await this.productService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully'
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.softDelete(id);
  }
}
```

---

### DTO Documentation

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, MinLength, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Laptop',
    description: 'Product name',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price in USD',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 'High-performance laptop with 16GB RAM',
    description: 'Product description',
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category UUID',
    format: 'uuid',
  })
  @IsUUID()
  categoryId: string;
}
```

---

### Entity Documentation

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/core/entities/base.entity';
import { Category } from '../category/entities/category.entity';

@Entity('products')
export class Product extends BaseEntity {
  @ApiProperty({ example: 'Laptop', description: 'Product name' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({ example: 999.99, description: 'Product price in USD' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    example: 'High-performance laptop',
    description: 'Product description',
    required: false
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category UUID'
  })
  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @ApiProperty({ type: () => Category, description: 'Product category' })
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
```

---

## Skill Invocation

### Trigger Patterns

User can invoke this skill with:
- "add swagger docs to [Controller]"
- "document [Controller] with swagger"
- "generate swagger decorators for [Entity]"
- "add api documentation"

### Required Information

Claude should ask for:
1. **Target** - Controller, DTO, or Entity
2. **Authentication** - Should endpoints be protected? (@ApiBearerAuth)
3. **Pagination** - Are there paginated endpoints?

---

## Checklist

When adding Swagger documentation, ensure:

- [ ] @ApiTags at controller level (resource name)
- [ ] @ApiOperation for each endpoint (summary + description)
- [ ] @ApiResponse for success cases (200, 201)
- [ ] @ApiResponse for error cases (400, 401, 404)
- [ ] @ApiParam for route parameters
- [ ] @ApiQuery for query parameters
- [ ] @ApiBearerAuth for protected endpoints
- [ ] @ApiProperty on all DTO fields with examples
- [ ] @ApiProperty on entity fields for response documentation
- [ ] Error response schemas include example structure

---

## Swagger Configuration

Ensure `main.ts` has Swagger setup:

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('API Documentation')
  .setDescription('RESTful API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

Access Swagger UI at: `http://localhost:3000/api`

---

## Related Skills

- [crud-module-generator](../crud-module-generator/SKILL.md) - Generate complete CRUD modules
- [response-dto-factory](../response-dto-factory/SKILL.md) - Generate response wrappers

---

**Skill Status**: READY
**Automation Level**: 85%
**Complexity**: Medium
