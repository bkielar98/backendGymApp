import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { User, UserRole } from '../entities/user.entity';

type AuthenticatedRequest = Request & {
  user?: User;
};

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can access this resource');
    }

    return true;
  }
}
