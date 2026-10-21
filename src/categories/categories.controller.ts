import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}
  @Get()
  @SuccessMessage('Get all categories successfully')
  find() {
    return this.categoryService.find();
  }

  @Get(':id')
  @SuccessMessage('Get a category successfully.')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @SuccessMessage('Create category syccessfully.')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }
}
