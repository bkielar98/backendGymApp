import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gyms')
@UseGuards(JwtAuthGuard)
export class GymsController {
  constructor(private gymsService: GymsService) {}

  @Post()
  async create(@Body() createGymDto: CreateGymDto) {
    const item = await this.gymsService.create(createGymDto);

    return {
      item,
    };
  }

  @Get()
  async findAll() {
    const items = await this.gymsService.findAll();

    return {
      items,
      total: items.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.gymsService.findOne(+id);

    return {
      item,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateGymDto: UpdateGymDto) {
    const item = await this.gymsService.update(+id, updateGymDto);

    return {
      item,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gymsService.remove(+id);
  }
}
