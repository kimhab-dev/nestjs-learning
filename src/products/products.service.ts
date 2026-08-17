import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_STATUS')
    private readonly status: string,
  ) {}
  findAll() {
    return 'Get all product';
  }
  findStatus() {
    return this.status;
  }
}
