import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user && user.isAdmin) {
      return true;
    }
    throw new ForbiddenException('Dostop dovoljen samo administratorjem');
  }
}
