import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category-entities';
import { Repository } from 'typeorm';
import { CategoryResponseDto } from './dto/category-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}
  async find(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepo.find();
    return plainToInstance(CategoryResponseDto, categories, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(categoryId: number): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findOne({
      where: {
        id: categoryId,
      },
    });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const [category] = await this.categoryRepo.findBy({ name: dto.name });
    if (category) {
      throw new ConflictException('This category name aready in used');
    }
    return plainToInstance(
      CategoryResponseDto,
      await this.categoryRepo.save(dto),
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
