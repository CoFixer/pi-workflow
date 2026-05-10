import { ApiProperty } from '@nestjs/swagger';
import { Product } from './product.entity';

/**
 * Product Response DTO
 *
 * Standardized response wrapper for product data.
 * Provides consistent API response structure.
 */
export class ProductResponseDto {
  @ApiProperty({
    type: () => Product,
    description: 'Product data',
  })
  data: Product;

  @ApiProperty({
    example: 'success',
    description: 'Response status',
  })
  status: string;

  @ApiProperty({
    example: 'Product retrieved successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code',
  })
  statusCode: number;

  constructor(data: Product, message: string = 'Success') {
    this.data = data;
    this.status = 'success';
    this.message = message;
    this.statusCode = 200;
  }
}
