import { IsString, IsNumber, IsOptional, IsUUID, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Create Product DTO
 *
 * Data Transfer Object for creating a new product.
 * Includes validation rules and Swagger documentation.
 */
export class CreateProductDto {
  @ApiProperty({
    example: 'Laptop',
    description: 'Product name',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3, { message: 'Product name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Product name must not exceed 255 characters' })
  name: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price in USD',
    minimum: 0,
  })
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price: number;

  @ApiProperty({
    example: 'High-performance laptop with 16GB RAM and 512GB SSD',
    description: 'Product description',
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category UUID',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId: string;
}
