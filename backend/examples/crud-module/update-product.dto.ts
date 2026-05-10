import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

/**
 * Update Product DTO
 *
 * Data Transfer Object for updating an existing product.
 * All fields are optional (extends PartialType of CreateProductDto).
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
