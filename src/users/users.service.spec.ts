import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    findOne: any;
    update: any;
    delete: any;
  };
  let weightEntryRepository: {
    find: any;
    findOne: any;
    create: any;
    save: any;
    remove: any;
  };
  let bodyMeasurementEntryRepository: {
    find: any;
    findOne: any;
    create: any;
    save: any;
    remove: any;
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    weightEntryRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    bodyMeasurementEntryRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    service = new UsersService(
      userRepository as never,
      weightEntryRepository as never,
      bodyMeasurementEntryRepository as never,
    );
  });

  it('builds profile with current weight and chart data', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 19,
      email: 'user@example.com',
      name: 'User',
      gender: 'male',
      role: UserRole.USER,
      avatarPath: '/uploads/avatars/test.jpg',
      weight: null,
      weightEntries: [
        { id: 2, recordedOn: '2026-03-12', weight: 79.8 },
        { id: 1, recordedOn: '2026-03-11', weight: 80.1 },
      ],
      bodyMeasurementEntries: [],
    });

    await expect(service.getProfile(19)).resolves.toMatchObject({
      email: 'user@example.com',
      avatarUrl: '/uploads/avatars/test.jpg',
      currentWeight: 79.8,
      weightHistory: {
        total: 2,
        chart: [
          { date: '2026-03-11', value: 80.1 },
          { date: '2026-03-12', value: 79.8 },
        ],
      },
    });
  });

  it('rejects email change when current password is invalid', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 19,
      email: 'user@example.com',
      password: await bcrypt.hash('Password123!', 10),
      name: 'User',
      role: UserRole.USER,
      weightEntries: [],
      bodyMeasurementEntries: [],
    });

    await expect(
      service.updateEmail(19, {
        currentPassword: 'wrong-password',
        newEmail: 'new@example.com',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns chart-ready body measurement history', async () => {
    bodyMeasurementEntryRepository.find.mockResolvedValue([
      {
        id: 2,
        recordedOn: '2026-03-12',
        neck: 38,
        shoulders: 119,
        chest: 105,
        leftBiceps: 34,
        rightBiceps: 34,
        leftForearm: 30,
        rightForearm: 30,
        upperAbs: 89,
        waist: 81,
        lowerAbs: 85,
        hips: 97,
        leftThigh: 57,
        rightThigh: 57,
        leftCalf: 36,
        rightCalf: 36,
      },
      {
        id: 1,
        recordedOn: '2026-03-11',
        neck: 37,
        shoulders: 118,
        chest: 104,
        leftBiceps: 33,
        rightBiceps: 33,
        leftForearm: 29,
        rightForearm: 29,
        upperAbs: 90,
        waist: 82,
        lowerAbs: 86,
        hips: 98,
        leftThigh: 58,
        rightThigh: 58,
        leftCalf: 37,
        rightCalf: 37,
      },
    ]);
    userRepository.findOne.mockResolvedValue({
      id: 19,
      email: 'user@example.com',
      name: 'User',
      role: UserRole.USER,
      weightEntries: [],
      bodyMeasurementEntries: [],
    });

    await expect(service.listBodyMeasurementEntries(19)).resolves.toMatchObject({
      total: 2,
      chart: {
        neck: [
          { date: '2026-03-11', value: 37 },
          { date: '2026-03-12', value: 38 },
        ],
        waist: [
          { date: '2026-03-11', value: 82 },
          { date: '2026-03-12', value: 81 },
        ],
      },
    });
  });
});
