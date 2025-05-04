import { Product, ProductRaw } from '../types';

export class ProductConverter {
  static toArray(obj: Record<string, ProductRaw>): Product[] {
    return Object.entries(obj).map(([id, product]) => ({
      ...product,
      id,
    }));
  }
}