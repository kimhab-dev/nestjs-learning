import {
  IsString,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty()
  name: string;

  @IsString({ message: 'email must be a string.' })
  email: string;

  @IsOptional()
  @IsInt({ message: 'Age must be a number.' })
  @Min(18, { message: 'Age must be start from 18' })
  @Max(120)
  age: number;

  @IsString()
  @MinLength(6)
  @MaxLength(255)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain at least one uppercase letter, one number, and one special character.',
  })
  password: string | undefined;
}
