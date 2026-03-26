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
import { CommonWorkoutsService } from './common-workouts.service';
import { StartCommonWorkoutDto } from './dto/start-common-workout.dto';
import { UpdateCommonWorkoutDto } from './dto/update-common-workout.dto';
import { AddCommonWorkoutExerciseDto } from './dto/add-common-workout-exercise.dto';
import { ChangeCommonWorkoutExercisePositionDto } from './dto/change-common-workout-exercise-position.dto';
import { ChangeCommonWorkoutExerciseDto } from './dto/change-common-workout-exercise.dto';
import { UpdateCommonWorkoutSetDto } from './dto/update-common-workout-set.dto';
import { ConfirmCommonWorkoutSetDto } from './dto/confirm-common-workout-set.dto';

@ApiTags('common-workouts')
@ApiBearerAuth()
@Controller('common-workouts')
@UseGuards(JwtAuthGuard)
export class CommonWorkoutsController {
  constructor(private readonly commonWorkoutsService: CommonWorkoutsService) {}

  @Post('start')
  async start(@Request() req, @Body() dto: StartCommonWorkoutDto) {
    return this.commonWorkoutsService.start(req.user.id, dto);
  }

  @Get('active')
  async getActive(@Request() req) {
    return this.commonWorkoutsService.getActive(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.commonWorkoutsService.getByIdForUser(req.user.id, id);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommonWorkoutDto,
  ) {
    return this.commonWorkoutsService.updateCommonWorkout(req.user.id, id, dto);
  }

  @Post(':id/exercises')
  async addExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddCommonWorkoutExerciseDto,
  ) {
    return this.commonWorkoutsService.addExercise(req.user.id, id, dto);
  }

  @Patch(':id/exercises/:exerciseId/position')
  async changeExercisePosition(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() dto: ChangeCommonWorkoutExercisePositionDto,
  ) {
    return this.commonWorkoutsService.changeExercisePosition(
      req.user.id,
      id,
      exerciseId,
      dto,
    );
  }

  @Patch(':id/exercises/:exerciseId/exercise')
  async changeExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body() dto: ChangeCommonWorkoutExerciseDto,
  ) {
    return this.commonWorkoutsService.changeExercise(req.user.id, id, exerciseId, dto);
  }

  @Delete(':id/exercises/:exerciseId')
  async removeExercise(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.commonWorkoutsService.removeExercise(req.user.id, id, exerciseId);
  }

  @Post('exercises/:exerciseId/add-set')
  async addSet(
    @Request() req,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
  ) {
    return this.commonWorkoutsService.addSet(req.user.id, exerciseId);
  }

  @Delete('sets/:setId')
  async removeSet(@Request() req, @Param('setId', ParseIntPipe) setId: number) {
    return this.commonWorkoutsService.removeSet(req.user.id, setId);
  }

  @Patch('sets/:setId')
  async updateSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: UpdateCommonWorkoutSetDto,
  ) {
    return this.commonWorkoutsService.updateSet(req.user.id, setId, dto);
  }

  @Patch('sets/:setId/confirm')
  async confirmSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: ConfirmCommonWorkoutSetDto,
  ) {
    return this.commonWorkoutsService.confirmSet(req.user.id, setId, dto);
  }

  @Post(':id/finish')
  async finish(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.commonWorkoutsService.finish(req.user.id, id);
  }
}
