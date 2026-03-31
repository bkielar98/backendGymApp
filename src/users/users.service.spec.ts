import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { UserRole } from '../entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    createQueryBuilder: any;
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
  let queryBuilder: {
    update: any;
    set: any;
    where: any;
    execute: any;
  };

  beforeEach(() => {
    queryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 0 } as never),
    };
    userRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
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

  it('builds lightweight session profile', async () => {
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

    await expect(service.getSessionProfile(19)).resolves.toMatchObject({
      email: 'user@example.com',
      avatarUrl: '/uploads/avatars/test.jpg',
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

  it('returns body measurement history as a plain array', async () => {
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

    await expect(service.listBodyMeasurementEntries(19)).resolves.toMatchObject([
      {
        recordedOn: '2026-03-12',
        neck: 38,
        waist: 81,
      },
      {
        recordedOn: '2026-03-11',
        neck: 37,
        waist: 82,
      },
    ]);
  });

  it('removes avatar directory and clears avatar paths', async () => {
    const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    const rmSpy = jest.spyOn(fs, 'rmSync').mockImplementation(() => undefined);

    await expect(service.removeAvatarDirectory()).resolves.toEqual({
      success: true,
      message: 'Avatar directory has been deleted from server storage',
      removedDirectory: true,
      path: '/uploads/avatars',
    });

    expect(userRepository.createQueryBuilder).toHaveBeenCalled();
    expect(queryBuilder.update).toHaveBeenCalled();
    expect(queryBuilder.set).toHaveBeenCalledWith({ avatarPath: null });
    expect(queryBuilder.where).toHaveBeenCalledWith('avatarPath IS NOT NULL');
    expect(queryBuilder.execute).toHaveBeenCalled();
    expect(rmSpy).toHaveBeenCalled();

    existsSpy.mockRestore();
    rmSpy.mockRestore();
  });
});
