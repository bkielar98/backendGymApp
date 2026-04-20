import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutsService } from './workouts.service';

@ApiTags('workout-history')
@ApiBearerAuth()
@Controller('workout-history')
@UseGuards(JwtAuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

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

  @Get(':id/summary')
  async findSummary(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.workoutsService.findSummary(req.user.id, id);
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
}
