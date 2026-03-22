"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const fs_1 = require("fs");
const path_1 = require("path");
const user_entity_1 = require("../entities/user.entity");
const user_weight_entry_entity_1 = require("../entities/user-weight-entry.entity");
const user_body_measurement_entry_entity_1 = require("../entities/user-body-measurement-entry.entity");
const UPLOADS_ROOT = (0, path_1.join)(process.cwd(), 'uploads');
let UsersService = class UsersService {
    constructor(userRepository, weightEntryRepository, bodyMeasurementEntryRepository) {
        this.userRepository = userRepository;
        this.weightEntryRepository = weightEntryRepository;
        this.bodyMeasurementEntryRepository = bodyMeasurementEntryRepository;
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getSessionProfile(id) {
        const user = await this.findOne(id);
        return this.mapSessionUser(user);
    }
    async getUserCard(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['weightEntries', 'bodyMeasurementEntries'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const weightEntries = [...(user.weightEntries ?? [])].sort((a, b) => a.recordedOn.localeCompare(b.recordedOn));
        const bodyMeasurementEntries = [...(user.bodyMeasurementEntries ?? [])].sort((a, b) => a.recordedOn.localeCompare(b.recordedOn));
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            gender: user.gender,
            role: user.role,
            avatarPath: user.avatarPath,
            avatarUrl: user.avatarPath ?? null,
            currentWeight: weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : user.weight,
            weightHistory: weightEntries,
            weightChart: weightEntries.map((entry) => ({
                date: entry.recordedOn,
                value: entry.weight,
            })),
            bodyMeasurements: bodyMeasurementEntries,
            bodyMeasurementsChart: this.buildMeasurementChart(bodyMeasurementEntries),
        };
    }
    async updateProfile(id, updateUserDto) {
        await this.userRepository.update(id, updateUserDto);
        return this.findOne(id);
    }
    async updateEmail(id, updateEmailDto) {
        const user = await this.findOne(id);
        if (!(await bcrypt.compare(updateEmailDto.currentPassword, user.password))) {
            throw new common_1.UnauthorizedException('Current password is invalid');
        }
        if (user.email === updateEmailDto.newEmail) {
            throw new common_1.BadRequestException('New email must be different');
        }
        const existingUser = await this.userRepository.findOne({
            where: { email: updateEmailDto.newEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email is already in use');
        }
        await this.userRepository.update(id, {
            email: updateEmailDto.newEmail,
        });
        return this.findOne(id);
    }
    async updatePassword(id, updatePasswordDto) {
        const user = await this.findOne(id);
        if (!(await bcrypt.compare(updatePasswordDto.currentPassword, user.password))) {
            throw new common_1.UnauthorizedException('Current password is invalid');
        }
        if (await bcrypt.compare(updatePasswordDto.newPassword, user.password)) {
            throw new common_1.BadRequestException('New password must be different');
        }
        const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
        await this.userRepository.update(id, {
            password: hashedPassword,
        });
    }
    async updateAvatar(id, file) {
        if (!file) {
            throw new common_1.BadRequestException('Avatar file is required');
        }
        const user = await this.findOne(id);
        if (!(0, fs_1.existsSync)(UPLOADS_ROOT)) {
            (0, fs_1.mkdirSync)(UPLOADS_ROOT, { recursive: true });
        }
        if (user.avatarPath) {
            const currentAvatarPath = (0, path_1.join)(process.cwd(), user.avatarPath.replace(/^\//, ''));
            if ((0, fs_1.existsSync)(currentAvatarPath)) {
                (0, fs_1.unlinkSync)(currentAvatarPath);
            }
        }
        await this.userRepository.update(id, {
            avatarPath: `/uploads/avatars/${file.filename}`,
        });
        return this.findOne(id);
    }
    async listWeightEntries(id) {
        await this.findOne(id);
        return this.weightEntryRepository.find({
            where: { user: { id } },
            order: { recordedOn: 'DESC', id: 'DESC' },
        });
    }
    async createWeightEntry(id, dto) {
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
    async updateWeightEntry(id, entryId, dto) {
        const entry = await this.findWeightEntry(id, entryId);
        Object.assign(entry, dto);
        const updatedEntry = await this.weightEntryRepository.save(entry);
        await this.syncLatestUserWeight(id);
        return updatedEntry;
    }
    async removeWeightEntry(id, entryId) {
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
    async listBodyMeasurementEntries(id) {
        await this.findOne(id);
        return this.bodyMeasurementEntryRepository.find({
            where: { user: { id } },
            order: { recordedOn: 'DESC', id: 'DESC' },
        });
    }
    async createBodyMeasurementEntry(id, dto) {
        const user = await this.findOne(id);
        const item = this.bodyMeasurementEntryRepository.create({
            ...dto,
            user,
        });
        return this.bodyMeasurementEntryRepository.save(item);
    }
    async updateBodyMeasurementEntry(id, entryId, dto) {
        const entry = await this.findBodyMeasurementEntry(id, entryId);
        Object.assign(entry, dto);
        return this.bodyMeasurementEntryRepository.save(entry);
    }
    async removeBodyMeasurementEntry(id, entryId) {
        const entry = await this.findBodyMeasurementEntry(id, entryId);
        await this.bodyMeasurementEntryRepository.remove(entry);
        return {
            success: true,
            message: 'Body measurement entry removed',
            id: entry.id,
            recordedOn: entry.recordedOn,
        };
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.delete(id);
        return {
            success: true,
            message: 'User removed',
            id: user.id,
            email: user.email,
        };
    }
    mapSessionUser(user) {
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
    async findWeightEntry(userId, entryId) {
        const entry = await this.weightEntryRepository.findOne({
            where: { id: entryId, user: { id: userId } },
            relations: ['user'],
        });
        if (!entry) {
            throw new common_1.NotFoundException('Weight entry not found');
        }
        return entry;
    }
    async findBodyMeasurementEntry(userId, entryId) {
        const entry = await this.bodyMeasurementEntryRepository.findOne({
            where: { id: entryId, user: { id: userId } },
            relations: ['user'],
        });
        if (!entry) {
            throw new common_1.NotFoundException('Body measurement entry not found');
        }
        return entry;
    }
    async syncLatestUserWeight(userId) {
        const latestWeight = await this.weightEntryRepository.findOne({
            where: { user: { id: userId } },
            order: { recordedOn: 'DESC', id: 'DESC' },
        });
        await this.userRepository.update(userId, {
            weight: latestWeight?.weight ?? null,
        });
    }
    buildMeasurementChart(entries) {
        const metricKeys = [
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
        return metricKeys.reduce((chart, key) => {
            chart[key] = entries.map((entry) => ({
                date: entry.recordedOn,
                value: entry[key],
            }));
            return chart;
        }, {});
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(user_weight_entry_entity_1.UserWeightEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(user_body_measurement_entry_entity_1.UserBodyMeasurementEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map