import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WorkoutTemplatesService } from './workout-templates.service';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('workout-templates')
@UseGuards(JwtAuthGuard)
export class WorkoutTemplatesController {
  constructor(private workoutTemplatesService: WorkoutTemplatesService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateWorkoutTemplateDto) {
    return this.workoutTemplatesService.create(req.user.id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.workoutTemplatesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutTemplatesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWorkoutTemplateDto) {
    return this.workoutTemplatesService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutTemplatesService.remove(+id);
  }
}