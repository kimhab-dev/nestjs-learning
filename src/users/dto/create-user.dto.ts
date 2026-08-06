import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Group name must be a string.' })
  name: string;

  @IsString({ message: 'email must be a string.' })
  email: string;

  @IsOptional()
  @IsString()
  password: string | undefined;
}
