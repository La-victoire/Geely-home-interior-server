import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ArcjetBypassMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers['origin'];
    const userAgent = req.headers['user-agent'] || '';
    // Allow frontend origins and Postman
    if (
      origin === 'http://localhost:3000' ||
      origin === 'https://geely-home-interiors.vercel.app' ||
      /postman/i.test(userAgent)
    ) {
      // Set a custom header to signal bypass
      req['arcjetBypass'] = true;
    }
    next();
  }
}
