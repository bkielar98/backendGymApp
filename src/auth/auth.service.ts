import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<Record<string, unknown>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const { rememberMe, ...userData } = registerDto;
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    await this.userRepository.save(user);
    return this.createSessionResponse(user, rememberMe);
  }

  async login(
    loginDto: LoginDto,
  ): Promise<Record<string, unknown>> {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createSessionResponse(user, loginDto.rememberMe);
  }

  async refresh(refreshToken: string): Promise<Record<string, unknown>> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!matches) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.createSessionResponse(user, true);
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, {
      refreshTokenHash: null,
    });

    return {
      success: true,
      message: 'Logged out',
    };
  }

  getMe(user: User) {
    return this.buildUserPayload(user);
  }

  private buildAuthResponse(
    user: User,
    accessToken: string,
    refreshToken: string,
  ) {
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      ...this.buildUserPayload(user),
    };
  }

  private async createSessionResponse(user: User, rememberMe?: boolean) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getJwtSecret(),
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        type: 'refresh',
      },
      {
        secret: this.getJwtSecret(),
        expiresIn: rememberMe ? '180d' : '30d',
      },
    );

    await this.userRepository.update(user.id, {
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
    });

    return this.buildAuthResponse(user, accessToken, refreshToken);
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.getJwtSecret(),
      });

      if (payload?.type !== 'refresh') {
        throw new UnauthorizedException('Invalid or expired token');
      }

      return payload as { sub: number; email: string; type: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private getJwtSecret() {
    return this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
  }

  private buildUserPayload(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      role: user.role,
      avatarPath: user.avatarPath ?? null,
      avatarUrl: user.avatarPath ?? null,
    };
  }
}
