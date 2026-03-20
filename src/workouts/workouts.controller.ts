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
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StartWorkoutDto } from './dto/start-workout.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { ConfirmWorkoutSetDto } from './dto/confirm-workout-set.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('workouts')
@ApiBearerAuth()
@Controller('workouts')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post('start')
  startWorkout(@Request() req, @Body() dto: StartWorkoutDto) {
    return this.workoutsService.startWorkout(req.user.id, dto);
  }

  @Get('active')
  getActiveWorkout(@Request() req) {
    return this.workoutsService.getActiveWorkout(req.user.id);
  }

  @Post('finish')
  finishActiveWorkout(@Request() req) {
    return this.workoutsService.finishActiveWorkout(req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.workoutsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.workoutsService.findOne(req.user.id, id);
  }

  @Patch('sets/:setId')
  updateSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: UpdateWorkoutSetDto,
  ) {
    return this.workoutsService.updateSet(req.user.id, setId, dto);
  }

  @Patch('sets/:setId/confirm')
  confirmSet(
    @Request() req,
    @Param('setId', ParseIntPipe) setId: number,
    @Body() dto: ConfirmWorkoutSetDto,
  ) {
    return this.workoutsService.confirmSet(req.user.id, setId, dto);
  }

  @Post('exercises/:workoutExerciseId/add-set')
  addSet(
    @Request() req,
    @Param('workoutExerciseId', ParseIntPipe) workoutExerciseId: number,
  ) {
    return this.workoutsService.addSet(req.user.id, workoutExerciseId);
  }

  @Delete('sets/:setId')
  removeSet(@Request() req, @Param('setId', ParseIntPipe) setId: number) {
    return this.workoutsService.removeSet(req.user.id, setId);
  }
}
