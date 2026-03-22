import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gym } from '../entities/gym.entity';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';

@Injectable()
export class GymsService {
  constructor(
    @InjectRepository(Gym)
    private gymRepository: Repository<Gym>,
  ) {}

  async create(createGymDto: CreateGymDto): Promise<Gym> {
    const gym = this.gymRepository.create(createGymDto);
    return this.gymRepository.save(gym);
  }

  async findAll(): Promise<Gym[]> {
    return this.gymRepository.find();
  }

  async findOne(id: number): Promise<Gym> {
    const gym = await this.gymRepository.findOne({ where: { id } });

    if (!gym) {
      throw new NotFoundException('Gym not found');
    }

    return gym;
  }

  async update(id: number, updateGymDto: UpdateGymDto): Promise<Gym> {
    await this.gymRepository.update(id, updateGymDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const gym = await this.findOne(id);
    await this.gymRepository.delete(id);

    return {
      success: true,
      message: 'Gym removed',
      id: gym.id,
      name: gym.name,
    };
  }
}
