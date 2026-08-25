import { Expose } from 'class-transformer';

export class UsersResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;
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
  avatar: string;

  @Expose()
  createdAt: Date;
}
