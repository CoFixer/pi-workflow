import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

/**
 * Product Module
 *
 * Feature module for product management.
 * Registers entity, repository, service, and controller.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [ProductController],
  providers: [ProductRepository, ProductService],
  exports: [ProductService], // Export service for use in other modules
})
export class ProductModule {}
