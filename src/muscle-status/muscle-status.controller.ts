import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MuscleStatusService } from './muscle-status.service';
import { CreateMuscleStatusDto } from './dto/create-muscle-status.dto';
import { UpdateMuscleStatusDto } from './dto/update-muscle-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('muscle-status')
@UseGuards(JwtAuthGuard)
export class MuscleStatusController {
  constructor(private muscleStatusService: MuscleStatusService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateMuscleStatusDto) {
    const item = await this.muscleStatusService.create(req.user.id, createDto);

    return {
      item,
    };
  }

  @Get()
  async findAll(@Request() req) {
    const items = await this.muscleStatusService.findAll(req.user.id);

    return {
      items,
      total: items.length,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.muscleStatusService.findOne(+id);

    return {
      item,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateMuscleStatusDto) {
    const item = await this.muscleStatusService.update(+id, updateDto);

    return {
      item,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.muscleStatusService.remove(+id);
  }
}
