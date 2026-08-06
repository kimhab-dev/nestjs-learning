import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  findAll() {
    return 'All users';
  }

  findOne(id) {
    return 'User id : ' + id;
  }
}
