import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

// -----> class middleware - it's support with DI and using with enterprise system
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    next();
  }
}

// -----> function-middleware : look like normal and hard to scal
// export function LoggerMiddleware(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   console.log('Request...');
//   next();
// }
