import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddWorkoutExerciseDto } from './dto/add-workout-exercise.dto';
import { ChangeWorkoutExercisePositionDto } from './dto/change-workout-exercise-position.dto';
import { ChangeWorkoutExerciseDto } from './dto/change-workout-exercise.dto';
import { ConfirmWorkoutSetDto } from './dto/confirm-workout-set.dto';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { WorkoutsService } from './workouts.service';

@ApiTags('workouts')
@ApiBearerAuth()
@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post('start')
  async startWorkout(@Request() req, @Body() dto: StartWorkoutDto) {
    return this.workoutsService.startWorkout(req.user.id, dto);
  }

  @Get('active')
  async getActiveWorkout(@Request() req) {
    return this.workoutsService.getActiveWorkout(req.user.id);
  }

  @Post('finish')
  async finishActiveWorkout(@Request() req) {
    return this.workoutsService.finishActiveWorkout(req.user.id);
  }

  @Get()
  async findAll(@Request() req) {
    return this.workoutsService.findAll(req.user.id);
  }

  @Get('history')
  async findHistory(@Request() req) {
    return this.workoutsService.findHistory(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.workoutsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  async updateWorkout(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.updateWorkout(req.user.id, id, dto);
  }

  @Delete(':id')
  removeWorkout(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.workoutsService.removeWorkout(req.user.id, id);
  }

  @Post(':workoutId/exercises')
  async addExercise(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Body() dto: AddWorkoutExerciseDto,
  ) {
    return this.workoutsService.addExercise(req.user.id, workoutId, dto);
  }

  @Patch(':workoutId/exercises/:workoutExerciseId/position')
  async changeExercisePosition(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
    @Body() dto: ChangeWorkoutExercisePositionDto,
  ) {
    return this.workoutsService.changeExercisePosition(
      req.user.id,
      workoutId,
      workoutExerciseId,
      dto.order,
    );
  }

  @Patch(':workoutId/exercises/:workoutExerciseId/exercise')
  async changeExercise(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
    @Body() dto: ChangeWorkoutExerciseDto,
  ) {
    return this.workoutsService.changeExercise(
      req.user.id,
      workoutId,
      workoutExerciseId,
      dto.exerciseId,
    );
  }

  @Delete(':workoutId/exercises/:workoutExerciseId')
  async removeExercise(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
  ) {
    return this.workoutsService.removeExercise(
      req.user.id,
      workoutId,
      workoutExerciseId,
    );
  }

  @Patch('sets/:setId')
  async updateSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: UpdateWorkoutSetDto,
  ) {
    return this.workoutsService.updateSet(req.user.id, setId, dto);
  }

  @Patch('sets/:setId/confirm')
  async confirmSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: ConfirmWorkoutSetDto,
  ) {
    return this.workoutsService.confirmSet(req.user.id, setId, dto);
  }

  @Post('exercises/:workoutExerciseId/add-set')
  async addSet(
    @Request() req,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
  ) {
    return this.workoutsService.addSet(req.user.id, workoutExerciseId);
  }

  @Post(':workoutId/exercises/:workoutExerciseId/sets')
  async addSetToExercise(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
  ) {
    return this.workoutsService.addSetToWorkoutExercise(
      req.user.id,
      workoutId,
      workoutExerciseId,
    );
  }

  @Delete('sets/:setId')
  async removeSet(@Request() req, @Param('setId', ParseIntPipe) setId: number) {
    return this.workoutsService.removeSet(req.user.id, setId);
  }
}
