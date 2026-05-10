import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '@/core/services/base.service';
import { Product } from './product.entity';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';

/**
 * Product Service
 *
 * Business logic for products.
 * Extends BaseService for common CRUD operations.
 */
@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(private readonly productRepository: ProductRepository) {
    super(productRepository);
  }

  /**
   * Create a new product
   * @param createDto - Product creation data
   * @returns Created product
   */
  async create(createDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createDto);
    return await this.productRepository.save(product);
  }

  /**
   * Update a product
   * @param id - Product UUID
   * @param updateDto - Product update data
   * @returns Updated product
   */
  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    Object.assign(product, updateDto);
    return await this.productRepository.save(product);
  }

  /**
   * Find products by category
   * @param categoryId - Category UUID
   * @returns Array of products
   */
  async findByCategory(categoryId: string): Promise<Product[]> {
    return await this.productRepository.findByCategory(categoryId);
  }

  /**
   * Find products by price range
   * @param minPrice - Minimum price
   * @param maxPrice - Maximum price
   * @returns Array of products
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return await this.productRepository.findByPriceRange(minPrice, maxPrice);
  }

  /**
   * Search products by name
   * @param searchTerm - Search term
   * @returns Array of matching products
   */
  async searchByName(searchTerm: string): Promise<Product[]> {
    return await this.productRepository.searchByName(searchTerm);
  }
}
