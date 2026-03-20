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
import { WorkoutTemplatesService } from './workout-templates.service';
import { CreateWorkoutTemplateDto } from './dto/create-workout-template.dto';
import { UpdateWorkoutTemplateDto } from './dto/update-workout-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddWorkoutTemplateExerciseDto } from './dto/add-workout-template-exercise.dto';
import { ChangeWorkoutTemplateExercisePositionDto } from './dto/change-workout-template-exercise-position.dto';
import { ChangeWorkoutTemplateExerciseDto } from './dto/change-workout-template-exercise.dto';
import { ChangeWorkoutTemplateExerciseSetsDto } from './dto/change-workout-template-exercise-sets.dto';

@ApiTags('workout-templates')
@ApiBearerAuth()
@Controller('workout-templates')
@UseGuards(JwtAuthGuard)
export class WorkoutTemplatesController {
  constructor(private readonly workoutTemplatesService: WorkoutTemplatesService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateWorkoutTemplateDto) {
    return this.workoutTemplatesService.create(req.user.id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.workoutTemplatesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.workoutTemplatesService.findOne(req.user.id, id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWorkoutTemplateDto,
  ) {
    return this.workoutTemplatesService.update(req.user.id, id, updateDto);
  }

  @Patch(':id')
  patch(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWorkoutTemplateDto,
  ) {
    return this.workoutTemplatesService.update(req.user.id, id, updateDto);
  }

  @Post(':id/exercises')
  addExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddWorkoutTemplateExerciseDto,
  ) {
    return this.workoutTemplatesService.addExercise(req.user.id, id, dto);
  }

  @Patch(':id/exercises/:exerciseEntryId/position')
  changeExercisePosition(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseEntryId', ParseIntPipe) exerciseEntryId: number,
    @Body() dto: ChangeWorkoutTemplateExercisePositionDto,
  ) {
    return this.workoutTemplatesService.changeExercisePosition(
      req.user.id,
      id,
      exerciseEntryId,
      dto.order,
    );
  }

  @Patch(':id/exercises/:exerciseEntryId/exercise')
  changeExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseEntryId', ParseIntPipe) exerciseEntryId: number,
    @Body() dto: ChangeWorkoutTemplateExerciseDto,
  ) {
    return this.workoutTemplatesService.changeExercise(
      req.user.id,
      id,
      exerciseEntryId,
      dto.exerciseId,
    );
  }

  @Patch(':id/exercises/:exerciseEntryId/sets-count')
  changeExerciseSetsCount(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseEntryId', ParseIntPipe) exerciseEntryId: number,
    @Body() dto: ChangeWorkoutTemplateExerciseSetsDto,
  ) {
    return this.workoutTemplatesService.changeExerciseSetsCount(
      req.user.id,
      id,
      exerciseEntryId,
      dto.setsCount,
    );
  }

  @Delete(':id/exercises/:exerciseEntryId')
  removeExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseEntryId', ParseIntPipe) exerciseEntryId: number,
  ) {
    return this.workoutTemplatesService.removeExercise(
      req.user.id,
      id,
      exerciseEntryId,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.workoutTemplatesService.remove(req.user.id, id);
  }
}
