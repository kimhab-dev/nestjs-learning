import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  findAll() {
    return 'Get all product';
  }
}
