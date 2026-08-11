import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType make properties as optional
export class UpdateUserDto extends PartialType(CreateUserDto) {}
