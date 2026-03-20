import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddWorkoutTemplateExerciseDto } from './dto/add-workout-template-exercise.dto';
import { ChangeWorkoutTemplateExercisePositionDto } from './dto/change-workout-template-exercise-position.dto';
import { ChangeWorkoutTemplateExerciseSetsDto } from './dto/change-workout-template-exercise-sets.dto';
import { ChangeWorkoutTemplateExerciseDto } from './dto/change-workout-template-exercise.dto';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
import { WorkoutTemplatesService } from './workout-templates.service';

@ApiTags('workout-templates')
@ApiBearerAuth()
@Controller('workout-templates')
@UseGuards(JwtAuthGuard)
export class WorkoutTemplatesController {
  constructor(private readonly workoutTemplatesService: WorkoutTemplatesService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateWorkoutTemplateDto) {
    const item = await this.workoutTemplatesService.create(req.user.id, createDto);

    return {
      item,
    };
  }

  @Get()
  async findAll(@Request() req) {
    const items = await this.workoutTemplatesService.findAll(req.user.id);

    return {
      items,
      total: items.length,
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const item = await this.workoutTemplatesService.findOne(req.user.id, id);

    return {
      item,
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWorkoutTemplateDto,
  ) {
    const item = await this.workoutTemplatesService.update(req.user.id, id, updateDto);

    return {
      item,
    };
  }

  @Patch(':id')
  async patch(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWorkoutTemplateDto,
  ) {
    const item = await this.workoutTemplatesService.update(req.user.id, id, updateDto);

    return {
      item,
    };
  }

  @Post(':id/exercises')
  async addExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddWorkoutTemplateExerciseDto,
  ) {
    const item = await this.workoutTemplatesService.addExercise(req.user.id, id, dto);

    return {
      item,
    };
  }

  @Patch(':id/exercises/:exerciseEntryId/position')
  async changeExercisePosition(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseEntryId', ParseIntPipe) exerciseEntryId: number,
    @Body() dto: ChangeWorkoutTemplateExercisePositionDto,
  ) {
    const item = await this.workoutTemplatesService.changeExercisePosition(
      req.user.id,
      id,
      exerciseEntryId,
      dto.order,
    );

    return {
      item,
    };
  }

  @Patch(':id/exercises/:exerciseEntryId/exercise')
  async changeExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseEntryId', ParseIntPipe) exerciseEntryId: number,
    @Body() dto: ChangeWorkoutTemplateExerciseDto,
  ) {
    const item = await this.workoutTemplatesService.changeExercise(
      req.user.id,
      id,
      exerciseEntryId,
      dto.exerciseId,
    );

    return {
      item,
    };
  }

  @Patch(':id/exercises/:exerciseEntryId/sets-count')
  async changeExerciseSetsCount(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseEntryId', ParseIntPipe) exerciseEntryId: number,
    @Body() dto: ChangeWorkoutTemplateExerciseSetsDto,
  ) {
    const item = await this.workoutTemplatesService.changeExerciseSetsCount(
      req.user.id,
      id,
      exerciseEntryId,
      dto.setsCount,
    );

    return {
      item,
    };
  }

  @Delete(':id/exercises/:exerciseEntryId')
  async removeExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseEntryId', ParseIntPipe) exerciseEntryId: number,
  ) {
    const item = await this.workoutTemplatesService.removeExercise(
      req.user.id,
      id,
      exerciseEntryId,
    );

    return {
      item,
    };
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.workoutTemplatesService.remove(req.user.id, id);
  }
}
