import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { existsSync, mkdirSync, readdirSync, rmSync, unlinkSync } from 'fs';
import { join } from 'path';
import { User } from '../entities/user.entity';
import { UserWeightEntry } from '../entities/user-weight-entry.entity';
import { UserBodyMeasurementEntry } from '../entities/user-body-measurement-entry.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateWeightEntryDto } from './dto/create-weight-entry.dto';
import { UpdateWeightEntryDto } from './dto/update-weight-entry.dto';
import { CreateBodyMeasurementEntryDto } from './dto/create-body-measurement-entry.dto';
import { UpdateBodyMeasurementEntryDto } from './dto/update-body-measurement-entry.dto';

const UPLOADS_ROOT = join(process.cwd(), 'uploads');
const AVATARS_ROOT = join(UPLOADS_ROOT, 'avatars');

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserWeightEntry)
    private weightEntryRepository: Repository<UserWeightEntry>,
    @InjectRepository(UserBodyMeasurementEntry)
    private bodyMeasurementEntryRepository: Repository<UserBodyMeasurementEntry>,
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getSessionProfile(id: number) {
    const user = await this.findOne(id);

    return this.mapSessionUser(user);
  }

  async getUserCard(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['weightEntries', 'bodyMeasurementEntries'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const weightEntries = [...(user.weightEntries ?? [])].sort((a, b) =>
      a.recordedOn.localeCompare(b.recordedOn),
    );
    const bodyMeasurementEntries = [...(user.bodyMeasurementEntries ?? [])].sort(
      (a, b) => a.recordedOn.localeCompare(b.recordedOn),
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      role: user.role,
      avatarPath: user.avatarPath,
      avatarUrl: user.avatarPath ?? null,
      currentWeight:
        weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : user.weight,
      weightHistory: weightEntries,
      weightChart: weightEntries.map((entry) => ({
        date: entry.recordedOn,
        value: entry.weight,
      })),
      bodyMeasurements: bodyMeasurementEntries,
      bodyMeasurementsChart: this.buildMeasurementChart(bodyMeasurementEntries),
    };
  }

  async updateProfile(id: number, updateUserDto: UpdateUserProfileDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async updateEmail(id: number, updateEmailDto: UpdateEmailDto): Promise<User> {
    const user = await this.findOne(id);

    if (!(await bcrypt.compare(updateEmailDto.currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is invalid');
    }

    if (user.email === updateEmailDto.newEmail) {
      throw new BadRequestException('New email must be different');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: updateEmailDto.newEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    await this.userRepository.update(id, {
      email: updateEmailDto.newEmail,
    });

    return this.findOne(id);
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.findOne(id);

    if (!(await bcrypt.compare(updatePasswordDto.currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is invalid');
    }

    if (await bcrypt.compare(updatePasswordDto.newPassword, user.password)) {
      throw new BadRequestException('New password must be different');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.userRepository.update(id, {
      password: hashedPassword,
    });
  }

  async updateAvatar(id: number, file: { filename: string }) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    const user = await this.findOne(id);

    if (!existsSync(UPLOADS_ROOT)) {
      mkdirSync(UPLOADS_ROOT, { recursive: true });
    }

    if (user.avatarPath) {
      const currentAvatarPath = join(process.cwd(), user.avatarPath.replace(/^\//, ''));

      if (existsSync(currentAvatarPath)) {
        unlinkSync(currentAvatarPath);
      }
    }

    await this.userRepository.update(id, {
      avatarPath: `/uploads/avatars/${file.filename}`,
    });

    return this.findOne(id);
  }

  async purgeAllAvatars() {
    const usersWithAvatars = await this.userRepository
      .createQueryBuilder('user')
      .where('user.avatarPath IS NOT NULL')
      .getCount();

    let deletedFiles = 0;

    if (existsSync(AVATARS_ROOT)) {
      const files = readdirSync(AVATARS_ROOT, { withFileTypes: true });

      for (const file of files) {
        if (!file.isFile()) {
          continue;
        }

        unlinkSync(join(AVATARS_ROOT, file.name));
        deletedFiles += 1;
      }
    }

    const updateResult = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ avatarPath: null })
      .where('avatarPath IS NOT NULL')
      .execute();

    return {
      success: true,
      message: 'All avatar files have been deleted from server storage',
      deletedFiles,
      clearedUsers: updateResult.affected ?? 0,
      usersWithAvatarsBeforePurge: usersWithAvatars,
    };
  }

  async removeAvatarDirectory() {
    const hadDirectory = existsSync(AVATARS_ROOT);

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ avatarPath: null })
      .where('avatarPath IS NOT NULL')
      .execute();

    if (hadDirectory) {
      rmSync(AVATARS_ROOT, { recursive: true, force: true });
    }

    return {
      success: true,
      message: 'Avatar directory has been deleted from server storage',
      removedDirectory: hadDirectory,
      path: '/uploads/avatars',
    };
  }

  async listWeightEntries(id: number) {
    await this.findOne(id);

    return this.weightEntryRepository.find({
      where: { user: { id } },
      order: { recordedOn: 'DESC', id: 'DESC' },
    });
  }

  async createWeightEntry(id: number, dto: CreateWeightEntryDto) {
    const user = await this.findOne(id);
    const item = this.weightEntryRepository.create({
      ...dto,
      user,
    });

    const savedEntry = await this.weightEntryRepository.save(item);
    await this.userRepository.update(id, {
      weight: savedEntry.weight,
    });

    return savedEntry;
  }

  async updateWeightEntry(id: number, entryId: number, dto: UpdateWeightEntryDto) {
    const entry = await this.findWeightEntry(id, entryId);

    Object.assign(entry, dto);
    const updatedEntry = await this.weightEntryRepository.save(entry);

    await this.syncLatestUserWeight(id);

    return updatedEntry;
  }

  async removeWeightEntry(id: number, entryId: number) {
    const entry = await this.findWeightEntry(id, entryId);
    await this.weightEntryRepository.remove(entry);
    await this.syncLatestUserWeight(id);

    return {
      success: true,
      message: 'Weight entry removed',
      id: entry.id,
      recordedOn: entry.recordedOn,
    };
  }

  async listBodyMeasurementEntries(id: number) {
    await this.findOne(id);

    return this.bodyMeasurementEntryRepository.find({
      where: { user: { id } },
      order: { recordedOn: 'DESC', id: 'DESC' },
    });
  }

  async createBodyMeasurementEntry(id: number, dto: CreateBodyMeasurementEntryDto) {
    const user = await this.findOne(id);
    const item = this.bodyMeasurementEntryRepository.create({
      ...dto,
      user,
    });

    return this.bodyMeasurementEntryRepository.save(item);
  }

  async updateBodyMeasurementEntry(
    id: number,
    entryId: number,
    dto: UpdateBodyMeasurementEntryDto,
  ) {
    const entry = await this.findBodyMeasurementEntry(id, entryId);

    Object.assign(entry, dto);
    return this.bodyMeasurementEntryRepository.save(entry);
  }

  async removeBodyMeasurementEntry(id: number, entryId: number) {
    const entry = await this.findBodyMeasurementEntry(id, entryId);
    await this.bodyMeasurementEntryRepository.remove(entry);

    return {
      success: true,
      message: 'Body measurement entry removed',
      id: entry.id,
      recordedOn: entry.recordedOn,
    };
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.delete(id);

    return {
      success: true,
      message: 'User removed',
      id: user.id,
      email: user.email,
    };
  }

  private mapSessionUser(user: User) {
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

  private async findWeightEntry(userId: number, entryId: number): Promise<UserWeightEntry> {
    const entry = await this.weightEntryRepository.findOne({
      where: { id: entryId, user: { id: userId } },
      relations: ['user'],
    });

    if (!entry) {
      throw new NotFoundException('Weight entry not found');
    }

    return entry;
  }

  private async findBodyMeasurementEntry(
    userId: number,
    entryId: number,
  ): Promise<UserBodyMeasurementEntry> {
    const entry = await this.bodyMeasurementEntryRepository.findOne({
      where: { id: entryId, user: { id: userId } },
      relations: ['user'],
    });

    if (!entry) {
      throw new NotFoundException('Body measurement entry not found');
    }

    return entry;
  }

  private async syncLatestUserWeight(userId: number) {
    const latestWeight = await this.weightEntryRepository.findOne({
      where: { user: { id: userId } },
      order: { recordedOn: 'DESC', id: 'DESC' },
    });

    await this.userRepository.update(userId, {
      weight: latestWeight?.weight ?? null,
    });
  }

  private buildMeasurementChart(entries: UserBodyMeasurementEntry[]) {
    const metricKeys: Array<keyof UserBodyMeasurementEntry> = [
      'neck',
      'shoulders',
      'chest',
      'leftBiceps',
      'rightBiceps',
      'leftForearm',
      'rightForearm',
      'upperAbs',
      'waist',
      'lowerAbs',
      'hips',
      'leftThigh',
      'rightThigh',
      'leftCalf',
      'rightCalf',
    ];

    return metricKeys.reduce(
      (chart, key) => {
        chart[key] = entries.map((entry) => ({
          date: entry.recordedOn,
          value: entry[key] as number,
        }));

        return chart;
      },
      {} as Record<string, Array<{ date: string; value: number }>>,
    );
  }
}
