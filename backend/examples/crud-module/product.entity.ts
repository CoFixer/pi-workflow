import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/core/entities/base.entity';
import { Category } from '../category/entities/category.entity';

/**
 * Product Entity
 *
 * Represents a product in the system.
 * Extends BaseEntity for UUID, timestamps, and soft delete.
 */
@Entity('products')
export class Product extends BaseEntity {
  @ApiProperty({
    example: 'Laptop',
    description: 'Product name',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    example: 999.99,
    description: 'Product price in USD',
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    example: 'High-performance laptop with 16GB RAM and 512GB SSD',
    description: 'Product description',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Category UUID',
  })
  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @ApiProperty({
    type: () => Category,
    description: 'Product category',
  })
  @ManyToOne(() => Category, { eager: false })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
