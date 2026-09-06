import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { FindProductsDto } from './dto/find-products.dto.js';
import { ProductResponseDto } from './dto/product-response.dto.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() query: FindProductsDto,
  ): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findAll(query);
    return ProductResponseDto.fromEntities(products);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(id);
    return ProductResponseDto.fromEntity(product);
  }

  @Post()
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsService.create(dto);
    return ProductResponseDto.fromEntity(product);
  }
}
