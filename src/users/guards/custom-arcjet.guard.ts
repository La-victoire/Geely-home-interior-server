import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ArcjetGuard } from '@arcjet/nest';

@Injectable()
export class CustomArcjetGuard extends ArcjetGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (req['arcjetBypass']) {
      return true;
    }
    return super.canActivate(context);
  }
}
