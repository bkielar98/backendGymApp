import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateWeightEntryDto } from './dto/create-weight-entry.dto';
import { UpdateWeightEntryDto } from './dto/update-weight-entry.dto';
import { CreateBodyMeasurementEntryDto } from './dto/create-body-measurement-entry.dto';
import { UpdateBodyMeasurementEntryDto } from './dto/update-body-measurement-entry.dto';

const avatarStorage = diskStorage({
  destination: './uploads/avatars',
  filename: (_, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1_000_000_000)}`;
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  async getProfile(@Request() req) {
    const item = await this.usersService.getProfile(req.user.id);

    return {
      item,
    };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserProfileDto) {
    await this.usersService.updateProfile(req.user.id, updateUserDto);
    const item = await this.usersService.getProfile(req.user.id);

    return {
      item,
    };
  }

  @Patch('email')
  @ApiOperation({ summary: 'Update user email' })
  @ApiResponse({ status: 200, description: 'Email updated' })
  async updateEmail(@Request() req, @Body() updateEmailDto: UpdateEmailDto) {
    await this.usersService.updateEmail(req.user.id, updateEmailDto);
    const item = await this.usersService.getProfile(req.user.id);

    return {
      item,
    };
  }

  @Patch('password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password updated' })
  async updatePassword(@Request() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    await this.usersService.updatePassword(req.user.id, updatePasswordDto);

    return {
      success: true,
      message: 'Password updated',
    };
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
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
  @ApiResponse({ status: 201, description: 'Avatar uploaded' })
  @UseInterceptors(FileInterceptor('avatar', { storage: avatarStorage }))
  async uploadAvatar(@Request() req, @UploadedFile() file: { filename: string }) {
    await this.usersService.updateAvatar(req.user.id, file);
    const item = await this.usersService.getProfile(req.user.id);

    return {
      item,
    };
  }

  @Get('weights')
  @ApiOperation({ summary: 'Get user weight history' })
  @ApiResponse({ status: 200, description: 'Weight history retrieved' })
  async getWeights(@Request() req) {
    return this.usersService.listWeightEntries(req.user.id);
  }

  @Post('weights')
  @ApiOperation({ summary: 'Create weight entry' })
  @ApiResponse({ status: 201, description: 'Weight entry created' })
  async createWeight(@Request() req, @Body() dto: CreateWeightEntryDto) {
    const item = await this.usersService.createWeightEntry(req.user.id, dto);

    return {
      item,
    };
  }

  @Put('weights/:id')
  @ApiOperation({ summary: 'Update weight entry' })
  @ApiResponse({ status: 200, description: 'Weight entry updated' })
  async updateWeight(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWeightEntryDto,
  ) {
    const item = await this.usersService.updateWeightEntry(req.user.id, id, dto);

    return {
      item,
    };
  }

  @Delete('weights/:id')
  @ApiOperation({ summary: 'Delete weight entry' })
  @ApiResponse({ status: 200, description: 'Weight entry deleted' })
  deleteWeight(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeWeightEntry(req.user.id, id);
  }

  @Get('body-measurements')
  @ApiOperation({ summary: 'Get user body measurement history' })
  @ApiResponse({ status: 200, description: 'Body measurement history retrieved' })
  getBodyMeasurements(@Request() req) {
    return this.usersService.listBodyMeasurementEntries(req.user.id);
  }

  @Post('body-measurements')
  @ApiOperation({ summary: 'Create body measurement entry' })
  @ApiResponse({ status: 201, description: 'Body measurement entry created' })
  async createBodyMeasurement(
    @Request() req,
    @Body() dto: CreateBodyMeasurementEntryDto,
  ) {
    const item = await this.usersService.createBodyMeasurementEntry(req.user.id, dto);

    return {
      item,
    };
  }

  @Put('body-measurements/:id')
  @ApiOperation({ summary: 'Update body measurement entry' })
  @ApiResponse({ status: 200, description: 'Body measurement entry updated' })
  async updateBodyMeasurement(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBodyMeasurementEntryDto,
  ) {
    const item = await this.usersService.updateBodyMeasurementEntry(req.user.id, id, dto);

    return {
      item,
    };
  }

  @Delete('body-measurements/:id')
  @ApiOperation({ summary: 'Delete body measurement entry' })
  @ApiResponse({ status: 200, description: 'Body measurement entry deleted' })
  deleteBodyMeasurement(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeBodyMeasurementEntry(req.user.id, id);
  }

  @Delete('profile')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  deleteProfile(@Request() req) {
    return this.usersService.remove(req.user.id);
  }
}
