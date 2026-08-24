import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { Role } from '../../users/enums/role.enum';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
// impements CanActivate mean the class must have method CanActivate
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {} // reflector help nest can read matada we assigned

  // context: ExecutionContext - it's have data in current request
  canActivate(context: ExecutionContext): boolean {
    // If the route is marked @Public(), skip role enforcement entirely
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const user = request.user;

    if (!user) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return requiredRoles.includes(user.role);
  }
}
