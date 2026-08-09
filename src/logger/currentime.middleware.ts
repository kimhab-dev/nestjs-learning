import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class CurrentTimeMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    console.log('Request received at:', new Date().toISOString());
    next();
  }
}
