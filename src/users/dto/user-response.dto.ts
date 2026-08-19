import { Expose } from 'class-transformer';

export class UsersResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;
}

export class AllUsersResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  age: number;

  @Expose()
  createdAt: Date;
}
