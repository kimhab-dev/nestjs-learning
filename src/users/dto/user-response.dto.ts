import { Expose } from "class-transformer";

export class UsersResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;
}