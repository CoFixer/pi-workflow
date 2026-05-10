---
name: crud-module-generator
description: Generate complete NestJS CRUD modules following three-layer architecture (Controller → Service → Repository).
---

# CRUD Module Generator

Generate complete NestJS CRUD modules following three-layer architecture (Controller → Service → Repository).

---

## Overview

This skill automates the creation of:
1. **Entity** - TypeORM entity with BaseEntity pattern
2. **Repository** - Custom repository extending BaseRepository
3. **Service** - Business logic extending BaseService
4. **Controller** - HTTP endpoints extending BaseController
5. **DTOs** - Create, Update, and Response DTOs
6. **Module** - NestJS module configuration

---

## Quick Start

### Generate Complete CRUD Module

User prompt:
```
Generate a CRUD module for "Product" with fields: name (string), price (decimal), description (text), category_id (uuid)
```

Claude generates:
1. `product.entity.ts` - Entity with all fields + BaseEntity
2. `product.repository.ts` - Repository with common queries
3. `product.service.ts` - Service with CRUD + caching
4. `product.controller.ts` - Controller with 5 endpoints (GET all, GET one, POST, PATCH, DELETE)
5. `create-product.dto.ts` - CreateDto with validation
6. `update-product.dto.ts` - UpdateDto (PartialType)
7. `product-response.dto.ts` - Response DTO
8. `product.module.ts` - Module registration

---

## Patterns

### Entity Pattern

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@/core/entities/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;
}
```

**Key Points:**
- Extends BaseEntity (UUID, createdAt, updatedAt, deletedAt)
- Table name in plural form
- Use snake_case for database column names
- Nullable fields marked with `?` and `nullable: true`

### Repository Pattern

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/core/repositories/base.repository';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { categoryId },
      order: { createdAt: 'DESC' },
    });
  }
}
```

### Service Pattern

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@/core/services/base.service';
import { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(private readonly productRepository: ProductRepository) {
    super(productRepository);
  }

  async create(createDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createDto);
    return await this.productRepository.save(product);
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    Object.assign(product, updateDto);
    return await this.productRepository.save(product);
  }
}
```

### Controller Pattern

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseController } from '@/core/controllers/base.controller';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductController extends BaseController<Product> {
  constructor(private readonly productService: ProductService) {
    super(productService);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async create(@Body() createDto: CreateProductDto): Promise<Product> {
    return await this.productService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async findAll(): Promise<Product[]> {
    return await this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return await this.productService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.softDelete(id);
  }
}
```

### DTO Patterns

**CreateProductDto:**
```typescript
import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Product Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid-here' })
  @IsUUID()
  categoryId: string;
}
```

**UpdateProductDto:**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### Module Pattern

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductRepository } from './repositories/product.repository';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductRepository, ProductService],
  exports: [ProductService], // Export service for use in other modules
})
export class ProductModule {}
```

---

## Skill Invocation

### Trigger Patterns

User can invoke this skill with:
- "generate crud module for [Entity]"
- "create nestjs module for [Entity]"
- "scaffold [Entity] module"
- "generate complete crud for [Entity]"

### Required Information

Claude should ask for:
1. **Entity Name** (singular, PascalCase) - e.g., "Product"
2. **Fields** - Name, type, validation rules
3. **Relationships** (optional) - ManyToOne, OneToMany, ManyToMany
4. **Custom Methods** (optional) - Additional service/controller methods

### Example Conversation

**User**: "Generate CRUD module for Order with customer relationship"

**Claude**:
```
I'll create a complete CRUD module for Order. Please provide:

1. Fields (besides customer relationship):
   - orderNumber (string, unique)?
   - totalAmount (decimal)?
   - status (enum: PENDING, COMPLETED, CANCELLED)?
   - Any other fields?

2. Customer relationship type:
   - ManyToOne (many orders belong to one customer)?
```

**User**: "Yes, those fields. ManyToOne relationship."

**Claude**: [Generates all 8 files]

---

## Checklist

When generating a CRUD module, ensure:

- [ ] Entity extends BaseEntity
- [ ] Entity has @Entity decorator with table name (plural)
- [ ] Repository extends BaseRepository
- [ ] Service extends BaseService
- [ ] Controller extends BaseController
- [ ] CreateDto has validation decorators
- [ ] UpdateDto uses PartialType(CreateDto)
- [ ] All decorators have @ApiProperty for Swagger
- [ ] Module exports service for cross-module usage
- [ ] Relationships properly defined with @ManyToOne, @OneToMany, etc.

---

## Related Skills

- [response-dto-factory](../response-dto-factory/SKILL.md) - Generate response wrappers
- [swagger-doc-generator](../swagger-doc-generator/SKILL.md) - Add Swagger decorators

---

**Skill Status**: READY
**Automation Level**: 80%
**Complexity**: High
