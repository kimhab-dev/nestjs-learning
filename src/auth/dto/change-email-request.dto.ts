import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangeEmailRequestDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  newEmail: string;

  @IsString()
  @IsOptional()
  password?: string;
}
