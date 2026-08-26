import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmChangeEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
