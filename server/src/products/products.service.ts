import { Injectable, NotFoundException } from '@nestjs/common';
import { FindProductsDto } from './dto/find-products.dto.js';
import { Product } from './entities/product.entity.js';
import { MOCK_PRODUCTS } from './mocks/products.js';

@Injectable()
export class ProductsService {
  private readonly products: Product[] = MOCK_PRODUCTS;

  /**
   * Filtering, search and sort are server-side concerns — the client only
   * forwards its query string.
   */
  findAll(query: FindProductsDto = {}): Product[] {
    // Already validated by the global ValidationPipe; only defaults are applied.
    const { category = null, sort = 'featured' } = query;
    const term = (query.search ?? '').trim().toLowerCase();

    let items = this.products;

    if (category) {
      items = items.filter((product) => product.category === category);
    }

    if (term) {
      items = items.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.brand.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term),
      );
    }

    switch (sort) {
      case 'price-asc':
        return [...items].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...items].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...items].sort((a, b) => b.ratingAverage - a.ratingAverage);
      default:
        // Never hand back the private array itself.
        return items === this.products ? [...items] : items;
    }
  }

  findOne(id: string): Product {
    const product = this.products.find((item) => item.id === id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
