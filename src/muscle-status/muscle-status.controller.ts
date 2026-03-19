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
  create(@Request() req, @Body() createDto: CreateMuscleStatusDto) {
    return this.muscleStatusService.create(req.user.id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.muscleStatusService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.muscleStatusService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMuscleStatusDto) {
    return this.muscleStatusService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.muscleStatusService.remove(+id);
  }
}