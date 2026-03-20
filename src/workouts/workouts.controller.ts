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
    const item = await this.workoutsService.startWorkout(req.user.id, dto);

    return {
      item,
    };
  }

  @Get('active')
  async getActiveWorkout(@Request() req) {
    const item = await this.workoutsService.getActiveWorkout(req.user.id);

    return {
      item,
    };
  }

  @Post('finish')
  async finishActiveWorkout(@Request() req) {
    const item = await this.workoutsService.finishActiveWorkout(req.user.id);

    return {
      item,
    };
  }

  @Get()
  async findAll(@Request() req) {
    const items = await this.workoutsService.findAll(req.user.id);

    return {
      items,
      total: items.length,
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const item = await this.workoutsService.findOne(req.user.id, id);

    return {
      item,
    };
  }

  @Patch(':id')
  async updateWorkout(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkoutDto,
  ) {
    const item = await this.workoutsService.updateWorkout(req.user.id, id, dto);

    return {
      item,
    };
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
    const item = await this.workoutsService.addExercise(req.user.id, workoutId, dto);

    return {
      item,
    };
  }

  @Patch(':workoutId/exercises/:workoutExerciseId/position')
  async changeExercisePosition(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
    @Body() dto: ChangeWorkoutExercisePositionDto,
  ) {
    const item = await this.workoutsService.changeExercisePosition(
      req.user.id,
      workoutId,
      workoutExerciseId,
      dto.order,
    );

    return {
      item,
    };
  }

  @Patch(':workoutId/exercises/:workoutExerciseId/exercise')
  async changeExercise(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
    @Body() dto: ChangeWorkoutExerciseDto,
  ) {
    const item = await this.workoutsService.changeExercise(
      req.user.id,
      workoutId,
      workoutExerciseId,
      dto.exerciseId,
    );

    return {
      item,
    };
  }

  @Delete(':workoutId/exercises/:workoutExerciseId')
  async removeExercise(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
  ) {
    const item = await this.workoutsService.removeExercise(
      req.user.id,
      workoutId,
      workoutExerciseId,
    );

    return {
      item,
    };
  }

  @Patch('sets/:setId')
  async updateSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: UpdateWorkoutSetDto,
  ) {
    const item = await this.workoutsService.updateSet(req.user.id, setId, dto);

    return {
      item,
    };
  }

  @Patch('sets/:setId/confirm')
  async confirmSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: ConfirmWorkoutSetDto,
  ) {
    const item = await this.workoutsService.confirmSet(req.user.id, setId, dto);

    return {
      item,
    };
  }

  @Post('exercises/:workoutExerciseId/add-set')
  async addSet(
    @Request() req,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
  ) {
    const item = await this.workoutsService.addSet(req.user.id, workoutExerciseId);

    return {
      item,
    };
  }

  @Post(':workoutId/exercises/:workoutExerciseId/sets')
  async addSetToExercise(
    @Request() req,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
  ) {
    const item = await this.workoutsService.addSetToWorkoutExercise(
      req.user.id,
      workoutId,
      workoutExerciseId,
    );

    return {
      item,
    };
  }

  @Delete('sets/:setId')
  async removeSet(@Request() req, @Param('setId', ParseIntPipe) setId: number) {
    const item = await this.workoutsService.removeSet(req.user.id, setId);

    return {
      item,
    };
  }
}
