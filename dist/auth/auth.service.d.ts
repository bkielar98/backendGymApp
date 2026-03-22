import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<Record<string, unknown>>;
    login(loginDto: LoginDto): Promise<Record<string, unknown>>;
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
    private buildUserPayload;
}
