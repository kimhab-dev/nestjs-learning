import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangeEmailRequestDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  newEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
