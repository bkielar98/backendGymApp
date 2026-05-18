import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AdminListUsersQueryDto } from './dto/admin-list-users-query.dto';
import { AdminUpdateUserRoleDto } from './dto/admin-update-user-role.dto';
import { AdminUpdateUserStatusDto } from './dto/admin-update-user-status.dto';
import { AdminListUserWorkoutsQueryDto } from './dto/admin-list-user-workouts-query.dto';
import { AdminResetUserPasswordDto } from './dto/admin-reset-user-password.dto';
import { AdminExerciseStatsQueryDto } from './dto/admin-exercise-stats-query.dto';
import { User } from '../entities/user.entity';

type AuthenticatedRequest = Request & {
  user: User;
};

const avatarStorage = diskStorage({
  destination: './uploads/avatars',
  filename: (_, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000_000)}`;
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List users for admin panel' })
  async listUsers(@Query() query: AdminListUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details for admin panel' })
  @ApiParam({ name: 'id', type: Number })
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/avatar')
  @ApiOperation({ summary: 'Update user avatar as admin' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @UseInterceptors(FileInterceptor('avatar', { storage: avatarStorage }))
  async updateUserAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: { filename: string },
  ) {
    return this.adminService.updateUserAvatar(id, file);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role as admin' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AdminUpdateUserRoleDto })
  async updateUserRole(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(req.user.id, id, dto);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status as admin' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AdminUpdateUserStatusDto })
  async updateUserStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(req.user.id, id, dto);
  }

  @Patch('users/:id/password')
  @ApiOperation({ summary: 'Reset user password as admin' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AdminResetUserPasswordDto })
  async resetUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminResetUserPasswordDto,
  ) {
    return this.adminService.resetUserPassword(id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Soft delete user as admin' })
  @ApiParam({ name: 'id', type: Number })
  async deleteUser(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.adminService.softDeleteUser(req.user.id, id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('workouts/active')
  @ApiOperation({ summary: 'List all active workouts for admin panel' })
  async listActiveWorkouts(@Query() query: AdminListUserWorkoutsQueryDto) {
    return this.adminService.listActiveWorkouts(query);
  }

  @Patch('workouts/:id/finish')
  @ApiOperation({ summary: 'Finish active workout as admin' })
  @ApiParam({ name: 'id', type: Number })
  async finishActiveWorkout(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.finishActiveWorkout(id);
  }

  @Patch('common-workouts/:id/finish')
  @ApiOperation({ summary: 'Finish active common workout as admin' })
  @ApiParam({ name: 'id', type: Number })
  async finishActiveCommonWorkout(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.finishActiveCommonWorkout(id);
  }

  @Get('exercises/stats')
  @ApiOperation({
    summary: 'Get most popular exercises and average performance',
  })
  async getExerciseStats(@Query() query: AdminExerciseStatsQueryDto) {
    return this.adminService.getExerciseStats(query);
  }

  @Get('exercises/profanity')
  @ApiOperation({
    summary: 'List exercises containing profane words for moderation',
  })
  async listProfaneExercises() {
    return this.adminService.listProfaneExercises();
  }

  @Get('users/:id/workouts')
  @ApiOperation({ summary: 'List user workouts for admin panel' })
  @ApiParam({ name: 'id', type: Number })
  async listUserWorkouts(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: AdminListUserWorkoutsQueryDto,
  ) {
    return this.adminService.listUserWorkouts(id, query);
  }
}
