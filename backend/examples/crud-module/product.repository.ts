import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@/core/repositories/base.repository';
import { Product } from './product.entity';

/**
 * Product Repository
 *
 * Handles data access for products.
 * Extends BaseRepository for common CRUD operations.
 */
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }

  /**
   * Find products by category
   * @param categoryId - Category UUID
   * @returns Array of products in the category
   */
  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { categoryId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find products within price range
   * @param minPrice - Minimum price
   * @param maxPrice - Maximum price
   * @returns Array of products in price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.price >= :minPrice', { minPrice })
      .andWhere('product.price <= :maxPrice', { maxPrice })
      .orderBy('product.price', 'ASC')
      .getMany();
  }

  /**
   * Search products by name
   * @param searchTerm - Search term
   * @returns Array of matching products
   */
  async searchByName(searchTerm: string): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('product.name', 'ASC')
      .getMany();
  }
}
