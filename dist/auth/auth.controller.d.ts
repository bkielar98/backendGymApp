import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<Record<string, unknown>>;
    login(loginDto: LoginDto): Promise<Record<string, unknown>>;
    getMe(req: any): {
        id: number;
        email: string;
        name: string;
        gender: string;
        role: import("../entities/user.entity").UserRole;
        avatarPath: string;
        avatarUrl: string;
    };
}
