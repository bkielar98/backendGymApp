export declare class AdminListUsersQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt' | 'role';
    sortOrder?: 'ASC' | 'DESC';
}
