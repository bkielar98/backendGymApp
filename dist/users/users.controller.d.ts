import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): any;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("../entities/user.entity").User>;
    deleteProfile(req: any): Promise<void>;
}
