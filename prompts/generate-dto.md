---
description: Generate DTOs (Create, Update, Response) for an entity
argument-hint: <entity-name> (e.g., "Product")
---

# Generate DTO Command

Generate Data Transfer Objects (Create, Update, Response) for an existing entity with validation and Swagger decorators.

## Usage

```bash
/generate-dto Product
/generate-dto user
```

## What This Command Does

Analyzes an entity file and generates three DTOs:
1. **CreateDto** - For POST requests with validation
2. **UpdateDto** - For PATCH/PUT requests (extends PartialType)
3. **ResponseDto** - For standardized API responses

## Interactive Prompts

1. **Entity Path** (if not found automatically)
   - Search for entity file in `backend/src/modules/`
   - If multiple found, ask user to select

2. **Fields to Include** (optional)
   - Auto-detect from entity
   - Allow user to exclude certain fields (e.g., internal fields)

3. **Validation Rules** (for CreateDto)
   - Min/max lengths for strings
   - Min/max values for numbers
   - Custom validators

## Workflow

1. **Find Entity** - Locate entity file by name
2. **Parse Fields** - Extract fields from entity class
3. **Generate CreateDto** - With validation + Swagger decorators
4. **Generate UpdateDto** - Extends PartialType(CreateDto)
5. **Generate ResponseDto** - Wrapper with status/message
6. **Save Files** - Write to dto/ directory

## Generated Files

**create-{entity}.dto.ts:**
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

  @ApiProperty({ example: 'Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
```

**update-{entity}.dto.ts:**
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

**{entity}-response.dto.ts:**
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

  constructor(data: Product, message: string = 'Success') {
    this.data = data;
    this.status = 'success';
    this.message = message;
  }
}
```

## Expected Output

```
✅ Generated DTOs for Product

Files created:
- backend/src/modules/products/dto/create-product.dto.ts
- backend/src/modules/products/dto/update-product.dto.ts
- backend/src/modules/products/dto/product-response.dto.ts

Fields included:
- name: string (required, validation: @IsString)
- price: number (required, validation: @IsNumber, @Min(0))
- description: string (optional, validation: @IsString, @MaxLength(1000))

Features:
- ✅ class-validator decorators
- ✅ Swagger @ApiProperty decorators
- ✅ Response wrapper with status/message
- ✅ UpdateDto uses PartialType pattern

Next steps:
1. Update controller to use DTOs:
   @Post()
   async create(@Body() dto: CreateProductDto) { ... }

2. Update service to return ResponseDto:
   return new ProductResponseDto(product, 'Product created');
```

## Error Handling

**STOP if:**
- Entity not found
- dto/ directory creation fails

## Related

- **Skill**: [response-dto-factory](../../skills/response-dto-factory/SKILL.md)
- **Command**: [/generate-crud](generate-crud.md) - Includes DTOs

---

**Command Type**: Interactive
**Estimated Time**: 1 minute
**Requires**: class-validator, @nestjs/swagger
