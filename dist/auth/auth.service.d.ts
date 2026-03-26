import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    private readonly accessTokenTtl;
    private readonly refreshTokenTtl;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<Record<string, unknown>>;
    login(loginDto: LoginDto): Promise<Record<string, unknown>>;
    refresh(refreshToken: string): Promise<Record<string, unknown>>;
    logout(userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(user: User): {
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
    };
    private buildAuthResponse;
    private createSessionResponse;
    private verifyRefreshToken;
    private getJwtSecret;
    private buildUserPayload;
}
