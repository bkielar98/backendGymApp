import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): {
        item: any;
    };
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<{
        item: import("../entities/user.entity").User;
    }>;
    deleteProfile(req: any): Promise<{
        success: boolean;
        message: string;
        item: {
            id: number;
            email: string;
        };
    }>;
}
