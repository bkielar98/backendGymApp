import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

type AuthenticatedRequest = Request & {
  user?: User;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = await this.verifyToken(token);
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User linked to token no longer exists');
    }

    request.user = user;
    return true;
  }

  private extractBearerToken(request: Request) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  private async verifyToken(token: string) {
    const secrets = [
      process.env.JWT_SECRET,
      'your-secret-key',
    ].filter((secret, index, values): secret is string => {
      return Boolean(secret) && values.indexOf(secret) === index;
    });

    for (const secret of secrets) {
      try {
        return await this.jwtService.verifyAsync<{ sub: number; email: string }>(
          token,
          { secret },
        );
      } catch (error) {
        continue;
      }
    }

    throw new UnauthorizedException('Invalid or expired token');
  }
}
