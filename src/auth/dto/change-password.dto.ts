import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class ChangePasswordDto {
  /**
   * Required for regular accounts (email + password login).
   * Omit for OAuth-only accounts that are setting a password for the first time.
   */
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'New password must be at least 8 characters.' })
  newPassword: string;
}
