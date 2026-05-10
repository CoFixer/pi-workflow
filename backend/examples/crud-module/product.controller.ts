import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BaseController } from '@/core/controllers/base.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';
import { Product } from './product.entity';
import { ProductResponseDto } from './product-response.dto';
import { Public } from '@/decorators/public.decorator';
import { Roles, Role } from '@/decorators/roles.decorator';

/**
 * Product Controller
 *
 * HTTP endpoints for product management.
 * Extends BaseController for common REST operations.
 */
@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductController extends BaseController<Product> {
  constructor(private readonly productService: ProductService) {
    super(productService);
  }

  /**
   * Get all products
   * Public endpoint - no authentication required
   */
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve paginated list of products',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [Product],
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Product[]> {
    return await this.productService.findAll();
  }

  /**
   * Get product by ID
   * Protected - requires authentication
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productService.findById(id);
    return new ProductResponseDto(product, 'Product retrieved successfully');
  }

  /**
   * Create product
   * Requires ADMIN or MANAGER role
   */
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post()
  @ApiOperation({
    summary: 'Create product',
    description: 'Create a new product with validation',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() createDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productService.create(createDto);
    return new ProductResponseDto(product, 'Product created successfully');
  }

  /**
   * Update product
   * Requires ADMIN or MANAGER role
   */
  @Roles(Role.ADMIN, Role.MANAGER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productService.update(id, updateDto);
    return new ProductResponseDto(product, 'Product updated successfully');
  }

  /**
   * Delete product (soft delete)
   * Requires ADMIN role only
   */
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product UUID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.softDelete(id);
  }

  /**
   * Search products by name
   * Public endpoint
   */
  @Public()
  @Get('search/:term')
  @ApiOperation({ summary: 'Search products by name' })
  @ApiParam({ name: 'term', type: 'string', description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [Product],
  })
  async search(@Param('term') term: string): Promise<Product[]> {
    return await this.productService.searchByName(term);
  }
}
